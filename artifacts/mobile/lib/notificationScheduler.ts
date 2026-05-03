/**
 * notificationScheduler
 * ---------------------
 * Provider-agnostic local-notification facade for Murcielingo. Backed by
 * `expo-notifications` on native; safely no-ops on web.
 *
 * Responsibilities:
 *  - Request OS permission at the right moment (called from settings UI).
 *  - Schedule warm, opt-in reminders (daily practice, weak words, streak,
 *    level readiness, weekly summary). Every category is governed by the
 *    user's saved preferences in `notificationPreferenceService`.
 *  - Stay safe to call from anywhere — failures never throw.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { notificationPreferenceService } from "@/lib/notificationPreferenceService";

const TAGS = {
  dailyPractice: "murci.daily-practice",
  weakWords: "murci.weak-words",
  streak: "murci.streak",
  levelReady: "murci.level-ready",
  weeklySummary: "murci.weekly-summary",
} as const;

type Tag = (typeof TAGS)[keyof typeof TAGS];

function notificationsAvailable(): boolean {
  if (Platform.OS === "web") return false;
  return !!Notifications?.scheduleNotificationAsync;
}

async function safeCancel(tag: Tag): Promise<void> {
  if (!notificationsAvailable()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(tag);
  } catch {
    /* best effort */
  }
}

async function scheduleDaily(tag: Tag, body: string, hour: number): Promise<void> {
  if (!notificationsAvailable()) return;
  await safeCancel(tag);
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: tag,
      content: { title: "Murcielingo", body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
  } catch {
    /* best effort */
  }
}

async function scheduleWeekly(tag: Tag, body: string, hour: number, weekday: number): Promise<void> {
  if (!notificationsAvailable()) return;
  await safeCancel(tag);
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: tag,
      content: { title: "Murcielingo", body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute: 0,
      },
    });
  } catch {
    /* best effort */
  }
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "unavailable"> {
  await notificationPreferenceService.update({ osPermissionRequested: true });
  if (!notificationsAvailable()) return "unavailable";
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return "granted";
    const req = await Notifications.requestPermissionsAsync();
    return req.granted ? "granted" : "denied";
  } catch {
    return "unavailable";
  }
}

export async function scheduleDailyPracticeReminder(opts?: { hour?: number }): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.dailyPractice) {
    await safeCancel(TAGS.dailyPractice);
    return;
  }
  const hour = opts?.hour ?? prefs.preferredHour;
  await scheduleDaily(TAGS.dailyPractice, "Your Spanish is ready for a quick echo.", hour);
}

export async function scheduleWeakWordReminder(weakCount: number): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.weakWordReminder || weakCount <= 0) {
    await safeCancel(TAGS.weakWords);
    return;
  }
  const body = `${weakCount} word${weakCount === 1 ? "" : "s"} ready for review.`;
  await scheduleDaily(TAGS.weakWords, body, prefs.preferredHour);
}

export async function scheduleStreakReminder(): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.streakReminder) {
    await safeCancel(TAGS.streak);
    return;
  }
  await scheduleDaily(
    TAGS.streak,
    "Keep your streak alive with a 5-minute session.",
    prefs.preferredHour,
  );
}

export async function scheduleLevelReadinessReminder(): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.levelReadiness) {
    await safeCancel(TAGS.levelReady);
    return;
  }
  await scheduleDaily(
    TAGS.levelReady,
    "You're close to your next level check.",
    prefs.preferredHour,
  );
}

export async function scheduleWeeklySummary(): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.weeklySummary) {
    await safeCancel(TAGS.weeklySummary);
    return;
  }
  // Weekly summary on Sundays at preferred hour. expo-notifications uses 1=Sun.
  await scheduleWeekly(TAGS.weeklySummary, "Here's your week in Spanish.", prefs.preferredHour, 1);
}

export async function cancelNotifications(id?: string): Promise<void> {
  if (!notificationsAvailable()) return;
  try {
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch {
    /* best effort */
  }
}

/**
 * Re-apply every reminder according to current preferences. Call this after
 * the user toggles preferences in settings, or after a successful sign-in.
 */
export async function reconcileScheduledNotifications(weakCount = 0): Promise<void> {
  await scheduleDailyPracticeReminder();
  await scheduleWeakWordReminder(weakCount);
  await scheduleStreakReminder();
  await scheduleLevelReadinessReminder();
  await scheduleWeeklySummary();
}

export async function debugListScheduled(): Promise<unknown[]> {
  if (!notificationsAvailable()) return [];
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}

export const notificationScheduler = {
  requestNotificationPermission,
  scheduleDailyPracticeReminder,
  scheduleWeakWordReminder,
  scheduleStreakReminder,
  scheduleLevelReadinessReminder,
  scheduleWeeklySummary,
  cancelNotifications,
  reconcileScheduledNotifications,
  debugListScheduled,
};
