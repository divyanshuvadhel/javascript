# JavaScript Variables 
---

## 2. What is a Variable?
- A variable is a **reserved space in memory** where you store a value to use later.
- Declared in JavaScript using `let` (or `const` for values that shouldn't change).

```js
let name = 'John';
console.log(name); // John
```

- Printing the variable directly (no quotes) prints its **value**.
- Printing a string in quotes prints **exactly that text**.

```js
console.log(name);   // John   (variable)
console.log('name');  // name  (literal string)
```

---

## 3. JavaScript is "Dynamically Typed"
- Unlike some languages, you don't declare a value's type beforehand (no `int`, `string` keywords needed).
- JS automatically figures out whether something is a string, number, float, etc.

```js
let score = 100;     // number
let score2 = '100';  // string (because it's wrapped in quotes)
let price = 2.3;     // float / decimal number
```

⚠️ **Important rule:** Anything inside quotes (`'...'` or `"..."`) becomes a **string**, even if it looks like a number.

---

## 4. Strings vs Numbers — Why It Matters
```js
let score = 100;     // number
let bonus = 20;      // number
let totalScore = score + bonus;
console.log(totalScore); // 120 ✅ (numeric addition)
```

```js
let score = '100';   // string
let bonus = '20';    // string
let totalScore = score + bonus;
console.log(totalScore); // '10020' ❌ (string concatenation, not math!)
```

- `+` between **numbers** = mathematical addition.
- `+` between **strings** = concatenation (joining text together).
- This is one of the most common beginner bugs in JS — mixing strings and numbers unintentionally.

---

## 5. Variable Naming Rules
- Use **camelCase** for readability (community convention, not a strict rule): `firstName`, `totalScore`.
- Variable names **cannot contain spaces**.
  - ❌ `let first name = 'John'`
  - ✅ `let firstName = 'John'`
  - ✅ `let first_name = 'John'` (underscore allowed, but camelCase preferred in JS)

---

## 6. String Concatenation (Joining Strings)
Multiple ways to combine strings:

```js
let firstName = 'John';
let lastName = 'Doe';

// Method 1: direct + concatenation
console.log(firstName + lastName); // JohnDoe (no space)

// Method 2: add a separator
console.log(firstName + ' ' + lastName); // John Doe

// Method 3: store the result in a new variable first
let fullName = firstName + ' ' + lastName;
console.log(fullName); // John Doe
```

- You can use any separator: `' '`, `'-'`, `'**'`, etc.
- JS allows multiple correct approaches to the same problem — this is normal in programming.

---

## 7. `let` vs `const`
| | `let` | `const` |
|---|---|---|
| Can reassign value? | ✅ Yes | ❌ No |
| Can redeclare with `let`/`const` again? | ❌ No | ❌ No |
| Use case | Values that change (score, name, counters) | Fixed values (bonus rate, bank account number, PAN ID) |

```js
let firstName = 'John';
firstName = 'Jane'; // ✅ allowed — just reassign, don't use `let` again

let first name = 'Jane'; // ❌ ERROR — redeclaring with `let` is not allowed

const bonus = 20;
bonus = 30; // ❌ ERROR — cannot reassign a const
```

**Rule of thumb from the lecture:** use `const` more often than you'd think — it's a way to "lock" values that should never change, which also helps prevent accidental bugs.

---

## 8. Semicolons
- JavaScript is forgiving — semicolons (`;`) are optional in most cases due to **Automatic Semicolon Insertion (ASI)**.
- Many style guides still recommend using them consistently to avoid rare edge-case bugs (see "Extra Notes" below).

---

## 9. Real-World Example Recap
```js
let firstName = 'John';
let lastName = 'Doe';
let fullName = firstName + ' ' + lastName;
console.log(fullName); // John Doe

let score = 100;
let bonus = 20;
let totalScore = score + bonus;
console.log(totalScore); // 120
```

---

# Extra Notes (Not Covered in the Video)

## A. `var` — the older way (and why we avoid it)
The lecture only covers `let` and `const`, but there's a third (legacy) keyword: `var`.
```js
var name = 'John';
```
- `var` is **function-scoped**, not block-scoped — it leaks out of `if`/`for` blocks, which causes bugs.
- `var` can be **redeclared** and **hoisted** in confusing ways (accessible before declaration as `undefined`).
- Modern JS (since ES6 / 2015) recommends **always using `let` and `const`**, never `var`.

## B. Data Types Beyond String & Number
The lecture mentions strings and numbers. JS actually has these primitive types:
- `string` — text
- `number` — integers and floats (JS doesn't separate int/float internally)
- `boolean` — `true` / `false`
- `undefined` — declared but no value assigned
- `null` — intentional "no value"
- `bigint` — for numbers larger than `Number` can safely hold
- `symbol` — unique identifiers (advanced, rarely used early on)

Plus the non-primitive type:
- `object` (arrays, functions, and objects are all technically objects)

## C. `typeof` operator
Useful for checking what type a variable holds:
```js
console.log(typeof 100);      // "number"
console.log(typeof '100');    // "string"
console.log(typeof true);     // "boolean"
console.log(typeof undefined);// "undefined"
```

## D. Template Literals (modern string concatenation)
The lecture uses `+` to join strings. Modern JS has a cleaner way using **backticks** and `${}`:
```js
let firstName = 'John';
let lastName = 'Doe';
let fullName = `${firstName} ${lastName}`;
console.log(fullName); // John Doe
```
- Easier to read with multiple variables.
- Supports multi-line strings without special characters.
- This is the preferred modern approach over `+` concatenation.

## E. Type Coercion Gotchas
The lecture shows `'100' + '20' = '10020'`. There are more surprising cases:
```js
console.log('5' + 3);   // '53'  (string wins, becomes concatenation)
console.log('5' - 3);   // 2     (minus forces numeric conversion)
console.log('5' * '2'); // 10    (multiplication also forces numbers)
console.log(true + 1);  // 2     (true becomes 1)
```
- `+` is the only operator that "prefers" strings when one side is a string.
- `-`, `*`, `/` always try to convert to numbers.
- This inconsistency is a famous JS quirk — good to be aware of early.

## F. Strict Equality (`===`) vs Loose Equality (`==`)
Not covered yet, but closely related to types:
```js
console.log(100 == '100');  // true  (loose equality, converts types)
console.log(100 === '100'); // false (strict equality, checks type too)
```
- Best practice: **always use `===` and `!==`**, avoid `==`/`!=` to prevent unexpected type coercion bugs.

## G. Naming Convention Reference (beyond camelCase)
- `camelCase` → variables, functions: `firstName`, `getUserData`
- `PascalCase` → classes/constructors: `class UserAccount`
- `UPPER_SNAKE_CASE` → constants that are truly fixed/global config: `const MAX_SCORE = 100`

## H. Why `const` Doesn't Mean "Completely Frozen"
Important nuance for later: `const` prevents **reassignment**, not mutation of objects/arrays.
```js
const user = { name: 'John' };
user.name = 'Jane'; // ✅ allowed! Object contents can still change
user = {};            // ❌ ERROR — can't reassign the variable itself
```
This trips up a lot of learners later, so good to file away now.

## I. Running JS Files (context from the video)
The lecture runs files using:
```bash
node variables.js
```
This means it's using **Node.js** to execute JavaScript outside the browser — good to know this is a separate environment from running JS in a `<script>` tag in HTML, though the language rules are the same.