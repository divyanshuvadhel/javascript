# JavaScript Higher-Order Functions

---

## Table of Contents
1. [What is a Higher-Order Function?](#1-what-is-a-higher-order-function)
2. [First-Class Functions: The Foundation](#2-first-class-functions-the-foundation)
3. [Functions as Arguments (Callbacks)](#3-functions-as-arguments-callbacks)
4. [Functions as Return Values (Closures)](#4-functions-as-return-values-closures)
5. [Built-in Higher-Order Functions](#5-built-in-higher-order-functions)
6. [Writing Your Own HOFs](#6-writing-your-own-hofs)
7. [Functional Programming Patterns](#7-functional-programming-patterns)
8. [Composition & Pipelines](#8-composition--pipelines)
9. [Pros & Cons](#9-pros--cons)
10. [Real-Life Use Cases](#10-real-life-use-cases)
11. [Common Pitfalls](#11-common-pitfalls)
12. [Interview Questions & Exercises](#12-interview-questions--exercises)
13. [Quick Reference Cheat Sheet](#13-quick-reference-cheat-sheet)

---

## 1. What is a Higher-Order Function?

> **A Higher-Order Function (HOF) is a function that either:**
> - **Takes one or more functions as arguments**, OR
> - **Returns a function as its result**

It treats functions as **first-class citizens** — meaning functions are values just like strings, numbers, or objects.

### Simple Example

```javascript
// Higher-Order Function: takes a function as argument
function execute(fn, value) {
  return fn(value);
}

// Regular function passed as argument
function double(x) {
  return x * 2;
}

execute(double, 5); // 10
```

### Why Does HOF Exist?

| Reason | Explanation |
|--------|-------------|
| **Abstraction** | Separate "what to do" from "how to do it" |
| **Reusability** | Write generic logic once, customize behavior via functions |
| **Declarative** | Say *what* you want, not *how* to iterate |
| **Composability** | Build complex logic by combining simple functions |
| **Immutability** | Prefer creating new data over mutating existing |

---

## 2. First-Class Functions: The Foundation

Before understanding HOFs, you must understand that **functions are first-class** in JavaScript.

### What Makes Functions First-Class?

```javascript
// 1. Assign to variables
const greet = function(name) {
  return `Hello, ${name}`;
};

// 2. Pass as arguments
function callWithName(fn) {
  return fn("Alice");
}
callWithName(greet); // "Hello, Alice"

// 3. Return from functions
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
const triple = createMultiplier(3);
triple(4); // 12

// 4. Store in data structures
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};
operations.add(2, 3); // 5

// 5. Have properties and methods
function example() {}
console.log(example.name); // "example"
console.log(example.length); // 0 (arity)
```

---

## 3. Functions as Arguments (Callbacks)

### The Classic Pattern

```javascript
function processArray(arr, callback) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i], i, arr));
  }
  return result;
}

// Usage
const numbers = [1, 2, 3, 4];

const doubled = processArray(numbers, x => x * 2);
// [2, 4, 6, 8]

const withIndex = processArray(numbers, (x, i) => `${i}: ${x}`);
// ["0: 1", "1: 2", "2: 3", "3: 4"]
```

### Why Use Callbacks?

| Scenario | Without HOF | With HOF |
|----------|-------------|----------|
| Double array | `for` loop + manual push | `map(x => x * 2)` |
| Filter adults | `for` loop + `if` | `filter(age => age >= 18)` |
| Sum values | `for` loop + accumulator | `reduce((sum, x) => sum + x, 0)` |
| Async operation | Nested callbacks | `fetch().then(callback)` |

### Callback Types

```javascript
// Synchronous callback
[1, 2, 3].map(x => x * 2); // Immediate execution

// Asynchronous callback
setTimeout(() => console.log("Later"), 1000); // Deferred execution

// Event callback
document.addEventListener("click", () => console.log("Clicked"));

// Error-first callback (Node.js style)
fs.readFile("file.txt", (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

---

## 4. Functions as Return Values (Closures)

When a HOF returns a function, it creates a **closure** — the returned function remembers the environment where it was created.

### Pattern: Function Factory

```javascript
function createValidator(min, max) {
  // Returns a function that "remembers" min and max
  return function(value) {
    return value >= min && value <= max;
  };
}

const isValidAge = createValidator(0, 120);
const isValidPercent = createValidator(0, 100);

isValidAge(25);      // true
isValidAge(150);     // false
isValidPercent(50);  // true
isValidPercent(101); // false
```

### Pattern: Decorator / Wrapper

```javascript
function withLogging(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name} with`, args);
    const result = fn.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
}

function add(a, b) {
  return a + b;
}

const loggedAdd = withLogging(add);
loggedAdd(2, 3);
// Calling add with [2, 3]
// Result: 5
```

---

## 5. Built-in Higher-Order Functions

### Array Methods (The Most Common HOFs)

```javascript
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 17, active: false },
  { name: "Carol", age: 30, active: true }
];

// map: Transform each element
const names = users.map(user => user.name);
// ["Alice", "Bob", "Carol"]

// filter: Keep elements that pass test
const adults = users.filter(user => user.age >= 18);
// [{Alice, 25}, {Carol, 30}]

// find: Get first matching element
const firstAdult = users.find(user => user.age >= 18);
// {Alice, 25}

// reduce: Accumulate to single value
const totalAge = users.reduce((sum, user) => sum + user.age, 0);
// 72

// some: Is ANY element true?
const hasMinors = users.some(user => user.age < 18);
// true

// every: Are ALL elements true?
const allActive = users.every(user => user.active);
// false

// sort: Reorder (mutates!)
const byAge = [...users].sort((a, b) => a.age - b.age);

// forEach: Side effects (returns undefined)
users.forEach(user => console.log(user.name));

// flatMap: map then flatten
const sentences = ["Hello world", "JS is fun"];
const words = sentences.flatMap(s => s.split(" "));
// ["Hello", "world", "JS", "is", "fun"]
```

### Object Methods

```javascript
const scores = { Alice: 95, Bob: 82, Carol: 91 };

// Object.entries + HOF pipeline
const topScorers = Object.entries(scores)
  .filter(([name, score]) => score >= 90)
  .map(([name, score]) => ({ name, score }));
// [{ name: "Alice", score: 95 }, { name: "Carol", score: 91 }]
```

### Promise Methods (Async HOFs)

```javascript
// Promise.then() — HOF that takes success/error callbacks
fetch("/api/users")
  .then(response => response.json())
  .then(data => data.filter(u => u.active))
  .catch(err => console.error(err));

// Promise.all() — HOF that takes array of promises
const urls = ["/api/a", "/api/b", "/api/c"];
Promise.all(urls.map(url => fetch(url)))
  .then(responses => console.log("All done!"));
```

---

## 6. Writing Your Own HOFs

### Generic `map`

```javascript
function map(array, transformFn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(transformFn(array[i], i, array));
  }
  return result;
}

map([1, 2, 3], x => x * 2); // [2, 4, 6]
```

### Generic `filter`

```javascript
function filter(array, predicateFn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicateFn(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}

filter([1, 2, 3, 4, 5], x => x % 2 === 0); // [2, 4]
```

### Generic `reduce`

```javascript
function reduce(array, reducerFn, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;

  if (initialValue === undefined) {
    accumulator = array[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < array.length; i++) {
    accumulator = reducerFn(accumulator, array[i], i, array);
  }

  return accumulator;
}

reduce([1, 2, 3, 4], (sum, x) => sum + x, 0); // 10
```

### Generic `pipe` (Left-to-Right Composition)

```javascript
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

const process = pipe(
  x => x + 1,
  x => x * 2,
  x => x.toString()
);

process(5); // "12"  ((5 + 1) * 2 = 12 → "12")
```

### Generic `compose` (Right-to-Left Composition)

```javascript
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

const process = compose(
  x => x.toString(),
  x => x * 2,
  x => x + 1
);

process(5); // "12"
```

### Generic `curry`

```javascript
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

const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); // 6
add(1, 2)(3); // 6
add(1)(2, 3); // 6
```

---

## 7. Functional Programming Patterns

### Pure Functions

```javascript
// Pure: same input → same output, no side effects
function pureAdd(a, b) {
  return a + b;
}

// Impure: has side effect
let total = 0;
function impureAdd(a) {
  total += a; // Mutates external state
  return total;
}
```

### Immutability with HOFs

```javascript
const todos = [
  { id: 1, text: "Learn HOFs", done: false },
  { id: 2, text: "Build app", done: false }
];

// Add todo (immutable)
const newTodos = [...todos, { id: 3, text: "Deploy", done: false }];

// Toggle todo (immutable)
const toggled = todos.map(todo =>
  todo.id === 1 ? { ...todo, done: !todo.done } : todo
);

// Remove todo (immutable)
const removed = todos.filter(todo => todo.id !== 2);
```

### Point-Free Style (Tacit Programming)

```javascript
// Not point-free
const getNames = users => users.map(user => user.name);

// Point-free (no explicit parameters)
const map = fn => array => array.map(fn);
const prop = key => obj => obj[key];
const getNames = map(prop("name"));

getNames(users); // ["Alice", "Bob", "Carol"]
```

---

## 8. Composition & Pipelines

### Data Processing Pipeline

```javascript
const pipeline = pipe(
  data => data.filter(user => user.active),
  data => data.map(user => ({ ...user, age: user.age + 1 })),
  data => data.sort((a, b) => b.age - a.age),
  data => data.map(user => `${user.name} (${user.age})`)
);

const result = pipeline(users);
// ["Carol (31)", "Alice (26)"]
```

### Async Pipeline

```javascript
const asyncPipe = (...fns) => x =>
  fns.reduce((p, fn) => p.then(fn), Promise.resolve(x));

const fetchUser = id => fetch(`/api/users/${id}`).then(r => r.json());
const extractName = user => user.name;
const toUpper = str => str.toUpperCase();

const getUserName = asyncPipe(fetchUser, extractName, toUpper);

getUserName(1).then(console.log); // "ALICE"
```

---

## 9. Pros & Cons

### ✅ Advantages

| Benefit | Description |
|---------|-------------|
| **Code Reusability** | Write generic utilities once, reuse everywhere |
| **Separation of Concerns** | Business logic separated from iteration/control flow |
| **Declarative Code** | Say *what* you want, not *how* to loop |
| **Immutability** | Encourages creating new data instead of mutation |
| **Testability** | Pure functions are easy to unit test |
| **Composability** | Build complex operations from simple building blocks |
| **Readability** | Chain operations read like a sentence |
| **Less Boilerplate** | No manual `for` loops, index tracking, or temp arrays |

### ❌ Disadvantages

| Drawback | Description |
|----------|-------------|
| **Performance** | Multiple iterations (map → filter → reduce) vs single loop |
| **Debugging** | Stack traces can be cryptic in long chains |
| **Memory** | Creating intermediate arrays at each step |
| **Learning Curve** | Functional concepts unfamiliar to imperative programmers |
| **Readability** | Over-chaining can become "write-only" code |
| **Side Effects** | Easy to accidentally create closures that leak memory |
| **This Context** | Arrow functions in callbacks can lose intended `this` |

### Performance Tip: Transducers

```javascript
// Bad: 3 iterations, 2 intermediate arrays
const result = array
  .map(x => x * 2)
  .filter(x => x > 10)
  .reduce((sum, x) => sum + x, 0);

// Good: Single iteration with reduce
const result = array.reduce((sum, x) => {
  const doubled = x * 2;
  return doubled > 10 ? sum + doubled : sum;
}, 0);
```

---

## 10. Real-Life Use Cases

### A. React: Higher-Order Components (HOCs)

```javascript
function withAuth(WrappedComponent) {
  return function(props) {
    const [isAuth, setIsAuth] = useState(false);

    if (!isAuth) return <LoginScreen />;
    return <WrappedComponent {...props} />;
  };
}

const Dashboard = () => <div>Admin Panel</div>;
const ProtectedDashboard = withAuth(Dashboard);
```

### B. Express.js: Middleware (HOF Pattern)

```javascript
function requireRole(role) {
  return function(req, res, next) {
    if (req.user.role !== role) {
      return res.status(403).send("Forbidden");
    }
    next();
  };
}

app.get("/admin", requireRole("admin"), (req, res) => {
  res.send("Admin area");
});
```

### C. Validation Pipelines

```javascript
const validate = pipe(
  value => value.trim(),
  value => value.length > 0 ? value : null,
  value => value && value.length >= 3 ? value : null,
  value => value && /^[a-zA-Z]+$/.test(value) ? value : null
);

validate("  Alice123  "); // null (fails regex)
validate("  Bob  ");      // "Bob"
```

### D. Redux: Store Enhancers

```javascript
const logger = store => next => action => {
  console.log("Dispatching:", action);
  const result = next(action);
  console.log("Next state:", store.getState());
  return result;
};

// applyMiddleware is a HOF
const store = createStore(reducer, applyMiddleware(logger, thunk));
```

### E. Testing: Mock & Spy Functions

```javascript
function createSpy() {
  const calls = [];

  function spy(...args) {
    calls.push(args);
    return args;
  }

  spy.getCalls = () => calls;
  spy.wasCalled = () => calls.length > 0;
  spy.wasCalledWith = (...expected) =>
    calls.some(call => call.every((arg, i) => arg === expected[i]));

  return spy;
}

const mySpy = createSpy();
mySpy(1, 2, 3);
mySpy("a", "b");
console.log(mySpy.getCalls()); // [[1,2,3], ["a","b"]]
```

### F. Event Stream Processing (RxJS Style)

```javascript
function createStream(initialValue) {
  let value = initialValue;
  const listeners = [];

  return {
    subscribe(fn) {
      listeners.push(fn);
      fn(value); // Emit initial
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx > -1) listeners.splice(idx, 1);
      };
    },
    map(transformFn) {
      return createStream(transformFn(value));
    },
    filter(predicateFn) {
      return predicateFn(value) ? createStream(value) : createStream(null);
    },
    next(newValue) {
      value = newValue;
      listeners.forEach(fn => fn(value));
    }
  };
}
```

### G. Database Query Builder

```javascript
function query(table) {
  let conditions = [];
  let limitVal = null;
  let orderVal = null;

  return {
    where(condition) {
      conditions.push(condition);
      return this;
    },
    limit(n) {
      limitVal = n;
      return this;
    },
    orderBy(field, dir = "ASC") {
      orderVal = { field, dir };
      return this;
    },
    execute(data) {
      let result = data.filter(row =>
        conditions.every(cond => cond(row))
      );
      if (orderVal) {
        result.sort((a, b) =>
          orderVal.dir === "ASC"
            ? a[orderVal.field] - b[orderVal.field]
            : b[orderVal.field] - a[orderVal.field]
        );
      }
      if (limitVal) result = result.slice(0, limitVal);
      return result;
    }
  };
}

const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Carol", age: 20 }
];

query("users")
  .where(u => u.age >= 20)
  .orderBy("age", "DESC")
  .limit(2)
  .execute(users);
// [{ name: "Bob", age: 30 }, { name: "Alice", age: 25 }]
```

---

## 11. Common Pitfalls

### Pitfall 1: Callback Hell (Pyramid of Doom)

```javascript
// BAD: Nested callbacks
doA(resultA => {
  doB(resultA, resultB => {
    doC(resultB, resultC => {
      doD(resultC, resultD => {
        console.log(resultD);
      });
    });
  });
});

// FIX: Promise chain (HOF)
doA()
  .then(resultA => doB(resultA))
  .then(resultB => doC(resultB))
  .then(resultC => doD(resultC))
  .then(resultD => console.log(resultD))
  .catch(err => console.error(err));

// FIX: async/await
async function run() {
  const a = await doA();
  const b = await doB(a);
  const c = await doC(b);
  const d = await doD(c);
  console.log(d);
}
```

### Pitfall 2: Mutating in `forEach`

```javascript
// BAD: forEach with side effects
let sum = 0;
[1, 2, 3].forEach(x => sum += x); // Mutates external variable

// GOOD: Use reduce (pure)
const sum = [1, 2, 3].reduce((acc, x) => acc + x, 0);
```

### Pitfall 3: Implicit Return Confusion

```javascript
// BAD: Implicit return with object literal needs parentheses
const users = names.map(name => { name }); // Returns undefined!

// GOOD: Wrap in parentheses
const users = names.map(name => ({ name }));

// Or explicit return
const users = names.map(name => {
  return { name };
});
```

### Pitfall 4: `this` Binding in Callbacks

```javascript
const obj = {
  value: 42,
  getValue() {
    // Arrow function preserves `this`
    setTimeout(() => console.log(this.value), 100); // 42

    // Regular function loses `this`
    setTimeout(function() {
      console.log(this.value); // undefined (window.value)
    }, 100);
  }
};
```

### Pitfall 5: Over-Chaining Readability

```javascript
// BAD: Too long, hard to debug
const result = data.filter(x => x.active).map(x => x.name).sort().join(", ").toUpperCase().split(", ").map(s => s.trim());

// GOOD: Break into named steps
const activeUsers = data.filter(x => x.active);
const names = activeUsers.map(x => x.name);
const sorted = names.sort();
const formatted = sorted.join(", ").toUpperCase();
const result = formatted.split(", ").map(s => s.trim());
```

---

## 12. Interview Questions & Exercises

### Exercise 1: Implement `map` from Scratch

Write a `map` function that behaves like `Array.prototype.map`.

```javascript
function myMap(array, callback) {
  // Your code here
}

myMap([1, 2, 3], x => x * 2); // [2, 4, 6]
```

<details>
<summary>Answer</summary>

```javascript
function myMap(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i], i, array));
  }
  return result;
}
```

</details>

---

### Exercise 2: Implement `filter` from Scratch

```javascript
function myFilter(array, predicate) {
  // Your code here
}

myFilter([1, 2, 3, 4, 5], x => x > 3); // [4, 5]
```

<details>
<summary>Answer</summary>

```javascript
function myFilter(array, predicate) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}
```

</details>

---

### Exercise 3: Implement `reduce` from Scratch

```javascript
function myReduce(array, reducer, initialValue) {
  // Your code here
}

myReduce([1, 2, 3, 4], (sum, x) => sum + x, 0); // 10
```

<details>
<summary>Answer</summary>

```javascript
function myReduce(array, reducer, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;

  if (initialValue === undefined) {
    accumulator = array[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < array.length; i++) {
    accumulator = reducer(accumulator, array[i], i, array);
  }

  return accumulator;
}
```

</details>

---

### Exercise 4: Implement `compose` and `pipe`

```javascript
const add1 = x => x + 1;
const double = x => x * 2;
const toString = x => String(x);

// compose: right to left
compose(toString, double, add1)(5); // "12" (5 + 1 = 6, 6 * 2 = 12, "12")

// pipe: left to right
pipe(add1, double, toString)(5); // "12"
```

<details>
<summary>Answer</summary>

```javascript
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}
```

</details>

---

### Exercise 5: Implement `once` HOF

Create a function that ensures another function can only be called once.

```javascript
const initialize = once(() => {
  console.log("Initialized!");
  return "done";
});

initialize(); // "Initialized!" → "done"
initialize(); // undefined (no execution)
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
```

</details>

---

### Exercise 6: Implement `memoize` HOF

```javascript
const fib = memoize(n => {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(10); // Computes
fib(10); // Instant (cached)
```

<details>
<summary>Answer</summary>

```javascript
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

</details>

---

### Exercise 7: Implement `debounce` HOF

```javascript
const debouncedSearch = debounce((query) => {
  console.log("Searching for:", query);
}, 300);

debouncedSearch("a");
debouncedSearch("ab");
debouncedSearch("abc"); // Only this executes after 300ms
```

<details>
<summary>Answer</summary>

```javascript
function debounce(fn, delay) {
  let timerId;

  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

</details>

---

### Exercise 8: Implement `throttle` HOF

```javascript
const throttledScroll = throttle(() => {
  console.log("Scroll event!");
}, 200);

// Called many times, but only executes once per 200ms
```

<details>
<summary>Answer</summary>

```javascript
function throttle(fn, limit) {
  let inThrottle = false;

  return function(...args) {
    if (inThrottle) return;

    fn.apply(this, args);
    inThrottle = true;
    setTimeout(() => inThrottle = false, limit);
  };
}
```

</details>

---

### Exercise 9: Implement `curry` HOF

```javascript
const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); // 6
add(1, 2)(3); // 6
add(1)(2, 3); // 6
```

<details>
<summary>Answer</summary>

```javascript
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
```

</details>

---

### Exercise 10: Implement `zipWith` HOF

Combine two arrays using a provided function.

```javascript
zipWith([1, 2, 3], [4, 5, 6], (a, b) => a + b); // [5, 7, 9]
zipWith(["a", "b"], ["c", "d"], (a, b) => a + b); // ["ac", "bd"]
```

<details>
<summary>Answer</summary>

```javascript
function zipWith(arr1, arr2, fn) {
  const length = Math.min(arr1.length, arr2.length);
  const result = [];

  for (let i = 0; i < length; i++) {
    result.push(fn(arr1[i], arr2[i]));
  }

  return result;
}
```

</details>

---

### Exercise 11: Implement `flatten` and `flatMap`

```javascript
flatten([1, [2, 3], [[4]]]); // [1, 2, 3, 4]
flatMap([1, 2, 3], x => [x, x * 2]); // [1, 2, 2, 4, 3, 6]
```

<details>
<summary>Answer</summary>

```javascript
function flatten(array, depth = Infinity) {
  return depth > 0
    ? array.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val),
      [])
    : array.slice();
}

function flatMap(array, fn) {
  return flatten(array.map(fn));
}
```

</details>

---

### Exercise 12: Implement `groupBy` HOF

```javascript
const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
  { name: "Carol", role: "admin" }
];

groupBy(users, user => user.role);
// {
//   admin: [{Alice, admin}, {Carol, admin}],
//   user: [{Bob, user}]
// }
```

<details>
<summary>Answer</summary>

```javascript
function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}
```

</details>

---

## 13. Quick Reference Cheat Sheet

### HOF Definition

```
Higher-Order Function = Function that:
  ├─ Takes a function as argument, OR
  └─ Returns a function as result
```

### Built-in Array HOFs

| Method | Input | Output | Use When |
|--------|-------|--------|----------|
| `map` | `(item, index, array) => newItem` | New array | Transform every element |
| `filter` | `(item, index, array) => boolean` | New array | Keep elements matching condition |
| `reduce` | `(acc, item, index, array) => newAcc` | Single value | Accumulate to one result |
| `find` | `(item, index, array) => boolean` | First match | Get single matching element |
| `some` | `(item, index, array) => boolean` | Boolean | Check if ANY match |
| `every` | `(item, index, array) => boolean` | Boolean | Check if ALL match |
| `sort` | `(a, b) => number` | Same array (mutates!) | Reorder elements |
| `forEach` | `(item, index, array) => void` | `undefined` | Side effects only |
| `flatMap` | `(item, index, array) => array` | New flat array | Map + flatten |

### Custom HOF Patterns

```javascript
// Callback HOF
function withCallback(fn, callback) {
  const result = fn();
  callback(result);
}

// Decorator HOF
function withLogging(fn) {
  return function(...args) {
    console.log("Calling", fn.name);
    return fn.apply(this, args);
  };
}

// Factory HOF
function createMultiplier(factor) {
  return x => x * factor;
}

// Composition HOF
function pipe(...fns) {
  return x => fns.reduce((v, fn) => fn(v), x);
}

function compose(...fns) {
  return x => fns.reduceRight((v, fn) => fn(v), x);
}

// Curry HOF
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...next) => curried(...args, ...next);
  };
}

// Memoize HOF
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Debounce HOF
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle HOF
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => inThrottle = false, limit);
  };
}
```

### Functional Programming Checklist

| Principle | Description |
|-----------|-------------|
| **Pure Functions** | Same input → same output, no side effects |
| **Immutability** | Don't mutate data; create new copies |
| **Composition** | Build complex logic from simple functions |
| **Declarative** | Describe *what*, not *how* |
| **First-Class Functions** | Functions are values |

---

## Key Takeaways

> 1. **Functions are values** — assign them, pass them, return them.
> 2. **HOFs abstract behavior** — separate iteration logic from business logic.
> 3. **Closures + HOFs = power** — returning functions that remember their birth environment.
> 4. **Array methods are HOFs** — `map`, `filter`, `reduce` are your daily tools.
> 5. **Composition over inheritance** — build pipelines instead of deep class hierarchies.
> 6. **Immutability is safer** — return new data instead of mutating existing.
> 7. **Readability matters** — don't over-chain; name your intermediate steps.
> 8. **Performance counts** — multiple HOF passes can be slower than a single loop.

---

*Master Higher-Order Functions and you unlock the true power of JavaScript's functional nature.*
