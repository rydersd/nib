# SLDS Rules

**Tags:** `governance` · `salesforce` · `slds` · `accessibility`

Authoritative rules for building Salesforce-style wireframes. Grounded in Lightning Design System 2 (Cosmos theme) and WCAG 2.1 AA. Read this before reviewing or generating any SFDC wireframe.

> **Agent reference:** [`ref/surface-salesforce-rules.md`](../ref/surface-salesforce-rules.md) — full 13-section rulebook including LWC shadow-DOM constraints and App Builder component inventory.

## What's in the rulebook

1. **Design system architecture** — SLDS 2 styling hooks (`--slds-*`) and how Nib's `--wf-*` tokens map to them
2. **Color system** — semantic roles (surface / on-surface / border / accent / error / warning / success / info), mandatory WCAG contrast ratios
3. **Typography** — Salesforce Sans is deprecated (Summer '21), system stack is canonical. Labels: 10px uppercase, letter-spaced
4. **Spacing & sizing** — 14–16px card padding, 4–8px border radius (SLDS 2 is more rounded than SLDS 1)
5. **Component patterns** — Record page anatomy, card pattern, path/stage bar, data table, toast, modal
6. **Layout rules** — 280px left / 1fr center / 320px right record grid; Comfy vs Compact density
7. **Accessibility** — 4.5:1 contrast, visible focus rings, 44×44px touch targets, ARIA landmarks
8. **Interaction patterns** — one primary button per section, rightmost action is primary, destructive actions need confirmation
9. **SLDS 1 vs SLDS 2 (Cosmos)** — rounder corners, more generous whitespace, dark-mode-ready
10. **AI & agentic design** — SLDS 2 components ship with metadata for AI-first experiences
11. **Wireframe-specific always/never rules**
12. **LWC styling constraints** — Shadow DOM means external CSS can't pierce; use `--slds-c-*` hooks on the host element
13. **Lightning App Builder** — ~40 drag-and-drop components; Dynamic Forms and Dynamic Actions need no code

## Quick rules

**Always:**
- Use `.sfdc-record-layout` (not `sfdc-record-grid`) for the 3-column grid
- Use `.sfdc-col-record` (not `sfdc-col-detail`) for the center column
- Place related lists in the left column, activity in the right
- Wrap card titles in `<h3>`
- Show 3–5 highlights (not more) in the highlights bar
- Use `wf-badge` for status (shared framework, not SFDC-specific)

**Never:**
- Mix SFDC surface CSS with other surfaces on the same page
- Use more than one primary button per card/section
- Hardcode hex — always `var(--wf-*)` tokens (see [[Design-Tokens]])
- Skip the record header on record pages

## Implementation effort annotation

Use `data-wf-confidence` on every SFDC wireframe element to signal build cost:

- `confirmed` — achievable with standard App Builder components (Record Detail, Path, Chatter, Report Chart, etc.)
- `partial` — needs custom LWC development

See [[Confidence-Levels]] for the full pattern.

---

## Related

- [[Surface-Salesforce]] — the surface CSS and starter
- [[Themes]] — the built-in `slds` theme that pairs with this surface
- [[Design-Tokens]] — the `--wf-*` tokens that map to SLDS hooks
- [[Compliance]] — broader regulatory concerns beyond SLDS
- [[Review-Agents]] — the SFDC UX and Dev reviewers that enforce these rules
- [[Confidence-Levels]] — annotating App-Builder vs custom-LWC feasibility
