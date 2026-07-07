# Utility Modules

**Tags:** `reference` · `runtime` · `components`

Small opt-in `core/` modules that add one behavior each. All are standalone scripts — add a `<script>` tag after `proto-nav.js` and they self-initialize (each is a safe no-op when its trigger markup or config is absent). The napkin engine (`wf-napkin.js`, `wf-doodles.js`, `wf-fidelity-boot.js`) is documented separately in [[Fidelity-Levels]].

## proto-signals.js — intelligence signal bar

A collapsible "intelligence signal bar": a thin strip between the [[Context-Bar|context bar]] and page content that expands into a panel of insight cards. Drop a mount div anywhere and pass signal data as JSON:

```html
<div class="wf-signal-mount"
     data-label="Account Intelligence"
     data-signals='[{ "type": "opportunity", "label": "Upsell",
       "headline": "Expansion opportunity",
       "body": "Comparable accounts that add the analytics module retain at 1.8x the rate.",
       "metric": "1.8x", "metricLabel": "retention lift",
       "action": "See the analytics module", "actionHref": "#" }]'>
</div>
<script src="../core/proto-signals.js"></script>
```

Signal types: `program` (accent — active program/playbook), `risk` (amber/red — friction, churn risk, a gap), `opportunity` (green — upside action), `insight` (muted — neutral observation). `data-label` sets the bar/panel title (default "Intelligence"). Companion CSS lives in `proto-components.css` under "Signal layer".

## proto-kpi-filter.js — KPI-card-as-filter

Convention-based, zero markup required: auto-discovers `.ds-kpi-card` / `.sfdc-kpi-card` grids and the nearest filterable table (`.ds-data-table`, `.wf-table`, or first `<table>`). Clicking a card filters the table to that card's segment (Lightning-style: filter pill + accent ring; KPI values keep full-dataset numbers). Clicking again clears.

How it decides what to filter, in priority order:

1. Explicit: `data-kpi-filter="colIndex:value"` on the card
2. Explicit: `data-kpi-col="3" data-kpi-match="Pending,Under Review"`
3. Auto: scans card label text for known status/stage keywords ("pending", "approved", "at risk", "closed won", …) and matches table cell text. Aggregate labels ("pipeline", "total") show all rows; analytics-only labels ("avg", "rate") get a highlight but don't filter

Load after `proto-nav.js`; opt a page out with `window.WF_KPI_FILTER_SKIP = true`. All styling uses [[Design-Tokens|`--wf-*` tokens]].

## proto-analytics.js — Umami analytics

Meta-gated Umami tracking. Loads the Umami script **only** when a website ID is configured, and never on localhost / `file://`, so local development can't pollute production metrics.

```html
<meta name="wf-umami-id"   content="abc-123-def-456">
<meta name="wf-umami-host" content="https://cloud.umami.is">  <!-- optional -->
```

Or via `WIREFRAME_CONFIG.umami = { id, host }` in `project-data.js` (markup wins when both exist). Exposes `window.wfTrack(eventName, data)` for prototype-specific events (`journey-node-open`, `fidelity-change`, `feedback-submit`, …) — calls buffer in a queue until Umami loads and become no-ops when it never does. Load order: `project-data.js` → `proto-nav.js` → `proto-analytics.js`.

## proto-wizard-help.js — wizard help-column toggle

Flips a `.wf-wizard-help-col[data-help-state]` sidebar between `"default"` (a quiet helper card with sample questions + an ask field) and `"active"` (a pre-seeded AI-chat thread). Wireframe theater only — each wizard page inlines its own seeded Q&A in the active-state markup; the JS just toggles which state is visible. Exposes `window.wfWizardAsk(seed)` and `window.wfWizardAskClose()`. Companion CSS lives in `proto-components.css` under "Wizard help column". Pairs with [[Page-Compose]] wizard pages.

## proto-scatter-gl.js — WebGL paper-curl page transition

**Not a chart library.** A page-transition engine: every visible element becomes a scrap of roughly torn paper. On navigate-out, a gust catches unglued edges and scraps flutter off-screen; on load-in, scraps drift down and settle flat, with focus elements flapping briefly to draw the eye.

- Only active at **napkin** fidelity — `proto-nav.js` intercepts internal `.html` link clicks there and calls the scatter navigation; blueprint/polished use native navigation
- Load **after** `proto-nav.js`; entirely optional — `proto-nav.js` has a CSS-transform fallback when the script (or WebGL) is missing
- Wind direction persists across the navigation via `sessionStorage.wf_scatter_angle` so the in-animation continues the out-animation

```html
<script src="../core/proto-nav.js"></script>
<script src="../core/proto-scatter-gl.js"></script>
```

See [[Fidelity-Levels]] for the napkin aesthetic this belongs to.

## home-alt.css / home-alt.js — alternate landing surface

A realistic-fidelity "Day-N landing" surface consumed by eqPartners (`pm-home-dashboard-alt*.html`, `rep-home-alt*.html`) — standalone pages with **no** `html.wireframe` class that render as the product would ship, using a token set locked from a Figma source file (own `--pr-*` palette + font ramp, not `--wf-*`).

`home-alt.js` is a simulated agent — demo-grade, no network, no persistence:

1. **Single-shot asks** — chips/module rows carry `data-ask` (lands in the input), `data-reply` (canned grounded answer), and optionally `data-confirm` (commit-level action behind an explicit confirm)
2. **Scripted conversations** — elements with `data-convo="<key>"` start a multi-turn thread from a `CONVOS` registry; replies can carry follow-up chips
3. **Recent searches** — focusing the ask input shows persona-grounded recent items; picking one runs the matching reply

Free-text asks fall back to the container's `data-default-reply`. Persona variables keep the same scripted tour grounded in each viewer's own records. Treat it as a project-specific surface, not a general Nib primitive — it demonstrates how far a canned-agent prototype can go without a backend.

---

## Related

- [[Fidelity-Levels]] — the napkin engine and the fidelity states scatter-gl keys off
- [[Context-Bar]] — the chrome these modules load alongside
- [[Components]] — the `wf-`/`ds-` primitives kpi-filter and signals build on
- [[Architecture]] — script load order and where optional modules slot in
- [[Workshop-Resources]] — the other standalone `core/` engine (printable sheets)
