# Spreadsheet-Driven Project Authoring

> ⚠️ **Deprecated.** Edit [`docs/Spreadsheet-Authoring.md`](../docs/Spreadsheet-Authoring.md) instead. This file will be removed in a future release.

> Read when scaffolding a Nib project from an Excel workbook or Google Sheet. The spreadsheet is the source of truth; `data/*.js` files in the project are generated.

## Why

A Nib project — pages, tokens, personas, journeys, blueprints, stories — can be authored entirely in one workbook. Service designers stay in the tools they already use; the framework reads the workbook and writes the project files.

This is the **default** way to start a Nib project. Hand-authoring `project-data.js` files still works (and is documented in [`new-project.md`](new-project.md)) but spreadsheet bootstrap is the recommended path.

## CLI

Two scripts in `tools/`:

| Tool | Purpose |
|---|---|
| `nib-ingest` | First-time scaffold or full rewrite. Reads workbook → writes `data/*.js`. |
| `nib-sync` | Idempotent re-ingest. Diffs against the existing project; only writes changed files. |

Run from the repo root:

```sh
node tools/nib-ingest.js my-project.xlsx --out ./my-project
node tools/nib-sync.js --project ./my-project          # picks up source from data/source-of-truth.txt
node tools/nib-sync.js --project ./my-project --check  # CI mode: exit 1 if drift
```

## Inputs

`<input>` to `nib-ingest` may be:

| Form | Adapter | Auth |
|---|---|---|
| `path/to/workbook.xlsx` | xlsx | none |
| `https://docs.google.com/spreadsheets/d/<id>/edit?...` (sharing URL) | sheets-csv (downloads xlsx via `/export?format=xlsx`) | none — sheet must be share-accessible |
| `https://docs.google.com/spreadsheets/d/e/<pubid>/pubhtml` (published URL) | sheets-csv (per-tab CSV) | none — sheet must be published to web |
| `https://docs.google.com/.../?output=csv` (single CSV URL) | sheets-csv | none |
| Sharing URL + `--auth creds.json` | sheets-api (googleapis) | service account, viewer access |

The Sheets API path is opt-in (`--auth <creds.json>`). It requires `googleapis` to be installed (`npm install googleapis`) and a Google Cloud service account credentials JSON. The service account must be granted at least Viewer on the sheet.

## Workbook schema

Three kinds of tabs.

### 1. Reserved structural tabs

All optional except `meta`.

#### `meta` — project config

Two-column key/value rows. Header row (`key`, `value`) optional.

| key | example value |
|---|---|
| `title` | `Acme Partner Channel Program` |
| `theme` | `Nib` |
| `defaultSurface` | `salesforce` / `slack` / `internal` / `blueprint` |
| `feedbackEndpoint` | `/api/feedback` |
| `emailRecipient` | `design-team@example.com` |
| `portalHeader` | `true` (Track 4 opt-in) |
| `search` | `true` or `{ai:true}` (Track 4 opt-in) |
| `changelog` | `true` (Track 4 opt-in) |

Dotted keys (`portalHeader.logo`) fold into nested objects. Unknown keys pass through to `WIREFRAME_CONFIG`.

#### `pages` — sitemap

Header row required: `id, label, parent, surface, template, icon, summary, personaId, storyIds, blueprintId`.

- `parent` empty → top-level section
- `parent: <id>` → page becomes an item under that section
- `template` → starter name (e.g. `compose-record`, `blueprint-dashboard`); used by future codegen
- `blueprintId` → page renders the named blueprint flow
- List cells (`storyIds`) accept `;` or newline separators

#### `tokens` — CSS variable overrides

Two-column `name | value` rows. Header row optional. Bare names (without `--` prefix) get `--wf-` prepended automatically. Emits `data/tokens.css` with a `:root { ... }` block.

#### `personas` — persona records

Header row required: `id, label, role, org, initials, color, summary, jtbd, pains, goals`. List columns are `;` or newline separated. Emits `data/personas.js` setting `window.PERSONAS`.

#### `stories` — JTBD + design stories

Header row required: `id, title, kind, personaId, summary, status, pageIds, criteria`. `kind` is `jtbd` (default) or `design`. Design stories land in `DESIGN_STORIES`; everything goes into `STORY_TITLES`.

### 2. Flow tabs (one per service blueprint)

Any tab whose name isn't reserved and doesn't start with `_` is a service blueprint. Format extends the eqPartners convention with five new meta rows for the leadership Overview view:

```
Row 1:  meta:title           | <Flow title>
Row 2:  meta:phases          | recruit, onboard, enable, transact, retain
Row 3:  meta:lanes           | sentiment:signal | partner-future:future:partner | ...
Row 4:  meta:parent          | <parent-flow-id>          ← drives Overview drill-down
Row 5:  meta:summary         | <one-line outcome>         ← Overview card
Row 6:  meta:whatChanges     | bullet 1; bullet 2; …      ← Overview card bullets
Row 7:  meta:ownerPersonaId  | <persona-id>
Row 8:  meta:status          | draft | review | live | archived
Row 9:  (blank)
Row 10: HEADERS              | id | phase | lane | label | summary | status | predecessors | childBlueprintId | sentimentEmoji | sentimentLabel | …
Row 11+: data rows
```

**Lane format:** `id[:tier[:actorGroup]]`. Valid tiers: `current`, `future`, `signal`. Lanes with `tier: signal` consume rows as sentiment cells, reading `sentimentEmoji` / `sentimentLabel` columns instead of producing nodes.

**`childBlueprintId` on a node** makes it a drill-in. In the canvas Overview mode, the node renders with an "open" affordance; clicking pushes the named child onto the breadcrumb stack.

**Edges:** Authored via the `predecessors` column — semicolon-separated list of node ids. Inline overrides via bracket syntax: `predId[style=improvement,label=Smart form]`. Cross-tier edges within the same `actorGroup` auto-detect as `improvement`.

### 3. Registry tabs (underscore-prefixed)

Any tab starting with `_` is a registry. Header row must include `id`. All other columns become entry properties. Emitted to `data/registries/<name>.js` (without the underscore) as `window.NIB_REGISTRIES[name]`.

## Generated outputs

```
<project>/
└── data/
    ├── wireframe-config.js   ← WIREFRAME_CONFIG
    ├── sections.js           ← SECTIONS (drives drawer + breadcrumbs)
    ├── tokens.css            ← :root { --wf-*: ...; }
    ├── personas.js           ← window.PERSONAS, window.STORY_MAP scaffold
    ├── stories.js            ← DESIGN_STORIES + STORY_TITLES
    ├── blueprints/
    │   ├── _index.js         ← NIB_BLUEPRINT_INDEX (hierarchy)
    │   └── <flowId>.js       ← one per blueprint flow
    ├── registries/
    │   └── <name>.js         ← one per `_` tab
    └── source-of-truth.txt   ← Idempotent sidecar
```

Load order in HTML (after generation):

```html
<script src="data/wireframe-config.js"></script>
<script src="data/sections.js"></script>
<script src="data/personas.js"></script>
<script src="data/stories.js"></script>
<script src="data/blueprints/_index.js"></script>
<!-- per-flow blueprint files as needed -->
<script src="../nib/core/proto-nav.js"></script>
```

## Worked example

`examples/spreadsheet-bootstrap/` ships with a complete worked workbook (9 tabs incl. a 3-flow nested blueprint) plus generated outputs and an `index.html` that consumes them. Read the example's [`README.md`](../examples/spreadsheet-bootstrap/README.md) for a step-by-step round-trip.

## Round-trip with the React Flow canvas

The service blueprint canvas (Track 2 / `examples/service-blueprint/`) consumes the same `BlueprintFlow` shape produced by ingest. Its export emits an `.xlsx` that re-ingests cleanly — round-trip is the contract.

## Schema reference

The canonical project shape is defined in [`core/schema/workbook.schema.json`](../core/schema/workbook.schema.json) (JSON Schema). The same schema validates Excel, CSV, Sheets API, and hand-authored JS — so `ajv`-validating a generated `data/*.js` payload is a quick way to spot drift.
