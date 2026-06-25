/* ========================================================================
   Sample Pack — theme registration (packs/sample/theme.js)

   Registers this pack on window.NIB_PACKS so core/packs/loader.js can pick
   it up when WIREFRAME_CONFIG.pack === 'sample'. Load this BEFORE
   core/packs/loader.js (and ideally before proto-nav.js so it's the default).

   The token values here are a deliberately distinct demo palette (teal/indigo)
   so you can SEE the pack apply. A real pack's theme.js is emitted by the
   Figma-inventory pipeline; do not hand-author production token values here.
   ======================================================================== */
window.NIB_PACKS = window.NIB_PACKS || {};
window.NIB_PACKS['sample'] = {
  id: 'sample',
  label: 'Sample DS',
  nibContract: '1.0',
  theme: {
    label: 'Sample DS',
    font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    tokens: {
      '--wf-ink':     '#0f2e2a',
      '--wf-text':    '#2c4a46',
      '--wf-muted':   '#5b736f',
      '--wf-line':    '#bcd2cd',
      '--wf-tint':    '#dcebe8',
      '--wf-surface': '#eef6f4',
      '--wf-canvas':  '#f4faf8',
      '--wf-accent':  '#0d8a7a',
      '--wf-red':     '#b3424f',
      '--wf-amber':   '#8a6a1f',
      '--wf-green':   '#2f7a55',
      '--wf-purple':  '#5a4d9c',
      '--wf-radius':  '6px'
    }
  },
  // Optional: the draw skill lazy-loads this for round-trip generation.
  figmaMapUrl: 'figma-map.json'
};
