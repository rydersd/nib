# Page Compose

**Tags:** `reference` · `declarative` · `compose` · `salesforce`

Template-level page authoring. Reference a template, substitute variables, get SLDS-aligned output. `proto-compose.js` transforms a `COMPOSE` object into a [[Page-Blueprint|PAGE_BLUEPRINT]], which `proto-gen.js` then renders.

## Compose vs Blueprint

| Use case | Format |
|---|---|
| SFDC record pages with SLDS components | **Compose** — template refs handle card/grid/feed patterns |
| Multi-step wizards with forms + guidance sidebars | **Compose** — wizard layout handles 2-column stepper/form/guidance |
| List views with KPIs, filters, tables | **Compose** — template refs handle list view patterns |
| Empty / loading / error states | **Compose** — template refs map directly |
| Custom layouts, non-SFDC surfaces | [[Page-Blueprint]] — more flexible, any layout/surface |
| Mixed block types, freeform arrangement | [[Page-Blueprint]] — direct block-level control |

If your page maps to an SLDS pattern (record page, list view, wizard), use Compose. Otherwise use Blueprint directly.

## Script load order

```html
<script src="project-data.js"></script>
<script src="../core/proto-nav.js"></script>
<script src="compose-data.js"></script>          <!-- or inline <script> setting window.COMPOSE -->
<script src="../core/proto-compose.js"></script>  <!-- transforms COMPOSE → PAGE_BLUEPRINT -->
<script src="../core/compose-flow.js"></script>   <!-- optional: multi-page flows -->
<script src="../core/proto-gen.js"></script>       <!-- renders PAGE_BLUEPRINT → HTML -->
```

`proto-compose.js` is a no-op when `window.COMPOSE` is undefined — safe to include on any page.

## COMPOSE data structure

```javascript
var COMPOSE = {
  name: 'Screen Title',                    // Human-readable name
  layout: 'page-layouts > record_page',    // Layout template reference
  sections: { ... }                        // Section definitions (layout-specific)
};
```

### Layout references

| Layout reference | Blueprint layout | Use case |
|-----------------|-----------------|----------|
| `page-layouts > record_page` | `record-3col` | SFDC record detail pages |
| `page-layouts > list_view` | `canvas` (list) | Table/list pages with KPIs and filters |
| `wizard > wizard_page_shell` | `canvas` (wizard) | Multi-step wizard forms |

## Record page sections

```javascript
sections: {
  header: {
    template: 'record-header > base',
    data: {
      $ICON: 'DR',                    // 2-letter icon text
      $RECORD_TYPE: 'Deal Registration',
      $RECORD_NAME: 'Meridian Capital Group',
      $highlights: [
        { $LABEL: 'Status', $VALUE: 'Under Review' }
      ]
    }
  },
  path: {
    template: 'path-bar > base',
    data: {
      $stages: [
        { $STAGE_NAME: 'Submitted', state: 'complete' },
        { $STAGE_NAME: 'Review',    state: 'current' },
        { $STAGE_NAME: 'Approved',  state: 'future' }
      ]
    }
  },
  left:  [ /* component-card blocks */ ],
  main:  [ /* component-card blocks */ ],
  right: [ /* component-card blocks */ ]
}
```

### Component card templates

Each column item is a component card:

```javascript
{
  template: 'component-card > base',    // or 'compact' or 'empty_state'
  data: {
    $COMPONENT_TITLE: 'Deal Details',
    $ICON: 'DR',                        // base only: 2-letter icon
    $ICON_BG: '#FCB95B',                // base only: icon background color
    $COUNT: '5',                        // base only: count badge
    $ACTION: 'Upload'                   // compact only: action link text
  },
  body: { ... }                         // inner content (see below)
}
```

### Body templates (inner content)

**Detail grid** — label/value pairs in a 2-column grid:
```javascript
body: {
  template: 'detail-grid > base',
  repeat: [
    { $LABEL: 'Deal Type', $VALUE: 'New Business' },
    { $LABEL: 'Location',  $VALUE: 'DC6 — Ashburn' }
  ]
}
```

**Related list** — items with avatar, title, subtitle, meta badge:
```javascript
body: {
  template: 'related-list > base',
  repeat: [
    { $INITIALS: 'CB', $TITLE: 'CloudBridge', $SUBTITLE: 'Gold Partner', $META: 'Referral' }
  ]
}
```

**Activity feed** — compact feed items:
```javascript
body: {
  template: 'feed-item > user',
  repeat: [
    { $INITIALS: 'MC', $TEXT: 'Marcus Chen assigned as reviewer', $TIME: '2 hours ago' }
  ]
}
```

**Data table** — structured table:
```javascript
body: {
  template: 'data-table > base',
  data: {
    $columns: ['Name', 'Status', 'Value'],
    $rows: [
      ['Acme Deal', 'Active', '$1.2M']
    ]
  }
}
```

### Body shorthands

For simple content, use string shorthands instead of template objects:

```javascript
body: '_buttons: [Edit, Clone, Submit for Approval]'
body: '_text: Descriptive text paragraph here.'
body: '_file: Document_Name.pdf (2.4 MB)'
```

## List view sections

```javascript
sections: {
  header: {
    data: {
      $PAGE_TITLE: 'Deal Registrations',
      $actions: [
        { template: 'button > brand', data: { $LABEL: 'New Deal' } }
      ]
    }
  },
  kpis: {
    template: 'kpi-card > base',
    repeat: [
      { $LABEL: 'Total', $VALUE: '47', $DETAIL: 'All time' }
    ]
  },
  filters: {
    search: { $PLACEHOLDER: 'Search...' },
    dropdowns: [
      { $LABEL: 'Status', $OPTIONS: ['All', 'Pending', 'Approved'] }
    ]
  },
  table: {
    template: 'data-table > base',
    data: {
      $columns: ['ID', 'Name', 'Status'],
      $rows: [
        ['DR-001', 'Acme Deal', 'Approved']
      ]
    }
  },
  /* OR for empty/error/loading states: */
  body: {
    template: 'component-card > empty_state',   // or 'alert > error'
    data: { ... }
  }
}
```

### Empty state

```javascript
body: {
  template: 'component-card > empty_state',
  data: {
    $COMPONENT_TITLE: 'Deal Registrations',
    $EMPTY_TITLE: 'No Deals Yet',
    $EMPTY_MESSAGE: 'Register your first deal to get started.'
  },
  actions: [
    { template: 'button > brand', data: { $LABEL: 'Register Deal' } }
  ]
}
```

### Alert (error/warning/success/info)

```javascript
body: {
  template: 'alert > error',               // error | warning | success | info
  data: {
    $TITLE: 'Unable to Load',
    $MESSAGE: 'Please try again.',
    $actions: [
      { template: 'button > neutral', data: { $LABEL: 'Retry' } }
    ]
  }
}
```

### Skeleton loading

```javascript
body: {
  skeleton_kpis: 5,
  skeleton_rows: 5,
  skeleton_columns: ['ID', 'Name', 'Partner', 'Status']
}
```

## Wizard page sections

```javascript
sections: {
  hero: {
    data: {
      $SUBTITLE: 'All fields required.',
      $REG_TYPE: 'Referral',
      $PROSPECT_NAME: 'Meridian Capital Group'
    }
  },
  stepper: {
    template: 'wizard > progress_stepper',
    data: {
      $STEPS: [
        { number: 1, label: 'Prospect',  state: 'current' },
        { number: 2, label: 'Details',   state: 'future' },
        { number: 3, label: 'Contact',   state: 'future' },
        { number: 4, label: 'Review',    state: 'future' }
      ]
    }
  },
  form: [ /* form section objects */ ],
  guidance: {
    template: 'wizard > guidance_sidebar',
    data: {
      $SIDEBAR_TITLE: 'Guidance',
      $STEP_LABEL: 'Step 1 of 4',
      $DESCRIPTION: 'Instructions for this step.',
      $checklist: ['Step 1', 'Step 2', 'Step 3']
    }
  },
  action_bar: {
    template: 'wizard > wizard_action_bar',
    data: {
      $back_visible: false,                // hide Back on first step
      $back_label: 'Back',
      $next_label: 'Next: Deal Details',
      $next_variant: 'success'             // use for final Submit button
    }
  }
}
```

### Form section templates

**Regular input fields:**
```javascript
{
  section_title: 'Company Details',
  _note: 'Optional note for developers',
  fields: [
    { template: 'form-elements > input',    data: { $LABEL: 'Name *', $VALUE: 'Acme' } },
    { template: 'form-elements > input',    data: { $LABEL: 'City' }, half_width: true },
    { template: 'form-elements > select',   data: { $LABEL: 'Country', $VALUE: 'Select...' } },
    { template: 'form-elements > textarea', data: { $LABEL: 'Notes', $PLACEHOLDER: 'Enter...' } },
    { template: 'form-elements > checkbox', data: { $LABEL: 'Services' }, _options: ['A', 'B', 'C'] }
  ]
}
```

**Dual listbox:**
```javascript
{
  section_title: 'Locations',
  region_pills: ['Americas', 'EMEA', 'APAC'],    // optional filter pills
  fields: [{
    template: 'wizard > dual_listbox',
    data: {
      $available: ['NY5 — New York', 'DC6 — Ashburn'],
      $selected: []
    }
  }]
}
```

**Review accordion (final step):**
```javascript
{
  template: 'wizard > review_accordion',
  data: {
    $SECTION_TITLE: 'Prospect Information',
    $N: '1',
    $rows: [
      { $LABEL: 'Company', $VALUE: 'Meridian Capital Group' }
    ]
  }
}
```

**Prefill checkbox:**
```javascript
{
  section_title: 'Contact',
  prefill_checkbox: { $LABEL: 'I am the contact', $checked: true },
  fields: [ ... ]
}
```

## Template reference table

| Compose template | What it produces |
|-----------------|-----------------|
| `record-header > base` | SFDC record header + highlights panel |
| `path-bar > base` | Sales path bar with stage indicators |
| `component-card > base` | Card with icon + title + count header |
| `component-card > compact` | Card with title-only header |
| `component-card > empty_state` | Empty state card with CTA |
| `detail-grid > base` + repeat | 2-column label/value grid |
| `related-list > base` + repeat | Avatar + title + subtitle list |
| `feed-item > user` + repeat | Compact activity feed items |
| `data-table > base` | Sortable data table |
| `kpi-card > base` + repeat | KPI metric row |
| `wizard > progress_stepper` | Horizontal step indicator |
| `wizard > guidance_sidebar` | Help sidebar with checklist |
| `wizard > dual_listbox` | Available/selected transfer widget |
| `wizard > review_accordion` | Read-only review section |
| `wizard > wizard_action_bar` | Back/Next action bar |
| `alert > error/warning/success/info` | Notification banner |
| `button > brand/neutral` | Button (used in actions arrays) |

## Variable substitution

Variables use the `$KEY` pattern. All values in `data` objects with `$`-prefixed keys are substituted into templates:

```javascript
data: {
  $LABEL: 'Status',      // replaces $LABEL in template
  $VALUE: 'Active'       // replaces $VALUE in template
}
```

## Repeat arrays

Templates that render multiple items use `repeat` arrays. Each item in the array provides variables for one instance:

```javascript
{
  template: 'related-list > base',
  repeat: [
    { $INITIALS: 'CB', $TITLE: 'CloudBridge', $SUBTITLE: 'Gold', $META: 'Referral' },
    { $INITIALS: 'MC', $TITLE: 'Meridian',    $SUBTITLE: 'Prospect', $META: 'Customer' }
  ]
}
```

## Starters

- [`starters/compose-record.html`](../starters/compose-record.html) — SFDC record page (deal detail)
- [`starters/compose-wizard.html`](../starters/compose-wizard.html) — Wizard step (deal registration step 1)

## Multi-page flows (compose-flow.js)

Add `compose-flow.js` between `proto-compose.js` and `proto-gen.js` to wire pages into a clickable prototype. Define `COMPOSE_FLOW` in your `project-data.js`:

```javascript
window.COMPOSE_FLOW = {
  flows: {
    'deal-registration': {
      label: 'Register a New Deal',
      persona: 'Jordan Reeves, Partner Sales Rep',
      entry: 'deal-registration-list',           // list page filename (no .html)
      entryNarrative: 'Jordan opens the list to register a new deal.',
      steps: [
        { file: 'deal-reg-step1', label: 'Prospect', narrative: 'Searches for company...' },
        { file: 'deal-reg-step2', label: 'Details',  narrative: 'Fills in deal info...',
          friction: 'Dual listbox requires scrolling for long lists.' },
        { file: 'deal-reg-step3', label: 'Contact',  narrative: 'Verifies contact...' },
        { file: 'deal-reg-step4', label: 'Review',   narrative: 'Reviews and submits.' }
      ]
    }
  },
  links: {
    'Register New Deal': 'deal-reg-step1.html',
    'Register Your First Deal': 'deal-reg-step1.html'
  }
};
```

What `compose-flow.js` does automatically:

| Feature | How |
|---------|-----|
| Wizard Back/Next navigation | Injects `backUrl`/`nextUrl` into action-bar blocks based on step position |
| Save & Exit | Injects `exitUrl` pointing to the flow's entry page |
| Stepper sync | Updates stepper step statuses via `sessionStorage` as you navigate |
| Auto-generated scenarios | Creates `SCENARIOS` entries so `proto-nav.js` shows guided walkthroughs |
| Button wiring | Matches button text (e.g., "Register New Deal") to URLs from the `links` map |

**Example project:** [`examples/deal-registration/`](../examples/deal-registration/) — 9 screens with full flow wiring.

---

## Related

- [[Page-Blueprint]] — the output format Compose transforms into
- [[Surface-Salesforce]] — target surface for most compose pages
- [[SLDS-Rules]] — compliance rules every compose page must follow
- [[Examples]] — Deal Registration walks through a 9-screen compose flow
