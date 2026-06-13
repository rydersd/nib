**Tags:** `authoring` · `bootstrap`

# Spreadsheet Authoring

The default way to start a Nib project. One Excel workbook (or Google Sheet) becomes a working multi-page wireframe project — pages, tokens, personas, journeys, blueprints, stories, registries — via the `nib-ingest` CLI.

> **Agent reference:** [`ref/spreadsheet-authoring.md`](../ref/spreadsheet-authoring.md) is the source of truth for the workbook schema and CLI flags.

## Why spreadsheets

Service designers already live in Excel and Google Sheets. Most service blueprints, persona inventories, and feature matrices land there before they land in code. Nib reads that workbook directly so the team's existing artifact becomes the project.

The same schema validates Excel files, Google Sheets pulled via API, and hand-authored JS — pick whichever input matches the team's workflow.

## Two-minute round-trip

```sh
# Bootstrap a project from a workbook
node tools/nib-ingest.js my-project.xlsx --out ./my-project

# Re-sync after editing the workbook (only changed files are rewritten)
node tools/nib-sync.js --project ./my-project

# CI mode: fail if the workbook and the project drift
node tools/nib-sync.js --project ./my-project --check
```

## Three kinds of tabs

| Kind | Examples | What they drive |
|---|---|---|
| **Reserved** | `meta`, `pages`, `tokens`, `personas`, `stories` | Project-level config, sitemap, design tokens, personas, stories |
| **Flow** | any non-reserved tab — e.g. `program`, `deal-reg`, `onboarding` | Service blueprint flows (one per tab) |
| **Registry** | `_initiatives`, `_<name>` | Controlled vocabularies emitted to `data/registries/` |

## Nested blueprints (leadership view)

A flow tab declares `meta:parent` to anchor itself under another blueprint. A node row carries `childBlueprintId` to make itself a drill-in target. Together those two cells produce the bird's-eye Overview ↔ Detail drill-down used by leadership: top-level program lanes plus a 3-bullet "what changes" card on the parent, click-through into the child for the granular swimlane.

The full editable React Flow canvas that consumes this hierarchy ships in [[Service-Blueprint]].

## Inputs supported

- `.xlsx` files (SheetJS)
- Google Sheets sharing URLs (downloads via `/export?format=xlsx` — no auth, sheet must be share-accessible)
- Google Sheets published-to-web URLs (`/pubhtml`)
- Single CSV URLs
- Google Sheets API (opt-in via `--auth creds.json`, for private sheets)

## Worked example

`examples/spreadsheet-bootstrap/` ships with a 9-tab workbook covering every feature (incl. a 3-flow nested blueprint), the generated project files, and an `index.html` demoing the full output.

```sh
node examples/spreadsheet-bootstrap/build-example-workbook.js   # rebuild example.xlsx
node tools/nib-ingest.js examples/spreadsheet-bootstrap/example.xlsx \
  --out examples/spreadsheet-bootstrap
open examples/spreadsheet-bootstrap/index.html
```

## Related

- [[New-Project]] — Other ways to start (hand-authored, blank starter, copy-from-example)
- [[Service-Blueprint]] — The React Flow canvas that round-trips the blueprint tabs
- [[Templates]] — Project-level scaffolds you can clone whole
- [[Page-Blueprint]] — Block types the `pages` tab `template` column references
