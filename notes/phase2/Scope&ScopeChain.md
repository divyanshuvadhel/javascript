# Scope & Scope Chain — Complete Notes

> **Prerequisite**: Basic JavaScript syntax (variables, functions, blocks).  
> **Time to master**: ~2–3 hours of reading + practice.

---

## 1. What Is Scope?

**Scope** defines the *visibility* and *lifetime* of variables. It answers the question:  
*“Where can this variable be accessed?”*

```js
const message = "Hello";      // declared in global scope

function say() {
  console.log(message);       // ✅ accessible here
}
say();
```

If a variable is **out of scope**, the engine throws `ReferenceError`.

---

## 2. The Three Scope Types in JavaScript

| Type | Created by | Keyword(s) | Reach |
|------|-----------|------------|-------|
| **Global** | Top-level script | `var`, `let`, `const` | Entire program |
| **Function** | Function body | `var`, `let`, `const` | Inside that function only |
| **Block** | Curly braces `{}` | `let`, `const` | Inside that block only |

### 2.1 Global Scope
```js
const appName = "MyApp";   // global

function init() {
  console.log(appName);    // ✅ works
}
```
*Avoid polluting global scope — it leads to naming collisions.*

### 2.2 Function Scope
```js
function makeCounter() {
  let count = 0;           // function-scoped
  return function() {
    count++;
    return count;
  };
}
const counter = makeCounter();
console.log(counter());    // 1
console.log(counter());    // 2
console.log(count);        // ❌ ReferenceError
```

### 2.3 Block Scope (ES6+)
```js
if (true) {
  let x = 10;
  const y = 20;
}
console.log(x);  // ❌ ReferenceError
console.log(y);  // ❌ ReferenceError

// ⚠️ var is NOT block-scoped!
if (true) {
  var z = 30;
}
console.log(z);  // ✅ 30  (hoisted to function/global scope)
```

---

## 3. Lexical (Static) Scoping

JavaScript uses **lexical scoping**: a function's scope is determined by *where it is written*, not where it is called.

```js
const outerVar = "I am outer";

function outer() {
  const innerVar = "I am inner";

  function inner() {
    console.log(outerVar);  // ✅ found in outer scope
    console.log(innerVar);  // ✅ found in outer scope
  }
  return inner;
}

const fn = outer();
fn();  // still accesses outerVar and innerVar
```

> **Key insight**: The function "remembers" its birthplace.

---

## 4. What Is the Scope Chain?

When the engine looks up a variable, it searches through a **chain of scopes** from innermost to outermost until it finds the variable or reaches the global scope.

```js
const a = "global";

function one() {
  const a = "one";

  function two() {
    const a = "two";
    console.log(a);   // "two"  (found immediately)
  }
  two();
}
one();
```

**Lookup order:** `two` → `one` → `global`

```js
const a = "global";

function one() {
  // no 'a' here
  function two() {
    console.log(a);   // "global"  (climbs up)
  }
  two();
}
one();
```

### Visual Model
```
┌─────────────────────────────┐
│        Global Scope         │  ← last resort
│   (window / globalThis)     │
│         const a             │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│      Function one()         │
│      (no local 'a')         │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│      Function two()         │
│   console.log(a) → not found│
│   → climbs up the chain     │
└─────────────────────────────┘
```

---

## 5. Variable Shadowing

When an inner variable has the **same name** as an outer one, it **shadows** (hides) the outer variable inside its scope.

```js
let name = "Alice";

function greet() {
  let name = "Bob";     // shadows outer 'name'
  console.log(name);    // "Bob"
}
greet();
console.log(name);      // "Alice"  (outer unchanged)
```

---

## 6. Scope Chain & Closures

A **closure** is a function that *preserves* access to its outer scope variables even after the outer function has returned.

```js
function createGreeter(name) {
  const greeting = "Hello";   // enclosed variable

  return function() {
    console.log(`${greeting}, ${name}!`);
  };
}

const greetAlice = createGreeter("Alice");
greetAlice();   // "Hello, Alice!"
```

> The returned function carries its scope chain with it — that's the closure.

---

## 7. Common Pitfalls

### Pitfall 1: `var` in loops
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3  (var is function-scoped, not block-scoped)

// Fix: use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
```

### Pitfall 2: Implicit globals
```js
function oops() {
  count = 0;   // forgot let/const/var → becomes global!
}
oops();
console.log(window.count);  // 0
```

### Pitfall 3: Scope chain performance
Deeply nested scope lookups are slightly slower. Avoid unnecessary nesting for hot paths.

---

## 8. Quick Reference Table

| Concept | Meaning |
|---------|---------|
| **Scope** | Region where a variable is accessible |
| **Lexical scope** | Scope determined by source code position |
| **Scope chain** | Linked list of scopes for variable lookup |
| **Closure** | Function + its captured scope chain |
| **Shadowing** | Inner variable hides outer variable of same name |
| **Hoisting** | `var` and `function` declarations moved to top of scope |

---

## 9. Practice Exercises

### Exercise 1 — Predict the Output
```js
let x = 1;

function first() {
  let x = 2;
  function second() {
    let x = 3;
    console.log(x);
  }
  second();
  console.log(x);
}
first();
console.log(x);
```
<details>
<summary>Answer</summary>

```
3
2
1
```
</details>

---

### Exercise 2 — Fix the Bug
```js
const counters = [];
for (var i = 0; i < 3; i++) {
  counters[i] = function() { return i; };
}
console.log(counters[0]()); // Expected 0, but gets 3
```
<details>
<summary>Solution</summary>

```js
const counters = [];
for (let i = 0; i < 3; i++) {   // change var → let
  counters[i] = function() { return i; };
}
console.log(counters[0]()); // 0
console.log(counters[1]()); // 1
console.log(counters[2]()); // 2
```
</details>

---

### Exercise 3 — Build a Closure
Write a function `makeMultiplier(factor)` that returns a new function. The returned function should multiply its argument by `factor`.

```js
const triple = makeMultiplier(3);
console.log(triple(5)); // 15
```
<details>
<summary>Solution</summary>

```js
function makeMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
```
</details>

---

### Exercise 4 — Scope Chain Challenge
```js
const a = "global";

function outer() {
  const a = "outer";

  function inner() {
    console.log(a);
  }
  return inner;
}

const fn = outer();
fn();
```
What prints? Why?
<details>
<summary>Answer</summary>

Prints `"outer"` because `inner()` is lexically scoped inside `outer()`. The scope chain is preserved even when `inner` is called outside `outer`.
</details>

---

### Exercise 5 — Shadowing Deep-Dive
```js
let value = "global";

function check() {
  console.log(value);   // ???
  let value = "local";
  console.log(value);   // ???
}
check();
```
<details>
<summary>Answer</summary>

First `console.log` throws `ReferenceError` (TDZ — Temporal Dead Zone). The `let` declaration hoists but doesn't initialize until the line is reached.  
Second `console.log` prints `"local"`.
</details>

---

## 10. Suggested Practice Path

| Step | Task | Time |
|------|------|------|
| 1 | Read these notes and run every code snippet in your browser console | 30 min |
| 2 | Complete Exercises 1–5 without looking at answers | 30 min |
| 3 | Build a **module pattern** using closures: private counter + public methods | 20 min |
| 4 | Debug 3 real-world scope bugs from open-source JS repos on GitHub | 30 min |
| 5 | Teach scope & closures to someone (or write a blog post) | 40 min |

---

## 11. One-Liner Summary

> **Scope is a box; the scope chain is a stack of boxes. JavaScript looks inside the nearest box first, then climbs up until it finds the variable or runs out of boxes.**

---

*Happy coding! 🚀*
