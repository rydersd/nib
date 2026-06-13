#!/usr/bin/env node
/**
 * create-nib — thin wrapper that delegates to the nib package's nib-create
 * script. This package only exists so `npm create nib <name>` resolves.
 *
 * The actual scaffolder lives in nib/tools/nib-create.js. We resolve it via
 * Node's normal module resolution, so wherever nib is installed (peer of this
 * package in npx's temp install) the script runs against that copy of the
 * framework — meaning examples/, core/, etc. all reference the published nib
 * version this wrapper depends on.
 */

'use strict';

try {
  // Resolving by package path uses nib's own module resolution.
  require('nib/tools/nib-create.js');
} catch (err) {
  const msg = err && err.message ? err.message : String(err);
  if (/Cannot find module/.test(msg)) {
    console.error(
      'create-nib: could not resolve the nib package. ' +
      'If you are running this from a checkout, run `npm install` in packages/create-nib first.'
    );
  } else {
    console.error('create-nib: ' + msg);
  }
  process.exit(1);
}
