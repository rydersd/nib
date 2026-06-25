export const meta = {
  name: 'figma-inventory',
  description: 'Inventory a Figma design system (tokens, components, patterns) via ClaudeToFigma and assemble a round-trip-ready Nib pack artifact',
  whenToUse: 'Run after joining a ClaudeToFigma channel to extract a reusable design-system pack WITH real component publish keys. Pass args:{channel} or args:"<channel>".',
  phases: [
    { title: 'Recon', detail: 'document info, styles, page list' },
    { title: 'Digest', detail: 'variables (tokens) + COMPONENT_SET enumeration (keys + grammars) in parallel' },
    { title: 'Synthesize', detail: 'assemble design-system.json + wfMap + round-trip figma-map (real keys)' },
  ],
}

// Robust arg parsing: args may be an object, a JSON string, or the bare channel string.
let _a = args
if (typeof _a === 'string') { try { _a = JSON.parse(_a) } catch (e) { _a = { channel: _a } } }
const channel = (_a && _a.channel) || ''
if (!channel) log('No channel id in args — assuming a ClaudeToFigma channel is already joined this session.')

// Every agent first loads the MCP tools it needs and (best-effort) joins the channel.
const JOIN =
  'First call ToolSearch query "select:mcp__ClaudeToFigma__join_channel,mcp__ClaudeToFigma__get_document_info,' +
  'mcp__ClaudeToFigma__get_styles,mcp__ClaudeToFigma__get_local_variables,mcp__ClaudeToFigma__figma_eval" to load tools.' +
  (channel ? ' Then call mcp__ClaudeToFigma__join_channel({channel:"' + channel + '"}).' :
             ' A channel is already joined this session — call get_document_info directly to confirm access.')

const SLICE =
  'If a result exceeds the token limit it is saved to a tool-result .txt file whose PATH is in the error. Do NOT read it inline. ' +
  'Slice it via python in ~80,000-char spans (python3 -c "print(open(PATH).read()[A:B])") until 100% read, then return ONLY the structured summary.'

const RECON_SCHEMA = {
  type: 'object', additionalProperties: true,
  required: ['styles'],
  properties: {
    document: { type: 'object', additionalProperties: true },
    styles: { type: 'object', additionalProperties: true, description: 'count+names of text/effect/grid styles + font families' },
    pages: { type: 'array', items: { type: 'object', additionalProperties: true } },
    notes: { type: 'string' },
  },
}

const TOKENS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['collections', 'primitives', 'semantics', 'numbers', 'wfMap'],
  properties: {
    collections: { type: 'array', items: { type: 'object', additionalProperties: true } },
    primitives: { type: 'object', additionalProperties: true },
    semantics: { type: 'object', additionalProperties: true },
    numbers: { type: 'object', additionalProperties: true },
    wfMap: { type: 'object', additionalProperties: true },
    caveats: { type: 'array', items: { type: 'string' } },
  },
}

// Keyed component map — the part that makes round-trip possible.
const SETS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['total', 'sets'],
  properties: {
    total: { type: 'number', description: 'total COMPONENT_SET count seen' },
    publicCount: { type: 'number' },
    sets: {
      type: 'object', additionalProperties: true,
      description: 'setName -> { key:"<40-hex publish key>", class, variants:{prop:[values]} }',
    },
    notes: { type: 'string' },
  },
}

// ── Phase 1: Recon ──────────────────────────────────────────────────────
phase('Recon')
const recon = await agent(
  JOIN + '\n\nThen call get_document_info and get_styles. Return a recon summary: the page tree, a COUNT-and-NAMES ' +
  'summary of text/effect/grid styles, the font families, and the page list. Colors live in Variables not styles — note that. ' +
  'Summarize; never paste raw style objects wholesale.',
  { label: 'recon', phase: 'Recon', schema: RECON_SCHEMA }
)

// ── Phase 2: Digest — tokens + KEYED component sets, in parallel ─────────
phase('Digest')
const [tokens, sets] = await parallel([
  () => agent(
    JOIN + '\n\nThen call get_local_variables. ' + SLICE + '\n\n' +
    'Inventory every COLLECTION (name + mode count); per collection the token families with counts and resolved hex; ' +
    'resolve aliases TRANSITIVELY to final hex (flag external-library hops); capture non-color number tokens ' +
    '(radius/spacing/stroke); and propose a wfMap (--wf-ink/text/muted/line/tint/surface/canvas/accent/red/amber/green/purple) ' +
    'from the best-fit semantic tokens, listing caveats.',
    { label: 'digest:variables', phase: 'Digest', schema: TOKENS_SCHEMA }
  ),
  () => agent(
    JOIN + '\n\nThen capture component sets WITH their real publish keys by running mcp__ClaudeToFigma__figma_eval with this code body:\n' +
    '```js\n' +
    'await figma.loadAllPagesAsync();\n' +
    "const sets = figma.root.findAllWithCriteria({types:['COMPONENT_SET']}).filter(s => !/^[._\\[]/.test(s.name));\n" +
    'return sets.map(s => ({ name: s.name, key: s.key, props: Object.fromEntries(Object.entries(s.variantGroupProperties||{}).map(([k,v]) => [k, v.values])) }));\n' +
    '```\n' +
    'This returns the PUBLIC component sets (private `_`/`.`/`[Template]` filtered out), each with its 40-char publish `key` and full ' +
    'variant grammar {prop: [values]}. ' + SLICE + '\n\n' +
    'Build a map setName -> { key, class (atom/molecule/organism/icon by naming + complexity), variants }. Keep the real keys verbatim. ' +
    'If the eval still overflows, slice the saved file and extract name/key/props. Return every public set you can (prioritize core UI ' +
    'families: buttons, badges, tags, inputs, selects, checkboxes/radios/toggles, table/datatable cells, tabs, tooltips, avatars, nav, charts).',
    { label: 'digest:component-keys', phase: 'Digest', schema: SETS_SCHEMA }
  ),
])

// ── Phase 3: Synthesize — assemble a round-trip-ready pack ───────────────
phase('Synthesize')
const PACK_SCHEMA = {
  type: 'object', additionalProperties: true,
  required: ['designSystem', 'figmaMap', 'theme'],
  properties: {
    designSystem: { type: 'object', additionalProperties: true },
    figmaMap: { type: 'object', additionalProperties: true },
    theme: { type: 'object', additionalProperties: true },
    gaps: { type: 'array', items: { type: 'string' } },
  },
}

const pack = await agent(
  'Assemble a round-trip-ready Nib design-system pack from the inventory below. Match the shapes in packs/sample/ exactly. ' +
  'CRITICAL: use the REAL 40-char publish keys from the component-set map for every component’s `key` (never null when a key exists).\n\n' +
  'RECON:\n' + JSON.stringify(recon) + '\n\nTOKENS:\n' + JSON.stringify(tokens) + '\n\nCOMPONENT-SETS (name->{key,props}):\n' + JSON.stringify(sets) + '\n\n' +
  'Produce: (1) designSystem (meta/tokens{primitives,semantics,numbers,wfMap}/components{name:{key,class,variants}}/patterns/styles/conventions); ' +
  '(2) theme {label, font, fontUrl?, tokens:{--wf-*}} from wfMap; ' +
  '(3) figmaMap {variables ($var:Collection/Name), components{name:{key,props:<sensible default variant>}}, ' +
  'recreationRules (table->the datatable/list cell component as default + grill list; button->grill Type/Size/solid-vs-outline; badge-vs-tag), overrides:{}}. ' +
  'List gaps only for things genuinely missing (e.g. sets not enumerated, licensed fonts). Component keys should NOT be a gap — they come from the set map.',
  { label: 'synthesize', phase: 'Synthesize', schema: PACK_SCHEMA }
)

return {
  channel: channel || '(pre-joined)',
  recon,
  pack,
  note: 'Emit pack.designSystem/theme/figmaMap into the pack repo (private for proprietary systems) via tools/figma-inventory/emit.js. Component keys are real publish keys — create_component_instance round-trips work.',
}
