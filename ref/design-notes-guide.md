# Design Notes Guide

> ⚠️ **Deprecated.** Edit [`docs/Design-Notes.md`](../docs/Design-Notes.md) instead. This file will be removed in a future release.

Every wireframe page includes a `<div class="wf-design-notes" hidden>` section at the bottom. This content is displayed in the navigation drawer's "Design Notes" tab and provides context for stakeholders reviewing the prototype.

## Required Sections

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

**Good pattern:** Each item names the persona, describes the job, and notes why it matters (pain point or current workaround in parentheses).

**Thin pattern to avoid:** "Users can view data" — no persona, no pain point, no specificity.

### Design Specification
Break into sub-sections:

- **Primary Content** — What the user sees: cards, tables, charts, key data fields
- **Interactive Elements** — Buttons, filters, accordions, modals, toggles — what they do
- **Functionality** — Behavioral logic: sorting, filtering, state changes, transitions

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

> **Note:** AC badges are auto-injected into the Notes Context tab from `STORY_MAP` in project-data.js. You don't need to manually add them to your design notes HTML — they appear automatically when the Notes panel opens. When `DESIGN_STORIES` is also defined in project-data.js, these badges become clickable links to the Design Stories page.

### Friction Points (Optional)

For each page, ask: can the user actually accomplish their job here? What might confuse them or slow them down? Document friction in SCENARIOS steps using the `friction` field (see navigation.md), and optionally add a section to design notes:

```html
<h3>Friction Points</h3>
<ul>
  <li>No visual indicator showing which SKUs changed since last Siebel sync</li>
  <li>Export button placement not visible without scrolling on smaller viewports</li>
  <li>Region filter resets when navigating back from detail page</li>
</ul>
```

Friction documentation helps reviewers evaluate whether the wireframe actually enables users to do their job, not just whether it looks right.

## Formatting Rules

- Use flat HTML: `h3`, `h4`, `p`, `ul`, `hr` — no nested divs or custom classes
- Keep each section substantial — 3+ bullet points minimum for JTBD and Design Spec
- Always include the project context (what system this replaces, what pain point it addresses)
- Reference specific data objects and field names in Technical Details
- Link acceptance criteria to specific UI elements, not just "this page"

## Reference Example

See eqPartners `rep-pipeline.html` design notes for a complete example of the expected depth and structure.
