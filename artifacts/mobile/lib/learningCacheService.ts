/**
 * learningCacheService
 * --------------------
 * Foundational learning-data cache so a Murcielingo user can still review
 * their weak items and a "today" session even when the network is flaky.
 *
 * Design goals:
 *  - Pure data layer (no UI concerns). UI calls into this when going online or
 *    when starting a session.
 *  - Small surface: today session, weak items, level, lightweight progress.
 *  - Never overwrites authoritative server state — these caches are reads,
 *    not writes. Practice attempts continue to flow through the regular API
 *    so we don't silently drift from source-of-truth.
 *  - Stale-aware: callers can decide whether stale data is acceptable.
 *
 * On mobile, AsyncStorage is the backing store. The same JSON envelopes can
 * later be persisted on the web via localStorage with a tiny adapter swap.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const TODAY_SESSION_KEY = "murci.cache.todaySession.v1";
const WEAK_ITEMS_KEY = "murci.cache.weakItems.v1";
const LEVEL_KEY = "murci.cache.level.v1";
const PROGRESS_SUMMARY_KEY = "murci.cache.progressSummary.v1";
const FALLBACK_SESSION_KEY = "murci.cache.fallbackSession.v1";

const TODAY_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const WEAK_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const PROGRESS_TTL_MS = 24 * 60 * 60 * 1000;

interface Envelope<T> {
  cachedAt: number;
  data: T;
}

async function readEnvelope<T>(key: string): Promise<Envelope<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
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
    await AsyncStorage.setItem(key, JSON.stringify(env));
  } catch {
    /* best effort */
  }
}

function isFresh<T>(env: Envelope<T> | null, ttlMs: number): boolean {
  return !!env && Date.now() - env.cachedAt <= ttlMs;
}

export interface CachedReadResult<T> {
  data: T | null;
  cachedAt: number | null;
  stale: boolean;
}

function unwrap<T>(env: Envelope<T> | null, ttlMs: number): CachedReadResult<T> {
  if (!env) return { data: null, cachedAt: null, stale: true };
  return { data: env.data, cachedAt: env.cachedAt, stale: !isFresh(env, ttlMs) };
}

// --- Today session ------------------------------------------------------

export interface CachedTodaySession {
  /** Practice mode the session was built for. */
  mode: string;
  /** Stable item ids included in the session, in order. */
  itemIds: string[];
  /** Optional payload snapshot for fully-offline rendering. */
  itemsPayload?: unknown[];
  level: string;
}

export async function getCachedTodaySession(): Promise<CachedReadResult<CachedTodaySession>> {
  return unwrap(await readEnvelope<CachedTodaySession>(TODAY_SESSION_KEY), TODAY_TTL_MS);
}
export async function cacheTodaySession(session: CachedTodaySession): Promise<void> {
  await writeEnvelope(TODAY_SESSION_KEY, session);
}

// --- Weak items ---------------------------------------------------------

export interface CachedWeakItem {
  itemId: string;
  skill?: string;
  subskill?: string;
  level?: string;
  weight: number;
}

export async function getCachedWeakItems(): Promise<CachedReadResult<CachedWeakItem[]>> {
  return unwrap(await readEnvelope<CachedWeakItem[]>(WEAK_ITEMS_KEY), WEAK_TTL_MS);
}
export async function cacheWeakItems(items: CachedWeakItem[]): Promise<void> {
  await writeEnvelope(WEAK_ITEMS_KEY, items);
}

// --- Level & progress summary ------------------------------------------

export async function getCachedLevel(): Promise<string | null> {
  const env = await readEnvelope<string>(LEVEL_KEY);
  return env?.data ?? null;
}
export async function cacheLevel(level: string): Promise<void> {
  await writeEnvelope(LEVEL_KEY, level);
}

export interface CachedProgressSummary {
  totalCorrect: number;
  totalAttempts: number;
  streakDays: number;
  byCategory?: { category: string; completed: number; total: number }[];
}
export async function getCachedProgressSummary(): Promise<CachedReadResult<CachedProgressSummary>> {
  return unwrap(await readEnvelope<CachedProgressSummary>(PROGRESS_SUMMARY_KEY), PROGRESS_TTL_MS);
}
export async function cacheProgressSummary(summary: CachedProgressSummary): Promise<void> {
  await writeEnvelope(PROGRESS_SUMMARY_KEY, summary);
}

// --- Fallback session --------------------------------------------------

/**
 * A small, hand-curated set of items we *always* keep around so the user can
 * still echo and review even on a fresh device with no network. Updated by
 * the app whenever a successful practice generation happens — this means we
 * always have at least one usable mini-session.
 */
export interface FallbackSession {
  itemIds: string[];
  itemsPayload?: unknown[];
  capturedAt: number;
}
export async function getOfflineFallbackSession(): Promise<FallbackSession | null> {
  const env = await readEnvelope<FallbackSession>(FALLBACK_SESSION_KEY);
  return env?.data ?? null;
}
export async function setOfflineFallbackSession(session: FallbackSession): Promise<void> {
  await writeEnvelope(FALLBACK_SESSION_KEY, session);
}

export const learningCacheService = {
  getCachedTodaySession,
  cacheTodaySession,
  getCachedWeakItems,
  cacheWeakItems,
  getCachedLevel,
  cacheLevel,
  getCachedProgressSummary,
  cacheProgressSummary,
  getOfflineFallbackSession,
  setOfflineFallbackSession,
};
