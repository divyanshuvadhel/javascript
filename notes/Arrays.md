# JavaScript Arrays 

> **Topics Covered:** Array fundamentals, creation, manipulation, destructuring, methods, immutability, array-like objects, iterator methods, and real-world use cases.

---

## 1. INTRODUCTION TO ARRAYS

### 1.1 What is an Array?
An **array** is a fundamental data structure in JavaScript represented by a pair of **square brackets `[]`**. It stores a collection of elements separated by commas.

```javascript
const mixedArray = [100, true, "tapascript", {}, []];
// Index:        0      1        2         3    4
```

### 1.2 Key Characteristics
- **Heterogeneous Elements**: Arrays can hold elements of **any type** — strings, booleans, numbers, objects, other arrays, functions, etc.
- **Zero-Based Indexing**: The first element is at index `0`, the last at `length - 1`.
- **Dynamic Length**: Arrays are **not fixed-length**. You can change the length anytime.
- **Maximum Length**: The maximum possible length is **2³² - 1** (4,294,967,295 elements).

### 1.3 Index vs. Length Relationship
```
Index starts at: 0
Index ends at: length - 1

Example: [100, true, "tapascript", {}]
         0     1       2           3
Length: 4
Last index: 3 (which is 4 - 1)
```

---

## 2. CREATING ARRAYS

### 2.1 Array Literal (Most Common)
```javascript
const salad = ["🍅", "🍄", "🥦", "🥒", "🌽", "🥕", "🥑"];
// Most straightforward and recommended way
```

### 2.2 Array Constructor Function
```javascript
const anotherSalad = new Array("🍅", "🍄", "🥦", "🥒", "🌽", "🥕", "🥑");
```

**⚠️ CRITICAL TRAP:**
```javascript
const two = new Array(2);  // ❌ Creates [empty × 2] — array with 2 empty slots!
const two = new Array(1, 2); // ✅ Creates [1, 2] — array with elements 1 and 2
```
- When you pass **one numeric argument**, it creates an array with that **length**, not an array with that element.
- When you pass **multiple arguments**, they become the actual elements.

### 2.3 Reference vs. Value
```javascript
const salad = ["🍅", "🍄"];
const anotherSalad = new Array("🍅", "🍄");

console.log(salad === anotherSalad); // false — different memory references!
```
Even with identical contents, arrays created separately are **different objects** in memory.

### 2.4 Other Creation Methods (Covered Later)
- `Array.of()` — Static method for variable arguments
- `Array.from()` — Creates array from array-like or iterable objects
- `Array.fromAsync()` — Async version returning a Promise
- **Spread Operator** `[...array]` — Creates a copy

---

## 3. ACCESSING ARRAY ELEMENTS

### 3.1 Direct Index Access
```javascript
const salad = ["🍅", "🍄", "🥦", "🥒", "🌽", "🥕", "🥑"];

salad[0];  // "🍅" (tomato)
salad[2];  // "🥦" (broccoli)
salad[5];  // "🥕" (carrot)
salad[6];  // "🥑" (avocado)
```

### 3.2 Looping Through Arrays
```javascript
for (let i = 0; i <= salad.length - 1; i++) {
    console.log(`Element at index ${i} is ${salad[i]}`);
}
```
- Initialize counter at `0` (arrays start at 0)
- Loop condition: `i <= salad.length - 1` or `i < salad.length`
- Increment `i++` each iteration

---

## 4. ADDING & REMOVING ELEMENTS (MUTATING METHODS)

### 4.1 `push()` — Add to END
```javascript
const salad = ["🍅", "🍄"];
const newLength = salad.push("🥜"); // Returns new length

console.log(newLength);  // 3
console.log(salad);      // ["🍅", "🍄", "🥜"]
```
- **Returns**: New length of the array
- **Mutates**: Yes, modifies the original array

### 4.2 `unshift()` — Add to BEGINNING
```javascript
const salad = ["🍅", "🍄"];
const newLength = salad.unshift("🥜"); // Returns new length

console.log(salad); // ["🥜", "🍅", "🍄"]
```
- **Returns**: New length of the array
- **Mutates**: Yes, shifts all existing elements forward

### 4.3 `pop()` — Remove from END
```javascript
const salad = ["🍅", "🍄", "🥜"];
const removed = salad.pop(); // Returns removed element

console.log(removed); // "🥜"
console.log(salad);   // ["🍅", "🍄"]
```
- **Returns**: The removed element
- **Mutates**: Yes, modifies the original array

### 4.4 `shift()` — Remove from BEGINNING
```javascript
const salad = ["🥜", "🍅", "🍄"];
const removed = salad.shift(); // Returns removed element

console.log(removed); // "🥜"
console.log(salad);   // ["🍅", "🍄"]
```
- **Returns**: The removed element
- **Mutates**: Yes, shifts all remaining elements backward

### 4.5 Summary Table: Add/Remove Methods

| Method    | Position | Action | Return Value     | Mutates? |
|-----------|----------|--------|------------------|----------|
| `push()`  | End      | Add    | New length       | Yes      |
| `unshift()`| Beginning| Add    | New length       | Yes      |
| `pop()`   | End      | Remove | Removed element  | Yes      |
| `shift()` | Beginning| Remove | Removed element  | Yes      |

---

## 5. COPYING/CLONING ARRAYS

### 5.1 `slice()` — Immutable Copy
```javascript
const salad = ["🍅", "🍄", "🥦"];
const saladCopy = salad.slice();

console.log(saladCopy);        // ["🍅", "🍄", "🥦"]
console.log(salad === saladCopy); // false — different references!
```
- **Does NOT mutate** the original array
- Creates a **shallow copy** (new reference)
- Without arguments, copies the entire array

### 5.2 Spread Operator `[...array]` (Covered in Section 8)
```javascript
const saladCopy = [...salad]; // Modern, preferred way
```

---

## 6. DETERMINING IF A VALUE IS AN ARRAY

### 6.1 `Array.isArray()`
```javascript
Array.isArray(["🍅", "🍄"]);     // true
Array.isArray("🍅");              // false (it's a string)
Array.isArray({ tomato: "🍅" });  // false (it's an object)
Array.isArray([]);                // true (empty array is still an array)

const arr = [1, 2, 3, 4];
Array.isArray(arr);               // true
```
- **Returns**: `true` if the value is an array, `false` otherwise
- This is the **most reliable** way to check for arrays

---

## 7. ARRAY DESTRUCTURING (ES6+)

### 7.1 Basic Destructuring
Instead of:
```javascript
const tomato = salad[0];
const mushroom = salad[1];
const carrot = salad[5];
```

Use destructuring:
```javascript
const [tomato, mushroom, , , , carrot] = salad;
// tomato = "🍅", mushroom = "🍄", carrot = "🥕"
```

### 7.2 Assigning Default Values
```javascript
const [tomato = "🍅", mushroom = "🍄"] = ["🍅"];
// tomato = "🍅" (from array)
// mushroom = "🍄" (default value, since array has no second element)
```

### 7.3 Skipping Values
```javascript
const [tomato, , carrot] = ["🍅", "🍄", "🥕"];
// tomato = "🍅", carrot = "🥕" (mushroom skipped)
// Use empty comma to skip positions
```

### 7.4 Nested Array Destructuring
```javascript
const fruits = ["🍎", "🍊", "🍋", "🍌", ["🍇", "🍈", "🥕"]];

// Manual approach (recommended for nested):
const veg = fruits[4];
const carrot = veg[2]; // "🥕"

// Or combined:
const carrot = fruits[4][2]; // "🥕"

// With destructuring (complex but possible):
const [,,,, [,, carrot]] = fruits;
// NOT recommended for deep nesting — hard to read
```

---

## 8. REST PARAMETER & SPREAD OPERATOR

### 8.1 The `...` Syntax
Both use three dots `...`, but position determines behavior:

| Context | Name | Position | Purpose |
|---------|------|----------|---------|
| Left side of `=` | **Rest Parameter** | With variables | Collects remaining elements into array |
| Right side of `=` | **Spread Operator** | With array value | Spreads elements out |

### 8.2 Rest Parameter
```javascript
const [tomato, mushroom, ...rest] = salad;
// tomato = "🍅"
// mushroom = "🍄"
// rest = ["🥦", "🥒", "🌽", "🥕", "🥑"] (array of remaining elements)
```
- Collects all remaining elements into a **new array**
- Must be the **last** element in destructuring

### 8.3 Spread Operator — Cloning
```javascript
const mySalad = [...salad];
// Creates a new array with all elements spread out
// Equivalent to: const mySalad = ["🍅", "🍄", "🥦", ...];

console.log(mySalad === salad); // false — different reference
```

### 8.4 Spread Operator — Merging Arrays
```javascript
const emotions = ["😊", "😢"];
const veggies = ["🍅", "🥕"];
const emotionalVeggies = [...emotions, ...veggies];
// ["😊", "😢", "🍅", "🥕"]
```

### 8.5 Destructuring Use Case: Swapping Variables
```javascript
let first = "😢";
let second = "😊";

// Without temp variable:
[first, second] = [second, first];

console.log(first);  // "😊"
console.log(second); // "😢"
```
- Must use `let` (not `const`) because we're reassigning
- Creates a temporary array, then destructures it back

---

## 9. THE `length` PROPERTY

### 9.1 Basics
```javascript
const arr1 = [11, 21, 73];
console.log(arr1.length); // 3

const arr2 = new Array(7);
console.log(arr2.length); // 7 (7 empty slots)
```

### 9.2 Modifying Length (Mutates Array!)
```javascript
const arr = [11, 21, 73];
arr.length = 2;     // Shrinks to [11, 21] — 73 is removed!
arr.length = 0;     // Empties the array completely: []
arr.length = 9;     // [11, 21, 73, empty × 6] — adds empty slots
```

### 9.3 Length Constraints
```javascript
arr.length = 2 ** 32;     // ❌ RangeError: Invalid array length
arr.length = -1;          // ❌ RangeError: Invalid array length
```

### 9.4 Quick Empty Array Trick
```javascript
arr.length = 0; // Fastest way to empty an array
```

---

## 10. ARRAY METHODS — CREATE, REMOVE, UPDATE, ACCESS

### 10.1 `concat()` — Merge Arrays (Immutable)
```javascript
const first = [1, 2, 3];
const second = [4, 5, 6];
const third = [7, 8, 9];

const merged = first.concat(second, third);
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Original arrays unchanged:
console.log(first);  // [1, 2, 3]
```
- **Returns**: New merged array
- **Mutates**: No — original arrays remain unchanged
- Can concatenate **any number** of arrays

### 10.2 `join()` — Array to String
```javascript
const emotions = ["😊", "😢", "😡"];
const joined = emotions.join();       // "😊,😢,😡" (default: comma)
const custom = emotions.join(" # ");  // "😊 # 😢 # 😡"
```
- **Returns**: String with elements joined by separator
- Default separator: **comma**
- Empty array: `[].join()` returns `""` (empty string)

### 10.3 `fill()` — Fill with Static Value (Mutable)
```javascript
const colors = ["red", "blue", "green"];
colors.fill("pink");           // ["pink", "pink", "pink"]

// Selective fill:
const colors2 = ["red", "blue", "green"];
colors2.fill("pink", 1, 3);    // ["red", "pink", "pink"]
// Syntax: fill(value, startIndex, endLength)
// Note: end parameter is LENGTH, not index!
```
- **Mutates** the original array
- **Real-world use**: Changing all cards to same color/shape in a UI

### 10.4 `includes()` — Check Existence
```javascript
const names = ["Tom", "Alex", "Bob", "John"];
names.includes("Tom");   // true
names.includes("July");  // false
names.includes("Tom");   // false — CASE SENSITIVE!
```
- **Returns**: `true` or `false`
- **Case-sensitive** comparison

### 10.5 `indexOf()` — Find First Index
```javascript
const names = ["Tom", "Alex", "Bob", "John"];
names.indexOf("Alex");     // 1
names.indexOf("Rob");      // -1 (not found)
```
- **Returns**: First occurrence index, or `-1` if not found
- Use for finding position, `includes()` for just checking existence

### 10.6 `lastIndexOf()` — Find Last Index
```javascript
const names = ["Tom", "Alex", "Bob", "Tom"];
names.indexOf("Tom");      // 0 (first occurrence)
names.lastIndexOf("Tom");  // 3 (last occurrence)
```

### 10.7 `reverse()` — Reverse Order (Mutable)
```javascript
const names = ["Tom", "Alex", "Bob"];
names.reverse(); // ["Bob", "Alex", "Tom"]
// Original array is MODIFIED!
```

### 10.8 `sort()` — Sort Elements (Mutable)

#### Default Sort (String Conversion)
```javascript
const names = ["Tom", "Alex", "Bob"];
names.sort(); // ["Alex", "Bob", "Tom"] — alphabetical, ascending

// ⚠️ DANGER with numbers:
const ages = [2, 1000, 3, 10, 12, 21, 23, 30];
ages.sort(); // [10, 1000, 12, 2, 21, 23, 3, 30] — WRONG!
// Because: converts to strings first, then sorts!
```

#### Custom Comparator Function
```javascript
// Descending sort:
const artists = ["Adele", "Beyonce", "Charlie", "Jay-Z", "Lady Gaga"];
artists.sort((a, b) => {
    if (a === b) return 0;
    if (a > b) return -1;  // For descending
    return 1;
});
// ["Lady Gaga", "Jay-Z", "Charlie", "Beyonce", "Adele"]

// Numeric sort (ascending):
ages.sort((a, b) => a - b);  // [2, 3, 10, 12, 21, 23, 30, 1000]

// Numeric sort (descending):
ages.sort((a, b) => b - a);  // [1000, 30, 23, 21, 12, 10, 3, 2]
```

**Comparator Return Values:**
- `return < 0` — `a` comes before `b`
- `return 0` — order unchanged
- `return > 0` — `a` comes after `b`

### 10.9 `splice()` — The Multi-Purpose Method (Mutable)

**Syntax:** `array.splice(start, deleteCount, item1, item2, ...)`

| Parameter | Description |
|-----------|-------------|
| `start` | Index to start changing |
| `deleteCount` | Number of elements to remove (0 = none) |
| `item1, item2...` | Elements to add (optional) |

```javascript
const names = ["Tom", "Alex", "Bob"];

// Delete 1 element from index 0:
const removed = names.splice(0, 1); // removed = ["Tom"], names = ["Alex", "Bob"]

// Replace: delete 1, add 1:
names.splice(0, 1, "John"); // names = ["John", "Alex", "Bob"]

// Insert without deleting:
names.splice(1, 0, "Zach"); // names = ["John", "Zach", "Alex", "Bob"]

// Returns: Array of deleted elements (empty if none deleted)
```

**Memory Aid:**
- **Slice** = Copy (immutable)
- **Splice** = Cut & Paste (mutable) — remove, replace, or add

### 10.10 `at()` — Modern Index Access
```javascript
const junkFood = ["🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🍿"];

junkFood.at(0);    // "🍕" (same as [0])
junkFood.at(3);    // "🌭"
junkFood.at(-1);   // "🍿" — LAST element! (bracket notation can't do this)
junkFood.at(-5);   // "🍟" — 5th from end
junkFood.at(10);   // undefined
```
- Supports **negative indices** (count from end)
- `-1` = last element, `-2` = second-to-last, etc.

### 10.11 `copyWithin()` — Copy Within Same Array (Mutable)
```javascript
const arr = [1, 2, 3, 4, 5, 6, 7];
arr.copyWithin(0, 3, 6);
// target=0, start=3, end=6
// Copies elements from index 3 to 6 (4,5,6) to position 0
// Result: [4, 5, 6, 4, 5, 6, 7]
```
- **Syntax:** `copyWithin(target, start, end)`
- `target`: Where to copy TO
- `start`: Where to copy FROM (index)
- `end`: Where to stop copying (length, not index)
- Mutates the original array

### 10.12 `flat()` — Flatten Nested Arrays
```javascript
const arr1 = [0, 1, [2, 3], [4, 5]];
arr1.flat(); // [0, 1, 2, 3, 4, 5] — flattens 1 level deep

const arr2 = [0, 1, [2, [3, [4, 5]]]];
arr2.flat();     // [0, 1, 2, [3, [4, 5]]] — only 1 level
arr2.flat(2);    // [0, 1, 2, 3, [4, 5]] — 2 levels deep
arr2.flat(Infinity); // [0, 1, 2, 3, 4, 5] — completely flattened
```
- Default depth: `1`
- Use `Infinity` to flatten completely regardless of nesting depth

### 10.13 `Object.groupBy()` — Group Array Elements

**New in ES2025!** (May need polyfill in older environments)

```javascript
const employees = [
    { name: "Bob", dept: "Engineering", salary: 6000 },
    { name: "Alex", dept: "HR", salary: 4000 },
    { name: "Ravi", dept: "Engineering", salary: 7000 },
    { name: "Tom", dept: "Sales", salary: 5500 },
    { name: "John", dept: "Engineering", salary: 8000 }
];

// Group by department:
const byDept = Object.groupBy(employees, emp => emp.dept);
// {
//   Engineering: [Bob, Ravi, John],
//   HR: [Alex],
//   Sales: [Tom]
// }

// Group by condition:
const bySalary = Object.groupBy(employees, emp => 
    emp.salary >= 5000 ? "high" : "low"
);
// {
//   high: [Bob, Ravi, Tom, John],
//   low: [Alex]
// }
```
- Returns an **object** with grouped arrays as values
- Callback function determines the grouping key

---

## 11. IMMUTABILITY IN ARRAYS

### 11.1 Why Immutability Matters
- **Data is the source of truth** — don't mutate it directly
- Multiple functions changing data = unpredictable state
- Immutable operations create **snapshots** of state changes
- Easier debugging, time-travel, and state management

### 11.2 Immutable Alternatives to Mutable Methods

| Mutable Method | Immutable Alternative | Behavior |
|----------------|----------------------|----------|
| `reverse()` | `toReversed()` | Returns new reversed array |
| `sort()` | `toSorted()` | Returns new sorted array |
| `splice()` | `toSpliced()` | Returns new array with changes |
| `arr[i] = val` | `with(index, value)` | Returns new array with replaced value |

### 11.3 `toReversed()`
```javascript
const items = [1, 2, 3];
const reversed = items.toReversed(); // [3, 2, 1]

console.log(items);     // [1, 2, 3] — unchanged!
console.log(reversed);  // [3, 2, 1] — new array
```

### 11.4 `toSorted()`
```javascript
const months = ["March", "January", "February", "December"];
const sorted = months.toSorted(); // ["December", "February", "January", "March"]

console.log(months);   // ["March", "January", "February", "December"] — unchanged!
```

### 11.5 `toSpliced()`
```javascript
const months = ["January", "March", "April", "May"];
const spliced = months.toSpliced(1, 0, "February");
// ["January", "February", "March", "April", "May"]

console.log(months);   // ["January", "March", "April", "May"] — unchanged!
```

### 11.6 `with()` — Replace at Index (Immutable)
```javascript
const numbers = [1, 2, 3, 4, 5];
const newArray = numbers.with(2, 6); // [1, 2, 6, 4, 5]

console.log(numbers);   // [1, 2, 3, 4, 5] — unchanged!
console.log(newArray);  // [1, 2, 6, 4, 5] — new array

// Works with negative indices too:
const withNegative = numbers.with(-2, 8); // [1, 2, 3, 8, 5]
// -2 means second from end (index 3)
```

**⚠️ WARNING:** Using bracket notation with negative index creates unwanted property:
```javascript
numbers[-2] = 8; // Creates a property "-2", doesn't modify array properly!
// Use .with() for negative index replacement
```

---

## 12. ARRAY-LIKE OBJECTS

### 12.1 What is Array-Like?
An **object** that:
- Has indexed elements (numeric keys: `0`, `1`, `2`...)
- Has a `length` property
- **BUT** is NOT actually an array (no array methods like `push`, `pop`, `forEach`, etc.)

```javascript
const arrLike = {
    0: "I",
    1: "am",
    2: "array-like",
    length: 3
};

arrLike[0];      // "I"
arrLike.length;  // 3
Array.isArray(arrLike); // false
arrLike instanceof Object; // true
```

### 12.2 Common Array-Like Objects in JavaScript

#### 1. `arguments` object (inside functions)
```javascript
function checkArgs() {
    console.log(arguments); // { 0: 1, 1: 45, length: 2 }
    console.log(Array.isArray(arguments)); // false
    // arguments.pop(); // ❌ TypeError: not a function
}
checkArgs(1, 45);
```

#### 2. DOM HTMLCollections
```javascript
const liElements = document.getElementsByTagName("li");
// HTMLCollection — array-like, NOT an array!
// liElements.forEach(); // ❌ TypeError!
```

### 12.3 Converting Array-Like to Array

#### Method 1: Spread Operator
```javascript
const args = [...arguments];
```

#### Method 2: `Array.from()` (Static Method)
```javascript
const collection = document.getElementsByTagName("li");
const array = Array.from(collection);
// Now you can use .forEach(), .map(), etc.
```

#### Method 3: `Array.fromAsync()` (Async)
```javascript
// Returns a Promise!
const promise = Array.fromAsync(collection);
promise.then(array => {
    console.log(array); // Actual array
});

// Also works with async iterables (ReadableStream, async generators)
```

### 12.4 `Array.of()` — Create Array from Arguments
```javascript
const a = Array.of(2, 3, 4);        // [2, 3, 4]
const b = Array.of(2);              // [2] — NOT empty slots!
const c = Array.of(2, true, "test", {a: 1}, [1, 2]);
// [2, true, "test", {a: 1}, [1, 2]] — mixed types
```
- Unlike `new Array(2)` which creates empty slots, `Array.of(2)` creates `[2]`

---

## 13. ITERATOR METHODS (Functional Programming)

### 13.1 `filter()` — Selective Filtering

**Use Case:** Get senior citizens (age >= 60)

```javascript
const customers = [
    { name: "Abby", age: 32 },
    { name: "Jerry", age: 64 },
    { name: "Diana", age: 22 },
    { name: "Dev", age: 82 },
    { name: "Maria", age: 7 }
];

const seniors = customers.filter(customer => customer.age >= 60);
// [{ name: "Jerry", age: 64 }, { name: "Dev", age: 82 }]
```

**How it works:**
- Callback is a **test function** returning `true`/`false`
- If `true` → element included in result
- If `false` → element filtered out
- **Returns**: New array with passing elements only
- **Does NOT mutate** original array

**Callback Parameters:** `(element, index, array)` — all optional except element

### 13.2 `map()` — Transform Each Element

**Use Case:** Add title and full name to customers

```javascript
const customersWithFullName = customers.map(customer => {
    let title = "";
    if (customer.gender === "M") {
        title = "Mr.";
    } else if (customer.gender === "F" && customer.married) {
        title = "Mrs.";
    } else {
        title = "Miss";
    }

    customer.fullName = `${title} ${customer.fName} ${customer.lName}`;
    return customer;
});
```

**How it works:**
- Callback is a **transformation function**
- Applied to **every** element
- **Returns**: New array with transformed elements (same length as original)
- **Does NOT mutate** original array (though modifying the object inside does)

### 13.3 `reduce()` — Reduce to Single Value

**Use Case:** Calculate average age of customers who bought books

```javascript
const totalAge = customers.reduce((accumulator, customer) => {
    if (customer.purchased.includes("book")) {
        return accumulator + customer.age;
    }
    return accumulator;
}, 0);

// Average = totalAge / count
```

**Anatomy of reduce:**
```javascript
array.reduce((accumulator, currentValue, index, array) => {
    // business logic
    return newAccumulatorValue;
}, initialValue);
```

**How it works:**
1. `accumulator` starts as `initialValue` (or first element if omitted)
2. For each element, callback runs with current `accumulator` and `currentValue`
3. Whatever you **return** becomes the new `accumulator`
4. Final `accumulator` is the result

**Simple Example — Summation:**
```javascript
const nums = [1, 2, 3, 4, 5];
const sum = nums.reduce((acc, curr) => acc + curr, 0);
// Step 1: acc=0, curr=1, return 1
// Step 2: acc=1, curr=2, return 3
// Step 3: acc=3, curr=3, return 6
// Step 4: acc=6, curr=4, return 10
// Step 5: acc=10, curr=5, return 15
// Result: 15
```

### 13.4 `reduceRight()` — Reduce from Right to Left
```javascript
const nums = [100, 40, 15];

const left = nums.reduce((a, b) => a - b);      // 100 - 40 - 15 = 45
const right = nums.reduceRight((a, b) => a - b); // 15 - 40 - 100 = -125
```
- Same as `reduce` but iterates from **right to left**
- Matters for non-commutative operations (subtraction, division)

### 13.5 `some()` — At Least One Satisfies?
```javascript
const hasYoungCustomer = customers.some(customer => customer.age < 10);
// true if ANY customer has age < 10
// false if NO customer has age < 10
```
- **Returns**: `true` if at least one element passes the test
- **Returns**: `false` if no elements pass
- Stops early on first `true` (short-circuit)

### 13.6 `every()` — All Satisfy?
```javascript
const allMarried = customers.every(customer => customer.married);
// true if ALL customers are married
// false if ANY customer is not married
```
- **Returns**: `true` if ALL elements pass the test
- **Returns**: `false` if any element fails
- Stops early on first `false` (short-circuit)

### 13.7 `find()` — Find First Matching Element
```javascript
const youngCustomer = customers.find(customer => customer.age < 10);
// Returns the first matching customer object
// Returns undefined if no match found
```

### 13.8 `findIndex()` — Find Index of First Match
```javascript
const youngIndex = customers.findIndex(customer => customer.age < 10);
// Returns the index (e.g., 4)
// Returns -1 if no match found
```

### 13.9 `findLast()` — Find Last Matching Element
```javascript
const lastYoung = customers.findLast(customer => customer.age < 10);
// Searches from RIGHT to LEFT
// Returns the last matching element
```

### 13.10 `findLastIndex()` — Find Index of Last Match
```javascript
const lastYoungIndex = customers.findLastIndex(customer => customer.age < 10);
// Searches from RIGHT to LEFT
// Returns index of last match, or -1
```

### 13.11 Method Comparison Table

| Method | Returns | Stops Early? | Direction | Use Case |
|--------|---------|--------------|-----------|----------|
| `some()` | `true`/`false` | Yes (on first `true`) | L→R | Check if any match |
| `every()` | `true`/`false` | Yes (on first `false`) | L→R | Check if all match |
| `find()` | Element or `undefined` | Yes (on first match) | L→R | Get first match |
| `findIndex()` | Index or `-1` | Yes (on first match) | L→R | Get first match index |
| `findLast()` | Element or `undefined` | Yes (on first match) | R→L | Get last match |
| `findLastIndex()` | Index or `-1` | Yes (on first match) | R→L | Get last match index |

---

## 14. CHAINING ARRAY METHODS

### 14.1 The Power of Chaining
Methods that return arrays can be chained together for complex operations.

**Use Case:** Get total expenses of married customers

```javascript
// Step-by-step approach:
const married = customers.filter(c => c.married);
const expenses = married.map(c => c.expense);
const total = expenses.reduce((sum, exp) => sum + exp, 0);

// Chained approach (same result, cleaner code):
const totalExpense = customers
    .filter(c => c.married)           // Get married customers
    .map(c => c.expense)              // Extract expenses
    .reduce((sum, exp) => sum + exp, 0); // Sum them up

// Result: 2190 (example value)
```

**Why chaining works:**
- `filter()` returns an array → can call `.map()` on it
- `map()` returns an array → can call `.reduce()` on it
- Each method passes its result to the next

---

## 15. ADDITIONAL ITERATOR METHODS

### 15.1 `forEach()` — Simple Iteration
```javascript
const nums = [1, 2, 3, 4, 5];
let sum = 0;

nums.forEach(num => {
    sum += num; // Side effect — modifies external variable
});

console.log(sum); // 15
```

**Key Differences from `map`/`reduce`:**
- `forEach()` **returns `undefined`** — no return value
- Used for **side effects** (logging, external variable modification)
- Cannot chain further (returns undefined)
- Less functional — prefer `map`/`reduce`/`filter` when possible

### 15.2 `entries()` — Iterator with Index & Value
```javascript
const arr = ["a", "b", "c"];
const iterator = arr.entries();

iterator.next().value; // [0, "a"]
iterator.next().value; // [1, "b"]
iterator.next().value; // [2, "c"]

// With for...of and destructuring:
for (const [index, element] of arr.entries()) {
    console.log(`${index}: ${element}`);
}
// 0: a
// 1: b
// 2: c
```

### 15.3 `values()` — Iterator with Values Only
```javascript
for (const value of arr.values()) {
    console.log(value);
}
// a
// b
// c
```

### 15.4 `flatMap()` — Map + Flat (1 Level)
```javascript
const nums = [1, 2, 3, 4];

// Simple map (no flattening needed):
const doubled = nums.flatMap(n => n * 2); // [2, 4, 6, 8]

// Complex: returns nested arrays, then flattens 1 level:
const nested = nums.flatMap(n => [n * 2]); // [2, 4, 6, 8] — same result

// Real use case: transform and flatten in one step
const sentences = ["Hello world", "Goodbye moon"];
const words = sentences.flatMap(s => s.split(" "));
// ["Hello", "world", "Goodbye", "moon"]
```
- Equivalent to: `.map().flat(1)`
- Only flattens **1 level deep**

---

## 16. MUTABILITY vs. IMMUTABILITY SUMMARY TABLE

| Method | Mutates Original? | Returns | Use When... |
|--------|------------------|---------|-------------|
| `push()` | ✅ Yes | New length | Adding to end (mutable) |
| `pop()` | ✅ Yes | Removed element | Removing from end (mutable) |
| `unshift()` | ✅ Yes | New length | Adding to start (mutable) |
| `shift()` | ✅ Yes | Removed element | Removing from start (mutable) |
| `splice()` | ✅ Yes | Deleted items | Complex insert/delete/replace |
| `reverse()` | ✅ Yes | Reversed array | Reverse order (mutable) |
| `sort()` | ✅ Yes | Sorted array | Sort elements (mutable) |
| `fill()` | ✅ Yes | Modified array | Fill with value (mutable) |
| `copyWithin()` | ✅ Yes | Modified array | Copy within same array |
| `slice()` | ❌ No | New array | Copy/extract portion |
| `concat()` | ❌ No | New array | Merge arrays |
| `toReversed()` | ❌ No | New array | Reverse (immutable) |
| `toSorted()` | ❌ No | New array | Sort (immutable) |
| `toSpliced()` | ❌ No | New array | Splice (immutable) |
| `with()` | ❌ No | New array | Replace at index (immutable) |
| `filter()` | ❌ No | New array | Selective filtering |
| `map()` | ❌ No | New array | Transform each element |
| `reduce()` | ❌ No | Single value | Aggregate to single value |
| `flat()` | ❌ No | New array | Flatten nested arrays |
| `flatMap()` | ❌ No | New array | Map + flatten 1 level |

---

## 17. KEY TAKEAWAYS & BEST PRACTICES

1. **Prefer immutable methods** (`toSorted`, `toReversed`, `with`, `toSpliced`) over mutable ones to avoid side effects.

2. **Use `Array.isArray()`** to reliably check if something is an array — `typeof` returns `"object"` for arrays.

3. **Remember the `new Array(n)` trap** — creates empty slots, not an array with element `n`.

4. **Destructuring saves code** — learn to use it for cleaner, more readable code.

5. **Spread operator is versatile** — use for cloning, merging, and converting array-like objects.

6. **Chain methods wisely** — `filter` → `map` → `reduce` is a common pattern for data processing.

7. **Understand callback types:**
   - `filter` → **Test function** (returns boolean)
   - `map` → **Transformation function** (returns new value)
   - `reduce` → **Reducer function** (returns accumulator)

8. **Array-like objects are everywhere** — DOM collections, `arguments`, etc. Convert them with `Array.from()` or spread.

9. **Negative indices** — Use `.at(-1)` instead of `[arr.length - 1]` for cleaner code.

10. **Practice with tasks** — The course provides 50+ tasks to solidify understanding.

---

> **End of Notes** — Master these concepts and you'll handle JavaScript arrays with confidence in any interview or real-world application!
