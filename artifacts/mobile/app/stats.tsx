import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar, CircularProgress } from "@/components/ProgressBar";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { RequireAuth } from "@/components/RequireAuth";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

interface StatsData {
  streak: { currentStreak: number; longestStreak: number; lastActiveDate?: string } | null;
  activityLog: { activityDate: string; count: number }[];
  progress: { category: string; completed: number; total: number }[];
  vocabTotal: number;
  vocabLearned: number;
}

export default function StatsScreen() {
  return (
    <RequireAuth>
      <StatsScreenInner />
    </RequireAuth>
  );
}

function StatsScreenInner() {
  const colors = useColors();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [streaksRes, progressRes, vocabRes] = await Promise.all([
        api.streaks.get().catch(() => ({ streak: null, activityLog: [] })),
        api.progress.get().catch(() => ({ progress: [], lastActivity: null })),
        api.vocabulary.get().catch(() => ({ words: [] })),
      ]);
      const words = (vocabRes.words ?? []) as { learned?: boolean }[];
      setData({
        streak: streaksRes.streak as StatsData["streak"],
        activityLog: streaksRes.activityLog ?? [],
        progress: progressRes.progress ?? [],
        vocabTotal: words.length,
        vocabLearned: words.filter((w) => w.learned).length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const headerOptions = {
    title: "Statistics",
    headerShown: true,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.foreground,
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <LoadingState fullscreen />
        </View>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ErrorState message={error ?? "No data"} onRetry={load} />
        </View>
      </>
    );
  }

  const grammarRow = data.progress.find((p) => p.category === "grammar");
  const vocabRow = data.progress.find((p) => p.category === "vocabulary");
  const last7 = lastNDays(7);
  const activityMap = new Map(data.activityLog.map((a) => [a.activityDate.slice(0, 10), a.count]));

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <Screen>
        <Typography variant="h2">Your stats</Typography>
        <Typography variant="body" muted style={{ marginTop: 4, marginBottom: 16 }}>
          Track streaks, progress, and vocabulary mastery.
        </Typography>

        {/* Streak */}
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="zap" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="caption" muted>
                CURRENT STREAK
              </Typography>
              <Typography variant="h2">
                {data.streak?.currentStreak ?? 0} {(data.streak?.currentStreak ?? 0) === 1 ? "day" : "days"}
              </Typography>
              <Typography variant="caption" muted style={{ marginTop: 2 }}>
                Longest: {data.streak?.longestStreak ?? 0} days
              </Typography>
            </View>
          </View>
        </Card>

        {/* Last 7 days */}
        <Card style={{ marginBottom: 12 }}>
          <Typography variant="label" muted style={{ marginBottom: 12 }}>
            LAST 7 DAYS
          </Typography>
          <View style={styles.weekRow}>
            {last7.map((d) => {
              const count = activityMap.get(d.iso) ?? 0;
              const intensity = Math.min(1, count / 5);
              return (
                <View key={d.iso} style={{ alignItems: "center", flex: 1 }}>
                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor:
                          intensity > 0
                            ? colors.primary + Math.round(40 + intensity * 200).toString(16).padStart(2, "0")
                            : colors.muted,
                        borderColor: intensity > 0 ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={{ color: intensity > 0.4 ? "#fff" : colors.foreground, fontWeight: "700" }}
                    >
                      {count > 0 ? count : ""}
                    </Typography>
                  </View>
                  <Typography variant="caption" muted style={{ marginTop: 6 }}>
                    {d.label}
                  </Typography>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Progress bars */}
        <Typography variant="h3" style={{ marginTop: 6, marginBottom: 8 }}>
          Category progress
        </Typography>
        <Card style={{ marginBottom: 12 }}>
          <ProgressBar
            value={grammarRow?.completed ?? 0}
            max={grammarRow?.total || 1}
            color={colors.primary}
            showLabel
            label="Grammar"
          />
          <View style={{ height: 16 }} />
          <ProgressBar
            value={vocabRow?.completed ?? data.vocabTotal}
            max={(vocabRow?.total ?? 0) || Math.max(20, data.vocabTotal)}
            color={colors.secondary}
            showLabel
            label="Vocabulary"
          />
        </Card>

        {/* Vocab mastery */}
        <Typography variant="h3" style={{ marginTop: 6, marginBottom: 8 }}>
          Vocabulary mastery
        </Typography>
        <Card style={{ marginBottom: 12 }}>
          <View style={styles.row}>
            <CircularProgress
              value={data.vocabLearned}
              max={Math.max(1, data.vocabTotal)}
              size={88}
              thickness={8}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Typography variant="h3">
                {data.vocabLearned}/{data.vocabTotal}
              </Typography>
              <Typography variant="caption" muted style={{ marginTop: 4 }}>
                Words marked as learned
              </Typography>
              <Typography
                variant="caption"
                muted
                style={{ marginTop: 8 }}
                onPress={() => router.push("/(tabs)/vocabulary")}
              >
                View dictionary →
              </Typography>
            </View>
          </View>
        </Card>
      </Screen>
    </>
  );
}

function lastNDays(n: number): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ iso: d.toISOString().slice(0, 10), label: days[d.getDay()] });
  }
  return out;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
