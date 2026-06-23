# JavaScript Deep Practice Assignment
### Covers: History & Architecture · Variables · Conditions · Loops

Work through these in order. Each section builds on the last.

---

## Section 1: Conceptual (History & Architecture)

1. Write 3-4 sentences explaining why JS was created in 1995 and what problem it solved at the time.
2. Explain in your own words: **Call Stack**, **Memory Heap**, and **Event Loop**. Don't copy definitions — explain like you'd explain to a friend.
3. Is JavaScript single-threaded or multi-threaded? Justify your answer using the architecture you learned.
4. What's the difference between the **JS Engine** (e.g. V8) and the **JS Runtime**? Give one example of something the runtime provides that the engine doesn't.

---

## Section 2: Variables — Predict & Fix

5. Predict the output of both `console.log` lines before running. Explain why they differ (hoisting + scope).

```javascript
console.log(a);
var a = 5;

console.log(b);
let b = 10;
```

6. Fix this buggy code (it should print 1, 2, 3 with a 1-second gap):

```javascript
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
```

7. Declare a `const` object `user = { name: "Sam", age: 25 }`.
   Try changing `user.age` to 30 — does it work?
   Then try reassigning `user = {}` — does it work?
   Explain why both behave differently.

---

## Section 3: Conditions — Build Logic

8. Write a function `checkAge(age)` that returns:
   - `"child"` if age < 13
   - `"teen"` if 13–19
   - `"adult"` if 20–59
   - `"senior"` if 60+

9. Replace your if-else chain above with a `switch` statement using ranges (hint: switch doesn't do ranges natively — figure out the trick).

10. Write a function `grade(score)` using **ternary operators only** (no if/else) that returns `"Pass"` or `"Fail"` based on `score >= 40`.

11. **Tricky one** — predict the output, then explain each using `==` vs `===` rules:

```javascript
console.log(0 == "0");
console.log(0 == "");
console.log(null == undefined);
console.log(NaN == NaN);
```

---

## Section 4: Loops — Core Drills

12. Print numbers 1 to 50, but skip multiples of 3 (use `continue`).

13. Print the multiplication table (1 to 10) for a number entered by the user, using a `while` loop.

14. Reverse a string using a `for` loop (no built-in `.reverse()`).

15. Find the largest number in this array using a loop:

```javascript
let nums = [12, 45, 3, 89, 23, 67];
```

16. Print this pattern using nested loops:

```
*
**
***
****
*****
```

17. **Challenge (combines everything):** Write a program that:
    - Takes an array of ages: `[5, 17, 25, 70, 12, 45, 64]`
    - Loops through it
    - Uses conditions to classify each as child/teen/adult/senior (reuse Q8 logic)
    - Counts how many are in each category
    - Prints a summary like:

```
Children: 2
Teens: 1
Adults: 2
Seniors: 2
```

---

