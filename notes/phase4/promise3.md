# JavaScript Promise Mastery Guide

> A complete, no-fluff guide to mastering JavaScript Promises — from core concepts to real-world patterns, interview questions, and LeetCode problems.

---

## Table of Contents
1. [The One Feynman Explanation](#1-the-one-feynman-explanation)
2. [The Promise State Machine](#2-the-promise-state-machine)
3. [The 3 Rules of .then()](#3-the-3-rules-of-then)
4. [Creating Promises](#4-creating-promises)
5. [Promise Methods Deep Dive](#5-promise-methods-deep-dive)
6. [async/await: Syntactic Sugar](#6-asyncawait-syntactic-sugar)
7. [The 5 Must-Know Patterns](#7-the-5-must-know-patterns)
8. [Common Traps & Gotchas](#8-common-traps--gotchas)
9. [The Event Loop & Microtasks (Layer 3)](#9-the-event-loop--microtasks-layer-3)
10. [LeetCode Problems](#10-leetcode-problems)
11. [Interview Questions](#11-interview-questions)
12. [Mastery Checklist](#12-mastery-checklist)
13. [Weekly Study Plan](#13-weekly-study-plan)

---

## 1. The One Feynman Explanation

> **A Promise is a receipt for work that hasn't finished yet.**

You order coffee. They give you a receipt. The receipt has 3 states:
- **Pending** → They're making it
- **Fulfilled** → Here's your coffee (value)
- **Rejected** → Machine broke (error)

`.then()` = "When my coffee is ready, do this with it."
`.catch()` = "If the machine broke, do this instead."

That's it. Everything else is just details around this core idea.

---

## 2. The Promise State Machine

```
        new Promise()
             │
             ▼
         ┌───────┐
         │PENDING│
         └───┬───┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐     ┌───────────┐
│FULFILLED│     │ REJECTED  │
│ resolve │     │  reject   │
│ (value) │     │  (reason) │
└────┬────┘     └─────┬─────┘
     │                │
     ▼                ▼
  .then()          .catch()
```

### Key Facts
- A Promise can only settle **once**. Once fulfilled or rejected, it's locked forever.
- `.then()` and `.catch()` handlers run **asynchronously**, even if the Promise is already settled.
- Handlers are pushed to the **microtask queue**, not executed immediately.

---

## 3. The 3 Rules of .then()

| Rule | What It Means |
|------|---------------|
| **Rule 1** | `.then()` always returns a **new Promise** |
| **Rule 2** | If handler returns a value → new Promise resolves with it |
| **Rule 3** | If handler throws or returns rejected Promise → new Promise rejects |

```javascript
Promise.resolve(1)
  .then(x => x + 1)           // Rule 2: returns 2
  .then(x => { throw 'err' }) // Rule 3: rejects
  .catch(() => 10)            // catches, returns 10
  .then(x => console.log(x)); // 10
```

---

## 4. Creating Promises

### The Constructor
```javascript
const p = new Promise((resolve, reject) => {
  // This executor runs IMMEDIATELY (synchronously)

  if (success) resolve(value);
  else reject(error);
});
```

### Promise.resolve() / Promise.reject()
```javascript
Promise.resolve(42);        // fulfilled with 42
Promise.reject(new Error()); // rejected
```

### Converting Callbacks
```javascript
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

// Or manually:
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

---

## 5. Promise Methods Deep Dive

### Promise.all(iterable)
- **Resolves** when ALL promises resolve → array of results
- **Rejects** immediately when ANY promise rejects (first rejection wins)
- **Empty array** → resolves to empty array

```javascript
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
```

### Promise.race(iterable)
- **Settles** as soon as the FIRST promise settles (fulfilled OR rejected)
- Classic use: **timeout pattern**

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}
```

### Promise.allSettled(iterable)
- **Always resolves** → array of `{status, value|reason}` objects
- Never rejects. Use when you need ALL results, success or failure.

```javascript
const results = await Promise.allSettled([p1, p2, p3]);
// [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]
```

### Promise.any(iterable)
- **Resolves** with the FIRST fulfilled promise
- **Rejects** only if ALL reject → `AggregateError`

### Quick Comparison

| Method | Resolves When | Rejects When | Use Case |
|--------|-------------|--------------|----------|
| `all` | All fulfilled | First rejection | Parallel independent tasks |
| `race` | First settles | First settles | Timeout, first response wins |
| `allSettled` | Always | Never | Need all results regardless |
| `any` | First fulfilled | All rejected | Redundant requests (fastest wins) |

---

## 6. async/await: Syntactic Sugar

### The Translation
```javascript
// Promise chain
function getUser(id) {
  return fetch(`/api/user/${id}`)
    .then(res => res.json())
    .then(data => data.name);
}

// async/await — IDENTICAL under the hood
async function getUser(id) {
  const res = await fetch(`/api/user/${id}`);
  const data = await res.json();
  return data.name; // wrapped in Promise.resolve()
}
```

### Critical Rules
1. `async function` **always** returns a Promise
2. `await` pauses execution of the **current async function**, NOT the main thread
3. `await` on a non-Promise wraps it in `Promise.resolve()`
4. Errors in async functions reject the returned Promise

### Error Handling
```javascript
// Option 1: try/catch
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    return null; // or re-throw
  }
}

// Option 2: .catch() on the call
safeFetch('/api').catch(err => /* handle */);

// ⚠️ TRAP: try/catch doesn't catch if you RETURN a rejected Promise
async function bad() {
  try {
    return Promise.reject('error'); // ❌ NOT caught
  } catch (e) {
    return 'caught';
  }
}
// Fix: await the rejection
async function good() {
  try {
    return await Promise.reject('error'); // ✅ Caught
  } catch (e) {
    return 'caught';
  }
}
```

---

## 7. The 5 Must-Know Patterns

### Pattern 1: Sequential Execution
```javascript
async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task()); // one at a time
  }
  return results;
}
```

### Pattern 2: Parallel Execution
```javascript
async function runInParallel(tasks) {
  return Promise.all(tasks.map(t => t()));
}
```

### Pattern 3: Parallel with Concurrency Limit
```javascript
async function parallelLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let i = 0;

  const runners = Array(limit).fill(null).map(async () => {
    while (i < tasks.length) {
      const currentIndex = i++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  });

  await Promise.all(runners);
  return results;
}
```

### Pattern 4: Retry with Exponential Backoff
```javascript
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

### Pattern 5: Debounced Async Function
```javascript
function debounceAsync(fn, delay) {
  let timeoutId;
  let abortController;

  return async (...args) => {
    clearTimeout(timeoutId);
    abortController?.abort();
    abortController = new AbortController();

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args, { signal: abortController.signal });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };
}
```

---

## 8. Common Traps & Gotchas

### Trap 1: Forgetting that async returns a Promise
```javascript
async function getData() {
  return { name: 'John' }; // Returns Promise<{name}>, not {name}
}
const data = getData(); // ❌ This is a Promise, not the object
const data = await getData(); // ✅
```

### Trap 2: Unhandled Promise Rejections
```javascript
// BAD: fire and forget, no catch
fetch('/api'); // Unhandled rejection if it fails

// GOOD: always attach catch or use try/catch
fetch('/api').catch(console.error);
```

### Trap 3: Looping with .forEach() instead of for...of
```javascript
// ❌ BAD: forEach doesn't wait
urls.forEach(async url => {
  const data = await fetch(url); // These all fire simultaneously
});

// ✅ GOOD: sequential
for (const url of urls) {
  const data = await fetch(url);
}

// ✅ GOOD: parallel with control
await Promise.all(urls.map(url => fetch(url)));
```

### Trap 4: Race conditions in closures
```javascript
// ❌ BAD: i is shared
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}

// ✅ GOOD: let creates block scope
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}
```

### Trap 5: Not awaiting in try/catch
```javascript
// ❌ BAD: catch won't fire
async function bad() {
  try {
    return someAsyncOp(); // returns Promise, doesn't await
  } catch (e) {
    // Never reached
  }
}

// ✅ GOOD
async function good() {
  try {
    return await someAsyncOp();
  } catch (e) {
    // Catches rejection
  }
}
```

---

## 9. The Event Loop & Microtasks (Layer 3)

> **Only study this if you keep hitting weird timing bugs.**

### Execution Order
```
1. Run all synchronous code (call stack)
2. Run ALL microtasks (Promise callbacks, queueMicrotask)
3. Run ONE macrotask (setTimeout, setInterval, I/O)
4. Repeat from step 2
```

### The Classic Question
```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Output: 1, 4, 3, 2
// Why? 1,4 are sync. 3 is microtask (runs before macrotask 2).
```

### Why This Matters
- Promise callbacks are **microtasks** → run before setTimeout
- This means Promise chains can starve the event loop if they're recursive
- `queueMicrotask()` lets you push to the microtask queue manually

---

## 10. LeetCode Problems

### Easy

#### [2621. Sleep](https://leetcode.com/problems/sleep/)
```javascript
/**
 * @param {number} millis
 * @return {Promise}
 */
async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
```

#### [2637. Promise Time Limit](https://leetcode.com/problems/promise-time-limit/)
```javascript
/**
 * @param {Function} fn
 * @param {number} t
 * @return {Function}
 */
var timeLimit = function(fn, t) {
  return async function(...args) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("Time Limit Exceeded");
      }, t);

      fn(...args)
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  };
};
```

#### [2623. Memoize](https://leetcode.com/problems/memoize/) *(async version)*
Implement memoization for async functions with TTL.

### Medium

#### [2715. Timeout Cancellation](https://leetcode.com/problems/timeout-cancellation/)
```javascript
/**
 * @param {Function} fn
 * @param {Array} args
 * @param {number} t
 * @return {Function}
 */
var cancellable = function(fn, args, t) {
  const timeoutId = setTimeout(() => fn(...args), t);
  return () => clearTimeout(timeoutId);
};
```

#### [2721. Execute Asynchronous Functions in Parallel](https://leetcode.com/problems/execute-asynchronous-functions-in-parallel/)
```javascript
/**
 * @param {Array<Function>} functions
 * @return {Promise<any>}
 */
var promiseAll = function(functions) {
  return new Promise((resolve, reject) => {
    const results = new Array(functions.length);
    let completed = 0;

    functions.forEach((fn, i) => {
      fn()
        .then(val => {
          results[i] = val;
          completed++;
          if (completed === functions.length) resolve(results);
        })
        .catch(reject);
    });
  });
};
```

#### [2626. Array Reduce Transformation](https://leetcode.com/problems/array-reduce-transformation/)
*(Async reduce pattern)*

#### [2636. Promise Pool](https://leetcode.com/problems/promise-pool/)
```javascript
/**
 * @param {Function[]} functions
 * @param {number} n
 * @return {Promise<any>}
 */
var promisePool = async function(functions, n) {
  const results = [];
  let i = 0;

  const executeNext = async () => {
    if (i >= functions.length) return;
    const currentIndex = i++;
    results[currentIndex] = await functions[currentIndex]();
    await executeNext();
  };

  await Promise.all(Array(n).fill(null).map(executeNext));
  return results;
};
```

### Hard

#### [2627. Debounce](https://leetcode.com/problems/debounce/)
```javascript
/**
 * @param {Function} fn
 * @param {number} t
 * @return {Function}
 */
var debounce = function(fn, t) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), t);
  };
};
```

#### [2628. JSON Deep Equal](https://leetcode.com/problems/json-deep-equal/)
*(Async deep comparison with Promises)*

#### [2796. Repeat String](https://leetcode.com/problems/repeat-string/)
*(Async string builder)*

### Bonus: Real-World Style Problems

These aren't on LeetCode but are common in interviews:

1. **Implement Promise.all from scratch**
2. **Implement Promise.race from scratch**
3. **Implement a Promise-based semaphore**
4. **Implement retry with exponential backoff**
5. **Implement a circuit breaker**

---

## 11. Interview Questions

### Q1: What is the output?
```javascript
console.log('A');
Promise.resolve().then(() => console.log('B'));
console.log('C');
```
**Answer:** A, C, B. Synchronous code runs first. Promise.then() is a microtask, runs after sync code.

### Q2: What's wrong with this code?
```javascript
async function fetchUsers() {
  const ids = [1, 2, 3];
  ids.forEach(async id => {
    const user = await fetchUser(id);
    console.log(user);
  });
  console.log('Done');
}
```
**Answer:** `forEach` doesn't wait for async callbacks. 'Done' logs immediately, users log later in unpredictable order. Use `for...of` for sequential or `Promise.all` for parallel.

### Q3: How do you handle errors in Promise chains?
**Answer:**
- `.catch()` at the end of the chain
- `try/catch` with async/await
- `.catch()` after each `.then()` for granular error handling
- Always handle rejections to prevent unhandled rejection warnings

### Q4: What's the difference between Promise.all and Promise.allSettled?
**Answer:**
- `all`: Rejects immediately on first rejection. You lose all other results.
- `allSettled`: Always resolves with status of each Promise. Never loses data.

### Q5: Implement Promise.all
```javascript
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = new Array(promises.length);
    let completed = 0;

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(val => {
          results[i] = val;
          completed++;
          if (completed === promises.length) resolve(results);
        })
        .catch(reject);
    });

    if (promises.length === 0) resolve([]);
  });
}
```

### Q6: What happens if you return a rejected Promise in a try/catch?
```javascript
async function test() {
  try {
    return Promise.reject('error');
  } catch (e) {
    return 'caught';
  }
}
```
**Answer:** The catch block is NOT triggered. Returning a rejected Promise doesn't throw — it just passes the rejection through. Use `await` to trigger the catch.

### Q7: How would you implement a request queue with max concurrency?
**Answer:** See Pattern 3 in Section 7 (parallelLimit).

---

## 12. Mastery Checklist

- [ ] I can explain Promise as a state machine in one sentence
- [ ] I know .then() always returns a new Promise
- [ ] I can translate between Promise chains and async/await
- [ ] I understand why A, C, B is the output order (microtasks)
- [ ] I can write sequential execution with for...of
- [ ] I can write parallel execution with Promise.all
- [ ] I know the difference between all, race, allSettled, any
- [ ] I can implement a timeout with Promise.race
- [ ] I know returning a rejected Promise in async doesn't trigger try/catch
- [ ] I can write a retry function with exponential backoff
- [ ] I can explain when to use sequential vs parallel
- [ ] I've solved at least 5 LeetCode Promise problems
- [ ] I can implement Promise.all from scratch
- [ ] I understand the event loop and microtask queue

---

## 13. Weekly Study Plan

### Day 1 (1 hour)
- Read Sections 1-3 (The Feynman explanation, State Machine, 3 Rules)
- Write the one-sentence explanation from memory
- Do Quiz Q1

### Day 2 (1.5 hours)
- Read Sections 4-5 (Creating Promises, Methods)
- Build Pattern 1 & 2 (Sequential + Parallel)
- Solve LeetCode 2621 (Sleep)

### Day 3 (1.5 hours)
- Read Section 6 (async/await)
- Practice translating Promise chains ↔ async/await
- Solve LeetCode 2637 (Promise Time Limit)

### Day 4 (2 hours)
- Read Section 7 (5 Patterns)
- Build Pattern 3 & 4 (Limit + Retry)
- Solve LeetCode 2721 (Execute Async in Parallel)

### Day 5 (2 hours)
- Read Sections 8-9 (Traps + Event Loop)
- Solve LeetCode 2636 (Promise Pool)
- Solve LeetCode 2715 (Timeout Cancellation)

### Day 6 (1.5 hours)
- Review all patterns from memory (no notes)
- Solve LeetCode 2627 (Debounce)
- Implement Promise.all from scratch

### Day 7 (1 hour)
- Mixed practice: Interleave old + new problems
- Mock interview: Explain Promises to an imaginary junior dev
- Check off mastery checklist

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  PROMISE QUICK REFERENCE                                │
├─────────────────────────────────────────────────────────┤
│  new Promise((resolve, reject) => { ... })               │
│  Promise.resolve(val)  →  fulfilled                       │
│  Promise.reject(err)   →  rejected                        │
├─────────────────────────────────────────────────────────┤
│  .then(onFulfilled, onRejected)                         │
│  .catch(onRejected)      ←  .then(null, onRejected)      │
│  .finally(onFinally)     ←  runs regardless              │
├─────────────────────────────────────────────────────────┤
│  Promise.all([p1, p2])      →  [v1, v2]  or first error │
│  Promise.race([p1, p2])     →  first to settle           │
│  Promise.allSettled([...])  →  [{status, value}, ...]   │
│  Promise.any([p1, p2])      →  first fulfilled          │
├─────────────────────────────────────────────────────────┤
│  async function → always returns Promise                  │
│  await → pauses async function, NOT main thread           │
│  try/catch + await → catches rejections                  │
│  return Promise.reject() in try → NOT caught             │
└─────────────────────────────────────────────────────────┘
```

---

> **Remember:** Don't Feynman-ize everything. Layer 1 = know it exists. Layer 2 = understand the mechanism. Layer 3 = deep internals. Most of your time should be in Layer 2 + building things.
