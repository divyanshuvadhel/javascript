# Fetch API & APIs Deep Dive — Internal Mechanics, Network Stack & Robust Patterns

> **Prerequisite**: You know `fetch(url)` returns a Promise, `.then(res => res.json())` gets data, and `POST` sends data. These notes go under the hood.

---

## 1. What `fetch` Actually Is (And What It Isn't)

`fetch` is a **browser API** (and Node.js via `undici`/`node-fetch`) that provides a **Promise-based interface** over the browser's underlying HTTP network stack. It is **not** a simple wrapper around `XMLHttpRequest` — it is a fundamentally different architecture.

### Key Differences from `XMLHttpRequest`

| Aspect | `XMLHttpRequest` | `fetch` |
|--------|-----------------|---------|
| API style | Event-based (`onload`, `onerror`) | Promise-based |
| Streaming | Not supported natively | **Response body is a ReadableStream** |
| Service Workers | Cannot intercept easily | **Designed for Service Worker interception** |
| Abort | `xhr.abort()` | **AbortController** |
| Progress | `onprogress` events | **No built-in progress** (must use ReadableStream) |
| CORS | Manual `withCredentials` | Automatic `credentials` option |
| Cookies | `withCredentials` boolean | `credentials: 'omit'|'same-origin'|'include'` |

**Key insight**: `fetch` was designed for the modern web — streaming, service workers, and streaming JSON parsing. It is lower-level than `XMLHttpRequest` in some ways (no built-in progress), but more powerful in others.

---

## 2. The Network Stack: What Happens When You Call `fetch`

When you call `fetch('https://api.example.com/data')`, this is the exact sequence:

### Step 1: URL Parsing & Normalization
The browser parses the URL string into a `URL` object. Relative URLs are resolved against `document.baseURI` (in browsers) or `process.cwd()` (in Node).

```js
fetch('/api/users');  // Resolved to https://current-site.com/api/users
```

### Step 2: Request Object Construction
`fetch` internally creates a `Request` object even if you pass a string:

```js
// Your code:
fetch('/api/users', { method: 'POST', body: JSON.stringify({name: 'Alice'}) });

// Internally becomes:
const request = new Request('/api/users', {
  method: 'POST',
  headers: new Headers({ 'content-type': 'application/json' }),
  body: JSON.stringify({name: 'Alice'}),
  mode: 'cors',
  credentials: 'same-origin',
  cache: 'default',
  redirect: 'follow',
  referrer: 'about:client',
  referrerPolicy: '',
  integrity: '',
  keepalive: false,
  signal: undefined,
  duplex: 'half'
});
```

### Step 3: CORS Preflight Check (If Needed)
If the request is cross-origin and uses:
- A method other than GET, HEAD, POST
- Custom headers (not in the CORS safelist)
- `content-type` other than `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`

The browser sends an **OPTIONS** preflight request **before** the actual request.

```
OPTIONS /api/users HTTP/1.1
Host: api.example.com
Origin: https://current-site.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

The server must respond with:
```
Access-Control-Allow-Origin: https://current-site.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: content-type
```

**If the preflight fails, the actual request never fires.** The browser returns a network error. The JavaScript code sees a generic `TypeError: Failed to fetch` — **you cannot read the preflight response status from JS** for security reasons.

### Step 4: HTTP Request Dispatch
The browser hands the request to the OS networking layer (or HTTP cache). The request goes through:

1. **HTTP Cache** (if `cache` option allows)
2. **Service Worker** (if registered and intercepts `fetch` events)
3. **DNS Resolution** → TCP Handshake → TLS Handshake (HTTPS) → HTTP Request

### Step 5: Response Streaming
Unlike `XMLHttpRequest`, `fetch` does **not** buffer the entire response body before resolving the Promise. The Promise resolves as soon as the **response headers** arrive (HTTP status line + headers), even if the body is still streaming.

```js
const response = await fetch('/api/large-file');
// Promise resolves HERE — body may not have arrived yet!

const data = await response.json();
// Body is consumed HERE — this waits for the full body to stream in.
```

**Critical**: `response.ok` (status 200-299) is checked **before** the body is consumed. But `fetch` **never rejects** for HTTP error statuses (4xx, 5xx). It only rejects for **network failures** (DNS, TCP, TLS, CORS, timeout).

---

## 3. The Response Object — Deep Anatomy

```js
const response = await fetch('/api/users');
```

### Properties
| Property | What It Is |
|----------|-----------|
| `response.ok` | `true` if status is 200-299 |
| `response.status` | HTTP status code (number) |
| `response.statusText` | HTTP status text (e.g., "OK", "Not Found") |
| `response.headers` | `Headers` object (immutable, case-insensitive) |
| `response.url` | Final URL after redirects |
| `response.redirected` | `true` if any redirects occurred |
| `response.type` | `'basic'`, `'cors'`, `'error'`, `'opaque'`, `'opaqueredirect'` |
| `response.body` | `ReadableStream` or `null` |
| `response.bodyUsed` | `true` if any body-reading method was called |

### Response Types (The CORS Security Model)

| Type | Origin | Body Readable? | Headers Readable? | When It Happens |
|------|--------|---------------|-------------------|-----------------|
| `basic` | Same-origin | Yes | Yes | Same-origin request |
| `cors` | Cross-origin | Yes | Yes (CORS-allowed) | CORS-enabled cross-origin request |
| `opaque` | Cross-origin | No | No | No-CORS mode (`mode: 'no-cors'`) |
| `error` | Any | No | No | Network error / CORS failure |
| `opaqueredirect` | Cross-origin | No | No | Redirect with `manual` redirect mode |

**The `opaque` trap**: If you use `mode: 'no-cors'` to fetch a cross-origin resource, you get an `opaque` response. You **cannot read the body, status, or headers**. The response is a black box. This is by design — it prevents information leakage across origins.

```js
const res = await fetch('https://third-party.com/api', { mode: 'no-cors' });
console.log(res.status);  // 0 (opaque responses have status 0!)
console.log(res.body);     // null
```

---

## 4. Body Consumption — The One-Shot Rule

A `Response` body is a **ReadableStream**. It can only be consumed **once**.

```js
const response = await fetch('/api/users');
const json1 = await response.json();  // Consumes the stream
const json2 = await response.json();    // ERROR! body already consumed
```

**Error**: `TypeError: body stream already read`

### Body Reading Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `.text()` | `Promise<string>` | HTML, raw text |
| `.json()` | `Promise<any>` | JSON APIs |
| `.blob()` | `Promise<Blob>` | Binary data, images, files |
| `.arrayBuffer()` | `Promise<ArrayBuffer>` | Raw binary, WASM, crypto |
| `.formData()` | `Promise<FormData>` | Form submissions |
| `.clone()` | `Response` | Clone the response to read body twice |

### The Clone Workaround
```js
const response = await fetch('/api/users');
const clone = response.clone();

const json = await response.json();     // For logic
const text = await clone.text();        // For logging/debugging
```

**Warning**: Cloning creates two streams reading from the same underlying data. If one is consumed faster than the other, memory buffers. For large responses, this is expensive.

---

## 5. Request Body — What Can You Send?

The `body` option accepts:

| Type | Behavior |
|------|----------|
| `string` | Sent as `text/plain` unless overridden by headers |
| `Blob` / `File` | Sent with the blob's type as Content-Type |
| `FormData` | Sent as `multipart/form-data` (boundary auto-generated) |
| `URLSearchParams` | Sent as `application/x-www-form-urlencoded` |
| `ArrayBuffer` / `TypedArray` | Sent as raw binary |
| `ReadableStream` | **Streaming upload** (modern browsers, Node 18+) |
| `null` / `undefined` | No body (GET, HEAD must not have body) |

### The `duplex` Option (Streaming Uploads)
```js
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('chunk1'));
    controller.enqueue(new TextEncoder().encode('chunk2'));
    controller.close();
  }
});

await fetch('/api/upload', {
  method: 'POST',
  body: stream,
  duplex: 'half'  // Required for streaming uploads!
});
```

`duplex: 'half'` means the request body can be streamed while the response is being read. Without this, the browser may buffer the entire body before sending.

---

## 6. Headers — The Hidden Complexity

```js
const headers = new Headers({
  'Content-Type': 'application/json',
  'X-Custom': 'value'
});
```

### Key Behaviors
- **Case-insensitive**: `headers.get('content-type')` works.
- **Immutable on Response**: Response headers from `fetch` are read-only. You must clone to modify.
- **Forbidden headers**: You cannot set `Cookie`, `Host`, `Origin`, `Referer`, etc. The browser controls these.
- **Guarded headers**: Some headers are protected by CORS policies (e.g., `Set-Cookie` is not readable in JS for cross-origin responses).

### Headers Guard
Every `Headers` object has an internal **guard** that restricts what you can do:

| Guard | Can Modify? | Context |
|-------|------------|---------|
| `none` | Yes | `new Headers()` |
| `request` | Yes | `Request` headers |
| `request-no-cors` | Limited | `no-cors` mode requests |
| `response` | No | `Response` from `fetch` |
| `immutable` | No | Error responses, opaque responses |

---

## 7. AbortController — How Cancellation Actually Works

```js
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/slow', { signal });

// Later:
controller.abort();  // Cancels the request
```

### What Happens Internally

1. `AbortController` creates an `AbortSignal` object with an internal **abort algorithm**.
2. When passed to `fetch`, the browser registers the signal with the HTTP request.
3. When `controller.abort()` is called, the signal's **abort reason** is set (default: `new DOMException('The operation was aborted.', 'AbortError')`).
4. The browser **terminates the TCP connection** (or stops the request before it starts).
5. The `fetch` Promise rejects with the abort reason.

### Abort with Timeout
```js
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}
```

**Note**: `AbortController` can abort **multiple** requests at once:
```js
const ctrl = new AbortController();
Promise.all([
  fetch('/api/a', { signal: ctrl.signal }),
  fetch('/api/b', { signal: ctrl.signal })
]);
ctrl.abort();  // Both abort simultaneously
```

---

## 8. CORS — The Complete Security Model

CORS (Cross-Origin Resource Sharing) is not a "bug" or "error" — it is a **browser-enforced security contract** between two origins.

### The Same-Origin Policy (SOP)
By default, a web page at `https://site-a.com` **cannot** read responses from `https://site-b.com`. This prevents:
- Reading your bank account from a malicious site
- Stealing internal company APIs from phishing pages

### When CORS Applies
| Scenario | CORS? | Example |
|----------|-------|---------|
| Same origin | No | `https://a.com/page` → `https://a.com/api` |
| Cross-origin, different protocol | Yes | `http://a.com` → `https://a.com` |
| Cross-origin, different port | Yes | `https://a.com` → `https://a.com:3000` |
| Cross-origin, different domain | Yes | `https://a.com` → `https://b.com` |

### The CORS Headers Contract

**Request headers** (browser sends automatically):
```
Origin: https://site-a.com
```

**Response headers** (server must send):
```
Access-Control-Allow-Origin: https://site-a.com
Access-Control-Allow-Credentials: true    (if cookies needed)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400             (preflight cache duration)
```

### The `credentials` Option
```js
fetch('/api', { credentials: 'include' });
```

| Value | Sends Cookies? | Sends Auth Headers? | CORS Requirement |
|-------|---------------|---------------------|------------------|
| `'omit'` | No | No | None |
| `'same-origin'` | Yes (same-origin only) | Yes (same-origin only) | None for same-origin |
| `'include'` | Yes (cross-origin too) | Yes (cross-origin too) | Server MUST send `Access-Control-Allow-Credentials: true` AND `Access-Control-Allow-Origin` must be exact (not `*`) |

**The `*` + `credentials: 'include'` trap**: You cannot use `Access-Control-Allow-Origin: *` with `credentials: 'include'`. The browser rejects this combination for security.

---

## 9. HTTP Caching & `fetch`

Browsers cache HTTP responses aggressively. `fetch` respects the HTTP cache headers.

### Cache-Control Headers
```
Cache-Control: max-age=3600        // Cache for 1 hour
Cache-Control: no-cache            // Must revalidate with server
Cache-Control: no-store            // Never cache
Cache-Control: must-revalidate     // Strict freshness check
ETag: "abc123"                     // Content identifier for conditional requests
Last-Modified: Mon, 01 Jan 2024... // Modification timestamp
```

### The `cache` Option in `fetch`

| Value | Behavior |
|-------|----------|
| `'default'` | Respect Cache-Control, send conditional requests (If-None-Match) |
| `'no-store'` | Skip cache entirely, always fetch fresh |
| `'reload'` | Skip cache lookup, but store the response |
| `'no-cache'` | Revalidate with server before using cached response |
| `'force-cache'` | Use cached response even if stale |
| `'only-if-cached'` | Only use cache (useful for Service Workers) |

### Conditional Requests (304 Not Modified)
When a cached response has `ETag` or `Last-Modified`, the browser sends:
```
GET /api/data HTTP/1.1
If-None-Match: "abc123"
```
If the server responds `304 Not Modified`, the browser uses the cached body. This saves bandwidth.

---

## 10. Streaming & ReadableStream (Advanced)

The `Response.body` is a `ReadableStream`. This enables:
- **Progress tracking** for downloads
- **Processing data as it arrives** (streaming JSON, NDJSON)
- **Memory-efficient** handling of large files

### Download Progress
```js
const response = await fetch('/api/large-file');
const reader = response.body.getReader();
const contentLength = +response.headers.get('Content-Length');

let received = 0;
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  received += value.length;
  console.log(`Progress: ${(received / contentLength * 100).toFixed(2)}%`);
}
```

### Streaming JSON (NDJSON — Newline-Delimited JSON)
```js
const response = await fetch('/api/stream');
const reader = response.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      chunk.split('\n').forEach(line => {
        if (line.trim()) controller.enqueue(JSON.parse(line));
      });
    }
  }))
  .getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);  // Individual JSON objects as they arrive
}
```

---

## 11. Building a Robust API Client from Scratch

```js
class ApiClient {
  constructor(baseURL, defaultOptions = {}) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.defaultOptions = defaultOptions;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeout = options.timeout || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultOptions.headers,
        ...options.headers,
      },
      signal: controller.signal,
    };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.text();
        throw new ApiError(response.status, response.statusText, errorBody, url);
      }

      // Parse based on content type
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ApiError(0, 'Request timeout', null, url);
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error.message, null, url);
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(status, statusText, body, url) {
    super(`${status} ${statusText} — ${url}`);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.url = url;
    this.name = 'ApiError';
  }
}

// Usage:
const api = new ApiClient('https://api.example.com', {
  credentials: 'include',
});

api.get('/users')
  .then(data => console.log(data))
  .catch(err => {
    if (err.status === 401) redirectToLogin();
    else if (err.status === 429) retryWithBackoff();
    else console.error('API Error:', err);
  });
```

---

## 12. Common Traps & Edge Cases

### Trap 1: `fetch` Never Rejects on HTTP Errors
```js
const res = await fetch('/api/not-found');
// res.status === 404, but the Promise RESOLVED!
// You MUST check res.ok manually.
```

### Trap 2: `res.json()` on Empty Body
```js
const res = await fetch('/api/empty');  // Returns 204 No Content
const data = await res.json();  // SyntaxError: Unexpected end of JSON input!
```

**Fix**: Check status or content-type before parsing.
```js
if (res.status === 204) return null;
if (res.headers.get('content-length') === '0') return null;
```

### Trap 3: Unhandled Rejection on Abort
```js
const controller = new AbortController();
fetch('/api', { signal: controller.signal });
controller.abort();
// Unhandled rejection! You must attach .catch() or await in try/catch.
```

### Trap 4: Relative URLs in Node.js
Node.js `fetch` (v18+) does not have a `document.baseURI`. Relative URLs throw:
```
TypeError: Failed to parse URL from /api/users
```

**Fix**: Always use absolute URLs in Node.js, or set a `baseURL`.

### Trap 5: `Content-Type` on `FormData`
```js
const form = new FormData();
fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },  // WRONG!
  body: form
});
```

The browser **must** set the `Content-Type` with the correct `boundary` string for `FormData`. Setting it manually breaks the request.

### Trap 6: `GET` with Body
```js
fetch('/api', { method: 'GET', body: 'data' });
// TypeError: Request with GET/HEAD method cannot have body
```

HTTP spec forbids bodies on GET/HEAD. Use POST/PUT/PATCH instead, or pass data in query parameters.

### Trap 7: Redirects with `manual` Mode
```js
const res = await fetch('/api/redirect', { redirect: 'manual' });
// res.status === 0, res.type === 'opaqueredirect'
// You cannot read the Location header for cross-origin redirects!
```

---

## 13. REST API Design Principles (From the Consumer Side)

### HTTP Methods Semantics
| Method | Idempotent? | Safe? | Use Case |
|--------|------------|-------|----------|
| `GET` | Yes | Yes | Read data |
| `POST` | No | No | Create resource |
| `PUT` | Yes | No | Full update / replace |
| `PATCH` | No | No | Partial update |
| `DELETE` | Yes | No | Remove resource |
| `HEAD` | Yes | Yes | Check existence without body |
| `OPTIONS` | Yes | Yes | CORS preflight, discover capabilities |

**Idempotent**: Same request, same result (server state unchanged after first call).  
**Safe**: Does not modify server state.

### Status Codes You Must Handle
| Code | Meaning | Action |
|------|---------|--------|
| `200` | OK | Standard success |
| `201` | Created | Resource created, check `Location` header |
| `204` | No Content | Success, no body to parse |
| `400` | Bad Request | Client error, fix request payload |
| `401` | Unauthorized | Authentication required / failed |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource state conflict (e.g., duplicate) |
| `422` | Unprocessable Entity | Validation error, body has details |
| `429` | Too Many Requests | Rate limited, retry with backoff |
| `500` | Internal Server Error | Server bug, report it |
| `502` | Bad Gateway | Upstream server error |
| `503` | Service Unavailable | Server overloaded, retry with backoff |

### Retry with Exponential Backoff
```js
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** i, 10000);  // 1s, 2s, 4s, cap at 10s
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

## 14. Mental Model Summary

| Concept | Mental Model |
|---------|-------------|
| `fetch` | Promise-based interface over the browser's HTTP network stack |
| `fetch` rejection | Only rejects on **network failure** (DNS, TCP, TLS, CORS, abort). HTTP errors (4xx/5xx) resolve. |
| Response body | A `ReadableStream` — can only be consumed **once**. Use `.clone()` to read twice. |
| CORS | A browser-enforced security contract. Preflight OPTIONS for non-simple cross-origin requests. |
| `AbortController` | Signals the browser to **terminate the TCP connection**. Not just a Promise rejection. |
| `credentials: 'include'` | Sends cookies cross-origin, but server must send exact `Allow-Origin` (not `*`). |
| `mode: 'no-cors'` | Returns an **opaque** response — body, status, headers are unreadable. |
| `duplex: 'half'` | Required for streaming uploads. Allows request body to stream while response is read. |
| `res.ok` | `true` for 200-299. You must check this manually — `fetch` doesn't throw. |
| `FormData` | Browser auto-sets `Content-Type` with boundary. Never set it manually. |
| `GET` with body | Forbidden by HTTP spec. `fetch` throws `TypeError`. |
| `304 Not Modified` | Browser uses cached body. Saves bandwidth via conditional requests. |

---

## 15. Checklist for Mastery

- [ ] Can explain why `fetch` doesn't reject on 404/500
- [ ] Can write the full `fetch` → HTTP request → CORS preflight → response flow
- [ ] Can implement download progress tracking using `ReadableStream`
- [ ] Can build a production-grade API client with timeout, retry, and error handling
- [ ] Understands the difference between `cors`, `opaque`, and `error` response types
- [ ] Can explain why `credentials: 'include'` + `Access-Control-Allow-Origin: *` fails
- [ ] Can implement exponential backoff retry logic
- [ ] Knows when CORS preflight is triggered and what headers are involved
- [ ] Can explain why `FormData` must not have a manually set `Content-Type`
- [ ] Can write a streaming JSON parser using `TransformStream`
- [ ] Understands the `duplex: 'half'` option for streaming uploads
- [ ] Can explain the difference between `no-cache`, `no-store`, and `reload` cache modes

---

*Study these notes, then build: a streaming file downloader with progress bar, an API client with automatic token refresh and request deduplication, and a CORS proxy that demonstrates preflight behavior.*
