# CLAUDE.md — Nib Framework

## What This Is

Nib is an agent-consumable wireframe prototyping framework. It provides shared CSS, JS, and reference documentation so that agents can rapidly generate consistent, professional wireframe pages for any project.

## Documentation lives in `docs/` (the wiki)

The framework's documentation surface is `docs/` — Markdown files with `[[Page-Name]]` wikilinks. `ref/` is **deprecated**; its files now carry deprecation banners pointing at the matching wiki page. Edit the wiki version when contributing docs.

Entry points: `docs/Home.md`, `docs/_Sidebar.md`. Canonical pages for the recent additions: `docs/Spreadsheet-Authoring.md`, `docs/Service-Blueprint.md`, `docs/Templates.md`, `docs/Create-Project.md`, `docs/Feedback.md`, `docs/Context-Bar.md`, `docs/Project-Wiki.md`.

## How to Use This Framework

### Quickest start: one-command create
```
npx create-nib <project-name>     # opens a browser wizard
npx create-nib foo --workbook ./brief.xlsx   # headless: ingest a workbook
npx create-nib foo --template service-blueprint   # headless: clone a template
```
Read `docs/Create-Project.md` for the full flag set + how distribution works.

### From a spreadsheet (manual)
1. Read `docs/Spreadsheet-Authoring.md` — workbook schema + CLI
2. Run `node tools/nib-ingest.js <your-workbook>.xlsx --out <project-dir>`
3. The CLI generates `data/*.js` for the whole project — pages, tokens, personas, blueprints, stories — **and** a `docs/` wiki documenting all of them.

### Or pick a template
1. Read `docs/Templates.md` — catalog of `examples/` project scaffolds (clone-whole)
2. Copy the closest template into your project; replace `data/` from your workbook.

### Before generating any page (manual path):
1. Read `ref/_index.md` — routing table for which refs to load
2. Read `ref/tokens.md` — color and typography tokens (never hardcode hex)
3. Read `ref/page-template.md` — required HTML boilerplate

### For a specific surface:
- Slack wireframe → read `ref/surface-slack.md`
- Salesforce wireframe → read `ref/surface-salesforce.md` + `ref/surface-salesforce-rules.md`
- Internal portal wireframe → read `ref/surface-internal.md`

### For complex layouts:
- Read `ref/layouts.md` — grid, sidebar, split view patterns
- Read `ref/components.md` — buttons, cards, tables, forms, badges, modals, toast

### For new projects:
- Read `ref/new-project.md` — bootstrap from starters/

### For declarative pages (data-driven generation):
- Read `ref/page-blueprint.md` — define PAGE_BLUEPRINT object, proto-gen.js renders the page
- Starters: `starters/blueprint-record.html` (SFDC record) and `starters/blueprint-dashboard.html` (dashboard)
- Script load order: `project-data.js` → `proto-nav.js` → blueprint data → `proto-gen.js`

### For compose-format pages (template-level authoring):
- Read `ref/page-compose.md` — define COMPOSE object with template references, proto-compose.js transforms to PAGE_BLUEPRINT
- Starters: `starters/compose-record.html` (SFDC record) and `starters/compose-wizard.html` (wizard step)
- Script load order: `project-data.js` → `proto-nav.js` → compose data → `proto-compose.js` → `compose-flow.js` (optional) → `proto-gen.js`
- For clickable multi-page prototypes, add `COMPOSE_FLOW` to `project-data.js` and include `compose-flow.js` in the load order
- Example: `examples/deal-registration/` — 9-screen clickable deal registration flow

### For decks / review presentations:
- Read `ref/decks.md` (wiki: `docs/Decks.md`) — slide model, content blocks, keyboard map, SVG export
- Starters: `starters/deck.html` (fluid scroll-deck) and `starters/deck-fit.html` (fixed 1600×900 canvas)
- Only assets needed: `core/proto-deck.css` + `core/proto-deck.js` (the context bar is optional)
- Example: `examples/design-review/` — a 9-slide weekly design-review deck

### For evidence-driven fidelity:
- Read `ref/evidence.md` (wiki: `docs/Evidence.md`) — mark how grounded each region is with `data-wf-evidence`
- Load `core/proto-evidence.css` + `core/proto-evidence.js`; low-evidence regions render rough, validated ones crisp
- Agents: emit honest evidence — default invented content to `data-wf-evidence="guess"`, only mark `validated` for real sign-off

### For navigation setup:
- Read `ref/navigation.md` — how SECTIONS drives the drawer + breadcrumbs

### When starting a real project:
The `examples/` directory contains reference implementations. When bootstrapping a new project:
1. Copy a starter from `starters/` (not from `examples/`)
2. Create your own `project-data.js` with project-specific SECTIONS
3. The navigation drawer automatically shows YOUR project's pages, not the examples
4. Do not link back to examples from your project — examples are for reference only

### For project deliverables:
- Read `ref/project-deliverables.md` — sitemaps, JTBD pages, user flows, personas, design stories
- Read `ref/design-notes-guide.md` — writing effective design notes
- Read `ref/lessons-learned.md` — patterns and pitfalls from real projects

### For Salesforce projects:
- Read `ref/surface-salesforce-rules.md` — SLDS compliance rules and OOB component guidance
- Read `ref/agent-sfdc-ux.md` — UX review agent for Salesforce wireframes
- Read `ref/agent-sfdc-dev.md` — Dev feasibility review agent for Salesforce wireframes
- Read `ref/agent-install.md` — how to install review agents locally

## Directory Structure

```
framework/
├── core/         # Shared CSS + JS (do not modify per-project)
│   ├── proto-core.css      # Design tokens + base components (legacy monolith)
│   ├── proto-tokens.css    # Design tokens (colors, typography, spacing)
│   ├── proto-components.css # Shared UI components (buttons, cards, tables, forms, badges)
│   ├── proto-blueprint.css # Blueprint/wireframe aesthetic styles
│   ├── proto-chrome.css    # Page chrome (headers, sidebars, context bar)
│   ├── proto-feedback.css  # Toast, modals, notifications
│   ├── proto-keyframes.css # Animations
│   ├── proto-story.css     # Story/narrative layout styles
│   ├── proto-nav.js        # Context bar, drawer, toast, modal, wfCopyDeepLink, normalizeJourneys, detectSurface
│   ├── proto-search.js     # Opt-in portal header + search widget + AI search mode (loaded via WIREFRAME_CONFIG flags)
│   ├── proto-search.css    # Portal header + search widget styles
│   ├── proto-deck.js       # Deck/slides engine — slide chrome, dot nav, keyboard nav, SVG export
│   ├── proto-deck.css      # Deck/slides engine stylesheet (warm-editorial --deck-* palette)
│   ├── proto-evidence.js   # Evidence-driven fidelity — data-wf-evidence resolver, legend, heatmap
│   ├── proto-evidence.css  # Evidence-driven fidelity styles
│   ├── proto-analytics.js  # Umami analytics (meta-gated, wfTrack buffer queue)
│   ├── proto-kpi-filter.js # KPI-card-as-filter (auto-wires .ds-kpi-card grids)
│   ├── proto-wizard-help.js # Wizard help-column toggle (helper card ↔ seeded AI thread)
│   ├── proto-signals.js    # Collapsible intelligence signal bar (wf-signal-mount)
│   ├── proto-compose.js    # Compose runtime (COMPOSE → PAGE_BLUEPRINT transformation)
│   ├── compose-flow.js     # Multi-page flow wiring (wizard navigation, scenarios, stepper sync)
│   ├── proto-gen.js        # Declarative Page Blueprint renderer (PAGE_BLUEPRINT → HTML)
│   ├── proto-scatter-gl.js # Scatter plot GL visualization
│   ├── schema/             # JSON Schema for the canonical Nib project shape
│   │   └── workbook.schema.json
│   ├── ingest/             # Adapter-agnostic Excel/Sheets → project pipeline (consumed by tools/nib-ingest.js)
│   │   ├── util.js         # Shared kebab/list/header helpers
│   │   ├── parsers.js      # Per-tab parsers (meta, pages, tokens, personas, stories, flow, registry)
│   │   ├── build.js        # Orchestrator: tabs dict → canonical project shape
│   │   ├── emit.js         # Project shape → data/*.js + tokens.css + sidecar
│   │   ├── xlsx.js         # SheetJS adapter (.xlsx files)
│   │   ├── sheets-csv.js   # Google Sheets via /export?format=xlsx or per-tab CSV (no auth)
│   │   └── sheets-api.js   # Google Sheets via googleapis service account (--auth)
│   └── blueprint/          # React Flow service blueprint canvas (loaded as ES modules in pages)
│       ├── canvas.js       # Canvas component, Toolbar, Overview panel, breadcrumb drill-down
│       ├── node-types.js   # Custom React Flow node types (lane, phase, journey card, csat cell)
│       ├── layout.js       # BlueprintFlow → React Flow nodes/edges with positions
│       ├── operations.js   # Pure flow ops (move/rename/add/remove for nodes/lanes/phases/edges)
│       ├── history.js      # Snapshot-based undo/redo
│       ├── exporters.js    # JSON / YAML / xlsx round-trip writers
│       ├── sync-adapter.js # Pluggable persistence (localStorage default)
│       ├── canvas.css      # Canvas styling (Nib-token-driven)
│       ├── evidence.js     # Research-evidence model — kinds, ranking, state (viewer)
│       ├── search.js       # Text search + browser-find navigation (viewer)
│       ├── filter-rail.js  # Filter rail — popovers, chips, presets (viewer)
│       ├── thumbnails.js   # Thumbnail manifest + thumb() helper
│       └── thumbnails/     # 57 SVG interaction-archetype thumbnails
├── surfaces/     # Platform CSS overlays
│   ├── slack.css           # Slack app shell, messages, threads
│   ├── salesforce.css      # SFDC record pages, path bar, feed
│   ├── salesforce-polish.js # Progressive-enhancement companion to salesforce.css
│   ├── internal-ds.css     # Portal KPIs, form groups, cards
│   └── internal-ds-extended.css # Net-new ds- families (load after internal-ds.css)
├── tools/        # Node CLIs
│   ├── nib-cli.js          # Validate / pull-reviews / brief / dashboard
│   ├── nib-ingest.js       # Excel / Sheets → Nib project (Track 1)
│   ├── nib-sync.js         # Idempotent re-ingest with diff (Track 1)
│   ├── nib-seed-topics.js  # Seed data-topic/data-role on pages (agentic retrieval)
│   └── nib-pages-index.js  # Build pages-index.html + lean data/pages.json
├── ref/          # Agent reference docs (read before building)
├── docs/         # Wiki — human-facing companion to ref/
├── starters/     # Single-file copy-paste HTML templates
└── examples/     # Multi-file project templates (clone whole)
```

## Current Phase

Phases 1 + 2 (documentation, starters, core CSS/JS extraction) are complete. **Phase 3** (eqPartners back-port + spreadsheet bootstrap) is now shipped:
- **Spreadsheet-driven project bootstrap** — `tools/nib-ingest.js` turns one workbook (xlsx, Google Sheets sharing URL via CSV, or Sheets API with `--auth`) into a complete Nib project (sections, tokens, personas, stories, blueprints, registries). `tools/nib-sync.js` does idempotent re-ingest with diff. Schema in `core/schema/workbook.schema.json`. See `ref/spreadsheet-authoring.md`.
- **Service blueprint canvas** — React Flow-based editable swimlane canvas (`core/blueprint/`). Overview/Detail toggle. Breadcrumb drill-down through nested blueprints (via `meta:parent` + `childBlueprintId`). Round-trip xlsx export. `examples/service-blueprint/` is the worked example. See `ref/service-blueprint.md`.
- **Feedback → Issue consolidation** — Worker (`examples/cloudflare-worker/`) now supports `node_id` labels, `/api/nodes/counts` cache, and `/api/card-sort`. Triage tool lifted to `examples/feedback-triage/`. Panel sends `node_id` from `window._wfActiveNodeId`. See `ref/feedback.md`.
- **Context bar evolution** — `wfCopyDeepLink()` always-on (click current breadcrumb to copy URL); `document.lastModified` timestamp; `core/proto-search.js` opt-in portal header + search widget + Ask AI mode (gated by `WIREFRAME_CONFIG.portalHeader` / `.search`). See `ref/context-bar.md`.
- **Project templates** — `examples/spreadsheet-bootstrap/`, `service-blueprint/`, `feedback-triage/`, `research-study/` (lifted card-sort), plus existing `deal-registration/` etc. cataloged in `ref/templates.md`.

**Phase 4** (eqPartners back-port — second wave) is now shipped:
- **Deck / slides engine** — `core/proto-deck.{js,css}` graduates the design-review deck engine: scroll-snapping or fixed 1600×900 canvas slides, keyboard nav, SVG export. Starters `deck.html` / `deck-fit.html`; example `examples/design-review/`. See `docs/Decks.md`.
- **Service-blueprint viewer layer** — `core/blueprint/` gains an optional analytical-viewer mode: a 57-SVG thumbnail system, text search + browser-find, a filter rail, a sentiment/research-evidence model, persona-key raise/knock. Additive — the editor is unchanged; gated by `mountCanvas` options. See `docs/Service-Blueprint.md`.
- **Evidence-driven fidelity** — `data-wf-evidence` marks how grounded a region is; `core/proto-evidence.{js,css}` renders the prototype as a heatmap of design certainty (guesses rough, validated crisp). The page-level successor to `data-wf-confidence`. See `docs/Evidence.md`.
- **Components & utilities** — `proto-analytics.js`, `proto-kpi-filter.js`, `proto-wizard-help.js`, `proto-signals.js`, `surfaces/salesforce-polish.js`, `surfaces/internal-ds-extended.css` (~240 net-new `ds-` components), a design-notes Changelog tab, and agentic-retrieval tooling (`tools/nib-seed-topics.js`, `nib-pages-index.js`). See `docs/Agentic-Retrieval.md`.
- **Neutral-gray palette** — the default token ramp is now neutral gray (`--wf-ink #27282a` …); the blueprint grid and `--wf-accent` stay blue, so blueprint mode still reads as a blueprint. Napkin overrides the palette regardless.

Phase 2 features (still active):
- **Tabbed design notes** — 5-tab panel (Context / Design / Technical / Reviews / Changelog) with auto-split
- **normalizeJourneys** — journey data normalization for consistent rendering
- **detectSurface** — automatic surface detection from page markup
- **buildSurfaceHeader** — surface-aware header construction
- **Story mode consolidation** — unified story/narrative layout engine
- **AC badge auto-injection** — automatic acceptance criteria badges on wireframe elements
- **Reference hub components** — reusable patterns for documentation and reference pages
- **Declarative Page Blueprint** — `proto-gen.js` renders pages from `PAGE_BLUEPRINT` data objects (6 layouts, 9 block types, 4 surface headers)
- **Compose Runtime** — `proto-compose.js` transforms `COMPOSE` objects (template references + variable substitution) into `PAGE_BLUEPRINT` objects, registers 7 new block types (component-card, wizard-hero, wizard-body, action-bar, alert, filter-bar, skeleton)

## Design Token Summary

| Token | Hex | Use |
|-------|-----|-----|
| `--wf-ink` | #27282a | Headings, borders |
| `--wf-text` | #4a4c4e | Body text |
| `--wf-muted` | #646567 | Secondary text, labels |
| `--wf-line` | #c4c5c7 | Borders, dividers |
| `--wf-tint` | #e4e4e6 | Subtle fills |
| `--wf-surface` | #eeeeef | Card backgrounds |
| `--wf-canvas` | #f3f3f4 | Page background |
| `--wf-accent` | #3d6daa | The ONE blue (blueprint grid stays blue) |
| `--wf-red` | #8b4553 | Errors, overdue |
| `--wf-amber` | #6b5a2f | Warnings, pending |
| `--wf-green` | #45785a | Success, confirmed |
| `--wf-purple` | #6b5b8a | AI, suggestions |
| `--wf-paper-shadow` | (layered) | Paper depth shadows |
| `--wf-tape-color` | rgba(220,228,200,0.55) | Tape strip fill |
| `--wf-pin-color` | #c0392b | Pushpin dot |

## Key Rules

- Never hardcode hex values — always use tokens
- One surface CSS per page — don't mix Slack + SFDC
- `wf-` prefix = shared core components
- Surface prefix (`slack-`, `sfdc-`, `ds-`) = platform-specific
- Buttons use `.btn` / `.btn-primary` everywhere (no prefix)
- Every page needs design notes (`wf-design-notes` div)
- Script load order: `project-data.js` THEN `proto-nav.js` (add `proto-gen.js` last for blueprint pages)
- Fidelity slider (Napkin/Blueprint/Polished) controls `--wf-wobble-radius`, `--wf-grain-opacity`, `--wf-grid-opacity` — never hardcode these
- Use `data-wf-evidence` (page-level, with `core/proto-evidence.{js,css}`) or the older `data-wf-confidence` on uncertain features — the aesthetic communicates design certainty
- Decks are a separate presentation surface — `core/proto-deck.*` with its own `--deck-*` palette; do not mix deck classes into wireframe pages
- Paper utilities (`.wf-tape`, `.wf-pin`, `.wf-torn-*`, `.wf-stacked`, `.wf-sketch`) use pseudo-elements — don't conflict
- User stories (JTBD) live in design notes and the JTBD hub; design stories (implementation tracking) live in DESIGN_STORIES and the Design Stories page; personas live on the Personas page — don't conflate them
- When a bug is reported, don't start by trying to fix it. Instead, write a test that reproduces the bug first. Then, have subagents try to fix the bug and prove it with a passing test.
