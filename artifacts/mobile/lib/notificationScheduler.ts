/**
 * notificationScheduler
 * ---------------------
 * Wraps the (currently-unimplemented) push/local notification surface behind
 * a stable interface so the rest of the app can talk to "schedule a daily
 * reminder" without caring whether it lands in expo-notifications, OneSignal,
 * or a future backend job.
 *
 * The current implementation is a *safe placeholder*: it logs the intent and
 * records what would have been scheduled. When `expo-notifications` is added
 * to the project, swap the bodies in this file — no caller changes required.
 *
 * Copy guidance for future implementations:
 *  - Daily practice:  "Your Spanish is ready for a quick echo."
 *  - Weak words:      "{N} words are ready for review."
 *  - Streak:          "Keep your streak alive with a 5-minute session."
 *  - Level readiness: "You’re close to your next level check."
 *  - Weekly summary:  "Here's your week in Spanish."
 */
import { notificationPreferenceService } from "@/lib/notificationPreferenceService";

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  /** Local hour 0-23 when this fires. */
  hour: number;
  recurring: "daily" | "weekly" | "once";
}

const scheduled = new Map<string, ScheduledNotification>();

async function ensureEnabled(): Promise<boolean> {
  const prefs = await notificationPreferenceService.load();
  return prefs.enabled;
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "unavailable"> {
  // TODO(native): expo-notifications Notifications.requestPermissionsAsync().
  await notificationPreferenceService.update({ osPermissionRequested: true });
  return "unavailable";
}

export async function scheduleDailyPracticeReminder(opts?: { hour?: number }): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.dailyPractice) return;
  const hour = opts?.hour ?? prefs.preferredHour;
  scheduled.set("daily-practice", {
    id: "daily-practice",
    title: "Murcielingo",
    body: "Your Spanish is ready for a quick echo.",
    hour,
    recurring: "daily",
  });
  // TODO(native): replace with Notifications.scheduleNotificationAsync.
}

export async function scheduleWeakWordReminder(weakCount: number): Promise<void> {
  if (weakCount <= 0) return;
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.weakWordReminder) return;
  scheduled.set("weak-words", {
    id: "weak-words",
    title: "Murcielingo",
    body: `${weakCount} word${weakCount === 1 ? "" : "s"} ready for review.`,
    hour: prefs.preferredHour,
    recurring: "daily",
  });
}

export async function scheduleStreakReminder(): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.streakReminder) return;
  scheduled.set("streak", {
    id: "streak",
    title: "Murcielingo",
    body: "Keep your streak alive with a 5-minute session.",
    hour: prefs.preferredHour,
    recurring: "daily",
  });
}

export async function scheduleLevelReadinessReminder(): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.levelReadiness) return;
  scheduled.set("level-ready", {
    id: "level-ready",
    title: "Murcielingo",
    body: "You're close to your next level check.",
    hour: prefs.preferredHour,
    recurring: "once",
  });
}

export async function scheduleWeeklySummary(): Promise<void> {
  const prefs = await notificationPreferenceService.load();
  if (!prefs.enabled || !prefs.weeklySummary) return;
  scheduled.set("weekly-summary", {
    id: "weekly-summary",
    title: "Murcielingo",
    body: "Here's your week in Spanish.",
    hour: prefs.preferredHour,
    recurring: "weekly",
  });
}

export async function cancelNotifications(id?: string): Promise<void> {
  if (id) {
    scheduled.delete(id);
  } else {
    scheduled.clear();
  }
  // TODO(native): Notifications.cancelScheduledNotificationAsync / cancelAllScheduledNotificationsAsync.
}

/** Inspect what would currently be scheduled — handy for the Profile/Settings UI. */
export function debugListScheduled(): ScheduledNotification[] {
  return Array.from(scheduled.values());
}

export const notificationScheduler = {
  requestNotificationPermission,
  scheduleDailyPracticeReminder,
  scheduleWeakWordReminder,
  scheduleStreakReminder,
  scheduleLevelReadinessReminder,
  scheduleWeeklySummary,
  cancelNotifications,
  debugListScheduled,
  ensureEnabled,
};
