# Project Templates

> ⚠️ **Deprecated.** Edit [`docs/Templates.md`](../docs/Templates.md) instead. This file will be removed in a future release.

> Read when starting a new Nib project — pick the closest template and clone the directory rather than starting blank.

## How to use a template

1. Decide which template fits your project type (table below).
2. Copy the entire `examples/<template>/` directory into your project repo.
3. (Recommended) Run `node tools/nib-ingest.js <your-workbook>.xlsx --out <copied-dir>` so the project data comes from your spreadsheet.
4. Open the template's `README.md` for any template-specific wire-up.

Templates are tracked in the same git repo as the framework so they version with `core/` and never go stale.

## Catalog

| Template | When to use it | Key files |
|---|---|---|
| **`spreadsheet-bootstrap/`** | Any project where Excel/Sheets is the source of truth. The 9-tab worked example covers every Nib data type and demonstrates the leadership Overview pattern with nested blueprints. | `example.xlsx`, `index.html`, `data/*.js` |
| **`service-blueprint/`** | Service design projects with swimlane blueprints and nested sub-flows. Editable React Flow canvas with Overview/Detail toggle and round-trip xlsx export. | `index.html`, references `core/blueprint/canvas.js` |
| **`feedback-triage/`** | Review-mode prototypes where feedback is captured locally as JSON files. File System Access API tool that toggles items between `feedback/` and `resolved/`. | `index.html` |
| **`research-study/`** | UX research artifacts: card sorts, persona libraries, JTBD maps, interview synthesis. Pairs with the Cloudflare Worker's `/api/card-sort` endpoint. | `card-sort.html`, `data/card-sort-*.json` |
| **`deal-registration/`** | Multi-step business flows (wizard with empty/error/loading states + a list view + detail). Generalize for any approval / submission / lifecycle process. | 9 wired HTML files, `project-data.js` |
| **`cloudflare-worker/`** | Backend for the feedback panel, card-sort runner, and node comment counts. Deploy this whenever a project needs to push prototype data to GitHub Issues. | `index.js`, `wrangler.jsonc` |
| **`agent-chat/`** | AI / agent conversational UI prototypes. | `index.html`, `project.css` |
| **`charts-dashboard/`** | KPI/metric dashboards with chart components. | `index.html`, `project.css` |
| **`data-table/`** | Sortable/filterable data grids. | `index.html`, `project.css` |
| **`kanban-board/`** | Column-based workflow boards. | `index.html`, `project.css` |
| **`pinterest-board/`** | Image/grid-heavy listing + detail flows. | `index.html`, `pin-detail.html` |
| **`newspaper/`** | Article listing + reading layouts. | `index.html`, `article.html` |
| **`test-project/`** | QA harness — multiple page types, brand colors, navigation variations. Use to smoke-test framework changes against a representative project. | 8 HTML files |

## Combining templates

Many real projects use several templates together. The most common combo:

- **`spreadsheet-bootstrap/`** as the workbook + ingest base
- **`service-blueprint/`** as the canvas page for any blueprint flows in the workbook
- **`feedback-triage/`** for review-cycle pages
- **`cloudflare-worker/`** as the backend for feedback + canvas comment counts

All four consume the same canonical project shape (`core/schema/workbook.schema.json`), so they compose cleanly.

## Adding a new template

1. Create `examples/<your-template>/` with at minimum:
   - `index.html` (entry point)
   - `README.md` describing when to use it
   - Project data (either hand-authored `project-data.js` or generated `data/*.js` + an `example.xlsx`)
2. Add an entry to this catalog and the wiki ([`docs/Templates.md`](../docs/Templates.md)).
3. If the template depends on a new core module, add a ref doc for that module.
