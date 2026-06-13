# Navigation

**Tags:** `reference` · `runtime` · `project-setup`

How `proto-nav.js` turns `project-data.js` into a drawer, breadcrumbs, design notes, and story mode.

> **Agent reference:** [`ref/navigation.md`](../ref/navigation.md) — complete schema for every data structure below.

## What proto-nav.js builds

1. **Context bar** — top bar with hamburger, breadcrumbs, fidelity slider, notes button
2. **Drawer** — slide-out page list built from `SECTIONS`
3. **Design notes panel** — 3-tab overlay (Context / Design / Technical) — see [[Design-Notes]]
4. **Story mode** — scenario selector with narrative walkthroughs and friction callouts
5. **Scenarios** — guided step-by-step tours stored in `sessionStorage`

## Required: SECTIONS

Drives the drawer and breadcrumbs. Every page's filename must match a `file` value.

```js
var SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    epic: 'Epic 1',
    items: [
      { file: 'home',     label: 'Home',    type: 'page' },
      { file: 'settings', label: 'Settings', type: 'modal' }
    ]
  }
];
```

`type` values: `page`, `modal`, `channel`, `dm`, `canvas`, `sfdc`, `reference`. Setting `type: 'sfdc'` triggers automatic Salesforce global header injection.

## Optional data structures

| Global | Purpose | See |
|---|---|---|
| `STORY_MAP` / `STORY_TITLES` | Page → story ID cross-reference. Auto-injects AC badges into the Notes Context tab | [[Project-Deliverables]] |
| `JOURNEYS` | User flows. Elements with `data-journey="id"` highlight when journey is active | [[Project-Deliverables]] |
| `SCENARIOS` | Guided walkthroughs with narrative + optional `friction` per step | [[Project-Deliverables]] |
| `DESIGN_STORIES` | Rich story definitions (AC, phases, decisions). Powers the Design Stories page | [[Project-Deliverables]] |
| `PROJECT_PHASES` | Groups stories into delivery phases | [[Project-Deliverables]] |

When both `STORY_MAP` and `DESIGN_STORIES` exist, AC badges become clickable links to the Design Stories page.

## WIREFRAME_CONFIG

Global project metadata and email/theme config, defined before `SECTIONS`:

```js
var WIREFRAME_CONFIG = {
  title: 'My Project',
  subtitle: 'Wireframe Prototype',
  fallbackPage: 'index.html',
  emailRecipient:   'team@example.com',
  feedbackEndpoint: '/api/feedback',    // POST target for Feedback button — see [[Feedback]]
  defaultTheme: 'nib',
  themes: { /* custom theme defs — see Themes */ }
};
```

See [[Themes]] for the full theme-resolution chain and custom theme builder. See [[Feedback]] for how `feedbackEndpoint` changes context-bar feedback into GitHub issues.

## Rules

- `project-data.js` loads **before** `proto-nav.js` — non-negotiable
- Filenames in `SECTIONS` / `STORY_MAP` never include `.html`
- `JOURNEYS` accepts both array and object formats — `normalizeJourneys()` handles both
- Missing optional globals fail silently — features just don't render

---

## Related

- [[Architecture]] — the full load order and globals table
- [[Project-Deliverables]] — the sitemap / JTBD / flows pages built on this data
- [[Themes]] — per-section design system themes
- [[Design-Notes]] — panel content structure
- [[Doctor]] — catches missing SECTIONS entries, bad story refs, script order
- [[Lessons-Learned]] — #2 `WIREFRAME_CONFIG` key typos, #3 `JOURNEYS` format confusion, #7 stale sitemaps
