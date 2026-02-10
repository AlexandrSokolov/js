
# JavaScript — Passing Parameters to JS (Same‑Origin / Same‑Context)

## URL Parameters & Hash
<details><summary><strong>Show questions</strong></summary>

### URL Parameters, what are they? Show examples
<details><summary>Show answer</summary>

URL parameters - or query parameters - are part of the URL sent to the server. 
Example:
`https://example.com/page?user=alex&id=123&mode=dark`
</details>

### URL Parameters, what are they used for?
<details><summary>Show answer</summary>

They Used for:
- server-readable parameters
- SEO
</details>

### How to change request params? What happens in this case?
<details><summary>Show answer</summary>

Change the query string → trigger a page reload and send a request to the server:
- edit url params in address bar, manually by user
- `location.search = "?foo=123";`
- `window.location = "?foo=123";`

Update it programmatically:
```js
const url = new URL(window.location.href);
// change the path
url.pathname = "/dashboard";
// update/add a query param
url.searchParams.set("view", "compact");
// navigate to the new path + query
window.location = url.toString();  // full page reload
```
</details>

### Hash parameters, what are they? Show examples
<details><summary>Show answer</summary>

Hash parameters:
- Simple fragment (no-value): https://example.com/page#section2
- Multiple values: https://example.com/page#view=details&item=42
- Hash-style routing: https://example.com/app#/dashboard
</details>

### Hash parameters, what are they used for?
<details><summary>Show answer</summary>

Used for: 
- Client‑Side State - data the UI needs. It’s just state inside the current view, not a “location” in the application.
  - https://example.com/editor#file=main.js&line=120
- Client‑Side Routing for SPA - to represent a route and determines what component is displayed 
  without reloading the server page. Examples:
  - https://example.com/app#dashboard
  - https://example.com/app#settings
  - https://example.com/app#profile/123
</details>

### How to change hash params? What happens in this case?
<details><summary>Show answer</summary>

- edit params in address bar, manually by user
- `location.hash = "foo=123&bar=456";` - update the hash without reloading the page

Update it programmatically:
```js
const hash = new URLSearchParams(location.hash.slice(1));
hash.set("foo", "123");
location.hash = hash.toString();
```

If you change only hash parameters, page will not be reloaded and request is not sent to the server.
</details>

### Differences between query params and hash
<details><summary>Show answer</summary>

Changing query parameters:
- Triggers Full Navigation
- Sends Network Request

Changing hash params is client-only - triggers only `hashchange` event.

</details>

### What if URL contains multiple `?`?
<details><summary>Show answer</summary>
Browsers treat the first `?` as separator; additional ones treated as part of query. 
</details>

### What if URL contains malformed encoding?
<details><summary>Show answer</summary>
Invalid encoding (`%ZZ`) may throw on `URL()`.
</details>

### When incorporating `new URL(location.href)` into your code, what considerations might apply?
<details><summary>Show answer</summary>
URL parsing is non-trivial; avoid creating many URL objects inside scroll/resize handlers.
</details>

### What happens when you modify `location.search` vs `location.hash`?
<details><summary>Show answer</summary>
Modifying `location.search` triggers a navigation; modifying `location.hash` does not.
</details>

### Describe a code snippet #1
<details>
  <summary>Show details</summary>

<details><summary>Show code</summary>

```js
const url = new URL("https://example.com/page?x=1#y=2");
url.searchParams.set("x", "10");
url.hash = "#changed";
console.log(url.toString());
```
</details>

<details><summary>Show answer</summary>

`https://example.com/page?x=10#changed` because modifying URL object does not mutate browser location.
</details>

</details>

</details>

---

## Navigation in SPAs
<details>
  <summary><strong>Show questions</strong></summary>

### Changing URL without page reloading and requests sending
<details><summary>Show answer</summary>

- You can change URL (and query parameters) without reloading the page using `window.history`.
- `window.history` is the browser’s API to manipulate the session history stack —
  basically the list of pages the user has visited in the current tab.
- Navigate inside a JS app while keeping browser navigation (back, forward, reload, bookmarks) working naturally —
  without page reloads, without network requests. Only the URL bar changes.
- It is used heavily by SPAs.
</details>

### `history` API
<details>
  <summary>Show answer</summary>

- `history.pushState({page: 2}, "", "?page=2");`
  - Adds a new entry to the history stack
  - Back button will return to the previous state
- `history.replaceState({page: 3}, "", "?page=3");`
  - Modifies the current entry (no new history entry)
  - Back button will NOT step through these changes

</details>

### Groups of use cases for changing URL without page reloading
<details><summary>Show answer</summary>

- [Silent updates](#silent-updates-idea-and-use-cases)
- []
</details>

### Silent updates, idea and use cases
<details><summary>Show answer</summary>

Silent updates (filters, live UI changes):
- The UI changes, but it is not a “new page”.
- You do not want to add history entries.
- You do not want the user’s Back button to undo small UI changes.
  You just want the URL to reflect the current state.

Typical use cases:
- [**Filters** (e.g., product list, search results)](#silent-updates-for-filters)
- [**Live UI state** (sliders, toggles, dropdowns)](#silent-updates---live-ui-state-sliders-toggles-dropdowns)
</details>

### Silent updates for filters
<details><summary>Show answer</summary>

Filters e.g., product list, search results

1. User changes filters: category=shoes, price=0-100.
2. These are not “pages”, just state adjustments.

You want:
- No reload
- No new history entries
- URL updated

So the user can bookmark or share the filtered view.
```js
history.replaceState(null, "", "?category=shoes&price=0-100");
```

- User opens: `/products?page=1`
- They filter by color → change query: `history.pushState({filters: ['red']}, "", "?page=1&color=red");`
  - Back button returns to page without filter
  - Bookmark reloads correct state
- They open product details modal (UI only): `location.hash = "#modal=42";`
  - Back button closes modal
  - Reload removes modal → good UX
  - Server doesn’t care about modal state

This is the ideal separation:
- Query = meaningful content state
- Hash = UI presentation state


</details>

### Silent updates - **Live UI state** (sliders, toggles, dropdowns)

<details><summary>Show answer</summary>

As the user interacts with the UI:
- Adjusting a slider
- Typing into a search box
- Checking a checkbox
- Changing a sort order

You don’t want:
- A reload
- History spam
- Back button becoming unusable
```js
history.replaceState(null, "", url);
```
</details>

### Navigation-like behavior, idea and use cases
<details><summary>Show answer</summary>

This refers to situations where:
- The UI switches sections
- It feels like a new page
- The Back button should take you back
- The change is meaningful navigation

Typical use cases:
- [Pages without reload](#navigation-like-behavior---pages-without-reload)
- [Tabs in a UI](#navigation-like-behavior---tabs-in-a-ui)
- [Multi-step flows](#navigation-like-behavior---multi-step-flows)
- [Client-side routing](#navigation-like-behavior---client-side-routing)
</details>

### Navigation-like behavior - Pages without reload
<details><summary>Show answer</summary>

- Your SPA loads page 1: `/products?page=1`
- User clicks “Next page” → you load data via `fetch`, NOT page reload.
- Then: `history.pushState({page: 2}, "", "?page=2");`

Now:
- URL is updated
- Browser keeps a real navigation entry
- User can press Back → returns to ?page=1
- Bookmark works
- Reloading fetches the right data from server

</details>

### Navigation-like behavior - Tabs in a UI
<details><summary>Show answer</summary>

Tabs in a UI

Example:
- /settings?tab=profile
- /settings?tab=billing

Switch tabs → It feels like navigation.
```js
history.pushState(null, "", "?tab=billing");
```
Back button returns to previous tab — intuitive.
</details>

### Navigation-like behavior - Multi-step flows
<details><summary>Show answer</summary>

Multi-step flows
Like:

/checkout?step=delivery
/checkout?step=payment
/checkout?step=summary

Each step should feel like a new “page”.
Use pushState.
</details>
### Navigation-like behavior -
<details><summary>Show answer</summary>

</details>
### Navigation-like behavior -
<details><summary>Show answer</summary>

</details>

### Navigation-like behavior - client-side routing
<details><summary>Show answer</summary>

Client-side routing (SPA frameworks)

React, Vue, Angular use `pushState` to simulate page navigation.

</details>

### Using query parameters without page reload, is it possible? Motivation
Can you use query parameters for these use cases?
✔ Yes — query params are perfect for both cases.
Query params are great when:

State affects what is displayed
You want bookmarkable URLs
State logically belongs in the address bar
Order doesn’t matter
You want sharable URLs

Examples:
?sort=price&filter=red&tab=details
?page=3
?view=list

This is exactly how sites like Amazon, YouTube, and Google use them.

### Changing query parameters without page reload. Is it possible? Motivation
<details><summary>Show answer</summary>

You can change query parameters using `window.history` object:
- `history.replaceState()` - updates the URL without adding a new history entry, just replaces it
  ```js
  const url = new URL(window.location.href);
  url.searchParams.set("foo", "123");
  
  history.replaceState(null, "", url.toString());
  ```
  Used for: Silent updates (filters, live UI changes)
- `history.pushState()` - updates the URL and adds a new entry to browser history
  ```js
  const url = new URL(window.location.href);
  url.searchParams.set("foo", "123");
  
  history.pushState(null, "", url.toString());
  ```
  Used for: Navigation-like behavior (tabs, pages)
</details>

### Using hash parameters with `history`
✔ Yes — hash params can be used
👍 But with different implications
Hash parameters do not cause reload, but:

They do not go to the server
They are not considered part of “canonical URLs”
They trigger hashchange
They are great for scrolling, local sections, or light state

Examples:
#tab=3
#section=profile
#id=42

Hash changes using location.hash = "#foo" do NOT cause reloads.
But you can also use the History API with hashes:
history.pushState({tab: "info"}, "", "#info");
This is legal, but typically unnecessary since:

simply setting location.hash already changes the URL
and already adds history entries
and already works with the back button

So most SPAs use history only with real paths or query params, and leave hash for:

Scroll anchors
Tiny UI state
States that shouldn’t survive reload


### Using hash vs query parameters with `history`
🧩 When to use hash instead of query?
Use hash when:

State is purely client-side
It’s not important for SEO
You don’t want server involvement
“Tab-like” navigation is UI-only

For example:
myapp.com/page#panel=red

Good for settings in SPAs that don't need server routing.

🧩 When to use query instead of hash?
Use query params when:

The state affects what the server would load
You want shareable, canonical URLs
You want SEO
You want URL consistency
The state looks like “input” or “parameters”

Example:
/products?category=shoes&sort=price

### Event model: popstate vs hashchange
<details><summary>Show answer</summary>

popstate

- Fires on history traversal (Back/Forward/history.go()), not on pushState/replaceState.
- event.state contains the state object you stored in that history entry.
- Use it to restore the app state when the user navigates.
```js
window.addEventListener("popstate", (event) => {
  const url = new URL(location.href);
  const page = url.searchParams.get("page") ?? 1;
  const tab = url.hash.replace(/^#/, "") || "overview";
  restoreView({ page, tab, state: event.state });
});
```

hashchange:
- Fires whenever only the hash changes, regardless of traversal or direct modification:
  - location.hash = '#foo'
  - history.pushState(..., '#foo') (browser-dependent; see note below)
  - clicking on same‑page anchors
- event.oldURL / event.newURL are available.
```js
window.addEventListener("hashchange", (event) => {
  const tab = location.hash.slice(1) || "overview";
  openTab(tab);
});
```

**Practical note**: Because some apps change both query and hash at once via pushState, 
you may prefer **one single source of truth** 
(e.g., parse location in popstate and also in your own navigation function) 
rather than relying on hashchange firing consistently in all combinations. 
Many teams simply **avoid relying on hashchange** if they already use the History API, 
and instead _always_ call their own “render” function after any programmatic navigation.

</details>



### A robust pattern (single render path)
Goal:

A single function parses path + query + hash, and renders.
It’s called immediately after your own navigate() calls, and again inside popstate.

```js
function renderFromLocation() {
  const url = new URL(location.href);
  const page = Number(url.searchParams.get("page") ?? 1);
  const tab = url.hash.slice(1) || "overview";
  render({ page, tab });
}

function navigate({ page, tab, replace = false }) {
  const url = new URL(location.href);
  if (page !== undefined) url.searchParams.set("page", String(page));
  if (tab !== undefined) url.hash = `#${tab}`;

  const next = url.pathname + url.search + url.hash;
  const state = { page, tab };

  if (replace) history.replaceState(state, "", next);
  else history.pushState(state, "", next);

  // Explicit re-render (don’t wait for hashchange)
  renderFromLocation();
}

// Initial boot
renderFromLocation();

// Back/Forward
window.addEventListener("popstate", () => {
  renderFromLocation();
});
``
```
Why this works well:

No reliance on hashchange order/semantics.
Programmatic nav and traversal share the same render path.
State is recoverable via event.state if you want it, but you also recompute from URL to be resilient.

### Choosing which piece goes to query vs hash when combined with history

Prefer query for content state that must survive reloads/share/bookmarks and potentially be SSR’d (e.g., search, filters, pagination).
Prefer hash for UI affordances (open tab, modal, scroll anchor).
If your UI state is critical to content (e.g., subresource identity), it can also be query; then the UI should derive from query instead of hash.

In mixed scenarios:

Query drives data fetching and major navigation.
Hash drives within-page presentation (tabs/sections/modals).
pushState when you want Back to step through the changes; replaceState when you want a silent update (e.g., debounce typing in search box to avoid flooding the stack).

### Debounced search updates without polluting history

```js
const updateSearchDebounced = debounce((q) => {
  const url = new URL(location.href);
  url.searchParams.set("q", q);
  history.replaceState({ q }, "", url.pathname + url.search + location.hash);
  renderFromLocation();
}, 300);
```

### Pagination with Back/Forward support
```js
function goToPage(page) {
  const url = new URL(location.href);
  url.searchParams.set("page", String(page));
  history.pushState({ page }, "", url.pathname + url.search + location.hash);
  renderFromLocation();
}
```

### Tabs via hash, preserving page in query
```js
function openTab(tab) {
  const url = new URL(location.href);
  url.hash = `#${tab}`;
  history.pushState({ tab }, "", url.pathname + url.search + url.hash);
  renderFromLocation();
}
```

### Silent cosmetic fixes (don’t affect Back)
```js
function normalizeUrl() {
  const url = new URL(location.href);
  // e.g., remove empty query params
  for (const [k, v] of url.searchParams) {
    if (v === "") url.searchParams.delete(k);
  }
  history.replaceState(history.state, "", url.pathname + url.search + url.hash);
}
```

### Testing matrix (what fires?)

### Scroll restoration & UX add-ons
<details><summary>Show answer</summary>

- **Scroll position**: Browsers manage scroll positions per history entry.
- If you render content dynamically, consider restoring scroll yourself or use:
```js
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'; // you take control
}
```
- **Title updates**: Use document.title = "..." manually; the title param in pushState is ignored.
- **Analytics**: Fire a pageview after you call pushState/replaceState and after popstate.

</details>

### Constraints & pitfalls
<details><summary>Show answer</summary>

**Same-origin only**: The url you pass must be same-origin; otherwise, you’ll get a security error.
**No automatic sync between event.state and URL**: You control both; ensure they correspond.
**Back stack flooding**: Use replaceState for high-frequency changes (typing, sliders).
**Server support**: If users reload on a URL with query/path changes, the server should respond appropriately (SPA fallback or SSR). Hash is never sent to the server.
**hashchange reliance**: Avoid building logic that requires hashchange after pushState with combined changes; explicitly re-render instead.

</details>

### A tight example that uses both query and hash
<details><summary>Show answer</summary>

```js
function render({ page, tab }) {
  // 1) Fetch data based on page (query)
  // 2) Show specific tab (hash)
  // ...
}

function readState() {
  const u = new URL(location.href);
  return {
    page: Number(u.searchParams.get("page") ?? 1),
    tab: (u.hash.slice(1) || "overview"),
  };
}

function renderFromLocation() {
  render(readState());
}

function setPage(page, { replace = false } = {}) {
  const u = new URL(location.href);
  u.searchParams.set("page", String(page));
  const next = u.pathname + u.search + u.hash;
  const state = { ...readState(), page };

  (replace ? history.replaceState : history.pushState).call(history, state, "", next);
  renderFromLocation();
}

function setTab(tab, { replace = false } = {}) {
  const u = new URL(location.href);
  u.hash = `#${tab}`;
  const next = u.pathname + u.search + u.hash;
  const state = { ...readState(), tab };

  (replace ? history.replaceState : history.pushState).call(history, state, "", next);
  renderFromLocation();
}

// Init
renderFromLocation();

// Traversal
addEventListener("popstate", renderFromLocation);

// Optional: listen to hashchange only if you also support direct hash updates
addEventListener("hashchange", renderFromLocation);
```

</details>

### Decision cheatsheet (when used with History API)
<details><summary>Show answer</summary>

Use **pushState** for user-triggered navigations that should be traversable by Back/Forward.
Use **replaceState** for silent updates or high-frequency changes.
Use **query** for data-affecting state (search, filters, pagination).
Use **hash** for UI-only fragments (tabs, modals, in-page anchors).
**Render after your own nav; restore on popstate**; treat hashchange as optional.

</details>

</details>



---

## 2. HTML `data-*` Attributes

### **Q4 (Level 1): When use `data-*`?**
<details><summary>Show answer</summary>
For small server-provided config.
</details>

### **Q5 (Level 2 – Edge Case): How does dataset handle `data-json="{"x":1}"`?**
<details><summary>Show answer</summary>
Dataset stores raw string; JSON must be manually parsed.
</details>

### **Q6 (Level 3 – Performance): Performance impact of reading dataset repeatedly?**
<details><summary>Show answer</summary>
Dataset lookups are cheap, but repeated JSON.parse calls are expensive.
</details>

### **Q4: When are `data-*` attributes preferable over global variables?**
<details><summary>Show answer</summary>
When attaching small, serialized config to DOM elements, especially when rendering via server templates.
</details>

### **Q5: Corner Case — how does DOMStringMap convert names? (`data-user-id` → ?)**
<details><summary>Show answer</summary>
Hyphens become camelCase: `data-user-id` → `element.dataset.userId`.
</details>

### **Q6: Code Analysis**
<details><summary>Show code</summary>

```html
<div id="box" data-x="10" data-flag="false"></div>
<script>
  const el = document.querySelector('#box');
  console.log(typeof el.dataset.flag, el.dataset.flag);
</script>
```
</details>
<details><summary>Show answer</summary>
Outputs: `string "false"`. Dataset values are **always strings**.
</details>

---

---

## 3. Inline JSON Script Blocks

### **Q7 (Level 1): Why use `application/json` scripts?**
<details><summary>Show answer</summary>
Safe, avoids globals.
</details>

### **Q8 (Level 2 – Edge Case): What if page contains *multiple* JSON config blocks?**
<details><summary>Show answer</summary>
Must fetch by id; one script block doesn't override another.
</details>

### **Q9 (Level 3 – Performance): Should config be parsed once or multiple times?**
<details><summary>Show answer</summary>
Cache parsed JSON; `.textContent` access + parsing is expensive.
</details>


### **Q7: Why use JSON script tags for configuration instead of embedding JS objects in global scope?**
<details><summary>Show answer</summary>
They avoid global pollution, preserve JSON syntax, and allow secure parsing.
</details>

### **Q8: Corner Case — What happens if the content contains HTML‑sensitive characters?**
<details><summary>Show answer</summary>
Inside `application/json` scripts, HTML is not executed; but malformed JSON still throws on parse.
</details>

### **Q9: Code task — write JS code to read a JSON script block with id="config"**
<details><summary>Show answer</summary>

```js
const cfg = JSON.parse(document.getElementById('config').textContent);
```
</details>

---

---

## 4. Globals

### **Q10 (Level 1): Risks of globals**
<details><summary>Show answer</summary>
Collisions, overwrites.
</details>

### **Q11 (Level 2 – Edge Case): Shadowing and TDZ issues?**
<details><summary>Show answer</summary>
Globals can be shadowed by `let`/`const`; TDZ may break runtime unexpectedly.
</details>

### **Q12 (Level 3 – Performance): Global lookups vs local lookups**
<details><summary>Show answer</summary>
Local scope access faster; global lookup involves prototype chain.
</details>

### **Q10: Why is passing config via global variables risky?**
<details><summary>Show answer</summary>
Naming collisions, accidental overwrites, and unintentional exposure.
</details>

### **Q11: Corner Case — Describe how globals behave in modules.**
<details><summary>Show answer</summary>
ES modules do not pollute `window`; `var` declarations inside modules do not become globals.
</details>

### **Q12: Code Analysis**
<details><summary>Show code</summary>

```js
var x = 10;
let y = 20;
console.log(window.x, window.y);
```
</details>
<details><summary>Show answer</summary>
`window.x` is 10; `window.y` is `undefined`. Only `var` binds to the global object.
</details>

---

---

## 5. Script Tag Attributes

### **Q13 (Level 1): Use of script tag data attributes**
<details><summary>Show answer</summary>
Per-script configuration.
</details>

### **Q14 (Level 2 – Edge Case): Behaviour when same attribute used on multiple script tags?**
<details><summary>Show answer</summary>
Each script must read own tag via `document.currentScript`.
</details>

### **Q15 (Level 3 – Performance): Asset loading via `import.meta.url`**
<details><summary>Show answer</summary>
Use URL constructor once; avoid rebuilding prefixed paths repeatedly.
</details>

### **Q13: When and why use `data-*` on `<script>` tags?**
<details><summary>Show answer</summary>
To attach config directly to the script delivering the JS, enabling its own initialization logic.
</details>

### **Q14: Explain `import.meta.url` and a typical use case.**
<details><summary>Show answer</summary>
It gives the module’s resolved URL, useful for loading assets relative to the module.
</details>

### **Q15: Code Analysis**
<details><summary>Show code</summary>

```js
console.log(import.meta.url.includes('module.js'));
```
</details>
<details><summary>Show answer</summary>
Prints `true` if executed inside `module.js`.
</details>

---

---

## 6. Fetching Runtime Config

### **Q16 (Level 1): Caching strategy**
<details><summary>Show answer</summary>
stale-while-revalidate, memoization.
</details>

### **Q17 (Level 2 – Edge Case): What if config request returns 204 or malformed JSON?**
<details><summary>Show answer</summary>
Must fallback; JSON.parse throws.
</details>

### **Q18 (Level 3 – Performance): How to avoid waterfall fetch on slow networks?**
<details><summary>Show answer</summary>
Use preload headers or inline critical initial config.
</details>

### **Q16: What caching strategy is best for runtime-loaded config?**
<details><summary>Show answer</summary>
Prefer stale-while-revalidate or in-memory + ETag matching.
</details>

### **Q17: Corner Case — What happens if fetching config races with app initialization?**
<details><summary>Show answer</summary>
App may initialize with partial or default config unless initialization is awaited.
</details>

### **Q18: Simple Coding Task — write an async function to fetch config JSON once.**
<details><summary>Show answer</summary>

```js
let configCache;
async function loadConfig() {
  if (configCache) return configCache;
  const res = await fetch('/config.json');
  configCache = await res.json();
  return configCache;
}
```
</details>

---

---

## 7. Environment Flags

### **Q19 (Level 1): Build-time flag replacement**
<details><summary>Show answer</summary>
Static replacement via bundler.
</details>

### **Q20 (Level 2 – Edge Case): Why dynamic expressions break tree shaking?**
<details><summary>Show answer</summary>
Bundler cannot statically analyze them.
</details>

### **Q21 (Level 3 – Performance): How env flags impact bundle size?**
<details><summary>Show answer</summary>
Dead-code elimination triggered by static checks reduces KBs.
</details>

### **Q19: Explain how bundlers replace environment flags at build time.**
<details><summary>Show answer</summary>
Tools like Webpack/Vite use define plugins to replace expressions like `process.env.NODE_ENV` via string substitution before bundling.
</details>

### **Q20: Corner Case — Why must flags be literal (not dynamic expressions)?**
<details><summary>Show answer</summary>
Bundlers perform static replacement; dynamic expressions cannot be evaluated at build time and will not tree-shake.
</details>

### **Q21: Code Task — write code that uses a build-time flag to remove debug code.**
<details><summary>Show answer</summary>

```js
if (process.env.DEBUG === 'true') {
  console.log('Debug mode');
}
```
</details>

---

---