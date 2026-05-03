/**
 * Shared learning-data cache. Stale-aware reads and TTL-bound envelopes
 * for today's session, weak items, level and lightweight progress. Storage
 * is supplied by the host (AsyncStorage on mobile, localStorage on web).
 */
import type { KvStorage } from "./kvStorage";

const TODAY_SESSION_KEY = "murci.cache.todaySession.v1";
const WEAK_ITEMS_KEY = "murci.cache.weakItems.v1";
const LEVEL_KEY = "murci.cache.level.v1";
const PROGRESS_SUMMARY_KEY = "murci.cache.progressSummary.v1";
const FALLBACK_SESSION_KEY = "murci.cache.fallbackSession.v1";

const TODAY_TTL_MS = 6 * 60 * 60 * 1000;
const WEAK_TTL_MS = 24 * 60 * 60 * 1000;
const PROGRESS_TTL_MS = 24 * 60 * 60 * 1000;

interface Envelope<T> {
  cachedAt: number;
  data: T;
}

export interface CachedReadResult<T> {
  data: T | null;
  cachedAt: number | null;
  stale: boolean;
}

export interface CachedTodaySession {
  mode: string;
  itemIds: string[];
  itemsPayload?: unknown[];
  level: string;
}

export interface CachedWeakItem {
  itemId: string;
  skill?: string;
  subskill?: string;
  level?: string;
  weight: number;
}

export interface CachedProgressSummary {
  totalCorrect: number;
  totalAttempts: number;
  streakDays: number;
  byCategory?: { category: string; completed: number; total: number }[];
}

export interface FallbackSession {
  itemIds: string[];
  itemsPayload?: unknown[];
  capturedAt: number;
}

export interface LearningCacheService {
  getCachedTodaySession(): Promise<CachedReadResult<CachedTodaySession>>;
  cacheTodaySession(session: CachedTodaySession): Promise<void>;
  getCachedWeakItems(): Promise<CachedReadResult<CachedWeakItem[]>>;
  cacheWeakItems(items: CachedWeakItem[]): Promise<void>;
  getCachedLevel(): Promise<string | null>;
  cacheLevel(level: string): Promise<void>;
  getCachedProgressSummary(): Promise<CachedReadResult<CachedProgressSummary>>;
  cacheProgressSummary(summary: CachedProgressSummary): Promise<void>;
  getOfflineFallbackSession(): Promise<FallbackSession | null>;
  setOfflineFallbackSession(session: FallbackSession): Promise<void>;
}

export function createLearningCacheService(kv: KvStorage): LearningCacheService {
  async function readEnvelope<T>(key: string): Promise<Envelope<T> | null> {
    try {
      const raw = await kv.getItem(key);
      if (!raw) return null;
      const env = JSON.parse(raw) as Envelope<T>;
      if (!env || typeof env.cachedAt !== "number") return null;
      return env;
    } catch {
      return null;
    }
  }

  async function writeEnvelope<T>(key: string, data: T): Promise<void> {
    try {
      const env: Envelope<T> = { cachedAt: Date.now(), data };
      await kv.setItem(key, JSON.stringify(env));
    } catch {
      /* best effort */
    }
  }

  function isFresh<T>(env: Envelope<T> | null, ttlMs: number): boolean {
    return !!env && Date.now() - env.cachedAt <= ttlMs;
  }

  function unwrap<T>(env: Envelope<T> | null, ttlMs: number): CachedReadResult<T> {
    if (!env) return { data: null, cachedAt: null, stale: true };
    return {
      data: env.data,
      cachedAt: env.cachedAt,
      stale: !isFresh(env, ttlMs),
    };
  }

  return {
    async getCachedTodaySession() {
      return unwrap(
        await readEnvelope<CachedTodaySession>(TODAY_SESSION_KEY),
        TODAY_TTL_MS,
      );
    },
    async cacheTodaySession(session) {
      await writeEnvelope(TODAY_SESSION_KEY, session);
    },
    async getCachedWeakItems() {
      return unwrap(await readEnvelope<CachedWeakItem[]>(WEAK_ITEMS_KEY), WEAK_TTL_MS);
    },
    async cacheWeakItems(items) {
      await writeEnvelope(WEAK_ITEMS_KEY, items);
    },
    async getCachedLevel() {
      const env = await readEnvelope<string>(LEVEL_KEY);
      return env?.data ?? null;
    },
    async cacheLevel(level) {
      await writeEnvelope(LEVEL_KEY, level);
    },
    async getCachedProgressSummary() {
      return unwrap(
        await readEnvelope<CachedProgressSummary>(PROGRESS_SUMMARY_KEY),
        PROGRESS_TTL_MS,
      );
    },
    async cacheProgressSummary(summary) {
      await writeEnvelope(PROGRESS_SUMMARY_KEY, summary);
    },
    async getOfflineFallbackSession() {
      const env = await readEnvelope<FallbackSession>(FALLBACK_SESSION_KEY);
      return env?.data ?? null;
    },
    async setOfflineFallbackSession(session) {
      await writeEnvelope(FALLBACK_SESSION_KEY, session);
    },
  };
}
