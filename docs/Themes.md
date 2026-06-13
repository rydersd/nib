# Themes

**Tags:** `reference` · `design-system` · `theming`

How Nib applies different design systems per section. A theme is a font + token override bundle, resolved per-page.

> **Agent reference:** [`ref/design-system-theme.md`](../ref/design-system-theme.md) — extraction guide + full custom theme schema.

## Built-in themes

| Theme ID | Label |
|---|---|
| `nib` | Default wireframe aesthetic (Inter font, blue accent) |
| `slds` | Salesforce Lightning Design System — see [[SLDS-Rules]] |
| `material` | Material Design (Roboto font) |
| `high-contrast` | High-contrast accessibility theme |

## Defining a custom theme

Add to `WIREFRAME_CONFIG.themes` in `project-data.js`. Only include the tokens you're overriding — omitted tokens keep Nib defaults.

```js
themes: {
  'partner-portal': {
    label: 'PartnerCentral',
    font: "'Nexa Sans', -apple-system, sans-serif",
    fontUrl: 'fonts/nexa-sans.css',   // omit for system fonts
    tokens: {
      '--wf-accent': '#0070c9',
      '--wf-ink':    '#1a1a1a'
    }
  }
}
```

## What to extract from a design system

| Property | Token | Where to find it |
|---|---|---|
| Primary action color | `--wf-accent` | Buttons, links, active states |
| Ink / heading | `--wf-ink` | H1-H3 color |
| Body text | `--wf-text` | Paragraph color |
| Muted | `--wf-muted` | Labels, timestamps |
| Border | `--wf-line` | Card edges, table lines |
| Surface | `--wf-surface` | Card background |
| Canvas | `--wf-canvas` | Page background |
| Border radius | `--wf-radius` | Card / button corners |
| Font family | `font` field | Brand guidelines |

See [[Design-Tokens]] for the full token list.

## Theme resolution order

Most specific wins:

1. **Item-level** — `item.theme` on a page
2. **Section-level** — `section.theme`
3. **Group-level** — nearest `isGroup: true` entry above with a `theme`
4. **Global default** — `WIREFRAME_CONFIG.defaultTheme` or `'nib'`
5. **Session override** — Settings-panel "Force all" via `sessionStorage('wf_theme_override')`

## Multi-system projects

Use `isGroup: true` entries in `SECTIONS` to assign themes to ranges of sections — perfect for a project with SFDC pages in one group and a partner portal in another. Individual sections can override their group's theme. See [[Navigation]].

## Settings panel

Click the theme badge in the context bar (or the drawer's Settings link) to open a panel with: active-theme display, per-section assignments, session-wide force-all override, and a custom-theme builder.

---

## Related

- [[Design-Tokens]] — the `--wf-*` tokens a theme overrides
- [[Navigation]] — `isGroup` entries and per-section `theme` fields
- [[SLDS-Rules]] — the built-in `slds` theme + compliance
- [[Surface-Salesforce]] — pairs with the `slds` theme
