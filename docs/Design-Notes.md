# Design Notes

**Tags:** `guide` · `design-notes` · `deliverables`

Every wireframe page has a `<div class="wf-design-notes" hidden>` at the bottom explaining what the page does and why. The Notes panel splits it into three tabs: **Context**, **Design**, **Technical** — this is the context stakeholders see when reviewing the prototype.

## Required sections

Split by `<h3>` headings. `proto-nav.js` auto-splits Context / Design / Technical from these.

| Section | What goes in it |
|---|---|
| **Summary** | 2–3 sentences — what the page shows, what problem it solves, for whom |
| **Jobs to Be Done** | Persona-tagged user goals — each with the pain point or current workaround. Feeds the JTBD hub (see [[Project-Deliverables]]) |
| **Design Specification** | Primary Content / Interactive Elements / Functionality sub-sections |
| **Technical Details** | Platform, data objects, business logic |
| **Acceptance Criteria** | Which ACs this page addresses (auto-badged from `STORY_MAP`) |

### Summary

What this page does in 2–3 sentences, including project context. Mention what problem it solves and for whom.

```html
<h3>Summary</h3>
<p>The Product Detail page shows region-by-region availability for a single product,
pulling from Siebel and Geo Config. It replaces the manual process of cross-referencing
three systems to verify market availability before a pricing change.</p>
```

### Jobs to Be Done

List the personas this page serves and their specific JTBD items. Use bold persona names and number the items. Tie each job to a real pain point.

```html
<h3>Jobs to Be Done</h3>
<h4>Personas served</h4>
<p><strong>Global Pricing Team</strong> (primary), <strong>Digital Product PM</strong>, <strong>Internal Engineering</strong></p>

<h4>JTBD</h4>
<ul>
  <li><strong>Global Pricing Team</strong> — See region-by-region availability matrix and verify against Siebel (with Source System and Last Updated for traceability)</li>
  <li><strong>Global Pricing Team</strong> — Check History tab to see recent changes (replaces manually diff'ing Siebel exports)</li>
  <li><strong>Digital Product PM</strong> — Verify digital product availability and lifecycle stage before publishing pricing change</li>
</ul>
```

**Good pattern:** each item names the persona, describes the job, and notes why it matters (pain point or current workaround in parentheses).

**Thin pattern to avoid:** "Users can view data" — no persona, no pain point, no specificity.

### Design Specification

Break into sub-sections:

- **Primary Content** — what the user sees: cards, tables, charts, key data fields
- **Interactive Elements** — buttons, filters, accordions, modals, toggles — what they do
- **Functionality** — behavioral logic: sorting, filtering, state changes, transitions

```html
<h3>Design Specification</h3>
<h4>Primary Content</h4>
<p>Region availability matrix in a sortable table with columns: Region, Status (badge),
Constraint (if limited), Source System, Effective Date, Last Updated.</p>

<h4>Interactive Elements</h4>
<ul>
  <li>Region filter dropdown — scopes table to selected regions</li>
  <li>Status filter pills — toggle Available / Limited / Blocked</li>
  <li>History tab — shows recent changes to this product's availability</li>
  <li>Export button — triggers export flow with current filters applied</li>
</ul>

<h4>Functionality</h4>
<ul>
  <li>Table sorts by any column header click (default: Region A→Z)</li>
  <li>Constraint badges link to eligibility rule explanation page</li>
  <li>Data freshness banner shows time since last Siebel sync</li>
</ul>
```

### Technical Details

Platform implementation mapping, data objects, validation/business logic.

```html
<h3>Technical Details</h3>
<h4>Platform</h4>
<p>Salesforce Lightning — custom LWC component on Product record page</p>

<h4>Data Objects</h4>
<ul>
  <li><code>Product_Availability__c</code> — master product record with global attributes</li>
  <li><code>Market_Availability__c</code> — junction object: one per product × region</li>
</ul>

<h4>Business Logic</h4>
<ul>
  <li>Stale data threshold: 24 hours since last Siebel sync triggers amber banner</li>
  <li>Field masking: Account IDs hashed for non-admin users</li>
</ul>
```

### Acceptance Criteria Addressed

Which ACs this page addresses, with brief descriptions.

```html
<h3>Acceptance Criteria Addressed</h3>
<ul>
  <li><strong>AC#3</strong> — Product detail shows per-region availability with source traceability</li>
  <li><strong>AC#4</strong> — History tab displays recent changes with timestamps</li>
</ul>
```

## AC badges

Don't manually reference ACs beyond the section above. Define `STORY_MAP` in `project-data.js` and `proto-nav.js` auto-injects badges into the Context tab when the Notes panel opens. When `DESIGN_STORIES` is also defined, the badges become clickable links to the Design Stories page. See [[Navigation]].

## Optional: Friction Points

For each page, ask: can the user actually accomplish their job here? What might confuse them or slow them down? Document friction in `SCENARIOS` steps using the `friction` field (see [[Navigation]]), and optionally add a section to the design notes:

```html
<h3>Friction Points</h3>
<ul>
  <li>No visual indicator showing which SKUs changed since last Siebel sync</li>
  <li>Export button placement not visible without scrolling on smaller viewports</li>
  <li>Region filter resets when navigating back from detail page</li>
</ul>
```

Friction documentation converts "looks right" reviews into "can the user actually do their job here" reviews.

## Formatting rules

- Flat HTML only: `h3`, `h4`, `p`, `ul`, `hr` — no nested divs or custom classes
- Keep each section substantial — 3+ bullets minimum for JTBD and Design Spec
- Always include project context (what system this replaces, what pain point it addresses)
- Reference specific data object and field names in Technical Details
- Link acceptance criteria to specific UI elements, not just "this page"

---

## Related

- [[Navigation]] — `STORY_MAP` + `DESIGN_STORIES` data structures
- [[Project-Deliverables]] — JTBD hub and design stories page
- [[Page-Template]] — where the notes div fits in the HTML boilerplate
- [[Page-Blueprint]] — generating notes from the `notes` object
- [[Doctor]] — warns on pages missing the notes div
