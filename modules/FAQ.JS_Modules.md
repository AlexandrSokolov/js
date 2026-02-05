### ES Modules execution

* Modules are defer-like
* Top-level await behavior
* Module scope isolation

**Red flag**: thinks modules are security isolation **(wrong)**.

### Understanding ES Modules execution
Expected:
Modules are defer-like
Top-level await behavior
Module scope isolation
Red flag: thinks modules are security isolation (wrong).

TODO:
- Understands defer-like timing
- Understands TLA & module scope
- Explains dependency graph loading

### What execution guarantees does `<script type="module">` provide? How does it compare to defer?

* Modules behave as `defer` by default.
* Async loading but deferred execution
* Module script top-level variables are not global

### Does `await` inside top‑level ES modules block DOM parsing?

**No.**
HTML parsing does not wait for async module execution.
The module executes after download, but top‑level await only blocks **the module’s export availability**, not DOM creation.

### Knows module replacement patterns (ESM > IIFE)

