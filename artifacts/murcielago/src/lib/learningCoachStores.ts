/**
 * Web shims around the shared `@workspace/learning-coach` services. Binds
 * each service to the browser's `localStorage` (via `localStorageKv`) and
 * re-exports them so web call-sites can import session storage, the
 * learning cache and notification preferences with the same surface the
 * mobile client uses.
 */
import {
  createLearningCacheService,
  createNotificationPreferenceService,
  createSessionStorageService,
  isResumable as sharedIsResumable,
  localStorageKv,
  DEFAULT_NOTIFICATION_PREFS,
  type ActiveSessionState,
  type CachedProgressSummary,
  type CachedReadResult,
  type CachedTodaySession,
  type CachedWeakItem,
  type FallbackSession,
  type NotificationPreferences,
  type SessionItemResult,
} from "@workspace/learning-coach";

const kv = localStorageKv();

export const sessionStorageService = createSessionStorageService(kv);
export const learningCacheService = createLearningCacheService(kv);
export const notificationPreferenceService =
  createNotificationPreferenceService(kv);

export const isResumable = sharedIsResumable;
export { DEFAULT_NOTIFICATION_PREFS };

export type {
  ActiveSessionState,
  CachedProgressSummary,
  CachedReadResult,
  CachedTodaySession,
  CachedWeakItem,
  FallbackSession,
  NotificationPreferences,
  SessionItemResult,
};
