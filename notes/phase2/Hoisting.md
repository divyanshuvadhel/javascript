# Hoisting in JavaScript

> **Prerequisite**: Scope, scope chain, and basic JS execution flow.  
> **Time to master**: ~3–4 hours of deep reading + practice.  
> **Goal**: Understand not just *what* hoists, but **how** the engine does it and **why** the language behaves this way.

---

## Table of Contents
1. [The Two-Phase Execution Model](#1-the-two-phase-execution-model)
2. [What Is Hoisting? (The Real Definition)](#2-what-is-hoisting-the-real-definition)
3. [The Creation Phase: Lexical Environment](#3-the-creation-phase-lexical-environment)
4. [How `var` Hoisting Works Internally](#4-how-var-hoisting-works-internally)
5. [How `let`/`const` Hoisting Works (TDZ Deep Dive)](#5-how-letconst-hoisting-works-tdz-deep-dive)
6. [How Function Hoisting Works](#6-how-function-hoisting-works)
7. [How Class Hoisting Works](#7-how-class-hoisting-works)
8. [The `typeof` TDZ Trap](#8-the-typeof-tdz-trap)
9. [Hoisting in Different Contexts](#9-hoisting-in-different-contexts)
10. [The "Why" — Design Decisions](#10-the-why--design-decisions)
11. [Visual Execution Walkthroughs](#11-visual-execution-walkthroughs)
12. [Edge Cases & Brain Teasers](#12-edge-cases--brain-teasers)
13. [Practice Exercises (15 Total)](#13-practice-exercises)
14. [Anti-Patterns & Best Practices](#14-anti-patterns--best-practices)
15. [One-Liner Summary](#15-one-liner-summary)

---

## 1. The Two-Phase Execution Model

JavaScript engines (V8, SpiderMonkey, JavaScriptCore) execute code in **two distinct phases**:

### Phase 1: Creation Phase (Compile Time)
- The engine scans the entire scope before running any code
- It builds the **Lexical Environment** (a data structure mapping identifiers to values)
- It processes all declarations (`var`, `let`, `const`, `function`, `class`)
- No code is executed yet

### Phase 2: Execution Phase (Run Time)
- The engine runs the code line by line
- Assignments happen here
- Expressions are evaluated here
- Functions are called here

> **Hoisting is a side effect of the Creation Phase.** The engine "sets up the stage" before the "play" begins.

```
┌─────────────────────────────────────────────────────────────┐
│                     SOURCE CODE                             │
│  var x = 1;                                                 │
│  let y = 2;                                                 │
│  function foo() {}                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: CREATION PHASE                        │
│  • Scan for declarations                                    │
│  • Allocate memory for variables                            │
│  • Initialize bindings (var→undefined, let→uninitialized)     │
│  • Store function definitions                               │
│  • Build scope chain                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 2: EXECUTION PHASE                       │
│  • Run code line by line                                    │
│  • Perform assignments (x = 1, y = 2)                       │
│  • Execute expressions                                      │
│  • Call functions                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. What Is Hoisting? (The Real Definition)

**Hoisting** is the behavior where variable and function declarations are processed during the Creation Phase, making them appear as if they were moved ("hoisted") to the top of their scope.

> ⚠️ **Critical distinction**: Only **declarations** are hoisted. **Initializations/assignments are NOT hoisted.**

```js
// What you write:
console.log(name);
var name = "Alice";

// What the engine conceptually does:
var name;            // ← hoisted declaration
console.log(name);   // ← execution: reads undefined
name = "Alice";      // ← execution: assignment
```

---

## 3. The Creation Phase: Lexical Environment

The **Lexical Environment** is the internal data structure that stores variable bindings. It has two components:

### 3.1 Environment Record
A record that maps identifiers to their values. There are two types:
- **Object Environment Record** (for `var` in global scope — tied to the global object)
- **Declarative Environment Record** (for `let`, `const`, `function`, `class`)

### 3.2 Outer Lexical Environment Reference
A pointer to the parent scope (this builds the **scope chain**).

```
Lexical Environment = {
  EnvironmentRecord: {
    // bindings go here
    name: undefined,     // for var
    age: <uninitialized>, // for let (TDZ)
    greet: <function object>, // for function declaration
  },
  outer: <reference to parent scope>
}
```

---

## 4. How `var` Hoisting Works Internally

### Step-by-step internal process:

```js
// Source code:
function example() {
  console.log(a);   // Line 2
  var a = 10;       // Line 3
  console.log(a);   // Line 4
}
example();
```

**Creation Phase (inside `example()`):**
1. Engine scans `example()` body
2. Finds `var a` declaration
3. Creates binding in the function's Environment Record: `a → undefined`
4. No code runs yet

**Execution Phase:**
1. `console.log(a)` → reads `undefined` from Environment Record
2. `var a = 10` → updates binding: `a → 10`
3. `console.log(a)` → reads `10`

### The `var` binding lifecycle:
```
Creation Phase:   a → undefined
Execution Line 3: a → 10
```

### Multiple `var` declarations in same scope:
```js
var x = 1;
var x = 2;
console.log(x); // 2
```
**Why?** The second `var x` is ignored during hoisting (the binding already exists). Only the assignment `x = 2` executes.

### `var` is function-scoped, not block-scoped:
```js
function test() {
  if (true) {
    var x = 5;    // hoisted to top of test(), not just the if block
  }
  console.log(x); // 5 — accessible outside the if block!
}
```

**What the engine sees:**
```js
function test() {
  var x;           // hoisted to top of function
  if (true) {
    x = 5;
  }
  console.log(x);  // 5
}
```

---

## 5. How `let`/`const` Hoisting Works (TDZ Deep Dive)

### The Temporal Dead Zone (TDZ)

The TDZ is the **period between entering a scope and the actual declaration line** where a `let`/`const` variable exists but is **uninitialized**.

```js
{
  // TDZ starts here (scope begins)
  console.log(x);   // ❌ ReferenceError — x is in TDZ
  let x = 10;       // TDZ ends here
  console.log(x);   // ✅ 10
}
```

### Internal mechanism:

**Creation Phase:**
1. Engine scans scope, finds `let x`
2. Creates binding in Environment Record: `x → <uninitialized>`
3. The binding exists but has NO value (not even `undefined`)

**Execution Phase:**
1. `console.log(x)` → engine sees `x` is `<uninitialized>` → throws `ReferenceError`
2. `let x = 10` → initializes binding: `x → 10`
3. `console.log(x)` → reads `10`

### Why TDZ exists:

The TDZ was intentionally designed to:
1. **Catch bugs early** — accessing a variable before declaration is usually a mistake
2. **Prevent silent `undefined` errors** — unlike `var`, you get a loud error
3. **Enable proper block scoping** — makes `let`/`const` behave more predictably

### TDZ and the scope chain:
```js
let x = "global";

function test() {
  console.log(x);   // ❌ ReferenceError (not "global"!)
  let x = "local";
}
test();
```
**Why not "global"?** Because the local `let x` binding was created during the Creation Phase. The engine finds the local binding (it's in the current scope's Environment Record), sees it's `<uninitialized>`, and throws. It **never looks up the scope chain** because the identifier is already "found" — just not ready.

> This is one of the most misunderstood behaviors in JavaScript.

### TDZ with `typeof`:
```js
console.log(typeof undeclared);  // "undefined" — safe
console.log(typeof tdzVar);      // ❌ ReferenceError!
let tdzVar = 5;
```
**Why?** `typeof` normally returns `"undefined"` for non-existent variables. But for TDZ variables, the binding exists (it's just uninitialized), so `typeof` throws instead of returning `"undefined"`.

### TDZ with default parameters:
```js
function foo(x = y, y = 2) {
  console.log(x, y);
}
foo(); // ❌ ReferenceError: Cannot access 'y' before initialization
```
**Why?** Default parameters have their own scope. When evaluating `x = y`, `y` is in the TDZ of that parameter scope.

### TDZ with `const`:
```js
const PI;          // ❌ SyntaxError: Missing initializer
```
`const` **must** be initialized at declaration because:
1. The binding is created as `<uninitialized>`
2. The declaration line is the ONLY place initialization can happen
3. After that, re-assignment is forbidden

### `const` and mutation:
```js
const user = { name: "Alice" };
user.name = "Bob";        // ✅ Allowed — mutating the object
user = { name: "Carol" }; // ❌ TypeError — reassigning the binding
```
`const` creates an **immutable binding**, not an immutable value.

---

## 6. How Function Hoisting Works

### Function Declarations

```js
sayHello();        // ✅ Works perfectly

function sayHello() {
  console.log("Hello!");
}
```

**Creation Phase:**
1. Engine finds `function sayHello`
2. Creates the function object in memory
3. Stores the complete function in the Environment Record: `sayHello → <function object>`

**Execution Phase:**
1. `sayHello()` → finds the function object in the Environment Record → calls it

> Function declarations are hoisted **with their full body**.

### Function Expressions

```js
// With var
sayHi();           // ❌ TypeError: sayHi is not a function
var sayHi = function() {
  console.log("Hi!");
};
```

**Creation Phase:**
1. Engine finds `var sayHi`
2. Creates binding: `sayHi → undefined` (the function assignment is NOT hoisted!)

**Execution Phase:**
1. `sayHi()` → reads `undefined` → tries to call `undefined()` → `TypeError`

```js
// With let
sayHey();          // ❌ ReferenceError
let sayHey = function() {
  console.log("Hey!");
};
```

**Creation Phase:**
1. Engine finds `let sayHey`
2. Creates binding: `sayHey → <uninitialized>`

**Execution Phase:**
1. `sayHey()` → binding is `<uninitialized>` → `ReferenceError`

### Named Function Expressions
```js
var fn = function myFunc() {
  console.log(myFunc); // ✅ Accessible inside the function
};
console.log(myFunc);   // ❌ ReferenceError — not available outside
```
The name `myFunc` is only available inside the function body (creates its own scope).

### Arrow Functions
```js
greet();              // ❌ TypeError (var) or ReferenceError (let/const)
var greet = () => "Hello";
```
Arrow functions are expressions, not declarations. Same hoisting rules as function expressions.

### IIFE (Immediately Invoked Function Expressions)
```js
(function() {
  console.log("IIFE!");
})();
```
IIFEs are expressions, not declarations. The function itself is not hoisted (it's wrapped in parentheses).

---

## 7. How Class Hoisting Works

```js
const p = new Person();   // ❌ ReferenceError
class Person {
  constructor() {
    this.name = "Alice";
  }
}
```

**Creation Phase:**
1. Engine finds `class Person`
2. Creates binding: `Person → <uninitialized>` (similar to `let`/`const`)

**Execution Phase:**
1. `new Person()` → binding is `<uninitialized>` → `ReferenceError`
2. `class Person { ... }` → initializes the class constructor

### Class Expressions (not hoisted)
```js
const Animal = class {};   // No hoisting — it's an expression
```

### Why classes have TDZ:
Classes can `extend` other classes, and the engine needs to ensure the parent class is fully evaluated before the child class is used. The TDZ prevents circular dependencies and ensures proper initialization order.

```js
class Dog extends Animal {}   // Animal must be fully initialized first
class Animal {}
```
This works because both are hoisted with TDZ, and by the time `Dog` is evaluated, `Animal` is initialized.

---

## 8. The `typeof` TDZ Trap

```js
// Undeclared variable — safe
console.log(typeof notDeclared);  // "undefined"

// TDZ variable — NOT safe
console.log(typeof tdz);          // ❌ ReferenceError
let tdz = 5;
```

**Why the difference?**
- `notDeclared`: No binding exists anywhere → `typeof` returns `"undefined"` (historical behavior)
- `tdz`: Binding exists in current scope but is `<uninitialized>` → `typeof` throws because the binding is "found" but not ready

This is a subtle but important distinction that trips up many developers.

---

## 9. Hoisting in Different Contexts

### 9.1 Global Scope
```js
// In a browser, var declarations create properties on window/globalThis
var globalVar = 1;
console.log(window.globalVar); // 1

let globalLet = 2;
console.log(window.globalLet); // undefined (not attached to global object)
```

### 9.2 Function Scope
```js
function outer() {
  console.log(innerVar); // undefined
  var innerVar = 10;

  function inner() {
    console.log(innerVar); // 10 — closure access
  }
  inner();
}
outer();
```

### 9.3 Block Scope
```js
{
  console.log(blockVar); // undefined
  var blockVar = 1;     // hoisted to function/global scope, not block!

  console.log(blockLet); // ❌ ReferenceError
  let blockLet = 2;     // hoisted but in TDZ within the block
}
```

### 9.4 Module Scope
```js
// module.js
console.log(imported); // ✅ Works! Imports are hoisted
import { imported } from "./other.js";
```
`import` declarations are hoisted to the top of the module.

### 9.5 eval() Context
```js
eval("var x = 1;");
console.log(x); // 1 — var leaks out of eval in non-strict mode!
```
In non-strict mode, `var` inside `eval()` pollutes the surrounding scope. In strict mode, it doesn't.

---

## 10. The "Why" — Design Decisions

### Why was hoisting created?

**1. Single-pass compilation:**
Early JavaScript engines needed to compile code in a single pass. Hoisting allows the engine to know all variable names before executing, enabling efficient memory allocation.

**2. Mutual recursion:**
```js
function isEven(n) {
  return n === 0 || isOdd(n - 1);
}
function isOdd(n) {
  return n !== 0 && isEven(n - 1);
}
```
Function hoisting makes mutual recursion possible without forward declarations.

**3. Backward compatibility:**
`var` hoisting exists from the earliest JS versions (1995). Changing it would break the web.

### Why does TDZ exist for `let`/`const`?

**1. Prevent silent errors:**
```js
// With var (silent bug):
var x = 1;
function test() {
  console.log(x); // undefined (surprising!)
  var x = 2;
}

// With let (clear error):
let x = 1;
function test() {
  console.log(x); // ReferenceError (catches the bug!)
  let x = 2;
}
```

**2. Temporal consistency:**
Variables should behave as if they exist only from their declaration point forward. TDZ enforces this mental model.

**3. Class inheritance safety:**
TDZ ensures base classes are fully initialized before derived classes use them.

### Why `typeof` behaves differently for undeclared vs TDZ:

```js
// Historical behavior (pre-ES6):
if (typeof FeatureX !== "undefined") {
  // use FeatureX
}

// If typeof threw for ALL missing variables, this pattern would break.
// So typeof returns "undefined" for truly undeclared variables.
// But for TDZ variables, the binding exists — it's just not ready.
```

---

## 11. Visual Execution Walkthroughs

### Walkthrough 1: `var` Hoisting
```js
// Source:
console.log(a);
var a = 5;
console.log(a);

// Creation Phase:
// Lexical Environment: { a: undefined }

// Execution Phase:
// Line 1: console.log(a) → reads undefined → prints "undefined"
// Line 2: a = 5 → updates to { a: 5 }
// Line 3: console.log(a) → reads 5 → prints "5"
```

### Walkthrough 2: `let` TDZ
```js
// Source:
{
  console.log(x);
  let x = 10;
}

// Creation Phase:
// Lexical Environment: { x: <uninitialized> }

// Execution Phase:
// Line 2: console.log(x) → x is <uninitialized> → ReferenceError!
// (Execution stops — Line 3 never runs)
```

### Walkthrough 3: Function Declaration
```js
// Source:
foo();
function foo() { console.log("foo"); }

// Creation Phase:
// Lexical Environment: { foo: <function object> }

// Execution Phase:
// Line 1: foo() → finds function → calls it → prints "foo"
```

### Walkthrough 4: Function Expression
```js
// Source:
bar();
var bar = function() { console.log("bar"); };

// Creation Phase:
// Lexical Environment: { bar: undefined }

// Execution Phase:
// Line 1: bar() → reads undefined → TypeError: undefined is not a function
```

### Walkthrough 5: Shadowing with TDZ
```js
// Source:
let x = "global";
function test() {
  console.log(x);
  let x = "local";
}
test();

// Creation Phase (test function scope):
// Lexical Environment: { x: <uninitialized> }, outer: { x: "global" }

// Execution Phase:
// Line 3: console.log(x) → finds local x (not uninitialized) → ReferenceError!
// (Does NOT look at outer scope because local binding exists)
```

### Walkthrough 6: Nested Functions
```js
// Source:
function outer() {
  console.log(inner);
  function inner() {}
}
outer();

// Creation Phase (outer function scope):
// Lexical Environment: { inner: <function object> }

// Execution Phase:
// Line 2: console.log(inner) → finds function → prints [Function: inner]
```

---

## 12. Edge Cases & Brain Teasers

### Edge Case 1: `var` in loops with closures (classic)
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3

// Why: var i is hoisted to the function scope.
// All 3 closures capture the SAME i.
// By the time setTimeout runs, the loop has finished (i = 3).

// Fix:
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
// Why: let creates a new binding for each iteration!
```

### Edge Case 2: Function declaration inside block
```js
if (true) {
  function blockFn() { return "inside"; }
}
console.log(blockFn()); // "inside" — but behavior varies by strict mode!

// In strict mode: blockFn is block-scoped (not accessible outside)
// In non-strict mode: blockFn leaks to enclosing function (legacy behavior)
```

### Edge Case 3: Hoisting order with duplicate names
```js
var x = 1;
function x() {}
console.log(typeof x); // "number"

// Why: Function declarations are hoisted BEFORE var declarations.
// During Creation Phase:
//   1. function x is hoisted → x = <function>
//   2. var x is seen → ignored (already exists)
// During Execution:
//   3. x = 1 → overwrites function with number
```

### Edge Case 4: `let` redeclaration
```js
let a = 1;
let a = 2; // ❌ SyntaxError: Identifier 'a' has already been declared

// var allows redeclaration; let/const do not.
```

### Edge Case 5: Hoisting in try-catch
```js
try {
  console.log(x); // undefined
  var x = 1;
} catch (e) {
  var y = 2;      // hoisted to enclosing function scope, not catch block!
}
console.log(y);   // undefined (not an error, but undefined because catch didn't run)
```

### Edge Case 6: `var` in switch
```js
switch (true) {
  case true:
    var z = 5;
}
console.log(z); // 5 — var leaks out of switch blocks!
```

### Edge Case 7: TDZ in default parameters
```js
function foo(a = b, b) {
  console.log(a, b);
}
foo(undefined, 2); // ReferenceError: Cannot access 'b' before initialization

// Why: Default parameters have their own scope.
// When evaluating a = b, b is in the TDZ of the parameter scope.
```

### Edge Case 8: Hoisting with destructuring
```js
var { a } = { a: 1 };
console.log(a); // 1

// What about:
console.log(b); // undefined
var { b } = { b: 2 };
// The var declaration is hoisted, but destructuring assignment happens at execution.
```

---

## 13. Practice Exercises

### Exercise 1 — Basic `var` Hoisting
```js
console.log(a);
var a = 10;
console.log(a);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
undefined
10
```

**Explanation:** During the Creation Phase, `var a` is hoisted and initialized as `undefined`. The first `console.log` reads this `undefined`. Then `a = 10` executes, updating the value. The second `console.log` reads `10`.
</details>

---

### Exercise 2 — `let` TDZ
```js
console.log(b);
let b = 20;
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
ReferenceError: Cannot access 'b' before initialization
```

**Explanation:** `let b` is hoisted during the Creation Phase but initialized as `<uninitialized>` (TDZ). When `console.log(b)` executes, the engine finds the binding but sees it's not initialized, so it throws a `ReferenceError`.
</details>

---

### Exercise 3 — Function Declaration vs Expression
```js
foo();
function foo() { console.log("foo declaration"); }

bar();
var bar = function() { console.log("bar expression"); };
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
foo declaration
TypeError: bar is not a function
```

**Explanation:**
- `foo` is a function declaration — fully hoisted (name + body). Calling it before the line works.
- `bar` is a function expression assigned to a `var`. Only `var bar` is hoisted (as `undefined`). When `bar()` is called, `bar` is `undefined`, so calling it throws a `TypeError`.
</details>

---

### Exercise 4 — Shadowing with `var`
```js
var x = 1;
function test() {
  console.log(x);
  var x = 2;
  console.log(x);
}
test();
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
undefined
2
```

**Explanation:** The local `var x` is hoisted to the top of `test()`, shadowing the global `x`. At the first `console.log`, the local `x` is `undefined` (not yet assigned). Then `x = 2` executes. The second `console.log` reads `2`.
</details>

---

### Exercise 5 — The TDZ Shadowing Trap
```js
let x = "global";
function test() {
  console.log(x);
  let x = "local";
}
test();
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
ReferenceError: Cannot access 'x' before initialization
```

**Explanation:** The local `let x` is hoisted into the TDZ. When `console.log(x)` runs, the engine finds the local binding (it's in the current scope's Environment Record). Because it's `<uninitialized>`, it throws a `ReferenceError`. The engine **does NOT** look up the scope chain to find the global `x` because the local binding already exists.
</details>

---

### Exercise 6 — Hoisting Order
```js
console.log(x);
var x = 1;
function x() { console.log("function"); }
console.log(x);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
[Function: x]
1
```

**Explanation:** During the Creation Phase, function declarations are hoisted BEFORE `var` declarations. So initially `x` is the function. The `var x` is ignored (binding already exists). Then during execution, `x = 1` overwrites the function with the number `1`.
</details>

---

### Exercise 7 — Nested Function Hoisting
```js
function outer() {
  console.log(typeof inner);
  if (false) {
    function inner() {}
  }
}
outer();
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict mode):**
```
function
```

**Output (strict mode):**
```
undefined
```

**Explanation:** In non-strict mode, function declarations inside blocks are hoisted to the enclosing function scope (legacy behavior). In strict mode (ES6+), they are block-scoped, so `inner` is not hoisted outside the `if` block.
</details>

---

### Exercise 8 — `let` in Loop with Closure
```js
const funcs = [];
for (let i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}
console.log(funcs[0]());
console.log(funcs[1]());
console.log(funcs[2]());
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
0
1
2
```

**Explanation:** `let` creates a new binding for each iteration of the loop. Each closure captures its own `i`. This is a key difference from `var`, which would produce `3, 3, 3`.
</details>

---

### Exercise 9 — Default Parameter TDZ
```js
function foo(a = a) {}
foo();
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
ReferenceError: Cannot access 'a' before initialization
```

**Explanation:** Default parameters have their own scope. When evaluating `a = a`, the right-hand `a` is in the TDZ because the left-hand `a` hasn't been initialized yet. It's trying to use itself before it exists.
</details>

---

### Exercise 10 — Class Hoisting
```js
const p = new Person();
class Person {
  constructor() { this.name = "Alice"; }
}
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
ReferenceError: Cannot access 'Person' before initialization
```

**Explanation:** Classes are hoisted but remain in the TDZ until their declaration line is executed. Unlike function declarations, they are not initialized during the Creation Phase.
</details>

---

### Exercise 11 — `typeof` Trap
```js
console.log(typeof undeclared);
console.log(typeof tdz);
let tdz = 5;
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
undefined
ReferenceError: Cannot access 'tdz' before initialization
```

**Explanation:**
- `typeof undeclared`: No binding exists anywhere → returns `"undefined"` (safe historical behavior).
- `typeof tdz`: The binding exists (hoisted) but is `<uninitialized>` → throws `ReferenceError`.
</details>

---

### Exercise 12 — Multiple `var` Declarations
```js
var x = 1;
console.log(x);
var x = 2;
console.log(x);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
1
2
```

**Explanation:** During the Creation Phase, only ONE binding `x` is created. The second `var x` is ignored (it's already declared). During execution, `x = 1` runs, then `x = 2` overwrites it.
</details>

---

### Exercise 13 — `const` Reassignment
```js
const arr = [1, 2, 3];
arr.push(4);
console.log(arr);
arr = [5, 6];
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
[1, 2, 3, 4]
TypeError: Assignment to constant variable
```

**Explanation:** `const` prevents reassignment of the binding, not mutation of the value. `arr.push(4)` mutates the array (allowed). `arr = [5, 6]` tries to reassign the binding (forbidden).
</details>

---

### Exercise 14 — Hoisting in Conditional
```js
var x = 1;
if (false) {
  var x = 2;
}
console.log(x);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
1
```

**Explanation:** `var x = 2` is hoisted to the top of the function/global scope. The `if (false)` prevents the assignment from executing, but the declaration is already processed. The global `x` remains `1` because the assignment inside the `if` never runs.

**What the engine sees:**
```js
var x;
x = 1;
if (false) {
  x = 2;  // never executes
}
console.log(x); // 1
```
</details>

---

### Exercise 15 — The Ultimate Brain Teaser
```js
function test() {
  console.log(a);
  console.log(b);
  console.log(c);

  function c() {}
  var a = 1;
  let b = 2;
}
test();
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
undefined
ReferenceError: Cannot access 'b' before initialization
```

**Explanation:**
- **Creation Phase:**
  - `function c` is hoisted → `c = <function>`
  - `var a` is hoisted → `a = undefined`
  - `let b` is hoisted → `b = <uninitialized>` (TDZ)

- **Execution Phase:**
  - `console.log(a)` → reads `undefined`
  - `console.log(b)` → `b` is in TDZ → `ReferenceError` (execution stops here!)
  - `console.log(c)` → never runs because of the error above
  - `a = 1`, `b = 2` → never run

> Note: Even though `c` is hoisted, the `ReferenceError` on `b` halts execution before `c` is logged.
</details>

---

## 14. Anti-Patterns & Best Practices

### ✅ DO: Declare at the top
```js
function good() {
  let a, b, c;
  // ... use them later
}
```

### ❌ DON'T: Rely on hoisting behavior
```js
function bad() {
  console.log(x);   // relies on hoisting
  var x = 10;
}
```

### ✅ DO: Use `let` and `const` exclusively
```js
// Prefer this:
function modern() {
  const PI = 3.14;
  let count = 0;
  // ...
}

// Avoid this:
function legacy() {
  var x = 1;
  var y = 2;
  // ...
}
```

### ✅ DO: Declare functions before use (even though hoisting allows otherwise)
```js
// For readability:
function helper() { /* ... */ }
function main() {
  helper();
}
```

### ❌ DON'T: Use `var` in loops
```js
// Bad:
for (var i = 0; i < 3; i++) { /* closure issues */ }

// Good:
for (let i = 0; i < 3; i++) { /* each iteration gets fresh binding */ }
```

### ✅ DO: Use strict mode
```js
"use strict";
// Prevents accidental global variables
// Makes function declarations block-scoped
```

### ❌ DON'T: Use `typeof` to check TDZ variables
```js
// This is a trap:
if (typeof myLet !== "undefined") { /* ... */ }
let myLet = 5;
// Use explicit initialization checks instead
```

---

## 15. One-Liner Summary

> **Hoisting is the engine's two-phase process: during the Creation Phase, all declarations (`var`, `let`, `const`, `function`, `class`) are registered in the Lexical Environment. `var` gets `undefined`, `function` gets its full body, but `let`/`const`/`class` enter the Temporal Dead Zone — existing but uninitialized until their declaration line executes. Only the declaration is hoisted; assignments stay exactly where you wrote them.**

---

*Master the engine, master the language. 🚀*
