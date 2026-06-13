# Page Template

**Tags:** `guide` · `project-setup` · `boilerplate`

The required HTML boilerplate for every Nib page. Copy this exactly.

> **Agent reference:** [`ref/page-template.md`](../ref/page-template.md) — both submodule and copy layouts.

## Minimum viable page

```html
<!DOCTYPE html>
<html lang="en" class="wireframe">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Name] — [Project Name]</title>
  <link rel="stylesheet" href="../core/proto-core.css">
  <link rel="stylesheet" href="../surfaces/[surface].css">
  <link rel="stylesheet" href="project.css">
</head>
<body>

  <!-- page content -->

  <div class="wf-design-notes">
    <!-- see Design-Notes page for the full structure -->
  </div>

  <script src="project-data.js"></script>
  <script src="../core/proto-nav.js"></script>
</body>
</html>
```

## Required elements

1. `class="wireframe"` on `<html>` — activates the token system
2. `proto-core.css` loaded **first** — always required
3. Exactly **one** surface CSS — pick from [[Surfaces]]
4. `project-data.js` loads **before** `proto-nav.js` — see [[Navigation]]
5. A `.wf-design-notes` div on every page — see [[Design-Notes]]

## Submodule vs copy layout

If Nib is a git submodule at project root, paths use `../nib/core/...`. If core files are copied flat into the project, use `../core/...`. Starters come in both flavors — see [[New-Project]].

## Title format

Always `[Page Name] — [Project Name]` (em dash, not hyphen).

## Optional: auth gate

For login-simulation projects, add a tiny script in `<head>` that redirects to `login.html` unless `sessionStorage('wf_auth') === 'ok'`. See the agent reference for the snippet.

## Rules

- No embedded `<style>` blocks — use `project.css` or inline styles
- No hardcoded hex — always `var(--wf-*)` tokens (see [[Design-Tokens]])
- One surface CSS per page — never mix Slack + SFDC

---

## Related

- [[Getting-Started]] — the 5-minute walkthrough for new projects
- [[New-Project]] — full project bootstrap
- [[Surfaces]] — which surface CSS to load
- [[Design-Notes]] — structure for the required notes div
- [[Doctor]] — validates load order and missing notes
