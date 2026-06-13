# Context Bar

> ⚠️ **Deprecated.** Edit [`docs/Context-Bar.md`](../docs/Context-Bar.md) instead — and create that page if it doesn't exist yet (this content needs to be mirrored). This file will be removed in a future release.

> Read when configuring the page chrome — context bar, portal header, search widget. The context bar always builds; the portal header + search are opt-in via `WIREFRAME_CONFIG`.

## Always-on (Tier 1)

The 36px sticky `.wf-ctx-bar` always builds. Controls:

- Hamburger → `wfNavOpen()`
- Logo (from `WIREFRAME_CONFIG.logo`)
- Breadcrumb — clicking the **current** crumb copies the page deep-link via `wfCopyDeepLink()`
- Right side: timestamp, Stories, Notes, Feedback, Review, theme badge, fidelity selector

The timestamp uses `document.lastModified` so it reflects the page's last-edited time, not view time. This makes "is this prototype fresher than what I saw yesterday?" a one-glance question.

`wfCopyDeepLink()` is exposed on `window` so projects can wire other affordances to it.

## Opt-in chrome (Tier 2)

Set flags in `WIREFRAME_CONFIG`:

```js
window.WIREFRAME_CONFIG = {
  title: 'My Project',
  portalHeader: {
    logo: 'brand/logo.svg',
    nav: [
      { label: 'Home',    href: 'home.html' },
      { label: 'Pricing', href: 'pricing.html' },
    ],
  },
  search: { ai: true },          // or just `search: true`
  changelog: true,                // (reserved — not yet wired)
};
```

The `core/proto-search.js` module (loaded from any page that includes it) reads these flags and:

- **Portal header** — adds a `.wf-header` strip above the context bar with logo, nav, and a utility area; drops the context bar's z-index so it sits below.
- **Search widget** — collapsible icon → expands to a 360px pane with input + result list. Index built lazily from `window.SECTIONS`. Press `/` to focus from anywhere.
- **Ask AI toggle** — when `search: { ai: true }`, an "Ask AI" checkbox appears. Toggling it routes queries through `WIREFRAME_CONFIG.search.aiMatcher(query) → { kind, entry, rationale }` if defined; otherwise it falls back to the highest-scoring page match with a synthetic "thinking" pause. Useful for prototyping AI-assisted nav UX without wiring a real LLM.

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
window.wfCopyDeepLink();             // copies current URL to clipboard, toasts confirmation

// Available when proto-search.js is loaded with WIREFRAME_CONFIG.search:
WIREFRAME_CONFIG.search.aiMatcher = function (query) {
  return { kind: 'page', entry: { id, label, section, href }, rationale: '…' };
  // or { kind: 'message', message: '…' };
};
```

## Deferred

The eqPartners changelog badge (`.wf-changelog` per-page JSON) is reserved as `WIREFRAME_CONFIG.changelog: true` but not yet wired in this version.
