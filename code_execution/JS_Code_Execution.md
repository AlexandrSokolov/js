
## Ways JavaScript Code Can Be Triggered on Page Load

### Summary Table

| Method             | When It Runs     | DOM Ready?                | All Resources Loaded? | Use Case                  |
|--------------------|------------------|---------------------------|-----------------------|---------------------------|
| `window.onload`    | Very late        | Y                         | Y                     | Needs images, layout info |
| `DOMContentLoaded` | After DOM parse  | Y                         | N                     | UI initialization         |
| IIFE               | Immediately      | N (unless bottom of body) | N                     | Modules, scope isolation  |
| `<script defer>`   | After DOM parse  | Y                         | N                     | Main application scripts  |
| `<script async>`   | When downloaded  | ? Depends                 | ? Depends             | Third‑party scripts       |
| Inline end‑of‑body | At that location | Y (for previous DOM)      | N                     | Simple page-level init    |

- [The window `onload` event](#the-window-onload-event)
- [DOMContentLoaded event](#domcontentloaded-event)
- [IIFE](#iife)
- [Deferred script execution](#deferred-script-execution)
- [Async execution](#async-javascript)
- [Body-end inline script](#body-end-inline-script)

### The window `onload` event

```javascript
window.onload = function () {
  ...
};
```

- [When does `window.onload = function (...) { ... }` run?](FAQ.JS_Code_Execution.md#when-does-windowonload--function-----run)
- [The window onload event for code triggering, its pros, cons, when to use it?](FAQ.JS_Code_Execution.md#the-window-onload-event-for-code-triggering-its-pros-cons-when-to-use-it)

### DOMContentLoaded event

```javascript
document.addEventListener("DOMContentLoaded", () => {
  ... 
});
```

- [When does DOMContentLoaded event run?](FAQ.JS_Code_Execution.md#when-does-domcontentloaded-event-run)
- [DOMContentLoaded event for code triggering, its pros, cons, when to use it?](FAQ.JS_Code_Execution.md#domcontentloaded-event-for-code-triggering-its-pros-cons-when-to-use-it)

### IIFE

IIFE - Immediately Invoked Function Expression

```javascript
(function() {
  console.log("Runs immediately while script is being parsed");
})();
```

- [When does IIFE run?](FAQ.JS_Code_Execution.md#when-does-iife-run)
- [IIFE pros, cons, when to use it?](FAQ.JS_Code_Execution.md#iife-pros-cons-when-to-use-it)

### Deferred script execution

#### Deferred script execution if you need access to fully loaded DOM
```javascript
<script defer src="my.js"></script>
```
inside `my.js`:
```javascript
// my.js (loaded with defer)
initApp();

function initApp() {
  console.log("App started");
  // ... your logic
}
```
1. This solution pollutes the global scope (if not in a module).
2. Using `DOMContentLoaded` event handler gives nothing.

#### Deferred script execution if you need access to the loaded resources, like image
```javascript
<script defer src="my.js"></script>
```
inside `my.js`:
```javascript
window.onload = () => {
  runAfterEverythingLoaded();
};
```

#### Recommended patterns on deferred script implementation

```javascript
// app.js
(function main() {
    console.log("App bootstrapped");
})();
```
or
```javascript
export function start() {
    console.log("Started");
}
start();
```

- [When does deferred script run?](FAQ.JS_Code_Execution.md#when-does-deferred-script-run)
- [Deferred script execution, pros, cons, when to use it?](FAQ.JS_Code_Execution.md#deferred-script-execution-pros-cons-when-to-use-it)

### Async JavaScript

```javascript
<script async src="https://google-analytics.com/analytics.js"></script>
```

- [When does `async` JavaScript run?](FAQ.JS_Code_Execution.md#when-does-async-javascript-run)
- [`async` JavaScript pros, cons, when to use it?](FAQ.JS_Code_Execution.md#async-javascript-pros-cons-when-to-use-it)

### Body-end inline script

Inline script at the end of `<body>`:
```html
<body>
  ...
  <script>
    initApp();
  </script>
</body>
```

- [When does body-end inline script run?](FAQ.JS_Code_Execution.md#when-does-body-end-inline-script-run)
- [Body-end inline script, pros and cons](FAQ.JS_Code_Execution.md#body-end-inline-script-pros-and-cons)