# Distilling a Design System into a Nib Theme

> ⚠️ **Deprecated.** Edit [`docs/Themes.md`](../docs/Themes.md) instead. This file will be removed in a future release.

To configure nib for your design system, define a theme object in
`WIREFRAME_CONFIG.themes`. Use this guide to extract what you need.

## What to gather from your design system

| Property | Where to find it | Example |
|----------|------------------|---------|
| Primary font family | Typography page / brand guidelines | `'Next Text'` |
| Font file URL | CDN, Google Fonts, or self-hosted | `'fonts/next-text.css'` |
| Primary action color | Buttons, links, active states | `#0176d3` |
| Ink / heading color | H1-H3, dark text | `#181818` |
| Body text color | Paragraph text | `#3e3e3c` |
| Muted / secondary text | Labels, captions, timestamps | `#706e6b` |
| Border / divider color | Card borders, table lines | `#c9c9c9` |
| Light fill / tint | Hover states, tag backgrounds | `#f3f3f3` |
| Surface / card background | Card, modal backgrounds | `#f3f3f3` |
| Canvas / page background | Page body background | `#ffffff` |
| Border radius | Card corners, button rounding | `4px` |

## Template

```javascript
'my-system': {
  label: 'My Design System',
  font: "'Font Name', -apple-system, sans-serif",
  fontUrl: 'path/to/font.css',  // omit if system font or already loaded
  tokens: {
    '--wf-accent':  '#______',
    '--wf-ink':     '#______',
    '--wf-text':    '#______',
    '--wf-muted':   '#______',
    '--wf-line':    '#______',
    '--wf-tint':    '#______',
    '--wf-surface': '#______',
    '--wf-canvas':  '#______',
    '--wf-radius':  '___px'
  }
}
```

Only include tokens you want to override. Omitted tokens keep nib defaults.

## How themes are applied

Themes are defined in `WIREFRAME_CONFIG.themes` and resolved per-page:

1. **Item-level:** `item.theme` on individual pages (rare)
2. **Section-level:** `section.theme` on a SECTIONS entry
3. **Group-level:** nearest `isGroup: true` entry above with a `theme`
4. **Global default:** `WIREFRAME_CONFIG.defaultTheme` or `'nib'`
5. **Session override:** Force-all via Settings panel

## Built-in presets

Nib ships with these themes (no project config needed):

- **nib** — Default wireframe aesthetic (Inter font, blue accent)
- **slds** — Salesforce Lightning Design System
- **material** — Material Design (Roboto font)
- **high-contrast** — High-contrast accessibility theme

## Multi-system example

```javascript
var WIREFRAME_CONFIG = {
  title: 'Multi-Portal Experience',
  defaultTheme: 'nib',
  themes: {
    'partner-portal': {
      label: 'PartnerCentral',
      font: "'Nexa Sans', -apple-system, sans-serif",
      fontUrl: 'fonts/nexa-sans.css',
      tokens: {
        '--wf-accent': '#0070c9',
        '--wf-ink': '#1a1a1a'
      }
    },
    'customer-portal': {
      label: 'Customer Portal (Quix)',
      font: "'Inter', sans-serif",
      tokens: {
        '--wf-accent': '#ed1c24',
        '--wf-ink': '#242424'
      }
    }
  }
};

var SECTIONS = [
  { id: 'grp-sfdc', label: 'SFDC', isGroup: true, theme: 'slds' },
  { id: 'ae', label: 'AE', persona: 'ae', items: [/* ... */] },
  { id: 'psm', label: 'PSM', persona: 'psm', items: [/* ... */] },

  { id: 'grp-partner', label: 'Partner Portal', isGroup: true, theme: 'partner-portal' },
  { id: 'rep', label: 'Sales Rep', items: [/* ... */] },

  { id: 'grp-customer', label: 'Customer Portal', isGroup: true, theme: 'customer-portal' },
  { id: 'ecp', label: 'ECP', items: [/* ... */] },
];
```

## Custom fonts

The framework provides plumbing to load fonts, not the fonts themselves.

`fontUrl` can be:
- A relative path to a local CSS file with `@font-face` declarations
- A Google Fonts URL
- Omitted if the font is already loaded or is a system font
