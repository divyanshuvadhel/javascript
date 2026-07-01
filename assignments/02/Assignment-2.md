# Phase 1 JavaScript Practice Questions & Exercises

> **Goal:** Do not proceed to Phase 2 until you can confidently solve **80%** of these without looking at the answers.

---

## Table of Contents
1. [Basics (Syntax & Building Blocks)](#1-basics-syntax--building-blocks)
2. [Core Concepts](#2-core-concepts)
3. [DOM & Browser Basics](#3-dom--browser-basics)
4. [Asynchronous JavaScript](#4-asynchronous-javascript)
5. [Modern JS / ES6+](#5-modern-js--es6)
6. [Working with Data](#6-working-with-data)
7. [Tooling & Ecosystem](#7-tooling--ecosystem)
8. [LeetCode Problem Set (Phase 1)](#8-leetcode-problem-set-phase-1)
9. [Mini Projects (Putting It All Together)](#9-mini-projects-putting-it-all-together)

---

## 1. Basics (Syntax & Building Blocks)

### Variables, Data Types & Operators
**Q1.** What is the output of the following? Explain why.
```js
console.log(typeof null);
console.log(typeof undefined);
console.log(null == undefined);
console.log(null === undefined);
```

**Q2.** What will `console.log(a)` print and why?
```js
var a = 1;
let b = 2;
const c = 3;
{
  var a = 10;
  let b = 20;
  const c = 30;
  console.log(a, b, c);
}
console.log(a, b, c);
```

**Q3.** What is the difference between `==` and `===`? Give three examples where `==` produces unexpected results.

**Q4.** Predict the output:
```js
console.log(1 + "2" + "2");
console.log(1 + +"2" + "2");
console.log(1 + -"1" + "0");
console.log(+"");
console.log(1 < 2 < 3);
console.log(3 > 2 > 1);
```

### Conditionals & Loops
**Q5.** Rewrite the following using a `switch` statement, then rewrite it again using an object lookup (no `if` or `switch`).
```js
function getDayName(dayNum) {
  if (dayNum === 1) return "Monday";
  else if (dayNum === 2) return "Tuesday";
  else if (dayNum === 3) return "Wednesday";
  else return "Invalid";
}
```

**Q6.** Write a `for` loop that prints all prime numbers from 2 to 50. Then rewrite it using a `while` loop.

**Q7.** What is the output? Explain.
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```
How would you fix it to print `0, 1, 2` using:
- `let`?
- An IIFE (immediately invoked function expression)?

### Functions
**Q8.** What are the differences between function declarations, function expressions, and arrow functions? List at least **3 differences**.

**Q9.** What is logged?
```js
const obj = {
  name: "Alice",
  greet: function() { console.log("Hello, " + this.name); },
  arrowGreet: () => { console.log("Hello, " + this.name); }
};
obj.greet();
obj.arrowGreet();
const fn = obj.greet;
fn();
```

**Q10.** Write a function `multiply(a)(b)` that returns `a * b` (currying). It should also work if called as `multiply(a, b)`.

### Arrays & Array Methods
**Q11.** Without using `.map()`, implement your own `myMap` function that behaves identically.

**Q12.** Given `const users = [{name: "A", age: 25}, {name: "B", age: 30}, {name: "C", age: 25}]`, use `filter`, `map`, and `reduce` to:
- Get all users older than 25.
- Get an array of just the names.
- Calculate the average age.

**Q13.** What is the output?
```js
const arr = [1, 2, 3];
arr[10] = 10;
console.log(arr.length);
console.log(arr);
console.log(arr[5]);
```

**Q14.** Implement `flatten` that takes `[1, [2, [3, [4]], 5]]` and returns `[1, 2, 3, 4, 5]` (recursive and iterative versions).

### Objects
**Q15.** What is the difference between `Object.create()`, object literals (`{}`), and constructor functions?

**Q16.** Write a function `deepEqual(a, b)` that checks if two objects are deeply equal (values and structure, not reference).

**Q17.** Given:
```js
const obj = { a: 1, b: { c: 2 } };
const copy = { ...obj };
copy.b.c = 3;
console.log(obj.b.c);
```
What is logged? How do you create a true deep copy?

---

## 2. Core Concepts

### Scope & Scope Chain
**Q18.** What is logged and why?
```js
let x = 10;
function outer() {
  console.log(x);
  let x = 20;
  function inner() {
    console.log(x);
  }
  inner();
}
outer();
```

**Q19.** Explain the difference between **lexical scope** and **dynamic scope**. Which one does JavaScript use?

### Hoisting
**Q20.** What is logged in each case?
```js
// Case 1
console.log(foo);
var foo = 1;

// Case 2
console.log(bar);
let bar = 1;

// Case 3
function test() {
  console.log(baz);
  var baz = 2;
}
test();
```

**Q21.** Are function declarations hoisted? Are function expressions hoisted? Prove it with code.

### The `this` Keyword
**Q22.** What is the output in each case?
```js
const person = {
  name: "John",
  sayHi: function() { console.log(this.name); }
};

person.sayHi();
const hi = person.sayHi;
hi();

const boundHi = person.sayHi.bind({ name: "Jane" });
boundHi();
```

**Q23.** In strict mode, what does `this` refer to inside a regular function called without a context?

### Closures
**Q24.** What is a closure? Write a function `createCounter()` that returns an object with `increment`, `decrement`, and `getValue` methods, using a closure to keep the count private.

**Q25.** What is logged?
```js
for (var i = 0; i < 3; i++) {
  setTimeout((function(i) {
    return function() { console.log(i); };
  })(i), 100);
}
```

### Higher-Order Functions
**Q26.** Write a function `compose` that takes multiple functions and returns a new function that is the composition of those functions.
```js
const add5 = x => x + 5;
const multiply2 = x => x * 2;
const composed = compose(add5, multiply2); // (x * 2) + 5
composed(10); // 25
```

**Q27.** Implement a `memoize` function that caches the results of expensive function calls.

---

## 3. DOM & Browser Basics

**Q28.** What is the difference between `document.querySelector`, `document.getElementById`, and `document.getElementsByClassName`? What do they return?

**Q29.** Explain event delegation. Write code that adds a single event listener to a `<ul>` and logs which `<li>` was clicked, even if new `<li>` elements are added dynamically.

**Q30.** What is the difference between `event.target` and `event.currentTarget`?

**Q31.** Write a function `createElement(tag, attributes, children)` that creates a DOM element, sets attributes, appends children, and returns the element.

**Q32.** Explain the difference between `event.preventDefault()`, `event.stopPropagation()`, and `return false` in jQuery vs vanilla JS.

**Q33.** Given a form with inputs, write code that validates the form on submit (checks for empty fields, valid email format) and prevents submission if invalid.

**Q34.** What are `data-*` attributes? Write code that reads and writes a `data-user-id` attribute on a div.

---

## 4. Asynchronous JavaScript

### Callbacks
**Q35.** What is "callback hell"? Convert the following nested callbacks into a cleaner pattern using Promises.
```js
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      console.log(c);
    });
  });
});
```

### Promises
**Q36.** What is logged and in what order?
```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

**Q37.** Implement `Promise.all` from scratch. It should take an array of promises and return a single promise that resolves with an array of results or rejects if any promise rejects.

**Q38.** What is the difference between `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`? Give a use case for each.

### Async/Await
**Q39.** Convert the following Promise chain to `async/await` with proper error handling.
```js
fetch("https://api.example.com/data")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Q40.** Write an async function `fetchWithRetry(url, retries)` that fetches data and retries up to `retries` times if it fails, with a 1-second delay between retries.

### Event Loop
**Q41.** Explain the JavaScript event loop in your own words. What is the difference between the **call stack**, the **microtask queue**, and the **macrotask (callback) queue**?

**Q42.** Predict the output in order:
```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => {
  console.log("C");
  Promise.resolve().then(() => console.log("D"));
});
console.log("E");
```

---

## 5. Modern JS / ES6+

### Destructuring, Spread/Rest
**Q43.** Given `const user = { id: 1, name: "Alice", address: { city: "NYC" }, hobbies: ["reading", "gaming"] }`, use destructuring to extract:
- `id` and `name`
- `city` (from address)
- The first hobby into `firstHobby` and the rest into `otherHobbies`

**Q44.** What is the difference between `...rest` in function parameters and `...spread` in array/object literals? Give examples.

**Q45.** Write a function `mergeObjects` that takes any number of objects and merges them into one, with later objects overwriting earlier ones. Use rest parameters and spread.

### Template Literals
**Q46.** Rewrite using template literals:
```js
const name = "World";
const greeting = "Hello, " + name + "!\nWelcome to "JS".";
```

**Q47.** Write a tagged template literal function `highlight` that wraps interpolated values in `<strong>` tags.
```js
highlight`Hello ${name}, you have ${count} messages.`;
// "Hello <strong>Alice</strong>, you have <strong>5</strong> messages."
```

### Modules
**Q48.** What is the difference between `export default` and named `export`? How do you import them?

**Q49.** What is the difference between `import { foo } from './module.js'` and `import * as module from './module.js'`?

**Q50.** What are circular dependencies in modules? How can you avoid them?

### Classes & Prototypes
**Q51.** What is the difference between a JavaScript "class" (ES6) and a constructor function? What do they share under the hood?

**Q52.** Create a `Shape` class with a method `getArea()`. Create `Rectangle` and `Circle` classes that extend `Shape` and override `getArea()`.

**Q53.** What is the difference between `__proto__` and `prototype`?

**Q54.** How does `Object.setPrototypeOf()` differ from changing `__proto__` directly? Why is it generally discouraged to change prototypes after object creation?

---

## 6. Working with Data

### Fetch / APIs
**Q55.** Write a function `fetchUsers()` that fetches user data from `https://jsonplaceholder.typicode.com/users`, handles errors, and returns an array of user names.

**Q56.** What is the difference between `fetch` and `XMLHttpRequest`? What are the advantages of `fetch`?

**Q57.** How do you abort a `fetch` request? Write an example using `AbortController`.

### JSON
**Q58.** What is the difference between `JSON.stringify()` and `JSON.parse()`? What happens if you try to `JSON.stringify` an object with a circular reference?

**Q59.** How do you customize `JSON.stringify()` to exclude certain properties or transform values during serialization?

### Error Handling
**Q60.** What is the difference between `throw new Error("msg")` and `return new Error("msg")`?

**Q61.** Write a robust wrapper function `safeParseJSON(str)` that tries to parse a string as JSON and returns `{ success: true, data: ... }` or `{ success: false, error: ... }` without throwing.

**Q62.** What is the difference between synchronous errors and asynchronous errors? Can you catch an async error with a regular `try/catch`? Show how to properly handle async errors.

---

## 7. Tooling & Ecosystem

**Q63.** What is `npm`? What is the difference between `npm install`, `npm install --save`, and `npm install --save-dev`? (Note: in modern npm, `--save` is default.)

**Q64.** What is the purpose of `package.json`? What happens if you delete `node_modules` but keep `package.json`?

**Q65.** What is the difference between `dependencies` and `devDependencies` in `package.json`?

**Q66.** What is `package-lock.json`? Why should it be committed to version control?

**Q67.** What is the difference between CommonJS (`require/module.exports`) and ES Modules (`import/export`)? Can you use both in the same Node.js file?

**Q68.** Write a simple Node.js script that reads a file `data.txt` asynchronously and prints its contents to the console.

**Q69.** What is `npx`? When would you use it instead of `npm install -g`?

**Q70.** What is a `transpiler` (e.g., Babel)? Why do we need it if modern browsers support ES6+?

---

## 8. LeetCode Problem Set (Phase 1)

These problems reinforce the fundamentals above. Solve them in JavaScript. Do **not** use built-in methods that make the problem trivial unless specified.

### Easy (Start Here)
| # | Problem | Topic | Link |
|---|---------|-------|------|
| 1 | Two Sum | Arrays, Hash Map | https://leetcode.com/problems/two-sum/ |
| 9 | Palindrome Number | Math, Strings | https://leetcode.com/problems/palindrome-number/ |
| 13 | Roman to Integer | Strings, Hash Map | https://leetcode.com/problems/roman-to-integer/ |
| 14 | Longest Common Prefix | Strings | https://leetcode.com/problems/longest-common-prefix/ |
| 20 | Valid Parentheses | Stack, Strings | https://leetcode.com/problems/valid-parentheses/ |
| 21 | Merge Two Sorted Lists | Linked List | https://leetcode.com/problems/merge-two-sorted-lists/ |
| 26 | Remove Duplicates from Sorted Array | Arrays, Two Pointers | https://leetcode.com/problems/remove-duplicates-from-sorted-array/ |
| 27 | Remove Element | Arrays, Two Pointers | https://leetcode.com/problems/remove-element/ |
| 35 | Search Insert Position | Arrays, Binary Search | https://leetcode.com/problems/search-insert-position/ |
| 66 | Plus One | Arrays, Math | https://leetcode.com/problems/plus-one/ |
| 88 | Merge Sorted Array | Arrays, Two Pointers | https://leetcode.com/problems/merge-sorted-array/ |
| 118 | Pascal's Triangle | Arrays | https://leetcode.com/problems/pascals-triangle/ |
| 121 | Best Time to Buy and Sell Stock | Arrays, Sliding Window | https://leetcode.com/problems/best-time-to-buy-and-sell-stock/ |
| 125 | Valid Palindrome | Strings, Two Pointers | https://leetcode.com/problems/valid-palindrome/ |
| 136 | Single Number | Arrays, Bit Manipulation | https://leetcode.com/problems/single-number/ |
| 169 | Majority Element | Arrays, Hash Map | https://leetcode.com/problems/majority-element/ |
| 217 | Contains Duplicate | Arrays, Hash Set | https://leetcode.com/problems/contains-duplicate/ |
| 242 | Valid Anagram | Strings, Hash Map | https://leetcode.com/problems/valid-anagram/ |
| 268 | Missing Number | Arrays, Math | https://leetcode.com/problems/missing-number/ |
| 283 | Move Zeroes | Arrays, Two Pointers | https://leetcode.com/problems/move-zeroes/ |
| 344 | Reverse String | Strings, Two Pointers | https://leetcode.com/problems/reverse-string/ |
| 350 | Intersection of Two Arrays II | Arrays, Hash Map | https://leetcode.com/problems/intersection-of-two-arrays-ii/ |
| 509 | Fibonacci Number | Recursion, DP | https://leetcode.com/problems/fibonacci-number/ |
| 704 | Binary Search | Arrays, Binary Search | https://leetcode.com/problems/binary-search/ |
| 977 | Squares of a Sorted Array | Arrays, Two Pointers | https://leetcode.com/problems/squares-of-a-sorted-array/ |

### Medium (Once Easy feels comfortable)
| # | Problem | Topic | Link |
|---|---------|-------|------|
| 3 | Longest Substring Without Repeating Characters | Sliding Window, Hash Set | https://leetcode.com/problems/longest-substring-without-repeating-characters/ |
| 11 | Container With Most Water | Arrays, Two Pointers | https://leetcode.com/problems/container-with-most-water/ |
| 15 | 3Sum | Arrays, Two Pointers | https://leetcode.com/problems/3sum/ |
| 49 | Group Anagrams | Strings, Hash Map | https://leetcode.com/problems/group-anagrams/ |
| 53 | Maximum Subarray | Arrays, Kadane's Algorithm | https://leetcode.com/problems/maximum-subarray/ |
| 75 | Sort Colors | Arrays, Two Pointers | https://leetcode.com/problems/sort-colors/ |
| 238 | Product of Array Except Self | Arrays, Prefix/Suffix | https://leetcode.com/problems/product-of-array-except-self/ |
| 271 | Encode and Decode Strings | Strings, Design | https://leetcode.com/problems/encode-and-decode-strings/ |
| 347 | Top K Frequent Elements | Arrays, Hash Map, Heap | https://leetcode.com/problems/top-k-frequent-elements/ |
| 424 | Longest Repeating Character Replacement | Sliding Window | https://leetcode.com/problems/longest-repeating-character-replacement/ |

### JavaScript-Specific Coding Challenges (No LeetCode #)
These are classic interview questions to test your Phase 1 knowledge:

1. **Implement Array.prototype.map** — Write your own `map` function without using the built-in.
2. **Implement Array.prototype.filter** — Same as above.
3. **Implement Array.prototype.reduce** — Same as above.
4. **Deep Clone** — Write a function that creates a deep copy of an object (handle nested objects, arrays, and circular references).
5. **Debounce** — Implement `debounce(fn, delay)` that delays calling `fn` until `delay` ms have passed since the last call.
6. **Throttle** — Implement `throttle(fn, limit)` that ensures `fn` is called at most once every `limit` ms.
7. **Promise.all** — Implement it from scratch (see Q37).
8. **Flatten Array** — Write a function to flatten an array of arbitrarily nested arrays.
9. **Curry** — Implement a `curry` function that converts `f(a,b,c)` into `f(a)(b)(c)`.
10. **Memoize** — Implement a memoization function (see Q27).

---

## 9. Mini Projects (Putting It All Together)

Build these **without tutorials** to prove you understand Phase 1:

### Project 1: Interactive To-Do List
- Add, delete, and mark tasks as complete.
- Store tasks in `localStorage` so they persist on reload.
- Use DOM manipulation, event delegation, and array methods.

### Project 2: Weather Dashboard
- Use the browser's `fetch` API to get weather data from a public API (e.g., OpenWeatherMap or a free alternative).
- Handle loading states, errors, and display the data dynamically.
- Use `async/await`, template literals, and destructuring.

### Project 3: Quiz App
- Display multiple-choice questions from an array of objects.
- Track score, show a progress bar, and display results at the end.
- Use higher-order functions, closures, and modular code (separate into multiple files using ES Modules).

### Project 4: Form Validator
- Create a registration form with validation for email, password strength, and matching passwords.
- Show real-time error messages.
- Use regular expressions, event handling, and DOM manipulation.

### Project 5: Node.js CLI Tool
- Create a simple command-line tool that reads a JSON file, counts the number of items, and prints a summary.
- Use `fs/promises`, `path`, and `process.argv`.

---

## How to Use This Document

1. **Attempt every question on paper or in a code editor first.** Do not look at documentation unless you are truly stuck.
2. **For coding questions, write the code, run it, and predict the output before running.**
3. **For LeetCode problems, aim for:**
   - Easy: 15-20 minutes each
   - Medium: 30-40 minutes each
4. **If you cannot answer a question, study that topic again.** Only move to Phase 2 when you can solve 80%+ of these confidently.
5. **Keep a journal of mistakes.** Revisit them after 3 days.

**Good luck! Master Phase 1 before moving on.**
