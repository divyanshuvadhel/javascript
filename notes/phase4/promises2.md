# 🚀 JavaScript Promises: A Progressive Learning Journey

> **How to use this guide:** Read sequentially. Each module builds on the last. Don't skip the analogies — they build intuition. Complete the **🧪 Try It** sections before moving on.

---

## 📍 Learning Roadmap

```
Module 1: The Analogy        →  Module 2: Write Your First
    ↓                                    ↓
Module 3: The Chain            →  Module 4: Promise Teams
    ↓                                    ↓
Module 5: async/await        →  Module 6: Error Defense
    ↓                                    ↓
Module 7: How JS Runs It     →  Module 8: Real-World Patterns
    ↓
🏆 Practice Lab + Cheat Sheet
```

---

# MODULE 1: The Analogy — What IS a Promise?

## 🍕 The Pizza Order Story

Imagine you walk into a pizza shop and place an order.

| Real Life | JavaScript |
|-----------|------------|
| You pay and get a **receipt** | You call a function and get a **Promise** |
| The receipt says "Your pizza will be ready" | The Promise says "I don't have the value yet, but I will" |
| You can **do other things** while waiting | JS continues running other code |
| The receipt can end in two ways: pizza ready OR shop closed | The Promise ends in two ways: `fulfilled` OR `rejected` |
| You can't eat the receipt — you wait for the pizza | You can't use the Promise directly — you wait for the **value** |

> **Key Insight:** A Promise is not the result. It is a **receipt for a future result**.

## The Three States (Visualized)

```
        [ PENDING ]
            /              /         [FULFILLED] [REJECTED]
       (✅)        (❌)
    "Here's      "Sorry,
     your data!"  it failed."
```

Once a Promise leaves `pending`, it **never goes back**. This is called **immutability of settlement**.

## 🧪 Try It — Module 1

Before writing code, answer these:

1. Can a Promise change from `fulfilled` back to `pending`? **(No — settlement is permanent)**
2. If I have a Promise, do I already have the final value? **(No — you have a receipt, not the pizza)**

---

# MODULE 2: Your First Promise

## 2.1 Creating a Promise

```javascript
const myFirstPromise = new Promise((resolve, reject) => {
    // This function runs IMMEDIATELY when you create the Promise
    console.log("Promise executor running...");

    const success = true;

    if (success) {
        resolve("🎉 Success!");   // transitions to fulfilled
    } else {
        reject("💥 Failed!");     // transitions to rejected
    }
});

console.log("This runs AFTER the executor!");
```

> ⚠️ **Common Confusion:** The executor function runs **synchronously**, immediately. Only the `.then()` handlers run asynchronously.

## 2.2 Consuming the Promise

```javascript
myFirstPromise
    .then(value => {
        console.log("Got it:", value);  // "Got it: 🎉 Success!"
    })
    .catch(error => {
        console.error("Oops:", error);
    });
```

### The Mental Model

```
You (the code)          The Promise
    |                         |
    |--- create -------------->|
    |    (executor runs)      |
    |                         |
    |<-- receipt (Promise) ---|
    |                         |
    |--- .then(handler) ----->|
    |    "Call me when done"  |
    |                         | (time passes...)
    |                         |
    |<-- "Here's the value" --|
    |    handler runs         |
```

## 2.3 A Real Example: Simulating a Network Request

```javascript
function fetchUserData(userId) {
    return new Promise((resolve, reject) => {
        console.log(`Fetching user ${userId}...`);

        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: "Alice" });
            } else {
                reject(new Error("Invalid user ID"));
            }
        }, 1000);
    });
}

// Usage
fetchUserData(1)
    .then(user => console.log("User:", user))
    .catch(err => console.error("Error:", err.message));
```

## 🧪 Try It — Module 2

**Exercise A:** What will this print and in what order?

```javascript
console.log("A");
new Promise((resolve) => {
    console.log("B");
    resolve("C");
})
.then(value => console.log(value));
console.log("D");
```

<details>
<summary>💡 Click to reveal answer</summary>

**Output:** `A`, `B`, `D`, `C`

Why? `A` and `B` are synchronous. `D` is synchronous. `C` is inside `.then()`, which runs in a **microtask** — after all synchronous code finishes.

</details>

**Exercise B:** Fix this broken code:

```javascript
function getData() {
    new Promise((resolve) => {
        resolve("data");
    });
}

getData().then(data => console.log(data)); // TypeError!
```

<details>
<summary>💡 Click to reveal answer</summary>

The function doesn't `return` the Promise!

```javascript
function getData() {
    return new Promise((resolve) => {  // ✅ Added return
        resolve("data");
    });
}
```

</details>

---

# MODULE 3: The Chain — Promise Chaining

## 3.1 The Golden Rule

> **Every `.then()` returns a new Promise.**

This is the superpower. You can link operations like a conveyor belt.

```javascript
fetchUser(1)                    // Promise<User>
    .then(user => {             // receives User
        console.log("Step 1:", user.name);
        return user.id;         // returns 1 → Promise<1>
    })
    .then(userId => {           // receives 1
        console.log("Step 2:", userId);
        return fetchOrders(userId); // returns Promise<Orders>
    })
    .then(orders => {          // receives Orders (auto-unwrapped!)
        console.log("Step 3:", orders);
    });
```

## 3.2 The Auto-Unwrap Magic

If you return a Promise inside `.then()`, JavaScript **unwraps it automatically**:

```javascript
Promise.resolve(1)
    .then(x => Promise.resolve(x + 1))  // returns Promise<2>
    .then(x => console.log(x));         // but we get 2, not Promise!
```

This is why "callback hell" disappears. The chain stays flat.

## 3.3 🪤 Trap: The Missing Return

This is the **#1 mistake** beginners make.

```javascript
// ❌ BROKEN: Missing return
fetchUser(1)
    .then(user => {
        fetchOrders(user.id);  // Fire-and-forget! Returns undefined.
    })
    .then(orders => {
        console.log(orders);   // undefined! 😱
    });

// ✅ FIXED: Return the Promise
fetchUser(1)
    .then(user => {
        return fetchOrders(user.id);  // Chain continues properly
    })
    .then(orders => {
        console.log(orders);          // Real orders! 🎉
    });
```

### Visual: Broken vs Fixed

```
BROKEN CHAIN:
fetchUser(1) ──then──> [fetchOrders fires] ──then──> undefined
                              │
                              └─> runs in background, chain doesn't wait

FIXED CHAIN:
fetchUser(1) ──then──> fetchOrders(1) ──then──> orders
     │                      │                  │
     └─Promise<User>──> Promise<Orders>──> Orders
```

## 3.4 🪤 Trap: Throwing in .then()

If you throw an error inside `.then()`, the chain automatically rejects:

```javascript
Promise.resolve("ok")
    .then(value => {
        throw new Error("Something broke!");
    })
    .then(value => {
        console.log("This never runs");
    })
    .catch(err => {
        console.log("Caught:", err.message);  // "Caught: Something broke!"
    });
```

Think of `.catch()` as a safety net under the entire chain above it.

## 🧪 Try It — Module 3

**Exercise:** What will `result` be?

```javascript
const result = Promise.resolve(5)
    .then(x => x * 2)
    .then(x => { x + 1 })
    .then(x => console.log(x));
```

<details>
<summary>💡 Click to reveal answer</summary>

**Output:** `undefined`

Why? The second `.then()` uses curly braces `{}` but **forgets `return`**. With braces, you must explicitly return. Without braces, the expression is auto-returned.

```javascript
.then(x => x + 1)      // ✅ Implicit return
.then(x => { x + 1 })   // ❌ No return statement
.then(x => { return x + 1 }) // ✅ Explicit return
```

</details>

---

# MODULE 4: Promise Teams — Working with Many Promises

## 4.1 Promise.all — "All or Nothing"

You need data from 3 APIs. You want **all** of them, or you want to know **one failed**.

```javascript
const team = Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
]);

team
    .then(([user1, user2, user3]) => {
        console.log("All users:", user1, user2, user3);
    })
    .catch(err => {
        console.error("One failed, all lost:", err);
    });
```

### Visual

```
Promise.all([A, B, C])

A ──✅───┐
         ├──> Wait for slowest ──> [A_result, B_result, C_result]
B ──✅───┘         │
C ──❌───X────────┘
         (If ANY fails, Promise.all immediately rejects)
```

## 4.2 Promise.allSettled — "Tell Me Everything"

You want to know the result of **every** promise, even if some fail.

```javascript
const results = await Promise.allSettled([
    fetchUser(1),      // succeeds
    fetchUser(-1),     // fails
    fetchUser(2)       // succeeds
]);

console.log(results);
// [
//   { status: "fulfilled", value: {id: 1, ...} },
//   { status: "rejected",  reason: Error("Invalid ID") },
//   { status: "fulfilled", value: {id: 2, ...} }
// ]
```

> Use this when partial data is better than no data.

## 4.3 Promise.race — "First to Finish (Any Result)"

```javascript
const winner = await Promise.race([
    fetch('/api/fast'),
    fetch('/api/slow'),
    new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 5000)
    )
]);
```

Whoever settles first — success OR failure — wins.

## 4.4 Promise.any — "First Success Wins"

Like `race`, but ignores rejections until all fail.

```javascript
const firstGood = await Promise.any([
    fetchFromServerA(),  // fails
    fetchFromServerB(),  // succeeds! 🎉
    fetchFromServerC()   // (ignored, we already won)
]);
```

If **all** fail, you get an `AggregateError` containing all reasons.

## 4.5 Decision Tree

```
Do you need ALL results?
├── Yes, and one failure should cancel everything
│   └── Use Promise.all
├── Yes, and you want to know what succeeded/failed
│   └── Use Promise.allSettled
└── No, you just want the fastest response
    ├── Even if it's an error
    │   └── Use Promise.race
    └── Only if it's a success
        └── Use Promise.any
```

## 🧪 Try It — Module 4

**Scenario:** You're building a dashboard that loads user profile, notifications, and settings. The dashboard should still render if notifications fail. Which method do you use?

<details>
<summary>💡 Click to reveal answer</summary>

**`Promise.allSettled`** — because partial data (profile + settings) is better than a blank screen.

```javascript
const [profile, notifications, settings] = await Promise.allSettled([
    fetchProfile(),
    fetchNotifications(),
    fetchSettings()
]);

renderProfile(profile.status === 'fulfilled' ? profile.value : null);
renderSettings(settings.status === 'fulfilled' ? settings.value : defaults);
```

</details>

---

# MODULE 5: async/await — Syntactic Sugar That Changes Everything

## 5.1 The Mental Shift

`async/await` doesn't do anything new. It just makes Promises **look** synchronous.

```javascript
// Promise style
function getData() {
    return fetchUser(1)
        .then(user => fetchOrders(user.id))
        .then(orders => orders[0]);
}

// async/await style
async function getData() {
    const user = await fetchUser(1);
    const orders = await fetchOrders(user.id);
    return orders[0];
}
```

Both functions return a **Promise**. Both behave identically. The second is just easier to read.

## 5.2 Error Handling with try/catch

```javascript
async function loadDashboard() {
    try {
        const user = await fetchUser(1);
        const orders = await fetchOrders(user.id);
        return { user, orders };
    } catch (error) {
        console.error("Dashboard load failed:", error);
        // You can recover:
        return { user: null, orders: [] };
    }
}
```

> `await` can only be used inside an `async` function (or ES modules with top-level await).

## 5.3 🪤 Trap: Sequential vs Parallel

```javascript
// ❌ SLOW: Sequential (one at a time)
async function slow() {
    const a = await fetchA(); // wait...
    const b = await fetchB(); // wait...
    const c = await fetchC(); // wait...
    return [a, b, c];
}
// Total time = A + B + C

// ✅ FAST: Parallel (all at once)
async function fast() {
    const [a, b, c] = await Promise.all([
        fetchA(),  // starts immediately
        fetchB(),  // starts immediately
        fetchC()   // starts immediately
    ]);
    return [a, b, c];
}
// Total time = max(A, B, C)
```

### Visual

```
Sequential:          Parallel:
A: ████             A: ████
B:     ████          B: ████
C:         ████      C: ████
    ────────→            ────→
    12 seconds           4 seconds
```

## 5.4 🪤 Trap: async in forEach()

```javascript
// ❌ BROKEN: forEach doesn't wait
urls.forEach(async (url) => {
    const data = await fetch(url);
    console.log(data);
});
console.log("All done!"); // Prints BEFORE fetches finish!

// ✅ FIXED: Use for...of (sequential) or Promise.all (parallel)
// Sequential:
for (const url of urls) {
    const data = await fetch(url);
    console.log(data);
}
console.log("All done!"); // Correct!

// Parallel:
await Promise.all(urls.map(url => fetch(url)));
console.log("All done!"); // Correct!
```

## 🧪 Try It — Module 5

**Exercise:** Refactor this to use async/await:

```javascript
function getTopPost() {
    return fetch('/api/posts')
        .then(res => res.json())
        .then(posts => posts[0])
        .then(post => fetch(`/api/posts/${post.id}/comments`))
        .then(res => res.json());
}
```

<details>
<summary>💡 Click to reveal answer</summary>

```javascript
async function getTopPost() {
    const postsRes = await fetch('/api/posts');
    const posts = await postsRes.json();
    const topPost = posts[0];

    const commentsRes = await fetch(`/api/posts/${topPost.id}/comments`);
    const comments = await commentsRes.json();

    return comments;
}
```

</details>

---

# MODULE 6: Error Defense — Handling Failures Like a Pro

## 6.1 The Error Propagation Waterfall

Errors bubble down the chain until caught. Think of it as a waterfall:

```
fetchUser(1)
    .then(user => validateUser(user))   // throws if invalid
    .then(user => fetchOrders(user.id)) // skipped if above threw
    .then(orders => render(orders))     // skipped if above threw
    .catch(err => {
        // Catches ANY error from ANY step above
        showErrorMessage(err);
    });
```

## 6.2 Recovery Patterns

### Pattern A: Catch and Recover

```javascript
fetchUser(1)
    .catch(err => {
        console.warn("User fetch failed, using guest mode");
        return { id: 0, name: "Guest", isGuest: true }; // Recovery!
    })
    .then(user => {
        // Always runs, with real user or guest user
        renderHeader(user);
    });
```

### Pattern B: Retry with Exponential Backoff

```javascript
async function fetchWithRetry(url, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fetch(url);
        } catch (error) {
            if (attempt === maxAttempts) throw error;

            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
            console.log(`Retry ${attempt} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```

### Pattern C: Timeout Wrapper

```javascript
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), ms);
    });
    return Promise.race([promise, timeout]);
}

// Usage
const user = await withTimeout(fetchUser(1), 5000);
```

## 6.3 Custom Error Classes

```javascript
class NetworkError extends Error {
    constructor(response) {
        super(`HTTP ${response.status}: ${response.statusText}`);
        this.status = response.status;
        this.response = response;
    }
}

class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.field = field;
    }
}

// Now you can distinguish error types
async function loadData() {
    try {
        const data = await fetchData();
    } catch (err) {
        if (err instanceof NetworkError && err.status === 404) {
            showNotFoundPage();
        } else if (err instanceof ValidationError) {
            showFormError(err.field, err.message);
        } else {
            showGenericError();
        }
    }
}
```

## 🧪 Try It — Module 6

**Exercise:** Write a function that fetches user data, but if it fails, returns a default user after 1 retry.

<details>
<summary>💡 Click to reveal answer</summary>

```javascript
async function getUserSafe(userId) {
    const defaultUser = { id: userId, name: "Unknown", status: "offline" };

    try {
        return await fetchUser(userId);
    } catch (err) {
        console.warn("First attempt failed, retrying...");
        try {
            return await fetchUser(userId);
        } catch (err2) {
            console.error("Retry failed, using default");
            return defaultUser;
        }
    }
}
```

</details>

---

# MODULE 7: The Engine Room — How JavaScript Actually Runs This

## 7.1 The Event Loop (Simplified)

JavaScript is single-threaded. It uses queues to handle async work:

```
┌─────────────────────────────────────────┐
│           CALL STACK                    │
│  (Runs your code, one line at a time)   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         MICROTASK QUEUE                 │
│  (Promise .then() / await /             │
│   queueMicrotask / MutationObserver)    │
│  ★ HIGH PRIORITY                        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         MACROTASK QUEUE                 │
│  (setTimeout / setInterval / I/O / UI)  │
│  ★ LOWER PRIORITY                       │
└─────────────────────────────────────────┘
```

## 7.2 The Golden Rule of Priority

> **The Event Loop drains the entire Microtask Queue before running a single Macrotask.**

```javascript
console.log("1");                          // Stack
setTimeout(() => console.log("2"), 0);   // Macrotask queue
Promise.resolve().then(() => console.log("3")); // Microtask queue
console.log("4");                          // Stack

// Output: 1, 4, 3, 2
//         │  │  │  └─ Macrotask (waits for microtasks)
//         │  │  └──── Microtask (runs after sync code)
//         │  └─────── Sync
//         └────────── Sync
```

## 7.3 The Dangerous Loop

```javascript
function loop() {
    Promise.resolve().then(loop); // Schedules another microtask
}
loop();

// The microtask queue never empties!
// setTimeout will NEVER fire.
// The page will freeze (in browser) or hang (in Node).
```

## 7.4 Why This Matters

If you schedule heavy work in `.then()`, you block the browser from rendering or handling user input. For heavy work, use `setTimeout` to yield to the browser:

```javascript
// ❌ Blocks UI
heavyData.forEach(item => {
    process(item).then(result => appendToDOM(result));
});

// ✅ Yields between batches
async function processInBatches(items, batchSize = 100) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(batch.map(process));
        await new Promise(resolve => setTimeout(resolve, 0)); // yield!
    }
}
```

## 🧪 Try It — Module 7

**Exercise:** What is the output order?

```javascript
console.log("Start");

setTimeout(() => console.log("Timeout 1"), 0);

Promise.resolve().then(() => {
    console.log("Promise 1");
    Promise.resolve().then(() => console.log("Promise 2"));
});

setTimeout(() => console.log("Timeout 2"), 0);

console.log("End");
```

<details>
<summary>💡 Click to reveal answer</summary>

**Output:** `Start`, `End`, `Promise 1`, `Promise 2`, `Timeout 1`, `Timeout 2`

All microtasks (including nested ones) run before any macrotask.

</details>

---

# MODULE 8: Real-World Patterns

## 8.1 Promise Memoization (Cache)

Prevent duplicate in-flight requests:

```javascript
function createCachedFetcher(fetcher) {
    const cache = new Map();

    return function(key) {
        if (cache.has(key)) {
            return cache.get(key); // Return same promise
        }

        const promise = fetcher(key).catch(err => {
            cache.delete(key); // Remove on error
            throw err;
        });

        cache.set(key, promise);
        return promise;
    };
}

const fetchUser = createCachedFetcher(id => api.getUser(id));

// Two simultaneous calls = one network request
fetchUser(1);
fetchUser(1);
```

## 8.2 AbortController (Cancellation)

```javascript
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => {
        if (err.name === 'AbortError') {
            console.log('User cancelled');
        }
    });

// Cancel after 5 seconds, or when user clicks cancel
setTimeout(() => controller.abort(), 5000);
```

## 8.3 Semaphore (Limit Concurrency)

```javascript
class Semaphore {
    constructor(max) {
        this.max = max;
        this.running = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.running < this.max) {
            this.running++;
            return;
        }
        await new Promise(resolve => this.queue.push(resolve));
        this.running++;
    }

    release() {
        this.running--;
        if (this.queue.length) {
            const next = this.queue.shift();
            next();
        }
    }
}

// Usage: max 3 concurrent downloads
const semaphore = new Semaphore(3);

async function download(url) {
    await semaphore.acquire();
    try {
        return await fetch(url);
    } finally {
        semaphore.release();
    }
}
```

## 8.4 Circuit Breaker

Prevent cascading failures:

```javascript
class CircuitBreaker {
    constructor(request, { failureThreshold = 5, timeout = 60000 } = {}) {
        this.request = request;
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
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
            const result = await this.request(...args);
            this.onSuccess();
            return result;
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

---

# 🏆 Practice Lab

## Challenge 1: The Chain Fixer
Fix this code so it properly chains and returns the final user name:

```javascript
function getUserName(id) {
    return fetchUser(id)
        .then(user => {
            fetchProfile(user.id);
        })
        .then(profile => {
            return profile.name;
        });
}
```

<details>
<summary>✅ Solution</summary>

```javascript
function getUserName(id) {
    return fetchUser(id)
        .then(user => {
            return fetchProfile(user.id); // Added return!
        })
        .then(profile => {
            return profile.name;
        });
}
```

</details>

## Challenge 2: Parallel with Fallback
Fetch user, posts, and comments in parallel. If posts fail, use empty array. If comments fail, use empty array. User is required.

<details>
<summary>✅ Solution</summary>

```javascript
async function loadDashboard(userId) {
    const userPromise = fetchUser(userId);

    const [user, posts, comments] = await Promise.all([
        userPromise,
        fetchPosts(userId).catch(() => []),
        fetchComments(userId).catch(() => [])
    ]);

    return { user, posts, comments };
}
```

Note: We don't catch `userPromise` because user is required.

</details>

## Challenge 3: Rate-Limited Queue
Implement a function that processes an array of URLs with maximum 2 concurrent requests.

<details>
<summary>✅ Solution</summary>

```javascript
async function processUrls(urls, maxConcurrent = 2) {
    const results = [];

    async function worker(iterator) {
        for (const [index, url] of iterator) {
            try {
                const response = await fetch(url);
                results[index] = await response.json();
            } catch (err) {
                results[index] = { error: err.message };
            }
        }
    }

    const entries = urls.entries();
    const workers = Array(maxConcurrent).fill(entries).map(worker);
    await Promise.all(workers);

    return results;
}
```

</details>

---

# 📋 Cheat Sheet

```javascript
// Creation
new Promise((resolve, reject) => { ... })
Promise.resolve(value)
Promise.reject(error)

// Consumption
promise.then(onSuccess, onError)
promise.catch(onError)
promise.finally(onDone)

// Combination
Promise.all([p1, p2])           // All succeed or first fail
Promise.allSettled([p1, p2])    // All complete, never fails
Promise.race([p1, p2])          // First to settle (win or lose)
Promise.any([p1, p2])           // First to succeed

// async/await
async function fn() {
    try {
        const result = await promise;
        return result;
    } catch (err) {
        // handle
    }
}

// Remember
// 1. Always return in .then() if you have { }
// 2. Promise.all for parallel, for...of for sequential
// 3. .catch() catches ANY error above it in the chain
// 4. async functions always return Promises
// 5. Microtasks run before Macrotasks
```

---

*Built for learning. Read it twice, code it once. 🚀*
