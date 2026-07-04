# JavaScript Forms 

> **Topic:** Working with HTML Forms in JavaScript  
> **Level:** Beginner → Advanced

---

## Table of Contents

1. [Selecting Forms & Elements](#1-selecting-forms--elements)
2. [The `form.elements` Collection](#2-the-formelements-collection)
3. [Reading & Writing Input Values](#3-reading--writing-input-values)
4. [Input Types & Special Properties](#4-input-types--special-properties)
5. [Form Events](#5-form-events)
6. [HTML5 Validation](#6-html5-validation)
7. [JavaScript Validation API](#7-javascript-validation-api)
8. [The FormData API](#8-the-formdata-api)
9. [File Inputs](#9-file-inputs)
10. [Radio Buttons & Checkboxes](#10-radio-buttons--checkboxes)
11. [Select & Dropdowns](#11-select--dropdowns)
12. [Submitting Forms via AJAX](#12-submitting-forms-via-ajax)
13. [Accessibility (A11y)](#13-accessibility-a11y)
14. [Security Considerations](#14-security-considerations)
15. [Exercises](#15-exercises)
16. [Quick Reference Cheat Sheet](#16-quick-reference-cheat-sheet)

---

## 1. Selecting Forms & Elements

### What
Forms are HTML elements that collect user input. JavaScript can access them just like any DOM element, but forms have special APIs.

### How
```javascript
// By ID (fastest)
const form = document.getElementById('login-form');

// By querySelector
const form = document.querySelector('form');
const form = document.querySelector('form[name="signup"]');

// By form name (legacy but works)
const form = document.forms['signup'];        // by name
const form = document.forms[0];              // by index

// Selecting inputs inside a form
const email = form.querySelector('input[type="email"]');
const inputs = form.querySelectorAll('input, textarea, select');
```

### Why
Forms are the primary way users interact with web apps. Selecting them efficiently is the first step to handling user input.

### How It Works Internally
`document.forms` is a live `HTMLCollection` of all `<form>` elements in the document. It was part of the DOM Level 0 API and is still supported for backward compatibility. Modern code typically uses `querySelector` or `getElementById`.

---

## 2. The `form.elements` Collection

### What
Every form has an `elements` property — a live collection of all form controls (inputs, textareas, selects, buttons) inside it.

### How
```javascript
const form = document.getElementById('signup');

// Access by index
const firstInput = form.elements[0];

// Access by name attribute
const email = form.elements['email'];
const email = form.elements.email;      // dot notation also works

// Access by ID
const email = form.elements['user-email'];

// Get all elements
const allControls = Array.from(form.elements);
```

### Why
`form.elements` is scoped to the form. It won't accidentally grab inputs from other forms on the same page. It also includes `<fieldset>` elements as pseudo-containers.

### How It Works Internally
The browser builds an internal named index of form controls during parsing. `form.elements['name']` performs a lookup in this index. If multiple elements share the same `name` (e.g., radio buttons), it returns a `RadioNodeList` — a collection you can iterate over.

> ⚠️ **Important:** If you have inputs with `name="id"`, `form.id` will return the input, not the form's ID attribute. Avoid naming inputs `id`, `action`, `method`, or `name` to prevent shadowing the form's own properties.

---

## 3. Reading & Writing Input Values

### What
Getting the current value of a form control or setting it programmatically.

### How
```javascript
const input = document.getElementById('username');

// Reading
console.log(input.value);        // current text
console.log(input.defaultValue); // original value from HTML

// Writing
input.value = 'new value';
input.value = '';              // clear the input

// Textarea
const textarea = document.getElementById('bio');
textarea.value = 'Hello world';

// Check if modified
if (input.value !== input.defaultValue) {
    console.log('User changed this field');
}
```

### Why
`value` is the live, current state. `defaultValue` is the initial value from HTML. This distinction is crucial for detecting changes and resetting forms.

### How It Works Internally
`value` is a JavaScript property that mirrors the internal DOM state. For text inputs, it stores the current string. The browser keeps this in memory and syncs it with the rendered text. Setting `value` does **not** trigger an `input` event — it only updates the internal state.

---

## 4. Input Types & Special Properties

### What
Different input types expose different properties beyond `.value`.

### How
```javascript
// Number input
const ageInput = document.getElementById('age');
console.log(ageInput.valueAsNumber);  // 25 (number, not string!)
console.log(ageInput.value);          // "25" (string)

// Date input
const dateInput = document.getElementById('birthday');
console.log(dateInput.valueAsDate);   // Date object or null

// Range / Number
const range = document.getElementById('volume');
console.log(range.min, range.max, range.step);

// Textarea
const textarea = document.getElementById('message');
console.log(textarea.rows, textarea.cols);

// Read-only & disabled
input.readOnly = true;    // visible but not editable, still submitted
input.disabled = true;    // grayed out, NOT submitted with form
```

### Why
`valueAsNumber` and `valueAsDate` save you from manual parsing. `readOnly` vs `disabled` have different semantics — disabled fields are excluded from submission entirely.

---

## 5. Form Events

### What
Events fired by form controls during user interaction.

### Event Reference

| Event | Fires When | Use Case |
|-------|-----------|----------|
| `submit` | Form is submitted (Enter key or submit button) | Validate, intercept, send via AJAX |
| `input` | Value changes in real-time (every keystroke) | Live search, character counting |
| `change` | Value changes AND element loses focus | Validate after user finishes typing |
| `focus` | Element gains focus | Show hints, styling |
| `blur` | Element loses focus | Final validation, save draft |
| `reset` | Form reset is triggered | Confirm before clearing |
| `keydown/keyup/keypress` | Keyboard interaction | Hotkeys, input masking |
| `paste` | Content pasted | Sanitize pasted content |
| `cut` | Content cut | Track changes |
| `invalid` | Validation fails on submit | Custom error handling |

### How
```javascript
const form = document.getElementById('signup');
const email = document.getElementById('email');

// Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();          // STOP default page reload
    console.log('Form submitted!');
    // Process data here...
});

// Input (real-time)
email.addEventListener('input', (e) => {
    console.log('Current value:', e.target.value);
    updateCharCount(e.target.value.length);
});

// Change (on blur after change)
email.addEventListener('change', (e) => {
    console.log('Final value:', e.target.value);
    validateEmail(e.target.value);
});

// Focus / Blur
email.addEventListener('focus', () => {
    email.classList.add('focused');
});
email.addEventListener('blur', () => {
    email.classList.remove('focused');
    validateEmail(email.value);
});

// Reset
form.addEventListener('reset', () => {
    if (!confirm('Clear all fields?')) {
        e.preventDefault();      // Cancel the reset
    }
});

// Invalid (HTML5 validation failed)
email.addEventListener('invalid', (e) => {
    e.preventDefault();            // Prevent default browser tooltip
    showCustomError(email, 'Please enter a valid email');
});
```

### Why
- `submit` with `preventDefault()` is the foundation of Single Page Applications (SPAs).
- `input` vs `change`: `input` fires on every keystroke; `change` only when the user leaves the field after modifying it.
- `focus`/`blur` are essential for UX patterns like floating labels and inline validation.

### How It Works Internally
Events bubble up the DOM tree. The `submit` event fires on the `<form>` element, not the button. The browser's default action for `submit` is to construct a URL-encoded query string and navigate to the form's `action` URL. `preventDefault()` cancels this navigation at the event level.

---

## 6. HTML5 Validation

### What
Built-in browser validation using HTML attributes — no JavaScript required for basic checks.

### How
```html
<form id="signup" novalidate>  <!-- novalidate disables default browser validation -->
  <input type="email" required placeholder="Email">

  <input type="password" 
         minlength="8" 
         maxlength="64"
         pattern="^(?=.*[A-Z])(?=.*\d).+$"
         title="Must contain uppercase and number"
         required>

  <input type="number" min="18" max="120" step="1" required>

  <input type="url" required>

  <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" 
         title="Format: 123-456-7890">

  <button type="submit">Sign Up</button>
</form>
```

### Validation Attributes

| Attribute | Purpose |
|-----------|---------|
| `required` | Field must not be empty |
| `minlength` / `maxlength` | Text length constraints |
| `min` / `max` | Numeric/date range |
| `step` | Incremental values (for number, date, time) |
| `pattern` | Regex pattern the value must match |
| `type="email"` | Must match email format |
| `type="url"` | Must match URL format |

### Why
HTML5 validation provides instant feedback without JavaScript. It works even if JS fails to load. However, **never rely on it alone** — always validate on the server too.

### How It Works Internally
When a form is submitted, the browser runs a constraint validation algorithm on each control. It checks `required`, `type`, `pattern`, `min/max`, etc. If any check fails, the submission is blocked and the first invalid element is focused with a native tooltip. The `:valid` and `:invalid` CSS pseudo-classes are also toggled.

---

## 7. JavaScript Validation API

### What
Programmatic access to the browser's constraint validation system.

### How
```javascript
const input = document.getElementById('email');

// Check validity
console.log(input.checkValidity());     // boolean
console.log(input.validity.valid);      // boolean

// The ValidityState object
console.log(input.validity);
// {
//   valueMissing: false,     // required but empty
//   typeMismatch: false,     // wrong type (e.g., not an email)
//   patternMismatch: false,  // regex failed
//   tooLong: false,          // exceeds maxlength
//   tooShort: false,         // below minlength
//   rangeUnderflow: false,  // below min
//   rangeOverflow: false,   // exceeds max
//   stepMismatch: false,    // doesn't match step
//   badInput: false,         // browser couldn't parse
//   customError: false,      // set via setCustomValidity()
//   valid: true
// }

// Set custom error message
input.setCustomValidity('This email is already taken');
input.reportValidity();  // Shows the browser tooltip immediately

// Clear custom error
input.setCustomValidity('');

// Report all form errors
form.reportValidity();
```

### Why
The Validation API lets you:
- Add custom logic (e.g., "username already exists")
- Style fields based on validation state
- Show custom error messages instead of browser defaults
- Validate entire forms programmatically

### How It Works Internally
Each form control has a `ValidityState` object that the browser updates whenever the value changes. `checkValidity()` runs the constraint checks and returns the result. `setCustomValidity()` adds a user-defined error to the `ValidityState`, which blocks submission just like built-in errors.

---

## 8. The FormData API

### What
A modern way to collect all form values into a structured object, perfect for AJAX submissions.

### How
```javascript
const form = document.getElementById('signup');

// Create from a form element
const formData = new FormData(form);

// Reading values
console.log(formData.get('email'));      // single value
console.log(formData.getAll('hobbies')); // array of values (for multi-select/checkboxes)

// Iterating
for (const [key, value] of formData) {
    console.log(`${key}: ${value}`);
}

// Adding / Modifying
formData.append('source', 'web');        // add new field
formData.set('newsletter', 'true');      // overwrite existing
formData.delete('temp-field');

// Checking
console.log(formData.has('email'));      // boolean

// Convert to plain object (for JSON APIs)
const data = Object.fromEntries(formData);
// { email: '...', password: '...', hobbies: ['sports', 'music'] }

// For multi-value fields, Object.fromEntries only keeps the last one!
// Use this instead for full multi-value support:
const data = {};
for (const [key, value] of formData) {
    if (data[key]) {
        data[key] = [].concat(data[key], value);
    } else {
        data[key] = value;
    }
}
```

### Why
`FormData` automatically handles:
- All input types including files
- Multiple values for the same name
- Proper encoding for multipart/form-data
- File uploads without manual base64 encoding

### How It Works Internally
`FormData` constructs an internal map of name-value pairs from the form's current state. It reads `value` from text inputs, `checked` from checkboxes, `files` from file inputs, and `selectedOptions` from selects. When sent via `fetch()`, the browser automatically sets the correct `Content-Type: multipart/form-data` header with a boundary.

---

## 9. File Inputs

### What
`<input type="file">` allows users to upload files. JavaScript can read metadata and contents.

### How
```html
<input type="file" id="avatar" accept="image/*" multiple>
```

```javascript
const fileInput = document.getElementById('avatar');

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;  // FileList (array-like)

    Array.from(files).forEach(file => {
        console.log(file.name);    // "photo.jpg"
        console.log(file.size);    // bytes
        console.log(file.type);    // "image/jpeg"
        console.log(file.lastModified); // timestamp
    });

    // Clear selection
    fileInput.value = '';          // resets input
});

// Reading file contents (FileReader)
const reader = new FileReader();
reader.onload = (e) => {
    const imageUrl = e.target.result;  // data URL
    previewImage.src = imageUrl;
};
reader.readAsDataURL(files[0]);

// Uploading with FormData + fetch
const formData = new FormData();
formData.append('avatar', files[0]);

fetch('/upload', {
    method: 'POST',
    body: formData  // DO NOT set Content-Type manually!
});
```

### Why
File inputs are the only way to get local files into a web app. The `FileReader` API lets you preview images before upload. `FormData` handles the multipart encoding automatically.

### How It Works Internally
The browser creates a `FileList` containing `File` objects. These are references to files on the user's filesystem — JavaScript cannot write to disk, only read with user permission. `FileReader` reads the file asynchronously into memory as ArrayBuffer, DataURL, or text.

> ⚠️ **Security:** You cannot set `fileInput.value` programmatically to a file path (browsers block this). You can only clear it with `value = ''`.

---

## 10. Radio Buttons & Checkboxes

### What
Radio buttons (single choice from a group) and checkboxes (multiple/on-off toggles).

### How
```html
<!-- Radio buttons -->
<input type="radio" name="plan" value="free" id="plan-free" checked>
<input type="radio" name="plan" value="pro" id="plan-pro">

<!-- Checkboxes -->
<input type="checkbox" name="features" value="wifi" id="feat-wifi">
<input type="checkbox" name="features" value="parking" id="feat-parking">

<!-- Single checkbox (boolean) -->
<input type="checkbox" name="agree" id="agree">
```

```javascript
// Radio buttons
const planRadios = document.querySelectorAll('input[name="plan"]');
const selectedPlan = document.querySelector('input[name="plan"]:checked');
console.log(selectedPlan?.value);

// Checkboxes (multiple)
const featureBoxes = document.querySelectorAll('input[name="features"]:checked');
const selectedFeatures = Array.from(featureBoxes).map(cb => cb.value);

// Single checkbox (boolean)
const agreeBox = document.getElementById('agree');
console.log(agreeBox.checked);  // true / false

// Programmatic checking
agreeBox.checked = true;
agreeBox.indeterminate = true;  // visual "partial" state (for parent checkboxes)
```

### Why
Radio buttons share a `name` to form a mutually exclusive group. Checkboxes with the same `name` submit as multiple values. A lone checkbox is a boolean toggle.

### How It Works Internally
The browser groups radio buttons by `name` attribute within the same form. Only one can be `checked` at a time. For checkboxes, `checked` is a boolean property independent of `value`. The `indeterminate` property is purely visual — it doesn't affect submission.

---

## 11. Select & Dropdowns

### What
`<select>` elements create dropdown menus. They support single and multiple selection.

### How
```html
<!-- Single select -->
<select name="country" id="country">
  <option value="">-- Select --</option>
  <option value="us">United States</option>
  <option value="uk" selected>United Kingdom</option>
  <option value="jp">Japan</option>
</select>

<!-- Multi-select -->
<select name="skills" id="skills" multiple size="4">
  <option value="js">JavaScript</option>
  <option value="py">Python</option>
  <option value="go">Go</option>
</select>
```

```javascript
const select = document.getElementById('country');

// Current value
console.log(select.value);        // "uk"

// Selected option element
console.log(select.selectedIndex);     // 2
console.log(select.options[2].text);   // "United Kingdom"

// Programmatic selection
select.value = 'jp';              // selects by value
select.selectedIndex = 0;          // selects first option

// Multi-select
const multi = document.getElementById('skills');
const selected = Array.from(multi.selectedOptions).map(opt => opt.value);

// Adding options dynamically
const newOption = document.createElement('option');
newOption.value = 'rust';
newOption.textContent = 'Rust';
select.appendChild(newOption);

// Or using Option constructor
select.add(new Option('Rust', 'rust'));
select.add(new Option('Rust', 'rust'), 0);  // insert at index 0

// Removing
select.remove(2);                   // remove option at index 2
select.options[2].remove();
```

### Why
`select.value` is the easiest way to get/set the selected value. `selectedOptions` gives you the actual `<option>` elements for multi-select. The `Option` constructor is a concise way to create options.

### How It Works Internally
`<select>` maintains an `HTMLOptionsCollection` — a live collection of `<option>` elements. `select.value` maps to the `value` attribute of the currently selected option. For multi-select, `value` returns the first selected option's value only.

---

## 12. Submitting Forms via AJAX

### What
Sending form data to a server without reloading the page using `fetch` or `XMLHttpRequest`.

### How
```javascript
const form = document.getElementById('signup');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Method 1: FormData (best for files + mixed data)
    const formData = new FormData(form);

    const response = await fetch('/api/signup', {
        method: 'POST',
        body: formData
        // DO NOT set Content-Type header!
        // fetch sets it automatically with multipart boundary
    });

    // Method 2: JSON (for APIs expecting JSON)
    const data = Object.fromEntries(new FormData(form));

    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Method 3: URL-encoded (traditional form submission)
    const params = new URLSearchParams(new FormData(form));

    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    // Handle response
    if (!response.ok) {
        const error = await response.json();
        showErrors(error.fields);
        return;
    }

    const result = await response.json();
    showSuccess('Account created!');
    form.reset();  // clear all fields
});
```

### Why
AJAX form submission is essential for modern SPAs. It provides better UX (no page reload), allows inline error display, and enables features like auto-save and file upload progress bars.

### How It Works Internally
`fetch` sends an HTTP request in the background. The browser's main thread isn't blocked. `FormData` is serialized as `multipart/form-data` with a unique boundary string. JSON payloads are serialized with `JSON.stringify()`. The server processes the request and returns a response, which JavaScript handles asynchronously via Promises.

---

## 13. Accessibility (A11y)

### What
Making forms usable for everyone, including screen reader users and keyboard navigators.

### How
```html
<!-- Always associate labels with inputs -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" required
       aria-describedby="email-error">
<span id="email-error" class="error" role="alert" aria-live="polite"></span>

<!-- Fieldset for groups -->
<fieldset>
  <legend>Preferred Contact Method</legend>
  <input type="radio" name="contact" id="contact-email" value="email">
  <label for="contact-email">Email</label>
  <input type="radio" name="contact" id="contact-phone" value="phone">
  <label for="contact-phone">Phone</label>
</fieldset>

<!-- Required fields -->
<input required aria-required="true">

<!-- Error states -->
<input aria-invalid="true" aria-describedby="error-msg">
<span id="error-msg">Please enter a valid email</span>
```

```javascript
// Programmatically manage ARIA
function showError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    const errorId = input.id + '-error';
    input.setAttribute('aria-describedby', errorId);

    let errorEl = document.getElementById(errorId);
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.id = errorId;
        errorEl.className = 'error';
        input.after(errorEl);
    }
    errorEl.textContent = message;
}

function clearError(input) {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    const errorEl = document.getElementById(input.id + '-error');
    if (errorEl) errorEl.remove();
}
```

### Why
- Screen readers announce labels, errors, and required states via ARIA attributes
- Keyboard users navigate with Tab, Enter, and Space
- Proper labeling increases the clickable area (clicking the label focuses the input)

### How It Works Internally
Browsers expose an **Accessibility Tree** — a parallel representation of the DOM for assistive technologies. ARIA attributes modify this tree. `aria-describedby` links an input to its error message, so screen readers announce both. `aria-invalid="true"` tells the user the field has an error.

---

## 14. Security Considerations

### What
Forms are the primary attack vector for web applications. Always validate on both client and server.

### Key Rules

| Rule | Why |
|------|-----|
| **Never trust client-side validation** | Users can bypass it entirely |
| **Sanitize all inputs** | Prevent XSS by escaping HTML before displaying |
| **Use CSRF tokens** | Prevent cross-site request forgery attacks |
| **Rate limit submissions** | Prevent brute force and spam |
| **Validate file types server-side** | `accept` attribute is client-only |
| **Use HTTPS** | Encrypt data in transit |
| **Don't put secrets in hidden inputs** | They're visible in the DOM |

### How
```javascript
// Basic XSS sanitization (for display, not storage)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Never do this with user input:
// element.innerHTML = userInput;  // XSS vulnerability!

// Do this instead:
element.textContent = userInput;
```

---

## 15. Exercises

### Exercise 1: Login Form Validation
Create a login form with email and password. Validate that:
- Email is not empty and contains `@`
- Password is at least 6 characters
- Show inline errors below each field
- Prevent submission if invalid

<details>
<summary>Solution</summary>

```html
<form id="login" novalidate>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>
  <span class="error" id="email-error"></span>

  <label for="password">Password</label>
  <input type="password" id="password" name="password" minlength="6" required>
  <span class="error" id="password-error"></span>

  <button type="submit">Login</button>
</form>
```

```javascript
const form = document.getElementById('login');
const email = document.getElementById('email');
const password = document.getElementById('password');

function showError(input, message) {
    input.classList.add('invalid');
    document.getElementById(input.id + '-error').textContent = message;
}

function clearError(input) {
    input.classList.remove('invalid');
    document.getElementById(input.id + '-error').textContent = '';
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    clearError(email);
    clearError(password);

    if (!email.value.includes('@')) {
        showError(email, 'Please enter a valid email');
        valid = false;
    }

    if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters');
        valid = false;
    }

    if (valid) {
        console.log('Submitting:', { email: email.value, password: password.value });
    }
});
```
</details>

---

### Exercise 2: Dynamic Form Fields
Create a form where users can click "Add Skill" to dynamically add new input fields. Each field should have a remove button. On submit, collect all skills into an array.

<details>
<summary>Solution</summary>

```html
<form id="skills-form">
  <div id="skills-container">
    <input type="text" name="skills" placeholder="Skill 1">
  </div>
  <button type="button" id="add-skill">Add Skill</button>
  <button type="submit">Submit</button>
</form>
```

```javascript
const container = document.getElementById('skills-container');
const addBtn = document.getElementById('add-skill');
const form = document.getElementById('skills-form');

addBtn.addEventListener('click', () => {
    const wrapper = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'skills';
    input.placeholder = `Skill ${container.children.length + 1}`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => wrapper.remove());

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const skills = Array.from(form.elements['skills'])
        .map(input => input.value)
        .filter(v => v.trim() !== '');
    console.log('Skills:', skills);
});
```
</details>

---

### Exercise 3: Real-Time Character Counter
Create a textarea with a max length of 200 characters. Show a live counter below it that turns red when approaching the limit.

<details>
<summary>Solution</summary>

```javascript
const textarea = document.getElementById('bio');
const counter = document.getElementById('counter');
const MAX = 200;

textarea.addEventListener('input', () => {
    const remaining = MAX - textarea.value.length;
    counter.textContent = `${remaining} characters remaining`;
    counter.classList.toggle('warning', remaining < 20);
    counter.classList.toggle('danger', remaining < 0);

    if (textarea.value.length > MAX) {
        textarea.value = textarea.value.slice(0, MAX);
        counter.textContent = '0 characters remaining';
    }
});
```
</details>

---

### Exercise 4: Password Strength Meter
Create a password input with a real-time strength indicator (weak/medium/strong) based on length, uppercase, numbers, and special characters.

<details>
<summary>Solution</summary>

```javascript
const password = document.getElementById('password');
const meter = document.getElementById('strength-meter');

password.addEventListener('input', () => {
    const val = password.value;
    let score = 0;

    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const strengths = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#ff4444', '#ff8844', '#ffcc44', '#88cc44', '#44aa44'];

    meter.textContent = strengths[score] || 'Weak';
    meter.style.color = colors[score] || colors[0];
});
```
</details>

---

### Exercise 5: Multi-Step Form Wizard
Create a 3-step form wizard with "Next" and "Previous" buttons. Validate each step before allowing progression. Show a progress indicator.

<details>
<summary>Solution</summary>

```javascript
const steps = document.querySelectorAll('.form-step');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
let currentStep = 0;

function showStep(n) {
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === n);
    });
    prevBtn.disabled = n === 0;
    nextBtn.textContent = n === steps.length - 1 ? 'Submit' : 'Next';
}

function validateStep(n) {
    const inputs = steps[n].querySelectorAll('input[required]');
    return Array.from(inputs).every(input => input.value.trim() !== '');
}

nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) {
        alert('Please fill all required fields');
        return;
    }
    if (currentStep === steps.length - 1) {
        document.getElementById('wizard').submit();
        return;
    }
    currentStep++;
    showStep(currentStep);
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

showStep(0);
```
</details>

---

### Exercise 6: File Upload with Preview
Create a file input that accepts images. Show a thumbnail preview before uploading. Display file size and type. Upload via `fetch` + `FormData`.

<details>
<summary>Solution</summary>

```javascript
const fileInput = document.getElementById('avatar');
const preview = document.getElementById('preview');
const info = document.getElementById('file-info');

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
        alert('Please select an image');
        fileInput.value = '';
        return;
    }

    // Show info
    info.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

// Upload
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch('/upload', { method: 'POST', body: formData });
    if (res.ok) alert('Upload successful!');
});
```
</details>

---

### Exercise 7: Dependent Dropdowns
Create two `<select>` elements: "Country" and "City". When a country is selected, the city dropdown updates dynamically.

<details>
<summary>Solution</summary>

```javascript
const data = {
    us: ['New York', 'Los Angeles', 'Chicago'],
    uk: ['London', 'Manchester', 'Birmingham'],
    jp: ['Tokyo', 'Osaka', 'Kyoto']
};

const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');

countrySelect.addEventListener('change', () => {
    const cities = data[countrySelect.value] || [];

    citySelect.innerHTML = '<option value="">-- Select City --</option>';
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.toLowerCase().replace(' ', '-');
        option.textContent = city;
        citySelect.appendChild(option);
    });
});
```
</details>

---

### Exercise 8: Form Auto-Save to localStorage
Create a form that automatically saves user input to `localStorage` as they type. Restore values on page load. Clear storage on successful submit.

<details>
<summary>Solution</summary>

```javascript
const form = document.getElementById('contact-form');
const STORAGE_KEY = 'form-draft';

// Restore on load
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) input.value = value;
    });
}

// Auto-save on input
form.addEventListener('input', () => {
    const data = Object.fromEntries(new FormData(form));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
});

// Clear on submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Submitted:', Object.fromEntries(new FormData(form)));
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
});
```
</details>

---

## 16. Quick Reference Cheat Sheet

```javascript
// ========== SELECTION ==========
const form = document.getElementById('myForm');
const form = document.forms['myForm'];
const input = form.elements['email'];

// ========== VALUES ==========
input.value              // current value
input.defaultValue       // original HTML value
input.checked            // boolean (checkbox/radio)
input.files              // FileList (file input)
select.value             // selected option value
select.selectedOptions   // selected option elements (multi)
select.selectedIndex     // index of selected option

// ========== VALIDATION ==========
input.checkValidity()    // boolean
input.validity.valid     // boolean
input.validity.valueMissing
input.validity.patternMismatch
input.setCustomValidity('message')
input.reportValidity()
form.reportValidity()

// ========== EVENTS ==========
form.addEventListener('submit', e => e.preventDefault());
input.addEventListener('input', e => console.log(e.target.value));
input.addEventListener('change', e => console.log('changed'));
input.addEventListener('focus', () => {});
input.addEventListener('blur', () => {});
input.addEventListener('invalid', e => e.preventDefault());

// ========== FORM DATA ==========
const fd = new FormData(form);
fd.get('name');
fd.getAll('name');        // array for multi-value
fd.append('key', 'value');
fd.set('key', 'value');
fd.delete('key');
fd.has('key');
Object.fromEntries(fd);   // convert to plain object

// ========== DYNAMIC OPTIONS ==========
select.add(new Option('Text', 'value'));
select.remove(index);
select.selectedIndex = 0;

// ========== FILE READING ==========
const reader = new FileReader();
reader.onload = e => console.log(e.target.result);
reader.readAsDataURL(file);
reader.readAsText(file);
reader.readAsArrayBuffer(file);

// ========== AJAX SUBMIT ==========
fetch('/api', {
    method: 'POST',
    body: new FormData(form)     // multipart
    // OR
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(form)))
});

// ========== RESET ==========
form.reset();                 // reset to default values
input.value = input.defaultValue;  // reset single field
```

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **Selection** | `form.elements['name']` is scoped and safe |
| **Events** | `input` = real-time, `change` = on blur after change, `submit` = form submission |
| **Validation** | HTML5 for UX, JS for logic, **Server for security** |
| **FormData** | Use it for all AJAX submissions — handles files, arrays, and encoding automatically |
| **Security** | Never trust client input. Sanitize, validate server-side, use HTTPS |
| **Accessibility** | Always use `<label>`, `aria-describedby` for errors, and `aria-invalid` |
| **Performance** | Debounce `input` handlers for expensive operations (search, validation) |

---

*Happy coding! 🚀*
