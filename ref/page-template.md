# Page Template

> ⚠️ **Deprecated.** Edit [`docs/Page-Template.md`](../docs/Page-Template.md) instead. This file will be removed in a future release.

> Read before creating any wireframe page. Copy the boilerplate exactly.

## Required Boilerplate

Paths depend on whether nib is a submodule or copied into the project. Both layouts are shown below.

### Submodule layout (pages live in `pages/`, nib is at project root)

```html
<!DOCTYPE html>
<html lang="en" class="wireframe">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] — [Project Name]</title>
  <link rel="stylesheet" href="../nib/core/proto-core.css">
  <link rel="stylesheet" href="../nib/surfaces/[surface].css">
  <link rel="stylesheet" href="project.css">
</head>
<body>

  <!-- PAGE CONTENT HERE -->

  <!-- Design Notes (optional but recommended) -->
  <div class="wf-design-notes">
    <div class="wf-spec-panel">
      <div class="wf-spec-header">[Page Name]</div>
      <div class="wf-spec-section">
        <div class="wf-spec-section-title">Summary</div>
        <div class="wf-spec-body">[What this page shows and why]</div>
      </div>
      <div class="wf-spec-section">
        <div class="wf-spec-section-title">JTBD</div>
        <div class="wf-spec-body">[User job this page serves]</div>
      </div>
      <div class="wf-spec-section">
        <div class="wf-spec-section-title">Design Spec</div>
        <div class="wf-spec-body">[Layout, components, interactions]</div>
      </div>
    </div>
  </div>

  <script src="project-data.js"></script>
  <script src="../nib/core/proto-nav.js"></script>
  <script src="../nib/core/proto-scatter-gl.js"></script>
</body>
</html>
```

### Copy layout (flat directory, nib files copied in)

```html
<!DOCTYPE html>
<html lang="en" class="wireframe">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] — [Project Name]</title>
  <link rel="stylesheet" href="../core/proto-core.css">
  <link rel="stylesheet" href="../surfaces/[surface].css">
  <link rel="stylesheet" href="project.css">
</head>
<body>

  <!-- PAGE CONTENT HERE -->

  <!-- Design Notes (optional but recommended) -->
  <div class="wf-design-notes">
    <div class="wf-spec-panel">
      <div class="wf-spec-header">[Page Name]</div>
      <div class="wf-spec-section">
        <div class="wf-spec-section-title">Summary</div>
        <div class="wf-spec-body">[What this page shows and why]</div>
      </div>
      <div class="wf-spec-section">
        <div class="wf-spec-section-title">JTBD</div>
        <div class="wf-spec-body">[User job this page serves]</div>
      </div>
      <div class="wf-spec-section">
        <div class="wf-spec-section-title">Design Spec</div>
        <div class="wf-spec-body">[Layout, components, interactions]</div>
      </div>
    </div>
  </div>

  <script src="project-data.js"></script>
  <script src="../core/proto-nav.js"></script>
  <script src="../core/proto-scatter-gl.js"></script>
</body>
</html>
```

## Checklist

1. `class="wireframe"` on `<html>` — activates token system
2. proto-core.css loaded first — always required
3. ONE surface CSS loaded second — pick the right one for this page
4. project-data.js loaded before proto-nav.js — provides SECTIONS data
5. proto-nav.js loaded after project-data.js — builds context bar + drawer from SECTIONS
6. proto-scatter-gl.js loaded after proto-nav.js (optional) — enables WebGL paper curl transition in napkin mode. If omitted, CSS rigid-body fallback is used automatically
7. Design notes panel included — the `wf-spec-panel` drives the "Design Notes" button in the context bar

## Optional: Auth Gate

If project needs login simulation, add as first `<script>` in `<head>`:

```html
<script>
if(sessionStorage.getItem('wf_auth')!=='ok'){
  sessionStorage.setItem('wf_auth_dest',location.pathname.split('/').pop()||'index.html');
  location.href='login.html';
}
</script>
```

## Rules

- No embedded `<style>` blocks — put page-specific CSS in project.css or inline styles
- Script load order matters: project-data.js THEN proto-nav.js
- Define `WIREFRAME_CONFIG` in project-data.js (before SECTIONS) to set project title, default fidelity, feedback mailto, and other options — see `navigation.md` for all properties
- Add `type: 'sfdc'` to SECTIONS items that should render a Salesforce global header — proto-nav.js auto-injects it via `buildSurfaceHeader()`
- To suppress the auto-generated SFDC header, either set `WIREFRAME_CONFIG.noSurfaceHeader = true` in project-data.js, or build your own `<header class="sfdc-global-header">` in HTML (auto-detected, no config needed)
- See `ref/lessons-learned.md` for common pitfalls when setting up a new project
- Every page should have design notes — it's how reviewers understand intent
- Title format: `[Page Name] — [Project Name]`
