# Evidence

**Tags:** fidelity, certainty, evidence, research, review, agents

Evidence-driven fidelity turns a prototype's *texture* into a heatmap of design
certainty. Any region can declare how grounded it is with a `data-wf-evidence`
attribute — and low-evidence regions render rough (hand-sketched, wobbled) while
validated regions render crisp, **at every global fidelity level**.

Roughness stops being a mode you toggle ([[Fidelity-Levels]]) and becomes a
signal you *earn*. Open a prototype and you can see, at a glance, which parts of
the design are solid and which are still a guess.

This is the page-level generalisation of [[Confidence-Levels]]
(`data-wf-confidence`) and a sibling of the [[Service-Blueprint]]'s research
model — see [Relationship](#relationship-to-other-models) below.

## The evidence ladder

`data-wf-evidence` takes one of four values, roughest → crispest:

| Value | Meaning | Renders as |
|-------|---------|-----------|
| `guess` | Invented to move forward — no backing yet | Dashed border, hand-drawn radius, line-wobble filter |
| `assumption` | Rests on a stated design assumption | Dashed border, lightly irregular |
| `researched` | Backed by a research finding or citation | Clean solid accent border |
| `validated` | Tested with users or signed off | Crisp solid green border |

A `guess` stays visibly rough even on a **Polished** page — that is the point.

## Using it

Add the attribute to any container — a card, panel, section, table:

```html
<div class="wf-card" data-wf-evidence="guess">…</div>

<div class="wf-card" data-wf-evidence="researched"
     data-wf-evidence-source="Usability round 3, finding S07">…</div>
```

- **`data-wf-evidence-source`** — an optional citation. A `researched` or
  `validated` region with **no** source is flagged unsourced (a `?` on its chip,
  and its border softens to dashed) — an unbacked claim never looks fully solid.
- **`data-wf-evidence-chip="off"`** — suppress the corner chip on that region
  (the border treatment and heatmap bar still apply).

Each marked region gets a colour-coded **corner chip** naming its level.

## The legend & heatmap

When a page has any `data-wf-evidence` regions, `proto-evidence.js` adds a small
**Evidence legend** panel (bottom-left). It shows:

- a per-level **meter** and counts,
- a **% grounded** score — the share of regions at `researched` or better,
- a **Heatmap** toggle — paints a colour-coded left bar on every region and
  bolds the chips, so certainty is scannable across the whole page,
- click any legend row to **flash** that level's regions.

The heatmap state persists per session.

## How it composes with fidelity

Evidence is *orthogonal* to the [[Fidelity-Levels]] slider:

- **Blueprint / Polished** — evidence reads loudest: guesses are visibly rougher
  than their validated neighbours on the same page.
- **Napkin** — the page is deliberately monochrome, so chips and bars desaturate
  with everything else; the dashed-vs-solid borders and chip text still
  differentiate, and the legend panel keeps its colour key.

It never fights the slider — a reviewer can still force the whole page to one
fidelity. Evidence just adds a second, per-region dimension on top.

## Relationship to other models

- **[[Confidence-Levels]]** (`data-wf-confidence`) — the original per-element
  certainty seed. `data-wf-evidence` is its richer four-rung successor with a
  resolver, sourcing, a legend and a heatmap. Prefer `data-wf-evidence` for new
  work; the two can coexist.
- **[[Service-Blueprint]]** — `core/blueprint/evidence.js` carries the research /
  spec / design-rationale / author-construct *kinds* used inside the React
  canvas. `proto-evidence.js` is the vanilla page-level system with the friendly
  four-rung ladder. Rough mapping: `research`→`researched`, `spec`/`design-rationale`→`assumption`, `author-construct`→`guess`; a cited item ⇒ `validated`-grade.

## For agents

When you generate a page, **mark evidence honestly**. An agent knows what it
invented versus what the brief or research grounds — emit that:

- A number, label or flow you made up to fill a slot → `data-wf-evidence="guess"`.
- Something derived from a stated assumption → `assumption`.
- Something traceable to the brief / a research note → `researched` with a
  `data-wf-evidence-source`.
- Only mark `validated` when the source genuinely is a test result or sign-off.

This makes the prototype self-documenting about its own certainty — the single
most useful thing a reviewer can know walking into a design review.

## Loading

Evidence is opt-in. Add the pair to any page:

```html
<link rel="stylesheet" href="core/proto-evidence.css">
<!-- after proto-nav.js -->
<script src="core/proto-evidence.js"></script>
```

It self-initialises on `DOMContentLoaded` and is a no-op on pages with no
`data-wf-evidence`. API: `window.wfEvidence` — `{ refresh, heatmap, summary,
flashLevel, LEVELS, ORDER }`. Call `wfEvidence.refresh()` after injecting DOM.

A worked demo: [`examples/test-project/dashboard.html`](../examples/test-project/dashboard.html).

## Related

- [[Fidelity-Levels]] — the global Napkin / Blueprint / Polished slider
- [[Confidence-Levels]] — the `data-wf-confidence` predecessor
- [[Service-Blueprint]] — the research-evidence model on the journey canvas
- [[Philosophy]] — why deliberate imperfection communicates certainty
- [[Feedback]] — stakeholder feedback that moves a region up the ladder
