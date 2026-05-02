/**
 * notificationPreferenceService
 * -----------------------------
 * Strictly-opt-in notification preferences for Murcielingo. Notifications are
 * a habit aid, not a growth hack — every category defaults to OFF.
 *
 * This file is intentionally decoupled from any push provider (expo-notifications
 * is not yet a project dependency). The scheduler (notificationScheduler.ts)
 * reads these preferences and decides whether to register / cancel real
 * notifications when the native backend is wired in.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "murci.notifications.prefs.v1";

export interface NotificationPreferences {
  /** Master toggle — if false, no notification of any kind is scheduled. */
  enabled: boolean;
  /** Daily 5-minute practice nudge. */
  dailyPractice: boolean;
  /** "N words are ready for review" reminder. */
  weakWordReminder: boolean;
  /** "Keep your streak alive" reminder. */
  streakReminder: boolean;
  /** "You're close to your level check" reminder. */
  levelReadiness: boolean;
  /** Weekly progress summary. */
  weeklySummary: boolean;
  /** Local hour (0–23) at which the daily nudge should fire. Defaults to 19. */
  preferredHour: number;
  /** Whether we've ever requested OS-level permission. */
  osPermissionRequested: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: false,
  dailyPractice: false,
  weakWordReminder: false,
  streakReminder: false,
  levelReadiness: false,
  weeklySummary: false,
  preferredHour: 19,
  osPermissionRequested: false,
};

export const notificationPreferenceService = {
  async load(): Promise<NotificationPreferences> {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
      const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
      return { ...DEFAULT_NOTIFICATION_PREFS, ...parsed };
    } catch {
      return { ...DEFAULT_NOTIFICATION_PREFS };
    }
  },

  async save(prefs: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* best effort */
    }
  },

  async update(patch: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await notificationPreferenceService.load();
    const next: NotificationPreferences = { ...current, ...patch };
    await notificationPreferenceService.save(next);
    return next;
  },

  async reset(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFS_KEY);
    } catch {
      /* best effort */
    }
  },
};
