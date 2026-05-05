/**
 * Web wrapper around `@workspace/learning-coach`'s mistake memory. The
 * shared module is storage-agnostic; here we bind it to the browser's
 * `localStorage` and re-export thin sync-feeling helpers so existing
 * web call-sites can keep their original signature `loadMistakes(userId)`.
 */
import {
  loadMistakes as sharedLoad,
  recordMistake as sharedRecord,
  clearMistakes as sharedClear,
  localStorageAdapter,
  type MistakeEvent,
  type MistakeStore,
} from "@workspace/learning-coach";

export * from "@workspace/learning-coach";

const storage = localStorageAdapter();

export function loadMistakes(
  userId: string | null | undefined,
): Promise<MistakeStore> {
  return sharedLoad(storage, userId);
}

export function recordMistake(
  userId: string | null | undefined,
  event: MistakeEvent,
): Promise<MistakeStore> {
  return sharedRecord(storage, userId, event);
}

export function clearMistakes(
  userId: string | null | undefined,
): Promise<void> {
  return Promise.resolve(sharedClear(storage, userId));
}
