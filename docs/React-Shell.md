# React Shell

**Tags:** `runtime` · `react` · `shell` · `integration`

Nib as a React app shell: `packages/nib-react` provides `<NibProvider>`, `<ContextBar>`, `<NavDrawer>`, and fidelity/theme hooks on top of the headless `core/shell/` logic and the same token/chrome CSS every static page uses. No build step (plain `createElement` ESM), no web components.

## The contract

Everything themable lives outside React, so nothing is ported:

- `<html class="wireframe" data-wf-fidelity data-wf-theme data-wf-surface>` gates the [[Design-Tokens|token CSS]] — drafting palette at Blueprint, B&W paper at Napkin, Figtree on the working tiers.
- `wf_fidelity` in local/sessionStorage plus the session theme keys are shared with `proto-nav.js` pages — **fidelity and theme follow the user between the React app and static prototypes**.
- Chrome components render the same `wf-ctx-*` / `wf-nav-drawer*` classes styled by `core/proto-chrome.css`.

## The layers

| Layer | Where | What |
|---|---|---|
| Headless logic | `core/shell/` (`fidelity.js`, `theme.js`, `nav-model.js`) | Pure ESM: page matching, breadcrumbs, drawer model, theme resolution chain, fidelity storage/apply, `FIDELITY_BOOT_SNIPPET` for SSR. The classic-script chrome (`proto-nav.js`) carries the same logic inline for `file://` pages — change both together. |
| React bindings | `packages/nib-react` | `NibProvider` (owns `<html>` attributes + storage, injects the split stylesheets, loads the napkin engine), `ContextBar`, `NavDrawer`, `useFidelity`/`useTheme`/`useNib`. |
| Demo | `examples/react-shell/` | No-bundler demo — React from esm.sh via import map, hash router. Serve the repo root and open it. |

## Usage

```jsx
<NibProvider
  sections={SECTIONS}                  // same schema as project-data.js
  config={{ title, defaultTheme, themes }}
  location={location.pathname}         // from your router
  onNavigate={(href) => navigate(href)}
  coreBase="/nib/core/"
>
  <ContextBar actions={<MyButtons />} />
  <NavDrawer />
  <Routes>…</Routes>
</NibProvider>
```

## Controlled / host-driven use

Apps with their own router, breadcrumb model, or fidelity state don't have to adopt the provider to share the bar. Every provider-derived piece of `<ContextBar>` has a prop override, and a fully-controlled bar needs no `<NibProvider>` at all:

```jsx
<ContextBar
  crumbs={[{ label: 'Home', href: '/' }, { label: 'Deals' }]}  // last = current
  onNavigate={(href, ev) => { ev.preventDefault(); navigate(href); }}
  onHamburger={() => setMenuOpen(true)}
  fidelity={fidelity} onFidelityChange={setFidelity}            // same value names as core/shell
  showTheme={false}                                             // theme badge is provider-only
  leftActions={<MyLensPills />}                                 // after the crumbs
  actions={<MyButtons />}                                       // before the fidelity select
/>
```

Styling still comes from `core/proto-chrome.css`; a host can re-skin without overriding rules by setting the `--wf-*` custom properties on `.wf-ctx-bar`.

## Napkin in an SPA

At napkin the provider lazy-loads the shared engine (`core/wf-napkin.js` + `wf-doodles.js` — the same files static pages and eqPartners use) and runs the asset pass. On route change it calls `WFNapkin.reset()` (clears the scattered gutter marks) and re-scatters against the new content. See [[Fidelity-Levels]] for the placement policy.

## What's intentionally NOT in the React shell

The Stories / Notes / Feedback / Review panels are prototype-annotation tooling (`core/proto-chrome-extras.js`, lazy-loaded by the static chrome). An app shell brings its own equivalents — use the `actions` / `footer` slots.

## SSR / Next.js

Saved fidelity must apply before first paint: emit `FIDELITY_BOOT_SNIPPET` (exported by the package) as the first inline `<script>` in `<head>` — the module graph loads too late to prevent the flash.

---

## Related

- [[Design-Tokens]] — the token contract the shell rides on
- [[Fidelity-Levels]] — what each tier communicates; napkin engine details
- [[Navigation]] — the SECTIONS schema both chromes consume
- [[Architecture]] — the static chrome this mirrors
