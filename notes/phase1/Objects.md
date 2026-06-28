# JavaScript Objects & Object Methods — Deep Learning Notes

---

## 1. What Is an Object?

An object is a collection of **key-value pairs** (properties). Keys are strings (or Symbols); values can be anything — primitives, functions, or other objects.

```js
const user = {
  name: "Priya",        // string property
  age: 28,              // number property
  isAdmin: false,       // boolean property
  greet() {            // method (function property)
    return `Hi, I'm ${this.name}`;
  }
};
```

### Property types

| Type | Description |
|------|-------------|
| Data property | Holds a value directly — `user.name` |
| Method | A function stored as a property — `user.greet()` |
| Accessor (getter/setter) | Computed property via `get` / `set` |
| Symbol key | Private-ish key — `[Symbol('id')]: 42` |

---

## 2. Property Descriptor Flags

Every property has hidden flags controlled via `Object.defineProperty()`.

| Flag | Default | Meaning |
|------|---------|---------|
| `writable` | `true` | Can the value be changed? |
| `enumerable` | `true` | Shows in `for...in` / `Object.keys()`? |
| `configurable` | `true` | Can the property be deleted or redefined? |

```js
Object.defineProperty(user, 'id', {
  value: 101,
  writable: false,      // read-only
  enumerable: false,    // hidden from loops
  configurable: false   // can't delete
});
```

---

## 3. Object Creation Patterns

### 3.1 Object literal (most common)

```js
const car = { make: "Toyota", speed: 0 };
```

### 3.2 `Object.create()` — sets prototype explicitly

```js
const animal = { breathe() { return "breathing"; } };
const dog = Object.create(animal);  // dog.__proto__ === animal
dog.bark = () => "woof";
dog.breathe(); // inherited: "breathing"
```

### 3.3 Constructor function

```js
function Person(name, age) {
  this.name = name;
  this.age  = age;
}
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};
const p = new Person("Ali", 30);
```

### 3.4 Class syntax (ES6+)

```js
class Person {
  #secret = "hidden";             // private field
  constructor(name) { this.name = name; }
  greet()  { return `Hi ${this.name}`; }
  get info() { return `${this.name}`; }
  static create(n) { return new Person(n); }
}
```

### 3.5 Factory function (no `new` keyword)

```js
function makeUser(name) {
  return {
    name,
    greet() { return `Hello ${this.name}`; }
  };
}
const u = makeUser("Sara");
```

> **When to use what?**
> - Literal → one-off config/data objects
> - Class → blueprint with inheritance
> - Factory → encapsulation without `new`, easy private state via closure
> - `Object.create()` → explicit prototype delegation

---

## 4. Accessing & Mutating Objects

### Reading properties

```js
obj.name            // dot notation
obj["name"]         // bracket notation (dynamic keys)
const key = "name";
obj[key]            // computed key from variable
obj.x ?? "default"  // nullish coalescing fallback
obj?.address?.city  // optional chaining (safe access)
```

### Destructuring

```js
const { name, age = 0 } = user;       // with default
const { name: userName } = user;       // rename
const { address: { city } } = user;    // nested
function show({ name, age }) { ... }   // in params
```

### Spread & rest

```js
// Spread — shallow copy / merge
const copy   = { ...obj };
const merged = { ...defaults, ...overrides };

// Rest — collect remaining keys
const { name, ...rest } = user; // rest = all keys except name
```

### Adding, updating, deleting

```js
obj.newProp = "hello";          // add
obj["key"]  = 42;               // add via bracket
delete obj.prop;                // remove
"prop" in obj;                  // existence check (inc. prototype)
Object.hasOwn(obj, "prop");     // own property only (ES2022)
```

> **Performance tip:** Avoid `delete` in hot paths — it de-optimises V8's hidden classes. Prefer setting the value to `undefined` or `null`.

---

## 5. Built-in Object Methods

### 5.1 Listing properties

```js
Object.keys(obj)        // → array of own enumerable keys
Object.values(obj)      // → array of own enumerable values
Object.entries(obj)     // → array of [key, value] pairs
Object.fromEntries(iter) // → reverse: entries → object
```

**Example — double all prices:**

```js
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
);
```

### 5.2 Copying & merging

```js
Object.assign(target, ...sources) // shallow copy/merge (mutates target)
structuredClone(obj)              // true deep clone (ES2022)

const copy  = Object.assign({}, original);
const deep  = structuredClone(nested); // handles arrays, Dates, Maps
const merge = Object.assign({}, defaults, options);
```

> `structuredClone` replaces the old JSON parse/stringify hack and correctly handles `Date`, `Map`, `Set`, `ArrayBuffer`, etc.

### 5.3 Freezing & sealing

```js
Object.freeze(obj)     // no add, delete, or write (shallow)
Object.seal(obj)       // no add or delete, but can write
Object.isFrozen(obj)   // check
Object.isSealed(obj)   // check
```

```js
const config = Object.freeze({ apiUrl: "/api", timeout: 3000 });
config.timeout = 9999; // silently fails; throws in strict mode
```

> **Freeze is shallow** — nested objects remain mutable. Deep-freeze needs recursion or a helper library.

### 5.4 Prototype methods

```js
Object.create(proto)               // new object with given prototype
Object.getPrototypeOf(obj)         // get the prototype
Object.setPrototypeOf(obj, proto)  // change prototype (avoid for perf)
```

### 5.5 Property descriptor methods

```js
Object.defineProperty(obj, key, descriptor)     // define / redefine one property
Object.defineProperties(obj, { ... })           // define multiple at once
Object.getOwnPropertyDescriptor(obj, key)       // read flags of a property
Object.getOwnPropertyNames(obj)                 // all own keys (incl. non-enumerable)
Object.getOwnPropertySymbols(obj)               // Symbol keys only
```

---

## 6. Getters & Setters

```js
const circle = {
  radius: 5,
  get area()    { return Math.PI * this.radius ** 2; },
  set diameter(d) { this.radius = d / 2; }
};

circle.area;          // computed, no parentheses needed
circle.diameter = 10; // triggers setter → radius becomes 5
```

In a class:

```js
class Temperature {
  #celsius;
  constructor(c) { this.#celsius = c; }
  get fahrenheit() { return this.#celsius * 9/5 + 32; }
  set fahrenheit(f) { this.#celsius = (f - 32) * 5/9; }
}
```

---

## 7. Prototype Chain & `this`

### Prototype chain

Every object has a hidden `[[Prototype]]` link. Property lookup walks up the chain until it hits `null`.

```
your object → its prototype → Object.prototype → null
arr          → Array.prototype → Object.prototype → null
```

```js
Object.hasOwn(arr, "length");  // true  — own property
Object.hasOwn(arr, "map");     // false — inherited from Array.prototype
```

### How `this` is determined

| Call style | `this` value |
|------------|-------------|
| `obj.method()` | `obj` |
| Arrow function | Inherits from enclosing lexical scope (no own `this`) |
| `fn.call(ctx)` / `fn.apply(ctx, args)` | `ctx` |
| `fn.bind(ctx)()` | Always `ctx` |
| `new Fn()` | The newly created object |
| Standalone `fn()` in strict mode | `undefined` |

```js
const greet = user.greet;
greet();            // undefined (strict) — common detachment bug!
greet.call(user);   // this = user
const bound = greet.bind(user);
bound();            // always user
```

> **Rule of thumb:** Passing a method as a callback (e.g., `setTimeout(user.greet, 1000)`) detaches `this`. Fix with `.bind(user)` or an arrow wrapper `() => user.greet()`.

---

## 8. Advanced Patterns

### 8.1 Proxy

Intercept and customise fundamental operations on an object.

```js
const handler = {
  get(target, key) {
    return key in target ? target[key] : `Key "${key}" not found`;
  },
  set(target, key, value) {
    if (typeof value !== "number") throw new TypeError("Numbers only");
    target[key] = value;
    return true;
  }
};

const safe = new Proxy({}, handler);
safe.score = 95;
safe.name = "Ali"; // throws TypeError
```

Common Proxy traps: `get`, `set`, `has`, `deleteProperty`, `apply`, `construct`.

### 8.2 Reflect

A companion to Proxy — same traps as methods, making meta-programming cleaner.

```js
Reflect.has(obj, "key")           // same as "key" in obj
Reflect.ownKeys(obj)              // own keys + symbols
Reflect.deleteProperty(obj, "k")  // same as delete obj.k
Reflect.get(obj, "key", receiver) // gets property (respects getters)
```

### 8.3 Symbol use cases

```js
const ID = Symbol("id");
obj[ID] = 123; // hidden from JSON.stringify and for...in

// Well-known symbols (hooks into JS internals)
class Range {
  constructor(from, to) { this.from = from; this.to = to; }
  [Symbol.iterator]() {
    let curr = this.from;
    const last = this.to;
    return {
      next() {
        return curr <= last
          ? { value: curr++, done: false }
          : { done: true };
      }
    };
  }
}

for (const n of new Range(1, 5)) console.log(n); // 1 2 3 4 5
```

Other well-known symbols: `Symbol.toPrimitive`, `Symbol.toStringTag`, `Symbol.hasInstance`.

### 8.4 Immutability patterns

| Technique | Depth | Notes |
|-----------|-------|-------|
| `Object.freeze()` | Shallow | Built-in, no deps |
| Spread updates | Shallow | `{ ...state, count: 1 }` |
| Recursive freeze | Deep | Roll your own helper |
| `structuredClone` + `freeze` | Deep | Clone first, then freeze |
| Immer library | Deep | Best ergonomics for nested updates |

```js
// Recursive deep freeze
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const val = obj[name];
    if (val && typeof val === "object") deepFreeze(val);
  });
  return Object.freeze(obj);
}
```

---

## 9. Quick Reference Cheatsheet

### Object creation

```js
{}                          // literal
Object.create(proto)        // with prototype
new Constructor()           // constructor fn
new Class()                 // class
factory()                   // factory fn (returns object)
```

### Introspection

```js
Object.keys(o)              // own enumerable string keys
Object.values(o)            // own enumerable values
Object.entries(o)           // own enumerable [k,v] pairs
Object.getOwnPropertyNames(o) // own keys incl. non-enumerable
Object.getOwnPropertySymbols(o) // own symbol keys
Reflect.ownKeys(o)          // all own keys (string + symbol)
Object.hasOwn(o, k)         // own property check (ES2022)
k in o                      // own + inherited check
```

### Copying

```js
{ ...o }                    // shallow spread
Object.assign({}, o)        // shallow assign
structuredClone(o)          // deep clone (no functions)
```

### Locking

```js
Object.freeze(o)            // no write/add/delete
Object.seal(o)              // no add/delete (write ok)
Object.preventExtensions(o) // no add only
```

### Prototype

```js
Object.getPrototypeOf(o)    // get proto
Object.create(proto)        // set at creation time
o instanceof Constructor    // prototype chain check
```

---

*Notes cover ES2022 and below. For browser compatibility of specific features, check MDN or caniuse.com.*