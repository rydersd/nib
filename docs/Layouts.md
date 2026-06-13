# Layout Patterns

**Tags:** `pattern` · `layouts`

Grid, sidebar, split-view, and app-shell recipes. Use these instead of inventing new layouts.

> **Agent reference:** [`ref/layouts.md`](../ref/layouts.md) — copy-paste HTML for each pattern.

## Common layouts

| Pattern | Use for |
|---|---|
| 2-column / 3-column grid | Dashboards, side-by-side cards |
| KPI row | Top-of-page metric summary (4+ cards) |
| Sidebar (240px + 1fr) | Portal pages with persistent nav |
| Split view (50/50) | Messages + thread, list + detail |
| Content + fixed panel | Main scroll area + 360px activity panel |
| App shell (rail + sidebar + main) | Slack-style, portal dashboards |
| Tab content area | Sectioned page content |

## Rules

- CSS grid for multi-column, flex for single-axis
- Flex children that scroll need `min-height: 0` (columns) and `min-width: 0` (rows) — prevents blowout
- Borders use `var(--wf-line)` — never hardcoded hex (see [[Design-Tokens]])
- Padding: **16px** for panels, **24px** for page content, **12px** for compact cards

## Surface-specific shells

Each platform surface already ships its own app-shell layout — prefer them over hand-rolled grids when targeting a platform:

- [[Surface-Slack]] — `.slack-shell` (sidebar + main + composer)
- [[Surface-Salesforce]] — `.sfdc-record-page` (3-column record layout)
- [[Surface-Internal]] — `.ds-kpi-grid` + card patterns

## Declarative alternative

When the layout maps to one of the framework's named layouts, skip hand-writing HTML and use a blueprint:

- `record-3col` for SFDC record pages
- `dashboard` for KPI + grid
- `list` / `detail` / `form` / `canvas`

See [[Page-Blueprint]] — `proto-gen.js` renders these layouts from data.

---

## Related

- [[Components]] — primitives that live inside these layouts
- [[Page-Template]] — HTML boilerplate that wraps any layout
- [[Page-Blueprint]] — declarative layout rendering
- [[Design-Tokens]] — border, spacing, and surface tokens
