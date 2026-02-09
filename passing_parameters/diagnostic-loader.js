/**
 * diagnostic-loader.js
 * A single-file diagnostic that figures out:
 * - How this script was injected (classic <script>, module/import, inline/dynamic).
 * - All relevant parameter sources (script URL, module URL, document URL, data-*).
 * - Embedding context (iframe).
 * - Then logs a structured report to the console and exposes window.__loaderDiag.
 *
 * NOTE: We DO NOT reference import.meta at all, so this runs in both classic and module.
 */
(() => {
  // ---------- helpers ----------
  const nowIso = () => new Date().toISOString();

  const safeNewURL = (value) => {
    try { return new URL(value, document.baseURI || window.location.href); }
    catch { return null; }
  };

  const stripLineCol = (url) => url.replace(/:\d+(?::\d+)?(?:@\S+)?$/, '');

  const parseParamsFromUrlString = (urlString) => {
    const url = safeNewURL(urlString);
    if (!url) return { search: {}, hash: {} };
    const search = Object.fromEntries(url.searchParams.entries());
    // parse hash as query-like (e.g., #a=1&b=2) while also returning raw
    const hashRaw = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const hash = {};
    if (hashRaw) {
      for (const part of hashRaw.split('&')) {
        if (!part) continue;
        const [k, v = ''] = part.split('=');
        if (k) hash[decodeURIComponent(k)] = decodeURIComponent(v);
      }
    }
    return { search, hash, href: url.href };
  };

  const parseDataset = (scriptEl) => {
    if (!scriptEl || !scriptEl.dataset) return {};
    return { ...scriptEl.dataset };
  };

  const inIframe = () => {
    try { return window.self !== window.top; }
    catch { return true; } // cross-origin access throws => we are in an iframe
  };

  // Try to deduce "same-origin-with-parent" (null if not checkable)
  const sameOriginWithParent = () => {
    if (!inIframe()) return null;
    try { return window.top.location.origin === window.location.origin; }
    catch { return null; }
  };


  /**
   * Try to get the executing script's URL in *any* environment:
   * 1) Prefer document.currentScript.src (classic and parser-inserted).
   * 2) Fallback: use an Error stack to extract the current file URL (works for modules/import()).
   * 3) Last resort: null.
   */
  const getExecutingScriptUrlBestEffort = () => {
    // 1) Classic path
    if (document.currentScript && document.currentScript.src) {
      return document.currentScript.src;
    }

    // 2) Stack-trace heuristics (modules/dynamic import/inline eval contexts)
    try {
      // Throwing/capturing an error gives us a stack with URLs.
      throw new Error('diag_probing_stack');
    } catch (e) {
      const stack = String(e.stack || '');
      // Common URL patterns in stacks: https?, file, blob, data
      const urlPattern = /(https?:\/\/[^\s\)\]]+|file:\/\/[^\s\)\]]+|blob:[^\s\)\]]+|data:[^\s\)\]]+)/g;
      const candidates = [];
      let m;
      while ((m = urlPattern.exec(stack)) !== null) {
        candidates.push(m[0]);
      }
      // Heuristic filtering
      const filtered = candidates
        .map(stripLineCol)
        .filter((u) => {
          // Ignore obvious non-scripts if present
          if (u.startsWith('data:')) return false; // inline data URLs unlikely to be our external file
          if (u.startsWith('blob:')) return true;  // keep blob (could be bundler output)
          if (u.includes('/diagnostic-loader.js')) return true; // exact match helpful
          return true;
        });

      // Pick the first plausible URL that isn't the current document URL
      const docUrl = window.location.href.split('#')[0];
      const firstDifferent = filtered.find((u) => stripLineCol(u) !== stripLineCol(docUrl));
      if (firstDifferent) return firstDifferent;

      // Fallback to first candidate if nothing else
      if (filtered.length) return filtered[0];
    }

    // 3) Unknown
    return null;
  };

  const guessInjectionType = (execUrl, currentScriptEl) => {
    // If we have a currentScript element, it's *very likely* a classic script execution phase.
    if (currentScriptEl) {
      if (currentScriptEl.type === 'module') {
        // currentScript is usually null inside module evaluation, but in some cases/browsers
        // it could transiently exist; call this "module (tag)" if type says so.
        return 'module (via <script type="module">)';
      }
      return 'classic ...';
    }
    // No currentScript; if we have an exec URL that looks like a JS file,
    // it’s likely a module or a dynamic import.
    if (execUrl) {
      if (/^blob:/.test(execUrl)) return 'module/dynamic (blob URL)';
      return 'module or dynamic import()';
    }
    // If absolutely nothing, maybe inline eval, bookmarklet, or injected by extension.
    return 'unknown (inline/eval/extension)';
  };

  // ---------- collect sources ----------
  const currentScriptEl = document.currentScript || null;
  const execUrl = getExecutingScriptUrlBestEffort();   // our best guess of script/module URL
  const docUrl = window.location.href;

  const injectionType = guessInjectionType(execUrl, currentScriptEl);

  const sources = {
    scriptTag: {
      present: !!(currentScriptEl && currentScriptEl.src),
      src: currentScriptEl && currentScriptEl.src || null,
      type: currentScriptEl && currentScriptEl.type || 'classic',
      async: currentScriptEl ? !!currentScriptEl.async : null,
      defer: currentScriptEl ? !!currentScriptEl.defer : null,
      noModule: currentScriptEl ? !!currentScriptEl.noModule : null,
      dataset: parseDataset(currentScriptEl),
      params: parseParamsFromUrlString(currentScriptEl && currentScriptEl.src ? currentScriptEl.src : '')
    },
    executingUrl: {
      present: !!execUrl,
      url: execUrl,
      params: parseParamsFromUrlString(execUrl || '')
    },
    documentUrl: {
      href: docUrl,
      params: parseParamsFromUrlString(docUrl)
    }
  };

  // ---------- summarize ----------
  // "Best" parameter source:
  // - If injection looks like module/dynamic and executingUrl exists -> prefer executingUrl params
  // - Else if scriptTag.src exists -> prefer scriptTag
  // - Else fall back to document URL
  let preferredSource = 'documentUrl';
  if (sources.executingUrl.present) {
    preferredSource = 'executingUrl';
  } else if (sources.scriptTag.present) {
    preferredSource = 'scriptTag';
  }


  let reason;
  if (preferredSource === 'executingUrl') {
    reason = 'Looks like a module/dynamic import; using the executing module URL.';
  } else if (sources.scriptTag.present) {

    //reason = 'Classic <scr' + 'ipt> with src detected; usingG thatT URL.';
    // void literal "<script>" which can trip some HTML/JSX-aware tokenizers
    // Also avoid "using" being tokenized as a JS "using" declaration
    reason = 'Classic <scr' + 'ipt> - will uSe its UrL.';
  } else {
    reason = 'Using document URL as a last resort.';
  }


/*  const summary = {
    preferredSource,
    preferredParams: sources[preferredSource].params,
    reason:
      preferredSource === 'executingUrl'
        ? 'Looks like a module/dynamic import; using the executing module URL.'
        : sources.scriptTag.present
          ? 'Classic <script> with src detected; using that URL.'
          : 'Using document URL as a last resort.',
  };*/


  const summary = {
    preferredSource,
    preferredParams: sources[preferredSource].params,
    reason,
  };


  const context = {
    timestamp: nowIso(),
    inIframe: inIframe(),
    sameOriginWithParent: sameOriginWithParent(),
    injectionType
  };

  const report = { context, sources, summary };

  // ---------- log ----------
  try {
    const titleParts = [
      '🧭 Loader diagnostics',
      `→ ${injectionType}`,
      sources.executingUrl.present
        ? `(exec: ${sources.executingUrl.url})`
        : (sources.scriptTag.present ? `(src: ${sources.scriptTag.src})` : '')
    ].filter(Boolean);

    // Collapsed group for tidiness
    if (console.groupCollapsed) {
      console.groupCollapsed(titleParts.join(' '));
      console.log('Context:', context);
      console.log('Sources:', sources);
      console.log('Summary:', summary);
      console.groupEnd();
    } else {
      console.log('[Loader diagnostics]', { context, sources, summary });
    }
  } catch (e) {
    // In case consoles are polyfilled/limited
    try { console.log('[Loader diagnostics]', report); } catch {}
  }

  // Expose for programmatic inspection
  try { window.__loaderDiag = report; } catch {}

  // Optional: remote logging if endpoint provided
  // Priority: data-log-endpoint on script tag > ?logEndpoint=... on src/exec URL > window.SCRIPT_DIAG_ENDPOINT
  const resolveLogEndpoint = () => {
    const fromDataset = currentScriptEl?.dataset?.logEndpoint || null;
    const fromSrc = sources.scriptTag.params.search.logEndpoint || null;
    const fromExec = sources.executingUrl.params.search.logEndpoint || null;
    const fromGlobal = (typeof window !== 'undefined' && window.SCRIPT_DIAG_ENDPOINT) || null;
    return fromDataset || fromSrc || fromExec || fromGlobal || null;
  };

  const endpoint = resolveLogEndpoint();
  if (endpoint) {
    const payload = JSON.stringify(report);
    const headers = { type: 'application/json' };

    // Try sendBeacon first (non-blocking, good for unload)
    let sent = false;
    try {
      if (navigator.sendBeacon) {
        sent = navigator.sendBeacon(endpoint, new Blob([payload], headers));
      }
    } catch {}
    // Fallback to fetch with keepalive
    if (!sent && typeof fetch === 'function') {
      try {
        fetch(endpoint, {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          mode: 'no-cors' // relax CORS for fire-and-forget (you won't see response)
        });
      } catch {}
    }
  }
})();

