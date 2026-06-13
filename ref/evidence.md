# ref/evidence.md — Evidence-driven fidelity

> Wiki version: `docs/Evidence.md` (canonical). This is the slim agent-facing ref.

Mark how grounded each region of a wireframe is. Low-evidence regions render
rough; validated regions render crisp — at every fidelity level. The prototype
becomes a heatmap of design certainty.

## The attribute

Add `data-wf-evidence` to any container (card, panel, section, table):

| Value | When to use |
|-------|-------------|
| `guess` | You invented this to fill a slot — no backing. |
| `assumption` | Derived from a stated design assumption, not evidence. |
| `researched` | Traceable to the brief or a research finding. |
| `validated` | A genuine user-test result or stakeholder sign-off. |

Optional: `data-wf-evidence-source="…"` — a citation. A `researched`/`validated`
region with no source is flagged unsourced. `data-wf-evidence-chip="off"` hides
the corner chip on one region.

```html
<div class="wf-card" data-wf-evidence="guess">…</div>
<div class="wf-card" data-wf-evidence="researched"
     data-wf-evidence-source="Brief §2.1">…</div>
```

## Rule for agents

**Mark evidence honestly.** You know what you invented versus what the brief
grounds — say so. Default invented content to `guess`. Never mark `validated`
unless the source is a real test or sign-off. This is the single most useful
signal a reviewer can have.

## Loading

```html
<link rel="stylesheet" href="core/proto-evidence.css">
<script src="core/proto-evidence.js"></script>   <!-- after proto-nav.js -->
```

Opt-in and self-initialising; a no-op when the page has no `data-wf-evidence`.
Adds an Evidence legend panel (per-level counts, % grounded, heatmap toggle).
API: `window.wfEvidence`. Generalises `data-wf-confidence` (see `components.md`).
