<!-- nib:auto source=data/blueprints/deal-reg.js -->

# Deal Registration — Detail

> Partner reps register deals in <2min; Deal Desk triages with AI assist.

**Status:** draft · **Owner:** [[Persona-partner-rep]] · **Parent:** [[Blueprint-program]]

## What changes

- Single-page form replaces multi-step wizard
- D&B auto-fill
- AI conflict pre-screen before PSM sees it.

## Phases

| ID | Label |
|---|---|
| `initiate` | Initiate |
| `capture` | Capture |
| `submit` | Submit |
| `review` | Review |
| `decide` | Decide |

## Lanes

| ID | Label | Tier | Actor group |
|---|---|---|---|
| `sent` | sent | signal | — |
| `rep-current` | rep current | current | rep |
| `rep-future` | rep future | future | rep |
| `sys-current` | sys current | current | system |
| `sys-future` | sys future | future | system |
| `psm-current` | psm current | current | psm |
| `psm-future` | psm future | future | psm |

## Nodes

14 nodes across 12 edges.

## Open the canvas

Service blueprints render via the React Flow canvas in `examples/service-blueprint/` (when included). Open the project in a browser and the canvas reads this flow's `data/blueprints/deal-reg.js`.

## Related

- [[Blueprints]] — index
- [[Home]]
