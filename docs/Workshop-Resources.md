# Workshop Resources

**Tags:** `pattern` · `workshop` · `print` · `deliverables`

Printable workshop starter sheets — blank structural pages you print and draw on by hand. Light-gray guides so your pen reads on top, white ground, safe print margins. The engine is `core/resources.css` + `core/resources.js`; sheets are thin declarative HTML consumed by workshop/resources pages (e.g. eqPartners' `prototype/resources/`).

## How it works

- Each sheet is a paper-sized `.sheet` div; sizes match the PDF export's paper presets
- `resources.css` provides the guide primitives; `resources.js` (29 lines, no deps) expands declarative `data-*` attributes into guide elements so sheet HTML stays thin
- Sheets are **intentionally independent of the wireframe engine** — no `class="wireframe"`, no [[Design-Tokens|`--wf-*` tokens]], no fidelity coupling. They stay clean at every fidelity and print full-bleed (`@page { margin: 0 }`, framework chrome hidden in `@media print`)

```html
<link rel="stylesheet" href="../core/resources.css">
...
<div class="sheet paper--tabloid landscape">
  <div class="rs-head"><h1>Dashboard Sketch</h1></div>
  <div class="rs-fill rs-graphgrid"></div>
</div>
<script src="../core/resources.js"></script>
```

## Paper sizes

`.paper--letter`, `.paper--tabloid`, `.paper--a4`, `.paper--a3` — add `.landscape` to rotate. Dimensions are 96dpi pixel equivalents, so on-screen preview matches print output.

## What resources.js expands

| Attribute | On | Produces |
|---|---|---|
| `data-cols="N"` | `.rs-colgrid` | N `.rs-col` column bands |
| `data-cells="N"` (+ `data-cell-cols`) | `.rs-cells` | N numbered `.rs-cell` frames (Crazy 8s, thumbnails) |
| `data-vdivs="20%,55%"` | `.rs-table__body` | vertical table dividers at those percentages |

Everything else is pure CSS.

## Sheet primitives

| Class | Sheet |
|---|---|
| `.rs-colgrid` | Column grid bands (layout sketching) |
| `.rs-graphgrid` | Square graph grid — a canvas to place cut-out widgets on |
| `.rs-rows` | Ruled rows (pure CSS, infinite) |
| `.rs-frame` / `.rs-frame--label` | Box frame, optionally with a `data-label` header band |
| `.rs-tiles` | Dashboard tile grid of frames |
| `.rs-table` | Table starter — header band + ruled body + column dividers |
| `.rs-chart` (+ `--bars`) | Chart starter — plot gridlines + L/B axes + gutters |
| `.rs-cells` | Numbered cell grid (Crazy 8s) |
| `.rs-phones` / `.rs-phone` | Mobile device frames |
| `.rs-form` | Form rows (label + field) |
| `.rs-matrix` | 2×2 matrix |
| `.rs-kpi` | KPI tile — big number + sparkline strip |
| `.rs-pill`, `.rs-btn`, `.rs-input`, `.rs-toggle`, `.rs-tabs` | Component stencil shapes |
| `.rs-swim` | Journey / service-blueprint swimlanes (`--rs-lanes`, `--rs-stages`) |
| `.rs-flow` | Flow / storyboard frames with arrows |

## Cut-out widgets

Write → cut → place on an 11×17 graph-grid canvas. Dashed borders are cut guides; each widget has a label zone + a write-in body so stakeholders only fill content:

- `.rs-cutsheet` (+ `--2` / `--3`) — grid of `.rs-widget` cards
- `.rs-kpi-card` — big-number line + trend strip
- Chart cards — `.rs-chart-area` mini plot (L-shaped axis, baseline at 80%, bottom band free to write in), with `--hbar` (horizontal bars) and `--plain` (donut/gauge) variants; filled cards carry faint `.rs-fpo` example art and a ~9pt `.rs-guide` usage note **below the cut line** (the guidance stays on the sheet, not the tile)
- Loose cut-outs — `.rs-cut-pill`, `.rs-cut-header`, `.rs-cut-note`, `.rs-cut-arrow`, `.rs-cut-star`, `.rs-cut-input` (+ `--area`, `.sel` select chevron), `.rs-cut-check` (checkbox/radio)
- `.rs-path` — Salesforce-style chevron path stages
- `.rs-stepper` / `.rs-stepper--v` — horizontal and vertical steppers

## Resources hub

`.rs-hub` + `.rs-hub-grid` + `.rs-hub-card` style a clean index page linking all sheets, with paper-size badges (`.rs-hub-size`).

## Design intent

Workshop sheets sit *before* the wireframe: stakeholders sketch on paper with just enough structure (grids, axes, cut guides) that the sketches convert cleanly into Nib pages afterward. The chart cards deliberately teach chart selection — each carries a right-tool-for-the-job guideline in print.

---

## Related

- [[Fidelity-Levels]] — the napkin aesthetic these paper sketches eventually become
- [[Service-Blueprint]] — the digital swimlane canvas `.rs-swim` sheets feed into
- [[Paper-Utilities]] — paper effects for the on-screen wireframes
- [[Project-Deliverables]] — where workshop outputs land in a project
