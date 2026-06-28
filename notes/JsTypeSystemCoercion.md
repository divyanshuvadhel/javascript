# JavaScript Type System, Coercion & Equality — Complete Guide

> **Prerequisite:** You should be comfortable with JavaScript basics (variables, functions, objects) before diving into this guide.

---

## Table of Contents
1. [Primitive Types](#1-primitive-types)
2. [Objects](#2-objects)
3. [Primitive ↔ Primitive Conversions](#3-primitive--primitive-conversions)
4. [Primitive ↔ Object Conversions](#4-primitive--object-conversions)
5. [Object ↔ Primitive Conversions](#5-object--primitive-conversions)
6. [Abstract Operations: ToPrimitive, ToNumber, ToString, ToBoolean, ToObject](#6-abstract-operations)
7. [valueOf(), toString(), Symbol.toPrimitive](#7-customizing-conversions)
8. [Autoboxing (Primitive Wrapper Objects)](#8-autoboxing)
9. [Equality: == vs ===](#9-equality--vs-)
10. [Truthy & Falsy](#10-truthy--falsy)
11. [Complete Conversion Tables](#11-complete-conversion-tables)
12. [Memory Diagrams](#12-memory-diagrams)
13. [ECMAScript Algorithm Explanations](#13-ecmascript-algorithm-explanations)
14. [100+ Interview Questions](#14-interview-questions)
15. [Best Practices](#15-best-practices)
16. [Summary Cheat Sheet](#16-summary-cheat-sheet)

---

## 1. Primitive Types

JavaScript has **7 primitive types**:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Textual data | `"hello"`, `'world'` |
| `number` | Numeric values (integers & floats) | `42`, `3.14`, `NaN`, `Infinity` |
| `bigint` | Arbitrary-precision integers | `9007199254740991n` |
| `boolean` | Logical true/false | `true`, `false` |
| `undefined` | Uninitialized variable | `undefined` |
| `symbol` | Unique identifier | `Symbol('id')` |
| `null` | Intentional absence of value | `null` |

### Key Properties of Primitives
- **Immutable:** You cannot change a primitive value in place. Operations create new values.
- **Compared by value:** Two primitives with the same value are considered equal.
- **Stored on the stack** (conceptually — engines optimize this).

```js
let a = "hello";
a[0] = "H";        // Does nothing — strings are immutable
console.log(a);    // "hello"

let x = 5;
let y = 5;
console.log(x === y); // true (same value)
```

### The `typeof` Operator Quirk
```js
typeof "hello";     // "string"
typeof 42;          // "number"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof Symbol();    // "symbol"
typeof 9007199254740991n; // "bigint"
typeof null;        // "object"  ← HISTORICAL BUG, never fixed for compatibility
```

> **Why?** In the first version of JavaScript, values were stored as type tags + value. `null` was represented as `0x00` (all zeros), and the type tag for objects was `0`. So `typeof null` returned `"object"`. Changing it would break existing code.

---

## 2. Objects

Everything that is not a primitive is an **object**:

- Plain objects: `{}`
- Arrays: `[]`
- Functions: `function() {}`
- Dates: `new Date()`
- Regexes: `/abc/`
- Maps, Sets, WeakMaps, WeakSets
- ...and more

### Key Properties of Objects
- **Mutable:** You can change properties in place.
- **Compared by reference:** Two objects with identical contents are NOT equal unless they point to the same memory location.
- **Stored on the heap** (reference stored on stack).

```js
let obj1 = { a: 1 };
let obj2 = { a: 1 };
console.log(obj1 === obj2); // false — different references

let obj3 = obj1;
obj3.a = 2;
console.log(obj1.a); // 2 — same reference
```

### `typeof` for Objects
```js
typeof {};           // "object"
typeof [];           // "object"  ← arrays are objects
typeof function(){}; // "function" ← special case
typeof null;         // "object"  ← bug (see above)
```

To check for arrays, use `Array.isArray()`:
```js
Array.isArray([]);   // true
Array.isArray({});   // false
```

---

## 3. Primitive ↔ Primitive Conversions

JavaScript performs implicit conversions between primitives automatically.

### String ↔ Number
```js
// Number → String
String(42);          // "42"
"" + 42;             // "42" (implicit)

// String → Number
Number("42");        // 42
+"42";               // 42 (unary plus)
parseInt("42px");    // 42
parseFloat("3.14");  // 3.14

// Failing conversions
Number("hello");     // NaN
Number("");          // 0
Number("   ");       // 0
Number("42px");      // NaN (unlike parseInt!)
```

### Boolean ↔ Number
```js
Number(true);        // 1
Number(false);       // 0

Boolean(1);          // true
Boolean(0);          // false
Boolean(NaN);        // false
```

### String ↔ Boolean
```js
Boolean("hello");    // true
Boolean("");         // false
Boolean("0");        // true! (non-empty string)
Boolean("false");    // true! (non-empty string)
```

---

## 4. Primitive ↔ Object Conversions

### Primitive → Object
Primitives can be temporarily wrapped in object form via **autoboxing** (see Section 8).

```js
let str = "hello";
str.toUpperCase();   // "HELLO" — primitive temporarily wrapped
```

### Object → Primitive
Objects must be converted to primitives for operations like `+`, `==`, or template literals. This uses the `ToPrimitive` abstract operation (see Section 6).

```js
let obj = { valueOf() { return 42; } };
obj + 1;             // 43

let obj2 = { toString() { return "hello"; } };
"" + obj2;           // "hello"
```

---

## 5. Object ↔ Primitive Conversions

When an object needs to become a primitive, JavaScript asks the object: "What primitive value do you represent?"

There are three ways an object can answer:
1. **`Symbol.toPrimitive(hint)`** — Modern, preferred way
2. **`valueOf()`** — Returns a primitive value
3. **`toString()`** — Returns a string representation

### The `hint` Parameter
The engine passes a "hint" indicating what type it prefers:
- `"number"` — For numeric contexts (`+obj`, `obj - 1`, `Math.abs(obj)`)
- `"string"` — For string contexts (`alert(obj)`, `String(obj)`)
- `"default"` — For ambiguous contexts (`+obj`, `obj + ""`, `obj == 1`)

```js
let obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return 42;
    if (hint === "string") return "hello";
    return "default";
  }
};

console.log(+obj);           // 42 (hint: "number")
console.log(String(obj));    // "hello" (hint: "string")
console.log(obj + "");       // "default" (hint: "default")
```

### Fallback Order (if `Symbol.toPrimitive` is absent)
1. If hint is `"string"`: try `toString()` → `valueOf()`
2. If hint is `"number"` or `"default"`: try `valueOf()` → `toString()`

```js
let obj = {
  valueOf() { return 42; },
  toString() { return "hello"; }
};

console.log(obj + 1);        // 43 (uses valueOf, hint: "default")
console.log(String(obj));    // "hello" (uses toString, hint: "string")
```

---

## 6. Abstract Operations

ECMAScript defines "abstract operations" — internal algorithms the engine uses. You can't call them directly, but they explain how conversions work.

### ToPrimitive(input, PreferredType?)
Converts a value to a primitive.

```
1. If input is already primitive, return it.
2. If input is an object:
   a. If PreferredType is not given, set it to "default".
   b. If PreferredType is "default", set it to "number".
   c. Call OrdinaryToPrimitive(input, PreferredType).
```

`OrdinaryToPrimitive(obj, hint)`:
```
1. If hint is "string":
   a. Call obj.toString(). If result is primitive, return it.
   b. Call obj.valueOf(). If result is primitive, return it.
   c. Throw TypeError.
2. If hint is "number":
   a. Call obj.valueOf(). If result is primitive, return it.
   b. Call obj.toString(). If result is primitive, return it.
   c. Throw TypeError.
```

### ToNumber(argument)
Converts a value to a number.

| Input | Result |
|-------|--------|
| `undefined` | `NaN` |
| `null` | `0` |
| `true` | `1` |
| `false` | `0` |
| `number` | Same value |
| `string` | Parse as number, or `NaN` |
| `symbol` | Throw TypeError |
| `bigint` | Throw TypeError |
| `object` | Call `ToPrimitive` with hint `"number"`, then `ToNumber` |

```js
Number(undefined);   // NaN
Number(null);        // 0
Number(true);        // 1
Number("42");        // 42
Number("42px");      // NaN
Number("");          // 0
Number({});          // NaN ({}.valueOf() → {}, {}.toString() → "[object Object]" → NaN)
Number([]);          // 0 ([].toString() → "" → 0)
Number([1]);         // 1 ([1].toString() → "1" → 1)
Number([1, 2]);      // NaN ([1,2].toString() → "1,2" → NaN)
```

### ToString(argument)
Converts a value to a string.

| Input | Result |
|-------|--------|
| `undefined` | `"undefined"` |
| `null` | `"null"` |
| `true` | `"true"` |
| `false` | `"false"` |
| `number` | Number string (special cases for `NaN`, `Infinity`, `-0`) |
| `string` | Same string |
| `symbol` | Throw TypeError |
| `bigint` | BigInt string |
| `object` | Call `ToPrimitive` with hint `"string"`, then `ToString` |

```js
String(undefined);   // "undefined"
String(null);        // "null"
String(true);        // "true"
String(42);          // "42"
String(-0);          // "0"
String({});          // "[object Object]"
String([]);          // ""
String([1, 2]);      // "1,2"
```

### ToBoolean(argument)
Converts a value to a boolean.

**Falsy values** (become `false`):
- `undefined`
- `null`
- `false`
- `+0`, `-0`, `NaN`
- `""` (empty string)

**Everything else is truthy** (becomes `true`).

```js
Boolean(undefined);  // false
Boolean(null);       // false
Boolean(0);          // false
Boolean(NaN);        // false
Boolean("");         // false
Boolean("0");        // true
Boolean("false");    // true
Boolean([]);         // true
Boolean({});         // true
Boolean(function(){}); // true
```

### ToObject(argument)
Converts a value to an object.

| Input | Result |
|-------|--------|
| `undefined` | Throw TypeError |
| `null` | Throw TypeError |
| `boolean` | `new Boolean(boolean)` |
| `number` | `new Number(number)` |
| `string` | `new String(string)` |
| `symbol` | `new Symbol(symbol)` (not really, but object wrapper) |
| `bigint` | `new BigInt(bigint)` (object wrapper) |
| `object` | Return the object itself |

```js
Object(42);          // Number {42}
Object("hello");     // String {"hello"}
Object(undefined);   // TypeError
Object(null);        // TypeError
```

---

## 7. Customizing Conversions: valueOf(), toString(), Symbol.toPrimitive

### valueOf()
Called when JavaScript expects a primitive value from an object, typically for numeric operations.

```js
let money = {
  amount: 100,
  currency: "USD",
  valueOf() {
    return this.amount;
  }
};

console.log(money + 50);     // 150
console.log(money > 50);     // true
console.log(String(money));  // "[object Object]" (toString used for string contexts)
```

### toString()
Called when JavaScript expects a string representation.

```js
let user = {
  name: "Alice",
  age: 30,
  toString() {
    return `${this.name} (${this.age})`;
  }
};

console.log("User: " + user);  // "User: Alice (30)"
console.log(+user);            // NaN (valueOf not defined, default valueOf returns object)
```

### Symbol.toPrimitive
The modern, unified way to control all conversions.

```js
let item = {
  price: 100,
  name: "Book",
  [Symbol.toPrimitive](hint) {
    console.log(`Hint: ${hint}`);
    if (hint === "number") return this.price;
    if (hint === "string") return this.name;
    return this.price; // default
  }
};

console.log(+item);            // 100 (hint: "number")
console.log(String(item));     // "Book" (hint: "string")
console.log(item + 0);         // 100 (hint: "default")
```

### Priority Order
1. `Symbol.toPrimitive` (highest priority, used if present)
2. `valueOf()` (for `"number"` and `"default"` hints)
3. `toString()` (for `"string"` hint, or fallback)

---

## 8. Autoboxing (Primitive Wrapper Objects)

Primitives don't have methods, but JavaScript lets you call methods on them. How?

**Autoboxing** temporarily wraps the primitive in its object wrapper.

| Primitive | Wrapper Object |
|-----------|---------------|
| `string` | `String` |
| `number` | `Number` |
| `boolean` | `Boolean` |
| `symbol` | `Symbol` |
| `bigint` | `BigInt` |

```js
let str = "hello";
str.toUpperCase();   // Works! JS does: new String(str).toUpperCase()
                     // Then discards the wrapper object

// You can create wrappers manually (rarely needed)
let wrapped = new String("hello");
typeof wrapped;      // "object"
wrapped.valueOf();   // "hello" (the primitive)

// Pitfall: wrappers behave like objects
let a = new String("hello");
let b = new String("hello");
console.log(a === b); // false! (different objects)
console.log(a == b);  // false! (objects compared by reference)
```

> **Best Practice:** Never use `new String()`, `new Number()`, or `new Boolean()`. They cause confusion and bugs.

---

## 9. Equality: == vs ===

### Strict Equality (`===`)
- **No type coercion.**
- Returns `true` only if both value AND type match.
- For objects, checks reference equality.

```js
5 === 5;           // true
5 === "5";         // false
null === undefined; // false
[] === [];         // false (different references)
```

### Loose Equality (`==`)
- **Performs type coercion** if types differ.
- The algorithm is complex and often surprising.

#### The `==` Algorithm (simplified)
```
1. If types are the same, behave like ===.
2. If one is null and the other is undefined, return true.
3. If one is number and the other is string, convert string to number.
4. If one is boolean, convert it to number (true→1, false→0).
5. If one is object and the other is primitive, convert object to primitive.
6. Otherwise, return false.
```

### Famous `==` Surprises
```js
// null and undefined
null == undefined;   // true
null == 0;           // false
undefined == 0;      // false

// Booleans
false == 0;          // true
false == "";         // true
false == [];         // true
false == {};         // false

// Arrays
[] == false;         // true ([] → "" → 0, false → 0)
[] == ![];           // true (![] → false, [] → "" → 0, false → 0)
[1] == true;         // true ([1] → "1" → 1, true → 1)
[2] == true;         // false ([2] → "2" → 2, true → 1)

// Objects
{} == {};            // false (different references)
{} == "[object Object]"; // true ({} → "[object Object]")

// NaN
NaN == NaN;          // false (NaN is never equal to anything, even itself)

// Strings
"0" == false;        // true ("0" → 0, false → 0)
"" == false;         // true ("" → 0, false → 0)
" " == false;        // true (" " → 0, false → 0)
"\n" == false;      // true ("\n" → 0, false → 0)
"hello" == true;     // false ("hello" → NaN)
"1" == true;         // true ("1" → 1, true → 1)
"2" == true;         // false ("2" → 2, true → 1)
```

### When is `==` Safe?
`==` is safe when comparing:
- `null == undefined` (intentional check for "missing" value)
- Same types (but then `===` is clearer)

> **Best Practice:** Always use `===` and `!==`. Use `==` only if you explicitly need `null == undefined` behavior.

---

## 10. Truthy & Falsy

### Falsy Values (7 total)
These values become `false` in boolean contexts:

1. `false`
2. `0` (and `-0`)
3. `""` (empty string)
4. `null`
5. `undefined`
6. `NaN`
7. `document.all` (historical quirk — yes, really)

### Truthy Values (Everything Else)
These surprising values are **truthy**:

```js
Boolean("0");        // true
Boolean("false");    // true
Boolean(" ");        // true
Boolean([]);         // true
Boolean({});         // true
Boolean(function(){}); // true
Boolean(new Boolean(false)); // true (it's an object!)
Boolean(-1);         // true
Boolean(Infinity);   // true
```

### Practical Patterns
```js
// Check for null/undefined only
if (value != null) { /* value is neither null nor undefined */ }

// Check for any truthy value
if (value) { /* value is truthy */ }

// Check for empty string specifically
if (value !== "") { /* not empty string */ }

// Check for 0 specifically
if (value !== 0) { /* not zero */ }
```

---

## 11. Complete Conversion Tables

### To Number

| Value | Number |
|-------|--------|
| `undefined` | `NaN` |
| `null` | `0` |
| `true` | `1` |
| `false` | `0` |
| `""` | `0` |
| `" "` | `0` |
| `"\t"` | `0` |
| `"0"` | `0` |
| `"42"` | `42` |
| `"42px"` | `NaN` |
| `"hello"` | `NaN` |
| `[]` | `0` |
| `[""]` | `0` |
| `[1]` | `1` |
| `[1, 2]` | `NaN` |
| `{}` | `NaN` |
| `function(){}` | `NaN` |

### To String

| Value | String |
|-------|--------|
| `undefined` | `"undefined"` |
| `null` | `"null"` |
| `true` | `"true"` |
| `false` | `"false"` |
| `0` | `"0"` |
| `-0` | `"0"` |
| `NaN` | `"NaN"` |
| `Infinity` | `"Infinity"` |
| `[]` | `""` |
| `[1, 2]` | `"1,2"` |
| `{}` | `"[object Object]"` |
| `function(){}` | `"function(){}"` |

### To Boolean

| Value | Boolean |
|-------|---------|
| `undefined` | `false` |
| `null` | `false` |
| `false` | `false` |
| `0` | `false` |
| `-0` | `false` |
| `NaN` | `false` |
| `""` | `false` |
| `"0"` | `true` |
| `"false"` | `true` |
| `" "` | `true` |
| `[]` | `true` |
| `{}` | `true` |
| `function(){}` | `true` |

---

## 12. Memory Diagrams

### Primitives on the Stack
```
Stack:
┌─────────────┐
│  a: 42      │  ← number (8 bytes)
├─────────────┤
│  b: "hi"    │  ← string reference (or inline for small strings)
├─────────────┤
│  c: true    │  ← boolean (1 byte, padded)
├─────────────┤
│  d: null    │  ← special pointer value (0x0)
├─────────────┤
│  e: undefined│ ← special marker
└─────────────┘
```

### Objects on the Heap
```
Stack:                    Heap:
┌─────────────┐           ┌─────────────────────┐
│  obj1 ──────┼──────────→│  Object {            │
├─────────────┤           │    a: 1,             │
│  obj2 ──────┼─────┐     │    b: "hello"        │
├─────────────┤     │     │  }                   │
│  obj3 ──────┼─────┼────→│  Object {            │
└─────────────┘     │     │    a: 1,             │
                    │     │    b: "hello"        │
                    │     │  }                   │
                    │     └─────────────────────┘
                    │     ┌─────────────────────┐
                    └────→│  Object {            │
                          │    a: 1,             │
                          │    b: "hello"        │
                          │  }                   │
                          └─────────────────────┘

obj1 === obj2  // false (different heap addresses)
obj2 === obj3  // true  (same heap address)
```

### Closure Memory
```
Stack:                    Heap:
┌─────────────┐           ┌─────────────────────┐
│ counter ────┼──────────→│  Function +         │
└─────────────┘           │  Closure Scope {     │
                          │    count: 0          │
                          │  }                   │
                          └─────────────────────┘

Each call to counter() creates a NEW closure scope.
```

### Autoboxing
```
Stack:                    Heap (temporary):
┌─────────────┐           ┌─────────────────────┐
│  str: "hi"  │           │  String Object {     │
└─────────────┘           │    0: "h",           │
                          │    1: "i",           │
                          │    length: 2,         │
                          │    toUpperCase: fn   │
                          │  }  ← created, used, │
                          │     then garbage     │
                          │     collected        │
                          └─────────────────────┘
```

---

## 13. ECMAScript Algorithm Explanations

### The `==` Abstract Equality Comparison Algorithm

From ECMA-262, Section 7.2.14:

```
1. If Type(x) is the same as Type(y):
   a. If Type(x) is Undefined, return true.
   b. If Type(x) is Null, return true.
   c. If Type(x) is Number:
      i. If x is NaN, return false.
      ii. If y is NaN, return false.
      iii. If x is the same Number value as y, return true.
      iv. If x is +0 and y is -0, return true.
      v. If x is -0 and y is +0, return true.
      vi. Return false.
   d. If Type(x) is String, return true if x and y are the same sequence of code units.
   e. If Type(x) is Boolean, return true if both are true or both are false.
   f. If Type(x) is Symbol, return true if both are the same Symbol value.
   g. Return true if x and y are the same Object reference.
   h. Return false.

2. If x is null and y is undefined, return true.
3. If x is undefined and y is null, return true.
4. If Type(x) is Number and Type(y) is String, return x == ToNumber(y).
5. If Type(x) is String and Type(y) is Number, return ToNumber(x) == y.
6. If Type(x) is Boolean, return ToNumber(x) == y.
7. If Type(y) is Boolean, return x == ToNumber(y).
8. If Type(x) is String, Number, or Symbol and Type(y) is Object, return x == ToPrimitive(y).
9. If Type(x) is Object and Type(y) is String, Number, or Symbol, return ToPrimitive(x) == y.
10. Return false.
```

### The `+` Operator Algorithm

From ECMA-262, Section 12.8.3:

```
1. Let lref be the result of evaluating AdditiveExpression.
2. Let lval be GetValue(lref).
3. Let rref be the result of evaluating MultiplicativeExpression.
4. Let rval be GetValue(rref).
5. Let lprim be ToPrimitive(lval).
6. Let rprim be ToPrimitive(rval).
7. If Type(lprim) is String or Type(rprim) is String:
   a. Return the string concatenation of ToString(lprim) and ToString(rprim).
8. Return the result of applying the addition operation to ToNumber(lprim) and ToNumber(rprim).
```

> **Key insight:** If EITHER operand becomes a string after `ToPrimitive`, the `+` operator does string concatenation, not addition.

### Why `[] + []` is `""`
```
1. ToPrimitive([]) → [].toString() → ""
2. ToPrimitive([]) → [].toString() → ""
3. Both are strings → "" + "" → ""
```

### Why `[] + {}` is `"[object Object]"`
```
1. ToPrimitive([]) → ""
2. ToPrimitive({}) → "[object Object]"
3. String concatenation: "" + "[object Object]" → "[object Object]"
```

### Why `{} + []` is `0` (sometimes!)
```
// At the START of a statement, {} is parsed as an empty block, not an object!
{} + []   // {} is a block, +[] is the expression → +"" → 0

// But:
({} + []) // {} is an object → "[object Object]" + "" → "[object Object]"
```

---

## 14. Interview Questions

### Basic Level
1. What are the 7 primitive types in JavaScript?
2. Why does `typeof null` return `"object"`?
3. What is the difference between `null` and `undefined`?
4. Is `NaN` equal to itself? Why or why not?
5. What is autoboxing? Give an example.
6. What is the difference between `==` and `===`?
7. List all falsy values in JavaScript.
8. Is `"0"` truthy or falsy? What about `""`?
9. What does `Number("42px")` return? What about `parseInt("42px")`?
10. What is the output of `console.log(1 + "2" + "2")`?

### Intermediate Level
11. Explain the `ToPrimitive` abstract operation.
12. What is the difference between `valueOf()` and `toString()`?
13. How does `Symbol.toPrimitive` work?
14. What is the output of `[] == ![]`? Walk through the algorithm.
15. What is the output of `{} + []` vs `[] + {}`? Why?
16. Why is `false == []` true but `false == {}` false?
17. What is the output of `console.log(1 < 2 < 3)`? What about `3 > 2 > 1`?
18. How does JavaScript convert an object to a number?
19. What is the difference between `Object()` and `new Object()`?
20. Why should you avoid `new String()`, `new Number()`, and `new Boolean()`?

### Advanced Level
21. Walk through the `==` algorithm for `[] == false` step by step.
22. Walk through the `==` algorithm for `"" == false` step by step.
23. What is the output of `console.log(+"" + +"1" + +"0")`?
24. Explain why `typeof function(){}` is `"function"` but functions are objects.
25. What happens when you do `Object(undefined)` vs `Object(null)`?
26. How does V8 engine optimize primitive storage?
27. What is the difference between `ToNumber` and `Number()`?
28. Why does `Boolean(new Boolean(false))` return `true`?
29. What is the output of `console.log(0.1 + 0.2 === 0.3)`? Is this related to type coercion?
30. Explain the memory layout of `let a = { b: { c: 1 } }`.

### Tricky Code Questions
31. What is the output?
```js
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log({} + {});
```

32. What is the output?
```js
console.log(true + false);
console.log(true + true);
console.log(true - true);
console.log(true * true);
```

33. What is the output?
```js
console.log("foo" + +"bar");
console.log("foo" + +"1");
console.log(1 + -"1" + "0");
```

34. What is the output?
```js
console.log([] == 0);
console.log([""] == 0);
console.log([0] == 0);
console.log(["0"] == 0);
```

35. What is the output?
```js
let a = { valueOf: () => 1, toString: () => "2" };
console.log(a + 1);
console.log(String(a));
console.log(a == 1);
console.log(a == "2");
```

36. What is the output?
```js
let a = { [Symbol.toPrimitive](hint) { return hint === "string" ? "hello" : 42; } };
console.log(a + 1);
console.log(String(a));
console.log(+a);
```

37. What is the output?
```js
console.log(null == undefined);
console.log(null == 0);
console.log(undefined == 0);
console.log(null >= 0);
console.log(undefined >= 0);
```

38. What is the output?
```js
console.log("5" - 3);
console.log("5" + 3);
console.log("5" - "3");
console.log("5" + -"3");
```

39. What is the output?
```js
console.log(!!"false" == !!"true");
console.log(!!"false" == !!"0");
console.log(!!"" == !!0);
```

40. What is the output?
```js
let x = [1, 2, 3];
let y = [1, 2, 3];
let z = y;
console.log(x == y);
console.log(x === y);
console.log(y == z);
console.log(x == !x);
```

41. What is the output?
```js
console.log(1 < 2 < 3);
console.log(3 > 2 > 1);
console.log(1 == 1 == 1);
console.log(1 === 1 === 1);
```

42. What is the output?
```js
console.log("b" + "a" + +"a" + "a");
```

43. What is the output?
```js
console.log(0 == "0");
console.log(0 == []);
console.log("0" == []);
console.log(0 == "0" == []);
```

44. What is the output?
```js
let obj = {
  toString() { return "10"; },
  valueOf() { return 5; }
};
console.log(obj + obj);
console.log(obj - obj);
console.log(obj == 5);
console.log(obj == "10");
```

45. What is the output?
```js
console.log([1] == true);
console.log([2] == true);
console.log([0] == false);
console.log([1, 2] == true);
```

46. What is the output?
```js
console.log(Number.MAX_VALUE > 0);
console.log(Number.MIN_VALUE > 0);
console.log(-0 === 0);
console.log(1 / -0 === 1 / 0);
```

47. What is the output?
```js
console.log(parseInt("Infinity", 10));
console.log(parseInt("Infinity", 25));
console.log(parseInt("Infinity", 36));
```

48. What is the output?
```js
console.log(9999999999999999);
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 == 0.3);
console.log((0.1 + 0.2).toFixed(1) == 0.3);
```

49. What is the output?
```js
let a = NaN;
console.log(a === a);
console.log(Object.is(a, a));
console.log(Object.is(0, -0));
console.log(0 === -0);
```

50. What is the output?
```js
console.log([] == "");
console.log([] == 0);
console.log([""] == "");
console.log([0] == 0);
console.log(["0"] == "0");
```

### More Advanced
51. How would you check if a value is `NaN`? Why doesn't `x === NaN` work?
52. What is the difference between `Object.is()` and `===`?
53. Why does `typeof []` return `"object"`? How do you properly check for arrays?
54. What is the output of `console.log(typeof typeof 1)`?
55. What is the output of `console.log(typeof new String("hello"))`?
56. What is the output of `console.log(typeof String("hello"))`?
57. What is the output of `console.log(new Boolean(false) == false)`?
58. What is the output of `console.log(new Boolean(false) === false)`?
59. What is the output of `console.log(!!new Boolean(false))`?
60. What is the output of `console.log(!!Boolean(false))`?

61. Explain the difference between `ToPrimitive` with hint `"default"` vs `"number"`.
62. What happens if both `valueOf()` and `toString()` return objects?
63. What is the output of `console.log({} + [])` in a browser console vs Node.js?
64. Why does `[] + {}` produce `"[object Object]"` but `{} + []` produces `0`?
65. What is the output of `console.log(function(){} + "")`?
66. What is the output of `console.log([].toString())`?
67. What is the output of `console.log([1, null, undefined].toString())`?
68. What is the output of `console.log({}.toString())`?
69. What is the output of `console.log({}.valueOf())`?
70. What is the output of `console.log([].valueOf())`?

71. What is the output of `console.log(1 + {} + [])`?
72. What is the output of `console.log(1 + [] + {})`?
73. What is the output of `console.log(true + [])`?
74. What is the output of `console.log(true + {})`?
75. What is the output of `console.log(false + [])`?

76. What is the output of `console.log("10" == 10)`?
77. What is the output of `console.log("10" === 10)`?
78. What is the output of `console.log(new Number(10) == 10)`?
79. What is the output of `console.log(new Number(10) === 10)`?
80. What is the output of `console.log(new Number(10) == new Number(10))`?

81. What is the output of `console.log(undefined + 1)`?
82. What is the output of `console.log(null + 1)`?
83. What is the output of `console.log(true + 1)`?
84. What is the output of `console.log(false + 1)`?
85. What is the output of `console.log("" + 1)`?

86. What is the output of `console.log("" - 1)`?
87. What is the output of `console.log("" - "1")`?
88. What is the output of `console.log("5" * "2")`?
89. What is the output of `console.log("5" / "2")`?
90. What is the output of `console.log("5" % "2")`?

91. What is the output of `console.log(!!undefined)`?
92. What is the output of `console.log(!!null)`?
93. What is the output of `console.log(!!0)`?
94. What is the output of `console.log(!!"")`?
95. What is the output of `console.log(!!NaN)`?

96. What is the output of `console.log(!!{})`?
97. What is the output of `console.log(!![])`?
98. What is the output of `console.log(!!function(){})`?
99. What is the output of `console.log(!!"0")`?
100. What is the output of `console.log(!!"false")`?

### Bonus Questions
101. What is the output of `console.log(1 + 2 + "3")` vs `console.log("1" + 2 + 3)`?
102. What is the output of `console.log("hello" > "world")`?
103. What is the output of `console.log("2" > "12")`?
104. What is the output of `console.log(2 > "12")`?
105. What is the output of `console.log("2" > 12)`?

---

## 15. Best Practices

### 1. Always Use `===` and `!==`
```js
// Bad
if (value == 5) { ... }

// Good
if (value === 5) { ... }

// Exception: checking for null/undefined
if (value == null) { /* value is null or undefined */ }
// Better:
if (value === null || value === undefined) { ... }
```

### 2. Explicit Conversions
```js
// Bad — implicit coercion
const num = +str;
const bool = !!value;

// Good — explicit and readable
const num = Number(str);
const bool = Boolean(value);
const str = String(num);
```

### 3. Check for NaN Properly
```js
// Bad
if (x === NaN) { ... } // Always false!

// Good
if (Number.isNaN(x)) { ... }

// Also good (but checks for number type first)
if (typeof x === "number" && isNaN(x)) { ... }
```

### 4. Avoid Primitive Wrappers
```js
// Bad
const str = new String("hello");
const num = new Number(42);
const bool = new Boolean(false);

// Good
const str = "hello";
const num = 42;
const bool = false;
```

### 5. Use `Number.isFinite()` for Number Checks
```js
// Bad
if (x !== null && x !== undefined && !isNaN(x)) { ... }

// Good
if (Number.isFinite(x)) { ... }
```

### 6. Falsy Checks: Be Explicit
```js
// Dangerous — 0 and "" are valid values
if (!value) { ... }

// Better
if (value == null) { ... }  // only null/undefined
if (value === undefined) { ... }
if (value === null) { ... }
```

### 7. Use `parseInt` with Radix
```js
// Bad
const num = parseInt(input);

// Good
const num = parseInt(input, 10);
```

### 8. Avoid `==` with Booleans
```js
// Bad
if (x == true) { ... }

// Good
if (x === true) { ... }
if (Boolean(x)) { ... }  // if you want truthiness
```

### 9. Understand Template Literal Coercion
```js
// Template literals call ToString on expressions
const obj = { toString: () => "custom" };
console.log(`${obj}`); // "custom"
```

### 10. Document Intentional Coercion
```js
// Explicit comment when coercion is intentional
const count = +input; // intentional: convert string to number
```

---

## 16. Summary Cheat Sheet

### Primitives vs Objects
```
┌─────────────────┬──────────────────┐
│   Primitives    │     Objects      │
├─────────────────┼──────────────────┤
│ 7 types         │ Everything else  │
│ Immutable       │ Mutable          │
│ By value        │ By reference     │
│ typeof works    │ typeof limited   │
│ No methods      │ Have methods     │
│ Stack (usually) │ Heap             │
└─────────────────┴──────────────────┘
```

### Falsy Values (MEMORIZE THESE)
```js
false, 0, -0, 0n, "", null, undefined, NaN, document.all
```

### typeof Results
```js
typeof undefined     // "undefined"
typeof null          // "object" (bug)
typeof true          // "boolean"
typeof 42            // "number"
typeof "hello"       // "string"
typeof Symbol()      // "symbol"
typeof 42n           // "bigint"
typeof {}            // "object"
typeof []            // "object"
typeof function(){}  // "function"
```

### Conversion Quick Reference
```js
// To Number
Number("42")     // 42
Number("")       // 0
Number("hello")  // NaN
Number(true)     // 1
Number(false)    // 0
Number(null)     // 0
Number(undefined)// NaN
Number([])       // 0
Number([1])      // 1
Number([1,2])    // NaN
Number({})       // NaN

// To String
String(42)       // "42"
String(true)     // "true"
String(null)     // "null"
String(undefined)// "undefined"
String([])       // ""
String([1,2])    // "1,2"
String({})       // "[object Object]"

// To Boolean
Boolean(1)       // true
Boolean(0)       // false
Boolean("")      // false
Boolean("0")     // true
Boolean([])      // true
Boolean({})      // true
Boolean(null)    // false
Boolean(undefined)// false
```

### `==` vs `===` Decision Tree
```
Are types the same?
├── YES → Use === (same behavior)
└── NO  →
    ├── null vs undefined? → == is true, === is false
    ├── number vs string? → == converts string to number
    ├── boolean vs anything? → == converts boolean to number
    ├── object vs primitive? → == converts object to primitive
    └── Otherwise → == coerces, === is false

RECOMMENDATION: Always use === unless you explicitly need null == undefined
```

### Object to Primitive Conversion
```
Need primitive from object?
├── Has Symbol.toPrimitive? → Call it with hint
└── No Symbol.toPrimitive?
    ├── Hint is "string" → toString() → valueOf()
    ├── Hint is "number" → valueOf() → toString()
    └── Hint is "default" → valueOf() → toString()
```

### The `+` Operator Rules
```
Both operands are primitives?
├── Either is string? → String concatenation
└── Neither is string? → Numeric addition

Either is object?
→ Convert both to primitives first, then apply above
```

### Key Surprises to Remember
```js
[] + []           // ""
[] + {}           // "[object Object]"
{} + []           // 0 (parsed as block + unary +)
{} + {}           // NaN or "[object Object][object Object]"
[] == ![]         // true
[1] == true       // true
[2] == true       // false
false == []       // true
false == {}       // false
null == undefined // true
null == 0         // false
"" == false       // true
"0" == false      // true
"hello" == true   // false
"1" == true       // true
"2" == true       // false
```

### Safe Type Checking
```js
// Check type
typeof x === "string"
typeof x === "number"
typeof x === "boolean"
Array.isArray(x)
x === null
x === undefined

// Check for valid number
Number.isFinite(x)        // excludes NaN, Infinity, non-numbers
Number.isInteger(x)       // whole numbers only
Number.isNaN(x)           // NaN and only NaN

// Check for empty
x == null                 // null or undefined
x === ""                  // empty string
Array.isArray(x) && x.length === 0  // empty array
Object.keys(x).length === 0         // empty object
```

---

## Final Notes

- **Type coercion is not evil** — it's a feature of JavaScript. But implicit coercion in equality checks (`==`) is the source of most bugs.
- **Always prefer explicit conversions** — they make your intent clear to other developers.
- **Understand the algorithms** — knowing `ToPrimitive`, `ToNumber`, `ToString`, and `ToBoolean` makes every "weird" JavaScript behavior predictable.
- **Memorize the falsy values** — there are only 7 (or 8 counting `document.all`). Everything else is truthy.
- **Use `===` by default** — it's safer, faster, and communicates intent.

> **"If you understand type coercion, no JavaScript behavior is weird. It's all logical — just not always intuitive."**
