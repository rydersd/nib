# Confidence Levels

**Tags:** `reference` · `aesthetic` · `confidence`

Per-element design certainty. While [[Fidelity-Levels|fidelity levels]] apply to the whole page, `data-wf-confidence` communicates certainty on individual components — so one page can mix "decided" and "still figuring this out" sections.

## The three levels

| Value | Meaning | Visual |
|---|---|---|
| `confirmed` | "This is decided." | Clean rendering |
| `partial` | "Direction is set, details TBD." | Moderate wobble |
| `uncertain` | "We haven't figured this out yet." | Heavy wobble, reduced opacity |

## Usage

Add the `data-wf-confidence` attribute to any element:

```html
<div class="ds-card" data-wf-confidence="confirmed">
  Shipped feature
</div>

<div class="ds-card" data-wf-confidence="partial">
  Direction set, details TBD
</div>

<div class="ds-card" data-wf-confidence="uncertain">
  We haven't figured this out yet
</div>
```

## Why this matters

A single wireframe page often contains sections at different maturity levels. A dashboard might have:

- Header and navigation → `confirmed` (decided in a prior sprint)
- Main data table → `partial` (columns agreed, filters TBD)
- AI suggestions panel → `uncertain` (concept only)

Using one fidelity level for the whole page loses that nuance. `data-wf-confidence` preserves it.

## Live examples

See [[Components#confidence-levels|Components: Confidence Levels]] and [`components.html`](components.html) for rendered examples.

---

## Related

- [[Philosophy#confidence-aware-rendering|Philosophy: Confidence-Aware Rendering]]
- [[Fidelity-Levels]] — page-level equivalent
- [[Components]] — where confidence typically gets applied
