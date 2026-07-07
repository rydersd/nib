/**
 * Shared CLI glue for the Node CLIs under tools/.
 *
 * Previously copy-pasted into each CLI (nib-cli, nib-ingest, nib-sync,
 * nib-wiki, nib-create). `C` is the superset of the per-CLI copies —
 * `white` was only present in nib-cli.js.
 */

// ANSI colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/** Print a red-✗ error to stderr and exit 1. */
function fail(msg) {
  console.error(`${C.red}✗${C.reset} ${msg}`);
  process.exit(1);
}

module.exports = { C, fail };
