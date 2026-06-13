# Surface: Salesforce

**Tags:** `surface` · `salesforce` · `slds`

For SFDC record pages and Lightning-style layouts. Uses the `sfdc-` prefix.

**CSS file:** [`surfaces/salesforce.css`](../surfaces/salesforce.css)
**Agent references:** [`ref/surface-salesforce.md`](../ref/surface-salesforce.md) + [`ref/surface-salesforce-rules.md`](../ref/surface-salesforce-rules.md)
**Starter:** [`starters/sfdc-record.html`](../starters/sfdc-record.html)

```html
<link rel="stylesheet" href="../core/proto-core.css">
<link rel="stylesheet" href="../surfaces/salesforce.css">
```

## Key components

| Class | Purpose |
|---|---|
| `.sfdc-record-page` | Full record page layout |
| `.sfdc-record-header` | Record header with title + actions |
| `.sfdc-path-bar` | Sales path progress bar |
| `.sfdc-highlights-bar` | Key field highlights (compact field row) |
| `.sfdc-card` | Lightning card |
| `.sfdc-btn-primary` | SFDC-styled primary button |
| `.sfdc-feed-item` | Chatter feed item |

## Example

```html
<div class="sfdc-record-page">
  <div class="sfdc-record-header">
    <h1>Acme Corp — Opportunity</h1>
  </div>
  <div class="sfdc-path-bar">
    <!-- stage progression -->
  </div>
  <div class="sfdc-highlights-bar">
    <!-- key fields -->
  </div>
  <div class="sfdc-card">
    <!-- related list or detail -->
  </div>
</div>
```

## SLDS compliance

Salesforce wireframes have stricter conventions than other surfaces. Before generating SFDC wireframes, review:

- [`ref/surface-salesforce-rules.md`](../ref/surface-salesforce-rules.md) — SLDS compliance rules and OOB component guidance
- [`ref/slds-component-specs.md`](../ref/slds-component-specs.md) — Lightning Design System component reference
- [`ref/slds/`](../ref/slds/) — SLDS tokens and icon subset

## Review agents

Two specialized agents exist for SFDC work:

- [`ref/agent-sfdc-ux.md`](../ref/agent-sfdc-ux.md) — UX review for Salesforce wireframes
- [`ref/agent-sfdc-dev.md`](../ref/agent-sfdc-dev.md) — Dev feasibility review

See [`ref/agent-install.md`](../ref/agent-install.md) for how to install them locally.

## When to use

- Salesforce record pages (Opportunity, Account, Contact, Case, custom objects)
- Lightning App Builder layouts
- Sales path / stage progression wireframes
- Chatter feed integrations

---

## Related

- [[Surfaces]] — overview and comparison
- [[Components]] — shared `wf-` components that work here too
- [[Design-Tokens]] — tokens this surface builds on
- [`ref/surface-salesforce.md`](../ref/surface-salesforce.md) — agent-facing reference
- [`ref/surface-salesforce-rules.md`](../ref/surface-salesforce-rules.md) — SLDS compliance rules
- [[For-Agents]] — review agents and agent installation
