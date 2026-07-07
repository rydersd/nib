# Navigation

**Tags:** `reference` · `runtime` · `project-setup`

How `proto-nav.js` turns `project-data.js` into a drawer, breadcrumbs, design notes, and story mode.

## What proto-nav.js builds

1. **Context bar** — top bar with hamburger, breadcrumbs, fidelity slider, notes button — see [[Context-Bar]]
2. **Drawer** — slide-out page list built from `SECTIONS`
3. **Design notes panel** — tabbed overlay (Context / Design / Technical) — see [[Design-Notes]]
4. **Story mode** — unified "Stories" button that opens a scenario selector. When a scenario is active, matching journey highlighting activates automatically; AC badges from `STORY_MAP` appear in the Notes Context tab
5. **Scenarios** — guided step-by-step tours stored in `sessionStorage`

## Required: SECTIONS

Drives the drawer and breadcrumbs. Array of section groups:

```javascript
var SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    epic: 'Epic 1',              // optional — shown as badge
    items: [
      { file: 'home', label: 'Home', type: 'page' },
      { file: 'reports', label: 'Reports', type: 'page' },
      { file: 'settings', label: 'Settings', type: 'modal' }
    ]
  },
  {
    id: 'onboarding',
    label: 'Onboarding Flow',
    epic: 'Epic 2',
    items: [
      { file: 'onboarding-welcome', label: 'Welcome', type: 'page' },
      { file: 'onboarding-company', label: 'Company Info', type: 'page' }
    ]
  }
];
```

`file` = HTML filename without `.html`. `type` = display hint: `page`, `modal`, `channel`, `dm`, `canvas`, `sfdc`, `reference`. Setting `type: 'sfdc'` triggers automatic Salesforce global header injection.

## Optional: STORY_MAP + STORY_TITLES

Lightweight cross-reference mapping pages to design stories (or any story IDs). Shows story badges in the context bar.

```javascript
var STORY_MAP = {
  'home':               ['1.1', '1.2'],
  'onboarding-welcome': ['2.1'],
  'onboarding-company': ['2.2', '2.3']
};

var STORY_TITLES = {
  '1.1': 'Dashboard home layout',
  '1.2': 'KPI widget data binding',
  '2.1': 'Welcome screen with org lookup',
  '2.2': 'Company info form',
  '2.3': 'D&B integration for company search'
};
```

AC badges from `STORY_MAP` are automatically injected into the Notes panel's Context tab — authors don't need to manually reference them.

## Optional: JOURNEYS

Defines user journeys that can be highlighted on pages using `data-journey` attributes:

```javascript
var JOURNEYS = [
  { id: 'onboard-new-partner', label: 'Onboard a new partner', short: 'Onboard' },
  { id: 'submit-deal', label: 'Submit a deal registration', short: 'Deal Reg' }
];
```

On HTML elements, add `data-journey="onboard-new-partner"` to make them highlightable when that journey is selected.

`JOURNEYS` also accepts an object format (useful for keyed data). `proto-nav.js` normalizes both to arrays at init via `normalizeJourneys()`:

```javascript
var JOURNEYS = {
  'pricing-validation': {
    label: 'Pricing Table Validation',
    color: 'var(--wf-accent)',
    steps: ['home', 'results', 'detail']
  }
};
```

## Optional: SCENARIOS

Guided walkthroughs — step-by-step page tours with narrative:

```javascript
var SCENARIOS = [
  {
    id: 'new-partner-onboarding',
    persona: 'Admin',
    label: 'Admin: Onboard a new partner',
    steps: [
      { file: 'home', narrative: 'Jordan opens the partner portal dashboard.' },
      { file: 'onboarding-welcome', narrative: 'Clicks "Add Partner" to start onboarding.' },
      { file: 'onboarding-company', narrative: 'Searches D&B for the company. Fills in details.' }
    ]
  }
];
```

Steps can include an optional `friction` field for gap analysis:

```javascript
{ file: 'results', narrative: '...', friction: 'No visual indicator showing which SKUs changed since last review' }
```

When present, an amber callout appears below the narrative in the scenario banner, highlighting UX gaps — see [[Design-Notes#optional-friction-points|friction points]].

Scenarios use `sessionStorage` to track the current step. `wfScenarioStart(id)` begins, `wfScenarioNext()` advances.

## Optional: DESIGN_STORIES + PROJECT_PHASES

Rich story definitions that power the Design Stories page (`design-stories.html`). While `STORY_MAP` is a lightweight cross-reference (page → story IDs), `DESIGN_STORIES` is the full source of truth for implementation planning — see [[Project-Deliverables]].

When both `STORY_MAP` and `DESIGN_STORIES` are defined, AC badges in the Notes Context tab become clickable links to the Design Stories page.

```javascript
var DESIGN_STORIES = [
  {
    id: '1.1',                    // Must match STORY_MAP/STORY_TITLES IDs
    title: 'Dashboard home layout',
    userStory: 'As a pricing analyst, I want to see KPIs on login so I can prioritize my day',
    status: 'in-progress',        // 'draft' | 'in-progress' | 'accepted' | 'deferred'
    version: 2,                   // Increment when scope changes
    journeyId: 'first-login',     // Optional: ties to a JOURNEY
    pages: ['home', 'dashboard'], // Wireframe pages where this story is realized
    acceptance: [                 // Acceptance criteria
      'Page loads with KPI widgets populated',
      'Dashboard shows data from last 30 days by default'
    ],
    phases: [                     // Per-story phased implementation
      {
        phase: 1,
        label: 'Foundation',
        scope: ['Basic record layout', 'Standard related lists'],
        dependencies: [],
        approach: 'oob'           // 'oob' | 'config' | 'custom-lwc'
      }
    ],
    decisions: [                  // Reverse-chronological decision log
      { date: '2026-03-14', decision: 'Defer custom chart to Phase 2', rationale: 'Dependent on data pipeline' }
    ],
    sfdc: {                       // Optional: SFDC-specific suggestions
      suggestions: [
        'Consider Report Chart component for KPI visualizations',
        'Dynamic Forms can handle field-level visibility rules'
      ]
    }
  }
];
```

Optional project-level phase grouping:

```javascript
var PROJECT_PHASES = [
  { phase: 1, label: 'Foundation', stories: ['1.1', '1.2'], systemDeps: [] },
  { phase: 2, label: 'Enhancement', stories: ['1.3'], systemDeps: ['Data pipeline deployed'] }
];
```

**Relationship:** `STORY_MAP` = lightweight cross-ref (always present for badge injection). `DESIGN_STORIES` = living document (present when implementation tracking is needed). Both use the same story IDs.

## WIREFRAME_CONFIG

Global project metadata and email/theme config, defined in `project-data.js` before `SECTIONS`:

```javascript
var WIREFRAME_CONFIG = {
  title: 'My Project',              // Shown in drawer header
  subtitle: '',                      // Shown below title in drawer
  fallbackPage: 'index.html',       // Fallback for modal close navigation
  emailPrefix: '[WF]',              // Subject line prefix for feedback emails
  emailFooter: 'Sent from wireframe prototype',  // Footer text in feedback emails
  emailRecipient: 'team@example.com', // Recipient for feedback panel submissions
  feedbackEndpoint: '/api/feedback',  // POST target for Feedback button — see Feedback
  defaultTheme: 'nib',              // Default design system theme
  themes: {                          // Project-specific themes (merged with built-ins)
    'my-brand': {
      label: 'My Brand',
      font: "'Next Text', -apple-system, sans-serif",
      fontUrl: 'fonts/next-text.css',
      tokens: {
        '--wf-accent': '#0070c9',
        '--wf-ink': '#1a1a1a'
      }
    }
  }
};
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | `'Wireframes'` | Display name in the drawer header |
| `subtitle` | string | `''` | Subtitle text below the title |
| `fallbackPage` | string | `'index.html'` | Navigation target when modal close has no referrer |
| `emailPrefix` | string | `'[WF]'` | Subject line prefix for feedback emails |
| `emailFooter` | string | `'Sent from wireframe prototype'` | Footer text appended to feedback emails |
| `emailRecipient` | string | `''` | Recipient email for feedback panel |
| `noSurfaceHeader` | boolean | `false` | When `true`, suppresses auto-generated surface headers (e.g., SFDC global nav). Use when you build a custom header in HTML |
| `defaultTheme` | string | `'nib'` | Default design system theme applied when no group/section theme is set |
| `themes` | object | `{}` | Project-specific theme definitions (merged with built-ins: `nib`, `slds`, `material`, `high-contrast`) |

See [[Themes]] for the theme-resolution chain and custom theme builder. See [[Feedback]] for how `feedbackEndpoint` changes context-bar feedback into GitHub issues.

## Theme assignment in SECTIONS

Themes control fonts and design tokens per section/group — [[Themes]] has the resolution order; the assignment lives here in `SECTIONS`.

### Group-level theme assignment

Use `isGroup: true` entries in `SECTIONS` to assign themes to groups of sections:

```javascript
var SECTIONS = [
  // Group header — theme applies to all sections until the next group
  { id: 'grp-sfdc', label: 'SFDC', isGroup: true, theme: 'slds' },
  { id: 'ae', label: 'AE', persona: 'ae', items: [/* ... */] },
  { id: 'psm', label: 'PSM', persona: 'psm', items: [/* ... */] },

  // New group — different theme
  { id: 'grp-partner', label: 'Partner Portal', isGroup: true, theme: 'partner-portal' },
  { id: 'rep', label: 'Sales Rep', items: [/* ... */] },

  // Section can override its group's theme
  { id: 'brand', label: 'Brand Pages', theme: 'blueprint-ds', items: [/* ... */] }
];
```

Resolution (most specific wins): `item.theme` → `section.theme` → nearest `isGroup` theme → `WIREFRAME_CONFIG.defaultTheme` → `'nib'`, with the Settings-panel session override trumping all — see [[Themes#theme-resolution-order]].

### Nested children

Items with `children: [...]` sub-pages inherit their parent item's section/group theme chain:

```javascript
items: [
  { file: 'opportunities', label: 'Opportunities', type: 'sfdc',
    children: [
      { file: 'create-order', label: 'Create Order' },
      { file: 'fulfillment', label: 'Fulfillment' }
    ]
  }
]
```

## Key functions (from proto-nav.js)

| Function | What it does |
|----------|-------------|
| `wfToast(msg, ms)` | Show brief notification (default 2500ms) |
| `wfModalClose(id)` | Close modal by element ID |
| `wfThreadOpen()` | Show `.slack-thread-panel` |
| `wfThreadClose()` | Hide `.slack-thread-panel` |
| `wfDnToggle()` | Toggle design notes panel |
| `wfScenarioStart(id)` | Start a guided scenario |
| `wfScenarioNext()` | Next step in scenario |
| `wfScenarioExit()` | Exit scenario mode |

## Rules

- `project-data.js` must load **before** `proto-nav.js` in the HTML — non-negotiable
- `SECTIONS` is required — without it, no drawer or breadcrumbs render
- `STORY_MAP`, `JOURNEYS`, `SCENARIOS` are optional — features silently skip if missing
- Filenames in `SECTIONS`/`STORY_MAP` never include the `.html` extension
- Every page's filename must match a `file` value in `SECTIONS` for breadcrumbs to work
- `JOURNEYS` accepts both array and object formats — `normalizeJourneys()` handles both

## Fidelity slider and confidence

The context bar includes the three-position Napkin / Blueprint / Polished slider — see [[Fidelity-Levels]] for the CSS custom properties it drives and how `wf_fidelity` persists. Per-element design certainty uses `data-wf-confidence` — see [[Confidence-Levels]].

---

## Related

- [[Architecture]] — the full load order and globals table
- [[Context-Bar]] — the top bar proto-nav.js builds first
- [[Project-Deliverables]] — the sitemap / JTBD / flows pages built on this data
- [[Themes]] — per-section design system themes
- [[Design-Notes]] — panel content structure
- [[Doctor]] — catches missing SECTIONS entries, bad story refs, script order
- [[Lessons-Learned]] — #2 `WIREFRAME_CONFIG` key typos, #3 `JOURNEYS` format confusion, #7 stale sitemaps
