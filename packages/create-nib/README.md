# create-nib

Scaffold a new [Nib](https://github.com/rybooth-eq/nib) wireframe prototyping project.

```sh
npm create nib lead-to-cash
# or
npx create-nib lead-to-cash
```

Opens a browser-based setup wizard that asks how you want to start:

- **📊 Upload a workbook** — Excel / Google Sheets becomes pages, personas, blueprints, tokens, stories.
- **🎨 Pick a template** — clone a working scaffold from `examples/` (service blueprint, feedback triage, research study, …).
- **✨ Start blank** — minimal one-page scaffold.

The same server then serves your new project so you can keep clicking. `Ctrl-C` to stop.

## Headless options

```sh
npx create-nib partner-program --workbook ./brief.xlsx
npx create-nib q3-research --template research-study
npx create-nib service-design --sheet 'https://docs.google.com/spreadsheets/d/...'
```

## Why this package exists

`npm create x` resolves to `npx create-x`, which requires a literal `create-nib` package on the registry. This package is a thin wrapper — its only job is to load and run the actual scaffolder from the `nib` framework package. All the logic lives in `nib/tools/nib-create.js`.

## Documentation

- [Quickstart](https://github.com/rybooth-eq/nib/blob/main/docs/Create-Project.md)
- [Workbook authoring](https://github.com/rybooth-eq/nib/blob/main/docs/Spreadsheet-Authoring.md)
- [Project templates](https://github.com/rybooth-eq/nib/blob/main/docs/Templates.md)

## License

MIT
