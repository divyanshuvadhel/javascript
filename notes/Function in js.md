# JavaScript Functions — Complete Notes

## 1. What Is a Function?

A function is a reusable block of code that performs a specific task. Instead of repeating
the same lines of code everywhere you need them, you write the logic once inside a function,
give it a name, and "call" it whenever needed.

**Analogy:** Instead of calling a friend every time you need a recipe, you write the recipe
down once (the function) and refer to it whenever you want to cook (call the function).

**Why functions matter:**
- Reduce code repetition (DRY — Don't Repeat Yourself)
- Make code reusable
- Make debugging easier — fix a bug in one place instead of every repeated block
- Make programs modular and organized

A function *can* be anonymous (no name), but most functions are named so they can be called
by that name.

---

## 2. Key Terminology

| Term | Meaning |
|---|---|
| **Function vs Method** | A function is a standalone reusable block. A **method** is a function that belongs to an object (e.g. `console.log`, `array.map`). |
| **Declaration vs Definition** | Essentially the same thing — both mean "creating a function with logic." |
| **Parameter vs Argument** | A **parameter** is the placeholder name listed in the function definition. An **argument** is the actual value passed in when the function is called. |
| **Callback vs Higher-Order Function** | Related but not identical — explained in detail below. |

---

## 3. Declaring Functions

### a) Function Declaration
```js
function printMe() {
  console.log("printing");
}
printMe(); // calling/invoking — needs parentheses
```
Calling `printMe` (without parentheses) just gives you the string representation of the
function; you need `()` to actually execute it.

### b) Function with Parameters
```js
function printThis(param) {
  console.log(param);
}
printThis("Hello"); // "Hello" is the argument
```

### c) Function Expression
```js
const printMeAgain = function () {
  console.log("printing");
};
printMeAgain();
```
Here the function has no name of its own (or has one only locally) — it's assigned to a
variable, much like `const count = 100`.

---

## 4. Returning Values

A function can send a value back to the caller using `return`.

```js
function sum(a, b) {
  return a + b;
}
let result = sum(2, 3); // 5
```

- If a function has no `return` statement, calling it returns `undefined`.
- `return` immediately ends function execution — code after `return` never runs.
- Shorter form: `return a + b;` is preferred over assigning to a variable first and returning
  that variable, when the calculation is simple.

---

## 5. Default Parameters

If an argument isn't passed, the parameter's value becomes `undefined`, which can cause
`NaN` in arithmetic. Default parameters protect against this.

```js
function calc(a, b = 0) {
  return 2 * (a + b);
}
calc(3);     // b defaults to 0 → 6
calc(3, 3);  // 12
```

---

## 6. Rest Parameters

Rest parameters let a function accept an unlimited number of arguments, collected into an
**array**.

```js
function collectThings(x, ...y) {
  console.log(x); // first argument
  console.log(y); // array of all remaining arguments
}
collectThings(1, 2, 3, 4, 5);
// x = 1
// y = [2, 3, 4, 5]
```

**Rules:**
1. A function can have only **one** rest parameter.
2. The rest parameter **must be the last** parameter in the list.

---

## 7. Arrow Functions (Fat Arrow Syntax)

A more compact, modern way of writing functions — the de facto standard in modern JS/frameworks.

```js
// Traditional function expression
const add = function (x, y) {
  return x + y;
};

// Arrow function
const add = (x, y) => {
  return x + y;
};

// Single statement → no braces / no explicit return needed
const add = (x, y) => x + y;

// Single parameter → parentheses optional
const square = x => x * x;
```

**Note:** Arrow functions do **not** bind their own `this` — they inherit `this` from their
surrounding (lexical) scope. This is a deeper topic covered separately, but it's one of the
biggest practical differences from regular functions.

---

## 8. Arrow Functions vs Normal Functions — Comparison

| Feature | Arrow Function | Normal Function |
|---|---|---|
| **Syntax** | `(x, y) => x + y` | `function(x, y) { return x + y; }` |
| **Return value** | Single expression: implicit return | Always explicit `return` required |
| **Binds `this`?** | ❌ NO — inherits from lexical scope | ✅ YES — binds dynamically at call time |
| **Can be constructor?** | ❌ NO — cannot use `new` | ✅ YES — can use `new` keyword |
| **Has `arguments` object?** | ❌ NO — use rest parameters `...args` instead | ✅ YES — built-in `arguments` available |
| **Used as method?** | ⚠️ Not recommended (wrong `this`) | ✅ Recommended (correct `this` binding) |
| **Hoisting** | ❌ No hoisting (declared as const/let) | ✅ Function declarations are hoisted |
| **When to use** | Callbacks, array methods, short logic | Methods, constructors, when you need `this` |

### Example Side-by-Side

```js
// Regular function
const obj = {
  count: 0,
  increment: function() {
    console.log(this); // obj
  }
};
obj.increment(); // logs: { count: 0, increment: [Function] }

// Arrow function (wrong this)
const obj2 = {
  count: 0,
  increment: () => {
    console.log(this); // window (or undefined in strict mode) — NOT obj2
  }
};
obj2.increment(); // logs: window
```

### Why Arrow Functions Shine: Inside Callbacks

```js
// Regular function — loses this context
const button = {
  label: "Click me",
  onClick: function() {
    setTimeout(function() {
      console.log(this.label); // ❌ undefined (or error) — this is window/undefined
    }, 1000);
  }
};

// Arrow function — captures this from enclosing scope
const button = {
  label: "Click me",
  onClick: function() {
    setTimeout(() => {
      console.log(this.label); // ✅ "Click me" — this is the button object
    }, 1000);
  }
};
button.onClick();
```

---

## 9. The `this` Keyword — Binding Rules

`this` is a special variable that refers to the **object that is executing the current function**.
Its value is determined **at runtime**, not at write time — except for arrow functions, which
capture `this` from their surrounding scope.

### Rule 1: Method Call — `this` is the Object

When a function is called as a **method** of an object (i.e., you call it as `object.method()`),
`this` automatically refers to that object.

```js
const person = {
  name: "Alice",
  greet: function() {
    console.log("Hi, I'm " + this.name);
  }
};

person.greet(); // "Hi, I'm Alice" — this = person
```

### Rule 2: Function Call — `this` is Global (or undefined in strict mode)

When a function is called **directly** (not as a method), `this` refers to the global object
(`window` in browsers, `global` in Node.js, or `undefined` in strict mode).

```js
const person = {
  name: "Alice",
  greet: function() {
    console.log(this.name);
  }
};

const greetFn = person.greet;
greetFn(); // undefined — this is global/undefined, not person
```

The function "lost" its context when detached from the object.

### Rule 3: Object Literal — No New Scope

An object literal (`{ ... }`) is **just a data structure**. It does **not** create a new scope
for `this`. Arrow functions defined in an object literal will inherit `this` from the
**surrounding lexical scope** (usually the global scope).

```js
const counter = {
  count: 0,
  increment: () => {
    console.log(this); // window (global scope), NOT counter
  }
};
counter.increment(); // logs: window
```

**Compare with a regular function in an object:**

```js
const counter = {
  count: 0,
  increment: function() {
    console.log(this); // counter — dynamically bound at call time
  }
};
counter.increment(); // logs: { count: 0, increment: [Function] }
```

### Rule 4: Arrow Functions — Lexical `this`

Arrow functions **do not bind their own `this`**. Instead, they capture (inherit) `this` from
the scope where they were **written**, not where they're called.

```js
const obj = {
  value: 10,
  show: () => {
    console.log(this.value); // ❌ undefined (this is global, not obj)
  }
};

obj.show();
```

vs

```js
function outer() {
  this.value = 50;
  
  const show = () => {
    console.log(this.value); // ✅ 50 — arrow inherits this from outer's scope
  };
  
  show();
}

outer.call({ value: 50 }); // logs: 50
```

### Visualization: Where `this` Comes From

```
Global Scope (this = window/undefined)
    │
    ├── Regular Function Defined Here
    │        └─ When called as fn() → this = global
    │        └─ When called as obj.fn() → this = obj (Rule 1)
    │
    └── Object Literal
           │
           ├── Arrow Function Inside
           │        └─ Captures this = global (from surrounding scope)
           │
           └── Regular Method Inside
                  └─ When called as obj.method() → this = obj (Rule 1)
```

### Real-World Example: Event Handler

```js
const button = {
  label: "Click me",
  
  // ❌ Wrong — arrow loses `this`
  setupWrong: function() {
    document.addEventListener("click", () => {
      console.log(this); // this = button (correct by accident — arrow captured button's `this`)
      console.log(this.label); // "Click me"
    });
  },
  
  // ✅ Correct — regular function gets `this` from call context
  setupRight: function() {
    document.addEventListener("click", function() {
      console.log(this); // this = document (the event target), NOT button
      // If you need the button, store it first:
      console.log(button.label); // "Click me"
    });
  }
};

button.setupWrong();
button.setupRight();
```

### Manual `this` Binding: `.call()`, `.apply()`, `.bind()`

You can manually set `this` using three methods:

**`.call(thisArg, arg1, arg2, ...)`** — Calls function immediately with specified `this`

```js
function greet(greeting) {
  console.log(greeting + ", " + this.name);
}

const person = { name: "Alice" };
greet.call(person, "Hi"); // "Hi, Alice" — this is forced to be person
```

**`.apply(thisArg, [arg1, arg2, ...])`** — Like `.call()`, but takes arguments as an array

```js
greet.apply(person, ["Hello"]); // "Hello, Alice"
```

**`.bind(thisArg)`** — Returns a **new function** with `this` permanently bound (doesn't call yet)

```js
const boundGreet = greet.bind(person);
boundGreet("Hey"); // "Hey, Alice" — now greet always has this = person
```

### Understanding Check

```js
const obj = {
  value: 10,
  show: () => console.log(this.value)
};

obj.show(); // What does this log?
```

**Answer:** `undefined` (or nothing in browsers)

**Why?** The arrow function `show` is defined at the global scope, so `this` is global/undefined.
Even though it's called as `obj.show()`, the arrow function ignores the call context and uses
the `this` from where it was written.

**Contrast:** If `show` were a regular function:

```js
const obj = {
  value: 10,
  show: function() { console.log(this.value); }
};

obj.show(); // 10 — this is obj because of Rule 1 (method call)
```

---

## 11. Nested Functions

JavaScript allows defining a function *inside* another function.

```js
function outer() {
  console.log("outer");
  function inner() {
    console.log("inner");
  }
  inner();
}
outer(); // logs "outer" then "inner"
```

This is the foundational concept behind **closures**.

---

## 12. Function Scope (2 Core Rules)

1. **A variable defined inside a function cannot be accessed from outside that function.**
2. **A function CAN access all variables available in the scope where it was defined**
   (its outer/enclosing scope) — but not the reverse.

```js
function doSomething() {
  let x = 10;
  console.log(x); // works
}
console.log(x); // ❌ Error: x is not defined
```

```js
var x = 10; // global scope
function doSomething() {
  console.log(x); // ✅ works — function can read outer scope
}
```

This applies to nested functions too: an inner function can access its outer function's
variables, but the outer function cannot access the inner function's variables.

---

## 13. Closures

A **closure** is created when a nested (inner) function "remembers" the variables of its
outer function, even after the outer function has finished executing.

```js
function outer(x) {
  function inner(y) {
    return x + y;
  }
  return inner;
}

const outerReturn = outer(10); // outer() has finished running
outerReturn(2); // 12 — x (10) is still "remembered" by inner
```

**Why it matters:** Normally, once a function finishes executing, its local variables are
gone. But because `inner` formed a closure over `outer`'s scope, the value `x = 10` persists
and can still be used later. This is the basis for things like:
- Data privacy / encapsulation (private variables)
- Memoization / caching
- Counters, generators, event handler state

**Closure = Nested Function + Function Scope.**

---

## 14. Callback Functions

In JS, functions are **first-class citizens** — they can be:
- Assigned to variables
- Returned from other functions
- **Passed as arguments to other functions**

A **callback** is a function passed as an argument to another function, to be "called back"
(invoked) — often based on a condition or at a later point in time.

```js
function foo(bar) {
  bar(); // calling the passed-in function
}

foo(function () {
  console.log("bar");
}); // anonymous function used as callback

function foo2(bar) {
  if (isNight) {
    bar();
  }
}
```

Callbacks are heavily used in asynchronous JS (timers, event listeners, API calls).

---

## 15. Higher-Order Functions (HOF)

A function is a **higher-order function** if it:
- Takes one or more functions as arguments, **and/or**
- Returns a function

```js
// Takes a function as argument (HOF)
function getCapture(camera) {
  camera();
}

// Returns a function (HOF)
function returnFn() {
  return function () {
    console.log("returning something");
  };
}
```

**HOF vs Callback — Not the Same Thing:**
- Every function that *accepts* a callback is technically a higher-order function.
- But a callback-accepting function isn't required to *return* a function.
- A HOF specifically refers to the broader concept of treating functions as values
  (accepting and/or returning them).

Built-in array methods — `map`, `filter`, `reduce`, `find`, etc. — are all higher-order
functions because they accept a function as an argument.

---

## 16. Pure vs Impure Functions

**Pure function:** Always returns the same output for the same input, with no side effects.

```js
function greeting(name) {
  return "Hello " + name;
}
greeting("Tapas"); // always "Hello Tapas"
```

**Impure function:** Output can change for the same input because it depends on something
outside its own scope (a **side effect**) — e.g. a global variable, network call, or
`console.log`/DOM manipulation.

```js
let greetingWord = "Hello";
function greeting(name) {
  return greetingWord + " " + name;
}
greeting("Tapas"); // "Hello Tapas"
greetingWord = "Hola";
greeting("Tapas"); // "Hola Tapas" — different output, same input!
```

**Why it matters:** Pure functions are predictable, easier to test, and easier to debug.
You can't always avoid impurity (network calls, logging, etc. are inherently impure), but
maximizing purity where possible improves code reliability.

---

## 17. IIFE — Immediately Invoked Function Expression

A function expression that executes **immediately** after being defined — no need to call
it separately by name.

```js
(function () {
  console.log("IIFE");
})();
```

**Syntax breakdown:**
1. Wrap an anonymous function in parentheses (the "grouping operator") → turns it into an
   expression.
2. Add `()` right after to invoke it immediately.

**Why use IIFE:**
- Avoids polluting the global scope with unnecessary named functions/variables (especially
  important before `let`/`const` existed).
- Useful for code that should run exactly once, immediately, in its own isolated scope.

---

## 18. Call Stack (Function Execution Stack)

JavaScript uses a **stack** data structure (LIFO — Last In, First Out) to track function
execution order.

- When a function is called, it's **pushed** onto the call stack.
- When that function finishes executing, it's **popped** off the stack.
- If a function calls another function, the new function is pushed on top, and must
  finish (and pop off) before execution returns to the calling function.

```js
function f1() { /* ... */ }
function f2() { f1(); }
function f3() { f2(); }
f3();
// Stack order (top to bottom as calls happen): f3 → f2 → f1
// Pops in reverse: f1 finishes first, then f2, then f3
```

This concept underlies how JS manages synchronous execution and is foundational for
understanding asynchronous JS (event loop, microtasks, etc.).

---

## 19. Recursion

A function that calls **itself** is called recursive.

```js
function foo() {
  console.log("foo");
  foo(); // calls itself — infinite without a stopping condition!
}
```

Without a stopping condition, this causes **"Maximum call stack size exceeded"** because the
call stack keeps growing until it overflows.

### Base Condition
Every recursive function needs a **base condition** — the condition under which recursion
stops.

```js
function fetchWater(count) {
  if (count === 0) {
    console.log("No more water left");
    return; // base condition — stops recursion
  }
  console.log("Fetching water");
  fetchWater(count - 1); // recursive call
}
fetchWater(5);
```

**Recursion vs Loops:** Anything done with recursion could often be done with a `for` loop.
Recursion is generally preferred when it makes the logic more **readable** — e.g. computing
a factorial reads more naturally as a recursive function than as a loop.

---

## 20. Pass by Value vs Pass by Reference in JavaScript

This is a crucial concept for understanding how data behaves when passed into functions or
assigned to other variables.

### The Core Rule in JS
- **Primitive types** (`number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`)
  are **passed by value**.
- **Reference types** (`object`, `array`, `function`) are **passed by reference**
  (more precisely: the *reference/memory address* is passed by value — see nuance below).

### Pass by Value (Primitives)

When you pass a primitive to a function or assign it to another variable, a **copy** of the
actual value is made. Changes to the copy do NOT affect the original.

```js
let a = 10;
let b = a; // b gets a COPY of a's value
b = 20;
console.log(a); // 10 — unchanged
console.log(b); // 20

function changeValue(x) {
  x = 100; // only changes the local copy
}
let num = 5;
changeValue(num);
console.log(num); // 5 — unchanged
```

### Pass by Reference (Objects/Arrays/Functions)

When you pass an object/array to a function or assign it to another variable, you're not
copying the object itself — you're copying a **reference (pointer)** to the same location in
memory. Both variables now point to the SAME object, so mutating it through one variable is
visible through the other.

```js
let obj1 = { name: "Tapas" };
let obj2 = obj1; // obj2 points to the SAME object as obj1
obj2.name = "Code"; 
console.log(obj1.name); // "Code" — changed! Same underlying object.

function updateUser(userObj) {
  userObj.name = "Updated"; // mutates the original object
}
let user = { name: "Original" };
updateUser(user);
console.log(user.name); // "Updated"
```

### Important Nuance: Reassignment vs Mutation

This trips up a lot of developers — **reassigning** a parameter inside a function does NOT
affect the original reference, but **mutating** the object's properties does.

```js
function reassign(userObj) {
  userObj = { name: "Brand New Object" }; // reassigns the LOCAL variable only
}
let user = { name: "Original" };
reassign(user);
console.log(user.name); // "Original" — unaffected! The outer `user` still points to the old object.

function mutate(userObj) {
  userObj.name = "Mutated"; // mutates the EXISTING object's property
}
mutate(user);
console.log(user.name); // "Mutated" — affected, because we changed the object itself, not the reference.
```

**Why this happens:** Technically, JavaScript always passes the *value of the reference* (the
memory address) by value. So:
- If you mutate the object the reference points to → the change is visible everywhere that
  shares that reference.
- If you reassign the local variable to point to a brand-new object → you've only changed
  what the *local copy of the reference* points to; the original variable outside the
  function still points to the old object.

### Why This Matters in Real Code

1. **Unexpected bugs:** Passing an object/array into a function and mutating it can silently
   change data the caller didn't expect to change. This is a common source of bugs in larger
   applications.
2. **Avoiding side effects (ties back to Pure Functions, Section 13):** A "pure" function
   should avoid mutating objects/arrays passed into it. Prefer creating and returning a new
   object/array instead:
   ```js
   // Impure — mutates input
   function addItem(arr, item) {
     arr.push(item);
     return arr;
   }

   // Pure — returns a new array, doesn't touch the original
   function addItemPure(arr, item) {
     return [...arr, item];
   }
   ```
3. **Copying objects safely:** If you want an independent copy of an object/array (not just
   another reference to the same one), you need to explicitly clone it:
   ```js
   const original = { name: "Tapas", skills: ["JS", "React"] };

   // Shallow copy
   const shallowCopy = { ...original };
   // or
   const shallowCopy2 = Object.assign({}, original);

   // Deep copy (nested objects/arrays also fully copied)
   const deepCopy = structuredClone(original); // modern, built-in
   // or (older approach)
   const deepCopyOld = JSON.parse(JSON.stringify(original));
   ```
   Note: a **shallow copy** only copies the top-level properties — if a property is itself
   an object/array, that nested object is still shared by reference between the original and
   the copy. A **deep copy** recursively copies everything so nothing is shared.

### Quick Summary Table

| Type | Passed As | Copying Behavior |
|---|---|---|
| `number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint` | By Value | Independent copy made; original untouched |
| `object`, `array`, `function` | By Reference | Same memory reference shared; mutations visible everywhere; reassignment is local only |

---

## 21. What "Type" Is a Function? Why Can We Assign It to a Variable?

### `typeof` a function

```js
function foo() {}
console.log(typeof foo); // "function"
```

But under the hood, **a function is actually a special kind of object** — a "callable
object." You can prove this:

```js
function foo() {}
console.log(foo instanceof Object);  // true
foo.myProperty = "hello";            // you can attach properties, like any object!
console.log(foo.myProperty);         // "hello"
console.log(foo.name);               // "foo" — built-in property
console.log(foo.length);             // number of parameters it expects
```

`typeof` reports `"function"` as a special-cased convenience, but really it's an object that:
- Has properties, like any object
- Can be stored in variables, arrays, object properties
- Can be passed around and returned
- Has one special extra ability: it can be **invoked** with `()`

This is exactly what people mean by **"functions are first-class citizens in JavaScript."**
Anything you can do with a value (a number, string, or object) — assign it, pass it, return
it, store it — you can also do with a function.

### Why can we assign a function to a variable?

Because a function is just a **value**, the same way `10` or `"hello"` or `{}` are values.
`const x = function () {}` is conceptually no different from `const x = 5`. There's nothing
special restricting it — JS treats functions as ordinary data that happens to also be callable.

### Why is this useful? What's the actual advantage?

**1. You can pass functions around like data — the big one.**
This is what makes callbacks, event handling, and array methods possible:
```js
button.addEventListener("click", function () {
  console.log("clicked!");
});

[1, 2, 3].map(function (n) {
  return n * 2;
});
```
Without functions being assignable/passable values, there'd be no way to say "run this logic
later, when X happens" or "use this rule to filter/sort this data."

**2. Dynamic / conditional function choice.**
```js
let operation;
if (userWantsAddition) {
  operation = (a, b) => a + b;
} else {
  operation = (a, b) => a - b;
}
operation(5, 3); // decided at runtime
```
You can swap out *which behavior* runs based on a condition — the same way you'd swap out a
variable's value, except the "value" here is a chunk of logic.

**3. Returning functions / closures.**
```js
function multiplier(factor) {
  return function (x) {
    return x * factor;
  };
}
const double = multiplier(2);
double(5); // 10
```
You can manufacture customized functions on the fly and hand them back as values — this is
the foundation of closures, currying, and memoization (see Section 13).

**4. Anonymous, throwaway logic without polluting scope.**
If a function is only used in one place, you don't need to give it a permanent named slot in
the outer/global scope — just assign or pass it inline (e.g. directly inside `.map()` or as a
callback argument).

**5. Higher-order patterns / composition.**
Because functions can both take and return other functions, you can compose small reusable
pieces of logic into bigger behavior — the basis of functional programming style in JS
(see Section 15, Higher-Order Functions).

> **One-sentence summary:** A function in JS is just an object you can call — and because
> it's a value like any other, you can store it, pass it, return it, and swap it out
> dynamically, which is what makes JavaScript's event-driven, callback-based, functional
> style of programming possible in the first place.

---

## 22. Closing Summary / Concept Map

```
Functions Fundamentals
        │
        ├── Declaration vs Expression
        ├── Parameters vs Arguments
        ├── Default & Rest Parameters
        ├── Arrow Functions
        ├── Arrow vs Normal Functions ──► this Binding
        │
        ├── Nested Functions ──► Function Scope ──► Closures
        │
        ├── First-Class Functions
        │        ├── Callback Functions
        │        └── Higher-Order Functions
        │
        ├── Pure vs Impure Functions ──► relates to ──► Pass by Value vs Reference
        │
        ├── IIFE
        │
        ├── Call Stack / Function Execution
        │
        └── Recursion (+ Base Condition)
```

**Recommended practice approach:**
- Don't binge — take breaks between topics.
- After each concept, pause and try writing the code yourself before moving on.
- Revisit nested functions → function scope → closures together since they build on each
  other directly.
- Practice mutating vs reassigning objects deliberately to internalize pass-by-reference
  behavior — it's one of the most common sources of real-world bugs.
- Study arrow functions vs normal functions and the `this` keyword together — these concepts
  are deeply connected and commonly misunderstood.