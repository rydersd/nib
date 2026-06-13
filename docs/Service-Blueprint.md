**Tags:** `authoring` · `blueprint` · `react-flow`

# Service Blueprint Canvas

An editable React Flow swimlane canvas for service blueprints. Pair it with [[Spreadsheet-Authoring]] — the canvas reads `BlueprintFlow` objects produced by `nib-ingest` and writes back to the same workbook on demand.

> **Agent reference:** [`ref/service-blueprint.md`](../ref/service-blueprint.md) for the API, schema, and layout constants.

## Two views, one canvas

- **Overview** — the leadership bird's-eye. Each lane condenses to a single row; a summary card above shows `meta:summary` plus a 3-bullet "what changes" list and the owner persona. Sub-blueprints surface as drill-in chips.
- **Detail** — the full granular swimlane. All cards stacked per (phase, lane) cell, sentiment cells in signal lanes, edges visible.

A toolbar segmented control toggles between the two.

## Nested blueprints

A node in any flow can carry `childBlueprintId`. In the canvas it gets a small **↳ Open** chip — click it to push the child onto the breadcrumb stack and re-render the canvas with that child's data. The breadcrumb walks back up.

The hierarchy itself is built from `meta:parent` on each child flow tab; the ingest emitter writes that into `data/blueprints/_index.js`.

## What you can edit in v1

- Drag a card between lanes / phases (drop position resolves to the new cell)
- Double-click a card to rename inline
- Click a lane or phase header to rename inline
- Add a lane / phase from the toolbar; remove via the `×` button on the header
- Drag from a card's right edge to another card's left edge to add an edge
- Select an edge or card → Delete to remove
- ⌘Z / ⇧⌘Z for undo/redo

## Deferred to v1.1

- Drag-reorder of lanes (operations.js has `reorderLane`, just no UI yet)
- Drag-reorder of phases
- Marquee multi-select + bulk move/delete

## Viewer features (optional, additive)

The editor described above is the default. On top of it the canvas ships an **analytical viewer layer** — back-ported from the eqPartners journey viewer — that is **off by default** and turned on per-feature via `mountCanvas` options. None of it changes the editor; with no options you get the plain editor.

```js
mountCanvas(el, {
  blueprints: window.NIB_BLUEPRINTS,
  rootFlowId: 'program',
  // viewer options ─────────────────────────────
  mode: 'editor',          // 'editor' (default) | 'viewer' (read-only)
  search: true,            // text search + browser-find navigation
  filterRail: true,        // <details>-popover filter rail in the toolbar
  personaKey: true,        // persona-key raise / knock-back panel
  personas: window.PERSONAS, // data-driven persona colours + labels
});
```

| Option | Default | Effect |
|---|---|---|
| `mode` | `'editor'` | `'viewer'` hides all editing affordances (no drag, rename, add/remove, undo) — Export stays available. |
| `search` | `false` | Adds a search box. Terms are ANDed; a node matches on label / summary / interaction phrase / persona / status / gap notes, a cell on note / sentiment / evidence. Non-matches dim to 40%. Browser-find nav shows a `3 / 12` count; Enter / Shift+Enter jump and pan-zoom to the match (current match gets an accent ring). |
| `filterRail` | `false` | Adds the filter rail: multi-select popovers (Persona, Status, Actor, Initiatives), a Tier segmented control, a Gaps chip, presets, and Reset. Filters **dim, never hide** — relationships stay visible. |
| `personaKey` | `false` | Adds a collapsible persona-key legend (bottom-right). Clicking a persona **raises** matching cards off the surface and **knocks others back** to 70%. |
| `personas` | `{}` | The persona palette. Pass `window.PERSONAS` straight from `data/personas.js`; the canvas reads `{ id: { label, color } }`. Without it, a generic token palette is assigned. |

**Escape** is two-stage: the first press closes any open filter popover; with none open it resets every filter + the search query.

### Thumbnail interaction cards

A node may carry a `thumbnail` key (e.g. `form`, `card.grid`, `stepper.wizard`, `sfdc--dashboard`). When it does, the card renders a persona-colour strip, then title + summary, then an inset UI-archetype SVG, then a "core-interaction" phrase derived from the archetype. 57 thumbnails ship in `core/blueprint/thumbnails/`; the manifest is `core/blueprint/thumbnails.js`.

### Sentiment / research evidence

A sentiment (signal-lane) cell may carry an `evidence[]` array — each item `{ kind, label, source?, sourceUrl? }` with `kind` one of `research`, `spec`, `design-rationale`, `author-construct`. The cell shows a chip for its strongest evidence; clicking the cell opens an evidence drawer listing every citation. Research-dimension kinds (`research`, `design-rationale`) report a two-state **Researched / To research** derivation instead of a kind label. The reusable helpers live in `core/blueprint/evidence.js` (`EVIDENCE_KIND_RANK`, `strongestEvidence`, `evidenceState`, `evidenceChip`) and can be imported independently.

### Persona colours are data-driven

The viewer never hardcodes personas. Colours and labels come from the `personas` option (Nib projects supply `data/personas.js`). The persona strip, persona chip, and persona-key swatches all read that one source.

## Round-trip with the workbook

`Export → XLSX (all flows)` writes a workbook covering every blueprint currently loaded — including any unsaved edits in other flows held in the history stack. Re-running `nib-ingest` against that workbook produces the same canonical project shape, so the canvas → spreadsheet → canvas loop is the contract.

## Persistence

By default the canvas debounces and saves to localStorage under a project namespace. Drop in a custom `SyncAdapter` (`{ load, save }`) to push edits to a backend instead.

## Related

- [[Spreadsheet-Authoring]] — Where the data comes from
- [[Page-Blueprint]] — The other "blueprint" — declarative page rendering, distinct from this swimlane canvas
- [[Templates]] — Project scaffolds that ship with the canvas pre-wired
