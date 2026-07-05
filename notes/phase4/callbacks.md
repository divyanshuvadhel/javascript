# JavaScript Callbacks — Deep Learning Notes

> **Topic:** Callbacks in JavaScript  
> **Level:** Beginner → Advanced

---

## Table of Contents

1. [What is a Callback?](#1-what-is-a-callback)
2. [Synchronous Callbacks](#2-synchronous-callbacks)
3. [Asynchronous Callbacks](#3-asynchronous-callbacks)
4. [Higher-Order Functions (HOFs)](#4-higher-order-functions-hofs)
5. [The Event Loop & Callbacks](#5-the-event-loop--callbacks)
6. [Callback Hell (Pyramid of Doom)](#6-callback-hell-pyramid-of-doom)
7. [Error Handling in Callbacks](#7-error-handling-in-callbacks)
8. [The Error-First Callback Convention (Node.js style)](#8-the-error-first-callback-convention-nodejs-style)
9. [Callback Abstraction Patterns](#9-callback-abstraction-patterns)
10. [Writing Your Own Callback-Based APIs](#10-writing-your-own-callback-based-apis)
11. [Callback Polyfills (map, filter, reduce, forEach)](#11-callback-polyfills-map-filter-reduce-foreach)
12. [Callback vs Promises vs Async/Await](#12-callback-vs-promises-vs-asyncawait)
13. [Common Pitfalls & Gotchas](#13-common-pitfalls--gotchas)
14. [Exercises](#14-exercises)
15. [Quick Reference Cheat Sheet](#15-quick-reference-cheat-sheet)

---

## 1. What is a Callback?

### What
A **callback** is a function passed as an argument into another function, which is then invoked inside the outer function to complete some kind of action.

### How
```javascript
// Basic callback pattern
function greet(name, callback) {
    console.log('Hello, ' + name);
    callback();
}

function sayGoodbye() {
    console.log('Goodbye!');
}

greet('Alice', sayGoodbye);
// Hello, Alice
// Goodbye!
```

### Why
Callbacks enable **asynchronous programming** and **code reuse**. They let you define behavior that should run after some operation completes, without blocking the main thread.

### How It Works Internally
In JavaScript, functions are **first-class citizens** — they can be stored in variables, passed as arguments, and returned from other functions. When you pass a function as an argument, you're passing a **reference** to that function object in memory. The outer function stores this reference and invokes it later using `()`.

> 💡 **Key Insight:** You are NOT calling the callback when passing it. `greet('Alice', sayGoodbye)` passes the function reference. `greet('Alice', sayGoodbye())` would call it immediately and pass the return value (likely `undefined`).

---

## 2. Synchronous Callbacks

### What
A callback executed immediately, in the same tick of the event loop, before the outer function returns.

### How
```javascript
// Array methods (synchronous)
const nums = [1, 2, 3];

nums.forEach(function(num) {
    console.log(num * 2);  // Runs immediately, one by one
});

const doubled = nums.map(num => num * 2);  // [2, 4, 6]

const evens = nums.filter(num => num % 2 === 0);  // [2]

const sum = nums.reduce((acc, num) => acc + num, 0);  // 6

// Custom synchronous callback
function processData(data, transform) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        result.push(transform(data[i]));
    }
    return result;
}

const squared = processData([1, 2, 3], x => x * x);  // [1, 4, 9]
```

### Why
Synchronous callbacks are the foundation of functional programming in JS. They let you inject custom logic into reusable algorithms (sorting, filtering, transforming).

### How It Works Internally
The JavaScript engine executes synchronous code on the **call stack**. When `map` iterates, it pushes the callback onto the stack for each element, executes it, pops it off, and continues. There is no delay — everything happens in a single run-to-completion block.

---

## 3. Asynchronous Callbacks

### What
A callback executed later, after some operation completes (timer, I/O, user event). It does NOT block the main thread.

### How
```javascript
// setTimeout
setTimeout(() => {
    console.log('Runs after 1 second');
}, 1000);
console.log('Runs immediately');

// setInterval
const intervalId = setInterval(() => {
    console.log('Runs every 2 seconds');
}, 2000);
// clearInterval(intervalId);  // stop it

// Event listeners (async)
document.getElementById('btn').addEventListener('click', () => {
    console.log('Button clicked!');
});

// XMLHttpRequest (legacy async callback)
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.example.com/data');
xhr.onload = function() {
    console.log(xhr.responseText);
};
xhr.send();

// FileReader
const reader = new FileReader();
reader.onload = (e) => {
    console.log(e.target.result);
};
reader.readAsText(file);
```

### Why
JavaScript is **single-threaded**. Without async callbacks, network requests and timers would freeze the UI. Async callbacks allow the engine to offload work and resume when the result is ready.

### How It Works Internally
When an async API like `setTimeout` is called, the browser's Web API (or Node.js C++ layer) takes over. It starts a timer in a separate thread. Meanwhile, JS continues executing. When the timer expires, the callback is placed in a **task queue** (macrotask queue). The **event loop** checks if the call stack is empty, then pushes the callback onto the stack for execution.

> 🔗 See Section 5 for a deep dive into the Event Loop.

---

## 4. Higher-Order Functions (HOFs)

### What
A function that either:
1. Takes a function as an argument, OR
2. Returns a function as its result.

### How
```javascript
// HOF that takes a callback
function withLogging(fn) {
    return function(...args) {
        console.log('Calling function with args:', args);
        const result = fn(...args);
        console.log('Result:', result);
        return result;
    };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3);
// Calling function with args: [2, 3]
// Result: 5

// HOF that returns a callback (function factory)
function multiplyBy(factor) {
    return function(number) {
        return number * factor;
    };
}

const triple = multiplyBy(3);
console.log(triple(5));  // 15

// Real-world: once() wrapper
function once(fn) {
    let called = false;
    let result;
    return function(...args) {
        if (!called) {
            called = true;
            result = fn.apply(this, args);
        }
        return result;
    };
}

const init = once(() => console.log('Initialized!'));
init();  // Initialized!
init();  // (nothing)
```

### Why
HOFs enable powerful abstractions: middleware, decorators, throttling, debouncing, memoization, and functional composition.

### How It Works Internally
When `withLogging(add)` is called, a new function is created in memory that **closes over** the `fn` variable. This is a **closure** — the returned function retains access to `fn` even after `withLogging` has finished executing. Every call to `loggedAdd` uses that same closed-over `fn` reference.

---

## 5. The Event Loop & Callbacks

### What
The mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded.

### How It Works Internally

```
┌─────────────────────────────────────────────┐
│                Call Stack                    │
│  (Where JS code actually runs)               │
│                                              │
│  push() -> execute -> pop()                  │
└─────────────────────────────────────────────┘
           ↑
           │ checks if stack is empty
┌─────────────────────────────────────────────┐
│              Event Loop                      │
│  (Constantly running loop)                   │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│           Callback Queue                     │
│  (Task Queue / Macrotask Queue)              │
│  setTimeout, setInterval, I/O callbacks      │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│         Microtask Queue                      │
│  Promises, queueMicrotask, MutationObserver  │
│  (Higher priority than macrotasks!)          │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│           Web APIs (Browser)                 │
│  setTimeout, DOM, AJAX, fetch               │
│  (Run outside the JS engine)                 │
└─────────────────────────────────────────────┘
```

### Execution Order Example
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
```

### Why This Order?
1. `console.log('1')` — synchronous, goes to stack, prints immediately.
2. `setTimeout(..., 0)` — Web API starts timer, callback goes to **macrotask queue**.
3. `Promise.resolve().then(...)` — callback goes to **microtask queue**.
4. `console.log('4')` — synchronous, prints immediately.
5. Stack is empty. Event loop checks **microtask queue** first → prints `3`.
6. Then checks **macrotask queue** → prints `2`.

> ⚠️ **Critical Rule:** Microtasks ALWAYS execute before the next macrotask, even if the macrotask timer is 0ms. This means promises resolve faster than `setTimeout(..., 0)`.

---

## 6. Callback Hell (Pyramid of Doom)

### What
Deeply nested callbacks that make code hard to read, debug, and maintain.

### How (The Problem)
```javascript
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) {
            getMoreData(c, function(d) {
                getMoreData(d, function(e) {
                    console.log(e);
                });
            });
        });
    });
});
```

### Why It's Bad
- **Horizontal scaling issues:** Each nested level pushes code further right.
- **Error handling nightmare:** Try-catch doesn't work well across async boundaries.
- **Tight coupling:** Each step depends on the previous indentation level.
- **Hard to refactor:** Extracting a function requires passing callbacks up the chain.

### Solutions

#### 1. Named Functions
```javascript
function handleA(a) {
    getMoreData(a, handleB);
}
function handleB(b) {
    getMoreData(b, handleC);
}
function handleC(c) {
    getMoreData(c, handleD);
}
function handleD(d) {
    getMoreData(d, e => console.log(e));
}

getData(handleA);
```

#### 2. Promises
```javascript
getData()
    .then(a => getMoreData(a))
    .then(b => getMoreData(b))
    .then(c => getMoreData(c))
    .then(d => getMoreData(d))
    .then(e => console.log(e))
    .catch(err => console.error(err));
```

#### 3. Async/Await
```javascript
async function fetchData() {
    try {
        const a = await getData();
        const b = await getMoreData(a);
        const c = await getMoreData(b);
        const d = await getMoreData(c);
        const e = await getMoreData(d);
        console.log(e);
    } catch (err) {
        console.error(err);
    }
}
```

---

## 7. Error Handling in Callbacks

### What
Handling errors when callbacks run asynchronously. Standard `try-catch` only catches synchronous errors.

### How
```javascript
// ❌ WRONG: try-catch won't catch async errors
function badFetch(url, callback) {
    try {
        setTimeout(() => {
            throw new Error('Network failed');  // This won't be caught!
        }, 1000);
    } catch (err) {
        console.log('Caught:', err);  // Never runs
    }
}

// ✅ CORRECT: Pass errors through the callback
function goodFetch(url, callback) {
    setTimeout(() => {
        const success = Math.random() > 0.5;
        if (success) {
            callback(null, 'Data loaded');
        } else {
            callback(new Error('Network failed'));
        }
    }, 1000);
}

goodFetch('https://api.example.com', (err, data) => {
    if (err) {
        console.error('Error:', err.message);
        return;
    }
    console.log('Success:', data);
});
```

### Why
In async code, the callback runs in a different call stack frame than where it was defined. `try-catch` only guards the current stack. Errors must be passed explicitly.

---

## 8. The Error-First Callback Convention (Node.js style)

### What
A standardized pattern where the **first argument** of a callback is reserved for an error object (or `null` if no error), and subsequent arguments are the result data.

### How
```javascript
function readFile(path, callback) {
    setTimeout(() => {
        if (!path) {
            callback(new Error('Path is required'));
            return;
        }
        callback(null, 'File contents here...');
    }, 100);
}

// Usage
readFile('/data.txt', (err, data) => {
    if (err) {
        console.error('Failed:', err.message);
        return;
    }
    console.log('Content:', data);
});
```

### Why
This convention (established by Node.js) creates consistency across libraries. You always check `err` first. It prevents silent failures and makes error paths explicit.

### How It Works Internally
The convention is purely social/contractual — the JS engine doesn't enforce it. But the ecosystem standardized on it so that tools like `util.promisify` can automatically convert callback-based functions to promises by assuming the first arg is the error.

---

## 9. Callback Abstraction Patterns

### What
Reusable patterns for managing complex callback flows.

### 1. Series (Sequential Execution)
```javascript
function series(tasks, finalCallback) {
    let index = 0;

    function next() {
        if (index >= tasks.length) {
            return finalCallback(null, 'All done');
        }
        const task = tasks[index++];
        task((err) => {
            if (err) return finalCallback(err);
            next();
        });
    }

    next();
}

series([
    cb => setTimeout(() => { console.log('Task 1'); cb(null); }, 100),
    cb => setTimeout(() => { console.log('Task 2'); cb(null); }, 100),
    cb => setTimeout(() => { console.log('Task 3'); cb(null); }, 100),
], (err) => {
    if (err) console.error(err);
    else console.log('Series complete');
});
```

### 2. Parallel Execution
```javascript
function parallel(tasks, finalCallback) {
    let completed = 0;
    let hasError = false;
    const results = [];

    tasks.forEach((task, i) => {
        task((err, result) => {
            if (hasError) return;
            if (err) {
                hasError = true;
                return finalCallback(err);
            }
            results[i] = result;
            completed++;
            if (completed === tasks.length) {
                finalCallback(null, results);
            }
        });
    });
}

parallel([
    cb => setTimeout(() => cb(null, 'A'), 300),
    cb => setTimeout(() => cb(null, 'B'), 100),
    cb => setTimeout(() => cb(null, 'C'), 200),
], (err, results) => {
    console.log(results);  // ['A', 'B', 'C'] (order preserved!)
});
```

### 3. Waterfall (Passing Results)
```javascript
function waterfall(tasks, finalCallback) {
    let index = 0;

    function next(err, ...args) {
        if (err) return finalCallback(err);
        if (index >= tasks.length) {
            return finalCallback(null, ...args);
        }
        const task = tasks[index++];
        task(...args, next);
    }

    next();
}

waterfall([
    (cb) => cb(null, 2),
    (num, cb) => cb(null, num * 3),      // 6
    (num, cb) => cb(null, num + 4),      // 10
], (err, result) => {
    console.log(result);  // 10
});
```

### Why
These patterns are the ancestors of `Promise.all`, `Promise.race`, and async/await. Understanding them helps you read legacy Node.js code and build custom flow control.

---

## 10. Writing Your Own Callback-Based APIs

### What
Designing functions that accept callbacks correctly.

### Best Practices
```javascript
function fetchUser(userId, callback) {
    // 1. Validate callback is a function
    if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
    }

    // 2. Validate inputs synchronously
    if (typeof userId !== 'number' || userId <= 0) {
        // Pass sync errors async-style to avoid Zalgo
        setTimeout(() => {
            callback(new Error('Invalid userId'));
        }, 0);
        return;
    }

    // 3. Always call callback exactly once
    let called = false;
    function safeCallback(err, data) {
        if (called) return;
        called = true;
        callback(err, data);
    }

    // 4. Perform async work
    setTimeout(() => {
        safeCallback(null, { id: userId, name: 'Alice' });
    }, 100);
}

// Usage
fetchUser(1, (err, user) => {
    if (err) return console.error(err);
    console.log(user);
});
```

### The "Zalgo" Problem
If you sometimes call a callback synchronously and sometimes asynchronously, you release Zalgo — unpredictable execution order that causes race conditions.

```javascript
// ❌ BAD: Sometimes sync, sometimes async
function unreliableCache(key, callback) {
    if (cache[key]) {
        callback(null, cache[key]);        // SYNC!
    } else {
        fetch(key, callback);              // ASYNC
    }
}

// ✅ GOOD: Always async
function reliableCache(key, callback) {
    if (cache[key]) {
        setTimeout(() => callback(null, cache[key]), 0);  // ASYNC
    } else {
        fetch(key, callback);
    }
}
```

> 💡 **Rule:** Use `process.nextTick` (Node.js) or `setTimeout(..., 0)` to defer synchronous results and maintain async consistency.

---

## 11. Callback Polyfills (map, filter, reduce, forEach)

### What
Rebuilding native array methods from scratch to understand how callbacks drive iteration.

### How
```javascript
// Polyfill for Array.prototype.forEach
Array.prototype.myForEach = function(callback, thisArg) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    for (let i = 0; i < this.length; i++) {
        if (i in this) {  // skip holes in sparse arrays
            callback.call(thisArg, this[i], i, this);
        }
    }
};

// Polyfill for Array.prototype.map
Array.prototype.myMap = function(callback, thisArg) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    const result = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
        if (i in this) {
            result[i] = callback.call(thisArg, this[i], i, this);
        }
    }
    return result;
};

// Polyfill for Array.prototype.filter
Array.prototype.myFilter = function(callback, thisArg) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            result.push(this[i]);
        }
    }
    return result;
};

// Polyfill for Array.prototype.reduce
Array.prototype.myReduce = function(callback, initialValue) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    let accumulator = initialValue;
    let startIndex = 0;

    if (arguments.length < 2) {
        if (this.length === 0) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        accumulator = this[0];
        startIndex = 1;
    }

    for (let i = startIndex; i < this.length; i++) {
        if (i in this) {
            accumulator = callback(accumulator, this[i], i, this);
        }
    }
    return accumulator;
};
```

### Why
Writing polyfills teaches you:
- How callbacks receive `(element, index, array)`
- The importance of `thisArg` context binding
- How sparse arrays are handled (`i in this`)
- Why `reduce` needs special handling for empty arrays without initial value

---

## 12. Callback vs Promises vs Async/Await

### Comparison

| Feature | Callbacks | Promises | Async/Await |
|---------|-----------|----------|-------------|
| **Readability** | Poor (nesting) | Good (chaining) | Excellent (linear) |
| **Error Handling** | Manual, error-first | `.catch()` | `try-catch` |
| **Composition** | Hard | `.then()` chaining | Sequential `await` |
| **Parallelism** | Manual (async lib) | `Promise.all()` | `Promise.all()` |
| **Debugging** | Hard (anonymous stacks) | Better | Best (named stacks) |
| **Legacy Support** | Universal | ES2015+ | ES2017+ |

### Converting Callbacks to Promises
```javascript
const util = require('util');
const fs = require('fs');

// Node.js built-in
const readFile = util.promisify(fs.readFile);

// Manual promisify
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    };
}

// Usage
const readFileAsync = promisify(fs.readFile);
readFileAsync('file.txt', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

### Why Still Learn Callbacks?
- Event listeners (`addEventListener`) still use callbacks
- Many legacy libraries and Node.js core modules use them
- Understanding callbacks is prerequisite to understanding Promises (Promises are callback abstractions)
- Custom APIs sometimes need callback flexibility

---

## 13. Common Pitfalls & Gotchas

### 1. Losing `this` Context
```javascript
const user = {
    name: 'Alice',
    greet() {
        console.log('Hi, ' + this.name);
    }
};

setTimeout(user.greet, 100);  // "Hi, undefined" — this is lost!

// Fixes:
setTimeout(() => user.greet(), 100);     // Arrow function + closure
setTimeout(user.greet.bind(user), 100);  // Explicit binding
```

### 2. Callback Executed Multiple Times
```javascript
function badAsync(callback) {
    setTimeout(() => callback(null, 'first'), 100);
    setTimeout(() => callback(null, 'second'), 200);  // Called twice!
}

// Fix: guard with a flag
function goodAsync(callback) {
    let called = false;
    function safeCallback(...args) {
        if (!called) {
            called = true;
            callback(...args);
        }
    }
    setTimeout(() => safeCallback(null, 'first'), 100);
    setTimeout(() => safeCallback(null, 'second'), 200);  // Ignored
}
```

### 3. Passing the Result Instead of the Function
```javascript
const nums = [1, 2, 3];

// ❌ WRONG: passes undefined (console.log returns undefined)
nums.forEach(console.log('Number:'));  // TypeError!

// ✅ CORRECT: passes the function reference
nums.forEach(num => console.log('Number:', num));
nums.forEach(console.log);  // Actually works! (console.log accepts multiple args)
```

### 4. Mutating the Array While Iterating
```javascript
const nums = [1, 2, 3, 4, 5];

// ❌ DANGEROUS: skipping elements!
nums.forEach((num, i) => {
    if (num % 2 === 0) nums.splice(i, 1);
});
console.log(nums);  // [1, 3, 5] — but 4 was skipped!

// ✅ SAFE: iterate backwards or use filter
const evens = nums.filter(n => n % 2 !== 0);
```

### 5. Forgetting to Return in Callbacks
```javascript
const users = [
    { name: 'Alice', active: true },
    { name: 'Bob', active: false }
];

// ❌ WRONG: implicit undefined return
const active = users.filter(user => {
    user.active;  // no return statement!
});
console.log(active);  // [] (empty!)

// ✅ CORRECT
const active = users.filter(user => user.active);
// Or with braces:
const active = users.filter(user => {
    return user.active;
});
```

---

## 14. Exercises

### Exercise 1: Custom forEach
Implement `myForEach` that mimics `Array.prototype.forEach`. It should accept a callback and an optional `thisArg`.

<details>
<summary>Solution</summary>

```javascript
Array.prototype.myForEach = function(callback, thisArg) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    for (let i = 0; i < this.length; i++) {
        if (i in this) {
            callback.call(thisArg, this[i], i, this);
        }
    }
};

// Test
['a', 'b', 'c'].myForEach((item, index) => {
    console.log(`${index}: ${item}`);
});
```
</details>

---

### Exercise 2: Custom map
Implement `myMap` that returns a new array with callback results. Handle sparse arrays correctly.

<details>
<summary>Solution</summary>

```javascript
Array.prototype.myMap = function(callback, thisArg) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    const result = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
        if (i in this) {
            result[i] = callback.call(thisArg, this[i], i, this);
        }
    }
    return result;
};

// Test
const doubled = [1, 2, 3].myMap(n => n * 2);
console.log(doubled);  // [2, 4, 6]
```
</details>

---

### Exercise 3: Custom filter
Implement `myFilter` that returns elements where the callback returns truthy.

<details>
<summary>Solution</summary>

```javascript
Array.prototype.myFilter = function(callback, thisArg) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) {
            result.push(this[i]);
        }
    }
    return result;
};

// Test
const evens = [1, 2, 3, 4, 5].myFilter(n => n % 2 === 0);
console.log(evens);  // [2, 4]
```
</details>

---

### Exercise 4: Custom reduce
Implement `myReduce` with full spec compliance (sparse arrays, no initial value).

<details>
<summary>Solution</summary>

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    let accumulator = initialValue;
    let startIndex = 0;

    if (arguments.length < 2) {
        if (this.length === 0) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        accumulator = this[0];
        startIndex = 1;
    }

    for (let i = startIndex; i < this.length; i++) {
        if (i in this) {
            accumulator = callback(accumulator, this[i], i, this);
        }
    }
    return accumulator;
};

// Test
const sum = [1, 2, 3, 4].myReduce((a, b) => a + b, 0);
console.log(sum);  // 10
```
</details>

---

### Exercise 5: Async Series
Write a `runSeries` function that executes an array of async functions (each accepting a callback) one after another.

<details>
<summary>Solution</summary>

```javascript
function runSeries(tasks, callback) {
    let index = 0;

    function next(err) {
        if (err || index >= tasks.length) {
            return callback(err);
        }
        const task = tasks[index++];
        task(next);
    }

    next();
}

// Test
runSeries([
    cb => setTimeout(() => { console.log('1'); cb(null); }, 300),
    cb => setTimeout(() => { console.log('2'); cb(null); }, 200),
    cb => setTimeout(() => { console.log('3'); cb(null); }, 100),
], (err) => {
    console.log('Done');
});
// Output: 1, 2, 3, Done
```
</details>

---

### Exercise 6: Async Parallel with Limit
Write `runParallelLimit(tasks, limit, callback)` that runs async tasks with a concurrency limit.

<details>
<summary>Solution</summary>

```javascript
function runParallelLimit(tasks, limit, callback) {
    if (tasks.length === 0) return callback(null, []);

    let running = 0;
    let completed = 0;
    let hasError = false;
    const results = [];
    let index = 0;

    function runNext() {
        if (hasError) return;
        if (index >= tasks.length) return;

        const currentIndex = index++;
        running++;

        tasks[currentIndex]((err, result) => {
            if (hasError) return;
            if (err) {
                hasError = true;
                return callback(err);
            }
            results[currentIndex] = result;
            running--;
            completed++;

            if (completed === tasks.length) {
                callback(null, results);
            } else {
                runNext();
            }
        });

        if (running < limit) {
            runNext();
        }
    }

    runNext();
}

// Test
runParallelLimit([
    cb => setTimeout(() => cb(null, 'A'), 300),
    cb => setTimeout(() => cb(null, 'B'), 100),
    cb => setTimeout(() => cb(null, 'C'), 200),
    cb => setTimeout(() => cb(null, 'D'), 150),
], 2, (err, results) => {
    console.log(results);  // ['A', 'B', 'C', 'D']
});
```
</details>

---

### Exercise 7: Debounce with Callbacks
Implement a `debounce` function that delays invoking a callback until after a wait time has elapsed since the last call.

<details>
<summary>Solution</summary>

```javascript
function debounce(callback, wait) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(this, args);
        }, wait);
    };
}

// Test
const search = debounce((query) => {
    console.log('Searching for:', query);
}, 300);

search('a');
search('ab');
search('abc');  // Only this one fires after 300ms
```
</details>

---

### Exercise 8: Throttle with Callbacks
Implement a `throttle` function that ensures a callback is called at most once per wait period.

<details>
<summary>Solution</summary>

```javascript
function throttle(callback, wait) {
    let lastTime = 0;
    let timeoutId;

    return function(...args) {
        const now = Date.now();
        const remaining = wait - (now - lastTime);

        if (remaining <= 0) {
            clearTimeout(timeoutId);
            lastTime = now;
            callback.apply(this, args);
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastTime = Date.now();
                timeoutId = null;
                callback.apply(this, args);
            }, remaining);
        }
    };
}

// Test
const logScroll = throttle(() => console.log('Scrolled!'), 1000);
window.addEventListener('scroll', logScroll);
```
</details>

---

### Exercise 9: Memoize with Callbacks
Implement `memoizeAsync` that caches async callback results based on arguments.

<details>
<summary>Solution</summary>

```javascript
function memoizeAsync(fn) {
    const cache = new Map();
    const pending = new Map();

    return function(...args) {
        const callback = args.pop();  // last arg is the callback
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return callback(null, cache.get(key));
        }

        if (pending.has(key)) {
            pending.get(key).push(callback);
            return;
        }

        pending.set(key, [callback]);

        fn(...args, (err, result) => {
            const cbs = pending.get(key);
            pending.delete(key);

            if (!err) cache.set(key, result);
            cbs.forEach(cb => cb(err, result));
        });
    };
}

// Test
const fetchUser = memoizeAsync((id, cb) => {
    console.log('Fetching user', id);
    setTimeout(() => cb(null, { id, name: 'Alice' }), 100);
});

fetchUser(1, (err, user) => console.log('A:', user));
fetchUser(1, (err, user) => console.log('B:', user));  // Cached!
```
</details>

---

### Exercise 10: Event Emitter (Pub/Sub)
Build a simple `EventEmitter` class using callbacks.

<details>
<summary>Solution</summary>

```javascript
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);  // unsubscribe function
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            callback(...args);
        });
    }

    once(event, callback) {
        const wrapper = (...args) => {
            this.off(event, wrapper);
            callback(...args);
        };
        this.on(event, wrapper);
    }
}

// Test
const emitter = new EventEmitter();
emitter.on('data', (msg) => console.log('Received:', msg));
emitter.emit('data', 'Hello!');  // Received: Hello!
```
</details>

---

## 15. Quick Reference Cheat Sheet

```javascript
// ========== BASICS ==========
function greet(name, callback) {
    callback();
}
greet('Alice', () => console.log('Done'));

// ========== SYNCHRONOUS ==========
[1,2,3].forEach(cb);
[1,2,3].map(cb);
[1,2,3].filter(cb);
[1,2,3].reduce(cb, init);
[1,2,3].find(cb);
[1,2,3].some(cb);
[1,2,3].every(cb);
[1,2,3].sort((a,b) => a - b);

// ========== ASYNCHRONOUS ==========
setTimeout(cb, delay);
setInterval(cb, delay);
element.addEventListener('click', cb);
xhr.onload = cb;
reader.onload = cb;

// ========== ERROR-FIRST ==========
function asyncFn(arg, callback) {
    if (error) callback(new Error('fail'));
    else callback(null, result);
}
asyncFn(arg, (err, data) => {
    if (err) return handleError(err);
    useData(data);
});

// ========== HIGHER-ORDER ==========
function withLogging(fn) {
    return (...args) => {
        console.log('Calling', fn.name);
        return fn(...args);
    };
}

// ========== CONTROL FLOW ==========
// Series
function series(tasks, cb) { /* sequential */ }
// Parallel
function parallel(tasks, cb) { /* concurrent */ }
// Waterfall
function waterfall(tasks, cb) { /* pass results */ }

// ========== UTILITIES ==========
// Debounce
debounce(fn, wait);
// Throttle
throttle(fn, wait);
// Once
once(fn);
// Memoize
memoize(fn);

// ========== PROMISIFY ==========
function promisify(fn) {
    return (...args) => new Promise((resolve, reject) => {
        fn(...args, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}
```

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **First-Class Functions** | Functions can be passed as arguments, stored in variables, and returned |
| **Sync vs Async** | Sync callbacks run immediately on the stack; async callbacks wait in queues |
| **Event Loop** | Microtasks (Promises) run before macrotasks (`setTimeout`) |
| **Error Handling** | `try-catch` doesn't catch async errors; use error-first callbacks |
| **Zalgo** | Never mix sync and async callback invocation; always defer with `setTimeout` or `process.nextTick` |
| **Context** | Arrow functions preserve `this`; regular functions need `.bind()` or closure |
| **Callback Hell** | Refactor with named functions, Promises, or async/await |
| **HOFs** | `map`, `filter`, `reduce` are built on callbacks — understand them deeply |
| **Security** | Always validate callbacks are functions before invoking |
| **Legacy** | Callbacks are still everywhere: event listeners, streams, legacy Node.js APIs |

---

*Happy coding! 🚀*
