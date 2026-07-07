# Layout Patterns

> ⚠️ **Deprecated.** Edit [`docs/Layouts.md`](../docs/Layouts.md) instead. This file will be removed in a future release.

> Read when building multi-column pages, dashboards, or split views.

## Grid Layouts

### 2-Column Equal

```html
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
  <div class="wf-card">Left</div>
  <div class="wf-card">Right</div>
</div>
```

### 3-Column Equal

```html
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
  <div class="wf-card">A</div>
  <div class="wf-card">B</div>
  <div class="wf-card">C</div>
</div>
```

### KPI Row (4 cards)

```html
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
  <div class="wf-card" style="text-align:center;padding:16px;">
    <div style="font-size:24px;font-weight:700;color:var(--wf-ink);">42</div>
    <div style="font-size:11px;color:var(--wf-muted);">Open Deals</div>
  </div>
  <!-- repeat for each KPI -->
</div>
```

## Sidebar Layout

```html
<div style="display:grid;grid-template-columns:240px 1fr;min-height:100vh;">
  <aside style="background:var(--wf-surface);border-right:1px solid var(--wf-line);padding:16px;">
    <!-- nav links -->
  </aside>
  <main style="padding:24px;">
    <!-- page content -->
  </main>
</div>
```

## Split View (50/50)

Used for side-by-side panels (e.g. messages + thread):

```html
<div style="display:flex;flex:1;min-height:0;">
  <div style="flex:1;min-width:0;border-right:1px solid var(--wf-line);overflow-y:auto;">
    <!-- left panel -->
  </div>
  <div style="flex:1;min-width:0;overflow-y:auto;">
    <!-- right panel -->
  </div>
</div>
```

## Content + Fixed Panel (main + sidebar)

```html
<div style="display:flex;flex:1;min-height:0;">
  <div style="flex:1;min-width:0;overflow-y:auto;padding:16px;">
    <!-- scrollable content -->
  </div>
  <div style="width:360px;flex-shrink:0;border-left:1px solid var(--wf-line);overflow-y:auto;padding:16px;">
    <!-- fixed-width panel -->
  </div>
</div>
```

## Tab Content Area

```html
<div class="wf-tabs">
  <button class="wf-tab active" onclick="/* switch tab */">Overview</button>
  <button class="wf-tab" onclick="/* switch tab */">Details</button>
</div>
<div style="padding:16px;">
  <!-- active tab content -->
</div>
```

## Full-Page App Shell (rail + sidebar + main)

For Slack-style or portal layouts:

```html
<div style="display:flex;height:100vh;">
  <div style="width:60px;background:var(--wf-ink);"><!-- icon rail --></div>
  <div style="width:240px;background:var(--wf-surface);"><!-- sidebar nav --></div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <!-- header + content area -->
  </div>
</div>
```

See `surface-slack.md` for the full Slack shell with proper classes.

## Rules

- Use CSS grid for multi-column layouts, flex for single-axis alignment
- Always set `min-height:0` on flex children that scroll — prevents overflow
- Always set `min-width:0` on flex children in rows — prevents content blowout
- Use `var(--wf-line)` for all panel/section borders
- Padding: 16px for panels, 24px for page-level content, 12px for compact cards
