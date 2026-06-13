# Paper Utilities

**Tags:** `reference` · `aesthetic` · `paper`

CSS classes that add physical-artifact texture — tape, pushpins, torn edges, sketch borders. These utilities reinforce the [[Philosophy|disposable prototype]] aesthetic by making wireframes look like physical paper on a wall.

## The utilities

| Class | Effect |
|---|---|
| `.wf-tape` | Tape strip across top center |
| `.wf-pin` | Pushpin dot at top center |
| `.wf-torn-top` | Torn paper edge along the top |
| `.wf-torn-bottom` | Torn paper edge along the bottom |
| `.wf-stacked` | Stacked paper pile effect (multiple sheets) |
| `.wf-sketch` | Heavy hand-drawn border |

All utilities use CSS pseudo-elements (`::before` / `::after`) and won't conflict with content inside the element.

## Usage

Apply as additional classes to any card:

```html
<div class="ds-card wf-tape">
  <div class="ds-card-header">
    <span class="ds-card-title">Taped note</span>
  </div>
  <div class="ds-card-body">This card has a tape strip at the top.</div>
</div>

<div class="ds-card wf-pin">Pinned card</div>

<div class="wf-card wf-sketch">Hand-drawn border</div>

<div class="ds-card wf-stacked wf-torn-bottom">
  Stacked and torn at the bottom
</div>
```

## Tokens used

Paper utilities read from these [[Design-Tokens#paper-effects|paper effect tokens]]:

- `--wf-tape-color` — tape strip fill
- `--wf-pin-color` — pushpin dot color
- `--wf-paper-shadow` — multi-layer shadow for paper depth

## Live examples

See [[Components]] ([live demo](components.html)) for rendered examples of each utility.

---

## Related

- [[Components]] — how paper utilities combine with cards
- [[Design-Tokens]] — paper effect tokens
- [[Philosophy]] — why the paper aesthetic matters
- [[Fidelity-Levels]] — paper effects soften in polished mode
