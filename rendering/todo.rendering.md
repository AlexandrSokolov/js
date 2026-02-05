Browser Rendering

Browser Rendering: The Core Things to Know
Rendering in browsers follows a well‑defined multi‑stage pipeline. The key is understanding what triggers which stage, and which steps are expensive.
Below are the most important things to remember.

1) DOM Construction
   Browser parses HTML → builds the DOM tree.

Happens incrementally as HTML arrives.
Blocked by synchronous scripts (<script> without defer/async).
DOM must be built before rendering anything.

Why it matters
Synchronous scripts delay rendering. Use defer / modules.

2) CSSOM Construction
   Browser loads and parses all CSS → builds the CSS Object Model.

CSS is render‑blocking.
Browser won’t render anything until CSSOM is ready to avoid flash of unstyled content.

Why it matters
Avoid huge CSS; use critical CSS or code‑splitting.

3) Render Tree
   DOM + CSSOM → Render Tree (only visible and styled nodes).
   ↳ Hidden elements like display: none are excluded.
   Why it matters
   It combines structure + styling → baseline for layout.

4) Layout (Reflow)
   Browser calculates:

size
position
geometry of each element

Layout can be triggered repeatedly by JS if you read + write layout properties interleaved.
Expensive triggers:

offsetWidth, clientHeight, getBoundingClientRect()
Setting layout-affecting style properties

Why it matters
Avoid forced reflows: batch reads → then writes.

5) Painting
   Browser turns render tree into pixels: colors, borders, text, shadows.
   Painting is slower than layout for complex graphics.
   Why it matters
   CSS properties impact paint cost:

shadows
gradients
clip-path
outlines
complex backgrounds


6) Layering & Compositing
   Browser splits page into layers (like Photoshop).
   GPU composites layers together.
   Things that often create new layers:

position: fixed
transform (non‑none)
opacity changes
will-change
video, canvas, 3D transforms

Why it matters
Layer creation can make animations buttery smooth OR janky depending on overuse.

7) Animation pipeline
   Smooth animations rely on which rendering steps they trigger:

| Property Type                         | Triggers Layout? | Triggers Paint? | Triggers Compositing? | Performance Impact |
|--------------------------------------|------------------|-----------------|------------------------|---------------------|
| **transform** (translate, scale, etc.) | ❌ No             | ❌ No            | ✔️ Yes                 | 🔥 Best (GPU-only)  |
| **opacity**                            | ❌ No             | ❌ No            | ✔️ Yes                 | 🔥 Best (GPU-only)  |
| **left / top / bottom / right**        | ✔️ Yes            | ✔️ Yes           | ✔️ Yes                 | ❌ Slow (layout → paint → composite) |
| **width / height**                     | ✔️ Yes            | ✔️ Yes           | ✔️ Yes                 | ❌ Slow (layout → paint → composite) |
| **margin / padding**                   | ✔️ Yes            | ✔️ Yes           | ✔️ Yes                 | ❌ Slow             |
| **border-width / border-radius**       | ❌ No (usually)   | ✔️ Yes           | ✔️ Yes                 | ⚠️ Medium (paint → composite) |
| **background-color**                   | ❌ No             | ✔️ Yes           | ✔️ Yes                 | ⚠️ Medium (paint → composite) |
| **box-shadow**                          | ❌ No             | ✔️ Yes (expensive) | ✔️ Yes              | ⚠️ Medium/Slow     |
| **color** (text)                        | ❌ No             | ✔️ Yes           | ✔️ Yes                 | ⚠️ Medium          |
| **filter** (blur, brightness, etc.)     | ❌ No             | ❌ No (GPU accelerated in many browsers) | ✔️ Yes | 🔥 Good to Medium |
| **clip-path**                           | ❌ No             | ✔️ Yes (complex shapes expensive) | ✔️ Yes | ⚠️ Medium/Slow |

Why it matters
Only animate transform and opacity for 60 FPS.

8) Render Scheduling
   Browser tries to render at ~60 FPS (every 16.6ms):

It runs microtasks → layout → paint → composite → next frame.

If JS blocks the main thread for too long (>30–50ms), frames drop.
Why it matters
Long JS tasks kill smoothness.
Use:

requestAnimationFrame for animations
requestIdleCallback for non‑critical work


9) Intersection with the Event Loop
   Rendering happens between macrotasks — but after microtasks.
   Order:
   Run JS
   Run all microtasks
   → (maybe) layout
   → (maybe) paint
   → composite
   Next macrotask

Why it matters
Too many microtasks (lots of resolved promises) can block rendering.


| Stage         | What Triggers It                        | Expensive? | Notes |
|---------------|------------------------------------------|------------|-------|
| **DOM**       | HTML parsing                             | No         | Blocked by synchronous `<script>` tags. |
| **CSSOM**     | CSS downloading & parsing                | No         | Render‑blocking until full CSS is ready. |
| **Render Tree** | Combination of DOM + CSSOM             | No         | Excludes `display: none` elements. |
| **Layout (Reflow)** | Size/position changes, layout reads | **Yes**    | Avoid forced reflow; batch reads & writes. |
| **Paint**     | Visual styling (colors, shadows, borders) | **Yes**    | Heavy for shadows, gradients, outlines. |
| **Compositing** | GPU layers merged                       | Fast       | `transform`/`opacity` animations stay here. |
| **Frame Rendering** | Happens ~every 16.6ms (60 FPS)      | Depends    | Blocked by long JS or too many microtasks. |

The most important practical rules

Use transform and opacity for animations
Minimize layout thrashing (batch DOM reads/writes)
Avoid long JavaScript tasks
Use defer for scripts
Keep CSS small and modular
Use layers responsibly (not too many, not too few)



🚀 Critical Rendering Path — What It Means
The Critical Rendering Path is the sequence of steps the browser must perform to convert your HTML, CSS, and JS into pixels on the screen.
It includes everything that is essential to display the first visible content.
Think of it as:

“The minimum work the browser must finish before the page can visibly render.”

If something blocks or slows down any step of the CRP, the page stays blank longer.

🧠 The CRP consists of these key stages


HTML parsing → DOM creation
Browser parses HTML and builds the DOM tree.


CSS parsing → CSSOM creation
Browser downloads CSS files, parses them, and builds the CSS Object Model.
Rendering cannot start until CSSOM is complete (CSS is render‑blocking).


Combine DOM + CSSOM → Render Tree
Only visible elements go into the render tree.


Layout (Reflow)
Browser calculates size, position, and geometry.


Paint
Browser fills in pixels: text, colors, borders, shadows.


Compositing
Layers merged on GPU → final image drawn.


These steps form the critical path because the browser cannot show the page before completing them.
