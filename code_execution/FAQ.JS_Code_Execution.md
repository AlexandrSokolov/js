## The JavaScript event loop
<details>
  <summary><strong>Show questions</strong></summary>

### Macro‑tasks in JS
<details>
  <summary>Show answer</summary>

A macro‑task is a “normal async block of work”.
* Macro‑tasks are big asynchronous operations. 
* Each macro‑task is executed from **start to finish**
* Between each macro‑task, the browser **may** re-render the UI.
 
Common examples of macro‑tasks
* setTimeout(fn, 0)
* setInterval(fn)
* setImmediate (Node.js)
* requestAnimationFrame (kind of separate, but macro-task‑like)
* I/O events (network, filesystem in Node)
* MessageChannel (task in browsers)

</details>

### Micro-tasks in JS
<details>
  <summary>Show answer</summary>

A micro‑task is “I need to run ASAP, right after the current line of code, before anything else”.
* Micro‑tasks run **immediately after the current JS execution finishes**, 
* before the browser performs rendering and 
* before the next macro‑task.

Micro‑tasks have higher priority than macro‑tasks.

Common examples of micro‑tasks
* fetch().then(...).catch().finally()
  The callback passed to functions runs as a micro‑task.
  `fetch` itself performs its network work outside the event loop (in the browser’s networking layer), 
  and once the HTTP response is ready, the promise is resolved -> which queues a **micro‑task**.
* Promise.then() / catch() / finally()
* async/await continuations
* queueMicrotask()
* MutationObserver

</details>

### The JavaScript event loop, what must you care about?
<details>
  <summary>Show answer</summary>

You must understand how micro-tasks and macro-tasks affect rendering.

Each cycle of the JavaScript event loop looks like:
1. Take one macro-task
2. execute it fully
3. run all micro-tasks
4. render UI if needed
5. go to next macro-task

Because micro-tasks run before the next macro‑task and before rendering, 
micro‑tasks can delay rendering if you schedule too many.

</details>

### fetch’s networking, type of task
<details>
  <summary>Show answer</summary>

fetch’s networking is not a task. 

1. Network happens outside the JS task queues.
   The browser’s networking engine is not part of macro/micro tasks.
2. When response is ready → promise fulfills.
   This does not push a macro-task.
3. Promise fulfillment schedules a micro‑task.
   This is where your .then() runs.
   So the part that you write (the callback) is always a micro‑task.

</details>

### Describe a code snippet #1
<details>
  <summary>Show details</summary>

<details>
  <summary>Show code</summary>

```javascript
console.log("start");

setTimeout(() => {
  console.log("macro");
}, 0);

Promise.resolve().then(() => {
  console.log("micro");
});

console.log("end");
```

</details>

<details>
  <summary>Show answer</summary>

Output:
```text
start
end
micro
macro
```
“micro” runs before timers because micro‑tasks flush before the event loop picks the next macro‑task.

</details>

</details>

### Describe a code snippet #2
<details>
  <summary>Show details</summary>

<details>
  <summary>Show code</summary>

```javascript
console.log("start");

setTimeout(() => console.log("timeout"), 0);

fetch("https://example.com")
  .then(() => console.log("fetch-microtask"));

console.log("end");
```

</details>

<details>
  <summary>Show answer</summary>

Possible output (not guaranteed):
```text
start
end
fetch-microtask
timeout
```

**If the fetch takes longer, `setTimeout(..., 0)` callback (a macrotask) will likely 
run before `fetch`’s `.then` (a microtask)**, because the microtask can’t be queued until `fetch` promise settles.
**But there is no strict guarantee**: 
whichever underlying task (timer firing vs. network response becoming available) happens first will determine the order.

</details>

</details>

### How to make the order deterministic, first `setTimeout` macrotask and only then `.then` microtask?
<details>
  <summary>Show answer</summary>

Instead of:
```javascript
setTimeout(() => console.log("timeout"), 0);

fetch("https://example.com")
  .then(() => console.log("fetch-microtask"));
```
Write:
```javascript
setTimeout(() => console.log("timeout"), 0);

setTimeout(() => {
  fetch("https://example.com")
    .then(() => console.log("fetch-microtask"));
}, 0);
``
```

</details>

### How to make the order deterministic, first `.then` microtask and only then `setTimeout` macrotask?
<details>
  <summary>Show answer</summary>

```javascript
const p = fetch("https://example.com");
p.finally(() => setTimeout(() => console.log("timeout"), 0));
p.then(() => console.log("fetch-microtask"));
```

___

</details>

</details>

---

## Browser Rendering Behaviour
<details>
  <summary><strong>Show questions</strong></summary>

### Can CSS affect JS?
<details>
  <summary>Show answer</summary>

Browser loads and parses all CSS -> builds the CSS Object Model. 
CSS is render‑blocking. 
CSS can delay JS execution

**Red flag**: _CSS never blocks JS_.

CSS loading can block JavaScript execution if:
* The script reads CSSOM
* The script manipulates elements dependent on styles
* The browser defers execution to avoid forced reflow
  CSS is **render‑blocking**, and JS often interacts with layout.

</details>

### Does JS affect rendering?
<details>
  <summary>Show answer</summary>

**Yes, any JavaScript can affect rendering because JS runs on the main thread**.
Even `defer` scripts can change the DOM or styles right before first paint, delaying or influencing rendering.
The difference between script types is not _whether_ they can affect rendering, 
but _when_ and _how severely_ they impact the rendering pipeline.

Browser Rendering Pipeline:
1. Parse HTML → Build DOM
2. Parse CSS → Build CSSOM
3. Combine DOM + CSSOM → Render Tree
4. Layout (Reflow)
5. Paint

| Script type                                            | 1) DOM Construction                                                   | 2) CSSOM Construction                                                                               | 3) Render Tree                                                                    | 
|--------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| 1. Synchronous `<script>` (no async/defer)             | **Blocks.**                                                           | **Can indirectly block.** If script needs style info and CSS isn’t loaded, browser waits for CSSOM. | **Can delay.** Delayed DOM/CSSOM delays render tree; mutations can invalidate it. |
| 2. Scripts inside `DOMContentLoaded` / `window.onload` | **Does not block.** DOM fully built before these events.              | **Does not block.** For DOMContentLoaded, CSS may or may not be done; for onload, it is.            | **May affect.** DOM/style mutations invalidate render tree.                       |
| 3. `async` scripts                                     | **Does not block parsing.** Can change DOM/styles before first paint. | **Does not block by default.** If executed before CSS is ready and needs styles, may wait for CSS.  | **Race‑dependent.** Early mutations can change pending render tree.               |
| 4. `defer` scripts                                     | **Does not block parsing.** Can change DOM/styles before first paint. | **Waits for CSSOM** when required for consistent style state.                                       | **Predictable.** Runs post‑DOM; may modify render tree right before first paint.  |

</details>

### What does it mean when developers say "the DOM is ready"? How do you detect it?
<details>
  <summary>Show answer</summary>

* DOM tree is built
* Doesn’t require images/fonts
* Achieved via DOMContentLoaded or deferred script

</details>

### How does `<script>` impact page performance
<details>
  <summary>Show answer</summary>

* Every blocking script stops HTML parsing unless async/defer
* Defer is recommended for most cases
* Async avoids blocking but risks execution disorder
* Inline scripts run immediately and always block

</details>

### Module scripts, do they block HTML parsing?
<details>
  <summary>Show answer</summary>

You use module scripts when you include a `<script type="module">`
Do they block HTML parsing?
**No.**
Modules behave like `defer` by default:
* Download in parallel - Async loading but deferred execution
* Execute after DOM parse
* Do not block

</details>

### Module vs deferred scripts
<details>
  <summary>Show answer</summary>

Modules behave like `defer` by default.

</details>

### What’s the difference in execution between the scripts
<details>
  <summary>Show answer</summary>

1. Inline `<script>` in <head>
2. Inline `<script>` at bottom of body
3. External script with defer
4. External script with async

| Script Type                          | When It Executes                           | Blocks HTML Parsing? | Execution Order Guaranteed? | DOM Ready When It Runs?   | 
|--------------------------------------|--------------------------------------------|----------------------|-----------------------------|---------------------------|
| Inline `<script>` in `<head>`        | Immediately when parser reaches it         | **Yes**              | Yes (source order)          | ❌ Usually not             |
| Inline `<script>` at end of `<body>` | Immediately when parser reaches it         | **Yes** (briefly)    | Yes (source order)          | ✔️ Yes (DOM mostly built) |
| External script with `defer`         | After HTML parse, before DOMContentLoaded  | ❌ No                 | ✔️ Yes (document order)     | ✔️ Yes                    |
| External script with `async`         | As soon as downloaded (unpredictable time) | ❌ Download; ✔️ Exec  | ❌ No order                  | ❓ Maybe (not guaranteed)  |

</details>

### DOMContentLoaded Behavior and the scripts execution
<details>
  <summary>Show answer</summary>

| Script Type                          | DOMContentLoaded Behavior |
|--------------------------------------|---------------------------|
| Inline `<script>` in `<head>`        | Delayed (parser blocked)  |
| Inline `<script>` at end of `<body>` | Runs right before DCL     |
| External script with `defer`         | DCL waits for all defer   |
| External script with `async`         | DCL does **not** wait     |

</details>

### Describe a code snippet #3
<details>
  <summary>Show details</summary>

<details>
  <summary>Show code</summary>

```html
<!DOCTYPE html>
<html>
<head>
  <script>console.log(1);</script>
    
  <script async src="script1.js"></script>
  <script async src="script2.js"></script>

  <script defer src="script3.js"></script>
  <script defer src="script4.js"></script>

  <script type="module" src="mod1.js"</script>
  <script type="module" src="mod2.js"</script>
</head>
<body>

<script>console.log(2);</script>

<script>
  const s1 = document.createElement('script');
  s1.src = 'script5.js';
  document.body.appendChild(s1);

  const s2 = document.createElement('script');
  s2.src = 'script6.js';
  s2.async = false;
  document.body.appendChild(s2);

  const s3 = document.createElement('script');
  s3.src = 'script7.js';
  s3.async = false;
  document.body.appendChild(s3);
</script>

<script>console.log(3);</script>

</body>
</html>
```

</details>

<details>
  <summary>Show answer</summary>

Each non-module script just writes its name into console. For instance `script_1.js`:
```javascript
console.log('script_1');
```
`mod1.js` uses `mode2.js`:
```javascript
// mod1.js
console.log('module1');
import './mod2.js';
console.log('module1-end');
```
`mode2.js`:
```javascript
// mod2.js
console.log('module2');
```

Possible output:
```text
1
2
3
script2
script1
script5
script3 
script4
module1
module2
module1-end
script6
script7
```
* script1 and script2 - async scripts - run as soon as they finish downloading. Order NOT guaranteed.
* script3 and script4 - deferred scripts - Always after HTML parsing, in document order, before DOMContentLoaded.
* mod1.js and mod1.js - modules scripts - Acts like defer, but follows module graph order.
* script5 - dynamic script, runs ASAP when loaded (like async)
* script6 and script7 - dynamic scripts, but run after parsing, in the order appended, because async = false
  They execute in insertion order and before DOMContentLoaded.
  Their relative position vs. defer/module can vary with timing (network, parser progress). 
  Often they run after parsing finishes; 
  they may run before or after deferred/module scripts depending on when they finish downloading and 
  when the browser is ready to execute them.

1. Inline order is fixed: 1 → (maybe some asyncs) → 2 → (maybe some asyncs) → 3.
2. After parsing completes:
   - Deferred classics: script3 → script4 
   - Modules (non‑async): module1 → module2 → module1-end 
   - Dynamic async=false: script6 → script7
3. Asyncs (script1, script2, script5) can run anytime after the currently running script completes, 
  independent of each other and independent of DOM readiness.

</details>

</details>

### Does placing a `<script>` inside a `<template>` element block the DOM parser?
<details>
  <summary>Show answer</summary>

**No.**
Contents inside `<template>` aren’t executed; they’re inert DOM.
Scripts inside templates don’t run until extracted.

</details>

### If a script throws an error during execution, does the browser continue parsing HTML afterward?
<details>
  <summary>Show answer</summary>

**Yes.**
A JS runtime error does **not** stop HTML parsing.
Only fatal parser errors (rare malformed `<script>` tags) stop parsing.

</details>

### Does `await` inside top‑level ES modules block DOM parsing?
<details>
  <summary>Show answer</summary>

**No.**
HTML parsing does not wait for async module execution.
The module executes after download, but top‑level await only blocks **the module’s export availability**, not DOM creation.

</details>

### Using `document.write()` in JavaScript code
<details>
  <summary>Show answer</summary>

`document.write()` breaks execution flow

1. Re-parses document
2. Removes existing DOM
3. Blocks everything
4. Should never be used

---

</details>

</details>

---

## `onload` and DOMContentLoaded
<details>
  <summary><strong>Show questions</strong></summary>

### When does `window.onload = function (...) { ... }` run?
<details>
  <summary>Show answer</summary>

After EVERYTHING has loaded, including:
* DOM
* CSS
* Images
* Fonts
* Iframes
* Videos

</details>

### The window onload event for code triggering, its pros, cons, when to use it?
<details>
  <summary>Show answer</summary>

**Pros**
* Guarantees the whole page is ready
* Good for scripts needing full layout, image dimensions, etc.


**Cons**
* Fires late
* Slows initial interactivity if used for UI initialization

**When to use:**

When your code needs images or external resources to be fully loaded
(e.g., calculating element sizes after images load).

</details>

### Does window.onload always wait for CSS files? Images? Fonts? Iframes? Videos?
<details>
  <summary>Show answer</summary>

**Yes for:**
* CSS
* Images (if they are not lazy-loaded images (loading="lazy"))
* Iframes
* Scripts
* Videos metadata

**No for:**
* **lazy-loaded images (loading="lazy")**
* Fonts that load via `font-display: swap`
* Media without preload
* Prefetched resources

</details>

### When does DOMContentLoaded event run?
<details>
  <summary>Show answer</summary>

When the DOM tree is fully parsed, **but before**:
* Images
* Fonts
* Videos
* Stylesheets

</details>

### DOMContentLoaded event for code triggering, its pros, cons, when to use it?
<details>
  <summary>Show answer</summary>

**Pros**
* Fires earlier than window.onload
* Standard modern way to run initialization code

**Cons**
* Doesn’t wait for images to load

**When to use:**
* Almost always for UI logic
* When you only need the DOM structure, not images

</details>

### Does DOMContentLoaded fire again if new DOM elements are added later?
<details>
  <summary>Show answer</summary>

No.
`DOMContentLoaded` fires exactly once, when the initial HTML has been parsed.
Mutating the DOM later does not retrigger lifecycle events.

</details>

### What happens if you add a DOMContentLoaded listener after the event has already fired?
<details>
  <summary>Show answer</summary>

**It will execute immediately.**
The event is not lost; it runs synchronously when added.

</details>

### DOMContentLoaded vs window.onload
<details>
  <summary>Show answer</summary>

* DOMContentLoaded = DOM parsed
* onload = all resources loaded
* Understand implications for performance and UI init

Explains timing + practical use cases
Mentions edge cases (CSS blocking, zero-resource pages)

</details>

### DOMContentLoaded and Zero‑Resource Pages
<details>
  <summary>Show answer</summary>

Zero‑Resource Pages - pages that have no external resources, like:
* No external scripts
* No CSS files
* No images
* No fonts
* No iframes

- `DOMContentLoaded` fires almost immediately as soon as the DOM is parsed.
- `window.onload` fires almost at the same time.

</details>

### DOMContentLoaded and CSS
<details>
  <summary>Show answer</summary>

CSS is not supposed to block `DOMContentLoaded` by itself.

BUT CSS can delay DOMContentLoaded indirectly when scripts depend on it (on CSS):
1. A `<script>` runs before CSS is loaded
2. And that script needs style information (layout reads, style queries)
3. Browser must wait for CSS to load → script execution is delayed
4. DOM parsing cannot continue while the script is blocked
5. So `DOMContentLoaded` is delayed as a side effect

</details>

### Describe a code snippet #4
<details>
  <summary>Show details</summary>

<details>
  <summary>Show code</summary>

```html
<link rel="stylesheet" href="big.css">
<script>console.log("hi")</script>
```

</details>

<details>
  <summary>Show answer</summary>

If the script **does not read layout**:
* It executes even if CSS is not loaded
* DOM parsing continues
* DCL fires
* CSS may still be loading

</details>

</details>

### DOMContentLoaded async/defer scripts
<details>
  <summary>Show answer</summary>

**async**
* Can finish before DCL or after — unpredictable
* Can push DCL later if it runs before HTML finishes parsing

**defer**
* Always run after DOM parsing
* Before DCL
* If slow → they push DCL
* But DCL still does not wait for images

</details>

### `DOMContentLoaded` and `window.onload` with Cached Resources
<details>
  <summary>Show answer</summary>

* onload happens much earlier
* DCL stays in the same spot

So the gap between DCL and load shrinks dramatically.

</details>

### `DOMContentLoaded` and `window.onload` with iframes
<details>
  <summary>Show answer</summary>

Even if iframe not visible:
* iframe `DOMContentLoaded` does not affect neither parent `DOMContentLoaded`, no parent `window.onload`
* iframe `window.onload` does delay parent `window.onload`

</details>

### Describe a real scenario where using window.onload is required and using DOMContentLoaded is insufficient
<details>
  <summary>Show answer</summary>

* Measuring final image dimensions
* Canvas sizing after load
* Layout depending on external font load (unless font‑loading API used)

</details>

### What happens when using window.onload for everything?
<details>
  <summary>Show answer</summary>

It slows page.

</details>

### If a script is blocked by CSP, does DOMContentLoaded wait for it?
<details>
  <summary>Show answer</summary>

CSP - Content Security Policy

**No.**
Blocked script is treated as if it failed instantly.
DOMContentLoaded does not wait.

---

</details>

</details>

---

## JS using by the caller
<details>
  <summary><strong>Show questions</strong></summary>

### What is an IIFE? How does execution timing differ from event‑based approaches?
<details>
  <summary>Show answer</summary>

IIFE - Immediately Invoked Function Expression.

* Runs immediately at parse time
* DOM may not exist yet
* Good for scoping, modules, initialization logic that doesn’t depend on the DOM

</details>

### When does IIFE run?
<details>
  <summary>Show answer</summary>

**Immediately**, as soon as the `<script>` tag is executed.

</details>

### IIFE pros, cons, when to use it?
<details>
  <summary>Show answer</summary>

**Pros**
* Runs instantly
* Creates private scope (avoids polluting window)
* Used for modules, closures, library wrappers

**Cons**
* DOM may NOT exist yet
* Elements may not be available (document.getElementById fails if called too early)

**When to use**
* Compute constants
* Parse config
* Wrap code in module-style scope
* Configure library behavior
* Avoid global variable leaks

</details>

### Can code inside an IIFE safely interact with DOM elements?
<details>
  <summary>Show answer</summary>

**Yes** — code inside an IIFE can safely interact with DOM elements, 
as long as the IIFE runs after the elements exist in the DOM.

</details>

### IIFE and DOM
<details>
  <summary>Show answer</summary>

IIFE does not wait DOM. When DOM is needed place `<script>` at the end of `<body>`.

</details>

### If you use an IIFE at the top of <head>, when exactly does it run relative to DOM parsing?
<details>
  <summary>Show answer</summary>

**Immediately during parsing of the <head>, before any body parsing happens.**
- HTML parsing stops while the script runs.
- DOM is usually incomplete at that moment.

</details>

### Can a Promise callback run before an IIFE that appears later in the same script?
<details>
  <summary>Show answer</summary>

**No.**
Script executes top‑down:
* IIFE executes immediately
* Only after script finishes do microtasks run (promise callbacks)

</details>

### Explain the difference between async and defer when loading external scripts, when to use them?
<details>
  <summary>Show answer</summary>

* async = runs immediately after download, unpredictable order
* defer = ordered, waits until DOM parse finishes and only then runs

Use them:
* async: analytics, ads, third‑party scripts
* defer: core app scripts, modules

</details>

### Which loads and executes first: async or defer?
<details>
  <summary>Show answer</summary>

It depends.
- **async always wins if it downloads first.**
- If the async script takes a long time to download, the defer script will still run before it.

Order:
* async runs ASAP (before or after parsing)
* defer waits until DOM parse finishes

- Async ignores order.
- Defer preserves order.

</details>

### When does deferred script run?
<details>
  <summary>Show answer</summary>

* Runs after HTML is parsed
* Runs before DOMContentLoaded
* Scripts keep execution order

</details>

### Deferred script execution, pros, cons, when to use it?
<details>
  <summary>Show answer</summary>

**Pros**
* Best for page performance (never block the page)
* Fully safe to operate on DOM
* No need for DOMContentLoaded listener
* Executes in predictable order

**Cons**

None really.

For most modern apps, using `<script defer>` is the best practice.

</details>

### Can a script with defer block rendering?
<details>
  <summary>Show answer</summary>

**A defer script can block rendering, but not in the same way a normal synchronous `<script>` blocks rendering.**

A defer script does not block HTML parsing (like synchronous `<script>` do), but it can block rendering, because:
- defer scripts run before the first paint (usually)
- They run before DOMContentLoaded
- Rendering (paint) cannot occur while JavaScript is executing
- defer scripts can mutate DOM or styles, forcing extra layout before paint

So: they can delay first paint, even though they don’t block HTML parsing.

</details>

### If you include three `<script defer>` tags, what determines their execution order? What could break that order?
<details>
  <summary>Show answer</summary>

**Their order in the HTML determines execution.**
What can break it?
* Failed requests
* Redirect loops
* Network error → script never executes
* Extremely slow download (can delay execution but not re‑order)

</details>

### In which situations can a deferred script run BEFORE DOMContentLoaded, and when can it run AFTER?
<details>
  <summary>Show answer</summary>

**Normally defer runs before DOMContentLoaded.**
But it can run after if:
* The deferred script downloads slowly
* The browser encounters blocking CSS that delays script execution
* Browser throttles network or deprioritizes scripts
  Guarantee:
  **Defer runs before DOMContentLoaded, unless download finishes late.**

</details>

### Can you defer inline scripts?
<details>
  <summary>Show answer</summary>

`defer` doesn’t work for inline scripts, 
you can achieve the same effect by wrapping your code inside the DOMContentLoaded event listener:
```javascript
<script>
  document.addEventListener("DOMContentLoaded", () => {
    // Inline script
  });
</script>
```

</details>

### When does `async` JavaScript run?
<details>
  <summary>Show answer</summary>

* As soon as the script downloads
* Execution order is NOT guaranteed
* Does not block rendering

</details>

### `async` JavaScript pros, cons, when to use it?
<details>
  <summary>Show answer</summary>

Pros
* Ideal for scripts that don't depend on others
* Great for analytics, ads, tracking scripts

Cons
* Cannot rely on DOM or other scripts being ready
* Totally unpredictable execution order

When to use
* Third‑party analytics
* Widgets
* Scripts without dependencies

</details>

### Which runs first: an `async` script or a `DOMContentLoaded` handler? Under what conditions does the order change?
<details>
  <summary>Show answer</summary>

**It depends on download timing.**
Async script runs **when ready**.
- If it downloads early, it can run **before** DOM is parsed -> fires **before** DOMContentLoaded.
- If downloads slowly, it can run **after** DOMContentLoaded.
This is why async is unsafe for dependencies.

</details>

### Does async guarantee that the DOM is fully parsed before the script runs?
<details>
  <summary>Show answer</summary>

**No.**
`async` scripts execute as soon as the file downloads, which can be before, during, or after DOM parsing.
Execution order is **unpredictable**.

</details>

### When does body-end inline script run?
<details>
  <summary>Show answer</summary>

- After all DOM content above is parsed
- Equivalent to `DOMContentLoaded` for everything above it

</details>

### Body-end inline script, pros and cons
<details>
  <summary>Show answer</summary>

Pros
* Predictable
* Simple
* Most common before ES6 modules

Cons
* Mixing HTML + JS considered bad practice today
* Harder to maintain

</details>

### If a script is placed at the end of <body>, does it always guarantee DOM availability? Why or why not?
<details>
  <summary>Show answer</summary>

**Usually yes, but not always.**

Possible exceptions:
* If HTML is malformed and parsing aborted early
* If the script runs before the parser constructs certain nodes (rare streaming behavior)
* If the element is inserted dynamically and the script executes during insertion

But **normally**, bottom‑of‑body means **safe access to all previous DOM nodes**.

</details>

### What happens when using `async` for scripts that depend on others?
<details>
  <summary>Show answer</summary>

Race conditions

</details>

### If you dynamically insert x.js into the DOM, does it behave like async, defer, or something else?
<details>
  <summary>Show answer</summary>

* Behaves like async.
* Executes immediately after load
* No guarantee of order

</details>

### Dynamic defer scripts
<details>
  <summary>Show answer</summary>

Not possible. You can’t give a dynamically created classic `<script>` true defer semantics.
Dynamic classic scripts are treated as async by default (because they’re not parser‑inserted), 
and setting `defer` on them doesn’t make them “run after parsing, in order” like real deferred scripts.
Red flag to think dynamic defer exists (it does not).

</details>

### How it works if you dynamically create a `<script defer>` element?
<details>
  <summary>Show answer</summary>

**No.**
Dynamic scripts ignore `defer`, behaving like `async`.

</details>

### Does adding await inside an IIFE affect when the outer script finishes?
<details>
  <summary>Show answer</summary>

todo
**Yes.**
The outer script finishes parsing immediately, but the async IIFE continues in microtasks later.
The script tag completes, but the IIFE does not.

Putting `await` inside an async IIFE does not delay the outer script’s completion or DOM parsing. 
The IIFE starts, hits `await`, yields back to the event loop, and the rest of the outer script runs immediately. 
The awaited continuation runs later (as a microtask) when the promise settles.

</details>

### In a module script, when does top‑level code run relative to DOMContentLoaded and defer scripts?
<details>
  <summary>Show answer</summary>

**After DOM is parsed, before DOMContentLoaded.**
Modules behave like defer by default.

</details>

### Why does inline script inside <body> run even if async is set on other scripts?
<details>
  <summary>Show answer</summary>

Async affects external scripts only.
Inline scripts always execute immediately when parsed.

</details>

### What JS execution way to choose
<details>
  <summary>Show answer</summary>

#### to avoid global variable leaks

- [Recommended patterns on deferred script implementation](JS_Code_Execution.md#recommended-patterns-on-deferred-script-implementation)
- [IIFE](JS_Code_Execution.md#iife)

#### for scripts without dependencies

- [`async` JavaScript](JS_Code_Execution.md#async-javascript)

#### for code that needs images/layout

- [Use deferred script execution but with the window onload event](JS_Code_Execution.md#deferred-script-execution-if-you-need-access-to-the-loaded-resources-like-image)
- [Use the window onload event](JS_Code_Execution.md#the-window-onload-event)

#### for ES modules

- [IIFE](JS_Code_Execution.md#iife)

#### to handle UI logic

- [Use deferred script execution](JS_Code_Execution.md#deferred-script-execution-if-you-need-access-to-fully-loaded-dom)
- [DOMContentLoaded event](JS_Code_Execution.md#domcontentloaded-event)

#### to wrap code in module-style scope

- [Recommended patterns on deferred script implementation](JS_Code_Execution.md#recommended-patterns-on-deferred-script-implementation)
- [IIFE](JS_Code_Execution.md#iife)

#### for loading third‑party analytics

- [`async` JavaScript](JS_Code_Execution.md#async-javascript)

</details>

### Evaluate this code’s execution order — explain why
<details>
  <summary>Show answer</summary>

```html
<script>
  console.log("A");
</script>

<script async src="b.js"></script>

<script defer src="c.js"></script>

<script>
  console.log("D");
</script>
```

* “A” → inline scripts execute immediately
* async script b.js executes whenever download finishes
* defer script c.js executes after DOM parse
* “D” executes immediately

</details>

### sandboxed iframes
<details>
  <summary>Show answer</summary>

sandbox="allow-scripts" → no DOM access
origin = “null”
postMessage needed
Red flag: thinks sandbox affects execution timing.

</details>

### How does JavaScript behave differently inside a sandboxed iframe (sandbox="allow-scripts")?
<details>
  <summary>Show answer</summary>

* Origin becomes “null”
* Script executes normally but with limitations
* No access to parent DOM
* postMessage is necessary

</details>

### Why does an inline script inside a sandboxed iframe still execute immediately?
<details>
  <summary>Show answer</summary>

* Sandbox affects capabilities, not timing
* Execution order still follows HTML parsing rules

</details>

### Does a sandboxed iframe affect JavaScript execution timing? Or only capabilities?
<details>
  <summary>Show answer</summary>

**Only capabilities.**
Timing is unaffected.
Sandbox does not change parsing or execution order.

</details>

### Does a `<script>` in an iframe load faster or slower than the same script on the parent page?
<details>
  <summary>Show answer</summary>

**Often slower.** Because:
* Browsers deprioritize iframe network requests
* Preload scanner is less aggressive inside iframes
* Sandbox reduces heuristics

</details>

### Ability to reason through trick edge cases
<details>
  <summary>Show answer</summary>

Examples:
async vs DOMContentLoaded races
modules + top-level await
inline + async interactions
dynamically inserted scripts
Red flag: guesses instead of reasoning.

</details>

### Understanding postMessage security
<details>
  <summary>Show answer</summary>

Expected:
Must validate event.origin
Knows opaque origins (“null”)
Understands no DOM/JS access
Red flag: using * without validation.

</details>

### Write code that waits for DOM to be ready without using any event listeners.
<details>
  <summary>Show answer</summary>

1. Using `<script defer>`
2. Using `<script type="module">`
3. Placing script at bottom of `<body>`

</details>

### Write code that guarantees execution only after all images finish loading
<details>
  <summary>Show answer</summary>

1. window.onload
2. Promises with img.onload

</details>

</details>

---

