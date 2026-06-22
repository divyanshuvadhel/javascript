# JavaScript Conditionals & Loops — Deep Dive Notes

---

## 1. Truthy & Falsy (the foundation of every condition)

Before conditionals make sense, you must understand how JS converts any value to `true`/`false`.

**Falsy values (only 8, memorize all of them):**
```js
false
0
-0
0n          // BigInt zero
""          // empty string
null
undefined
NaN
```

**Everything else is truthy**, including:
```js
"0"         // non-empty string -> truthy
"false"     // truthy
[]          // empty array -> truthy
{}          // empty object -> truthy
" "         // string with space -> truthy
```

This matters because `if`, `while`, `&&`, `||`, ternary — all of them coerce their condition through this rule.

---

## 2. `if / else if / else`

### Basic form
```js
if (condition) {
  // runs if condition is truthy
} else if (condition2) {
  // runs if condition is falsy but condition2 is truthy
} else {
  // runs if none matched
}
```

### Block scoping trap
`{ }` after `if` creates a **block scope**. `let`/`const` declared inside are NOT visible outside.
```js
if (true) {
  let x = 10;
}
console.log(x); // ReferenceError
```
`var` would leak out because `var` is function-scoped, not block-scoped.

### Single statement (no braces) — danger zone
```js
if (true) console.log("a");
else console.log("b");
```
Works, but **only the next single statement** belongs to the `if`. A classic bug:
```js
if (true)
  console.log("a");
  console.log("b"); // ALWAYS runs — not part of if!
```

### Nested if vs else-if chain — performance & readability
```js
// else-if chain: stops at first true, O(n) worst case
if (a) {}
else if (b) {}
else if (c) {}
else {}
```
Each `else if` is only evaluated if all previous conditions were false — short-circuit at the structural level.

---

## 3. Comparison Operators — `==` vs `===`

This is where most "weird JS" bugs come from.

### `===` (strict equality)
No type conversion. Compares type AND value.
```js
1 === "1"      // false
null === undefined // false
NaN === NaN    // false (!!) — NaN is never equal to itself
```

### `==` (loose equality) — uses coercion rules
The algorithm (simplified ECMA spec steps):
1. If types match → same as `===`
2. `null == undefined` → `true` (but `null == 0` → `false`)
3. number vs string → string converted to number
4. boolean vs anything → boolean converted to number (`true`→1, `false`→0)
5. object vs primitive → object converted via `ToPrimitive` (calls `valueOf`/`toString`)

Weird real examples:
```js
'' == '0'        // false
0 == ''          // true
0 == '0'         // true
false == 'false' // false  (string "false" converts to NaN, not 0)
false == 0       // true
' \t\r\n ' == 0  // true (whitespace string -> 0)
[] == ![]        // true  (![] is false, [] == false -> '' == false -> 0==0)
```
**Rule of thumb: always use `===`/`!==` unless you specifically want `null`/`undefined` to be treated as equal.**

### `Object.is()` — the strictest equality
Handles the two edge cases `===` gets "wrong" for some use cases:
```js
Object.is(NaN, NaN)   // true
Object.is(0, -0)      // false
0 === -0              // true
```

---

## 4. Logical Operators as Control Flow (not just booleans)

### Short-circuit evaluation
```js
a && b   // if a is falsy, return a immediately (b never evaluated)
a || b   // if a is truthy, return a immediately (b never evaluated)
```
These return **values**, not just booleans:
```js
0 && "anything"     // 0
"" || "default"     // "default"
null ?? "fallback"  // "fallback"
```

### `&&` used as a guard (common pattern)
```js
isLoggedIn && showDashboard();
```
Only calls `showDashboard()` if `isLoggedIn` is truthy.

### `??` Nullish Coalescing (ES2020) — different from `||`
```js
0 || "default"   // "default"  (0 is falsy, so || replaces it — often a bug!)
0 ?? "default"   // 0          (?? only triggers on null/undefined)
```
Use `??` when you want to allow `0`, `false`, `""` as valid values but replace `null`/`undefined`.

### `??=`, `||=`, `&&=` (logical assignment, ES2021)
```js
let a = null;
a ??= 5;   // a = 5 (only assigns if a was null/undefined)

let b = 0;
b ||= 10;  // b = 10 (assigns because 0 is falsy)

let c = 1;
c &&= 20;  // c = 20 (assigns because 1 is truthy)
```

### Optional chaining `?.` combined with conditionals
```js
user?.address?.city  // returns undefined safely instead of throwing
user?.greet?.()       // calls method only if it exists
```

---

## 5. Ternary Operator — and chaining/nesting

```js
condition ? valueIfTrue : valueIfFalse
```

### Nested ternaries (use sparingly, but understand them)
```js
let grade = score >= 90 ? 'A'
          : score >= 80 ? 'B'
          : score >= 70 ? 'C'
          : 'F';
```
Evaluated right-to-left in terms of grouping: `score >= 90 ? 'A' : (score >= 80 ? 'B' : (...))`

### Ternary vs if-else — key difference
Ternary is an **expression** (produces a value, can be assigned/passed/returned).
`if-else` is a **statement** (cannot be used inline as a value).
```js
const x = if (a) { 1 } else { 2 }; // SyntaxError
const x = a ? 1 : 2;                 // works
```

---

## 6. `switch` Statement — full mechanics

```js
switch (expression) {
  case value1:
    // code
    break;
  case value2:
  case value3:        // fall-through grouping (no break between cases)
    // shared code for value2 AND value3
    break;
  default:
    // code
}
```

### Critical details:
- `switch` uses **strict equality (`===`)** internally — `switch(1)` will NOT match `case "1":`
- **Fall-through** happens if you forget `break` — execution continues into the NEXT case regardless of its condition:
```js
switch (1) {
  case 1:
    console.log("one");
    // no break!
  case 2:
    console.log("two"); // ALSO RUNS — fall-through bug
    break;
}
// logs: "one" then "two"
```
- `default` doesn't have to be last (rare, but legal) — it only triggers if NO case matched, and execution starts from wherever `default` is positioned if reached via fall-through.
- You can use block scope per case with `{}` to allow `let`/`const` redeclaration:
```js
switch (x) {
  case 1: {
    let y = 1;
    break;
  }
  case 2: {
    let y = 2; // no conflict, separate block scope
    break;
  }
}
```
- `switch(true)` pattern — turns switch into if-else chain:
```js
switch (true) {
  case score >= 90:
    console.log('A'); break;
  case score >= 80:
    console.log('B'); break;
  default:
    console.log('F');
}
```

---

## 7. Loops — Deep Mechanics

### 7.1 `for` loop anatomy
```js
for (initialization; condition; increment) {
  // body
}
```
Execution order: **init → check condition → run body → run increment → check condition → ...**

Each part is optional:
```js
for (;;) { } // infinite loop, valid syntax
```

You can declare multiple variables:
```js
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
```

### `let` vs `var` in for loops — the classic closure bug
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// logs: 3, 3, 3  (var is function-scoped, shared single binding)

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// logs: 0, 1, 2  (let creates a NEW binding per iteration)
```
This happens because the spec defines `let` in a `for` loop to create a fresh lexical environment each iteration (per-iteration bindings), while `var` doesn't.

### 7.2 `while` loop
```js
while (condition) {
  // body — checked BEFORE every iteration, including the first
}
```
If condition is false initially, body never runs (0 iterations possible).

### 7.3 `do...while` loop
```js
do {
  // body — ALWAYS runs at least once
} while (condition);
```
Condition is checked AFTER the body. Guarantees minimum 1 execution.

### 7.4 `for...in` — enumerates KEYS (for objects, and arrays' indices as strings)
```js
const obj = { a: 1, b: 2 };
for (const key in obj) {
  console.log(key, obj[key]); // 'a' 1, 'b' 2
}
```
**Pitfalls:**
- Iterates over **enumerable properties**, including inherited ones from the prototype chain (unless you guard with `hasOwnProperty`).
- For arrays, keys are **strings** (`"0"`, `"1"`), not numbers, and order isn't strictly guaranteed for non-integer keys.
- Don't use `for...in` on arrays — use `for...of` or `.forEach` instead.

```js
for (const key in obj) {
  if (Object.hasOwn(obj, key)) { // modern guard (replaces hasOwnProperty)
    // safe — only own properties
  }
}
```

### 7.5 `for...of` — enumerates VALUES (for iterables)
```js
const arr = [10, 20, 30];
for (const val of arr) {
  console.log(val); // 10, 20, 30
}
```
Works on any **iterable**: Array, String, Map, Set, generators, NodeList, arguments object.

```js
for (const char of "hi") console.log(char); // 'h', 'i'

const map = new Map([['a', 1], ['b', 2]]);
for (const [key, value] of map) console.log(key, value);
```

`for...of` uses the iterable's `Symbol.iterator` under the hood — this is why plain objects (`{}`) DON'T work with `for...of` by default (they aren't iterable) but DO work with `for...in`.

### 7.6 `.forEach()` — array method, not a true loop construct
```js
arr.forEach((value, index, array) => {
  // ...
});
```
**Cannot `break` or `continue`** — there's no native way to stop it early (returning inside the callback only skips that single iteration, behaving like `continue`, but you can't fully exit).
```js
arr.forEach(val => {
  if (val === 3) return; // acts like 'continue' for this iteration only
});
```
To truly "break" out of iteration, use `for...of`, a plain `for`, `.some()`, or `.every()` (which DO support early exit via return value).

---

## 8. Loop Control Statements

### `break`
Exits the nearest enclosing loop or `switch` entirely.

### `continue`
Skips to the next iteration, re-evaluating the loop condition (for `for`, this still runs the increment step first).

### Labeled statements — breaking/continuing OUTER loops
```js
outer: for (let i = 0; i < 3; i++) {
  inner: for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer; // skips to next i, abandons inner loop
    if (i === 2) break outer;    // exits BOTH loops entirely
    console.log(i, j);
  }
}
```
This is one of the few legitimate uses of labels in modern JS — useful for nested loop early exits without flags.

---

## 9. Infinite Loops & Safety

```js
while (true) {
  // must have an internal break or it hangs forever
  if (someCondition) break;
}
```
Common in event loops, polling, game loops, generator-driven logic. Always ensure a guaranteed exit path.

---

## 10. Iteration Protocol (advanced — what powers `for...of`)

An object is iterable if it implements `Symbol.iterator`, returning an object with a `.next()` method that returns `{ value, done }`.

```js
const customIterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        i++;
        return i <= 3
          ? { value: i, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const num of customIterable) {
  console.log(num); // 1, 2, 3
}
```
This is exactly how `for...of` works internally — it repeatedly calls `.next()` until `done: true`.

---

## 11. Generators — loops that pause (related, advanced)

```js
function* counter() {
  let i = 0;
  while (true) {
    yield i++; // pauses here, resumes on next .next() call
  }
}

const gen = counter();
console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
```
Generators implement the iterator protocol automatically, so they work directly in `for...of` (with a terminating condition) and can be combined with conditionals inside to control flow lazily.

---

## 12. Performance & Style Notes

| Construct        | Best for                                      | Avoid when                          |
|-------------------|-----------------------------------------------|--------------------------------------|
| `for`             | Index-based control, need `break`/`continue` | Simple iteration over values        |
| `for...of`        | Iterating values of any iterable             | Need index frequently (use `.entries()`) |
| `for...in`        | Enumerating object keys                       | Iterating arrays                    |
| `.forEach()`      | Side-effect-only iteration, no early exit needed | Need to `break`                  |
| `.map/.filter/.reduce` | Transforming data functionally           | Just need side effects (creates unnecessary arrays) |
| `while`           | Unknown iteration count                       | Known fixed range (use `for`)       |
| `do...while`      | Must run at least once (menus, retries)       | Rare in modern code, used sparingly |

```js
// for...of with index via .entries()
for (const [index, value] of arr.entries()) {
  console.log(index, value);
}
```

---

## 13. Common Bugs Checklist

- Using `==` instead of `===` and getting unexpected coercion results.
- Forgetting `break` in `switch`, causing fall-through.
- `var` in loops causing shared closures instead of per-iteration bindings.
- Using `for...in` on arrays (gets string indices + inherited props).
- Trying to `break` inside `.forEach()` — impossible, switch to `for...of`.
- Off-by-one errors: `i <= arr.length` instead of `i < arr.length`.
- Infinite loops from forgetting to update the loop variable / condition.
- Confusing `??` with `||` when `0`, `""`, or `false` are valid expected values.