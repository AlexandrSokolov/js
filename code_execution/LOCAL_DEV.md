
# LOCAL_DEV.md

## How to run the web server

### One-time prerequisites
- Docker and Docker Compose installed.

### Start (development):
```bash
docker compose up --build
```
- `--build` ensures the container reflects any recent changes to `docker-compose.yaml`, server command, or files baked into the image.

### Subsequent starts (when only mounted files changed):
```bash
docker compose up
```

### Stop:
```bash
docker compose down
```

### Open in browser
- Main page: `http://localhost:8000/` (root will always serve the main index page when `serve.json` is present as described below).

> Tip: If you switch server configuration (e.g., `serve.json`) and don’t see changes, 
> run `docker compose down -v && docker compose up --build` to clear caches/volumes and rebuild.

---

## 1) `docker-compose.yml` — what it does
- Defines a single service that runs a lightweight static web server inside a container and exposes it on port **8000**.
- Mounts the project root into the container so local changes to HTML/CSS/JS are reflected without rebuilding the image.
- Uses a Node-based image to run the `serve` CLI (or an equivalent) to host the files from `/app`.

---

## 2) `serve.json` — what it does
- Controls the behavior of the static server (`serve`).
- We set:
  - `cleanUrls: false` → keeps file extensions visible; no automatic `.html` → extensionless redirects.
  - `rewrites: [{ source: "/", destination: "/index.html" }]` → ensures that hitting the root (`/`) always returns the main page instead of a directory listing.

> Place `serve.json` at the project root (same folder as `index.html`). Restart the container after changes.

---

## 3) `index.html` (main page) — what it does
- Presents all **cases** on one page for side‑by‑side exploration and provides a **Visual Log** pane for quick feedback.
- Loads example scripts for specific cases (e.g., `defer`, `async`, module entry) from the **head**, and additional demo logic at the end of **body**.
- Exposes a small helper `window.__demo.stamp(label)` that writes to the console and to the on‑page log.
- (Optional) The file may include an **inline iframe preview injector**: each `.case` element with `data-case-src="./cases/<file>.html"` gets a collapsible *“Show isolated page (iframe)”* block appended automatically, so you can view each case in isolation **without leaving the main page**.  
  (This is implemented as a small `<script type="module">` at the end of the file.)  
  See the provided `index.html` you shared and the generated `index.option3.html` variant with iframes.  

---

## 4) JS scripts (general)
- **`/scripts/defer-head.js`** — loaded with `defer` from `<head>`; downloads in parallel and executes after HTML parsing.
- **`/scripts/async-head.js`** — loaded with `async` from `<head>`; execution order not guaranteed relative to other scripts.
- **`/scripts/module-entry.js`** — loaded with `type="module"`; can use ESM `import/export`; deferred by default.
- **`/scripts/external-body.js`** — a classic script included near the end of `<body>`; executes immediately when the parser reaches it.
- **Other case helpers** — small snippets attached to buttons (e.g., setTimeout, Promise microtask, dynamic injection) that call `__demo.stamp(...)` to visualize timing.

> The exact filenames referenced above come from your current `index.html` and demo structure. 
> Keep paths and letter case in sync with `/cases` and `/scripts` (Linux is case‑sensitive).

---

## 5) `cases/` folder — purpose and how to use
- Contains **standalone, minimal HTML pages**, one per case (e.g., `02-defer-head.html`).
- Each case page is **self-contained** and ideal for:
  - isolating side‑effects during debugging (e.g., MutationObserver, timers)
  - clean Performance/Memory profiling without cross‑case noise
  - reproducible examples for bug reports or CI/browser automation
- You can open any case directly, e.g.: `http://localhost:8000/cases/02-defer-head.html`  
  If the main page includes the iframe injector, each case also appears inline in a collapsible block.

**Naming and case sensitivity**
- On Linux, file paths are **case‑sensitive**. Ensure links in `index.html` exactly match file names in `cases/` (e.g., `08-addeventlistener.html` vs `08-addEventListener.html`).

---

## Troubleshooting
- **Root shows directory listing** → Ensure `index.html` exists at the project root **or** add `serve.json` with a rewrite from `/` to `/index.html`, then restart.
- **Case page 404** → Check the exact file name and letter case under `/cases`, and make sure `data-case-src` (or your link) matches exactly.
- **Changes don’t show up** → Hard refresh or restart the container with `--build`. For server config changes, `docker compose down -v && docker compose up --build`.

