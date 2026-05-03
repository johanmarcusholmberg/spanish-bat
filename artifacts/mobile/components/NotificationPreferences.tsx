import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Card } from "./Card";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import {
  notificationPreferenceService,
  type NotificationPreferences as Prefs,
} from "@/lib/notificationPreferenceService";
import { notificationScheduler } from "@/lib/notificationScheduler";

const TOGGLES: { key: keyof Prefs; label: string; help: string }[] = [
  {
    key: "dailyPractice",
    label: "Daily practice",
    help: "Your Spanish is ready for a quick echo.",
  },
  {
    key: "weakWordReminder",
    label: "Weak-word reminder",
    help: "When words are ready for review.",
  },
  {
    key: "streakReminder",
    label: "Streak reminder",
    help: "Keep your streak alive with a 5-minute session.",
  },
  {
    key: "levelReadiness",
    label: "Level readiness",
    help: "When you're close to your next level check.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    help: "A friendly recap once a week.",
  },
];

const HOURS: number[] = [7, 9, 12, 17, 19, 21];

/**
 * Notification preferences UI for the Profile tab.
 *
 * Strictly opt-in. Toggling the master switch on triggers the OS permission
 * prompt; toggles for individual categories are saved instantly and the
 * scheduler is reconciled so the user's preferences match what's actually
 * scheduled at the OS level.
 */
export const NotificationPreferences: React.FC = () => {
  const colors = useColors();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [busy, setBusy] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    notificationPreferenceService
      .load()
      .then((p) => {
        if (active) setPrefs(p);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!prefs) return null;

  const reconcile = async () => {
    try {
      await notificationScheduler.reconcileScheduledNotifications();
    } catch {
      /* best effort */
    }
  };

  const update = async (patch: Partial<Prefs>) => {
    setBusy(true);
    try {
      const next = await notificationPreferenceService.update(patch);
      setPrefs(next);
      await reconcile();
    } finally {
      setBusy(false);
    }
  };

  const onMasterToggle = async (next: boolean) => {
    setPermissionMsg(null);
    if (next) {
      const status = await notificationScheduler.requestNotificationPermission();
      if (status === "denied") {
        setPermissionMsg(
          "Notifications are blocked at the OS level. Enable them in your device settings to turn this on.",
        );
        return;
      }
      if (status === "unavailable" && Platform.OS === "web") {
        setPermissionMsg("Notifications aren't available on web. Try the mobile app.");
        return;
      }
    }
    await update({ enabled: next });
    if (!next) {
      try {
        await notificationScheduler.cancelNotifications();
      } catch {
        /* best effort */
      }
    }
  };

  return (
    <Card style={{ marginTop: 12 }}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBubble, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="bell" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Typography variant="label">Notifications</Typography>
          <Typography variant="caption" muted style={{ marginTop: 2 }}>
            Gentle reminders to keep your Spanish habit going.
          </Typography>
        </View>
        <Switch
          value={prefs.enabled}
          onValueChange={onMasterToggle}
          disabled={busy}
        />
      </View>

      {permissionMsg && (
        <Typography
          variant="caption"
          style={{ marginTop: 8, color: colors.destructive }}
        >
          {permissionMsg}
        </Typography>
      )}

      {prefs.enabled && (
        <>
          {TOGGLES.map((t) => (
            <View
              key={t.key}
              style={[styles.toggleRow, { borderTopColor: colors.border }]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Typography variant="label">{t.label}</Typography>
                <Typography variant="caption" muted style={{ marginTop: 2 }}>
                  {t.help}
                </Typography>
              </View>
              <Switch
                value={!!prefs[t.key]}
                onValueChange={(v) => update({ [t.key]: v } as Partial<Prefs>)}
                disabled={busy}
              />
            </View>
          ))}

          <View style={[styles.toggleRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Typography variant="label">Preferred time</Typography>
              <Typography variant="caption" muted style={{ marginTop: 2 }}>
                When daily reminders fire.
              </Typography>
            </View>
          </View>
          <View style={styles.hourRow}>
            {HOURS.map((h) => {
              const active = prefs.preferredHour === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => update({ preferredHour: h })}
                  style={[
                    styles.hourChip,
                    {
                      backgroundColor: active ? colors.primary : colors.muted,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={{
                      color: active ? colors.primaryForeground : colors.foreground,
                      fontWeight: "600",
                    }}
                  >
                    {h}:00
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Card>
  );
};

export default NotificationPreferences;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
  hourRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  hourChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
