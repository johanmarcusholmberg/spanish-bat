/**
 * Mobile shim around the shared `@workspace/learning-coach` learning-data
 * cache. Binds AsyncStorage and re-exports the same named helpers existing
 * mobile callers depend on (cacheLevel, getCachedTodaySession, etc.).
 */
import {
  createLearningCacheService,
  type CachedReadResult,
  type CachedTodaySession,
  type CachedWeakItem,
  type CachedProgressSummary,
  type FallbackSession,
} from "@workspace/learning-coach";

import { asyncStorageKv } from "./asyncStorageKv";

export type {
  CachedReadResult,
  CachedTodaySession,
  CachedWeakItem,
  CachedProgressSummary,
  FallbackSession,
};

export const learningCacheService = createLearningCacheService(asyncStorageKv);

export const getCachedTodaySession = learningCacheService.getCachedTodaySession;
export const cacheTodaySession = learningCacheService.cacheTodaySession;
export const getCachedWeakItems = learningCacheService.getCachedWeakItems;
export const cacheWeakItems = learningCacheService.cacheWeakItems;
export const getCachedLevel = learningCacheService.getCachedLevel;
export const cacheLevel = learningCacheService.cacheLevel;
export const getCachedProgressSummary = learningCacheService.getCachedProgressSummary;
export const cacheProgressSummary = learningCacheService.cacheProgressSummary;
export const getOfflineFallbackSession = learningCacheService.getOfflineFallbackSession;
export const setOfflineFallbackSession = learningCacheService.setOfflineFallbackSession;
