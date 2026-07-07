# Surface: Salesforce

**Tags:** `surface` · `salesforce` · `slds`

For SFDC record pages and Lightning-style layouts. Uses the `sfdc-` prefix.

**CSS file:** [`surfaces/salesforce.css`](../surfaces/salesforce.css)
**Starter:** [`starters/sfdc-record.html`](../starters/sfdc-record.html)

```html
<link rel="stylesheet" href="../core/proto-core.css">
<link rel="stylesheet" href="../surfaces/salesforce.css">
```

## When to use

- Salesforce record pages (Opportunity, Account, Contact, Case, custom objects)
- Lightning App Builder layouts
- Sales path / stage progression wireframes
- Chatter feed integrations

## Record page structure

Standard Salesforce opportunity/account record page:

```html
<div class="sfdc-record-page">
  <!-- Record Header -->
  <div class="sfdc-record-header">
    <div class="sfdc-record-header-top">
      <div class="sfdc-record-info">
        <div class="sfdc-record-type">Opportunity</div>
        <h1 class="sfdc-record-name">Record Name</h1>
      </div>
      <div class="sfdc-record-actions">
        <button class="sfdc-btn">Edit</button>
        <button class="sfdc-btn-primary">Primary Action</button>
      </div>
    </div>
  </div>

  <!-- Highlights Bar -->
  <div class="sfdc-highlights-bar">
    <div class="sfdc-highlight">
      <div class="sfdc-highlight-label">Amount</div>
      <div class="sfdc-highlight-value">$2.4M</div>
    </div>
    <!-- 3-5 key fields -->
  </div>

  <!-- Path/Stage Bar -->
  <div class="sfdc-path-bar">
    <span class="sfdc-path-step complete">Qualification</span>
    <span class="sfdc-path-step current">Discovery</span>
    <span class="sfdc-path-step">Proposal</span>
    <span class="sfdc-path-step">Negotiation</span>
    <span class="sfdc-path-step">Closed</span>
    <button class="sfdc-path-complete-btn">Mark as Complete</button>
  </div>

  <!-- 3-Column Layout -->
  <div class="sfdc-record-layout">
    <div class="sfdc-col-related"><!-- left: related lists --></div>
    <div class="sfdc-col-record"><!-- center: record detail --></div>
    <div class="sfdc-col-activity"><!-- right: activity feed --></div>
  </div>
</div>
```

## Cards

```html
<div class="sfdc-card">
  <div class="sfdc-card-header"><h3>Section Title</h3></div>
  <div class="sfdc-card-body">
    <!-- content -->
  </div>
</div>
```

Card accent variants: `.sfdc-card-accent`, `.sfdc-card-green`, `.sfdc-card-amber`, `.sfdc-card-red`, `.sfdc-card-purple`.

## Detail grid (field-value pairs)

```html
<div class="sfdc-detail-grid">
  <div class="sfdc-detail-field">
    <label>Field Name</label>
    <div class="sfdc-field-value">Field Value</div>
  </div>
  <div class="sfdc-detail-field">
    <label>Status</label>
    <div class="sfdc-field-value">
      <span class="wf-badge wf-badge-green">Active</span>
    </div>
  </div>
  <div class="sfdc-detail-field full">
    <label>Description</label>
    <div class="sfdc-field-value">Full-width field spanning both columns.</div>
  </div>
</div>
```

## Related list

```html
<div class="sfdc-card">
  <div class="sfdc-card-header"><h3>Related Contacts (3)</h3></div>
  <div class="sfdc-card-body">
    <a href="#" class="sfdc-related-item">
      <div class="sfdc-related-icon accent">C</div>
      <div class="sfdc-related-info">
        <div class="sfdc-related-title">Contact Name</div>
        <div class="sfdc-related-sub">VP Infrastructure · Primary</div>
      </div>
      <div class="sfdc-related-meta">$500K</div>
    </a>
    <!-- more items -->
    <a href="#" class="sfdc-related-action">View All</a>
  </div>
</div>
```

Related icon variants: `.green`, `.amber`, `.red`, `.purple`, `.accent`.

## Activity feed

```html
<div class="sfdc-card">
  <div class="sfdc-card-header"><h3>Activity Timeline</h3></div>
  <div class="sfdc-card-body">
    <a href="target-page.html" class="sfdc-feed-item-link" title="View in Slack">
      <div class="sfdc-feed-avatar slack">🔗</div>
      <div class="sfdc-feed-body">
        <div class="sfdc-feed-text"><strong>Event type</strong> — Description · Actor Name</div>
        <div class="sfdc-feed-time">Mar 5, 2:30 PM</div>
        <div class="sfdc-feed-screen">Screen Reference</div>
      </div>
    </a>

    <!-- Non-clickable native SF activity -->
    <div class="sfdc-feed-item-link" style="cursor:default;">
      <div class="sfdc-feed-avatar system">📞</div>
      <div class="sfdc-feed-body">
        <div class="sfdc-feed-text"><strong>Call logged</strong> — Description · Actor Name</div>
        <div class="sfdc-feed-time">Mar 3, 2:00 PM</div>
        <div class="sfdc-feed-screen" style="color:var(--wf-muted);font-style:italic;">Native SF Activity</div>
      </div>
    </div>
  </div>
</div>
```

Feed avatar types: `.slack` (Slack-sourced), `.system` (native SF), no class (user).

## Path detail (expandable)

```html
<div class="sfdc-path-detail open">
  <div class="sfdc-path-detail-header">
    <div class="sfdc-path-detail-title">Discovery</div>
    <button class="sfdc-path-detail-close">✕</button>
  </div>
  <div class="sfdc-path-fields">
    <div>
      <div class="sfdc-path-field-label">Key Fields</div>
      <div class="sfdc-path-field-value">Required info for this stage</div>
    </div>
  </div>
  <div class="sfdc-path-guidance">
    <strong>Coaching:</strong> Discovery requires identifying decision criteria…
  </div>
</div>
```

## Tabs

```html
<div class="sfdc-tabs">
  <button class="sfdc-tab active">Details</button>
  <button class="sfdc-tab">Activity</button>
  <button class="sfdc-tab">Related</button>
</div>
```

## Table

```html
<table class="sfdc-table">
  <thead>
    <tr><th>Name</th><th>Amount</th><th>Stage</th><th>Close Date</th></tr>
  </thead>
  <tbody>
    <tr><td>Record Name</td><td>$500K</td><td>Discovery</td><td>Q2 2026</td></tr>
  </tbody>
</table>
```

## Buttons

```html
<button class="sfdc-btn">Action</button>
<button class="sfdc-btn-primary">Primary Action</button>
<button class="sfdc-btn-sm">Small</button>
<button class="sfdc-btn-slack">Open in Slack</button>
```

## Class reference

| Class | Purpose |
|-------|---------|
| `.sfdc-record-page` | Root container for record pages |
| `.sfdc-record-header` | Header with name + actions |
| `.sfdc-highlights-bar` | Top highlights bar (key fields) |
| `.sfdc-highlight` | Individual highlight cell |
| `.sfdc-path-bar` | Stage/path bar with progress |
| `.sfdc-path-step` | Individual stage (`.complete`, `.current`, `.lost`) |
| `.sfdc-path-detail` | Expandable guidance panel (`.open`) |
| `.sfdc-record-layout` | 3-column layout grid |
| `.sfdc-col-related` | Left column (related lists) |
| `.sfdc-col-record` | Center column (record fields) |
| `.sfdc-col-activity` | Right column (activity feed) |
| `.sfdc-card` | Standard section card |
| `.sfdc-detail-grid` | 2-column field/value grid |
| `.sfdc-detail-field` | Single field container (`.full` for span) |
| `.sfdc-related-item` | Related list row |
| `.sfdc-feed-item-link` | Activity feed entry (clickable or static) |
| `.sfdc-tabs` | Tab bar |
| `.sfdc-table` | Data table |
| `.sfdc-btn` | Standard button |
| `.sfdc-btn-primary` | Primary action button |

## Rules

- Record pages always start with `.sfdc-record-page`
- Highlights bar shows 3-5 key fields — not the full record
- Path steps use `.complete` (past) and `.current` (active) — the rest are future
- 3-column grid uses `.sfdc-record-layout` (not `sfdc-record-grid`)
- Center column is `.sfdc-col-record` (not `sfdc-col-detail`)
- Card headers wrap the title in an `<h3>` tag
- Detail fields use `<label>` for field names (not a div class)
- Activity feed items that link to wireframe screens use `<a>`; native SF activities use `<div>`
- Use `wf-badge` for status indicators, not SFDC-specific badges

## SLDS compliance

Salesforce wireframes have stricter conventions than other surfaces. Before generating SFDC wireframes, review [[SLDS-Rules]] — SLDS compliance rules and OOB component guidance — plus the SLDS component specs ([`ref/slds-component-specs.md`](../ref/slds-component-specs.md)) and token/icon subset ([`ref/slds/`](../ref/slds/)).

## Review agents

Two specialized agents exist for SFDC work — UX review and dev feasibility review. See [[Review-Agents]] for what they check and how to install them.

---

## Related

- [[Surfaces]] — overview and comparison
- [[SLDS-Rules]] — compliance rules every SFDC wireframe must follow
- [[Page-Compose]] — template-level authoring aimed at SLDS patterns
- [[Components]] — shared `wf-` components that work here too
- [[Design-Tokens]] — tokens this surface builds on
- [[Review-Agents]] — SFDC UX + dev feasibility reviewers
