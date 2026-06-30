# JavaScript Closures — Deep Dive Guide

---

## Table of Contents
1. [What is a Closure?](#1-what-is-a-closure)
2. [How Closures Work Under the Hood](#2-how-closures-work-under-the-hood)
3. [Lexical Scope vs Dynamic Scope](#3-lexical-scope-vs-dynamic-scope)
4. [The Closure Lifecycle](#4-the-closure-lifecycle)
5. [Practical Patterns & Use Cases](#5-practical-patterns--use-cases)
6. [Common Pitfalls & Memory Leaks](#6-common-pitfalls--memory-leaks)
7. [Closures in Modern JS (ES6+)](#7-closures-in-modern-js-es6)
8. [Interview Questions & Exercises](#8-interview-questions--exercises)
9. [Quick Reference](#9-quick-reference)

---

## 1. What is a Closure?

> **A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).**

In other words, a closure gives you access to an outer function's scope from an inner function, **even after the outer function has finished executing**.

### Simple Example

```javascript
function outer() {
  let count = 0; // Outer variable

  function inner() {
    count++; // Inner function accesses outer variable
    console.log(count);
  }

  return inner;
}

const counter = outer(); // outer() executed and returned

counter(); // 1
counter(); // 2
counter(); // 3
```

**The magic:** `outer()` has finished running, but `count` is still alive because `counter` (the returned `inner` function) **closes over** it.

---

## 2. How Closures Work Under the Hood

### The Execution Context Model

```
┌─────────────────────────────────────────┐
│           Global Execution Context        │
│  ┌─────────────────────────────────┐    │
│  │      outer() Execution Context  │    │
│  │  Variables: count = 0            │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │  inner() Function Object │    │    │
│  │  │  [[Environment]] → outer  │    │    │
│  │  │  (Hidden internal link)    │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
│                                          │
│  counter = inner (returned reference)    │
└─────────────────────────────────────────┘
```

### Key Concepts

| Concept | Explanation |
|---------|-------------|
| **Lexical Environment** | The "scope" where a function is defined, not where it's called |
| **Environment Record** | Stores all variables and functions declared in the scope |
| **Outer Reference** | Hidden link `[[Environment]]` pointing to the parent scope |
| **Variable Object (VO)** | The actual object holding variable values in older JS engines |

### What Happens Step-by-Step

```javascript
function makeAdder(x) {
  // Step 1: makeAdder's Lexical Environment is created
  // x = 5 is stored in this environment

  return function(y) {
    // Step 2: This anonymous function's [[Environment]] 
    // points to makeAdder's environment
    // Step 3: When called, it looks up x in its outer scope
    return x + y;
  };
}

const add5 = makeAdder(5); // x = 5 is captured
console.log(add5(2)); // 7  (x=5 + y=2)
console.log(add5(10)); // 15 (x=5 + y=10)
```

**The captured variable `x` lives in memory as long as `add5` exists.**

---

## 3. Lexical Scope vs Dynamic Scope

### Lexical Scope (JavaScript uses this)

Scope is determined **at write time** (where the function is defined).

```javascript
const name = "Global";

function sayName() {
  console.log(name); // Looks up in lexical scope chain
}

function outer() {
  const name = "Outer";
  sayName(); // Still prints "Global"!
}

outer(); // "Global" — because sayName was defined in global scope
```

### Dynamic Scope (NOT JavaScript — e.g., Bash, Lisp)

Scope would be determined **at call time** (where the function is called).

```javascript
// Hypothetical dynamic scope (NOT JS):
function outer() {
  const name = "Outer";
  sayName(); // Would print "Outer" if JS had dynamic scope
}
```

### Why Lexical Scope Matters for Closures

```javascript
function createFunctions() {
  const funcs = [];

  for (var i = 0; i < 3; i++) {
    funcs.push(function() {
      console.log(i); // All closures share the SAME i
    });
  }

  return funcs;
}

const functions = createFunctions();
functions[0](); // 3 (not 0!)
functions[1](); // 3 (not 1!)
functions[2](); // 3 (not 2!)
```

**Why?** All three closures share the **same lexical environment** — the `createFunctions` scope where `var i` is hoisted and shared.

**Fix with `let` (block scope):**

```javascript
function createFunctions() {
  const funcs = [];

  for (let i = 0; i < 3; i++) { // let creates a new binding per iteration
    funcs.push(function() {
      console.log(i); // Each closure captures its own i
    });
  }

  return funcs;
}

const functions = createFunctions();
functions[0](); // 0
functions[1](); // 1
functions[2](); // 2
```

---

## 4. The Closure Lifecycle

### Phase 1: Creation

```javascript
function createCounter() {
  let count = 0; // Variable created in outer scope

  // Inner function is created with [[Environment]] pointing to outer
  return function() {
    return ++count;
  };
}
```

### Phase 2: Execution & Capture

```javascript
const counter = createCounter();
// createCounter's execution context is popped off the stack
// BUT its variable environment stays in memory because counter references it
```

### Phase 3: Garbage Collection

```javascript
counter = null; // Remove reference
// Now the closure's environment can be garbage collected
```

### Visual Timeline

```
Time →

T1: createCounter() called
    ├─ count = 0 created
    └─ inner function created with link to this environment

T2: createCounter() returns
    ├─ Execution context destroyed
    └─ Environment preserved (referenced by returned function)

T3: counter() called
    ├─ New execution context for inner function
    └─ Looks up count in preserved environment → count = 1

T4: counter() called again
    └─ Looks up count → count = 2

T5: counter = null
    └─ Environment no longer referenced → Garbage Collected
```

---

## 5. Practical Patterns & Use Cases

### Pattern 1: Data Privacy (Module Pattern)

```javascript
const bankAccount = (function() {
  // Private variables — inaccessible from outside
  let balance = 0;
  let transactionHistory = [];

  return {
    deposit(amount) {
      balance += amount;
      transactionHistory.push({ type: 'deposit', amount });
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error('Insufficient funds');
      balance -= amount;
      transactionHistory.push({ type: 'withdraw', amount });
      return balance;
    },
    getBalance() {
      return balance; // Read-only access
    },
    getHistory() {
      return [...transactionHistory]; // Return copy, not reference
    }
  };
})();

bankAccount.deposit(100);     // 100
bankAccount.withdraw(30);     // 70
console.log(bankAccount.balance); // undefined — private!
console.log(bankAccount.getBalance()); // 70
```

**Pros:** True encapsulation without classes.
**Cons:** Each instance creates new functions (memory overhead).

---

### Pattern 2: Factory Functions

```javascript
function createUser(name, role) {
  // Each user gets their own closure environment
  let loginCount = 0;
  let lastLogin = null;

  return {
    getName() {
      return name;
    },
    getRole() {
      return role;
    },
    login() {
      loginCount++;
      lastLogin = new Date();
      return `Welcome back, ${name}!`;
    },
    getStats() {
      return { loginCount, lastLogin };
    }
  };
}

const admin = createUser('Alice', 'admin');
const user = createUser('Bob', 'user');

admin.login(); // "Welcome back, Alice!"
user.login();  // "Welcome back, Bob!"

// Each has independent state
console.log(admin.getStats()); // { loginCount: 1, lastLogin: ... }
console.log(user.getStats());  // { loginCount: 1, lastLogin: ... }
```

---

### Pattern 3: Function Memoization

```javascript
function memoize(fn) {
  const cache = new Map(); // Closed over by returned function

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log('Cache hit!');
      return cache.get(key);
    }

    console.log('Computing...');
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize(function(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(10); // Computing... (many times)
fibonacci(10); // Cache hit! (instant)
fibonacci(11); // Uses cached results for fib(10), fib(9), etc.
```

---

### Pattern 4: Partial Application & Currying

```javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function multiply(a, b, c) {
  return a * b * c;
}

const multiplyBy5 = partial(multiply, 5);
const multiplyBy5And2 = partial(multiplyBy5, 2);

multiplyBy5And2(3); // 5 * 2 * 3 = 30

// Currying with closures
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const curriedAdd = curry((a, b, c) => a + b + c);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
```

---

### Pattern 5: Event Handlers & Callbacks

```javascript
function setupButton(buttonId, message) {
  const button = document.getElementById(buttonId);
  let clickCount = 0;

  button.addEventListener('click', function() {
    clickCount++;
    console.log(`${message} (clicked ${clickCount} times)`);
  });
}

setupButton('btn1', 'Hello from Button 1');
setupButton('btn2', 'Hello from Button 2');

// Each button has its own independent clickCount
```

---

### Pattern 6: Iterators with State

```javascript
function createRangeIterator(start, end) {
  let current = start;

  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { done: true };
    },
    [Symbol.iterator]() {
      return this;
    }
  };
}

const range = createRangeIterator(1, 3);
console.log(range.next()); // { value: 1, done: false }
console.log(range.next()); // { value: 2, done: false }
console.log(range.next()); // { value: 3, done: false }
console.log(range.next()); // { done: true }
```

---

### Pattern 7: Rate Limiting / Throttling

```javascript
function throttle(fn, limit) {
  let inThrottle = false;
  let lastArgs = null;
  let lastThis = null;

  return function(...args) {
    if (inThrottle) {
      lastArgs = args;
      lastThis = this;
      return;
    }

    fn.apply(this, args);
    inThrottle = true;

    setTimeout(() => {
      inThrottle = false;
      if (lastArgs) {
        fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
      }
    }, limit);
  };
}

const throttledScroll = throttle(() => {
  console.log('Scroll event handled');
}, 200);

window.addEventListener('scroll', throttledScroll);
```

---

## 6. Common Pitfalls & Memory Leaks

### Pitfall 1: Accidental Global Variables in Closures

```javascript
function createLeak() {
  const hugeData = new Array(1000000).fill('x'); // 1MB array

  return function() {
    console.log('I exist');
    // hugeData is captured but never used!
  };
}

const leaky = createLeak();
// hugeData stays in memory forever because leaky references it
```

**Fix:** Nullify unused variables or restructure.

```javascript
function createNoLeak() {
  const hugeData = new Array(1000000).fill('x');
  processData(hugeData); // Use it immediately

  // Return function that doesn't reference hugeData
  return function() {
    console.log('I exist');
  };
}
```

---

### Pitfall 2: Closures in Loops (The Classic)

```javascript
// WRONG: All timeouts share the same i
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i); // All print 5
  }, 100);
}

// SOLUTION 1: IIFE (pre-ES6)
for (var i = 0; i < 5; i++) {
  (function(capturedI) {
    setTimeout(function() {
      console.log(capturedI); // 0, 1, 2, 3, 4
    }, 100);
  })(i);
}

// SOLUTION 2: let (ES6+)
for (let i = 0; i < 5; i++) { // Each iteration gets new binding
  setTimeout(function() {
    console.log(i); // 0, 1, 2, 3, 4
  }, 100);
}

// SOLUTION 3: forEach (functional)
[0, 1, 2, 3, 4].forEach(function(i) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2, 3, 4
  }, 100);
});
```

---

### Pitfall 3: Event Listeners Accumulation

```javascript
function attachListeners() {
  for (let i = 0; i < 100; i++) {
    const element = document.createElement('div');
    const data = new Array(100000).fill(i); // Big data per element

    element.addEventListener('click', function() {
      console.log('Clicked:', i);
      // data is captured but never used!
    });

    document.body.appendChild(element);
  }
}

// Even after removing elements, closures may keep data alive
```

**Fix:** Use WeakMap or clean up properly.

```javascript
const elementData = new WeakMap();

function attachListenersFixed() {
  for (let i = 0; i < 100; i++) {
    const element = document.createElement('div');
    const data = new Array(100000).fill(i);

    elementData.set(element, data); // Data is GC'd when element is removed

    element.addEventListener('click', function() {
      const d = elementData.get(this);
      console.log('Clicked:', i, 'Data length:', d.length);
    });

    document.body.appendChild(element);
  }
}
```

---

### Pitfall 4: `this` Context Loss in Closures

```javascript
const obj = {
  name: 'Alice',
  greet() {
    setTimeout(function() {
      console.log('Hello, ' + this.name); // undefined! this = window
    }, 100);
  }
};

// FIX: Arrow function (lexical this)
const obj = {
  name: 'Alice',
  greet() {
    setTimeout(() => {
      console.log('Hello, ' + this.name); // "Hello, Alice"
    }, 100);
  }
};

// FIX: Bind
const obj = {
  name: 'Alice',
  greet() {
    setTimeout(function() {
      console.log('Hello, ' + this.name);
    }.bind(this), 100);
  }
};
```

---

## 7. Closures in Modern JS (ES6+)

### Block Scope with `let` and `const`

```javascript
function demo() {
  if (true) {
    let blockVar = 'I am block scoped';
    const blockConst = 'Me too';

    // Closure captures block scope, not function scope
    setTimeout(() => console.log(blockVar), 100);
  }
  // blockVar is not accessible here
}
```

---

### Closures in Arrow Functions

```javascript
const obj = {
  value: 42,
  createGetter: () => {
    // Arrow function captures `this` from outer scope (not obj!)
    return () => this.value; // this = window/global, not obj
  }
};

// Better approach:
const obj = {
  value: 42,
  createGetter() {
    // Regular method, this = obj
    return () => this.value; // Arrow captures this from createGetter
  }
};

const getter = obj.createGetter();
getter(); // 42
```

---

### Closures with Classes

```javascript
class Counter {
  #count = 0; // Private field (newer syntax)

  constructor() {
    // Closure-based private method
    const increment = () => {
      this.#count++;
      return this.#count;
    };

    this.next = increment; // Expose via closure
  }

  getCount() {
    return this.#count;
  }
}

const c = new Counter();
c.next(); // 1
c.next(); // 2
console.log(c.getCount()); // 2
console.log(c.#count); // SyntaxError: Private field
```

---

### Async/Await with Closures

```javascript
function createAsyncTaskManager() {
  const tasks = [];
  let isRunning = false;

  return {
    add(task) {
      tasks.push(task);
    },
    async run() {
      if (isRunning) return;
      isRunning = true;

      for (const task of tasks) {
        await task(); // Each task closure has access to shared state
      }

      isRunning = false;
      tasks.length = 0; // Clear array
    }
  };
}

const manager = createAsyncTaskManager();
manager.add(async () => { console.log('Task 1'); });
manager.add(async () => { console.log('Task 2'); });
await manager.run();
```

---

## 8. Interview Questions & Exercises

### Exercise 1: Predict Output

```javascript
function outer() {
  let a = 1;

  function inner() {
    console.log(a);
    a++;
  }

  return inner;
}

const fn1 = outer();
const fn2 = outer();

fn1(); // ?
fn1(); // ?
fn2(); // ?
fn1(); // ?
```

<details>
<summary>Answer</summary>

```
1  (fn1's a = 1, then increments to 2)
2  (fn1's a = 2, then increments to 3)
1  (fn2's a = 1, separate closure!)
3  (fn1's a = 3, then increments to 4)
```

**Key Point:** Each call to `outer()` creates a **new** lexical environment. `fn1` and `fn2` have independent `a` variables.

</details>

---

### Exercise 2: Closure + Hoisting Trap

```javascript
var funcs = [];

for (var i = 0; i < 3; i++) {
  funcs[i] = function() {
    return i * i;
  };
}

console.log(funcs[0]()); // ?
console.log(funcs[1]()); // ?
console.log(funcs[2]()); // ?
```

<details>
<summary>Answer</summary>

```
9
9
9
```

All functions share the **same** `i` from the loop. After the loop, `i = 3`. So all return `3 * 3 = 9`.

**Fix:** Use `let` instead of `var` to create a new binding per iteration.

</details>

---

### Exercise 3: Implement Private Counter

Create a counter that:
- Has private count
- Methods: `increment()`, `decrement()`, `getValue()`, `reset()`
- Cannot be modified directly from outside

<details>
<summary>Answer</summary>

```javascript
function createPrivateCounter(initial = 0) {
  let count = initial;

  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    },
    reset() {
      count = initial;
      return count;
    }
  };
}

const counter = createPrivateCounter(10);
counter.increment(); // 11
counter.increment(); // 12
console.log(counter.getValue()); // 12
counter.decrement(); // 11
console.log(counter.count); // undefined (private!)
```

</details>

---

### Exercise 4: Implement Once Function

Create a function that ensures another function can only be called once.

```javascript
const initialize = once(() => {
  console.log('Initialized!');
  return 'done';
});

initialize(); // "Initialized!" → "done"
initialize(); // undefined (no log, no execution)
initialize(); // undefined
```

<details>
<summary>Answer</summary>

```javascript
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (called) return result;

    called = true;
    result = fn.apply(this, args);
    return result;
  };
}

// Test
const initialize = once(() => {
  console.log('Initialized!');
  return 'done';
});

initialize(); // "Initialized!" → "done"
initialize(); // "done" (cached result)
```

</details>

---

### Exercise 5: Implement Function Composition

```javascript
const add5 = x => x + 5;
const multiply2 = x => x * 2;
const subtract3 = x => x - 3;

const composed = compose(subtract3, multiply2, add5);
composed(10); // ((10 + 5) * 2) - 3 = 27
```

<details>
<summary>Answer</summary>

```javascript
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// Or with arrow functions
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// Test
const add5 = x => x + 5;
const multiply2 = x => x * 2;
const subtract3 = x => x - 3;

const composed = compose(subtract3, multiply2, add5);
composed(10); // 27
```

</details>

---

### Exercise 6: Implement Cache with TTL

Create a memoization function where cached values expire after a certain time.

```javascript
const memoized = memoizeWithTTL((x) => {
  console.log('Computing...');
  return x * x;
}, 2000); // 2 second TTL

memoized(5); // "Computing..." → 25
memoized(5); // 25 (from cache)
// ...wait 2 seconds...
memoized(5); // "Computing..." → 25 (cache expired)
```

<details>
<summary>Answer</summary>

```javascript
function memoizeWithTTL(fn, ttlMs) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.time < ttlMs) {
      return cached.value;
    }

    const result = fn.apply(this, args);
    cache.set(key, { value: result, time: Date.now() });
    return result;
  };
}

// Test
const slowSquare = memoizeWithTTL((x) => {
  console.log('Computing...');
  return x * x;
}, 2000);

slowSquare(5); // "Computing..." → 25
slowSquare(5); // 25 (cached)
```

</details>

---

### Exercise 7: Implement Module Pattern with Revealing Module

Create a module for a simple calculator with:
- Private current value
- Methods: add, subtract, multiply, divide, getResult, clear
- No direct access to internal value

<details>
<summary>Answer</summary>

```javascript
const Calculator = (function() {
  let result = 0;

  function validate(num) {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new Error('Invalid number');
    }
  }

  return {
    add(num) {
      validate(num);
      result += num;
      return this; // For chaining
    },
    subtract(num) {
      validate(num);
      result -= num;
      return this;
    },
    multiply(num) {
      validate(num);
      result *= num;
      return this;
    },
    divide(num) {
      validate(num);
      if (num === 0) throw new Error('Cannot divide by zero');
      result /= num;
      return this;
    },
    getResult() {
      return result;
    },
    clear() {
      result = 0;
      return this;
    }
  };
})();

Calculator.add(10).multiply(2).subtract(5).getResult(); // 15
```

</details>

---

## 9. Quick Reference

### Closure Checklist

| Question | Answer |
|----------|--------|
| What creates a closure? | A function defined inside another function that references outer variables |
| When does the closure capture variables? | At function definition time (lexical scope) |
| What happens to outer variables? | They stay alive as long as the inner function exists |
| Can you modify captured variables? | Yes, closures have live references, not snapshots |
| Do all inner functions create closures? | Only if they reference outer scope variables |

### Closure vs Scope Comparison

| Feature | Scope | Closure |
|---------|-------|---------|
| Lifetime | Function execution | As long as reference exists |
| Accessibility | During function run | After outer function returns |
| Variables | Temporary | Persisted in memory |
| Purpose | Organize code | Data privacy, state persistence |

### Common Patterns at a Glance

```javascript
// Module Pattern
const module = (function() { /* private */ return { /* public */ }; })();

// Factory Function
function factory(params) { let state; return { methods }; }

// Memoization
function memoize(fn) { const cache = new Map(); return (...args) => { /* cache logic */ }; }

// Partial Application
function partial(fn, ...preset) { return (...later) => fn(...preset, ...later); }

// Throttle/Debounce
function throttle(fn, limit) { let inThrottle; return (...args) => { /* timing logic */ }; }
```

---

## Key Takeaways

> 1. **Closures are automatic** — every inner function that references outer variables is a closure.
> 2. **Lexical scope is king** — where a function is written determines what it can access.
> 3. **Variables are live, not copied** — closures reference the actual variable, not a snapshot.
> 4. **Memory matters** — captured variables stay alive until the closure is garbage collected.
> 5. **Use closures for privacy** — they are JavaScript's original mechanism for encapsulation.
> 6. **Beware of loops** — `var` in loops creates shared closures; use `let` or IIFE.
> 7. **Arrow functions preserve `this`** — combine with closures for clean async code.

---

*Master closures and you master JavaScript.*
