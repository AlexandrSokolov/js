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

###

    <div class="case">
      <h2>CASE 14 – MutationObserver trigger</h2>
      <button id="btn-mutate">Mutate DOM</button>
    </div>

  <!--
    CASE 14: MutationObserver
    - Observes DOM changes and reacts when mutations occur.
  -->
  <script>
    (function(){
      const target = document.getElementById('vlog');
      const mo = new MutationObserver(() => {
        // Debounce a little; stamp once per mutation batch
        __demo.stamp('CASE 14: MutationObserver noticed change');
      });
      mo.observe(target, { childList: true });
      document.getElementById('btn-mutate').addEventListener('click', () => {
        const x = document.createElement('div');
        x.textContent = 'DOM mutated at ' + new Date().toLocaleTimeString();
        target.appendChild(x);
      });
    })();
  </script>