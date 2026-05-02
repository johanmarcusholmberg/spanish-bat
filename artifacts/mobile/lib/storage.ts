import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "murcielago_auth_token";
const PROFILE_KEY = "murcielago_profile";

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn("[storage] getToken failed:", e);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn("[storage] setToken failed:", e);
    }
  },

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn("[storage] clearToken failed:", e);
    }
  },

  async getProfile(): Promise<Record<string, unknown> | null> {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("[storage] getProfile failed:", e);
      return null;
    }
  },

  async setProfile(profile: Record<string, unknown>): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn("[storage] setProfile failed:", e);
    }
  },

  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
    } catch (e) {
      console.warn("[storage] clearProfile failed:", e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, PROFILE_KEY]);
    } catch (e) {
      console.warn("[storage] clearAll failed:", e);
    }
  },
};

export const clerkTokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn("[clerkTokenCache] getToken failed:", e);
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("[clerkTokenCache] saveToken failed:", e);
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn("[clerkTokenCache] clearToken failed:", e);
    }
  },
};
