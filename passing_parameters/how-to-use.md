Classic script:

/diagnostic-loader.js?tenant=acme</script>

Module script:
/diagnostic-loader.js?theme=dark</script>

Inside iframe:
Pass config via the iframe URL (e.g., ?lang=en) and/or via the script URL. This script will log both.

Optional remote logging:
Set an endpoint via:

data-log-endpoint="https://your-endpoint" on the <script> tag, or
?logEndpoint=https://your-endpoint in the script URL, or
window.SCRIPT_DIAG_ENDPOINT = 'https://your-endpoint' before including the script.

The payload is window.__loaderDiag as JSON.


Notes & trade-offs

We avoid import.meta so the same file can run in both classic and module contexts (referencing it directly would be a syntax error in classic).
Module URL detection relies on stack traces, which are widely available in modern browsers (Chromium, Firefox, Safari). If the URL is missing or mangled by tooling, we gracefully fall back.
If a module is bundled into a blob: URL, we’ll still report the blob URL (useful for tracing).
For inline scripts (no src) this script reports injection as unknown and uses the document URL as fallback.
Data attributes (data-*) on the script tag are collected when available (classic path).