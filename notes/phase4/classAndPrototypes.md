# Classes & Prototypes Deep Dive — Internal Mechanics & Engine Behavior

> **Prerequisite**: You know `class`, `extends`, `new`, and that objects inherit from other objects. These notes go under the hood.

---

## 1. The Fundamental Truth: JavaScript Has No Classes

JavaScript is **prototype-based**, not class-based. The `class` keyword (ES2015) is **syntactic sugar** over constructor functions and prototype chains. There is no "class" entity in the engine — only objects linked to other objects.

When you write:
```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes noise`);
  }
}
```

The engine creates:
1. A **function object** named `Animal` (the constructor)
2. An object at `Animal.prototype` with the `speak` method
3. A link from `Animal.prototype.constructor` back to `Animal`

This is *exactly* what happens with the pre-ES6 pattern:
```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  console.log(`${this.name} makes noise`);
};
```

**Key insight**: `class` is a "better syntax" for a pattern that has existed since 1997. The engine desugars it.

---

## 2. The `[[Prototype]]` Internal Slot (The Real Inheritance)

Every object in JavaScript has a hidden internal slot called `[[Prototype]]`. This is **not** the same as `.prototype`.

| Property | What It Is |
|----------|-----------|
| `obj.__proto__` | Legacy getter/setter for `[[Prototype]]` (deprecated but works) |
| `Object.getPrototypeOf(obj)` | Modern way to read `[[Prototype]]` |
| `Object.setPrototypeOf(obj, proto)` | Modern way to write `[[Prototype]]` |
| `Constructor.prototype` | The object that will become `[[Prototype]]` of instances |

### The Chain
```js
const obj = {};
// obj.[[Prototype]] → Object.prototype → null

const arr = [];
// arr.[[Prototype]] → Array.prototype → Object.prototype → null

function Foo() {}
const f = new Foo();
// f.[[Prototype]] → Foo.prototype → Object.prototype → null
```

When you access `obj.property`:
1. Check `obj` itself.
2. If not found, check `obj.[[Prototype]]`.
3. If not found, check `obj.[[Prototype]].[[Prototype]]`.
4. Continue until `null` (end of chain) → return `undefined`.

This is **delegation**, not copying. The property is looked up dynamically at access time.

---

## 3. The `new` Keyword — Step by Step Internals

When you write `new Animal("Lion")`, the engine does this **exactly**:

```js
function myNew(constructor, ...args) {
  // Step 1: Create a new empty object
  const obj = {};

  // Step 2: Link its [[Prototype]] to constructor.prototype
  Object.setPrototypeOf(obj, constructor.prototype);

  // Step 3: Call constructor with `this` bound to the new object
  const result = constructor.apply(obj, args);

  // Step 4: If constructor returns an object, use it. Otherwise return obj.
  return (result !== null && (typeof result === 'object' || typeof result === 'function')) 
    ? result 
    : obj;
}
```

**Critical details:**
- `new` creates the object **before** the constructor runs.
- The constructor's `this` is the new object.
- If the constructor returns a non-primitive, that object is returned instead (rare but valid).
- If the constructor returns a primitive, it's ignored and the new object is returned.

---

## 4. How `class` Is Desugared (The Full Transformation)

### Simple Class
```js
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hello, ${this.name}`;
  }
  static species = 'Homo sapiens';
  static isHuman() {
    return true;
  }
}
```

### Desugared Equivalent
```js
function Person(name) {
  if (!new.target) throw new TypeError("Class constructor Person cannot be invoked without 'new'");
  this.name = name;
}

// Instance methods go on the prototype
Person.prototype.greet = function() {
  return `Hello, ${this.name}`;
};

// Static properties go on the constructor function itself
Person.species = 'Homo sapiens';
Person.isHuman = function() {
  return true;
};

// The prototype's constructor link
Person.prototype.constructor = Person;

// Class methods are non-enumerable (unlike the manual pattern)
Object.defineProperty(Person.prototype, 'greet', {
  writable: true,
  enumerable: false,
  configurable: true
});
```

**Key differences from manual pattern:**
- `class` methods are **non-enumerable** by default.
- `class` constructors **must** be called with `new` (enforced by `new.target` check).
- `class` bodies run in **strict mode** automatically.
- Methods inside `class` are **not writable** on the prototype (in modern engines, configurable but not writable by default in some cases).

---

## 5. Inheritance: `extends` and `super` Internals

### The Syntax
```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Calls Animal constructor
    this.breed = breed;
  }
  speak() {
    super.speak();  // Calls Animal.prototype.speak
    console.log('Woof!');
  }
}
```

### What `extends` Actually Does

```js
function Dog(name, breed) {
  // super(name) is transformed to:
  Animal.call(this, name);  // Or Reflect.construct in complex cases
  this.breed = breed;
}

// Set up the prototype chain
Object.setPrototypeOf(Dog.prototype, Animal.prototype);
Object.setPrototypeOf(Dog, Animal);  // Static inheritance!

Dog.prototype.speak = function() {
  Animal.prototype.speak.call(this);  // super.speak()
  console.log('Woof!');
};
```

### The Two Chains

With `extends`, you get **two** prototype chains:

```
Instance chain (for methods):
dog → Dog.prototype → Animal.prototype → Object.prototype → null

Constructor chain (for static methods):
Dog → Animal → Function.prototype → Object.prototype → null
```

**This is why static methods inherit too:**
```js
class Parent {
  static hello() { return 'parent'; }
}
class Child extends Parent {}
Child.hello();  // 'parent' — found via Child → Parent chain
```

### `super` Is Not a Variable

`super` is **not** a reference to the parent class. It is a **keyword** that the engine resolves differently depending on context:

- In `super()`: Calls the parent constructor. The engine looks up `Object.getPrototypeOf(Dog)` (which is `Animal`) and calls it.
- In `super.method()`: Looks up `Object.getPrototypeOf(Dog.prototype)` (which is `Animal.prototype`) and calls `.method()` with `this` bound to the current instance.

**This is why `super` works even if the child overrides the parent's method.**

---

## 6. `new.target` — The Hidden Meta-Property

`new.target` is available inside any constructor (class or function). It points to the constructor that was **originally called** with `new`.

```js
class Parent {
  constructor() {
    console.log(new.target === Parent);     // false if called via Child
    console.log(new.target === Child);      // true if called via new Child()
  }
}
class Child extends Parent {}
new Child();  // new.target is Child inside Parent constructor!
```

**Use case**: Abstract classes that cannot be instantiated directly.
```js
class AbstractShape {
  constructor() {
    if (new.target === AbstractShape) {
      throw new TypeError("Cannot instantiate abstract class directly");
    }
  }
}
```

---

## 7. Private Fields (`#`) — How They Actually Work

ES2022 introduced true private fields. They are **not** properties on the object. They are stored in a **WeakMap-like internal slot** managed by the engine.

```js
class BankAccount {
  #balance = 0;  // Private field

  deposit(amount) {
    this.#balance += amount;
  }
  getBalance() {
    return this.#balance;
  }
}
```

### The Engine's Implementation (Conceptual)

The engine compiles this to something like:
```js
const _balance = new WeakMap();

class BankAccount {
  constructor() {
    _balance.set(this, 0);
  }
  deposit(amount) {
    _balance.set(this, _balance.get(this) + amount);
  }
  getBalance() {
    return _balance.get(this);
  }
}
```

**Key characteristics:**
- Private fields are **not** accessible via `obj.#balance` from outside the class body.
- They are **not** inherited by subclasses (each class has its own private namespace).
- They are **not** visible in `Object.keys()`, `for...in`, `JSON.stringify()`, or `Object.getOwnPropertyNames()`.
- They are **checked at compile time** (class body parsing), not runtime. The engine knows at parse time which fields are private.
- Accessing `this.#nonExistent` is a **SyntaxError** at class definition time, not a runtime error.

### Private Methods and Static Private Fields
```js
class Counter {
  #count = 0;

  // Private method
  #increment() {
    this.#count++;
  }

  // Private static
  static #instances = 0;
  static getInstanceCount() {
    return Counter.#instances;
  }

  constructor() {
    Counter.#instances++;
  }
  tick() {
    this.#increment();
  }
}
```

---

## 8. The `__proto__` Gotcha vs. `prototype`

```js
function Foo() {}
const f = new Foo();

f.__proto__ === Foo.prototype;        // true
f.__proto__ === Foo.__proto__;        // false!

Foo.__proto__ === Function.prototype; // true
Foo.prototype.__proto__ === Object.prototype; // true
```

| Expression | What It Means |
|-----------|--------------|
| `f.__proto__` | `f`'s internal `[[Prototype]]` (where it looks up methods) |
| `Foo.prototype` | The object that will become `[[Prototype]]` of future `new Foo()` instances |
| `Foo.__proto__` | `Foo`'s own `[[Prototype]]` (for static inheritance) — `Function.prototype` |

**Rule**: `X.prototype` is a **property** that constructors use. `x.__proto__` (or `Object.getPrototypeOf(x)`) is the **internal link** that powers inheritance lookup.

---

## 9. Property Lookup Performance: The Prototype Chain Cost

Every time you access `obj.property`, the engine walks the prototype chain. This is fast (optimized in V8), but not free.

### Monomorphic vs. Megamorphic

V8 uses **hidden classes** (shapes/maps) to optimize property access. If an object always has the same properties in the same order, V8 creates a hidden class and caches the offset.

**Problem**: Deep prototype chains or objects with different shapes break this optimization.

```js
class A { a = 1; }
class B extends A { b = 2; }
class C extends B { c = 3; }

const c = new C();
// Accessing c.a walks: C instance → C.prototype → B.prototype → A.prototype
// V8 can still optimize this if the chain is stable.
```

**Anti-pattern**: Modifying prototypes after creating instances.
```js
const obj = { a: 1 };
Object.setPrototypeOf(obj, { b: 2 });  // Deoptimizes! V8 discards hidden class.
```

**Rule**: Define your prototype chain before creating instances. Never use `Object.setPrototypeOf` on hot objects.

---

## 10. `Object.create` — The Pure Prototypal Pattern

Before `class`, this was the canonical way to create inheritance:

```js
const animal = {
  speak() {
    console.log(`${this.name} makes noise`);
  }
};

const dog = Object.create(animal);
dog.name = 'Rex';
dog.speak();  // "Rex makes noise" — delegates to animal.speak
```

`Object.create(proto)` creates an object whose `[[Prototype]]` is `proto`. No constructor, no `new`, no `class`.

### The Second Argument (Property Descriptors)
```js
const obj = Object.create(null, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  }
});
```

`Object.create(null)` creates an object with **no prototype at all** — not even `Object.prototype`. No `toString`, no `hasOwnProperty`, no `constructor`. Useful for dictionaries/maps.

---

## 11. Common Traps & Edge Cases

### Trap 1: Losing `this` in Methods
```js
class Button {
  constructor(label) {
    this.label = label;
  }
  click() {
    console.log(this.label);
  }
}

const btn = new Button('Submit');
setTimeout(btn.click, 100);  // undefined! `this` is lost.

// Fix: Arrow function in class field (creates instance-bound method)
class Button {
  click = () => {
    console.log(this.label);
  }
}
// Or: btn.click.bind(btn)
```

**Why**: Class methods on the prototype are just functions. When passed as callbacks, `this` becomes the call site (or `undefined` in strict mode). Arrow functions in class fields are assigned per-instance and close over `this`.

### Trap 2: `typeof` and `instanceof`
```js
class Foo {}
const f = new Foo();

typeof f;        // 'object' — classes don't create a new type
f instanceof Foo; // true — checks prototype chain
f instanceof Object; // true — prototype chain reaches Object.prototype
```

`instanceof` checks: `Object.getPrototypeOf(f) === Foo.prototype` or anywhere up the chain. It does **not** check the constructor name.

### Trap 3: Constructor Return Value
```js
class Weird {
  constructor() {
    return { notMe: true };  // Overrides the default instance!
  }
}
const w = new Weird();
w instanceof Weird;  // false! The returned object has no link to Weird.prototype.
```

### Trap 4: `class` Hoisting
```js
new Foo();  // ReferenceError! Class declarations are NOT hoisted.
class Foo {}

// Unlike functions:
new Bar();  // Works! Function declarations are hoisted.
function Bar() {}
```

### Trap 5: Extending Built-ins (Array, Error, etc.)
```js
class MyArray extends Array {
  constructor(...args) {
    super(...args);
  }
}
const arr = new MyArray(1, 2, 3);
arr instanceof Array;  // true
arr instanceof MyArray; // true
```

This works in modern engines because `Array[Symbol.species]` was fixed. In older engines, extending built-ins was buggy because built-in constructors didn't use the standard `new` protocol.

---

## 12. Build It From Scratch: A Toy Class System

```js
function createClass({ constructor, methods = {}, statics = {}, extends: SuperClass = null }) {
  const Class = function(...args) {
    if (!new.target) throw new TypeError("Must call with new");

    const instance = Object.create(Class.prototype);
    constructor.apply(instance, args);
    return instance;
  };

  // Set up prototype chain
  if (SuperClass) {
    Object.setPrototypeOf(Class.prototype, SuperClass.prototype);
    Object.setPrototypeOf(Class, SuperClass);
  }

  // Instance methods
  Object.assign(Class.prototype, methods);
  Class.prototype.constructor = Class;

  // Static methods
  Object.assign(Class, statics);

  // Make methods non-enumerable (class behavior)
  Object.keys(methods).forEach(key => {
    Object.defineProperty(Class.prototype, key, {
      enumerable: false,
      writable: true,
      configurable: true
    });
  });

  return Class;
}

// Usage:
const Animal = createClass({
  constructor(name) {
    this.name = name;
  },
  methods: {
    speak() {
      console.log(`${this.name} makes noise`);
    }
  }
});

const Dog = createClass({
  extends: Animal,
  constructor(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
  },
  methods: {
    speak() {
      Animal.prototype.speak.call(this);
      console.log('Woof!');
    }
  }
});

const dog = new Dog('Rex', 'German Shepherd');
dog.speak();  // "Rex makes noise" then "Woof!"
```

This is essentially what Babel's class transform does, minus the `super` keyword resolution.

---

## 13. The `Symbol.species` Pattern (Advanced)

Built-in classes use `Symbol.species` to control what constructor is used when creating derived objects:

```js
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;  // map/filter return plain Array, not MyArray
  }
}

const m = new MyArray(1, 2, 3);
const mapped = m.map(x => x * 2);
mapped instanceof MyArray;  // false — it's a plain Array
```

This is how `Array.prototype.map` knows what constructor to use for the returned array. You rarely need this, but it's part of the internal protocol.

---

## 14. Mental Model Summary

| Concept | Mental Model |
|---------|-------------|
| `class` | Syntactic sugar over `function` + `.prototype` |
| `new` | Creates empty object, links `[[Prototype]]`, runs constructor, returns object |
| `extends` | Sets up **two** chains: instance prototype chain + constructor static chain |
| `super()` | Calls parent constructor with `this` bound to the new instance |
| `super.method()` | Looks up method on parent's prototype, calls with current `this` |
| `#private` | Stored in engine-managed WeakMap-like slot, not on the object |
| `obj.__proto__` | The object's `[[Prototype]]` (lookup chain) |
| `Ctor.prototype` | The template object for instances' `[[Prototype]]` |
| `instanceof` | Walks `[[Prototype]]` chain looking for a match |
| `Object.create(proto)` | Creates object with `[[Prototype]] = proto`, no constructor |

---

## 15. Checklist for Mastery

- [ ] Can explain why `class` is syntactic sugar over prototypes
- [ ] Can write the `new` keyword's exact step-by-step behavior
- [ ] Can desugar a `class` with `extends`, `super`, and static methods into ES5
- [ ] Understands the difference between `obj.__proto__` and `Ctor.prototype`
- [ ] Can explain how private fields (`#`) are implemented internally
- [ ] Knows why `super` is not a variable and how the engine resolves it
- [ ] Can explain why `Object.setPrototypeOf` deoptimizes V8
- [ ] Can build a toy class system from scratch using `Object.create` and `Function.prototype`
- [ ] Knows the `new.target` meta-property and its use for abstract classes
- [ ] Can explain why `btn.click` loses `this` when passed to `setTimeout`

---

*Study these notes, then build: a mixin system using `Object.create`, a private-field polyfill using WeakMaps, and a class framework that supports `extends` and `super`.*
