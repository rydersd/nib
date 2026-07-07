# nib-react

React bindings for the Nib wireframe shell: `<NibProvider>`, `<ContextBar>`, `<NavDrawer>`, and fidelity/theme hooks. No build step, no web components — plain ESM using `React.createElement`, styled by the same `core/proto-tokens.css` + `core/proto-chrome.css` every static Nib page uses.

## Why it interoperates with static prototypes

The whole theming contract lives outside React:

- `<html class="wireframe" data-wf-fidelity data-wf-theme data-wf-surface>` gates all token CSS (drafting palette at blueprint, B&W paper at napkin, Figtree on the working tiers).
- `localStorage`/`sessionStorage` `wf_fidelity` + the session theme keys are shared with `proto-nav.js` pages.

Navigate from the React app to a static wireframe and the user's fidelity/theme follow. The pure logic (page matching, breadcrumbs, drawer model, theme resolution, fidelity storage) lives in nib's `core/shell/` and is consumed here via relative imports.

## Usage

```jsx
import { NibProvider, ContextBar, NavDrawer } from 'nib-react';

function App() {
  const location = useLocation();            // your router
  const navigate = useNavigate();
  return (
    <NibProvider
      sections={SECTIONS}                    // same schema as project-data.js
      config={{ title: 'My Project', defaultTheme: 'nib', themes: {} }}
      location={location.pathname}
      onNavigate={(href) => navigate(href)}  // omit to allow full-page navs
      coreBase="/nib/core/"                  // where nib's core/ is served
    >
      <ContextBar actions={<MyButtons />} />
      <NavDrawer />
      <Routes>…</Routes>
    </NibProvider>
  );
}
```

Hooks:

```js
const [fidelity, setFidelity] = useFidelity();   // 'napkin' | 'blueprint' | 'polished'
const { themeId, themes, setThemeOverride } = useTheme();
const { page, file, sections } = useNib();
```

## Napkin in an SPA

At napkin fidelity the provider lazy-loads the shared engine (`core/wf-napkin.js` + `wf-doodles.js` — the same files static pages use) and runs the asset pass: sharpie ink frames, scissor-cut cards, gutter-only stains and doodles, drawer doodle strip. On route change it calls `WFNapkin.reset()` and re-scatters against the new content.

## SSR / Next.js

The saved fidelity must apply before first paint. Emit `FIDELITY_BOOT_SNIPPET` (exported from the package) as the first inline `<script>` in `<head>` — it's the same 10 lines as `core/wf-fidelity-boot.js`.

## Notes

- `injectStyles` (default `true`) injects the seven split Nib stylesheets from `coreBase` in canonical order; pass `false` if your app links them itself.
- One surface per route: pass `surface` explicitly or let it derive from the SECTIONS item `type`.
- The static chrome's Stories/Notes/Feedback/Review panels are prototype-annotation tooling (`proto-chrome-extras.js`) and are intentionally not part of the app shell; use the `actions` / `footer` slots.

## Demo

`examples/react-shell/index.html` — no-bundler demo (React from esm.sh via import map, hash router). Serve the nib repo root and open `/examples/react-shell/`.
