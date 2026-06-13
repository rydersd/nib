**Tags:** `bootstrap` · `templates`

# Project Templates

Don't start blank. Pick the closest template, copy the directory, run `nib-ingest` against your workbook, and edit. Every template lives in `examples/` and is tracked alongside the framework so it never drifts from `core/`.

> **Agent reference:** [`ref/templates.md`](../ref/templates.md) for the full catalog with file lists.

## What's in the box

| Template | Use when |
|---|---|
| [[Spreadsheet-Authoring\|spreadsheet-bootstrap]] | Excel / Google Sheets is the source of truth |
| [[Service-Blueprint\|service-blueprint]] | Building a swimlane service blueprint, especially with nested sub-blueprints + leadership Overview |
| feedback-triage | Reviewing prototype feedback captured as local JSON files |
| research-study | Card sorts, persona libraries, JTBD maps, interview synthesis |
| deal-registration | Multi-step approval / submission flows (the canonical "journey flow" template) |
| cloudflare-worker | Backend for [[Feedback]], card-sort submissions, and canvas comment counts |
| kanban-board · data-table · charts-dashboard · agent-chat · pinterest-board · newspaper | Smaller scaffolds for specific UI patterns |

## Compose templates

Real projects usually combine templates. The most common stack:

1. `spreadsheet-bootstrap` — workbook + ingest as the base
2. `service-blueprint` — canvas page for any blueprint flows
3. `feedback-triage` — review-cycle interface
4. `cloudflare-worker` — backend tying them together

All consume the same canonical project shape (`core/schema/workbook.schema.json`), so they compose cleanly.

## Why templates, not starters

Single-file `starters/*.html` boilerplates are the right primitive for adding **one page** to an existing project. Templates are the right primitive for **starting** a project — they include the directory layout, project-data, generated data files, and any backend wiring expected for that project type.

When in doubt: clone a template; if it's overkill, drop the parts you don't need.

## Related

- [[New-Project]] — the full bootstrap workflow
- [[Spreadsheet-Authoring]] — workbook schema all templates can be re-ingested from
- [[Service-Blueprint]] — the canvas template's runtime
- [[Feedback]] — backend wiring for templates that consume feedback
