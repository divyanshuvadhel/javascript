# `this` in JavaScript 

> **Prerequisite**: Functions, objects, constructors, and scope.  
> **Time to master**: ~4–5 hours of deep reading + practice.  
> **Goal**: Understand not just *what* `this` points to, but **how** the engine determines it and **why** the language behaves this way.

---

## Table of Contents
1. [What Is `this`? (The Real Definition)](#1-what-is-this-the-real-definition)
2. [The Four Binding Rules](#2-the-four-binding-rules)
3. [Rule 1: Default Binding](#3-rule-1-default-binding)
4. [Rule 2: Implicit Binding](#4-rule-2-implicit-binding)
5. [Rule 3: Explicit Binding](#5-rule-3-explicit-binding)
6. [Rule 4: `new` Binding](#6-rule-4-new-binding)
7. [Binding Precedence](#7-binding-precedence)
8. [Arrow Functions & Lexical `this`](#8-arrow-functions--lexical-this)
9. [`this` in Different Contexts](#9-this-in-different-contexts)
10. [The `this` Binding Lifecycle (Internal)](#10-the-this-binding-lifecycle-internal)
11. [Common Pitfalls & Gotchas](#11-common-pitfalls--gotchas)
12. [Edge Cases & Brain Teasers](#12-edge-cases--brain-teasers)
13. [The "Why" — Design Decisions](#13-the-why--design-decisions)
14. [Visual Execution Walkthroughs](#14-visual-execution-walkthroughs)
15. [Practice Exercises (15 Total)](#15-practice-exercises)
16. [Anti-Patterns & Best Practices](#16-anti-patterns--best-practices)
17. [One-Liner Summary](#17-one-liner-summary)

---

## 1. What Is `this`? (The Real Definition)

**`this`** is a runtime binding that is determined by **how a function is called**, not where it is declared.

> **Critical distinction**: `this` has nothing to do with where a function is written. It has everything to do with **the call site** — the location in code where the function is invoked.

```js
function identify() {
  return this.name;
}

const person1 = { name: "Alice", identify };
const person2 = { name: "Bob", identify };

person1.identify(); // "Alice" — this is person1
person2.identify(); // "Bob" — this is person2
```

Same function. Different `this`. Because the **call site** is different.

### `this` is NOT:
- ❌ The function itself
- ❌ The scope of the function
- ❌ A fixed reference to the object where the method was defined
- ❌ A compile-time constant

### `this` IS:
- ✅ A runtime binding set at the **call site**
- ✅ A reference to an **execution context object**
- ✅ Determined by one of four binding rules (or arrow functions)

---

## 2. The Four Binding Rules

Every function invocation in JavaScript determines `this` through one of these four rules:

| Rule | How It Works | Example |
|------|-------------|---------|
| **Default Binding** | Standalone function call | `foo()` |
| **Implicit Binding** | Method call on an object | `obj.foo()` |
| **Explicit Binding** | `call`, `apply`, `bind` | `foo.call(obj)` |
| **`new` Binding** | Constructor invocation | `new Foo()` |

---

## 3. Rule 1: Default Binding

When a function is called with a plain, un-decorated function reference, `this` defaults to the **global object** (non-strict mode) or **`undefined`** (strict mode).

### Non-Strict Mode (Browser)
```js
function greet() {
  console.log(this); // window (global object)
}
greet(); // Default binding
```

### Strict Mode
```js
"use strict";
function greet() {
  console.log(this); // undefined
}
greet(); // Default binding → undefined in strict mode
```

> **Why the difference?** Strict mode was designed to prevent accidental global pollution. If `this` defaulted to the global object, assigning to `this.something` would create a global variable. Returning `undefined` forces the error to surface.

### The "why" behind default binding:
```js
function setName(name) {
  this.name = name; // In non-strict mode: creates window.name!
}
setName("Alice");   // Oops — just polluted the global object
```

---

## 4. Rule 2: Implicit Binding

When a function is called as a method of an object (using dot notation or bracket notation), `this` is bound to that **owning object**.

```js
const person = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

person.greet(); // "Hello, I'm Alice" — this === person
```

### Implicit binding only matters at the call site:
```js
const person = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

const greet = person.greet; // Reference to the function

greet(); // undefined (or window.name in non-strict)
// Why? The call site is just greet(), not person.greet()
```

> **The binding is lost when the function reference is assigned to another variable.** Only the final call site matters.

### Implicit binding with nested objects:
```js
const company = {
  name: "TechCorp",
  ceo: {
    name: "Alice",
    introduce() {
      console.log(this.name);
    }
  }
};

company.ceo.introduce(); // "Alice" — this === company.ceo
```

### Implicit binding with method chaining:
```js
const obj = {
  value: 1,
  getValue() {
    console.log(this.value);
    return this; // Enable chaining
  },
  addOne() {
    this.value++;
    return this;
  }
};

obj.getValue().addOne().getValue(); // 1, then 2
```

---

## 5. Rule 3: Explicit Binding

You can force `this` to be a specific object using `call()`, `apply()`, or `bind()`.

### `call()` — invoke with explicit `this` and arguments
```js
function introduce(greeting) {
  console.log(`${greeting}, I'm ${this.name}`);
}

const person = { name: "Alice" };
introduce.call(person, "Hello"); // "Hello, I'm Alice"
```

### `apply()` — same as `call()`, but arguments as array
```js
introduce.apply(person, ["Hi"]); // "Hi, I'm Alice"
```

> **When to use `apply` over `call`?** When you don't know the number of arguments (e.g., spreading an array).

### `bind()` — returns a new function with `this` permanently bound
```js
const boundIntroduce = introduce.bind(person);
boundIntroduce("Hey"); // "Hey, I'm Alice"

// bind also accepts preset arguments (partial application)
const sayHello = introduce.bind(person, "Hello");
sayHello(); // "Hello, I'm Alice"
```

> `bind()` creates a **hard binding** — `this` cannot be overridden, even with `call()` or `apply()`.

```js
const boundFn = introduce.bind(person);
boundFn.call({ name: "Bob" }, "Hi"); // Still "Hi, I'm Alice" — hard binding wins!
```

### Explicit binding with primitive values:
```js
function showThis() {
  console.log(this);
}

showThis.call("hello"); // String object wrapper: [String: 'hello']
showThis.call(42);       // Number object wrapper: [Number: 42]
showThis.call(null);     // global object (non-strict) or null (strict)
showThis.call(undefined); // same as null
```

> In non-strict mode, `null` and `undefined` passed to `call`/`apply` are replaced with the global object. In strict mode, they remain as-is.

---

## 6. Rule 4: `new` Binding

When a function is called with the `new` keyword, four things happen:

1. A brand new empty object is created
2. That object is linked to the constructor's prototype (`[[Prototype]]`)
3. `this` is bound to that new object
4. If the constructor doesn't return an object, `this` is returned implicitly

```js
function Person(name) {
  this.name = name; // this === the new object
}

const alice = new Person("Alice");
console.log(alice.name); // "Alice"
```

### What happens internally:
```js
// Conceptually:
function Person(name) {
  // Step 1: this = {} (new object created)
  // Step 2: Object.setPrototypeOf(this, Person.prototype)
  this.name = name; // Step 3: populate the object
  // Step 4: return this (implicitly)
}
```

### Constructor returning an object:
```js
function Weird() {
  this.value = 1;
  return { value: 2 }; // Returns THIS object instead of this
}

const w = new Weird();
console.log(w.value); // 2 — the returned object, not the new this
```

> If a constructor explicitly returns an object, that object becomes the result of `new`. If it returns a primitive, it's ignored and `this` is returned.

---

## 7. Binding Precedence

When multiple rules could apply, which wins?

```
1. new binding (highest priority)
2. explicit binding (call, apply, bind)
3. implicit binding (obj.method())
4. default binding (lowest priority)
```

### Precedence demonstration:
```js
function foo() {
  console.log(this.a);
}

const obj1 = { a: 2, foo };
const obj2 = { a: 3 };

obj1.foo();           // 2 — implicit binding
obj1.foo.call(obj2);  // 3 — explicit beats implicit

const bound = obj1.foo.bind(obj2);
new bound();          // undefined — new beats hard binding!
// (new creates a fresh object, ignores the bound this)
```

### `new` vs `bind`:
```js
function bar() {
  console.log(this);
}

const boundBar = bar.bind({ name: "bound" });
new boundBar(); // {} — new creates a fresh object, bind is ignored!
```

> **`new` binding has the highest precedence.** Even a hard-bound function can have its `this` overridden by `new`.

---

## 8. Arrow Functions & Lexical `this`

Arrow functions **do NOT have their own `this`**. They inherit `this` from the **enclosing (lexical) scope** — the scope where the arrow function was **defined**, not where it was called.

```js
const person = {
  name: "Alice",
  greet: () => {
    console.log(this.name); // this === outer scope (global or undefined)
  }
};

person.greet(); // undefined (or window.name)
```

> Arrow functions should NOT be used as object methods if you need `this` to refer to the object.

### Arrow functions solve the "lost `this`" problem:
```js
const person = {
  name: "Alice",
  friends: ["Bob", "Carol"],
  showFriends() {
    // this === person
    this.friends.forEach(friend => {
      console.log(`${this.name} is friends with ${friend}`);
      // this === person (inherited from showFriends)
    });
  }
};

person.showFriends();
// "Alice is friends with Bob"
// "Alice is friends with Carol"
```

### Arrow functions in setTimeout:
```js
const person = {
  name: "Alice",
  delayedGreet() {
    setTimeout(() => {
      console.log(this.name); // "Alice" — inherits from delayedGreet
    }, 100);
  }
};

person.delayedGreet();
```

### Arrow functions cannot be bound:
```js
const arrow = () => console.log(this);
const obj = { name: "test" };

arrow.call(obj); // Still the outer this — arrow functions ignore explicit binding!
```

> Arrow functions are **immune** to `call`, `apply`, and `bind`. They always use their lexical `this`.

### Arrow functions cannot be used as constructors:
```js
const Arrow = () => {};
new Arrow(); // TypeError: Arrow is not a constructor
```

---

## 9. `this` in Different Contexts

### 9.1 Global Context
```js
// Browser:
console.log(this); // window

// Node.js (module):
console.log(this); // {} (module.exports)

// Node.js (REPL):
console.log(this); // global object
```

### 9.2 Function Context
```js
function regular() {
  console.log(this); // window (non-strict) or undefined (strict)
}
regular();

const arrow = () => {
  console.log(this); // inherits from enclosing scope
};
arrow();
```

### 9.3 Object Method Context
```js
const obj = {
  value: 42,
  getValue() {
    return this.value; // this === obj
  }
};
obj.getValue(); // 42
```

### 9.4 Event Handler Context (DOM)
```js
button.addEventListener("click", function() {
  console.log(this); // the button element (implicit binding)
});

button.addEventListener("click", () => {
  console.log(this); // window (lexical, not the button!)
});
```

> **Always use regular functions for event handlers if you need `this` to be the DOM element.**

### 9.5 Class Context
```js
class Person {
  constructor(name) {
    this.name = name; // this === the new instance
  }

  greet() {
    console.log(this.name); // this === the instance (when called as method)
  }
}

const alice = new Person("Alice");
alice.greet(); // "Alice"
```

### 9.6 Module Context
```js
// ES Module: this is undefined at the top level
console.log(this); // undefined

// CommonJS: this === module.exports
console.log(this); // { ... }
```

### 9.7 Callback Context
```js
const person = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

setTimeout(person.greet, 100); // undefined! (binding lost)
setTimeout(() => person.greet(), 100); // "Alice" (preserved via closure)
setTimeout(person.greet.bind(person), 100); // "Alice" (hard bound)
```

### 9.8 Array Method Context
```js
const obj = {
  multiplier: 2,
  numbers: [1, 2, 3],
  double() {
    return this.numbers.map(function(n) {
      return n * this.multiplier; // ❌ this === window/undefined!
    });
  },
  doubleFixed() {
    return this.numbers.map(n => n * this.multiplier); // ✅ arrow inherits this
  }
};
```

---

## 10. The `this` Binding Lifecycle (Internal)

### How the engine determines `this` at runtime:

```
Step 1: Identify the call site
        ↓
Step 2: Is the call decorated with .call(), .apply(), or .bind()?
        → YES: Use the explicitly provided object (unless new binding overrides)
        → NO: Continue
        ↓
Step 3: Is the function called with new?
        → YES: Bind this to the newly created object
        → NO: Continue
        ↓
Step 4: Is the function called as a method (obj.method())?
        → YES: Bind this to the owning object
        → NO: Continue
        ↓
Step 5: Default binding
        → Non-strict: global object
        → Strict: undefined
        ↓
Step 6: Is it an arrow function?
        → YES: Use lexical this (skip all above rules)
```

### Internal representation:
```js
// Conceptual engine behavior for: obj.method()
function invoke(fn, context, args) {
  if (fn.isArrowFunction) {
    return fn.call(fn.lexicalThis, ...args); // lexical this
  }

  if (args.isNewCall) {
    const newObj = Object.create(fn.prototype);
    const result = fn.call(newObj, ...args);
    return typeof result === "object" ? result : newObj;
  }

  if (args.explicitThis) {
    return fn.call(args.explicitThis, ...args);
  }

  if (context) {
    return fn.call(context, ...args); // implicit binding
  }

  return fn.call(strictMode ? undefined : globalObject, ...args); // default
}
```

---

## 11. Common Pitfalls & Gotchas

### Pitfall 1: Callbacks losing implicit binding
```js
const person = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

// Binding lost:
setTimeout(person.greet, 100); // undefined

// Solutions:
setTimeout(() => person.greet(), 100);     // Arrow wrapper
setTimeout(person.greet.bind(person), 100); // Hard bind
setTimeout(function() { person.greet(); }, 100); // Closure wrapper
```

### Pitfall 2: Borrowed methods
```js
const person1 = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

const person2 = { name: "Bob" };

person1.greet.call(person2); // "Bob" — explicit binding

// But:
const greet = person1.greet;
greet(); // undefined — default binding!
```

### Pitfall 3: Nested functions
```js
const obj = {
  name: "Alice",
  outer() {
    console.log(this.name); // "Alice"

    function inner() {
      console.log(this.name); // undefined! (default binding)
    }
    inner();
  }
};
obj.outer();
```

**Fix with arrow function:**
```js
const obj = {
  name: "Alice",
  outer() {
    const inner = () => {
      console.log(this.name); // "Alice" — lexical this
    };
    inner();
  }
};
```

**Fix with `bind`:**
```js
const obj = {
  name: "Alice",
  outer() {
    function inner() {
      console.log(this.name);
    }
    inner.bind(this)(); // "Alice"
  }
};
```

### Pitfall 4: Event listeners with arrow functions
```js
const button = document.querySelector("button");

button.addEventListener("click", function() {
  this.textContent = "Clicked!"; // ✅ this === button
});

button.addEventListener("click", () => {
  this.textContent = "Clicked!"; // ❌ this === window
});
```

### Pitfall 5: Class methods losing context
```js
class Counter {
  count = 0;
  increment() {
    this.count++;
  }
}

const counter = new Counter();
const increment = counter.increment;
increment(); // ❌ TypeError: Cannot read property 'count' of undefined
// this === undefined (strict mode class)
```

**Fix with class fields (arrow functions):**
```js
class Counter {
  count = 0;
  increment = () => { // Arrow function as class field
    this.count++;
  };
}
```

**Fix with bind in constructor:**
```js
class Counter {
  constructor() {
    this.count = 0;
    this.increment = this.increment.bind(this);
  }
  increment() {
    this.count++;
  }
}
```

### Pitfall 6: `this` in forEach with strict mode
```js
"use strict";
const obj = {
  values: [1, 2, 3],
  process() {
    this.values.forEach(function(v) {
      console.log(this); // undefined in strict mode!
    });
  }
};
```

**Fix:**
```js
this.values.forEach(function(v) {
  console.log(this); // obj
}, this); // forEach accepts a second argument for this!
```

---

## 12. Edge Cases & Brain Teasers

### Edge Case 1: Chained method calls
```js
const obj = {
  name: "Alice",
  getName() {
    return this.name;
  }
};

(obj.getName)(); // "Alice" — grouping doesn't change call site
(0, obj.getName)(); // undefined — comma operator returns the function reference, losing context
```

### Edge Case 2: `eval` and `this`
```js
function test() {
  eval("console.log(this)"); // this === test's this (inherited)
}
test.call({ name: "eval" }); // { name: "eval" }
```

### Edge Case 3: `with` statement (legacy)
```js
const obj = { a: 1 };
with (obj) {
  console.log(a); // 1 — looks up obj.a
  function show() {
    console.log(this); // window (default binding inside with)
  }
  show();
}
```

### Edge Case 4: `super` and `this` in classes
```js
class Parent {
  constructor() {
    this.name = "Parent";
  }
}

class Child extends Parent {
  constructor() {
    super(); // Must call before using this
    this.name = "Child";
  }
}
```

> In derived classes, `this` is not available until `super()` is called because the parent constructor must initialize the object first.

### Edge Case 5: `Function.prototype.call` on arrow functions
```js
const arrow = () => console.log(this);
arrow.call({ name: "forced" }); // Still the outer this — arrows ignore explicit binding!
```

### Edge Case 6: `bind` on bound functions
```js
function greet() {
  console.log(this.name);
}

const bound1 = greet.bind({ name: "Alice" });
const bound2 = bound1.bind({ name: "Bob" }); // Cannot rebind!
bound2(); // "Alice" — hard binding is permanent
```

### Edge Case 7: `this` in getter/setter
```js
const obj = {
  _value: 0,
  get value() {
    return this._value; // this === obj
  },
  set value(v) {
    this._value = v; // this === obj
  }
};

obj.value = 10;
console.log(obj.value); // 10
```

### Edge Case 8: `this` in IIFE
```js
const obj = {
  name: "Alice",
  init() {
    (function() {
      console.log(this.name); // undefined! (default binding)
    })();

    (() => {
      console.log(this.name); // "Alice" (lexical)
    })();
  }
};
obj.init();
```

### Edge Case 9: `this` in object destructuring
```js
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

const { greet } = obj;
greet(); // undefined — binding lost during destructuring!
```

### Edge Case 10: `this` in `Object.defineProperty`
```js
const obj = {};
Object.defineProperty(obj, "greet", {
  value: function() {
    console.log(this === obj); // true when called as obj.greet()
  }
});
```

---

## 13. The "Why" — Design Decisions

### Why is `this` dynamic and not lexical?

**1. Flexibility and reusability:**
```js
function speak() {
  console.log(this.name + " says hello");
}

const alice = { name: "Alice", speak };
const bob = { name: "Bob", speak };

alice.speak(); // "Alice says hello"
bob.speak();   // "Bob says hello"
```
One function, multiple contexts. This enables the prototype-based sharing model.

**2. Prototype inheritance:**
```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  console.log(this.name);
};

const dog = new Animal("Rex");
dog.speak(); // "Rex" — this is dog, found via prototype chain
```

**3. Callback patterns:**
```js
// jQuery-style:
$("button").on("click", function() {
  $(this).addClass("active"); // this === clicked button
});
```

### Why arrow functions have lexical `this`?

**1. To solve the callback problem:**
Before arrows, developers had to use `var self = this` or `.bind(this)` everywhere:
```js
// Pre-ES6:
var self = this;
setTimeout(function() {
  console.log(self.name); // Had to capture this manually
}, 100);

// ES6:
setTimeout(() => {
  console.log(this.name); // Arrow inherits this automatically
}, 100);
```

**2. Arrow functions are designed for short, callback-style functions where the outer `this` is almost always what you want.**

### Why strict mode changes default binding to `undefined`?

To prevent accidental global pollution:
```js
function setGlobal() {
  this.value = 42; // In non-strict: creates window.value!
}
setGlobal();
```

With strict mode, this throws an error immediately, catching the bug.

### Why does `new` override `bind`?

Because `bind` is meant to create a function with a fixed `this` for regular calls. But `new` is a special operation that creates a fresh object — it would be confusing if `new` couldn't create a new instance because of a hard-bound `this`.

---

## 14. Visual Execution Walkthroughs

### Walkthrough 1: Implicit Binding
```js
// Source:
const person = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};
person.greet();

// Execution:
// 1. person object is created with name and greet method
// 2. person.greet() is called
// 3. Engine sees call site: obj.method() → implicit binding
// 4. this is bound to person
// 5. console.log(this.name) → "Alice"
```

### Walkthrough 2: Lost Binding
```js
// Source:
const person = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};
const greet = person.greet;
greet();

// Execution:
// 1. greet = person.greet — stores reference to function only
// 2. greet() — call site is standalone function call
// 3. Engine applies default binding
// 4. Non-strict: this = window → window.name (usually "")
// 5. Strict: this = undefined → undefined.name → TypeError
```

### Walkthrough 3: Explicit Binding
```js
// Source:
function showName() {
  console.log(this.name);
}
const person = { name: "Alice" };
showName.call(person);

// Execution:
// 1. showName.call(person) — explicit binding
// 2. Engine sets this = person for this call
// 3. console.log(this.name) → "Alice"
// 4. Function returns, this binding is gone (not permanent)
```

### Walkthrough 4: Hard Binding
```js
// Source:
function showName() {
  console.log(this.name);
}
const person = { name: "Alice" };
const bound = showName.bind(person);
bound();

// Execution:
// 1. bind creates a new function wrapping showName
// 2. The wrapper permanently sets this = person
// 3. bound() calls the wrapper
// 4. Wrapper calls showName.call(person)
// 5. console.log(this.name) → "Alice"
// 6. Even bound.call(otherObj) won't change this!
```

### Walkthrough 5: Constructor
```js
// Source:
function Person(name) {
  this.name = name;
}
const alice = new Person("Alice");

// Execution:
// 1. new creates empty object: {}
// 2. Links prototype: {}.__proto__ = Person.prototype
// 3. Calls Person with this = {}
// 4. this.name = "Alice" → {} becomes { name: "Alice" }
// 5. No explicit return, so return { name: "Alice" }
// 6. alice = { name: "Alice" }
```

### Walkthrough 6: Arrow Function Lexical `this`
```js
// Source:
const person = {
  name: "Alice",
  friends: ["Bob"],
  show() {
    this.friends.forEach(friend => {
      console.log(this.name + " → " + friend);
    });
  }
};
person.show();

// Execution:
// 1. person.show() — implicit binding, this = person
// 2. forEach calls the arrow function
// 3. Arrow function has no own this — looks up to enclosing scope
// 4. Enclosing scope is show(), where this = person
// 5. console.log(this.name) → "Alice"
```

---

## 15. Practice Exercises

### Exercise 1 — Basic Implicit Binding
```js
const user = {
  name: "Alice",
  sayHi() {
    console.log(this.name);
  }
};
user.sayHi();
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
Alice
```

**Explanation:** `user.sayHi()` is a method call. The call site is `obj.method()`, so implicit binding applies. `this` is bound to `user`. `this.name` is `"Alice"`.
</details>

---

### Exercise 2 — Lost Binding
```js
const user = {
  name: "Alice",
  sayHi() {
    console.log(this.name);
  }
};
const hi = user.sayHi;
hi();
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict):**
```
// window.name (usually empty string)
```

**Output (strict):**
```
TypeError: Cannot read property 'name' of undefined
```

**Explanation:** When `user.sayHi` is assigned to `hi`, only the function reference is copied. The connection to `user` is lost. When `hi()` is called, it's a standalone function call — default binding applies. In strict mode, `this` is `undefined`. In non-strict mode, `this` is the global object.
</details>

---

### Exercise 3 — Explicit Binding
```js
function greet() {
  console.log(`Hello, ${this.name}`);
}
const person1 = { name: "Alice" };
const person2 = { name: "Bob" };

greet.call(person1);
greet.call(person2);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
Hello, Alice
Hello, Bob
```

**Explanation:** `call()` explicitly sets `this` to the first argument. The first call sets `this = person1`, the second sets `this = person2`. The same function produces different outputs based on the explicit `this` binding.
</details>

---

### Exercise 4 — `bind` vs `call`
```js
function show() {
  console.log(this.name);
}
const obj = { name: "Alice" };
const bound = show.bind(obj);

bound();
bound.call({ name: "Bob" });
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
Alice
Alice
```

**Explanation:** `bind` creates a **hard-bound** function. `this` is permanently set to `obj`. Even calling `bound.call({ name: "Bob" })` cannot override it. Hard binding is permanent for regular calls.
</details>

---

### Exercise 5 — Constructor Binding
```js
function Animal(name) {
  this.name = name;
}

const dog = new Animal("Rex");
console.log(dog.name);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
Rex
```

**Explanation:** `new` creates a fresh object, sets `this` to that object, and calls `Animal`. `this.name = "Rex"` populates the new object. Since no object is explicitly returned, `this` (the new object) is returned implicitly.
</details>

---

### Exercise 6 — Arrow Function `this`
```js
const obj = {
  name: "Alice",
  regular: function() {
    console.log(this.name);
  },
  arrow: () => {
    console.log(this.name);
  }
};

obj.regular();
obj.arrow();
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict):**
```
Alice
// window.name (or empty string)
```

**Output (strict):**
```
Alice
undefined
```

**Explanation:** `obj.regular()` uses implicit binding — `this` is `obj`. `obj.arrow()` is an arrow function. Arrow functions don't have their own `this`; they inherit from the enclosing scope. The enclosing scope is the global scope (where `obj` was defined), so `this` is the global object (or `undefined` in strict mode).
</details>

---

### Exercise 7 — Nested Functions
```js
const obj = {
  name: "Alice",
  outer() {
    console.log(this.name);
    function inner() {
      console.log(this.name);
    }
    inner();
  }
};
obj.outer();
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict):**
```
Alice
// window.name
```

**Output (strict):**
```
Alice
TypeError
```

**Explanation:** `obj.outer()` uses implicit binding, so `this` is `obj` — prints `"Alice"`. Inside `outer()`, `inner()` is a standalone function call. Default binding applies. In non-strict mode, `this` is the global object. In strict mode, `this` is `undefined`, causing a TypeError when accessing `.name`.
</details>

---

### Exercise 8 — Callback Binding
```js
const user = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

setTimeout(user.greet, 100);
setTimeout(() => user.greet(), 100);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
undefined (or window.name)
Alice
```

**Explanation:** `setTimeout(user.greet, 100)` passes the function reference only. When `setTimeout` calls it later, it's a standalone call — default binding. The second `setTimeout` wraps the call in an arrow function. The arrow function preserves the outer `this` (which is the global scope), but more importantly, it calls `user.greet()` directly, preserving the implicit binding.

Actually, more precisely: the arrow function `() => user.greet()` doesn't care about its own `this`. It simply calls `user.greet()`, which is a method call on `user`, so implicit binding applies.
</details>

---

### Exercise 9 — Precedence
```js
function foo() {
  console.log(this.a);
}

const obj1 = { a: 2, foo };
const obj2 = { a: 3 };

obj1.foo();
obj1.foo.call(obj2);

const bound = obj1.foo.bind(obj2);
new bound();
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
2
3
undefined
```

**Explanation:**
1. `obj1.foo()` — implicit binding, `this = obj1`, prints `2`
2. `obj1.foo.call(obj2)` — explicit binding overrides implicit, `this = obj2`, prints `3`
3. `new bound()` — `new` binding has highest precedence. Even though `bound` is hard-bound to `obj2`, `new` creates a fresh object and sets `this` to it. The new object has no `a` property, so `this.a` is `undefined`.
</details>

---

### Exercise 10 — Class Methods
```js
class Counter {
  count = 0;
  increment() {
    this.count++;
  }
}

const c = new Counter();
const inc = c.increment;
inc();
console.log(c.count);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
TypeError: Cannot read property 'count' of undefined
```

**Explanation:** Classes run in strict mode by default. When `c.increment` is assigned to `inc`, the binding to `c` is lost. Calling `inc()` is a standalone call — default binding applies. In strict mode, `this` is `undefined`. `undefined.count++` throws a TypeError.
</details>

---

### Exercise 11 — Arrow Function in Object
```js
const obj = {
  name: "Alice",
  greet: () => {
    console.log(this.name);
  },
  regularGreet: function() {
    const arrow = () => {
      console.log(this.name);
    };
    arrow();
  }
};

obj.greet();
obj.regularGreet();
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict):**
```
// window.name (or empty)
Alice
```

**Explanation:** `obj.greet()` is an arrow function. It inherits `this` from the global scope (where `obj` was defined), not from `obj`. `obj.regularGreet()` is a regular function with implicit binding (`this = obj`). Inside it, `arrow()` is an arrow function that inherits `this` from `regularGreet`, which is `obj`. So it prints `"Alice"`.
</details>

---

### Exercise 12 — Event Handler Context
```js
// Simulate (imagine this is in a browser):
const button = {
  text: "Click me",
  onClick: function() {
    console.log(this.text);
  },
  onClickArrow: () => {
    console.log(this.text);
  }
};

button.onClick();
button.onClickArrow();
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict):**
```
Click me
// window.text (or undefined)
```

**Explanation:** `button.onClick()` uses implicit binding — `this` is `button`, prints `"Click me"`. `button.onClickArrow()` is an arrow function. It inherits `this` from the global scope, not from `button`. In a real DOM event, the same applies: regular functions get the element as `this`, arrow functions get the outer scope's `this`.
</details>

---

### Exercise 13 — `bind` Chain
```js
function getName() {
  return this.name;
}

const alice = { name: "Alice" };
const bob = { name: "Bob" };
const carol = { name: "Carol" };

const boundToAlice = getName.bind(alice);
const boundToBob = boundToAlice.bind(bob);
const boundToCarol = boundToBob.bind(carol);

console.log(boundToCarol());
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
Alice
```

**Explanation:** `bind` creates a hard binding. Once bound, `this` cannot be changed by subsequent `bind` calls. The first `bind(alice)` sets `this` permanently to `alice`. All later `bind` calls are ignored. This is why it's called "hard binding."
</details>

---

### Exercise 14 — Constructor Returning Object
```js
function Person(name) {
  this.name = name;
  return { name: "Fake" };
}

const p = new Person("Alice");
console.log(p.name);
```
<details>
<summary>Answer & Explanation</summary>

**Output:**
```
Fake
```

**Explanation:** If a constructor explicitly returns an object, that object becomes the result of `new`. The `this` object (which would have `name: "Alice"`) is discarded. If a primitive is returned instead, it's ignored and `this` is returned.
</details>

---

### Exercise 15 — The Ultimate Brain Teaser
```js
const obj = {
  name: "Alice",
  getName() {
    return this.name;
  },
  getNameArrow: () => this.name,
  nested: {
    name: "Bob",
    getName() {
      return this.name;
    }
  }
};

console.log(obj.getName());
console.log(obj.getNameArrow());
console.log(obj.nested.getName());

const fn = obj.getName;
console.log(fn());

console.log(obj.getName.call(obj.nested));
```
<details>
<summary>Answer & Explanation</summary>

**Output (non-strict):**
```
Alice
// window.name (or empty)
Bob
// window.name (or empty)
Bob
```

**Explanation:**
1. `obj.getName()` — implicit binding, `this = obj`, returns `"Alice"`
2. `obj.getNameArrow()` — arrow function, inherits global `this`, returns `window.name`
3. `obj.nested.getName()` — implicit binding, `this = obj.nested`, returns `"Bob"`
4. `fn()` — standalone call, default binding, returns `window.name` (or TypeError in strict)
5. `obj.getName.call(obj.nested)` — explicit binding overrides implicit, `this = obj.nested`, returns `"Bob"`
</details>

---

## 16. Anti-Patterns & Best Practices

### ✅ DO: Use arrow functions for callbacks that need outer `this`
```js
class Service {
  data = [];
  fetchData() {
    fetch("/api").then(res => res.json()).then(data => {
      this.data = data; // ✅ arrow preserves class this
    });
  }
}
```

### ❌ DON'T: Use arrow functions as object methods
```js
// Bad:
const obj = {
  name: "Alice",
  greet: () => console.log(this.name) // this !== obj!
};

// Good:
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name); // ✅ this === obj
  }
};
```

### ✅ DO: Use `.bind()` or class fields for event handlers
```js
class Button {
  constructor() {
    this.text = "Click";
    this.handleClick = this.handleClick.bind(this); // ✅ bind in constructor
  }
  handleClick() {
    console.log(this.text);
  }
}

// Or use class field arrow function:
class Button {
  text = "Click";
  handleClick = () => { // ✅ arrow as class field
    console.log(this.text);
  };
}
```

### ❌ DON'T: Pass object methods directly as callbacks
```js
// Bad:
button.addEventListener("click", obj.handleClick); // binding lost!

// Good:
button.addEventListener("click", () => obj.handleClick()); // preserved
button.addEventListener("click", obj.handleClick.bind(obj)); // hard bound
```

### ✅ DO: Use `call`/`apply` for method borrowing
```js
const arrayLike = { 0: "a", 1: "b", length: 2 };
const arr = Array.prototype.slice.call(arrayLike); // ["a", "b"]
```

### ❌ DON'T: Use `this` in deeply nested regular functions without binding
```js
// Bad:
obj.method() {
  setTimeout(function() {
    this.value++; // ❌ this is not obj!
  }, 100);
}

// Good:
obj.method() {
  setTimeout(() => {
    this.value++; // ✅ arrow inherits this
  }, 100);
}
```

### ✅ DO: Understand the call site
```js
// Always look at HOW the function is called, not where it's defined:
const fn = obj.method;
fn(); // ❌ different this than obj.method()
```

### ❌ DON'T: Mix arrow and regular functions without thinking
```js
const obj = {
  name: "Alice",
  regular() {
    const arrow = () => {
      console.log(this.name); // "Alice" — inherits from regular
    };
    arrow();
  },
  arrow: () => {
    const regular = function() {
      console.log(this.name); // global/undefined — default binding
    };
    regular();
  }
};
```

---

## 17. One-Liner Summary

> **`this` is a runtime binding determined by the call site, not the declaration site. It follows four rules in order of precedence: `new` binding (highest), explicit binding (`call`/`apply`/`bind`), implicit binding (method call), and default binding (standalone call). Arrow functions break all rules by using lexical `this` from their enclosing scope. Always look at how a function is called, not where it's written, to know what `this` is.**

---

*Master the call site, master `this`. 🚀*
