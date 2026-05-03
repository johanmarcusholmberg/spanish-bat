/**
 * Mobile-side KvStorage adapter — binds the shared learning-coach services
 * to React Native's AsyncStorage. Errors are swallowed so callers can stay
 * on the happy path and the JSON envelopes round-trip safely.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { KvStorage } from "@workspace/learning-coach";

export const asyncStorageKv: KvStorage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      /* best effort */
    }
  },
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* best effort */
    }
  },
};
