
# Core JavaScript Mastery (Foundation → Pro)

---

## 📚 Table of Contents
- [JavaScript Engine Fundamentals](#javascript-engine-fundamentals)
- [Script Loading & Execution Timing](#script-loading--execution-timing)
  - [How the Browser Loads Scripts](#how-the-browser-loads-scripts)
  - [What Happens After Scripts Load (Execution Timing)](#what-happens-after-scripts-load-execution-timing)
- [Language Fundamentals (Deep)](#2-language-fundamentals-deep)
- [Asynchrony: Promises, Async/Await, Generators](#3-asynchrony-promises-asyncawait-generators)
- [Modern JavaScript (ES6+ Essentials)](#4-modern-javascript-es6-essentials)
- [Working with Collections & FP Patterns](#5-working-with-collections--fp-patterns)
- [Modules: ESM vs CJS](#6-modules-esm-vs-cjs)
- [Types & TypeScript Fundamentals](#7-types--typescript-fundamentals)
- [Performance & Memory](#8-performance--memory)
- [Tooling & Quality Baseline](#9-tooling--quality-baseline)
- [Practice Projects](#10-practice-projects)
- [Passing Parameters to JS (Same‑Origin / Same‑Context)](#passing-parameters-to-js-sameorigin--samecontext)
- [Cross‑Domain JS & Inter‑Context Communication](#crossdomain-js--intercontext-communication)
- [Untrusted JS & Security Hardening](#13-untrusted-js--security-hardening)
- [Web Platform Basics](#14-web-platform-basics)
- [HTTP Fundamentals](#15-http-fundamentals)
- [Origin Model & Storage](#16-origin-model--storage)
- [Security Mindset (Essentials)](#17-security-mindset-essentials)
- [Browser Rendering Pipeline](#18-browser-rendering-pipeline)
- [Quick Reference Links](#19-quick-reference-links)

---

## JavaScript Engine Fundamentals
- [ ] Understand **call stack**, **heap**, **execution contexts**, and **scope chain**
- [ ] Master the **event loop**, **microtasks vs macrotasks** (Promise jobs, `queueMicrotask`, timers, I/O)
- [ ] Understand **closures**, variable capture, and pitfalls
- [ ] Understand **`this` binding** (default, implicit, explicit, arrow)
- [ ] Understand the **prototype chain**, inheritance, object model

## Script Loading & Execution Timing

### How the Browser Loads Scripts
- [ ] Classic blocking scripts (parser‑executed)
- [ ] `async` scripts (download in parallel, execute ASAP, no guaranteed order)
- [ ] `defer` scripts (download in parallel, execute after parse, order preserved)
- [ ] Module scripts (`type="module"`)
  - Static imports, dependency graph
  - Execution semantics
  - Top‑level `await`
- [ ] Dynamic script insertion (`document.createElement('script')`, `.src = ...`, `.onload`)
  - Execution ordering rules (sync vs async)
- [ ] Preload/prefetch interactions
  - `link rel="preload"`
  - `link rel="modulepreload"`

### What Happens After Scripts Load (Execution Timing)
- [ ] When scripts block parsing and rendering
- [ ] Task queues after script execution (microtasks → next macrotask → render)
- [ ] Sequencing between scripts, DOM events, and paints
- [ ] Interaction with:
  - `requestAnimationFrame`
  - `MutationObserver`
  - `queueMicrotask`
  - Event loop phases

**Practice**
- [ ] Implement a tiny event‑loop simulator with micro/macro task logs to prove ordering
- [ ] Write a short explanation of how closures retain references (not copies)
- [ ] Create a trace showing when microtasks flush relative to `DOMContentLoaded` and `load`

---

## 3. Language Fundamentals (Deep)
- [ ] Values vs references; primitives vs objects
- [ ] Coercion & equality: `==` vs `===`, `Object.is`
- [ ] Destructuring, spread/rest, default params
- [ ] Property descriptors, `Object.defineProperty`, `in`, `Object.hasOwn`
- [ ] Implement `deepFreeze` for nested structures

**Practice**
- [ ] Build a read‑only config via property descriptors
- [ ] Implement a `cloneDeep` vs `structuredClone` comparison with pitfalls

---

## 4. Asynchrony: Promises, Async/Await, Generators
- [ ] **Promises** lifecycle (pending → fulfilled/rejected), chaining, error propagation
- [ ] `async/await` semantics, parallel vs sequential, `Promise.allSettled`
- [ ] **Generators** and **iterators**; `for..of`, custom iterables
- [ ] **Async generators** & `for await...of`
- [ ] Cancellation patterns (`AbortController`)

**Practice**
- [ ] Retry‑with‑exponential‑backoff helper with `AbortController`
- [ ] A custom async iterator that paginates mock API data

---

## 5. Modern JavaScript (ES6+ Essentials)
- [ ] `let`/`const`, temporal dead zone
- [ ] Arrow functions & lexical `this`
- [ ] Template literals & tagged templates
- [ ] `Map`, `Set`, `WeakMap`, `WeakSet`
- [ ] **Symbols** & well‑known symbols (`Symbol.iterator`, `Symbol.toStringTag`)
- [ ] **Proxy** & **Reflect** for meta‑programming

**Practice**
- [ ] Proxy‑based validation layer for plain objects
- [ ] Use `Symbol.iterator` to make a custom structure iterable

---

## 5. Working with Collections & FP Patterns
- [ ] Master `map`, `filter`, `reduce`, `some`, `every`, `find`, `flatMap`, `groupBy`
- [ ] **Immutability** patterns (copy‑on‑write, structural sharing basics)
- [ ] **Currying** and **function composition**
- [ ] Avoid mutation in reducers; prefer pure functions

**Practice**
- [ ] Implement `pipe` and `compose`
- [ ] Write a `groupBy` polyfill with tests

---

## 6. Modules: ESM vs CJS
- [ ] Understand **ES Modules** (static analysis, live bindings, `import`/`export`)
- [ ] Understand **CommonJS** (`require`, `module.exports`) and interop in Node
- [ ] Dynamic `import()` & code‑splitting basics

**Practice**
- [ ] Build a tiny lib twice: CJS and ESM, with dual‑publish `package.json`

---

## 7. Types & TypeScript Fundamentals
- [ ] Types vs interfaces; extension & merging
- [ ] **Generics** (functions, interfaces, constraints, defaults)
- [ ] **Type narrowing**: `in`, `typeof`, `instanceof`, discriminated unions
- [ ] Utility types (`Partial`, `Pick`, `Omit`, `ReturnType`, `Awaited`)
- [ ] Declaration files basics; strict `tsconfig`

**Practice**
- [ ] Model an API response with discriminated unions and exhaustive checks
- [ ] Convert a JS util library to strict TS with generics

---

## 8. Performance & Memory
- [ ] Big‑O intuition for common operations in JS collections
- [ ] Identify **memory leaks** (closures holding refs, timers, caches, DOM references)
- [ ] Use **performance** APIs and browser/Node profilers

**Practice**
- [ ] Benchmark script comparing multiple implementations
- [ ] Create and fix a leak (e.g., forgotten event listeners)

---

## 9. Tooling & Quality Baseline
- [ ] ESLint with a strong ruleset (typescript‑eslint or Airbnb adapted)
- [ ] Prettier formatting
- [ ] NPM scripts / PNPM workspaces basics
- [ ] Unit tests (Vitest/Jest) for utilities
- [ ] CI (GitHub Actions) for lint & tests

**Practice**
- [ ] Template repo with ESLint + Prettier + TS + Vitest + pre‑commit hooks

---

## 10. Practice Projects
- [ ] **Async Orchestrator**: 3 endpoints, retry/backoff, timeout, cancellation
- [ ] **Iterator Library**: lazy pipeline (`take`, `drop`, `map`, `filter`)
- [ ] **Proxy Guard**: schema‑driven object validator via Proxy
- [ ] **Type‑Safe SDK**: fetch wrapper with TS generics and discriminated unions
- [ ] **Perf Lab**: micro‑benchmarks + memory profiling write‑up

---

## Passing Parameters to JS (Same‑Origin / Same‑Context)
- [ ] URL **query** parameters (`URLSearchParams`) & **hash** (`location.hash`)
- [ ] HTML **`data-*` attributes** as lightweight config
- [ ] Inline `<script type="application/json">` blocks for boot‑time config
- [ ] **Global variables** (scoped carefully; avoid polluting `window`)
- [ ] `<script>` **tag attributes** (e.g., `data-*` on script; `import.meta.url` in modules)
- [ ] **Fetching config** at runtime (JSON endpoint + caching)
- [ ] **Environment flags** (build‑time replace via bundlers; `process.env` in Node)

**Practice**
- [ ] Build a widget that reads config from: query string → data‑attrs → inline JSON → fetch fallback
- [ ] Add precedence & validation; log provenance of each value

---

## Cross‑Domain JS & Inter‑Context Communication
- [ ] **Same‑Origin Policy** (what it protects; origin = scheme + host + port)
- [ ] **CORS** (preflight vs simple requests; server headers; client options)
- [ ] `window.postMessage` between windows/iframes (validate origin & shape)
- [ ] **JSONP** history & why not to use it today
- [ ] Cookies vs **`SameSite`** attributes and cross‑site requests
- [ ] **Storage isolation** across origins/sites (and partitioned storage trends)
- [ ] **Service Workers** as a boundary (scope, fetch interception)
- [ ] `fetch` **with credentials** (`credentials: 'include'`) & security trade‑offs

**Practice**
- [ ] Demo two origins exchanging messages via `postMessage` with strict origin checks
- [ ] CORS playground: server with selective `Access-Control-*` headers; client matrix of requests

---

## 13. Untrusted JS & Security Hardening
- [ ] **Sandboxed iframes** (`sandbox` flags, allowlists)
- [ ] **CSP** (script-src, object-src, `nonce`/`hash` deployment)
- [ ] **Trusted Types** to prevent DOM XSS sinks
- [ ] **Subresource Integrity (SRI)** for external scripts
- [ ] **DOMPurify** / templating hygiene for untrusted HTML
- [ ] **Realms / isolation patterns** (iframe, Worker, or future Realms APIs)
- [ ] **Supply‑chain risks** (lockfiles, pinning, code review, provenance)

**Practice**
- [ ] Embed an untrusted widget in a sandboxed iframe with a tight CSP & Trusted Types
- [ ] Add SRI to external CDN script; break build if hash mismatches

---

## 14. Web Platform Basics
- [ ] **HTML** semantics, forms, accessibility basics
- [ ] **DOM** APIs, events, capturing vs bubbling, delegation
- [ ] **CSS** cascade, specificity, layout (Flexbox/Grid), containment
- [ ] How `<script>` works: blocking vs `defer` vs `async`; module scripts; `nomodule`
- [ ] **Browser DevTools**: Elements, Network, Performance, Memory, Security panels

### 14.x — Script Loading & Execution Models
Note: the goal is understanding _How <script> works_. 
- [ ] Blocking (parser‑executed) classic scripts
- [ ] `async` scripts (download in parallel, execute ASAP, order not guaranteed)
- [ ] `defer` scripts (download in parallel, execute after parse, order preserved)
- [ ] **Module scripts** (`type="module"`, static imports, top‑level `await` semantics)
- [ ] Dynamic `<script>` insertion & execution ordering
- [ ] Preload/prefetch interactions; `link rel="preload"/"modulepreload"`
- [ ] Execution order rules across classic vs module vs dynamic scripts

**Practice**
- [ ] Convert blocking scripts to `defer`/`async` and measure FCP/LCP impact
- [ ] Build a matrix demo showing execution order of classic vs module vs dynamic scripts

---

## 15. HTTP Fundamentals
- [ ] Methods: GET/POST/PUT/PATCH/DELETE/OPTIONS
- [ ] Headers: `Accept`, `Content-Type`, `Authorization`, caching, CORS
- [ ] **Cookies** (attributes: `Secure`, `HttpOnly`, `SameSite`, `Domain`, `Path`, `Max-Age`)
- [ ] **Caching** (ETag, `Last-Modified`, Cache-Control, `Vary`)
- [ ] **Redirects** (3xx codes) & idempotency concerns

**Practice**
- [ ] Build a cache strategy: conditional requests with ETag; validate behavior under replays
- [ ] Capture a request/response trace and annotate each header’s role

---

## 16. Origin Model & Storage
- [ ] **Origin vs site** (schemes, registrable domains, ports)
- [ ] **localStorage** / **sessionStorage** (sync, per‑origin, quotas)
- [ ] **IndexedDB** basics & when to use it
- [ ] **Cookies** scoping & precedence; partitioned cookies

**Practice**
- [ ] Build a small storage adapter that abstracts localStorage/IndexedDB with fallbacks
- [ ] Demonstrate isolation by attempting cross‑origin access (expect failures)

---

## 17. Security Mindset (Essentials)
- [ ] **XSS** basics (reflected, stored, DOM‑based); output encoding & sink discipline
- [ ] **CSRF** basics; same‑site cookies, anti‑CSRF tokens, double‑submit, `SameSite=Lax`
- [ ] CSP & SRI at a high level (tie back to sections 13 & 15)

**Practice**
- [ ] Deliberately vulnerable demo; fix with encoding, CSP, Trusted Types
- [ ] Implement CSRF mitigations on a simple form API

---

## 18. Browser Rendering Pipeline
- [ ] Critical rendering path: HTML parse → DOM/CSSOM → render tree → layout → paint → composite
- [ ] Reflow vs repaint; avoid layout thrashing
- [ ] GPU compositing layers; `will-change` trade‑offs
- [ ] Performance budgets; measure with Lighthouse/Profiler

**Practice**
- [ ] Create a page that triggers reflow thrash; fix with batching & `requestAnimationFrame`
- [ ] Audit layer count and experiment with `contain`/`will-change`

---

## 19. Quick Reference Links
- **MDN JavaScript**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **MDN Web APIs**: https://developer.mozilla.org/en-US/docs/Web/API
- **MDN HTTP**: https://developer.mozilla.org/en-US/docs/Web/HTTP
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **CSP**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **Trusted Types**: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API
- **Subresource Integrity**: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
- **postMessage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

---

## 🎯 Completion Criteria (Senior‑Ready for #1)
- [ ] Explain & demonstrate the event loop with code
- [ ] Design async flows with cancellation and backoff
- [ ] Confidently pass config to JS across contexts with clear precedence
- [ ] Safely integrate untrusted JS using sandboxing, CSP, Trusted Types, and SRI
- [ ] Profile & fix a performance or memory issue using DevTools
- [ ] Explain script loading vs execution timing and its impact on rendering

---

### License
MIT
