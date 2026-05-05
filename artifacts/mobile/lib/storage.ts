import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "murcielingo_auth_token";
const PROFILE_KEY = "murcielingo_profile";
const RECENT_LESSONS_KEY = "murcielingo_recent_lessons";
const DASHBOARD_CACHE_KEY = "murcielingo_dashboard_cache";
const EXERCISE_DRAFT_PREFIX = "murcielingo_exercise_draft:";

const RECENT_LESSONS_MAX = 10;
const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

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

/**
 * Clear every per-user key (auth, profile, recent lessons, dashboard cache,
 * and ALL exercise drafts). Call this on sign-out so a second user on the same
 * device cannot see the previous user's progress or recents.
 */
export async function clearAllUserData(): Promise<void> {
  try {
    const fixedKeys = [TOKEN_KEY, PROFILE_KEY, RECENT_LESSONS_KEY, DASHBOARD_CACHE_KEY];
    let draftKeys: readonly string[] = [];
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      draftKeys = allKeys.filter((k) => k.startsWith(EXERCISE_DRAFT_PREFIX));
    } catch (e) {
      console.warn("[clearAllUserData] getAllKeys failed:", e);
    }
    await AsyncStorage.multiRemove([...fixedKeys, ...draftKeys]);
  } catch (e) {
    console.warn("[clearAllUserData] failed:", e);
  }
}

export interface RecentLesson {
  type: "lesson" | "passage";
  id: string;
  title: string;
  level?: string;
  visitedAt: number;
}

export const recentLessons = {
  async get(): Promise<RecentLesson[]> {
    try {
      const raw = await AsyncStorage.getItem(RECENT_LESSONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as RecentLesson[]) : [];
    } catch (e) {
      console.warn("[recentLessons] get failed:", e);
      return [];
    }
  },

  async add(item: Omit<RecentLesson, "visitedAt">): Promise<void> {
    try {
      const existing = await recentLessons.get();
      const filtered = existing.filter((r) => !(r.type === item.type && r.id === item.id));
      const next: RecentLesson[] = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(
        0,
        RECENT_LESSONS_MAX
      );
      await AsyncStorage.setItem(RECENT_LESSONS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("[recentLessons] add failed:", e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_LESSONS_KEY);
    } catch (e) {
      console.warn("[recentLessons] clear failed:", e);
    }
  },
};

interface CacheEnvelope<T> {
  cachedAt: number;
  data: T;
}

export const dashboardCache = {
  async get<T = unknown>(): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!raw) return null;
      const env = JSON.parse(raw) as CacheEnvelope<T>;
      if (!env || typeof env.cachedAt !== "number") return null;
      if (Date.now() - env.cachedAt > DASHBOARD_CACHE_TTL_MS) return null;
      return env.data;
    } catch (e) {
      console.warn("[dashboardCache] get failed:", e);
      return null;
    }
  },

  async set<T = unknown>(data: T): Promise<void> {
    try {
      const env: CacheEnvelope<T> = { cachedAt: Date.now(), data };
      await AsyncStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(env));
    } catch (e) {
      console.warn("[dashboardCache] set failed:", e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DASHBOARD_CACHE_KEY);
    } catch (e) {
      console.warn("[dashboardCache] clear failed:", e);
    }
  },
};

export const exerciseDraft = {
  async get<T = unknown>(exerciseId: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(EXERCISE_DRAFT_PREFIX + exerciseId);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      console.warn("[exerciseDraft] get failed:", e);
      return null;
    }
  },

  async set<T = unknown>(exerciseId: string, draft: T): Promise<void> {
    try {
      await AsyncStorage.setItem(EXERCISE_DRAFT_PREFIX + exerciseId, JSON.stringify(draft));
    } catch (e) {
      console.warn("[exerciseDraft] set failed:", e);
    }
  },

  async clear(exerciseId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(EXERCISE_DRAFT_PREFIX + exerciseId);
    } catch (e) {
      console.warn("[exerciseDraft] clear failed:", e);
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
