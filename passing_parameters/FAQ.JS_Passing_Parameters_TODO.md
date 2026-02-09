What happens with these parameters?


They’re sent to the server
If /scripts/app.js is served by your backend or a CDN, the full URL (including query string) is used for the request.

Common use: cache busting, e.g. ?v=12345.
You can also have the server respond with different JS based on the parameters.



You can read them from the client-side script


Classic scripts (...):
JavaScriptconst url = new URL(document.currentScript.src);const lang = url.searchParams.get('lang');   // "en"const theme = url.searchParams.get('theme'); // "dark"Show more lines
document.currentScript points to the script that’s currently executing.


ES module scripts (type="module"):
HTML<script type="module" src="/scripts/app.js?lang=en&theme=darkShow more lines
JavaScript// inside app.js (module)const url = new URL(import.meta.url);const lang = url.searchParams.get('lang');const theme = url.searchParams.get('theme');Show more lines


Dynamic module imports also support query params:
JavaScriptconst mod = await import(`/feature.js?flag=beta`);Show more lines




They do NOT magically pass variables into the global scope
The script needs to explicitly read those parameters (as shown above), or the server needs to render different content.


Good patterns & alternatives


✅ Cache busting/versioning
HTML<script src="/bundle.js?vShow more lines


✅ Build-time feature flags (server/CDN varies response per query param).


✅ Runtime configuration
If you prefer not to tie config to the script URL, alternatives:

A small inline config before the script:
HTML<script>  window.APP_CONFIG = { lang: 'en', theme: 'dark' };</script><script src="/app.js"Show more lines

A <script type="application/json" id="app-config"> block the script reads:
HTML<script type="application/json" id="app-config">  { "lang": "en", "theme": "dark" }</script>/app.js</script>Show more lines
HTMLconst config = JSON.parse(document.getElementById('app-config').textContent);Show more lines




✅ Data attributes on the script tag
HTML<script  src="/app.js"  data-lang="en" Show more lines
JavaScriptconst { lang, theme } = document.currentScript.dataset;Show more lines



Pitfalls & notes

Caching: Different query strings usually create separate cache entries, which is great for versioning but can also fragment the cache. Use a single ?v= hash where possible.
CORS: If the script is from another origin, CORS still applies. Query params don’t bypass it.
CSP: Content Security Policy must allow the exact source (origin). Query params are fine as long as the origin is allowed.
URL length: Browsers support long URLs, but keep parameters concise (safe under a couple thousand characters).
Fragments (#foo) are not sent to the server; don’t use them for server-side behavior.
async/defer: Query parameters don’t change loading semantics.
Module resolution: For type="module", the URL (with query) participates in module identity. /mod.js?x=1 and /mod.js?x=2 are treated as different modules.


Quick examples
Classic script reading its own parameters
HTML<script src="/widget.js?tenant=acme&mode=compactShow more lines
JavaScript// widget.jsconst url = new URL(document.currentScript.src);const tenant = url.searchParams.get('tenant');const mode = url.searchParams.get('mode');// initWidget({ tenant, mode });Show more lines
Module script reading its own parameters
HTML<script type="module" src="/app.js?envShow more lines
JavaScript// app.js (module)const env = new URL(import.meta.url).searchParams.get('env');// bootstrapApp({ env });Show more lines
Dynamic import with flags
JavaScriptconst chart = await import(`/charts.js?theme=dark`);Show more lines

1) Passing params on the script URL inside the iframe
   If your <script> tag lives inside the iframe’s document, you can use query params exactly as you would in a normal page:
<!-- inside the iframe document -->
<script src="/widget.js?tenant=acme</script>

Reading them in the script:


Classic script

const url = new URL(document.currentScript.src);
const tenant = url.searchParams.get('tenant');   // "acme"
const mode   = url.searchParams.get('mode');     // "compact"


ES module
// inside widget.js (type="module")
const url = new URL(import.meta.url);
const tenant = url.searchParams.get('tenant');
const mode   = url.searchParams.get('mode');

Works the same as top-level pages because document.currentScript and import.meta.url are relative to the iframe’s own document and module.

2) Passing params on the iframe URL (to configure all scripts)

If you control the iframe page URL, you can pass configuration via the iframe’s src query string:

<!-- parent page -->
<iframe src="https://example.com/embed.html?lang=en&theme=


Inside script
// in any script running in the iframe document
const lang  = new URL(window.location.href).searchParams.get('lang');  // "en"
const theme = new URL(window.location.href).searchParams.get('theme'); // "dark"

This is great for iframe-wide config that all scripts can read without coupling to a specific script tag.




3) Cross-origin considerations


Access boundaries
The iframe’s scripts can always read their own URL parameters and the iframe page’s query string.
They cannot read the parent’s DOM or URL if the origins differ (same-origin policy).


CORS for module scripts
If the script src is cross-origin and it’s a module (type="module" or import()), the server must send appropriate CORS headers (e.g., Access-Control-Allow-Origin) for the fetch to succeed. Query parameters don’t bypass this.


SRI (Subresource Integrity)
If you use integrity="" on the script tag and the server varies the response based on query params (?mode=...), make sure the content hash matches that variant; otherwise SRI will fail.


Cache behavior
Query strings create distinct cache keys regardless of iframe context. Two different ?v= values = two different cache entries.


4) Sandbox flags change what you can do
   If your <iframe> has sandbox, capabilities are restricted:
   HTML...</iframe>Show more lines

Without allow-scripts, scripts don’t run at all.
Without allow-same-origin, the iframe becomes an opaque origin; it can still read its own URL and its script URLs, but it cannot access some web APIs as a normal origin would, nor interact with parent as same-origin.
Other flags like allow-popups, allow-forms, etc., are also relevant depending on your needs.

Bottom line: Passing/reading query params still works, but your runtime abilities may be limited under sandboxing.

5) Data flow patterns: which one to use?
   A) Config via iframe URL

Pros: Single source for all scripts inside iframe; easy to vary per embed.
Cons: Visible in the iframe src; length limits if you put too much config.

B) Config via script URL in the iframe

Pros: Tied to a particular script; easy versioning/cache-busting.
Cons: If multiple scripts need the same config, you repeat parameters.


C) postMessage from parent → iframe (runtime)

Pros: Secure, flexible, supports objects (no URL length concerns); can update after load.
Cons: Requires message handling and origin checks.


window.addEventListener('message', (event) => {
if (event.origin !== 'https://your-parent-origin.example') return; // validate!
if (event.data?.type === 'CONFIG') {
const { tenant, theme } = event.data;
// init with config
}
});


D) Inline config block inside the iframe HTML

Pros: Simple and explicit.
Cons: Requires control over the iframe document content.
<script type="application/json" id="widget-config">
  { "tenant": "acme", "theme": "dark" }
</script>
<script.js</script>

const cfg = JSON.parse(document.getElementById('widget-config').textContent);

7) Quick decision guide

All scripts in iframe need same config → Use iframe src query or postMessage.
Only one script needs it → Put params on that script’s src.
Config must be updated at runtime → postMessage.
Security-tight embeds with sandbox/CSP → Prefer postMessage + strict policies.