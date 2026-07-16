# Async/Await Deep Dive — Internal Mechanics & Advanced Patterns

> **Prerequisite**: You already know that `async` makes a function return a Promise, and `await` pauses until a Promise resolves. These notes go under the hood.

---

## 1. What `async/await` Actually Is

`async/await` is **not a new concurrency primitive**. It is syntactic sugar over **Promises + Generators**.

When you write:
```js
async function fetchUser(id) {
  const res = await fetch(`/api/user/${id}`);
  const data = await res.json();
  return data;
}
```

The JavaScript engine (V8, SpiderMonkey, JSC) **transforms** this at compile time into a state machine that uses Promises under the hood. There is no "pausing" in the traditional thread-blocking sense. The function **yields control back to the event loop** at every `await`.

**Key insight**: `await x` is roughly equivalent to `Promise.resolve(x).then(...)`.

---

## 2. The Event Loop Interaction (Microtasks vs Macrotasks)

When an `await` expression resolves, the continuation (the code after the `await`) is scheduled as a **microtask**, not a macrotask.

### The Queue Hierarchy
```
Call Stack (executes synchronously)
    ↓ (empty)
Microtask Queue (Promise.then, await, queueMicrotask, MutationObserver)
    ↓ (empty)
Macrotask Queue (setTimeout, setInterval, I/O, UI events)
    ↓ (empty)
Render / Paint
```

**Rule**: The event loop will drain the **entire** microtask queue before picking up the next macrotask or rendering.

### Deep Example — Starvation
```js
async function loop() {
  while (true) {
    await Promise.resolve();  // yields to microtask queue, then immediately resumes
  }
}
loop();
setTimeout(() => console.log("timeout"), 0);
// "timeout" NEVER prints. The microtask queue never empties.
```

**Why?** `await Promise.resolve()` schedules the rest of the function to the microtask queue. The loop immediately enqueues another microtask. The event loop never reaches the macrotask queue where `setTimeout` lives.

---

## 3. How V8 Implements `async/await` Internally

V8 (Chrome/Node.js engine) compiles `async` functions into a **state machine** using a bytecode called `AsyncFunctionResolve` and `AsyncFunctionReject`.

### The Transformation (Conceptual)
```js
// Your code:
async function foo() {
  const a = await 1;
  const b = await 2;
  return a + b;
}

// Conceptually compiled to:
function foo() {
  return new Promise((resolve, reject) => {
    const generator = function* () {
      try {
        const a = yield Promise.resolve(1);
        const b = yield Promise.resolve(2);
        resolve(a + b);
      } catch (e) {
        reject(e);
      }
    }();

    function step(result) {
      if (result.done) return resolve(result.value);
      Promise.resolve(result.value).then(
        value => step(generator.next(value)),
        err => step(generator.throw(err))
      );
    }
    step(generator.next());
  });
}
```

This is exactly how `async/await` was polyfilled before native support (using `co` or Babel's `regenerator-runtime`).

### Key Takeaways
- The `async` function body is sliced into chunks at every `await`.
- Each chunk becomes a `.then()` callback.
- Local variables are preserved via closure (the generator's internal state).
- The function's execution context is **popped off the call stack** at every `await`, then **recreated** when the microtask runs.

---

## 4. The Call Stack Behavior

### Synchronous Start
```js
async function a() {
  console.log("a start");     // 1. On call stack
  await b();                   // 2. b() runs synchronously first
  console.log("a end");        // 5. Microtask — NEW stack frame
}

async function b() {
  console.log("b start");     // 2. On call stack
  await Promise.resolve();     // 3. Yields, b's frame popped
  console.log("b end");       // 4. Microtask — NEW stack frame
}

a();
console.log("sync end");      // 3. Main thread continues

// Output:
// a start
// b start
// sync end
// b end
// a end
```

**Critical**: After `await`, the function resumes in a **new microtask** with a **fresh call stack**. This is why stack traces after `await` can look disconnected.

---

## 5. Error Handling — The Deep Mechanics

### Throwing in Async Functions
```js
async function bad() {
  throw new Error("boom");  // Equivalent to: return Promise.reject(new Error("boom"))
}
```

An unhandled rejection in an `async` function does **not** crash the process immediately (in Node.js). It becomes an `unhandledRejection` event. In browsers, it logs to the console.

### Try/Catch with Await
```js
async function safe() {
  try {
    await Promise.reject("fail");
  } catch (e) {
    console.log(e);  // "fail" — the rejection is caught
  }
}
```

**How it works**: `await` attaches an implicit `.catch()` to the Promise. If the Promise rejects, the error is thrown into your synchronous `try` block via the microtask mechanism.

### The Danger: Fire-and-Forget
```js
async function dangerous() {
  try {
    asyncOp();  // Forgot await! Returns a Promise, not an error
  } catch (e) {
    // This never catches asyncOp's rejection
  }
}
```

**Rule**: If you call an `async` function without `await` (or `.catch()`), its rejection becomes an **unhandled rejection**.

### Top-Level Await Error Handling
In ES modules with top-level `await`:
```js
// module.mjs
const data = await fetchData();  // If this rejects, the MODULE fails to load
```

The entire module graph waits. If it rejects, the importing module's `await import()` will reject.

---

## 6. Awaiting Non-Promises

```js
const x = await 42;  // 42
const y = await { then: (resolve) => resolve(100) };  // 100 — "thenable"!
```

`await` calls `Promise.resolve(value)` on whatever you give it. If the value has a `.then()` method (a "thenable"), it treats it as a Promise. This is how `await` works with non-native Promise libraries (Bluebird, Q, etc.).

**Gotcha**: Objects with a `then` method that isn't a Promise constructor will still be awaited:
```js
const obj = { then: () => console.log("surprise") };
await obj;  // Logs "surprise" — obj is treated as a thenable
```

---

## 7. Sequential vs Parallel — The Classic Trap

### Sequential (Slow)
```js
async function sequential() {
  const a = await fetch('/a');  // 1s
  const b = await fetch('/b');  // 1s
  const c = await fetch('/c');  // 1s
  // Total: ~3s
}
```

### Parallel (Fast)
```js
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetch('/a'),
    fetch('/b'),
    fetch('/c')
  ]);
  // Total: ~1s
}
```

**Why sequential is the default mental model**: `await` reads like synchronous code. Your brain wants to read top-to-bottom. But each `await` is a yield point. If the operations are independent, **start them before awaiting**.

### The Hybrid Pattern
```js
async function smart() {
  const promiseA = fetch('/a');  // Fire immediately
  const promiseB = fetch('/b');  // Fire immediately

  const a = await promiseA;      // Wait for a
  doSomethingWithA(a);

  const b = await promiseB;      // b was already running, might already be done
  return b;
}
```

---

## 8. Loops & Async/Await

### `for...of` — Sequential
```js
for (const url of urls) {
  await fetch(url);  // One at a time. Guaranteed order.
}
```

### `forEach` — Fire-and-Forget Disaster
```js
urls.forEach(async (url) => {
  await fetch(url);  // forEach doesn't await. All iterations run concurrently.
});
console.log("done");  // "done" prints before any fetch completes!
```

### `Promise.all` — Parallel
```js
await Promise.all(urls.map(url => fetch(url)));
// All run at once. Order of resolution not guaranteed.
```

### `Promise.allSettled` — Parallel with Error Resilience
```js
const results = await Promise.allSettled(urls.map(url => fetch(url)));
// results = [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]
```

---

## 9. Advanced Patterns

### 9.1 Async Iterators & `for await...of`
```js
async function* generator() {
  yield await fetch('/page/1');
  yield await fetch('/page/2');
}

for await (const page of generator()) {
  console.log(page);  // Sequential, but memory-efficient (lazy)
}
```

### 9.2 Awaiting the First to Finish (`Promise.race`)
```js
const fastest = await Promise.race([
  fetch('/api/fast'),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
]);
```

### 9.3 Awaiting with a Timeout Wrapper
```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

const data = await withTimeout(fetchData(), 5000);
```

### 9.4 Async IIFE (Immediately Invoked)
```js
(async () => {
  const data = await fetchData();
  console.log(data);
})();
```

Before top-level `await`, this was the only way to use `await` outside an `async` function.

### 9.5 Sequential with Concurrency Limits
```js
async function batch(urls, limit = 3) {
  const results = [];
  const executing = [];

  for (const url of urls) {
    const p = fetch(url).then(r => { executing.splice(executing.indexOf(p), 1); return r; });
    results.push(p);
    executing.push(p);
    if (executing.length >= limit) await Promise.race(executing);
  }
  return Promise.all(results);
}
```

---

## 10. Performance & Memory Considerations

### The Cost of Microtasks
Every `await` creates at least one microtask. In a hot loop:
```js
async function slow() {
  for (let i = 0; i < 1e6; i++) {
    await Promise.resolve(i);  // 1 million microtasks! Event loop blocked.
  }
}
```

**Fix**: Batch or use synchronous logic where possible.

### Memory Leaks in Async Functions
```js
async function leak() {
  const hugeArray = new Array(1e7).fill('x');
  await fetch('/api');
  // hugeArray is still in closure scope until the async function completes!
  await fetch('/api2');
  // hugeArray stays in memory across both awaits.
}
```

**Fix**: Null out large variables before long awaits:
```js
async function fixed() {
  let hugeArray = new Array(1e7).fill('x');
  // ... use hugeArray ...
  hugeArray = null;  // Allow GC before next await
  await fetch('/api');
}
```

---

## 11. Build It From Scratch: Naive Async/Await Polyfill

```js
function naiveAsync(generatorFn) {
  return function(...args) {
    const gen = generatorFn.apply(this, args);

    return new Promise((resolve, reject) => {
      function step(nextFn) {
        let next;
        try {
          next = nextFn();
        } catch (e) {
          return reject(e);
        }

        if (next.done) return resolve(next.value);

        Promise.resolve(next.value).then(
          v => step(() => gen.next(v)),
          e => step(() => gen.throw(e))
        );
      }

      step(() => gen.next());
    });
  };
}

// Usage:
const myAsync = naiveAsync(function* () {
  const a = yield Promise.resolve(1);
  const b = yield Promise.resolve(2);
  return a + b;
});

myAsync().then(console.log);  // 3
```

This is essentially what Babel's `regenerator-runtime` does. Native `async/await` is optimized C++, but the semantics are identical.

---

## 12. Mental Model Summary

| Concept | Mental Model |
|---------|-------------|
| `async function` | A function that **always** returns a Promise |
| `await x` | `Promise.resolve(x).then(continuation)` scheduled as microtask |
| After `await` | Function resumes with **fresh call stack** via microtask queue |
| Error in `await` | Rejection becomes `throw` in your synchronous `try` block |
| Multiple `await`s | Sequential by default. Use `Promise.all` for parallel |
| `forEach + async` | **Never** use. Use `for...of` or `Promise.all` |
| Top-level `await` | Blocks module loading. Rejection = module load failure |

---

## 13. Checklist for Mastery

- [ ] Can explain why `await` inside a `while(true)` loop can starve `setTimeout`
- [ ] Can describe the microtask vs macrotask queue behavior
- [ ] Can write a generator-based polyfill for `async/await`
- [ ] Knows why `forEach(async ...)` is dangerous
- [ ] Can implement a concurrency-limited batch fetch
- [ ] Understands why `await` stack traces look disconnected
- [ ] Can write `withTimeout` using `Promise.race`
- [ ] Knows the difference between `Promise.all` and `Promise.allSettled`
- [ ] Understands top-level `await` module loading semantics

---

*Study these notes, then build: a Promise pool, a retry wrapper with exponential backoff, and a cancellable fetch using AbortController + async/await.*
