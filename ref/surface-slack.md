# Surface: Slack

> ⚠️ **Deprecated.** Edit [`docs/Surface-Slack.md`](../docs/Surface-Slack.md) instead. This file will be removed in a future release.

> Read when building Slack-style wireframes. Requires `surfaces/slack.css` + `proto-core.css`.

## App Shell Structure

Every Slack page uses this 3-panel layout:

```html
<div class="slack-app">
  <div class="slack-rail"><!-- icon rail (left edge) --></div>
  <div class="slack-sidebar"><!-- channel list --></div>
  <div class="slack-main"><!-- header + content --></div>
</div>
```

### Icon Rail

```html
<div class="slack-rail">
  <div class="slack-rail-workspace">E</div>
  <button class="slack-rail-btn active"><span class="slack-rail-icon">⌂</span>Home</button>
  <button class="slack-rail-btn"><span class="slack-rail-icon">✉</span>DMs</button>
  <button class="slack-rail-btn"><span class="slack-rail-icon">⚡</span>Activity</button>
  <button class="slack-rail-btn"><span class="slack-rail-icon">⋯</span>More</button>
</div>
```

### Sidebar

```html
<div class="slack-sidebar">
  <div class="slack-workspace-header">
    <span class="workspace-name">Workspace Name</span>
    <span class="workspace-menu">▾</span>
  </div>
  <div class="slack-nav-section">
    <div class="slack-nav-section-title">Channels</div>
    <a href="page.html" class="slack-nav-item"># channel-name</a>
    <a href="page.html" class="slack-nav-item slack-nav-item-active"># active-channel</a>
    <a href="page.html" class="slack-nav-item slack-nav-item-private">🔒 private-channel</a>
  </div>
  <div class="slack-nav-section">
    <div class="slack-nav-section-title">Direct Messages</div>
    <a href="page.html" class="slack-nav-item">
      <span class="slack-nav-avatar" style="background:var(--wf-accent);color:#fff">A</span> User Name
    </a>
  </div>
</div>
```

### Main Area

```html
<div class="slack-main">
  <div class="slack-channel-header">
    <div class="flex items-center gap-8">
      <span class="slack-channel-name"># channel-name</span>
      <span class="slack-channel-meta">4 members</span>
    </div>
    <div class="slack-channel-tabs">
      <a href="#" class="slack-channel-tab active"><span class="slack-tab-icon">💬</span> Messages</a>
      <a href="#" class="slack-channel-tab"><span class="slack-tab-icon">📋</span> Canvas</a>
      <a class="slack-channel-tab"><span class="slack-tab-icon">📎</span> Files</a>
      <button class="slack-channel-tab slack-tab-add" aria-label="Add tab">+</button>
    </div>
  </div>
  <div class="slack-messages">
    <!-- message list -->
  </div>
  <div class="slack-composer">
    <textarea class="slack-composer-input" placeholder="Message #channel-name"></textarea>
  </div>
</div>
```

## Messages

```html
<div class="slack-message">
  <div class="slack-message-header">
    <span class="slack-message-avatar" style="background:var(--wf-accent);color:#fff">A</span>
    <span class="slack-message-sender">User Name</span>
    <span class="slack-message-time">2 hours ago</span>
  </div>
  <div class="slack-message-content">
    <div class="slack-message-text">Message content here.</div>
  </div>
</div>
```

Bot message: add `slack-message-avatar--bot` class + APP badge:

```html
<span class="slack-message-avatar slack-message-avatar--bot" style="background:var(--wf-muted);color:#fff">M</span>
<span class="slack-message-sender">Bot Name <span class="slack-message-badge">APP</span></span>
```

Thread stub (clickable, opens thread panel):

```html
<div class="slack-message--thread-stub">
  <span>3 replies</span> · <span>Last reply 20 min ago</span>
</div>
```

## Thread Panel

```html
<div class="slack-thread-panel open">
  <div class="slack-thread-header">
    <div class="slack-thread-title">Thread Title — N replies</div>
    <button class="slack-thread-close">&times;</button>
  </div>
  <div style="padding:12px;overflow-y:auto;flex:1;">
    <!-- thread messages (same markup as regular messages) -->
  </div>
</div>
```

Hidden by default (`display:none`). Add class `open` to show (`display:flex`).
Use `wfThreadOpen()` / `wfThreadClose()` from proto-nav.js.

## Lane Headers (Message Grouping)

```html
<div class="slack-lane-header">
  <div class="slack-lane-title">Section Title</div>
  <div class="slack-lane-subtitle">Description of this message group</div>
</div>
```

## Slack Modal

```html
<div class="slack-modal-overlay" id="my-modal" style="display:none;">
  <div class="slack-modal">
    <div class="slack-modal-header">
      <span class="slack-modal-title">Modal Title</span>
      <button class="slack-modal-close" onclick="wfModalClose('my-modal')">&times;</button>
    </div>
    <div class="slack-modal-body">
      <!-- form groups using wf-form-group -->
    </div>
    <div class="slack-modal-footer">
      <button class="btn btn-ghost" onclick="wfModalClose('my-modal')">Cancel</button>
      <button class="btn btn-primary">Submit</button>
    </div>
  </div>
</div>
```

## DM Layout

Same as channel but without tabs. Use `slack-messages` directly after `slack-channel-header`.

## Class Reference

| Class | Purpose |
|-------|---------|
| `.slack-app` | Root flex container (100vh) |
| `.slack-rail` | 60px icon rail |
| `.slack-sidebar` | 240px channel/DM list |
| `.slack-main` | Flex-1 main content area |
| `.slack-channel-header` | Top bar with name + tabs |
| `.slack-channel-tab` | Individual tab |
| `.slack-messages` | Scrollable message area |
| `.slack-message` | Single message container |
| `.slack-composer` | Bottom input area |
| `.slack-thread-panel` | Side thread panel (hidden default) |
| `.slack-modal-overlay` | Full-screen modal overlay |
| `.slack-lane-header` | Message group divider |

## Rules

- Every Slack page starts with `.slack-app` > `.slack-rail` + `.slack-sidebar` + `.slack-main`
- Avatar colors use tokens: `style="background:var(--wf-accent);color:#fff"`
- Thread panel is hidden by default — add `.open` class to show
- Channel tabs go inside `.slack-channel-header`, not above or below
- Composer goes at the bottom of `.slack-main`, after `.slack-messages`
