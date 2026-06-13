**Tags:** `chrome` · `runtime`

# Context Bar

The 36px sticky strip at the top of every Nib page. Hosts the breadcrumb, persona chip, design notes / feedback / review buttons, theme badge, and fidelity selector. Two tiers: the default chrome that always builds, and an opt-in portal header + search widget gated by `WIREFRAME_CONFIG` flags.

> **Agent reference:** None — this page is the source of truth.

## Always on (Tier 1)

The context bar always builds. Recent additions:

- **Click-to-copy on the breadcrumb** — clicking the current crumb invokes `wfCopyDeepLink()` (exposed on `window`); URL goes to clipboard, toast confirms.
- **Dynamic timestamp** — uses `document.lastModified` so the displayed time reflects when the page's HTML was last edited, not when the user opened it. Useful for "is this prototype fresher than what I saw yesterday?" review questions.

`wfCopyDeepLink()` is exposed on `window` so projects can wire other affordances to it.

## Opt-in (Tier 2)

Set flags in `WIREFRAME_CONFIG`:

```js
window.WIREFRAME_CONFIG = {
  title: 'My Project',
  portalHeader: {
    logo: 'brand/logo.svg',
    nav: [
      { label: 'Home',    href: 'home.html' },
      { label: 'Pricing', href: 'pricing.html' }
    ]
  },
  search: { ai: true },          // or just `search: true`
  changelog: true                // (reserved — not yet wired)
};
```

The `core/proto-search.js` module reads these flags and:

- **Portal header** — adds a `.wf-header` strip above the context bar with logo, nav, and a utility area; drops the context bar's z-index so it sits below.
- **Search widget** — collapsible icon → expands to a 360px pane with input + result list. Index built lazily from `window.SECTIONS`. Press `/` to focus from anywhere.
- **Ask AI toggle** — when `search: { ai: true }`, an "Ask AI" checkbox appears. Toggling it routes queries through `WIREFRAME_CONFIG.search.aiMatcher(query) → { kind, entry, rationale }` if defined; otherwise falls back to the highest-scoring page match with a synthetic "thinking" pause. Useful for prototyping AI-assisted nav UX without wiring a real LLM.

## Loading order

```html
<link rel="stylesheet" href="../nib/core/proto-core.css">
<link rel="stylesheet" href="../nib/core/proto-search.css">  <!-- only if Tier 2 -->

<script src="project-data.js"></script>           <!-- WIREFRAME_CONFIG, SECTIONS -->
<script src="../nib/core/proto-nav.js"></script>  <!-- always -->
<script src="../nib/core/proto-search.js"></script>  <!-- only if Tier 2 -->
```

`proto-search.js` self-bootstraps on `DOMContentLoaded` and short-circuits if neither `portalHeader` nor `search` is truthy, so it's safe to load unconditionally if a project sometimes uses Tier 2.

## API

```js
// Always exposed:
window.wfCopyDeepLink();             // copies current URL, toasts confirmation

// Available when proto-search.js is loaded with WIREFRAME_CONFIG.search:
WIREFRAME_CONFIG.search.aiMatcher = function (query) {
  return { kind: 'page', entry: { id, label, section, href }, rationale: '…' };
  // or { kind: 'message', message: '…' };
};
```

## Related

- [[Navigation]] — the drawer the context bar opens
- [[Architecture]] — where the chrome sits in the load order
