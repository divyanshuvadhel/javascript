# 🎯 JavaScript Event Handling — Complete Notes

> **What is an Event?**
> An event is something that happens in the browser — a user clicks a button, presses a key, the page finishes loading, a form is submitted, etc. **Event handling** is how we write code that *responds* to these events.

---

## 📌 Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Ways to Attach Event Listeners](#2-ways-to-attach-event-listeners)
3. [The Event Object](#3-the-event-object)
4. [Event Propagation (Bubbling & Capturing)](#4-event-propagation-bubbling--capturing)
5. [Event Delegation](#5-event-delegation)
6. [Common Event Types](#6-common-event-types)
7. [Removing Event Listeners](#7-removing-event-listeners)
8. [Custom Events](#8-custom-events)
9. [Best Practices & Gotchas](#9-best-practices--gotchas)

---

## 1. Core Concepts

### The Event Loop (Quick Mental Model)

JavaScript is **single-threaded**. When an event occurs, it gets placed in a **queue**. The Event Loop constantly checks: *"Is the call stack empty? If yes, take the next event from the queue and process it."*

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Call      │     │   Event     │     │   Web APIs  │
│   Stack     │◄────│   Queue     │◄────│  (setTimeout,│
│  (executes) │     │  (waits)    │     │   DOM, etc) │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲
       └──────────────────────────────────────────────┘
                        Event Loop
```

### Key Terms

| Term | Meaning |
|------|---------|
| **Event Target** | The DOM element the event happened on |
| **Event Listener** | A function that runs when an event occurs |
| **Event Handler** | Often used interchangeably with listener |
| **Event Object** | An object passed to the listener with details about the event |

---

## 2. Ways to Attach Event Listeners

There are **three main ways** to handle events in JavaScript. Modern code almost exclusively uses Method 3.

### Method 1: Inline HTML Attributes (❌ Avoid)

```html
<button onclick="alert('Clicked!')">Click Me</button>
```

**Why avoid it?**
- Mixes HTML and JavaScript (separation of concerns)
- Can only attach ONE handler per event
- Doesn't scale
- XSS security risk if you interpolate user data

---

### Method 2: DOM Property (⚠️ Old School)

```javascript
const btn = document.getElementById('myBtn');

btn.onclick = function() {
    console.log('Clicked!');
};

// Problem: Overwrites any previous handler
btn.onclick = function() {
    console.log('This replaces the first one!');
};
```

**Problems:**
- Only **one handler per event** — assigning a new one overwrites the old
- Can't remove a specific handler easily

---

### Method 3: `addEventListener()` (✅ The Right Way)

```javascript
const btn = document.getElementById('myBtn');

// Attach listener
btn.addEventListener('click', function(event) {
    console.log('Button clicked!');
    console.log(event); // The Event object
});

// You can attach MULTIPLE listeners to the same event!
btn.addEventListener('click', () => {
    console.log('Second handler also runs!');
});
```

**Syntax:**
```javascript
element.addEventListener(eventType, listener, options);
```

| Parameter | Description |
|-----------|-------------|
| `eventType` | String like `'click'`, `'keydown'`, `'submit'` (no `on` prefix!) |
| `listener` | Function to run when event fires |
| `options` (optional) | Object or boolean for capture/once/passive |

---

## 3. The Event Object

When an event fires, the browser automatically passes an **Event object** to your handler.

```javascript
document.getElementById('myBtn').addEventListener('click', function(event) {
    // 'event', 'evt', or 'e' — convention is 'e' or 'event'
    console.log(event.type);      // "click"
    console.log(event.target);    // The element that was clicked
    console.log(event.currentTarget); // The element the listener is attached to
    console.log(event.timestamp); // Time since page load (ms)
});
```

### Most Important Event Object Properties

| Property | What It Gives You |
|----------|-------------------|
| `event.target` | **The actual element** that triggered the event (deepest element) |
| `event.currentTarget` | The element the listener is **attached to** |
| `event.type` | Type of event: `"click"`, `"keydown"`, etc. |
| `event.timeStamp` | Milliseconds since page load |
| `event.preventDefault()` | Stop the browser's default action |
| `event.stopPropagation()` | Stop event from bubbling up |

### `target` vs `currentTarget` — CRUCIAL DIFFERENCE!

```html
<div id="parent">
    <button id="child">Click me</button>
</div>
```

```javascript
document.getElementById('parent').addEventListener('click', function(e) {
    console.log(e.target);        // <button id="child"> (what you ACTUALLY clicked)
    console.log(e.currentTarget); // <div id="parent"> (where listener is attached)
});
```

> **Rule of thumb:** `target` = what you clicked. `currentTarget` = where the handler lives.

---

## 4. Event Propagation (Bubbling & Capturing)

This is **one of the most important concepts** in event handling. When you click an element, the event doesn't just happen there — it **travels through the DOM tree**.

### The Two Phases

```
CAPTURE PHASE (top → down)          BUBBLE PHASE (bottom → up)
       Window                              Window
         ▲                                  ▲
         │                                  │
       Document                           Document
         ▲                                  ▲
         │                                  │
        <html>                             <html>
         ▲                                  ▲
         │                                  │
        <body>                             <body>
         ▲                                  ▲
         │                                  │
       <div>                               <div>
         ▲                                  ▲
         │                                  │
      <button>  ◄── You clicked here    <button>
```

### Phase 1: Capturing (Trickle Down)
The event starts at the `window` and travels **down** to the target element. Rarely used.

### Phase 2: Target
The event reaches the actual element that was clicked.

### Phase 3: Bubbling (Bubble Up) ⭐
The event **bubbles up** from the target back to `window`. **This is the default and most important phase.**

---

### Visual Example: Bubbling in Action

```html
<div id="grandparent">
    <div id="parent">
        <button id="child">Click me</button>
    </div>
</div>
```

```javascript
document.getElementById('grandparent').addEventListener('click', () => {
    console.log('Grandparent clicked!');
});

document.getElementById('parent').addEventListener('click', () => {
    console.log('Parent clicked!');
});

document.getElementById('child').addEventListener('click', () => {
    console.log('Child (button) clicked!');
});
```

**Click the button, console output:**
```
Child (button) clicked!
Parent clicked!
Grandparent clicked!
```

> **The event bubbles UP from the target to its ancestors!**

---

### How to Stop Bubbling

Use `event.stopPropagation()`:

```javascript
document.getElementById('child').addEventListener('click', function(e) {
    console.log('Child clicked!');
    e.stopPropagation(); // Stop! Don't tell parent or grandparent
});
```

**Now clicking the button only outputs:**
```
Child clicked!
```

> ⚠️ **Be careful with `stopPropagation()`** — it can break event delegation and other listeners expecting the event.

---

### How to Listen in the Capture Phase

Pass `true` as the third argument (or `{ capture: true }`):

```javascript
element.addEventListener('click', handler, true);
// OR
element.addEventListener('click', handler, { capture: true });
```

```javascript
document.getElementById('grandparent').addEventListener('click', () => {
    console.log('Grandparent (capture phase)');
}, true);

document.getElementById('parent').addEventListener('click', () => {
    console.log('Parent (capture phase)');
}, true);

document.getElementById('child').addEventListener('click', () => {
    console.log('Child (target phase)');
});
```

**Output when clicking the button:**
```
Grandparent (capture phase)   ← First! (capture goes down)
Parent (capture phase)        ← Second! (capture goes down)
Child (target phase)          ← Third! (target)
```

> **99% of the time, you don't need capture phase.** Bubbling is the default for a reason.

---

## 5. Event Delegation ⭐⭐⭐

This is a **powerful pattern** that solves a common problem efficiently.

### The Problem

You have 100 list items, and you want to handle clicks on each:

```html
<ul id="todo-list">
    <li>Task 1</li>
    <li>Task 2</li>
    <!-- ... 98 more items ... -->
</ul>
```

**Bad approach:** Attach 100 listeners
```javascript
// ❌ DON'T DO THIS
document.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', handleClick); // 100 listeners! Memory hog.
});
```

**Good approach:** One listener on the parent
```javascript
// ✅ DO THIS INSTEAD
document.getElementById('todo-list').addEventListener('click', function(e) {
    // e.target is the ACTUAL element clicked (could be <li>, or <span> inside <li>)
    if (e.target.tagName === 'LI') {
        console.log('Clicked:', e.target.textContent);
        handleClick(e.target);
    }
});
```

### How Event Delegation Works

1. Attach **ONE** listener to a common ancestor
2. When click happens, it bubbles up to that ancestor
3. Use `event.target` to figure out which child was actually clicked
4. Check if it's the element you care about (using `tagName`, `classList`, `matches()`, etc.)

### Event Delegation with Dynamic Elements

This is where delegation **really shines** — it works for elements that don't exist yet!

```javascript
// New items added later will STILL work because the listener is on the <ul>
document.getElementById('todo-list').addEventListener('click', function(e) {
    // closest() walks UP the DOM to find matching ancestor
    const li = e.target.closest('li');

    if (li) {
        console.log('Clicked task:', li.textContent);
        li.classList.toggle('completed');
    }
});

// Later...
const newLi = document.createElement('li');
newLi.textContent = 'Dynamic task';
document.getElementById('todo-list').appendChild(newLi);
// Clicking this new li works automatically! No new listener needed.
```

### `Element.matches()` — Useful for Delegation

```javascript
document.getElementById('container').addEventListener('click', function(e) {
    // Check if clicked element (or any ancestor up to container) matches selector
    if (e.target.matches('.delete-btn')) {
        console.log('Delete button clicked!');
        e.target.closest('.card').remove();
    }
});
```

---

## 6. Common Event Types

### Mouse Events

| Event | Fires When |
|-------|-----------|
| `click` | Element is clicked (press + release) |
| `dblclick` | Double-clicked |
| `mousedown` | Mouse button pressed down |
| `mouseup` | Mouse button released |
| `mousemove` | Mouse moves over element |
| `mouseenter` | Mouse enters element (no bubbling) |
| `mouseleave` | Mouse leaves element (no bubbling) |
| `mouseover` | Mouse enters element or child (bubbles) |
| `mouseout` | Mouse leaves element or child (bubbles) |
| `contextmenu` | Right-click (opens context menu) |

```javascript
// Drag example
let isDragging = false;

element.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        element.style.left = e.clientX + 'px';
        element.style.top = e.clientY + 'px';
    }
});
```

> **`mouseenter`/`mouseleave`** vs **`mouseover`/`mouseout`**: The first pair doesn't bubble. Use them when you don't want child elements to trigger the event.

---

### Keyboard Events

| Event | Fires When |
|-------|-----------|
| `keydown` | Key is pressed down (repeats if held) |
| `keyup` | Key is released |
| `keypress` | ⚠️ Deprecated, use `keydown` |

```javascript
document.addEventListener('keydown', (e) => {
    console.log(e.key);      // "Enter", "a", "Escape", "ArrowUp"
    console.log(e.code);     // "KeyA", "Enter", "Space" (physical key)
    console.log(e.keyCode);  // 13, 65 (deprecated, use .key)
    console.log(e.ctrlKey);  // true if Ctrl is held
    console.log(e.shiftKey); // true if Shift is held
    console.log(e.altKey);   // true if Alt is held
    console.log(e.metaKey);  // true if Cmd (Mac) / Win (Windows) is held

    if (e.key === 'Escape') {
        closeModal();
    }

    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // Stop browser's default action
        openSearch();
    }
});
```

> **`.key`** is the modern way — it gives you the character produced (e.g., `"a"` or `"A"` depending on Shift). **`.code`** gives you the physical key position (e.g., `"KeyA"` regardless of Shift).

---

### Form Events

| Event | Fires When |
|-------|-----------|
| `submit` | Form is submitted |
| `reset` | Form is reset |
| `change` | Value changes AND element loses focus (for most inputs) |
| `input` | Value changes immediately (for text inputs) |
| `focus` | Element gains focus |
| `blur` | Element loses focus |
| `focusin` | Like focus, but bubbles |
| `focusout` | Like blur, but bubbles |

```javascript
const form = document.getElementById('myForm');
const input = document.getElementById('username');

// Submit
form.addEventListener('submit', (e) => {
    e.preventDefault(); // ⭐ CRITICAL: Stop page reload!

    const formData = new FormData(form);
    const username = formData.get('username');

    console.log('Submitting:', username);
    // Send to server via fetch()...
});

// Real-time validation
input.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.length < 3) {
        e.target.classList.add('invalid');
    } else {
        e.target.classList.remove('invalid');
    }
});
```

> **Always call `e.preventDefault()` in form submit handlers** unless you actually want the page to reload!

---

### Window/Document Events

| Event | Fires When |
|-------|-----------|
| `DOMContentLoaded` | HTML parsed, DOM ready (images may still load) |
| `load` | Everything loaded (images, stylesheets, etc.) |
| `beforeunload` | User is about to leave page |
| `unload` | User is leaving page |
| `resize` | Window is resized |
| `scroll` | Page or element is scrolled |
| `error` | Resource fails to load |

```javascript
// DOM is ready — safe to query elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready!');
    setupEventListeners();
});

// Everything loaded
window.addEventListener('load', () => {
    console.log('All resources loaded!');
});

// Debounced resize (performance!)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Resized to:', window.innerWidth, 'x', window.innerHeight);
    }, 250); // Wait 250ms after resize ends
});
```

---

### Touch Events (Mobile)

| Event | Fires When |
|-------|-----------|
| `touchstart` | Finger touches screen |
| `touchmove` | Finger moves on screen |
| `touchend` | Finger lifts off screen |
| `touchcancel` | Touch interrupted (call, alert, etc.) |

```javascript
element.addEventListener('touchstart', (e) => {
    // e.touches — all current touches
    // e.changedTouches — touches that changed in this event
    const touch = e.touches[0];
    console.log(touch.clientX, touch.clientY);
});
```

> Modern approach: Use **Pointer Events** (`pointerdown`, `pointermove`, `pointerup`) which unify mouse, touch, and stylus.

---

## 7. Removing Event Listeners

```javascript
function handleClick() {
    console.log('Clicked!');
}

// Add
btn.addEventListener('click', handleClick);

// Remove — MUST pass the SAME function reference!
btn.removeEventListener('click', handleClick);
```

**Important rules for removal:**

1. **You must pass the same function reference** — anonymous functions won't work:
```javascript
// ❌ CAN'T REMOVE THIS
btn.addEventListener('click', () => console.log('hi'));
btn.removeEventListener('click', () => console.log('hi')); // Different function!

// ✅ CAN REMOVE THIS
const handler = () => console.log('hi');
btn.addEventListener('click', handler);
btn.removeEventListener('click', handler); // Same reference!
```

2. **Named functions or stored references are required for removal**

---

### The `once` Option (Clean!)

```javascript
// Automatically removes itself after firing once
btn.addEventListener('click', () => {
    console.log('This only runs once!');
}, { once: true });
```

---

## 8. Custom Events

You can create and dispatch your own events!

```javascript
// 1. Create a custom event
const myEvent = new CustomEvent('userLoggedIn', {
    detail: { 
        username: 'alice',
        userId: 123 
    },
    bubbles: true,      // Can bubble
    cancelable: true    // Can call preventDefault()
});

// 2. Dispatch it
document.dispatchEvent(myEvent);

// 3. Listen for it
document.addEventListener('userLoggedIn', (e) => {
    console.log('User logged in:', e.detail.username);
    console.log('User ID:', e.detail.userId);
});
```

### Use Cases for Custom Events

- Communication between unrelated components
- Notifying when async data is ready
- Plugin architecture
- Decoupling code

```javascript
// Example: Modal component emits events
class Modal {
    open() {
        this.element.classList.add('open');
        this.element.dispatchEvent(new CustomEvent('modal:open', {
            bubbles: true
        }));
    }

    close() {
        this.element.classList.remove('open');
        this.element.dispatchEvent(new CustomEvent('modal:close', {
            bubbles: true
        }));
    }
}

// Any code can listen without importing Modal
document.addEventListener('modal:open', () => {
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
});

document.addEventListener('modal:close', () => {
    document.body.style.overflow = '';
});
```

---

## 9. Best Practices & Gotchas

### ✅ DO's

| Practice | Why |
|----------|-----|
| Use `addEventListener()` | Multiple handlers, clean removal |
| Use event delegation | Better performance, works with dynamic content |
| Call `e.preventDefault()` when needed | Stop unwanted default browser behavior |
| Debounce scroll/resize handlers | Prevent performance issues |
| Use `{ once: true }` for one-time events | Automatic cleanup |
| Name your handler functions | Easier debugging and removal |

---

### ❌ DON'Ts

| Anti-pattern | Why It's Bad |
|--------------|--------------|
| Inline `onclick=""` | Mixes concerns, XSS risk, only one handler |
| `element.onclick = fn` | Overwrites previous handlers |
| `stopPropagation()` without reason | Breaks event delegation |
| Attaching listeners in loops | Memory waste, use delegation instead |
| Forgetting `preventDefault()` on forms | Page reloads unexpectedly |

---

### Common Gotchas

**1. `this` in event listeners**

```javascript
// Regular function: 'this' is the element
btn.addEventListener('click', function() {
    console.log(this); // <button>
    this.disabled = true;
});

// Arrow function: 'this' is inherited from outer scope
btn.addEventListener('click', () => {
    console.log(this); // Window (or outer 'this')
    // Can't use this.disabled here!
    btn.disabled = true; // Use the element reference instead
});
```

**2. Event listeners on dynamically created elements**

```javascript
// ❌ This won't work for elements added later
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', handleClick);
});

// ✅ Use event delegation instead
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.matches('.item')) {
        handleClick(e.target);
    }
});
```

**3. Memory leaks**

```javascript
// If you remove an element but don't remove its listeners,
// the element stays in memory!
const btn = document.getElementById('btn');
btn.addEventListener('click', heavyHandler);

// Later...
btn.remove(); // Element is gone from DOM BUT...
// The listener still references it! Memory leak!

// Fix: Remove listener first, or use WeakRef (advanced)
btn.removeEventListener('click', heavyHandler);
btn.remove();
```

**4. `passive: true` for scroll performance**

```javascript
// Tells browser: "I won't call preventDefault()"
// Browser can scroll immediately without waiting for your handler
document.addEventListener('touchmove', handleTouch, { passive: true });

// Some browsers make touch/wheel events passive by default now
```

---

## 🧠 Quick Reference Cheat Sheet

```javascript
// Attach
element.addEventListener('click', handler, options);

// Options object
{
    capture: false,    // Use capture phase?
    once: false,       // Auto-remove after one fire?
    passive: false     // Won't call preventDefault()?
}

// Remove
element.removeEventListener('click', handler);

// Stop default
event.preventDefault();

// Stop bubbling
event.stopPropagation();

// Check element
event.target.matches('.my-class');

// Find ancestor
event.target.closest('.my-class');

// Custom event
const event = new CustomEvent('myEvent', { detail: data, bubbles: true });
element.dispatchEvent(event);
```

---

## 📝 Summary

| Concept | Key Takeaway |
|---------|--------------|
| **Events** | User actions or browser occurrences |
| **Listeners** | Functions that respond to events |
| **Event Object** | Contains info about what happened |
| **Bubbling** | Events travel up from target to ancestors (default) |
| **Capturing** | Events travel down from window to target (rarely used) |
| **Delegation** | One listener on parent handles many children |
| **`target`** | The actual element clicked |
| **`currentTarget`** | The element with the listener |
| **`preventDefault()`** | Stop browser's default action |
| **`stopPropagation()`** | Stop event from bubbling |

---

> 💡 **Remember:** Event handling is about **responding to user interactions**. Master bubbling, delegation, and the event object — these three concepts unlock everything else.

---

*Happy coding! 🚀*
