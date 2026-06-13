# Architecture

**Tags:** `reference` · `runtime` · `load-order`

How the pieces connect. Read this to build the mental model before touching a page.

> **Agent reference:** [`ref/architecture.md`](../ref/architecture.md) — full section-by-section detail.

## Script load order

Every page follows the same chain. Add optional modules between `proto-nav.js` and `proto-gen.js`:

```
project-data.js → proto-nav.js → [compose-data.js → proto-compose.js → compose-flow.js] → proto-gen.js
```

- `project-data.js` sets globals on `window` — see [[Navigation]] for the data structures
- `proto-nav.js` builds page chrome: context bar, drawer, design notes panel, story mode
- `proto-compose.js` transforms `COMPOSE` objects into `PAGE_BLUEPRINT` — see [[Page-Compose]]
- `proto-gen.js` renders `PAGE_BLUEPRINT` → HTML — see [[Page-Blueprint]]

## Global data structures

| Global | Required? | Purpose |
|---|---|---|
| `WIREFRAME_CONFIG` | Yes | Project branding + email config |
| `SECTIONS` | Yes | Drives drawer, breadcrumbs, surface detection |
| `STORY_MAP` / `STORY_TITLES` | No | Page → story ID cross-reference |
| `JOURNEYS` | No | User flow definitions — highlighted via `data-journey` |
| `SCENARIOS` | No | Guided walkthroughs with narrative and friction |
| `DESIGN_STORIES` / `PROJECT_PHASES` | No | Living implementation tracking document |
| `PAGE_BLUEPRINT` | No | Declarative page data — see [[Page-Blueprint]] |
| `COMPOSE` / `COMPOSE_FLOW` | No | Template-level page authoring — see [[Page-Compose]] |

## CSS module ownership

Each core CSS file has one job. Never put a style in the wrong module.

| Module | Owns |
|---|---|
| `proto-tokens.css` | [[Design-Tokens]] + fidelity controls |
| `proto-components.css` | Buttons, cards, tables, forms — see [[Components]] |
| `proto-blueprint.css` | [[Paper-Utilities]] + `[data-wf-confidence]` |
| `proto-chrome.css` | Context bar, drawer, notes panel |
| `proto-feedback.css` | Feedback / annotation modal |
| `proto-story.css` | Journey highlighting + scenario banner |
| `proto-keyframes.css` | Animations |

Surface CSS is one file per surface — see [[Surfaces]].

## State on `<html>`

Framework features toggle attributes on the root element. Your CSS can react:

- `[data-wf-fidelity="0|1|2"]` — Napkin / Blueprint / Polished (see [[Fidelity-Levels]])
- `[data-wf-theme]` — active theme (see [[Themes]])
- `.wf-dn-open` — design notes panel open
- `.story-active` / `.scenario-active` — story mode on

## Z-index architecture

Don't invent high values. Stay inside the system:

```
page content  <  1000  ≤  context bar  <  2001  ≤  drawer  <  3001  ≤  notes panel  <  4000  ≤  modals
```

See [[Lessons-Learned]] #11 for the incident that led to this rule.

---

## Related

- [[Navigation]] — `SECTIONS`, story maps, scenarios
- [[Page-Template]] — the required HTML boilerplate
- [[Page-Blueprint]] — declarative page data
- [[Page-Compose]] — template-level authoring
- [[Themes]] — per-section design system overrides
- [[Doctor]] — automated check for load-order and z-index mistakes
- [[Lessons-Learned]] — incidents that shaped these rules
