/**
 * KvStorage
 * ---------
 * Tiny string KV adapter used by the shared learning-coach services so the
 * same code paths run against `localStorage` on web and `AsyncStorage` on
 * React Native. All methods may be sync or async — callers always `await`.
 */
export interface KvStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

/** Browser-side adapter. Safe to call from non-DOM environments — it returns
 *  a no-op store when `localStorage` is unavailable so tests / SSR don't blow
 *  up. */
export function localStorageKv(): KvStorage {
  const ls: Storage | null =
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
      ? window.localStorage
      : null;
  if (!ls) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return {
    getItem: (k) => {
      try {
        return ls.getItem(k);
      } catch {
        return null;
      }
    },
    setItem: (k, v) => {
      try {
        ls.setItem(k, v);
      } catch {
        /* best effort */
      }
    },
    removeItem: (k) => {
      try {
        ls.removeItem(k);
      } catch {
        /* best effort */
      }
    },
  };
}
