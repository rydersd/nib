# Surface: Slack

**Tags:** `surface` · `slack`

For Slack app wireframes — messages, threads, channels, app home. Uses the `slack-` prefix.

**CSS file:** [`surfaces/slack.css`](../surfaces/slack.css)
**Agent reference:** [`ref/surface-slack.md`](../ref/surface-slack.md)
**Starters:** [`starters/slack-channel.html`](../starters/slack-channel.html), [`starters/slack-dm.html`](../starters/slack-dm.html)

```html
<link rel="stylesheet" href="../core/proto-core.css">
<link rel="stylesheet" href="../surfaces/slack.css">
```

## Key components

| Class | Purpose |
|---|---|
| `.slack-shell` | Full Slack app container with sidebar + main |
| `.slack-sidebar` | Channel navigation sidebar |
| `.slack-message` | Chat message with avatar + content |
| `.slack-thread` | Thread container |
| `.slack-composer` | Message input area |
| `.slack-btn-primary` | Slack-styled primary button |

## Example

```html
<div class="slack-shell">
  <div class="slack-sidebar">
    <!-- channel list -->
  </div>
  <div class="slack-main">
    <div class="slack-message">
      <img class="slack-avatar" src="...">
      <div class="slack-message-body">
        <strong>Alice</strong> <span class="slack-timestamp">10:23 AM</span>
        <p>Hello team!</p>
      </div>
    </div>
    <div class="slack-composer">
      <!-- input -->
    </div>
  </div>
</div>
```

## When to use

- Slack bot messages and block-kit layouts
- App home tabs
- Slash-command response modals
- Thread views and DM previews

---

## Related

- [[Surfaces]] — overview and comparison
- [[Components]] — shared `wf-` components that work here too
- [[Design-Tokens]] — tokens this surface builds on
- [`ref/surface-slack.md`](../ref/surface-slack.md) — agent-facing reference
- [`examples/agent-chat/`](../examples/agent-chat/) — live example
