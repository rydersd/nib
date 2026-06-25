export const meta = {
  name: 'figma-inventory',
  description: 'Inventory a Figma design system (tokens, components, patterns) via ClaudeToFigma and assemble a Nib pack artifact',
  whenToUse: 'Run after joining a ClaudeToFigma channel to extract a reusable design-system pack. Pass args:{channel}.',
  phases: [
    { title: 'Recon', detail: 'document info, styles, page list' },
    { title: 'Digest', detail: 'slice the overflowing variables + components payloads in parallel subagents' },
    { title: 'Synthesize', detail: 'assemble design-system.json + wfMap + figma-map' },
  ],
}

// args: { channel: "<id>" }
const channel = (args && args.channel) || ''
if (!channel) {
  log('No channel id provided (args.channel). Join a ClaudeToFigma channel and pass its id.')
}

const TOOLS_HINT =
  'First call ToolSearch with query "select:mcp__ClaudeToFigma__join_channel,mcp__ClaudeToFigma__get_document_info,' +
  'mcp__ClaudeToFigma__get_styles,mcp__ClaudeToFigma__get_local_variables,mcp__ClaudeToFigma__get_local_components" ' +
  'to load the tool schemas, then call mcp__ClaudeToFigma__join_channel({channel:"' + channel + '"}) before anything else.'

const RECON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['document', 'styles', 'pages'],
  properties: {
    document: { type: 'object', additionalProperties: true },
    styles: {
      type: 'object', additionalProperties: true,
      description: 'summary counts + names of text/effect/grid styles and the font families seen',
    },
    pages: { type: 'array', items: { type: 'object', additionalProperties: true } },
    notes: { type: 'string' },
  },
}

const TOKENS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['collections', 'primitives', 'semantics', 'numbers', 'wfMap'],
  properties: {
    collections: { type: 'array', items: { type: 'object', additionalProperties: true } },
    primitives: { type: 'object', additionalProperties: true, description: 'path -> {value,type}' },
    semantics: { type: 'object', additionalProperties: true, description: 'path -> {alias,value}' },
    numbers: { type: 'object', additionalProperties: true, description: 'radius/spacing/stroke groups' },
    wfMap: { type: 'object', additionalProperties: true, description: '--wf-* -> resolved hex, with caveats' },
    caveats: { type: 'array', items: { type: 'string' } },
  },
}

const COMPONENTS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['total', 'families', 'sets'],
  properties: {
    total: { type: 'number' },
    families: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'name prefix -> count + class' },
    sets: {
      type: 'object', additionalProperties: true,
      description: 'setName -> {key?, id?, class, variants:{prop:[values]}, variantCount}',
    },
    patterns: { type: 'array', items: { type: 'object', additionalProperties: true } },
    conventions: { type: 'object', additionalProperties: true },
  },
}

// ── Phase 1: Recon (cheap, inline-able) ─────────────────────────────────
phase('Recon')
const recon = await agent(
  TOOLS_HINT + '\n\nThen call get_document_info and get_styles. Return a recon summary: the document/page tree, ' +
  'a COUNT-and-NAMES summary of text/effect/grid styles (do NOT dump every field), the font families used, and ' +
  'the list of pages (each likely a component). Note that colors usually live in Variables, not styles. ' +
  'Keep the payload small — summarize, never paste raw style objects wholesale.',
  { label: 'recon', phase: 'Recon', schema: RECON_SCHEMA }
)

// ── Phase 2: Digest the two overflowing payloads, in parallel ───────────
// Each agent TRIGGERS the heavy pull (which auto-saves to a tool-result file
// on overflow), then slices that file by char-range and returns structure only.
phase('Digest')
const SLICE_INSTRUCTION =
  'The result will exceed the token limit and be saved to a tool-result .txt file; the error message gives its PATH. ' +
  'Do NOT read it inline. Slice it in ~80,000-char spans via python until you have read 100% of it: ' +
  'python3 -c "print(open(PATH).read()[A:B])". Then return ONLY the structured summary below.'

const [tokens, components] = await parallel([
  () => agent(
    TOOLS_HINT + '\n\nThen call get_local_variables. ' + SLICE_INSTRUCTION + '\n\n' +
    'Inventory: every COLLECTION (name + mode count); per collection the token families with counts and ' +
    'representative names + resolved hex; resolve aliases TRANSITIVELY to final hex (flag external-library hops); ' +
    'the naming convention; and a wfMap proposing --wf-ink/text/muted/line/tint/surface/canvas/accent/red/amber/green/purple ' +
    'from the best-fit semantic tokens, listing caveats (e.g. amber->yellow not orange; --wf-purple AI-meaning absent; ' +
    'prefer the cool neutral ramp). Also capture non-color number tokens (radius/spacing/stroke).',
    { label: 'digest:variables', phase: 'Digest', schema: TOKENS_SCHEMA }
  ),
  () => agent(
    TOOLS_HINT + '\n\nThen call get_local_components. ' + SLICE_INSTRUCTION + '\n\n' +
    'Inventory: total count; component FAMILIES by name prefix with counts; reconstruct component SETS from leaf ' +
    'variant names (signatures like "Type=Primary, Size=Medium") into {variants:{prop:[values]}, variantCount}; ' +
    'classify each as atom/molecule/organism/private/icon using naming (.=private, _=subpart, ❖=swap, [Template]=composed, /=hierarchy); ' +
    'identify composed PATTERNS (datatable system, overlays, flows). Quote real names.',
    { label: 'digest:components', phase: 'Digest', schema: COMPONENTS_SCHEMA }
  ),
])

// ── Phase 3: Synthesize the pack artifact ───────────────────────────────
phase('Synthesize')
const PACK_SCHEMA = {
  type: 'object',
  additionalProperties: true,
  required: ['designSystem', 'figmaMap', 'theme'],
  properties: {
    designSystem: { type: 'object', additionalProperties: true, description: 'matches packs/sample/design-system.json' },
    figmaMap: { type: 'object', additionalProperties: true, description: 'matches packs/sample/figma-map.json' },
    theme: { type: 'object', additionalProperties: true, description: 'NIB_PACKS[id].theme: {label,font,fontUrl?,tokens}' },
    gaps: { type: 'array', items: { type: 'string' }, description: 'anything unresolved: external aliases, missing keys, ambiguous mappings' },
  },
}

const pack = await agent(
  'Assemble a Nib design-system pack from the inventory below. Match the shapes in packs/sample/ exactly.\n\n' +
  'RECON:\n' + JSON.stringify(recon) + '\n\nTOKENS:\n' + JSON.stringify(tokens) + '\n\nCOMPONENTS:\n' + JSON.stringify(components) + '\n\n' +
  'Produce: (1) designSystem (meta/tokens{primitives,semantics,numbers,wfMap}/components/patterns/styles/conventions); ' +
  '(2) theme {label, font, fontUrl?, tokens:{--wf-*}} from wfMap; ' +
  '(3) figmaMap {variables ($var:Collection/Name), components{name:{key,props}}, recreationRules (table->cell default + grill list, button->grill Type/Size), overrides:{}}. ' +
  'List gaps (external aliases, missing publish keys, ambiguous component mappings to grill the user on later).',
  { label: 'synthesize', phase: 'Synthesize', schema: PACK_SCHEMA }
)

return {
  channel,
  recon,
  pack,
  note: 'Emit pack.designSystem/theme/figmaMap into the pack repo (private for proprietary systems). See docs/Design-System-Packs.md.',
}
