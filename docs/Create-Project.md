**Tags:** `bootstrap` · `cli`

# Creating a Project

The fastest path to a working Nib project: one command, browser wizard, three paths.

```sh
npx create-nib lead-to-cash
```

> **Agent reference:** [`ref/create-project.md`](../ref/create-project.md) for flags, headless modes, and the publishing path.

## What happens

1. CLI creates `./lead-to-cash/`.
2. Spawns a local HTTP server (port 5173 by default).
3. Opens your browser to a setup wizard.
4. You pick **upload a workbook**, **a template**, or **start blank**.
5. The server scaffolds the project and redirects you into it.
6. Same server keeps serving so you can keep clicking. `Ctrl-C` to stop.

## Three paths

| Path | When | What lands |
|---|---|---|
| 📊 **Workbook** | You already have an Excel / Google Sheets brief | The xlsx is saved into the project as the source of truth, `nib-ingest` runs, and `data/*.js` materializes |
| 🎨 **Template** | You want a working scaffold to clone | The contents of `examples/<id>/` copied into the project, with the title patched to match your project name |
| ✨ **Blank** | You'll author by hand | Minimal one-page scaffold |

The wizard auto-fills your project title from the kebab name — `lead-to-cash` becomes `Lead To Cash`.

## Headless

Skip the wizard for scripted workflows or CI:

```sh
npx create-nib partner-program --workbook ./pcp.xlsx
npx create-nib q3-research --template research-study
npx create-nib service-design --sheet https://docs.google.com/spreadsheets/d/...
```

## Why this and not a static template

Starting from a workbook needs server-side ingest. ES module imports for the [[Service-Blueprint]] canvas need an HTTP server (file:// won't load them). Both reasons together justify the embedded server — and once you have it, the wizard becomes a 3-card click-through.

## Related

- [[Spreadsheet-Authoring]] — the workbook the 📊 path consumes
- [[Templates]] — the catalog the 🎨 path picks from
- [[New-Project]] — the manual / hand-author bootstrap path (still supported)
