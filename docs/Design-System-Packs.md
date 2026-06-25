# Design-System Packs

**Tags:** `reference` · `design-system` · `theming` · `figma`

A **pack** lets a Nib project adopt a real design system's **tokens**, **theme**,
and (optionally) a **Figma component map** for round-trip generation. Packs are
how Nib reuses an inventoried design system — the output of the Figma-inventory
pipeline — across projects.

Packs build on [[Themes]]: a pack registers itself as a theme, so it shows up in
the theme switcher and reuses the existing token/font/badge machinery.

## The engine / data split

Nib is a public framework, but a real design system's extracted values (token
hexes, component publish-keys, the component map) are often **proprietary**. A
public repo can't keep them private — git history is permanent. So Nib separates
the generic *engine* from the *pack data*:

| Layer | Lives in | Who can use it |
|---|---|---|
| **Engine** — `core/packs/loader.js`, the contract | public Nib | anyone |
| **Pack data** — tokens, theme, component map | a separate (often **private**) package | authorized installers |

A private pack publishes to a private registry (e.g. GitHub Packages); only org
members with an auth token can install it. The public engine never contains it.

## Anatomy of a pack

```
your-pack/
  pack.json           # { id, name, version, nibContract, exports }
  theme.js            # registers window.NIB_PACKS[id]  ← only required runtime file
  tokens.css          # static :root fallback (mirror of theme.js)
  design-system.json  # canonical inventory (tokens, components, patterns)
  figma-map.json      # component keys + variant grammar + $var bindings (draw skill)
```

See the IP-free reference pack at `packs/sample/` (open `packs/sample/demo.html`).

### `theme.js`
```js
window.NIB_PACKS = window.NIB_PACKS || {};
window.NIB_PACKS['yourds'] = {
  id: 'yourds',
  label: 'Your DS',
  nibContract: '1.0',
  theme: {
    label: 'Your DS',
    font: "'Your Font', sans-serif",
    fontUrl: 'https://…/font.css',   // optional
    tokens: { '--wf-ink': '#…', '--wf-accent': '#…' /* … */ }
  },
  figmaMapUrl: 'figma-map.json'        // optional
};
```

## Using a pack

```js
// data/wireframe-config.js
window.WIREFRAME_CONFIG = { /* … */, pack: 'yourds' };
```
- `pack: 'yourds'` — apply the pack's theme as the default.
- `pack: { id: 'yourds', applyTheme: false }` — register it in the switcher but
  don't force it; the user can select it manually.

**Load order:**
```
project-data.js  →  pack theme.js  →  core/proto-nav.js  →  core/packs/loader.js
```

The loader: registers the pack theme, makes it the default (unless the project
or a user session-override chose another), and applies it via proto-nav's theme
engine (font injection + badge included). It degrades to direct token
application if proto-nav isn't present. `window.NIB_ACTIVE_PACK` exposes the
active pack to the draw skill.

## How packs get made

You don't hand-author production packs — they're **emitted by the Figma-inventory
pipeline**: connect to a Figma file, inventory its tokens/components/patterns,
and emit `design-system.json` + `tokens.css` + `theme.js` + `figma-map.json`.
The `figma-map.json` is what lets the draw skill recreate HTML/Claude designs
using **real component instances** (e.g. a table built from the design system's
cell components) rather than redrawn primitives.

## Publishing a private pack (GitHub Packages)

```ini
# .npmrc (consumer side)
@your-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}   # needs read:packages + org SSO
```
```sh
npm i @your-org/nib-yourds
```

---

## Related

- [[Themes]] — packs build on the theme engine; a pack *is* a theme at runtime
- [[Design-Tokens]] — the `--wf-*` tokens a pack's theme overrides
- [[Create-Project]] — `create-nib --pack` wires a pack at scaffold time
- [[Themes#resolution-order]] — how a pack theme resolves against per-section overrides
