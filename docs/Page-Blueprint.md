# Page Blueprint

**Tags:** `reference` · `declarative` · `blueprint`

Declarative page generation. Write a data object — `proto-gen.js` renders a compliant wireframe.

> **Agent reference:** [`ref/page-blueprint.md`](../ref/page-blueprint.md) — full prop tables for every layout and block type.

## When to use

- Data-driven pages (API responses, config files)
- SFDC record pages, dashboards, list views, forms
- When you want consistent output without remembering CSS class names

For hand-crafted custom layouts, write HTML directly using [[Page-Template]].

## Script load order

```html
<script src="project-data.js"></script>
<script src="../core/proto-nav.js"></script>
<script src="blueprint-data.js"></script>
<script src="../core/proto-gen.js"></script>
```

`proto-gen.js` loads **last** — after the page's `PAGE_BLUEPRINT` is defined.

## Built-in layouts

| Layout | Columns |
|---|---|
| `record-3col` | left + center + right (SFDC-style) |
| `dashboard` | left + right (2-col grid) or center (full-width) |
| `list` | center |
| `detail` | center + right sidebar |
| `form` | center (wrapped in card) |
| `canvas` | freeform |

## Built-in block types

`detail-grid`, `related-list`, `card`, `kpi-row`, `timeline`, `form`, `table`, `chart-placeholder`, `empty-state` — plus project extensions via `wfRegisterBlock()`.

## Minimal example

```js
var PAGE_BLUEPRINT = {
  surface: 'sfdc',
  layout: 'record-3col',
  header: {
    icon: '🏢', type: 'Account', name: 'Acme Corp',
    status: { label: 'Active', color: 'green' },
    actions: ['Edit', 'Clone']
  },
  highlights: [
    { label: 'Owner', value: 'Sarah Chen' }
  ],
  columns: {
    left:   [ { type: 'related-list', title: 'Contacts', columns: [...], rows: [...] } ],
    center: [ { type: 'detail-grid', fields: [...] } ],
    right:  [ { type: 'timeline', items: [...] } ]
  },
  notes: { summary: 'Account record page.' }
};
```

## Blueprint vs Compose

Blueprint is direct block-level control. [[Page-Compose]] is a higher-level template layer that transforms into a blueprint — use compose for SLDS-pattern pages (record pages, list views, wizards), blueprint for everything else.

---

## Related

- [[Page-Compose]] — template-level abstraction on top of blueprint
- [[Page-Template]] — for hand-crafted HTML
- [[Surfaces]] — what each `surface` value renders
- [[Design-Notes]] — how the `notes` object populates the panel
- [[Confidence-Levels]] — the optional page-level `confidence` field
