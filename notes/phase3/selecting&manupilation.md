# JavaScript DOM Selection & Manipulation 

> **Topic:** Selecting & Manipulating DOM Elements in JavaScript  

---

## Table of Contents

1. [getElementById](#1-getelementbyid)
2. [getElementsByClassName](#2-getelementsbyclassname)
3. [getElementsByTagName](#3-getelementsbytagname)
4. [querySelector](#4-queryselector)
5. [querySelectorAll](#5-queryselectorall)
6. [createElement](#6-createelement)
7. [Modifying Content](#7-modifying-content)
8. [Modifying Attributes](#8-modifying-attributes)
9. [Modifying Styles](#9-modifying-styles)
10. [classList](#10-classlist)
11. [Traversing the DOM](#11-traversing-the-dom)
12. [Inserting & Removing Elements](#12-inserting--removing-elements)
13. [closest](#13-closest)
14. [Comparison Table](#comparison-table)
15. [Exercises](#exercises)
16. [Key Takeaways](#key-takeaways)

---

## 1. getElementById

### What
Selects a single element by its `id` attribute.

### How
```javascript
const header = document.getElementById('main-header');
```

### Why
Fastest selector for unique elements. IDs must be unique in HTML, so this returns exactly one element (or `null`).

### Use Case
Targeting a specific, unique component like a navigation bar, modal container, or form.

### How It Works Internally
Browsers maintain an internal hash map (dictionary) of IDs to DOM nodes during parsing. `getElementById` performs an **O(1)** lookup in this map rather than traversing the tree. This is why it's the fastest selector available.

---

## 2. getElementsByClassName

### What
Selects all elements with a given class name. Returns a live `HTMLCollection`.

### How
```javascript
const items = document.getElementsByClassName('menu-item');
items[0].style.color = 'red'; // Access by index
```

### Why
Useful when you need to target multiple elements sharing the same styling hook and you want a live collection that updates automatically.

### Use Case
Highlighting all items in a shopping cart, toggling visibility of all elements with class `.hidden`.

### How It Works Internally
The browser scans the DOM tree and collects matching elements. The returned `HTMLCollection` is **live** — it reflects the DOM in real time. If you add/remove a class from an element, the collection updates automatically without re-querying. This is implemented via a cached query with an observer pattern on the DOM.

> ⚠️ **Gotcha:** It's live, so modifying the collection while iterating can cause skipped elements.

---

## 3. getElementsByTagName

### What
Selects all elements with a given HTML tag. Returns a live `HTMLCollection`.

### How
```javascript
const allDivs = document.getElementsByTagName('div');
const imagesInArticle = article.getElementsByTagName('img');
```

### Why
Efficient for selecting elements by type, especially when scoped to a parent element.

### Use Case
Disabling all images in an article, counting all `<p>` tags on a page.

### How It Works Internally
Similar to `getElementsByClassName`, but filters by tag name during the tree scan. The browser can optimize this using its internal tag index. When called on a specific element (not `document`), it only scans that subtree.

---

## 4. querySelector

### What
Selects the **first** element matching a CSS selector.

### How
```javascript
const btn = document.querySelector('.btn.primary');
const input = document.querySelector('#form input[type="email"]');
```

### Why
Extremely flexible — supports any valid CSS selector (combinators, pseudo-classes, attributes). Use when you need complex matching logic.

### Use Case
Selecting the first matching item in a list, finding a nested element with specific attributes.

### How It Works Internally
The browser passes your selector string to its **CSS selector engine**. It performs a tree traversal matching the selector from right to left (for efficiency). This is slower than `getElementById` because it cannot use the ID hash map and must evaluate the selector against nodes.

> ⚠️ **Performance:** Complex selectors (e.g., deep nesting, `:not()`, attribute selectors) require more computation.

---

## 5. querySelectorAll

### What
Selects **all** elements matching a CSS selector. Returns a static `NodeList`.

### How
```javascript
const links = document.querySelectorAll('a[href^="https"]');
links.forEach(link => link.setAttribute('target', '_blank'));
```

### Why
Best for complex selections. Returns a static snapshot, so it's safe to modify while iterating.

### Use Case
Styling all external links, collecting form inputs for validation.

### How It Works Internally
Uses the same CSS selector engine as `querySelector`, but collects all matches into a `NodeList`. Unlike `HTMLCollection`, a `NodeList` is **static** — it does not auto-update when the DOM changes. The browser takes a snapshot at query time.

---

## 6. createElement

### What
Creates a new HTML element in memory (not yet in the DOM).

### How
```javascript
const div = document.createElement('div');
div.textContent = 'Hello World';
div.className = 'message';
document.body.appendChild(div);
```

### Why
Dynamically build UI components, lists, or modals without hardcoding HTML.

### Use Case
Adding a new todo item to a list, creating a toast notification.

### How It Works Internally
`document.createElement('tag')` allocates a new DOM node in memory with the specified tag name. It is not attached to the document tree yet — it exists as an orphan node. Only when you call an insertion method (`appendChild`, `insertBefore`, etc.) does the browser perform a tree mutation, triggering reflow and repaint.

---

## 7. Modifying Content

### textContent
```javascript
element.textContent = 'Safe text';
```
- Sets plain text. HTML tags are treated as literal text (XSS-safe).
- **Internal:** Replaces all child nodes with a single text node.

### innerHTML
```javascript
element.innerHTML = '<strong>Bold</strong>';
```
- Parses HTML strings and rebuilds the DOM subtree.
- **Internal:** The browser runs an HTML parser on the string, constructs a fragment, and replaces the element's children. This is **expensive** and XSS-vulnerable if user input is inserted.
- **Why use:** Quick for bulk HTML updates from trusted sources.

### innerText
```javascript
element.innerText = 'Visible text';
```
- Respects CSS (won't include `display: none` text). Triggers reflow to compute styles.
- **Internal:** Slower than `textContent` because it requires style computation.

---

## 8. Modifying Attributes

### What
Reading or writing HTML attributes.

### How
```javascript
// Standard attributes
element.id = 'new-id';
element.src = 'image.png';

// Generic methods
element.setAttribute('data-id', '123');
const value = element.getAttribute('data-id');
element.removeAttribute('disabled');

// Dataset (for data-* attributes)
element.dataset.userId = '42'; // data-user-id="42"
```

### Why
Store metadata, toggle states, or configure element behavior.

### How It Works Internally
Attributes are stored in the element's internal property map. Standard properties (like `id`, `src`) are mirrored between the DOM attribute and the JavaScript property. `data-*` attributes are stored in a special `dataset` object for clean access.

---

## 9. Modifying Styles

### What
Changing CSS properties directly.

### How
```javascript
// Inline styles
element.style.backgroundColor = 'blue';
element.style.cssText = 'color: red; font-size: 16px;';

// Computed styles (read-only)
const styles = getComputedStyle(element);
console.log(styles.width);
```

### Why
Dynamic visual feedback (animations, themes, responsive adjustments).

### How It Works Internally
Setting `element.style.property` updates the element's `style` attribute in the DOM. This triggers a **reflow** (recalculating layout) and **repaint** (redrawing pixels). `getComputedStyle` returns the final calculated values after all CSS rules, inheritance, and specificity are applied.

> ⚠️ **Performance:** Batch style changes or use `classList` to toggle pre-defined CSS classes instead of setting many inline styles.

---

## 10. classList

### What
A clean API for adding, removing, toggling, and checking CSS classes.

### How
```javascript
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('visible');
element.classList.contains('active'); // boolean
element.classList.replace('old', 'new');
```

### Why
Much cleaner and safer than manipulating the `className` string directly. Prevents accidental overwrites.

### Use Case
Showing/hiding modals, activating navigation tabs, theme switching.

### How It Works Internally
`classList` is a `DOMTokenList` — a live, ordered set of tokens. The browser maintains a token array on the element. Methods like `add`/`remove` update this array and sync it back to the `class` attribute string. This is more efficient than string manipulation because the browser can diff class changes.

---

## 11. Traversing the DOM

### What
Moving between parent, child, and sibling elements.

### How
```javascript
// Parent
const parent = element.parentNode;        // any parent node
const parentEl = element.parentElement; // only element nodes

// Children
const children = element.children;           // HTMLCollection of element children
const firstChild = element.firstElementChild;
const lastChild = element.lastElementChild;

// Siblings
const next = element.nextElementSibling;
const prev = element.previousElementSibling;

// All descendants
const allNodes = element.childNodes; // includes text nodes, comments
```

### Why
Navigate without re-querying the document. Useful when you already have a reference to one element.

### Use Case
Finding the closest form from an input, removing a parent container when a delete button is clicked.

### How It Works Internally
These properties read directly from the DOM tree's linked structure. Each node maintains pointers to its parent, first child, last child, and adjacent siblings. Access is **O(1)** — no tree scanning required.

---

## 12. Inserting & Removing Elements

### What
Adding or removing nodes from the DOM tree.

### How
```javascript
// Inserting
parent.appendChild(newNode);                    // end of parent
parent.insertBefore(newNode, referenceNode);    // before a specific child
parent.append(node1, node2, 'text');            // modern, multiple nodes + strings
parent.prepend(newNode);                        // beginning
element.before(newNode);                        // before element
element.after(newNode);                         // after element

// Replacing
parent.replaceChild(newNode, oldNode);

// Removing
parent.removeChild(child); // old way
element.remove();          // modern way, removes itself
```

### Why
Dynamic UIs require adding, reordering, or deleting elements based on user interaction.

### Use Case
Infinite scroll (appending), drag-and-drop (reordering), deleting a comment.

### How It Works Internally
DOM insertion/removal triggers a **tree mutation**. The browser:
1. Detaches the node from its current position (if any)
2. Attaches it to the new parent/position
3. Marks the affected subtree as dirty
4. Schedules a **reflow** (layout recalculation) and **repaint**

> 💡 **Performance Tip:** Use `DocumentFragment` to batch insertions and minimize reflows.

```javascript
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li);
}
list.appendChild(fragment); // Single reflow!
```

---

## 13. closest

### What
Finds the closest ancestor (including itself) matching a selector.

### How
```javascript
const card = button.closest('.card');
```

### Why
Event delegation and component-scoped queries. You click a button and need its parent card.

### Use Case
A delete button inside a list item — find the `<li>` to remove.

### How It Works Internally
Walks up the parent chain using the internal parent pointers, testing each element against the CSS selector. Stops at the first match or `null` if none found.

---

## Comparison Table

| Method | Returns | Live? | Speed | Best For |
|--------|---------|-------|-------|----------|
| `getElementById` | Element / `null` | N/A | ⭐ Fastest | Unique elements |
| `getElementsByClassName` | `HTMLCollection` | ✅ Live | Fast | Groups by class |
| `getElementsByTagName` | `HTMLCollection` | ✅ Live | Fast | Groups by tag |
| `querySelector` | Element / `null` | N/A | Medium | Complex CSS selectors |
| `querySelectorAll` | `NodeList` | ❌ Static | Medium | Complex multi-match |

---

## Exercises

### Exercise 1: Basic Selection

Given this HTML:
```html
<div id="app">
  <ul id="todo-list">
    <li class="todo">Buy milk</li>
    <li class="todo done">Walk dog</li>
    <li class="todo">Code</li>
  </ul>
</div>
```

Write JavaScript to:
1. Select the list and log it.
2. Select all `.todo` items and log the count.
3. Select only the `.done` item and log its text.

<details>
<summary>Solution</summary>

```javascript
const list = document.getElementById('todo-list');
console.log(list);

const todos = document.querySelectorAll('.todo');
console.log(todos.length); // 3

const done = document.querySelector('.done');
console.log(done.textContent); // "Walk dog"
```
</details>

---

### Exercise 2: Creating & Appending

Write a function `createButton(text, className)` that creates a `<button>` with the given text and class, then appends it to a `<div id="buttons">`.

<details>
<summary>Solution</summary>

```javascript
function createButton(text, className) {
    const container = document.getElementById('buttons');
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = className;
    container.appendChild(btn);
    return btn;
}
```
</details>

---

### Exercise 3: Toggling Classes

Create a navigation bar with 3 links. When a link is clicked, it should get the class `active` and all other links should lose it.

<details>
<summary>Solution</summary>

```javascript
const links = document.querySelectorAll('.nav-link');

links.forEach(link => {
    link.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});
```
</details>

---

### Exercise 4: Attribute Manipulation

Select all external links (links starting with `http`) and:
1. Set `target="_blank"`
2. Add a `rel="noopener noreferrer"` attribute
3. Add a class `external-link`

<details>
<summary>Solution</summary>

```javascript
const externalLinks = document.querySelectorAll('a[href^="http"]');

externalLinks.forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.classList.add('external-link');
});
```
</details>

---

### Exercise 5: DOM Traversal

Given a deeply nested button inside a card:
```html
<div class="card">
  <div class="content">
    <button class="delete">Delete</button>
  </div>
</div>
```

When the button is clicked, remove the entire `.card` element using traversal (not `querySelector`).

<details>
<summary>Solution</summary>

```javascript
document.querySelector('.delete').addEventListener('click', function() {
    const card = this.closest('.card');
    card.remove();
});
```
</details>

---

### Exercise 6: Performance Challenge

You need to add 1000 `<li>` elements to a `<ul>`. Implement it **inefficiently** (appending one by one) and **efficiently** (using `DocumentFragment`). Use `console.time` to measure the difference.

<details>
<summary>Solution</summary>

```javascript
const ul = document.getElementById('list');

// INEFFICIENT
console.time('slow');
for (let i = 0; i < 1000; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    ul.appendChild(li); // 1000 reflows!
}
console.timeEnd('slow');

// EFFICIENT
console.time('fast');
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li);
}
ul.appendChild(fragment); // 1 reflow!
console.timeEnd('fast');
```
</details>

---

### Exercise 7: Build a Dynamic Table

Write a function `buildTable(data)` that takes an array of objects and generates an HTML table with headers and rows.

```javascript
const data = [
  { name: 'Alice', age: 25, city: 'NYC' },
  { name: 'Bob', age: 30, city: 'LA' }
];
```

<details>
<summary>Solution</summary>

```javascript
function buildTable(data) {
    if (data.length === 0) return;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Headers
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Rows
    data.forEach(item => {
        const row = document.createElement('tr');
        headers.forEach(key => {
            const td = document.createElement('td');
            td.textContent = item[key];
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    document.body.appendChild(table);
    return table;
}
```
</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **Selection** | Use `getElementById` for speed, `querySelectorAll` for flexibility |
| **Live vs Static** | `HTMLCollection` is live; `NodeList` from `querySelectorAll` is static |
| **Content** | Prefer `textContent` over `innerHTML` for safety and speed |
| **Classes** | Always use `classList`, never string-concatenate `className` |
| **Insertion** | Batch with `DocumentFragment` to avoid excessive reflows |
| **Traversal** | Use `closest`, `parentElement`, `nextElementSibling` to navigate without re-querying |
| **Performance** | Minimize DOM touches; they are orders of magnitude slower than in-memory operations |

---

*Happy coding! 🚀*
