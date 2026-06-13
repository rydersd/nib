# Feedback Triage — Nib Example

A standalone triage tool for review-mode feedback collected on Nib wireframe pages. Lifted from the eqPartners feedback-review tool and de-branded.

## Run

```sh
python3 -m http.server 8000
# then open http://localhost:8000/examples/feedback-triage/index.html
```

The tool uses the **File System Access API** (Chromium-based browsers) to connect to a folder of feedback JSON files. The folder layout it expects:

```
project-feedback/
├── home/
│   ├── feedback/
│   │   ├── 2026-04-12-asd9f.json   ← Open
│   │   └── 2026-04-13-bn3kf.json
│   └── resolved/
│       └── 2026-04-10-xx0ab.json   ← Resolved
├── dashboard/
│   ├── feedback/
│   └── resolved/
└── …
```

Each JSON file is one feedback item:

```json
{
  "id": "2026-04-12-asd9f",
  "type": "issue",
  "desc": "The KPI tile cuts off long labels.",
  "createdAt": "2026-04-12T16:23:11Z",
  "screenshot": "data:image/png;base64,…"
}
```

When you check the box on a card, the file moves between `feedback/` ↔ `resolved/`.

## Pairs with the Cloudflare Worker

The same feedback panel that submits to the Worker (`examples/cloudflare-worker/`) can also be configured to write JSON files locally — point the panel at a local directory instead of (or in addition to) the Worker endpoint, and use this triage tool to review.

For GitHub-issue-backed feedback, browse the issues in the project repo directly — the worker labels them `feedback:<type>` and (optionally) `node:<id>`, so filtering by label gives the equivalent triage view.
