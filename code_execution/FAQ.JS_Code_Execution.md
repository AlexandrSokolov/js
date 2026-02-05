The JavaScript event loop
- [Macro‑tasks in JS](#macrotasks-in-js)
- [Micro-tasks in JS](#micro-tasks-in-js)
- [The JavaScript event loop, what must you care about?](#the-javascript-event-loop-what-must-you-care-about)
- [fetch’s networking, type of task](#fetchs-networking-type-of-task)
- [Describe a code snippet #1](#describe-a-code-snippet-1)
- [Describe a code snippet #2](#describe-a-code-snippet-2)

Browser Rendering Behaviour
- [Can CSS affect JS?](#can-css-affect-js)
- [Does JS affect rendering?](#does-js-affect-rendering)
- [What does it mean when developers say "the DOM is ready"? How do you detect it?](#what-does-it-mean-when-developers-say-the-dom-is-ready-how-do-you-detect-it)
- [How does `<script>` impact page performance](#how-does-script-impact-page-performance)
- [Module scripts, do they block HTML parsing?](#module-scripts-do-they-block-html-parsing)
- [Module vs deferred scripts](#module-vs-deferred-scripts)
- [What’s the difference in execution between the scripts](#whats-the-difference-in-execution-between-the-scripts)
- [Describe a code snippet #3](#describe-a-code-snippet-3)
- [Does placing a <script> inside a <template> element block the DOM parser?](#does-placing-a-script-inside-a-template-element-block-the-dom-parser)
- [If a script throws an error during execution, does the browser continue parsing HTML afterward?](#if-a-script-throws-an-error-during-execution-does-the-browser-continue-parsing-html-afterward)
- [Does `await` inside top‑level ES modules block DOM parsing?](#does-await-inside-toplevel-es-modules-block-dom-parsing)
- [Using `document.write()` in JavaScript code](#using-documentwrite-in-javascript-code)

`window.onload` and `DOMContentLoaded`
- [When does `window.onload = function (...) { ... }` run?](#when-does-windowonload--function-----run)
- [The window onload event for code triggering, its pros, cons, when to use it?](#the-window-onload-event-for-code-triggering-its-pros-cons-when-to-use-it)
- [Does window.onload always wait for CSS files? Fonts? Iframes? Videos?](#does-windowonload-always-wait-for-css-files-fonts-iframes-videos)
- [When does DOMContentLoaded event run?](#when-does-domcontentloaded-event-run)
- [DOMContentLoaded event for code triggering, its pros, cons, when to use it?](#domcontentloaded-event-for-code-triggering-its-pros-cons-when-to-use-it)
- [Does DOMContentLoaded fire again if new DOM elements are added later?](#does-domcontentloaded-fire-again-if-new-dom-elements-are-added-later)
- [What happens if you add a DOMContentLoaded listener after the event has already fired?](#what-happens-if-you-add-a-domcontentloaded-listener-after-the-event-has-already-fired)
- [DOMContentLoaded vs window.onload](#domcontentloaded-vs-windowonload)
- [If a page has no external resources, do DOMContentLoaded and onload fire at the same time?](#if-a-page-has-no-external-resources-do-domcontentloaded-and-onload-fire-at-the-same-time)
- [Describe a real scenario where using window.onload is required and using DOMContentLoaded is insufficient](#describe-a-real-scenario-where-using-windowonload-is-required-and-using-domcontentloaded-is-insufficient)
- [What happens when using window.onload for everything?](#what-happens-when-using-windowonload-for-everything)
- [If a script is blocked by CSP, does DOMContentLoaded wait for it?](#if-a-script-is-blocked-by-csp-does-domcontentloaded-wait-for-it)


JS using by the caller
- [What is an IIFE? How does execution timing differ from event‑based approaches?](#what-is-an-iife-how-does-execution-timing-differ-from-eventbased-approaches)
- [When does IIFE run?](#when-does-iife-run)
- [IIFE pros, cons, when to use it?](#iife-pros-cons-when-to-use-it)
- [Can code inside an IIFE safely interact with DOM elements? Under what conditions?](#can-code-inside-an-iife-safely-interact-with-dom-elements-under-what-conditions)
- [IIFE and DOM](#iife-and-dom)
- [If you use an IIFE at the top of <head>, when exactly does it run relative to DOM parsing?](#if-you-use-an-iife-at-the-top-of-head-when-exactly-does-it-run-relative-to-dom-parsing)
- [Can a Promise callback run before an IIFE that appears later in the same script?](#can-a-promise-callback-run-before-an-iife-that-appears-later-in-the-same-script)
- [Explain the difference between async and defer when loading external scripts, when to use them?](#explain-the-difference-between-async-and-defer-when-loading-external-scripts-when-to-use-them)
- [Which loads and executes first: async or defer?](#which-loads-and-executes-first-async-or-defer)
- [When does deferred script run?](#when-does-deferred-script-run)
- [Deferred script execution, pros, cons, when to use it?](#deferred-script-execution-pros-cons-when-to-use-it)
- [Can you defer inline scripts?](#can-you-defer-inline-scripts)
- []()
- []()
- []()
- []()

## The JavaScript event loop

### Macro‑tasks in JS

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

### Micro-tasks in JS

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

### The JavaScript event loop, what must you care about?

You must understand how micro-tasks and macro-tasks affect rendering.

Each cycle of the JavaScript event loop looks like:
1. Take one macro-task
2. execute it fully
3. run all micro-tasks
4. render UI if needed
5. go to next macro-task

Because micro-tasks run before the next macro‑task and before rendering, 
micro‑tasks can delay rendering if you schedule too many.

### fetch’s networking, type of task

fetch’s networking is not a task. 

1. Network happens outside the JS task queues.
   The browser’s networking engine is not part of macro/micro tasks.
2. When response is ready → promise fulfills.
   This does not push a macro-task.
3. Promise fulfillment schedules a micro‑task.
   This is where your .then() runs.
   So the part that you write (the callback) is always a micro‑task.

### Describe a code snippet #1

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
Output:
```text
start
end
micro
macro
```
“micro” runs before timers because micro‑tasks flush before the event loop picks the next macro‑task.

### Describe a code snippet #2

```javascript
console.log("start");

setTimeout(() => console.log("timeout"), 0);

fetch("https://example.com")
  .then(() => console.log("fetch-microtask"));

console.log("end");
```
Output:
```text
start
end
fetch-microtask
timeout
```

___ 

## Browser Rendering Behaviour

### Can CSS affect JS?

Browser loads and parses all CSS -> builds the CSS Object Model. 
CSS is render‑blocking. 
CSS can delay JS execution

**Red flag**: _CSS never blocks JS_.

CSS loading can block JavaScript execution if:
* The script reads CSSOM
* The script manipulates elements dependent on styles
* The browser defers execution to avoid forced reflow
  CSS is **render‑blocking**, and JS often interacts with layout.

### Does JS affect rendering?

JS blocks DOM Construction (and rendering as a result) unless async/defer.

### What does it mean when developers say "the DOM is ready"? How do you detect it?

* DOM tree is built
* Doesn’t require images/fonts
* Achieved via DOMContentLoaded or deferred script

### How does `<script>` impact page performance

* Every blocking script stops HTML parsing unless async/defer
* Defer is recommended for most cases
* Async avoids blocking but risks execution disorder
* Inline scripts run immediately and always block

### Module scripts, do they block HTML parsing?

You use module scripts when you include a `<script type="module">`
Do they block HTML parsing?
**No.**
Modules behave like `defer` by default:
* Download in parallel - Async loading but deferred execution
* Execute after DOM parse
* Do not block 

### Module vs deferred scripts

Modules behave like `defer` by default.

### What’s the difference in execution between the scripts

1. Inline `<script>` in <head>
2. Inline `<script>` at bottom of body
3. External script with defer
4. External script with async


| Script Type                          | When It Executes                           | Blocks HTML Parsing? | Execution Order Guaranteed? | DOM Ready When It Runs?   | DOMContentLoaded Behavior |
|--------------------------------------|--------------------------------------------|----------------------|-----------------------------|---------------------------|---------------------------|
| Inline `<script>` in `<head>`        | Immediately when parser reaches it         | **Yes**              | Yes (source order)          | ❌ Usually not             | Delayed (parser blocked)  |
| Inline `<script>` at end of `<body>` | Immediately when parser reaches it         | **Yes** (briefly)    | Yes (source order)          | ✔️ Yes (DOM mostly built) | Runs right before DCL     |
| External script with `defer`         | After HTML parse, before DOMContentLoaded  | ❌ No                 | ✔️ Yes (document order)     | ✔️ Yes                    | DCL waits for all defer   |
| External script with `async`         | As soon as downloaded (unpredictable time) | ❌ Download; ✔️ Exec  | ❌ No order                  | ❓ Maybe (not guaranteed)  | DCL does **not** wait     |

### Describe a code snippet #3

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

### Does placing a <script> inside a <template> element block the DOM parser?

**No.**
Contents inside <template> aren’t executed; they’re inert DOM.
Scripts inside templates don’t run until extracted.

### If a script throws an error during execution, does the browser continue parsing HTML afterward?

**Yes.**
A JS runtime error does **not** stop HTML parsing.
Only fatal parser errors (rare malformed <script> tags) stop parsing.

### Does `await` inside top‑level ES modules block DOM parsing?

**No.**
HTML parsing does not wait for async module execution.
The module executes after download, but top‑level await only blocks **the module’s export availability**, not DOM creation.

### Using `document.write()` in JavaScript code

`document.write()` breaks execution flow

1. Re-parses document
2. Removes existing DOM
3. Blocks everything
4. Should never be used

---

## `onload` and DOMContentLoaded

### When does `window.onload = function (...) { ... }` run?

After EVERYTHING has loaded, including:
* DOM
* CSS
* Images
* Fonts
* Iframes
* Videos

### The window onload event for code triggering, its pros, cons, when to use it?

**Pros**
* Guarantees the whole page is ready
* Good for scripts needing full layout, image dimensions, etc.


**Cons**
* Fires late
* Slows initial interactivity if used for UI initialization

**When to use:**

When your code needs images or external resources to be fully loaded
(e.g., calculating element sizes after images load).

### Does window.onload always wait for CSS files? Fonts? Iframes? Videos?

**Yes for:**
* CSS
* Images
* Iframes
* Scripts
* Videos metadata

**No for:**
* Fonts that load via `font-display: swap`
* Media without preload
* Prefetched resources

### When does DOMContentLoaded event run?

When the DOM tree is fully parsed, **but before**:
* Images
* Fonts
* Videos
* Stylesheets

### DOMContentLoaded event for code triggering, its pros, cons, when to use it?

**Pros**
* Fires earlier than window.onload
* Standard modern way to run initialization code

**Cons**
* Doesn’t wait for images to load

**When to use:**
* Almost always for UI logic
* When you only need the DOM structure, not images

### Does DOMContentLoaded fire again if new DOM elements are added later?

No.
`DOMContentLoaded` fires exactly once, when the initial HTML has been parsed.
Mutating the DOM later does not retrigger lifecycle events.

### What happens if you add a DOMContentLoaded listener after the event has already fired?

**It will execute immediately.**
The event is not lost; it runs synchronously when added.

### DOMContentLoaded vs window.onload

* DOMContentLoaded = DOM parsed
* onload = all resources loaded
* Understand implications for performance and UI init

Explains timing + practical use cases
Mentions edge cases (CSS blocking, zero-resource pages)

### If a page has no external resources, do DOMContentLoaded and onload fire at the same time?

**Yes.**
If there are literally no external loads (images, CSS, fonts), both fire almost simultaneously.

### Describe a real scenario where using window.onload is required and using DOMContentLoaded is insufficient

* Measuring final image dimensions
* Canvas sizing after load
* Layout depending on external font load (unless font‑loading API used)

### What happens when using window.onload for everything?

It slows page.

### If a script is blocked by CSP, does DOMContentLoaded wait for it?

**No.**
Blocked script is treated as if it failed instantly.
DOMContentLoaded does not wait.

---

## JS using by the caller

### What is an IIFE? How does execution timing differ from event‑based approaches?

* Runs immediately at parse time
* DOM may not exist yet
* Good for scoping, modules, initialization logic that doesn’t depend on the DOM

### When does IIFE run?

**Immediately**, as soon as the `<script>` tag is executed.

### IIFE pros, cons, when to use it?

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

### Can code inside an IIFE safely interact with DOM elements? Under what conditions?

* Only if script is placed after DOM elements or loaded with defer
* Otherwise requires DOMContentLoaded

### IIFE and DOM

IIFE does not wait DOM. When DOM is needed place `<script>` at the end of `<body>`.

### If you use an IIFE at the top of <head>, when exactly does it run relative to DOM parsing?

**Immediately during parsing of the <head>, before any body parsing happens.**
- HTML parsing stops while the script runs.
- DOM is usually incomplete at that moment.

### Can a Promise callback run before an IIFE that appears later in the same script?

**No.**
Script executes top‑down:
* IIFE executes immediately
* Only after script finishes do microtasks run (promise callbacks)

### Explain the difference between async and defer when loading external scripts, when to use them?

* async = runs immediately after download, unpredictable order
* defer = ordered, waits until DOM parse finishes and only then runs

Use them:
* async: analytics, ads, third‑party scripts
* defer: core app scripts, modules

### Which loads and executes first: async or defer?

**async always wins if it downloads first.**
Order:
* async runs ASAP (before or after parsing)
* defer waits until DOM parse finishes

- Async ignores order.
- Defer preserves order.

### When does deferred script run?

* Runs after HTML is parsed
* Runs before DOMContentLoaded
* Scripts keep execution order

### Deferred script execution, pros, cons, when to use it?

**Pros**
* Best for page performance (never block the page)
* Fully safe to operate on DOM
* No need for DOMContentLoaded listener
* Executes in predictable order

**Cons**

None really.

For most modern apps, using `<script defer>` is the best practice.

### Can a script with defer block rendering?

**No.**
Deferred scripts do not block rendering or parsing.

### If you include three <script defer> tags, what determines their execution order? What could break that order?

**Their order in the HTML determines execution.**
What can break it?
* Failed requests
* Redirect loops
* Network error → script never executes
* Extremely slow download (can delay execution but not re‑order)

### In which situations can a deferred script run BEFORE DOMContentLoaded, and when can it run AFTER?
**Normally defer runs before DOMContentLoaded.**
But it can run after if:
* The deferred script downloads slowly
* The browser encounters blocking CSS that delays script execution
* Browser throttles network or deprioritizes scripts
  Guarantee:
  **Defer runs before DOMContentLoaded, unless download finishes late.**

### Can you defer inline scripts?

`defer` doesn’t work for inline scripts, 
you can achieve the same effect by wrapping your code inside the DOMContentLoaded event listener:
```javascript
<script>
  document.addEventListener("DOMContentLoaded", () => {
    // Inline script
  });
</script>
```


### When does `async` JavaScript run?

* As soon as the script downloads
* Execution order is NOT guaranteed
* Does not block rendering

### `async` JavaScript pros, cons, when to use it?

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

### Which runs first: an `async` script or a `DOMContentLoaded` handler? Under what conditions does the order change?

**It depends on download timing.**
Async script runs **when ready**.
- If it downloads early, it can run **before** DOM is parsed -> fires **before** DOMContentLoaded.
- If downloads slowly, it can run **after** DOMContentLoaded.
This is why async is unsafe for dependencies.

### Does async guarantee that the DOM is fully parsed before the script runs?

**No.**
`async` scripts execute as soon as the file downloads, which can be before, during, or after DOM parsing.
Execution order is **unpredictable**.


### When does body-end inline script run?

- After all DOM content above is parsed
- Equivalent to `DOMContentLoaded` for everything above it

### Body-end inline script, pros and cons

Pros
* Predictable
* Simple
* Most common before ES6 modules

Cons
* Mixing HTML + JS considered bad practice today
* Harder to maintain

### If a script is placed at the end of <body>, does it always guarantee DOM availability? Why or why not?

**Usually yes, but not always.**

Possible exceptions:
* If HTML is malformed and parsing aborted early
* If the script runs before the parser constructs certain nodes (rare streaming behavior)
* If the element is inserted dynamically and the script executes during insertion

But **normally**, bottom‑of‑body means **safe access to all previous DOM nodes**.






### What happens when using `async` for scripts that depend on others?

Race conditions

### Explain the difference between `window.onload` and `DOMContentLoaded`. When does each fire? What does each wait for?

* DOMContentLoaded fires when DOM is parsed
* window.onload fires when all resources (images, fonts, iframes) finished loading
* Performance implications of choosing one or the other

### What happens when the browser encounters a <script> tag during HTML parsing?

* Parsing halts
* Script executes immediately (unless async/defer)
* DOM stops building

### dynamic script insertion

Behaves like async
Executes immediately after load
No guarantee of order
Red flag: thinks dynamic defer exists (it does not).

### If you dynamically insert x.js into the DOM, does it behave like async, defer, or something else?

**It behaves like async.**
Dynamic external scripts always execute immediately after download, in no guaranteed order.

### If you dynamically create a <script defer> element, does it behave like a real defer script?

**No.**
Dynamic scripts ignore `defer`, behaving like `async`.

### Does the browser guarantee that an inline script runs after all preceding DOM nodes are created?

**Yes.**
Inline scripts run exactly when the parser reaches them, meaning DOM nodes up to that point exist.


### Does an async script block other async scripts? What about defer? Inline?

* Async: No, completely independent.
* Defer: Yes — defer scripts maintain HTML order.
* Inline: Inline scripts block parsing and delay both async and defer execution until they finish.

### Does adding await inside an IIFE affect when the outer script finishes?

**Yes.**
The outer script finishes parsing immediately, but the async IIFE continues in microtasks later.
The script tag completes, but the IIFE does not.

### In a module script, when does top‑level code run relative to DOMContentLoaded and defer scripts?

**After DOM is parsed, before DOMContentLoaded.**
Modules behave like defer by default.

### Why does inline script inside <body> run even if async is set on other scripts?

Async affects external scripts only.
Inline scripts always execute immediately when parsed.

## What JS execution way to choose:

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

### Evaluate this code’s execution order — explain why

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

### sandboxed iframes

sandbox="allow-scripts" → no DOM access
origin = “null”
postMessage needed
Red flag: thinks sandbox affects execution timing.

### How does JavaScript behave differently inside a sandboxed iframe (sandbox="allow-scripts")?

* Origin becomes “null”
* Script executes normally but with limitations
* No access to parent DOM
* postMessage is necessary

### Why does an inline script inside a sandboxed iframe still execute immediately?

* Sandbox affects capabilities, not timing
* Execution order still follows HTML parsing rules

### Does a sandboxed iframe affect JavaScript execution timing? Or only capabilities?

**Only capabilities.**
Timing is unaffected.
Sandbox does not change parsing or execution order.

### Does a <script> in an iframe load faster or slower than the same script on the parent page?

**Often slower.** Because:
* Browsers deprioritize iframe network requests
* Preload scanner is less aggressive inside iframes
* Sandbox reduces heuristics

### Ability to reason through trick edge cases

Examples:
async vs DOMContentLoaded races
modules + top-level await
inline + async interactions
dynamically inserted scripts
Red flag: guesses instead of reasoning.

### Understanding postMessage security
Expected:
Must validate event.origin
Knows opaque origins (“null”)
Understands no DOM/JS access
Red flag: using * without validation.

### Write code that waits for DOM to be ready without using any event listeners.

1. Using <script defer>
2. Using <script type="module">
3. Placing script at bottom of <body>

### Write code that guarantees execution only after all images finish loading

1. window.onload
2. Promises with img.onload

