# Nib Workbook Schema

`workbook.schema.json` is the canonical project shape produced by every Nib ingest adapter (xlsx, sheets-csv, sheets-api). The whole shape is the project; emitters write `data/*.js` files from it.

## Workbook → Project shape

A Nib workbook has three kinds of tabs:

### 1. Reserved structural tabs (one of each, all optional except `meta`)

| Tab | Drives | Notes |
|---|---|---|
| `meta` | project `meta` (WIREFRAME_CONFIG) | Key/value rows: `key | value`. Reserved keys: `title`, `theme`, `defaultSurface`, `feedbackEndpoint`, `emailRecipient`, `portalHeader`, `search`, `changelog`. |
| `pages` | `pages[]` (SECTIONS + page stubs) | Headers: `id, label, parent, surface, template, icon, summary, personaId, storyIds, blueprintId`. |
| `tokens` | `tokens{}` (CSS var overrides) | Two-column rows: `--wf-name | value`. |
| `personas` | `personas[]` (STORY_MAP + personas page) | Headers: `id, label, role, org, initials, color, summary, jtbd, pains, goals`. List cells use `;` or newline separators. |
| `stories` | `stories[]` (DESIGN_STORIES) | Headers: `id, title, kind, personaId, summary, status, pageIds, criteria`. |

### 2. Flow tabs (one per service blueprint / journey)

Any tab that isn't reserved and doesn't start with `_` is a blueprint flow. Format follows the eqPartners convention with two added meta rows for the leadership Overview view:

```
Row 1:  meta:title       | <Flow title>
Row 2:  meta:phases      | initiate, capture, submit, review, decide
Row 3:  meta:lanes       | csat-band:signal | partner-current:current:partner | ...
Row 4:  meta:parent      | <parent-flow-id>           ← optional, enables drill-up breadcrumb
Row 5:  meta:summary     | <one-line outcome>          ← Overview card
Row 6:  meta:whatChanges | bullet 1; bullet 2; bullet 3 ← Overview card
Row 7:  meta:ownerPersonaId | <persona-id>
Row 8:  meta:status      | draft | review | live | archived
Row 9:  (blank)
Row 10: HEADERS          | id | phase | lane | label | summary | status | predecessors | childBlueprintId | ...
Row 11+: data rows
```

Lane format: `id[:tier[:actorGroup]]`. Valid tiers: `current`, `future`, `signal`. Lanes with `tier: signal` consume rows as sentiment cells (no node), reading `sentimentEmoji` and `sentimentLabel` columns.

`childBlueprintId` on a node row makes it a drill-in: clicking the node in Overview pushes the child flow onto the breadcrumb stack and re-renders the canvas.

### 3. Registry tabs (underscore-prefixed)

| Tab | Becomes |
|---|---|
| `_initiatives` | `data/initiatives.js` |
| `_<name>` | `data/<name>.js` (any registry — `id` column required) |

Cell-internal lists use `;` or newline separators throughout.

## Validation

```js
const Ajv = require('ajv');
const schema = require('./workbook.schema.json');
const validate = new Ajv({ strict: false }).compile(schema);
if (!validate(project)) console.error(validate.errors);
```

The schema is intentionally lenient on list cells (accepts both arrays and `;`-separated strings) so the same schema validates raw ingest output and post-normalized JSON.
