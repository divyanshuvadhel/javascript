# JavaScript Promises

## From Basics to Advanced Topics

---

## Table of Contents
1. [What is a Promise?](#1-what-is-a-promise)
2. [Promise States](#2-promise-states)
3. [Creating a Promise](#3-creating-a-promise)
4. [Consuming Promises](#4-consuming-promises)
5. [Chaining Promises](#5-chaining-promises)
6. [Promise Static Methods](#6-promise-static-methods)
7. [Async/Await](#7-asyncawait)
8. [Error Handling Deep Dive](#8-error-handling-deep-dive)
9. [Advanced Patterns](#9-advanced-patterns)
10. [Common Pitfalls](#10-common-pitfalls)
11. [Promise Internals & Microtasks](#11-promise-internals--microtasks)
12. [Building a Promise Polyfill](#12-building-a-promise-polyfill)
13. [Real-World Patterns](#13-real-world-patterns)

---

## 1. What is a Promise?

A **Promise** is an object representing the eventual completion or failure of an asynchronous operation. It acts as a proxy for a value not necessarily known when the promise is created.

### Why Promises?

Before Promises, we used **callback functions**, leading to "Callback Hell":

```javascript
// Callback Hell (Pyramid of Doom)
getData(function(a) {
    getMoreData(a, function(b) {
        getEvenMoreData(b, function(c) {
            getFinalData(c, function(d) {
                console.log(d);
            });
        });
    });
});
```

Promises solve this with **flattened chaining** and **standardized error handling**.

---

## 2. Promise States

A Promise is always in one of three states:

| State      | Description                                      |
|------------|--------------------------------------------------|
| `pending`  | Initial state; neither fulfilled nor rejected  |
| `fulfilled`| Operation completed successfully                 |
| `rejected` | Operation failed                                 |

> **Important:** Once a promise is `fulfilled` or `rejected`, it becomes **settled** and its state **cannot change**.

```javascript
const promise = new Promise((resolve, reject) => {
    // pending initially
    resolve("Success!"); // transitions to fulfilled
    // reject("Error!");  // transitions to rejected
});
```

---

## 3. Creating a Promise

### 3.1 Basic Constructor

```javascript
const myPromise = new Promise((resolve, reject) => {
    const success = true;

    if (success) {
        resolve("Operation completed!");
    } else {
        reject("Operation failed!");
    }
});
```

### 3.2 Promise with Async Operation

```javascript
const fetchData = new Promise((resolve, reject) => {
    setTimeout(() => {
        const data = { id: 1, name: "Alice" };
        resolve(data);
    }, 1000);
});
```

### 3.3 Wrapping Callbacks

```javascript
function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}
```

### 3.4 Promisify Utility (Node.js)

```javascript
const util = require('util');
const fs = require('fs');

const readFile = util.promisify(fs.readFile);
// Or use fs.promises API directly
```

---

## 4. Consuming Promises

### 4.1 `.then()` — Handle Success

```javascript
promise
    .then(value => {
        console.log(value); // "Success!"
    });
```

### 4.2 `.catch()` — Handle Errors

```javascript
promise
    .then(value => console.log(value))
    .catch(error => {
        console.error(error); // "Error!"
    });
```

### 4.3 `.finally()` — Cleanup (Always Runs)

```javascript
promise
    .then(value => console.log(value))
    .catch(error => console.error(error))
    .finally(() => {
        console.log("Cleanup: hide loading spinner");
    });
```

### 4.4 The `.then()` Signature

```javascript
promise.then(
    onFulfilled,  // (value) => { ... }
    onRejected    // (error) => { ... }
);

// Equivalent to:
promise.then(onFulfilled).catch(onRejected);
// BUT: onRejected in .then() only catches errors from the promise itself,
// not from onFulfilled. Use .catch() for full safety.
```

---

## 5. Chaining Promises

### 5.1 Basic Chaining

```javascript
fetchUser(1)
    .then(user => fetchOrders(user.id))
    .then(orders => fetchProducts(orders[0].id))
    .then(product => console.log(product))
    .catch(error => console.error(error));
```

### 5.2 Returning Values vs Returning Promises

```javascript
Promise.resolve(1)
    .then(x => x + 1)           // returns 2 (wrapped in Promise)
    .then(x => Promise.resolve(x + 1)) // returns Promise<3>
    .then(x => console.log(x));  // 3
```

### 5.3 Chaining with Side Effects

```javascript
fetchUser(1)
    .then(user => {
        console.log("User:", user); // side effect
        return user;                // must return to chain
    })
    .then(user => fetchOrders(user.id));
```

### 5.4 Common Mistake: Forgetting Return

```javascript
// ❌ BAD: Missing return causes undefined to propagate
fetchUser(1)
    .then(user => {
        fetchOrders(user.id); // missing return!
    })
    .then(orders => {
        console.log(orders); // undefined!
    });

// ✅ GOOD: Always return in .then()
fetchUser(1)
    .then(user => fetchOrders(user.id))
    .then(orders => console.log(orders));
```

---

## 6. Promise Static Methods

### 6.1 `Promise.resolve()` — Create Fulfilled Promise

```javascript
Promise.resolve("Instant value")
    .then(value => console.log(value));

// Useful for normalizing values to promises
function getValue(maybePromise) {
    return Promise.resolve(maybePromise);
}
```

### 6.2 `Promise.reject()` — Create Rejected Promise

```javascript
Promise.reject(new Error("Fail immediately"))
    .catch(err => console.error(err.message));
```

### 6.3 `Promise.all()` — Wait for All (Fail Fast)

```javascript
const promises = [
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
];

Promise.all(promises)
    .then(users => console.log(users)) // [user1, user2, user3]
    .catch(error => console.error("One failed!", error));

// ⚠️ If ANY promise rejects, Promise.all immediately rejects
// with that error. Other results are lost.
```

### 6.4 `Promise.allSettled()` — Wait for All (Never Fails)

```javascript
Promise.allSettled([
    Promise.resolve("success"),
    Promise.reject("error"),
    Promise.resolve("another success")
])
.then(results => {
    console.log(results);
    /*
    [
        { status: "fulfilled", value: "success" },
        { status: "rejected", reason: "error" },
        { status: "fulfilled", value: "another success" }
    ]
    */
});
```

### 6.5 `Promise.race()` — First to Settle Wins

```javascript
Promise.race([
    fetchFromFastServer(),
    fetchFromSlowServer(),
    new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 5000)
    )
])
.then(result => console.log("Winner:", result))
.catch(error => console.error("First to fail:", error));
```

### 6.6 `Promise.any()` — First to FULFILL Wins

```javascript
Promise.any([
    Promise.reject("Error 1"),
    Promise.resolve("Success!"),
    Promise.reject("Error 2")
])
.then(firstSuccess => console.log(firstSuccess)) // "Success!"
.catch(aggregateError => {
    console.log(aggregateError.errors); // All rejection reasons
});

// If ALL reject, throws AggregateError (ES2021+)
```

### 6.7 Comparison Table

| Method              | Resolves When...              | Rejects When...           |
|---------------------|-------------------------------|---------------------------|
| `Promise.all`       | All fulfilled                 | First rejection           |
| `Promise.allSettled`| All settled (always resolves) | Never rejects             |
| `Promise.race`      | First settles                 | First settles (if reject) |
| `Promise.any`       | First fulfillment             | All reject                |

---

## 7. Async/Await

### 7.1 Basic Syntax

```javascript
async function getUserData(userId) {
    try {
        const user = await fetchUser(userId);
        const orders = await fetchOrders(user.id);
        return orders;
    } catch (error) {
        console.error("Failed:", error);
        throw error; // Re-throw or handle
    }
}
```

### 7.2 async Functions Always Return Promises

```javascript
async function example() {
    return "value"; // Returns Promise.resolve("value")
}

async function example2() {
    throw new Error("fail"); // Returns Promise.reject(error)
}
```

### 7.3 Sequential vs Parallel Execution

```javascript
// ❌ Sequential (slow)
async function slow() {
    const a = await fetchA(); // waits
    const b = await fetchB(); // waits
    const c = await fetchC(); // waits
    return [a, b, c];
}

// ✅ Parallel (fast)
async function fast() {
    const [a, b, c] = await Promise.all([
        fetchA(),
        fetchB(),
        fetchC()
    ]);
    return [a, b, c];
}

// ✅ Parallel with individual error handling
async function fastSafe() {
    const [a, b, c] = await Promise.allSettled([
        fetchA(),
        fetchB(),
        fetchC()
    ]);
    return [a, b, c];
}
```

### 7.4 Awaiting in Loops

```javascript
// ❌ Sequential iteration
for (const id of userIds) {
    await fetchUser(id); // one at a time
}

// ✅ Parallel iteration
await Promise.all(userIds.map(id => fetchUser(id)));

// ✅ Controlled concurrency (e.g., max 3 at a time)
async function* batchGenerator(items, batchSize) {
    for (let i = 0; i < items.length; i += batchSize) {
        yield items.slice(i, i + batchSize);
    }
}

for await (const batch of batchGenerator(userIds, 3)) {
    await Promise.all(batch.map(id => fetchUser(id)));
}
```

### 7.5 Top-Level Await (ES2022+)

```javascript
// In ES modules
const data = await fetchData();
console.log(data);
```

---

## 8. Error Handling Deep Dive

### 8.1 Synchronous Errors in async Functions

```javascript
async function risky() {
    JSON.parse("invalid json"); // throws synchronously
    // This is automatically caught and returned as rejected promise
}

risky().catch(err => console.error(err));
```

### 8.2 Unhandled Promise Rejections

```javascript
// ❌ Unhandled - may crash in future Node.js versions
fetchData().then(data => console.log(data));
// If fetchData rejects, nobody catches it!

// ✅ Always attach catch or use try/catch
fetchData()
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

### 8.3 Error Propagation in Chains

```javascript
fetchUser(1)
    .then(user => {
        if (!user.isActive) {
            throw new Error("User inactive"); // rejects downstream
        }
        return user;
    })
    .then(user => fetchOrders(user.id))
    .catch(err => {
        // Catches ANY error in the chain above
        console.error(err);
        return []; // recovery: return default value
    })
    .then(orders => renderOrders(orders)); // continues with [] or real orders
```

### 8.4 Custom Error Classes

```javascript
class NetworkError extends Error {
    constructor(response) {
        super(`Network error: ${response.status}`);
        this.status = response.status;
        this.response = response;
    }
}

async function apiCall(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new NetworkError(response);
    }
    return response.json();
}
```

### 8.5 Retry with Exponential Backoff

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fetch(url);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

---

## 9. Advanced Patterns

### 9.1 Promise Memoization (Cache)

```javascript
function createMemoizedFetcher(fetcher) {
    const cache = new Map();

    return function(key) {
        if (cache.has(key)) {
            return cache.get(key); // Return cached promise
        }

        const promise = fetcher(key).finally(() => {
            // Optional: cache expiration
            setTimeout(() => cache.delete(key), 60000);
        });

        cache.set(key, promise);
        return promise;
    };
}

const fetchUserMemoized = createMemoizedFetcher(fetchUser);
// Same promise returned for concurrent calls with same ID
```

### 9.2 AbortController for Cancellation

```javascript
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/data', { signal })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => {
        if (err.name === 'AbortError') {
            console.log('Request was cancelled');
        }
    });

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);
```

### 9.3 Timeout Pattern

```javascript
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), ms);
    });
    return Promise.race([promise, timeout]);
}

withTimeout(fetchData(), 5000)
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

### 9.4 Deferred Promise (Anti-pattern but useful)

```javascript
function createDeferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

// Usage: resolve from outside
const deferred = createDeferred();
setTimeout(() => deferred.resolve("Done!"), 1000);
await deferred.promise;
```

### 9.5 Promise Queue (Sequential Execution)

```javascript
class PromiseQueue {
    constructor() {
        this.queue = Promise.resolve();
    }

    add(task) {
        this.queue = this.queue.then(task).catch(err => {
            console.error("Task failed:", err);
            throw err; // or swallow: return undefined
        });
        return this.queue;
    }
}

const queue = new PromiseQueue();
queue.add(() => fetchA());
queue.add(() => fetchB()); // B waits for A
queue.add(() => fetchC()); // C waits for B
```

### 9.6 Semaphore / Concurrency Limit

```javascript
class Semaphore {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.currentRunning = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.currentRunning < this.maxConcurrency) {
            this.currentRunning++;
            return;
        }
        await new Promise(resolve => this.queue.push(resolve));
        this.currentRunning++;
    }

    release() {
        this.currentRunning--;
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next();
        }
    }
}

// Usage
const semaphore = new Semaphore(3);

async function limitedFetch(url) {
    await semaphore.acquire();
    try {
        return await fetch(url);
    } finally {
        semaphore.release();
    }
}
```

### 9.7 Pipeline Pattern

```javascript
function pipe(...fns) {
    return (input) => fns.reduce(
        (chain, fn) => chain.then(fn),
        Promise.resolve(input)
    );
}

const processUser = pipe(
    fetchUser,
    validateUser,
    enrichUserData,
    saveToDatabase
);

processUser(123).then(result => console.log(result));
```

---

## 10. Common Pitfalls

### 10.1 The `return` vs `no return` Problem

```javascript
// ❌ Forgot return - chain breaks
.then(user => {
    fetchOrders(user.id); // fire-and-forget, returns undefined
})

// ✅ Correct
.then(user => fetchOrders(user.id))
// or
.then(user => {
    return fetchOrders(user.id);
})
```

### 10.2 Mixing sync and async errors

```javascript
// ❌ Only catches async errors
async function bad() {
    try {
        const data = await fetchData();
        JSON.parse(data); // sync error - caught by try/catch ✓
    } catch (e) {
        // handles both
    }
}

// ❌ .catch() misses synchronous errors in .then()
fetchData()
    .then(data => JSON.parse(data)) // sync error here
    .catch(e => console.error(e)); // ✓ Actually caught!

// But if you have another .then() before catch:
fetchData()
    .then(data => JSON.parse(data))
    .then(result => console.log(result))
    .catch(e => console.error(e)); // ✓ Still caught!
```

### 10.3 Constructor vs .then() executor

```javascript
// ❌ Calling resolve multiple times
new Promise((resolve) => {
    resolve(1);
    resolve(2); // ignored - promise already settled
});

// ✅ Use observable pattern for multiple values
```

### 10.4 Floating Promises (Unhandled)

```javascript
// ❌ ESLint: "floating promise"
async function main() {
    updateDatabase(); // forgot await! runs in background
    console.log("Done"); // prints before database update
}

// ✅
async function main() {
    await updateDatabase();
    console.log("Done");
}
```

### 10.5 Promise Constructor Anti-pattern

```javascript
// ❌ Wrapping a promise in a promise (redundant)
function badFetch(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => resolve(response))
            .catch(error => reject(error));
    });
}

// ✅ fetch already returns a promise
function goodFetch(url) {
    return fetch(url);
}
```

### 10.6 async in Array.forEach()

```javascript
// ❌ forEach doesn't wait for async callbacks
urls.forEach(async (url) => {
    const data = await fetch(url);
    console.log(data);
});
console.log("All done"); // Prints BEFORE fetches complete

// ✅ Use for...of or Promise.all
for (const url of urls) {
    const data = await fetch(url);
    console.log(data);
}
console.log("All done"); // Correct order
```

---

## 11. Promise Internals & Microtasks

### 11.1 The Event Loop & Microtask Queue

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// Output: 1, 4, 3, 2
// Microtasks (Promises) run before macrotasks (setTimeout)
```

### 11.2 Microtask Queue Explosion

```javascript
// Can starve the event loop
function loop() {
    Promise.resolve().then(loop);
}
loop();
// setTimeout will never fire if microtasks keep scheduling
```

### 11.3 `queueMicrotask()` API

```javascript
queueMicrotask(() => {
    console.log("In microtask queue");
});

// Same priority as Promise.then()
```

### 11.4 Task Priorities (Simplified)

1. **Synchronous code** (highest priority)
2. **Microtasks**: Promise callbacks, `queueMicrotask`, `MutationObserver`
3. **Macrotasks**: `setTimeout`, `setInterval`, I/O, UI rendering

---

## 12. Building a Promise Polyfill

### 12.1 Basic Implementation

```javascript
class MyPromise {
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(fn => fn(value));
            }
        };

        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn(reason));
            }
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        const result = onFulfilled(this.value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }

            if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        const result = onRejected(this.reason);
                        resolve(result); // rejection handler can recover
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }

            if (this.state === 'pending') {
                this.onFulfilledCallbacks.push((value) => {
                    setTimeout(() => {
                        try {
                            const result = onFulfilled(value);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });

                this.onRejectedCallbacks.push((reason) => {
                    setTimeout(() => {
                        try {
                            const result = onRejected(reason);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }
        });
    }

    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
}
```

### 12.2 Key Spec Requirements (A+ Compliance)

- `then()` must return a new promise
- Handlers must be called asynchronously (microtask)
- Chained promises must resolve with the handler's return value
- If handler throws, chained promise must reject
- `then()` handlers are optional (default to identity functions)

---

## 13. Real-World Patterns

### 13.1 API Client with Interceptors

```javascript
class ApiClient {
    constructor() {
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    addRequestInterceptor(fn) {
        this.requestInterceptors.push(fn);
    }

    async request(config) {
        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config);
        }

        try {
            let response = await fetch(config.url, config);

            // Apply response interceptors
            for (const interceptor of this.responseInterceptors) {
                response = await interceptor(response);
            }

            return response;
        } catch (error) {
            // Global error handling
            throw this.normalizeError(error);
        }
    }
}
```

### 13.2 Resource Pool Pattern

```javascript
class ConnectionPool {
    constructor(factory, maxSize) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.available = [];
        this.waiting = [];
    }

    async acquire() {
        if (this.available.length > 0) {
            return this.available.pop();
        }
        if (this.size < this.maxSize) {
            return this.factory();
        }
        return new Promise(resolve => this.waiting.push(resolve));
    }

    release(connection) {
        if (this.waiting.length > 0) {
            const next = this.waiting.shift();
            next(connection);
        } else {
            this.available.push(connection);
        }
    }
}
```

### 13.3 Circuit Breaker Pattern

```javascript
class CircuitBreaker {
    constructor(request, options = {}) {
        this.request = request;
        this.failureThreshold = options.failureThreshold || 5;
        this.timeout = options.timeout || 60000;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failures = 0;
        this.nextAttempt = Date.now();
    }

    async fire(...args) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const response = await this.request(...args);
            this.onSuccess();
            return response;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failures++;
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
        }
    }
}
```

### 13.4 Debounce with Promise

```javascript
function debouncePromise(fn, delay) {
    let timeoutId;

    return (...args) => {
        return new Promise((resolve) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                resolve(fn(...args));
            }, delay);
        });
    };
}

const search = debouncePromise((query) => fetchSearchResults(query), 300);
```

### 13.5 Lazy Initialization Pattern

```javascript
class LazyResource {
    constructor(factory) {
        this.factory = factory;
        this.promise = null;
    }

    get() {
        if (!this.promise) {
            this.promise = this.factory();
        }
        return this.promise;
    }

    reset() {
        this.promise = null;
    }
}

const dbConnection = new LazyResource(() => connectToDatabase());
// First call initializes, subsequent calls return same promise
```

---

## Quick Reference Card

```javascript
// Creation
new Promise((resolve, reject) => { ... })
Promise.resolve(value)
Promise.reject(reason)

// Consumption
promise.then(onFulfilled, onRejected)
promise.catch(onRejected)
promise.finally(onFinally)

// Combination
Promise.all([...promises])        // fail-fast
Promise.allSettled([...promises]) // never fails
Promise.race([...promises])       // first settles
Promise.any([...promises])        // first fulfills

// Async/Await
async function fn() { 
    const result = await promise;
    return result; 
}

// Error Handling
try {
    const result = await mightFail();
} catch (error) {
    // handle
}
```

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| States | `pending` → `fulfilled` OR `rejected` (irreversible) |
| Chaining | Always `return` in `.then()` handlers |
| Error Handling | Use `.catch()` or `try/catch` with `await` |
| Parallel | `Promise.all()` for concurrent execution |
| Sequential | `for...of` with `await` for ordered async |
| Cancellation | Use `AbortController` for fetch/XHR |
| Performance | Avoid Promise constructor anti-pattern |

---

*Happy Coding! 🚀*
