# JavaScript Architecture — Deep Notes

## 1. Big Picture

JavaScript runtime = **JS Engine** + **Web APIs / Host APIs** + **Event Loop system** (Call Stack, Heap, Callback Queues, Microtask Queue).

```
┌─────────────────────────── JS Runtime (e.g. Browser / Node) ───────────────────────────┐
│                                                                                          │
│   ┌──────────────── JS Engine (V8 / SpiderMonkey / JSC) ────────────────┐               │
│   │                                                                     │               │
│   │   Call Stack          Memory Heap                                  │               │
│   │   ┌─────────┐         ┌──────────────┐                             │               │
│   │   │ frame 3 │         │ Objects      │                             │               │
│   │   │ frame 2 │         │ Closures     │                             │               │
│   │   │ frame 1 │         │ Functions    │                             │               │
│   │   └─────────┘         └──────────────┘                             │               │
│   └─────────────────────────────────────────────────────────────────────┘               │
│                                                                                          │
│   Web/Host APIs: DOM, fetch, setTimeout, FS (Node), HTTP (Node)                         │
│   Callback Queue (macrotasks) | Microtask Queue (Promises) | Event Loop                 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

The engine itself only knows how to run JS. Timers, DOM, networking are **provided by the host** (browser or Node), not by JS itself.

---

## 2. The JS Engine internals

### 2.1 Pipeline
1. **Parsing** — source → tokens → AST (Abstract Syntax Tree).
2. **Compilation** — JS is JIT (Just-In-Time) compiled, not purely interpreted.
   - **Ignition** (V8's interpreter) turns AST → bytecode quickly (fast startup).
   - **TurboFan** (V8's optimizing compiler) profiles hot code and recompiles it to optimized machine code.
   - If assumptions break (e.g. a variable's shape changes), V8 **deoptimizes** back to bytecode.
3. **Execution** — bytecode/machine code runs on the **Call Stack**.

### 2.2 Call Stack
- LIFO structure tracking execution contexts.
- Each function call pushes a **stack frame** (local vars, arguments, return address).
- Deep recursion → **stack overflow**.
- JS is **single-threaded**: one call stack, one thing executing at a time.

### 2.3 Memory Heap
- Unstructured region for objects, arrays, closures, functions.
- **Garbage Collection (GC)**: V8 mainly uses a **generational, tracing GC**:
  - **Young generation (Scavenger)** — small, frequent, fast GC for short-lived objects.
  - **Old generation (Mark-Compact / Mark-Sweep)** — for long-lived objects, runs less often, more thorough.
  - Core algorithm: **Mark-and-Sweep** — mark all reachable objects from roots (global object, call stack), sweep away unreachable ones.
  - **Memory leaks** in JS usually come from: stray global variables, forgotten timers/listeners, closures holding references, detached DOM nodes.

### 2.4 Execution Context & Scope
- **Global Execution Context** created first, then a new context per function call.
- Each context has:
  - **Variable Environment** (var, function declarations — hoisted)
  - **Lexical Environment** (let/const, block scope)
  - **`this` binding**
  - Reference to **outer (parent) environment** → forms the **scope chain**.
- **Hoisting**: declarations are registered in memory before execution; `var` is hoisted and initialized as `undefined`; `let`/`const` are hoisted but stay in the **Temporal Dead Zone (TDZ)** until their line executes.
- **Closures**: a function "remembers" its lexical scope even after the outer function returns — this is why closures are central to modules, memoization, currying.

### 2.5 `this` binding rules (in order of precedence)
1. `new` binding (constructor call) → `this` = new object.
2. Explicit binding (`call`, `apply`, `bind`).
3. Implicit binding (`obj.method()`) → `this` = obj.
4. Default binding → global object (or `undefined` in strict mode).
5. Arrow functions ignore all of the above — they capture `this` lexically from enclosing scope.

---

## 3. Concurrency Model: the Event Loop

JS is single-threaded but **non-blocking**, achieved via the event loop coordinating engine + host APIs.

### 3.1 Key pieces
- **Call Stack** — synchronous code runs here.
- **Web/Node APIs** — async work (timers, I/O, network) is delegated outside the engine, runs concurrently on browser/OS threads (or libuv's thread pool in Node).
- **Callback Queue (Macrotask Queue)** — holds callbacks ready to run: `setTimeout`, `setInterval`, I/O, UI events.
- **Microtask Queue** — holds `Promise` `.then/.catch/.finally`, `queueMicrotask`, `async/await` continuations. **Higher priority** than macrotasks.
- **Event Loop** — a loop that:
  1. Runs everything on the call stack until empty.
  2. Drains the **entire microtask queue**.
  3. Takes **one** macrotask off the queue, executes it, then re-drains microtasks.
  4. Repeats (render/paint happens between cycles in browsers).

### 3.2 Ordering example
```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```
Sync code (1, 4) → microtasks (3) → macrotasks (2).

### 3.3 Node.js specifics
Node's event loop (via **libuv**) has distinct phases each tick:
```
timers → pending callbacks → idle/prepare → poll (I/O) → check (setImmediate) → close callbacks
```
- `process.nextTick()` runs **before** microtasks/promises, after the current operation — highest priority.
- `setImmediate()` vs `setTimeout(fn, 0)` ordering depends on context (inside I/O callback, `setImmediate` usually wins).

---

## 4. Memory Model / Data Types

- **Primitives** (stored by value, immutable): `Number`, `String`, `Boolean`, `null`, `undefined`, `Symbol`, `BigInt`. Typically held on the **stack** (or inline) for fast access.
- **Reference types**: `Object`, `Array`, `Function`, etc. Stored in the **heap**; variables hold a reference/pointer.
- **Copying**: primitives copy by value; objects copy by reference (assigning `b = a` makes `b` point to the same heap object).

---

## 5. Module Systems (Architectural Layer)

- **CommonJS** (Node default historically): `require`/`module.exports`, synchronous, loaded at runtime.
- **ESM (ECMAScript Modules)**: `import`/`export`, statically analyzable, asynchronous loading, supports tree-shaking, **hoisted imports**, live bindings (imported values reflect updates in source module).
- Engines build a **module graph**, resolving and linking before evaluation (ESM does this in 3 phases: **Construction → Instantiation → Evaluation**).

---

## 6. Prototypes & Object Architecture

- JS objects use **prototypal inheritance**: each object has an internal `[[Prototype]]` link forming a **prototype chain**, terminating at `Object.prototype` → `null`.
- Property lookup walks up this chain if not found on the object itself.
- `class` syntax is sugar over prototype-based construction (constructor functions + `prototype` property).
- V8 optimizes object property access using **hidden classes (Maps/Shapes)** and **inline caches** — objects with the same "shape" (same properties added in the same order) share a hidden class, making property access near constant-time. Adding properties dynamically/inconsistently causes hidden-class churn → deoptimization.

---

## 7. Compilation Optimizations Summary (V8 example)

| Stage | Component | Purpose |
|---|---|---|
| Parse | Parser/Pre-parser | AST generation, lazy parsing for unused functions |
| Baseline | Ignition (interpreter) | Fast bytecode execution, collects type feedback |
| Optimize | TurboFan (JIT compiler) | Compiles "hot" functions to optimized machine code using feedback |
| Deoptimize | Deopt mechanism | Falls back to bytecode if assumptions (types/shapes) are violated |
| Memory | Orinoco (GC) | Concurrent/parallel/incremental garbage collection to reduce pause times |

---

## 8. Mental Model Cheat Sheet

- **Single thread, single call stack** → one task at a time.
- **Concurrency = illusion**, achieved by offloading to host APIs + event loop scheduling.
- **Microtasks always drain before the next macrotask.**
- **Closures + scope chain** are why JS variables behave the way they do across async boundaries.
- **Heap + GC** manage object lifetime; **stack** manages execution flow.
- **Hidden classes & inline caches** are why writing consistent object shapes is a real performance practice, not superstition.