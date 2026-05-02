import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MistakeStorage } from "@workspace/learning-coach";

/**
 * AsyncStorage-backed adapter for the shared mistakeMemory store. The
 * shared package writes JSON-encoded strings; AsyncStorage handles them
 * natively, so this is just a thin pass-through.
 */
export const asyncStorageAdapter: MistakeStorage = {
  getItem: (k) => AsyncStorage.getItem(k),
  setItem: (k, v) => AsyncStorage.setItem(k, v),
  removeItem: (k) => AsyncStorage.removeItem(k),
};
