/**
 * Shared notification-preference store. Strictly opt-in: every category
 * defaults to OFF. Storage adapter is provided by the host so the same
 * service runs on web (localStorage) and mobile (AsyncStorage). Updates
 * are serialized through a single per-instance promise chain to prevent
 * lost writes when the UI dispatches several toggles in quick succession.
 */
import type { KvStorage } from "./kvStorage";

const PREFS_KEY = "murci.notifications.prefs.v1";

export interface NotificationPreferences {
  enabled: boolean;
  dailyPractice: boolean;
  weakWordReminder: boolean;
  streakReminder: boolean;
  levelReadiness: boolean;
  weeklySummary: boolean;
  preferredHour: number;
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

export interface NotificationPreferenceService {
  load(): Promise<NotificationPreferences>;
  save(prefs: NotificationPreferences): Promise<void>;
  update(patch: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
  reset(): Promise<void>;
}

export function createNotificationPreferenceService(
  kv: KvStorage,
): NotificationPreferenceService {
  let updateChain: Promise<NotificationPreferences> = Promise.resolve({
    ...DEFAULT_NOTIFICATION_PREFS,
  });

  const service: NotificationPreferenceService = {
    async load() {
      try {
        const raw = await kv.getItem(PREFS_KEY);
        if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
        const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
        return { ...DEFAULT_NOTIFICATION_PREFS, ...parsed };
      } catch {
        return { ...DEFAULT_NOTIFICATION_PREFS };
      }
    },
    async save(prefs) {
      try {
        await kv.setItem(PREFS_KEY, JSON.stringify(prefs));
      } catch {
        /* best effort */
      }
    },
    update(patch) {
      const run = async (): Promise<NotificationPreferences> => {
        const current = await service.load();
        const next: NotificationPreferences = { ...current, ...patch };
        await service.save(next);
        return next;
      };
      updateChain = updateChain.then(run, run);
      return updateChain;
    },
    async reset() {
      try {
        await kv.removeItem(PREFS_KEY);
      } catch {
        /* best effort */
      }
    },
  };

  return service;
}
