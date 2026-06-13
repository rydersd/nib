# Page Compose

**Tags:** `reference` · `declarative` · `compose` · `salesforce`

Template-level page authoring. Reference a template, substitute variables, get SLDS-aligned output.

> **Agent reference:** [`ref/page-compose.md`](../ref/page-compose.md) — every template, every variable, full wizard + list-view schemas.

## Compose vs Blueprint

| Use case | Format |
|---|---|
| SFDC record pages with SLDS components | **Compose** |
| Multi-step wizards with forms + guidance sidebars | **Compose** |
| List views with KPIs, filters, tables | **Compose** |
| Empty / loading / error states | **Compose** |
| Custom layouts, non-SFDC surfaces | [[Page-Blueprint]] |
| Mixed block types, freeform arrangement | [[Page-Blueprint]] |

If your page maps to an SLDS pattern, use Compose. Otherwise use Blueprint directly.

## Script load order

```html
<script src="project-data.js"></script>
<script src="../core/proto-nav.js"></script>
<script src="compose-data.js"></script>
<script src="../core/proto-compose.js"></script>
<script src="../core/compose-flow.js"></script>  <!-- optional: multi-page flows -->
<script src="../core/proto-gen.js"></script>
```

`proto-compose.js` transforms `COMPOSE` → `PAGE_BLUEPRINT` at load. `compose-flow.js` (optional) wires multi-page clickable prototypes from `COMPOSE_FLOW`.

## Layout references

| Layout ref | Use |
|---|---|
| `page-layouts > record_page` | SFDC record detail |
| `page-layouts > list_view` | Table/list pages with KPIs + filters |
| `wizard > wizard_page_shell` | Multi-step wizard forms |

## Template references

Body templates slot into component cards: `detail-grid > base`, `related-list > base`, `feed-item > user`, `data-table > base`, `kpi-card > base` — plus wizard-specific templates (`progress_stepper`, `guidance_sidebar`, `dual_listbox`, `review_accordion`, `wizard_action_bar`).

## Variable substitution

Values use `$KEY` keys. Templates that render multiple items use `repeat` arrays:

```js
{
  template: 'related-list > base',
  repeat: [
    { $INITIALS: 'CB', $TITLE: 'CloudBridge', $SUBTITLE: 'Gold Partner', $META: 'Referral' }
  ]
}
```

## Multi-page flows

`COMPOSE_FLOW` + `compose-flow.js` wire wizard pages into clickable prototypes — automatic Back/Next URLs, stepper sync via `sessionStorage`, auto-generated `SCENARIOS`, and button-text matching.

**Example:** [`examples/deal-registration/`](../examples/deal-registration/) — 9-screen clickable deal registration.

---

## Related

- [[Page-Blueprint]] — the output format Compose transforms into
- [[Surface-Salesforce]] — target surface for most compose pages
- [[SLDS-Rules]] — compliance rules every compose page must follow
- [[Examples]] — Deal Registration walks through a 9-screen compose flow
