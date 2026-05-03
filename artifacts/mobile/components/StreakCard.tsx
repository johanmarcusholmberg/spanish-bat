import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Card } from "./Card";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";

/**
 * StreakCard — mobile port of the polished web StreakCard.
 *
 * Mirrors the web pattern (artifacts/murcielago/src/components/StreakCard.tsx):
 *   - Today-status pill (emerald "Practiced today" / amber "Not yet today")
 *   - 3-tile stat strip: current, longest, this week
 *   - Milestone hint within 3 days of [3, 7, 14, 30, 60, 100, 180, 365]
 *   - Warm empty-state copy when streak === 0
 *   - Mon–Sun bar chart with check marks, today highlight, future-day hint
 *   - One-time onboarding callout explaining what streaks unlock,
 *     persisted via AsyncStorage. Auto-dismisses on "View progress" tap.
 *
 * Data shape mirrors the API response: an `activityLog` of
 * `{ activityDate, count }` rows, one per practiced day in the recent past.
 * The component derives the current ISO week's Mon–Sun activity from it.
 */

const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];
const STREAK_INTRO_KEY = "streak_intro_seen";

function nextMilestone(streak: number): number | null {
  for (const m of MILESTONES) {
    if (m > streak && m - streak <= 3) return m;
  }
  return null;
}

interface ActivityRow {
  activityDate: string; // YYYY-MM-DD
  count: number;
}

interface DayCell {
  dateKey: string;
  dayLabel: string;
  count: number;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Build a Mon–Sun week view from the raw activity log. Pure for testability.
 * Uses the user's local timezone — the API returns ISO date strings (YYYY-MM-DD)
 * which we treat as calendar days. Future days are shown as dashed placeholders.
 */
function buildWeek(
  activityLog: ActivityRow[],
  lang: "en" | "sv",
  now: Date = new Date(),
): DayCell[] {
  const labelsEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const labelsSv = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
  const labels = lang === "sv" ? labelsSv : labelsEn;

  // ISO week: Monday = 0, Sunday = 6
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - dow);

  const todayKey = toKey(now);
  const counts = new Map<string, number>();
  for (const row of activityLog) {
    counts.set(row.activityDate, (counts.get(row.activityDate) ?? 0) + row.count);
  }

  const cells: DayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toKey(d);
    cells.push({
      dateKey: key,
      dayLabel: labels[i],
      count: counts.get(key) ?? 0,
      isToday: key === todayKey,
      isFuture: d.getTime() > now.getTime() && key !== todayKey,
    });
  }
  return cells;
}

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoWeekNumber(d: Date = new Date()): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

interface Props {
  currentStreak: number;
  longestStreak: number;
  activityLog: ActivityRow[];
  lang?: "en" | "sv";
}

export const StreakCard: React.FC<Props> = ({
  currentStreak,
  longestStreak,
  activityLog,
  lang = "en",
}) => {
  const colors = useColors();
  const week = useMemo(() => buildWeek(activityLog, lang), [activityLog, lang]);
  const weekNum = useMemo(() => isoWeekNumber(), []);
  const today = week.find((d) => d.isToday);
  const practicedToday = (today?.count ?? 0) > 0;
  const weekTotal = week.reduce((sum, d) => sum + (d.isFuture ? 0 : d.count), 0);
  const maxCount = Math.max(1, ...week.map((d) => d.count));
  const milestone = nextMilestone(currentStreak);
  const milestoneRemaining = milestone ? milestone - currentStreak : 0;

  // ── One-time onboarding callout ─────────────────────────────────────
  // Only show once the streak has actually started (currentStreak > 0) so
  // the explanation lands on something concrete. Auto-dismisses when the
  // user taps "View progress" so it doesn't follow them around.
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (currentStreak <= 0) return;
    let cancelled = false;
    AsyncStorage.getItem(STREAK_INTRO_KEY)
      .then((v) => {
        if (!cancelled && v !== "1") setShowIntro(true);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [currentStreak]);
  const dismissIntro = () => {
    setShowIntro(false);
    AsyncStorage.setItem(STREAK_INTRO_KEY, "1").catch(() => {});
  };

  return (
    <Card style={{ marginBottom: 12 }} padding={16}>
      {/* ── Header: title + today-status pill ─────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Feather name="zap" size={18} color={colors.primary} />
          <Typography variant="h3">
            {lang === "sv" ? "Streak" : "Streak"}
          </Typography>
        </View>
        <View style={styles.headerRight}>
          <View
            testID="streak-today-status"
            style={[
              styles.pill,
              practicedToday
                ? { backgroundColor: "#d1fae5" }
                : { backgroundColor: "#fef3c7" },
            ]}
          >
            <Feather
              name={practicedToday ? "check" : "zap"}
              size={11}
              color={practicedToday ? "#065f46" : "#92400e"}
            />
            <Typography
              variant="caption"
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: practicedToday ? "#065f46" : "#92400e",
                marginLeft: 4,
              }}
            >
              {practicedToday
                ? lang === "sv"
                  ? "Övat idag"
                  : "Practiced today"
                : lang === "sv"
                  ? "Inte än idag"
                  : "Not yet today"}
            </Typography>
          </View>
          <View
            style={[styles.pill, { backgroundColor: colors.muted, marginLeft: 6 }]}
          >
            <Feather name="calendar" size={11} color={colors.mutedForeground} />
            <Typography
              variant="caption"
              muted
              style={{ fontSize: 11, marginLeft: 4 }}
            >
              {lang === "sv" ? `Vecka ${weekNum}` : `Week ${weekNum}`}
            </Typography>
          </View>
        </View>
      </View>

      {/* ── Onboarding callout ───────────────────────────────────────── */}
      {showIntro && (
        <View
          testID="streak-intro"
          style={[
            styles.intro,
            {
              backgroundColor: colors.primary + "1A",
              borderColor: colors.primary + "55",
            },
          ]}
        >
          <Feather
            name="star"
            size={13}
            color={colors.primary}
            style={{ marginTop: 2 }}
          />
          <Typography
            variant="caption"
            style={{ flex: 1, fontSize: 12, lineHeight: 17 }}
          >
            {lang === "sv"
              ? "Ditt streak växer varje dag du övar. Korta sessioner räcker — Murci firar små milstolpar med dig."
              : "Your streak grows every day you practice. Short sessions count — Murci celebrates small milestones with you."}
          </Typography>
          <Pressable
            onPress={dismissIntro}
            accessibilityRole="button"
            accessibilityLabel={lang === "sv" ? "Stäng" : "Dismiss"}
            hitSlop={8}
            testID="streak-intro-dismiss"
          >
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </Pressable>
        </View>
      )}

      {/* ── Stat strip ───────────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
          <Feather name="zap" size={14} color={colors.primary} />
          <Typography variant="h2" style={styles.statValue}>
            {currentStreak}
          </Typography>
          <Typography variant="caption" muted style={styles.statLabel}>
            {lang === "sv" ? "Nuvarande" : "Current"}
          </Typography>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
          <Feather name="award" size={14} color={colors.primary} />
          <Typography variant="h2" style={styles.statValue}>
            {longestStreak}
          </Typography>
          <Typography variant="caption" muted style={styles.statLabel}>
            {lang === "sv" ? "Längsta" : "Longest"}
          </Typography>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.background }]}>
          <Feather name="bar-chart-2" size={14} color={colors.primary} />
          <Typography variant="h2" style={styles.statValue}>
            {weekTotal}
          </Typography>
          <Typography variant="caption" muted style={styles.statLabel}>
            {lang === "sv" ? "Denna vecka" : "This week"}
          </Typography>
        </View>
      </View>

      {/* ── Milestone / empty-state hint ────────────────────────────── */}
      {currentStreak === 0 ? (
        <Typography
          variant="caption"
          muted
          center
          style={{ marginTop: 4, marginBottom: 10, fontSize: 12 }}
        >
          {lang === "sv"
            ? "Starta en kort session för att tända din första dag."
            : "Start a short session to light your first day."}
        </Typography>
      ) : milestone ? (
        <View
          testID="streak-milestone-hint"
          style={styles.milestoneRow}
        >
          <Feather name="star" size={12} color={colors.primary} />
          <Typography
            variant="caption"
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.primary,
              marginLeft: 6,
            }}
          >
            {lang === "sv"
              ? `${milestoneRemaining} ${milestoneRemaining === 1 ? "dag" : "dagar"} till ${milestone}-dagars-streak!`
              : `${milestoneRemaining} ${milestoneRemaining === 1 ? "day" : "days"} to a ${milestone}-day streak!`}
          </Typography>
        </View>
      ) : null}

      {/* ── Mon–Sun chart ────────────────────────────────────────────── */}
      <View style={styles.chartRow}>
        {week.map((day) => {
          const practiced = day.count > 0 && !day.isFuture;
          const heightPct = practiced
            ? Math.max(25, (day.count / maxCount) * 100)
            : 10;
          return (
            <View key={day.dateKey} style={styles.chartCol}>
              <View style={styles.checkSlot}>
                {practiced && (
                  <View
                    style={[
                      styles.checkBubble,
                      { backgroundColor: colors.primary + "33" },
                    ]}
                  >
                    <Feather name="check" size={10} color={colors.primary} />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${heightPct}%`,
                    backgroundColor: day.isFuture
                      ? "transparent"
                      : practiced
                        ? colors.primary
                        : colors.muted,
                    borderColor: day.isFuture ? colors.border : "transparent",
                    borderWidth: day.isFuture ? 1 : 0,
                    borderStyle: day.isFuture ? "dashed" : "solid",
                  },
                  day.isToday && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                    borderStyle: "solid",
                  },
                ]}
              />
              <Typography
                variant="caption"
                style={{
                  fontSize: 10,
                  marginTop: 4,
                  fontWeight: day.isToday ? "700" : "400",
                  color: day.isToday
                    ? colors.primary
                    : day.isFuture
                      ? colors.mutedForeground
                      : colors.mutedForeground,
                }}
              >
                {day.dayLabel}
              </Typography>
            </View>
          );
        })}
      </View>

      {/* ── Footer: link to progress ─────────────────────────────────── */}
      <Pressable
        onPress={() => {
          if (showIntro) dismissIntro();
          router.push("/(tabs)/progress" as never);
        }}
        style={[styles.footerBtn, { borderColor: colors.border }]}
        accessibilityRole="button"
      >
        <Typography variant="caption" style={{ fontSize: 12 }}>
          {lang === "sv" ? "Se framsteg" : "View progress"}
        </Typography>
        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
      </Pressable>
    </Card>
  );
};

export default StreakCard;
// Exported for unit testing in the future without coupling to the API call.
export { buildWeek as __buildWeekForTest };

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  intro: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 88,
    gap: 6,
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  checkSlot: {
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBubble: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bar: {
    width: "70%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 6,
  },
  footerBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
