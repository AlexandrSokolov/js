### setTimeout

Red flag: thinks setTimeout(0) is “immediate”.

### Does setTimeout(fn, 0) run before or after microtasks?

**After.**
Microtasks (Promises, MutationObserver) run before the event loop moves to the next macrotask.


### If your script relies on DOM APIs but you include it in <head>, what is the minimal requirement to ensure it can safely run?

The minimal requirement to ensure it can safely run. Any of these:
* Use `defer`
* Wait for `DOMContentLoaded`
* Move script to end of body
* Wrap in an event listener for DOMContentLoaded

### 

❌ Not understanding difference between parse-time vs runtime execution
❌ Not understanding that a <script> always pauses HTML parsing


### How browsers and Node.js event loops differ (Node has multiple microtask queues)

### How rendering phases interact with tasks

### Discusses parser halting behavior

### Explains streaming parser nuances

### Mentions browser preload scanner & timing races