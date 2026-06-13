# Feedback Endpoint

> ⚠️ **Deprecated.** Edit [`docs/Feedback.md`](../docs/Feedback.md) instead. This file will be removed in a future release.

> Read when wiring a project to post context-bar feedback to a backend instead of mailto. For the narrative / setup guide, see the wiki: `docs/Feedback.md`.

## How the client picks a mode

`wfFbSubmit` in `core/proto-nav.js`:

- If `WIREFRAME_CONFIG.feedbackEndpoint` is truthy → POST JSON to that URL
- Otherwise → open a mailto: URL with `WIREFRAME_CONFIG.emailRecipient`

On POST failure (any non-2xx or network error):
- Falls back to mailto: when `emailRecipient` is set
- Otherwise toasts a user-visible error

## Request payload

```json
{
  "type": "issue",
  "description": "…",
  "page_url":    "https://…",
  "page_file":   "home",
  "persona":     "Admin",
  "user_agent":  "Mozilla/5.0 …",
  "screenshot_base64": "data:image/png;base64,…",
  "node_id":     "ds-rev"
}
```

- `type` is one of: `bug`, `question`, `idea`, `issue`, `suggestion`, `approved`, `other`. Anything else should be coerced server-side.
- `screenshot_base64` is `null` when no screenshot was captured.
- `persona` is read from the first `.wf-ctx-persona-chip` or `.persona-badge` in the DOM.
- `node_id` is included when `window._wfActiveNodeId` is set — the blueprint canvas sets this when feedback is opened from a node so the Worker can label the issue `node:<id>`. Empty string otherwise. Worker validates against `^[a-z0-9][a-z0-9-]{0,60}$`.

## Expected response

```json
{
  "success": true,
  "issue_number": 42,
  "issue_url": "https://github.com/org/repo/issues/42",
  "screenshot_url": "https://pub-….r2.dev/…png"
}
```

When the response includes `issue_number`, the toast reads `Issue #<n> created`. Otherwise the toast is generic.

## Screenshot capture

"📷 Capture this page" in the panel lazy-loads html2canvas from jsdelivr and writes a PNG data URL into `_wfFbScreenshot`. The overlay is hidden during capture. Paste and drag-to-upload also write into the same slot.

## Reference worker

`examples/cloudflare-worker/` ships a ready-to-deploy Worker that:

- Creates a GitHub issue in `env.GITHUB_REPO` using the `GITHUB_TOKEN` secret
- Labels issues `feedback:<type>` and (when `node_id` is present) also `node:<id>`
- Uploads `screenshot_base64` to any bound R2 bucket (duck-typed — binding name is arbitrary)
- Embeds the screenshot URL in the issue body
- Exposes `GET /api/nodes/counts` — returns `{ "<node-id>": <count>, ... }` for badge counts on canvas nodes; 5-min server cache
- Exposes `POST /api/card-sort` — stores card-sort study results as `card-sort:<study_id>`-labeled issues
- Passes all non-`/api/*` requests through to the `ASSETS` binding

## Triage tool

`examples/feedback-triage/` is a standalone review interface that uses the File System Access API to connect to a directory of feedback JSON files (one per item, organized into `feedback/` and `resolved/` subfolders per page). Toggling a card's status moves the file between subfolders. Useful when feedback is stored locally rather than pushed to GitHub Issues — for issues, use the GitHub UI's label filter instead.

## Rules

- `feedbackEndpoint` is opt-in; leaving it blank preserves existing mailto behavior
- Keep `emailRecipient` set even when using an endpoint — it's the fallback when the endpoint fails
- Descriptions over 5 000 characters should be rejected server-side (the reference worker does)
- Screenshots over 5 MB should be rejected, not silently truncated
