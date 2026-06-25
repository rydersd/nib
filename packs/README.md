# Design-System Packs

A **pack** lets a Nib project adopt a real design system's tokens, theme, and
(optionally) a Figma component map for round-trip generation. The pack *engine*
(`core/packs/loader.js`) is generic and ships with Nib. Pack *data* can live
here (public reference packs) or in a separate, often **private**, package.

## Why packs exist

Nib is a public framework. A real design system's extracted values (token
hexes, component publish-keys, the component map) are frequently **proprietary**
and must not live in a public repo — git history is permanent. So Nib separates:

| Layer | Lives in | Example |
|---|---|---|
| **Engine** | public Nib | `core/packs/loader.js`, this contract |
| **Pack data** | a private package | `@your-org/nib-yourds` (private npm/GitHub Packages) |

The public engine *defines* the contract; a private package *implements* it.
Anyone can run the engine; only org members can install the private pack.

## Pack contract (`nibContract: "1.0"`)

A pack is a directory/package with:

```
your-pack/
  pack.json           # { id, name, version, nibContract, exports }
  theme.js            # registers window.NIB_PACKS[id] (tokens + theme)
  tokens.css          # static :root fallback (mirror of theme.js tokens)
  design-system.json  # canonical inventory (tokens, components, patterns)
  figma-map.json      # component keys + variant grammar + $var bindings
```

### `theme.js` — the only required runtime file
```js
window.NIB_PACKS = window.NIB_PACKS || {};
window.NIB_PACKS['yourds'] = {
  id: 'yourds',
  label: 'Your DS',
  nibContract: '1.0',
  theme: {                       // consumed by proto-nav's theme engine
    label: 'Your DS',
    font: "'Your Font', sans-serif",
    fontUrl: 'https://…/font.css', // optional
    tokens: { '--wf-ink': '#…', '--wf-accent': '#…', /* … */ }
  },
  figmaMapUrl: 'figma-map.json'   // optional; lazy-loaded by the draw skill
};
```

## Using a pack in a project

```js
// data/wireframe-config.js (or project-data.js)
window.WIREFRAME_CONFIG = { /* … */, pack: 'yourds' };
// register without forcing it as the active theme:
window.WIREFRAME_CONFIG = { /* … */, pack: { id: 'yourds', applyTheme: false } };
```

Load order:
```
project-data.js  →  pack theme.js  →  core/proto-nav.js  →  core/packs/loader.js
```

The loader registers the pack as a theme (so it shows in the theme switcher),
sets it as the default theme (unless the project or user chose another), and
applies it through proto-nav's existing theme/font/badge engine — falling back
to direct token application if proto-nav isn't loaded. A user's session theme
override always wins. `window.NIB_ACTIVE_PACK` exposes the active pack to the
draw skill.

## Reference pack

[`sample/`](./sample/) is an IP-free pack demonstrating every file. Open
[`sample/demo.html`](./sample/demo.html) in a browser to see it apply.

## Building a real pack

Real packs are emitted by the Figma-inventory pipeline (see
`docs/Design-System-Packs.md` and the inventory skill), not hand-authored.
Publish a private pack to a private registry, e.g. GitHub Packages:

```
# .npmrc (consumer)
@your-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```
```
npm i @your-org/nib-yourds
```
