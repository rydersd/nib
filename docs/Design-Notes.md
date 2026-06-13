# Design Notes

**Tags:** `guide` · `design-notes` · `deliverables`

Every wireframe page has a `<div class="wf-design-notes">` explaining what the page does and why. The Notes panel splits it into three tabs: **Context**, **Design**, **Technical**.

> **Agent reference:** [`ref/design-notes-guide.md`](../ref/design-notes-guide.md) — full example HTML for every section.

## Required sections

Split by `<h3>` headings. `proto-nav.js` auto-splits Context / Design / Technical from these.

| Section | What goes in it |
|---|---|
| **Summary** | 2–3 sentences — what the page shows, what problem it solves, for whom |
| **Jobs to Be Done** | Persona-tagged user goals — each with the pain point or current workaround. Feeds the JTBD hub (see [[Project-Deliverables]]) |
| **Design Specification** | Primary Content / Interactive Elements / Functionality sub-sections |
| **Technical Details** | Platform, data objects, business logic |
| **Acceptance Criteria** | Which ACs this page addresses (auto-badged from `STORY_MAP`) |

## Optional: Friction Points

Document where users might get stuck. `proto-nav.js` also reads per-step `friction` fields from `SCENARIOS` and shows them in the scenario banner. Friction documentation converts "looks right" reviews into "can the user actually do their job here" reviews.

## Good JTBD pattern

Name the persona, describe the job, note the pain point in parentheses:

> **Global Pricing Team** — See region-by-region availability matrix and verify against Siebel (replaces manually diff'ing three systems).

Thin to avoid: "Users can view data."

## AC badges

Don't manually reference ACs in your HTML. Define `STORY_MAP` in `project-data.js` and `proto-nav.js` auto-injects badges into the Context tab. When `DESIGN_STORIES` is also defined, the badges become clickable links to the Design Stories page. See [[Navigation]].

## Formatting rules

- Flat HTML only: `h3`, `h4`, `p`, `ul`, `hr` — no nested divs or custom classes
- 3+ bullets minimum for JTBD and Design Spec
- Always include project context (what system this replaces, what pain point it addresses)
- Reference specific data object and field names in Technical Details

---

## Related

- [[Navigation]] — `STORY_MAP` + `DESIGN_STORIES` data structures
- [[Project-Deliverables]] — JTBD hub and design stories page
- [[Page-Template]] — where the notes div fits in the HTML boilerplate
- [[Page-Blueprint]] — generating notes from the `notes` object
- [[Doctor]] — warns on pages missing the notes div
