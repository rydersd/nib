/**
 * Pluggable persistence for canvas state.
 *
 * Default: localStorageAdapter — keys per project + flow id, debounced
 * writes. Drop-in replacements can target Firestore, S3, or a Worker
 * endpoint by implementing { load, save } returning Promises.
 */

export function localStorageAdapter(namespace = 'nib-bp') {
  const key = (flowId) => `${namespace}::${flowId}`;
  return {
    async load(flowId) {
      try {
        const raw = localStorage.getItem(key(flowId));
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    },
    async save(flowId, flow) {
      try {
        localStorage.setItem(key(flowId), JSON.stringify(flow));
      } catch (e) {
        console.warn('SyncAdapter: localStorage save failed:', e.message);
      }
    },
    async clear(flowId) {
      localStorage.removeItem(key(flowId));
    },
  };
}

export function debounced(adapter, waitMs = 400) {
  const timers = new Map();
  return {
    load: adapter.load.bind(adapter),
    clear: adapter.clear ? adapter.clear.bind(adapter) : null,
    save(flowId, flow) {
      clearTimeout(timers.get(flowId));
      const t = setTimeout(() => {
        timers.delete(flowId);
        adapter.save(flowId, flow);
      }, waitMs);
      timers.set(flowId, t);
    },
    flush() {
      for (const [, t] of timers) clearTimeout(t);
      timers.clear();
    },
  };
}

/**
 * No-op adapter — useful in tests or when the canvas should never persist.
 */
export const noopAdapter = {
  async load() { return null; },
  async save() {},
  async clear() {},
};
