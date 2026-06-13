/**
 * Snapshot-based undo/redo history for canvas state.
 *
 * Every operation pushes the *previous* flow onto the past stack and clears
 * the future. undo() pops past → present (and the current present goes on
 * future); redo() does the inverse.
 *
 * Snapshots are JSON-clones to keep undo/redo isolated from later mutations.
 */

export function createHistory(initial, opts = {}) {
  const limit = opts.limit || 50;
  let past = [];
  let present = clone(initial);
  let future = [];

  return {
    get() { return present; },
    canUndo() { return past.length > 0; },
    canRedo() { return future.length > 0; },

    set(next) {
      past.push(present);
      if (past.length > limit) past.shift();
      present = clone(next);
      future = [];
    },

    /**
     * Replace the present without pushing onto the past stack.
     * Use for non-undoable updates (e.g. external sync pulls).
     */
    replace(next) {
      present = clone(next);
    },

    undo() {
      if (!past.length) return present;
      future.push(present);
      present = past.pop();
      return present;
    },

    redo() {
      if (!future.length) return present;
      past.push(present);
      present = future.pop();
      return present;
    },

    reset(next) {
      past = [];
      future = [];
      present = clone(next);
      return present;
    },
  };
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}
