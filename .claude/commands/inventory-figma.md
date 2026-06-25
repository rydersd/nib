---
name: inventory-figma
description: Inventory a Figma design system (tokens, components, patterns) via ClaudeToFigma and emit a reusable Nib pack
user_invocable: true
---

# Figma Inventory → Design-System Pack

You are inventorying a real Figma design system over the **ClaudeToFigma** MCP
(live plugin) and emitting a reusable Nib **pack** (see `docs/Design-System-Packs.md`).
The output is `design-system.json` + `tokens.css` + `theme.js` + `figma-map.json`.

This is the read/extract half. The **draw** half (recreating HTML/Claude designs
into Figma using real component instances) consumes `figma-map.json` and is governed
by the recreation contract in §"Draw contract" below.

## Arguments

`$ARGUMENTS` = the ClaudeToFigma channel id (e.g. `nqz5w9xk`). If omitted, ask for it.

## Hard constraints (learned from real runs — do not skip)

1. **Outputs overflow context.** `get_local_variables` and `get_local_components`
   are tens-to-hundreds of KB for a SINGLE page. They auto-save to a tool-result
   file. **NEVER inline them.** Always digest in a subagent that slices the file
   by character range (`python3 -c "print(open(PATH).read()[A:B])"`) and returns a
   structured summary only.
2. **Colors live in Variables, not styles.** `get_styles` returns `colors: []` on
   modern files — text/effect/grid styles only. Extract color/number tokens from
   `get_local_variables`.
3. **Resolve aliases transitively.** Tokens are two-tier: a semantic layer
   (`action/primary/fill`) aliases a primitive (`neutral/900`) which resolves to
   hex. Store both the alias path AND the resolved value. Flag external-library hops.
4. **Reconstruct sets from leaves.** `get_local_components` returns leaf variant
   nodes only (names like `Type=Primary, Size=Medium`). Rebuild each component
   set's variant grammar from name signatures + adjacency.
5. **Naming encodes structure.** `.`=private, `_`=sub-part, `❖`=swap slot,
   `[Template]`=composed assembly, `/`=hierarchy. Use it to classify
   atom / molecule / organism / private / icon.

## Procedure

Prefer the **workflow** for anything beyond a single small page — it fans the heavy
digests out into subagents so the big payloads never touch the main context:

```
Workflow({ name: "figma-inventory", args: { channel: "<id>" } })
```

Manual procedure (and what the workflow encodes):

1. **Connect** — `mcp__ClaudeToFigma__join_channel({channel})`.
2. **Recon (cheap, inline)** — `get_document_info`, `get_styles`, `get_selection`.
   Note pages, the text/effect/grid styles, and font families.
3. **Heavy pulls → offload** — call `get_local_variables` and `get_local_components`.
   They overflow and save to files. Capture the file paths; do not read them inline.
4. **Digest in subagents** — one per big file. Each slices the file in ~80k-char
   spans until 100% read, then returns a structured inventory (collections, token
   families w/ resolved values, component families w/ variant grammars). Give the
   subagent the verbatim slicing instruction and be explicit about the return shape.
5. **Per-frame styles (optional)** — `scan_node_styles({nodeId})` per component page;
   its `boundVariable` flag flags hardcoded-vs-token fills for a linting pass.
6. **Resolve & classify** — resolve aliases to hex; classify components by naming.
7. **Map to Nib** — produce `wfMap` (`--wf-*` ← semantic tokens). Encode caveats
   (e.g. amber may map to *yellow* not orange; `--wf-purple`'s "AI" semantic rarely
   exists in source — adopt hex, not meaning; prefer the cool neutral ramp).
8. **Emit the pack** — write `design-system.json`, `tokens.css`, `theme.js`,
   `figma-map.json` matching `packs/sample/`'s shape. For a proprietary system,
   emit into the PRIVATE pack repo (e.g. `nib-eqds`), never into public Nib.

## Output schema

Match `packs/sample/design-system.json` exactly (`meta`, `tokens{primitives,
semantics,numbers,wfMap}`, `components{key,id,class,variants,variantCount}`,
`patterns`, `styles`, `conventions`). `figma-map.json` matches `packs/sample/figma-map.json`
(`variables` $var names, `components{key,props}`, `recreationRules`, `overrides`).

## Draw contract (acceptance criteria for the recreation half)

When recreating an HTML page or Claude design INTO Figma:

- **AC-1 — Reuse real components.** Map each region to its `figma-map.json` entry
  and `create_component_instance(key, variantProps)`. Raw shapes only when nothing
  matches — and log the gap.
- **AC-2 — Default to component primitives, but grill.** For composed structures,
  proactively ASK which component/variant rather than choosing silently. A **table
  → use the cell components**; default to cells if the user defers, but surface the
  decisions (content type per column, density, header style, selection affordance).
- **AC-3 — Ambiguity → ask, don't guess.** Any region with >1 plausible mapping
  prompts a concise decision, and the choice is written back to `figma-map.json`
  `overrides` so repeat draws are deterministic.
