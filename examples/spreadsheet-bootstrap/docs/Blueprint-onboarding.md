<!-- nib:auto source=data/blueprints/onboarding.js -->

# Partner Onboarding — Detail

> Self-serve onboarding from application to active portal access in <5 days.

**Status:** draft · **Owner:** [[Persona-partner-admin]] · **Parent:** [[Blueprint-program]]

## What changes

- D&B auto-lookup replaces manual eligibility
- PSM countersigns digitally
- portal auto-provisions on agreement.

## Phases

| ID | Label |
|---|---|
| `apply` | Apply |
| `review` | Review |
| `agreement` | Agreement |
| `provision` | Provision |
| `activate` | Activate |

## Lanes

| ID | Label | Tier | Actor group |
|---|---|---|---|
| `sent` | sent | signal | — |
| `partner-future` | partner future | future | partner |
| `portal-future` | portal future | future | portal |
| `psm-future` | psm future | future | psm |

## Nodes

7 nodes across 6 edges.

## Open the canvas

Service blueprints render via the React Flow canvas in `examples/service-blueprint/` (when included). Open the project in a browser and the canvas reads this flow's `data/blueprints/onboarding.js`.

## Related

- [[Blueprints]] — index
- [[Home]]
