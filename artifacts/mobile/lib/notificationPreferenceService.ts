/**
 * Mobile shim around the shared notification-preference store. Binds
 * AsyncStorage so the same opt-in defaults and serialized update chain
 * apply on both web and mobile.
 */
import {
  createNotificationPreferenceService,
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPreferences,
} from "@workspace/learning-coach";

import { asyncStorageKv } from "./asyncStorageKv";

export type { NotificationPreferences };
export { DEFAULT_NOTIFICATION_PREFS };

export const notificationPreferenceService =
  createNotificationPreferenceService(asyncStorageKv);
