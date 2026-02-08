
# JS Trigger Demo (Quick-Recall)

Purpose: When you return to JS after a break, open `index.html` and quickly compare the common ways JavaScript executes/gets triggered. Each case is tiny, labeled, and logs to the on-page console.

## How to use
- Open `index.html` in a browser. Scroll and click the buttons to see logs.
- Or open a focused page under `/cases` for one pattern at a time.

## Covered patterns
1. Inline `<script>` at end of `<body>`
2. `<script defer>` in `<head>`
3. `<script async>` in `<head>`
4. External script in `<body>` (no `defer/async`)
5. `DOMContentLoaded` listener
6. `window.load` listener
7. HTML event attributes (`onclick`, etc.)
8. `addEventListener` for DOM events
9. ES Modules: `<script type="module">` + import
10. Dynamic script injection (programmatic)
11. IIFE (Immediately Invoked Function Expression)
12. `setTimeout` (micro/async demo)
13. `Promise.then` / microtask ordering note
14. `MutationObserver` as a reactive trigger

Each case writes to the visual log and console with a shared helper.

