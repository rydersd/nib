# Page Blueprint

**Tags:** `reference` · `declarative` · `blueprint` · `runtime`

Declarative page generation. Write a `PAGE_BLUEPRINT` data object — `proto-gen.js` renders it into a framework-compliant wireframe using the existing CSS classes and [[Design-Tokens|design tokens]].

## When to use

- Data-driven pages (API responses, config files)
- SFDC record pages, dashboards, list views, forms
- When you want consistent output without remembering CSS class names

For hand-crafted custom layouts, write HTML directly using [[Page-Template]].

## Script load order

```html
<script src="project-data.js"></script>
<script src="../core/proto-nav.js"></script>
<script src="blueprint-data.js"></script>    <!-- defines PAGE_BLUEPRINT -->
<script src="../core/proto-gen.js"></script>  <!-- reads and renders it -->
```

The blueprint data must load **after** `proto-nav.js` (so the context bar exists) and **before** `proto-gen.js` (so the data is available when the renderer runs). `proto-gen.js` always loads **last**.

## Complete data structure

```javascript
var PAGE_BLUEPRINT = {

  /* --- Required --- */
  surface: 'sfdc',           // 'sfdc' | 'slack' | 'internal' | 'generic'
  layout: 'record-3col',     // Layout type (see Layouts below)

  /* --- Header (optional) --- */
  header: {
    icon: '🏢',              // Emoji or text for record icon
    type: 'Account',         // Record type / subtitle
    name: 'Acme Corp',       // Primary name
    status: {                // Status badge
      label: 'Active',
      color: 'green'         // 'green' | 'amber' | 'red' | 'purple' | null
    },
    actions: ['Edit', 'Clone', 'Delete']  // Button labels (first = primary)
  },

  /* --- Highlights (SFDC only, optional) --- */
  highlights: [
    { label: 'Owner', value: 'Sarah Chen' },
    { label: 'Industry', value: 'Technology' }
  ],

  /* --- Path Bar (SFDC only, optional) --- */
  path: {
    steps: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
    current: 'Proposal',
    complete: ['Prospect', 'Qualified']
  },

  /* --- Content Columns --- */
  columns: {
    left:   [ /* array of section blocks */ ],
    center: [ /* array of section blocks */ ],
    right:  [ /* array of section blocks */ ]
  },

  /* --- Design Notes (optional) --- */
  notes: {
    summary: 'What this page shows and why.',
    jtbd: [
      'When I need to review account details, I want a single view of all related data.'
    ],
    designSpec: 'Layout description, component choices, interaction patterns.',
    technical: 'Implementation details, API calls, data sources.',
    acceptance: [
      'Page loads in under 2 seconds',
      'All related lists show correct record counts'
    ]
  },

  /* --- Page-level confidence (optional) --- */
  confidence: 'confirmed'    // 'confirmed' | 'partial' | 'uncertain'
};
```

## Layouts

| Layout | Description | Column usage |
|--------|-------------|-------------|
| `record-3col` | SFDC-style 3-column record page | left, center, right |
| `dashboard` | KPI + grid layout | left + right (2-col grid), or center (full-width) |
| `list` | Filterable table / list view | center only |
| `detail` | Single entity with sidebar | center (main) + right (sidebar) |
| `form` | Form-centric narrow layout | center only (wrapped in card) |
| `canvas` | Freeform full-width | all columns rendered sequentially |

## Section block types

Nine built-ins, plus project extensions via `wfRegisterBlock()` and the seven blocks registered by [[Page-Compose|proto-compose.js]].

### `detail-grid`

Two-column label/value grid for record fields.

```javascript
{
  type: 'detail-grid',
  fields: [
    { label: 'Account Name', value: 'Acme Corp' },
    { label: 'Description', value: 'Enterprise software company', span: 2 }
  ]
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fields` | Array | Yes | Array of field objects |
| `fields[].label` | string | Yes | Field label text |
| `fields[].value` | string | Yes | Field value (supports HTML) |
| `fields[].span` | number | No | Set to `2` for full-width field |

### `related-list`

Titled table with record rows, styled as a card.

```javascript
{
  type: 'related-list',
  title: 'Contacts',
  columns: [
    { label: 'Name', field: 'name' },
    { label: 'Title', field: 'title' }
  ],
  rows: [
    { name: 'Sarah Chen', title: 'VP Sales' },
    { name: 'Mike Torres', title: 'CTO' }
  ]
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Card header title |
| `columns` | Array | Yes | Column definitions |
| `columns[].label` | string | Yes | Column header text |
| `columns[].field` | string | Yes | Key in row objects |
| `rows` | Array | Yes | Data rows |

### `card`

Generic content card.

```javascript
{
  type: 'card',
  title: 'Key Insights',
  content: '<p>This account has grown <strong>32%</strong> year over year.</p>',
  variant: 'accent'    // SFDC: 'accent', 'green', 'amber', 'red', 'purple'
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Card header title |
| `content` | string | No | HTML content for card body |
| `variant` | string | No | SFDC card accent variant |

### `kpi-row`

Horizontal row of KPI metric cards.

```javascript
{
  type: 'kpi-row',
  items: [
    { label: 'Total Revenue', value: '$4.2M', trend: '+12% vs last quarter', color: 'green' },
    { label: 'Open Deals', value: '23', trend: '-3 vs last month', color: 'red' },
    { label: 'Win Rate', value: '68%' }
  ]
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | Array | Yes | KPI card definitions |
| `items[].label` | string | Yes | Metric label |
| `items[].value` | string | Yes | Metric value |
| `items[].trend` | string | No | Trend text |
| `items[].color` | string | No | Trend color: `green` (up) or `red` (down) |

### `timeline`

Activity timeline / feed.

```javascript
{
  type: 'timeline',
  items: [
    { date: 'Mar 10, 2:30 PM', actor: 'Sarah Chen', action: 'updated stage', detail: 'Moved to Proposal' },
    { date: 'Mar 8, 11:00 AM', actor: 'AI Assistant', action: 'flagged risk', detail: 'Champion went silent for 14 days' }
  ]
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | Array | Yes | Timeline entries |
| `items[].date` | string | No | Timestamp text |
| `items[].actor` | string | No | Person/system name (used for avatar initials) |
| `items[].action` | string | No | Action description |
| `items[].detail` | string | No | Additional detail text |

### `form`

Form with labeled field groups.

```javascript
{
  type: 'form',
  title: 'Contact Information',
  fields: [
    { type: 'text', label: 'Full Name', required: true },
    { type: 'email', label: 'Email', placeholder: 'user@company.com' },
    { type: 'select', label: 'Role', options: ['Admin', 'User', 'Viewer'], value: 'User' },
    { type: 'textarea', label: 'Notes', placeholder: 'Additional details...' },
    { type: 'checkbox', label: 'Send welcome email', value: true },
    { type: 'date', label: 'Start Date' },
    { type: 'number', label: 'Team Size' }
  ]
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Form section heading |
| `fields` | Array | Yes | Field definitions |
| `fields[].type` | string | Yes | `text`, `email`, `select`, `textarea`, `checkbox`, `date`, `number` |
| `fields[].label` | string | Yes | Field label |
| `fields[].value` | string/boolean | No | Default value |
| `fields[].options` | Array | No | Options for select fields |
| `fields[].required` | boolean | No | Show required indicator |
| `fields[].placeholder` | string | No | Placeholder text |
| `fields[].hint` | string | No | Help text below input |

### `table`

Standalone data table (not wrapped in a card like `related-list`).

```javascript
{
  type: 'table',
  title: 'Pipeline Report',
  sortable: true,
  columns: [
    { label: 'Deal', field: 'deal' },
    { label: 'Amount', field: 'amount' },
    { label: 'Stage', field: 'stage' }
  ],
  rows: [
    { deal: 'Acme Expansion', amount: '$500K', stage: '<span class="wf-badge wf-badge-green">Proposal</span>' }
  ]
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Section title above table |
| `sortable` | boolean | No | Show sort indicators on headers |
| `columns` | Array | Yes | Column definitions |
| `rows` | Array | Yes | Data rows (values can contain HTML) |

### `chart-placeholder`

Visual placeholder for a chart that would be implemented later.

```javascript
{
  type: 'chart-placeholder',
  title: 'Revenue by Quarter',
  chartType: 'Bar Chart',
  height: '200px'
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Card header title |
| `chartType` | string | No | Label shown in placeholder (e.g., "Bar Chart") |
| `height` | string | No | CSS height for placeholder area (default: `180px`) |

### `empty-state`

Empty state with icon, message, and optional action.

```javascript
{
  type: 'empty-state',
  icon: '📭',
  heading: 'No records found',
  body: 'Create your first record to get started.',
  action: 'Create Record'
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | string | No | Emoji or text icon |
| `heading` | string | No | Heading text |
| `body` | string | No | Description text |
| `action` | string | No | CTA button label |

## Surface-specific behavior

What each `surface` value renders — see [[Surfaces]] for the overlay CSS itself.

### SFDC (`surface: 'sfdc'`)
- Generates `sfdc-record-header` with icon, type, name, status badge
- Generates `sfdc-highlights-bar` from `highlights` array
- Generates `sfdc-path-bar` from `path` object
- Uses `sfdc-card`, `sfdc-card-header`, `sfdc-detail-grid` classes
- Actions use `sfdc-btn` / `sfdc-btn-primary` classes
- `record-3col` layout uses the `sfdc-record-layout` grid

### Slack (`surface: 'slack'`)
- Generates channel header with `#` prefix
- Uses generic button classes

### Internal (`surface: 'internal'`)
- Generates `ds-page-header` with title and subtitle
- Uses `ds-kpi-grid`, `ds-kpi-card` for KPI blocks
- Uses `ds-page-container` for page wrapping

### Generic (`surface: 'generic'`)
- Simple header with no surface-specific styling
- Uses `wf-*` framework classes throughout

## Design notes

When `notes` is provided, `proto-gen.js` creates a hidden `.wf-design-notes` div that `proto-nav.js` reads to populate the [[Design-Notes|notes panel]]:

- **Context tab:** `summary` + `jtbd` items
- **Design tab:** `designSpec` content
- **Technical tab:** `technical` content + `acceptance` criteria

## Confidence attribute

Set `confidence` at the page level to apply `data-wf-confidence` to the page wrapper. This controls the visual rendering of design certainty (wobble, borders) per [[Confidence-Levels]] and the [[Fidelity-Levels|fidelity system]].

## Full usage example

```html
<!DOCTYPE html>
<html lang="en" class="wireframe">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acme Corp — Account</title>
  <link rel="stylesheet" href="../core/proto-core.css">
  <link rel="stylesheet" href="../surfaces/salesforce.css">
</head>
<body>
  <!-- proto-gen.js will create <main> and populate it -->

  <script src="project-data.js"></script>
  <script src="../core/proto-nav.js"></script>
  <script>
  var PAGE_BLUEPRINT = {
    surface: 'sfdc',
    layout: 'record-3col',
    header: {
      icon: '🏢', type: 'Account', name: 'Acme Corp',
      status: { label: 'Active', color: 'green' },
      actions: ['Edit', 'Clone']
    },
    highlights: [
      { label: 'Owner', value: 'Sarah Chen' },
      { label: 'Industry', value: 'Technology' }
    ],
    path: {
      steps: ['Prospect', 'Qualified', 'Proposal', 'Closed Won'],
      current: 'Proposal',
      complete: ['Prospect', 'Qualified']
    },
    columns: {
      left: [
        { type: 'related-list', title: 'Contacts', columns: [
          { label: 'Name', field: 'name' }, { label: 'Title', field: 'title' }
        ], rows: [
          { name: 'Sarah Chen', title: 'VP Sales' }
        ]}
      ],
      center: [
        { type: 'detail-grid', fields: [
          { label: 'Website', value: 'acme.com' },
          { label: 'Phone', value: '(555) 123-4567' }
        ]}
      ],
      right: [
        { type: 'timeline', items: [
          { date: 'Mar 10', actor: 'Sarah Chen', action: 'updated stage' }
        ]}
      ]
    },
    notes: { summary: 'Account record page for Acme Corp.' },
    confidence: 'confirmed'
  };
  </script>
  <script src="../core/proto-gen.js"></script>
</body>
</html>
```

## Rules

- `layout` is the only required field — everything else is optional
- `surface` defaults to `'generic'` if not specified
- Use `columns.center` for the primary content area in all layouts
- For `record-3col`, use all three column keys (left, center, right)
- For `dashboard`, use left + right for a 2-column grid, or center for full-width
- Field values in `detail-grid`, `table`, and `related-list` can contain HTML strings
- The `notes` object generates hidden markup that `proto-nav.js` reads — it does not render visibly
- Load `proto-gen.js` **last** in the script chain

## Blueprint vs Compose

Blueprint is direct block-level control. [[Page-Compose]] is a higher-level template layer that transforms into a blueprint — use compose for SLDS-pattern pages (record pages, list views, wizards), blueprint for everything else.

---

## Related

- [[Page-Compose]] — template-level abstraction on top of blueprint
- [[Page-Template]] — for hand-crafted HTML
- [[Surfaces]] — what each `surface` value renders
- [[Design-Notes]] — how the `notes` object populates the panel
- [[Confidence-Levels]] — the optional page-level `confidence` field
