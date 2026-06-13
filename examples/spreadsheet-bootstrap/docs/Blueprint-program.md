<!-- nib:auto source=data/blueprints/program.js -->

# Partner Channel Program — End-to-End

> How Acme acquires, enables, and retains channel partners across five lifecycle phases.

**Status:** review · **Owner:** [[Persona-leadership]]

## What changes

- Self-serve onboarding replaces email back-and-forth
- AI deal triage cuts PSM cycle time
- QBR data flows from Salesforce automatically.

## Phases

| ID | Label |
|---|---|
| `recruit` | Recruit |
| `onboard` | Onboard |
| `enable` | Enable |
| `transact` | Transact |
| `retain` | Retain |

## Lanes

| ID | Label | Tier | Actor group |
|---|---|---|---|
| `sentiment` | sentiment | signal | — |
| `partner-future` | partner future | future | partner |
| `portal-future` | portal future | future | portal |
| `internal-future` | internal future | future | internal |

## Nodes

15 nodes across 12 edges.

## Drill-in points

- **Apply** (`onboard` / `partner-future`) → [[Blueprint-onboarding]]
- **Register deals** (`transact` / `partner-future`) → [[Blueprint-deal-reg]]
- **Onboarding wizard** (`onboard` / `portal-future`) → [[Blueprint-onboarding]]
- **Rep portal** (`transact` / `portal-future`) → [[Blueprint-deal-reg]]
- **PSM review** (`onboard` / `internal-future`) → [[Blueprint-onboarding]]
- **Deal Desk** (`transact` / `internal-future`) → [[Blueprint-deal-reg]]

## Sub-blueprints

- [[Blueprint-deal-reg|Deal Registration — Detail]]
- [[Blueprint-onboarding|Partner Onboarding — Detail]]

## Open the canvas

Service blueprints render via the React Flow canvas in `examples/service-blueprint/` (when included). Open the project in a browser and the canvas reads this flow's `data/blueprints/program.js`.

## Related

- [[Blueprints]] — index
- [[Home]]
