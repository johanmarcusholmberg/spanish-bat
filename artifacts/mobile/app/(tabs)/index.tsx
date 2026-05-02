import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { dashboardCache, recentLessons, type RecentLesson } from "@/lib/storage";
import {
  calculateReadiness,
  progressRowsToInputs,
  getNextLevel,
  type Level,
  type ReadinessResult,
  type SkillCategory,
} from "@workspace/readiness";

const PASSED_KEY = (userId: string, level: string) =>
  `murci.passedLevelCheck.${userId}.${level}`;

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  sentences: "Sentences",
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
};

const CATEGORY_PATH: Record<SkillCategory, string> = {
  vocabulary: "/(tabs)/vocabulary",
  grammar: "/(tabs)/grammar",
  sentences: "/(tabs)/exercises",
  reading: "/(tabs)/reading",
  listening: "/(tabs)/exercises",
  speaking: "/(tabs)/exercises",
};

interface DashboardData {
  streak: { currentStreak: number; longestStreak: number; lastActiveDate: string } | null;
  progress: { category: string; completed: number; total: number }[];
  lastActivity: { exerciseType: string; exercisePath: string; exerciseLabel: string } | null;
  vocabCount: number;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, userId } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recents, setRecents] = useState<RecentLesson[]>([]);
  const [hasPassedLevelCheck, setHasPassedLevelCheck] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [streaksRes, progressRes, vocabRes] = await Promise.all([
        api.streaks.get().catch(() => ({ streak: null, activityLog: [] })),
        api.progress.get().catch(() => ({ progress: [], lastActivity: null })),
        api.vocabulary.get().catch(() => ({ words: [] })),
      ]);
      const next: DashboardData = {
        streak: streaksRes.streak as DashboardData["streak"],
        progress: progressRes.progress ?? [],
        lastActivity: progressRes.lastActivity as DashboardData["lastActivity"],
        vocabCount: (vocabRes.words ?? []).length,
      };
      setData(next);
      dashboardCache.set(next).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    dashboardCache
      .get<DashboardData>()
      .then((cached) => {
        if (!cancelled && cached) {
          setData(cached);
          setLoading(false);
        }
      })
      .catch(() => {});
    load();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem(PASSED_KEY(userId, (user?.level as Level) ?? "A1"))
      .then((v) => setHasPassedLevelCheck(v === "1"))
      .catch(() => {});
  }, [userId, user?.level]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      recentLessons
        .get()
        .then((items) => {
          if (active) setRecents(items.slice(0, 3));
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const greeting = greetingForHour(new Date().getHours(), user?.learningFrom ?? "sv");
  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top }),
  };

  if (loading && !data) {
    return (
      <View style={containerStyle}>
        <LoadingState fullscreen label="Loading your dashboard…" />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={containerStyle}>
        <ErrorState message={error} onRetry={load} />
      </View>
    );
  }

  const streakCount = data?.streak?.currentStreak ?? 0;
  const longestStreak = data?.streak?.longestStreak ?? 0;

  const currentLevel = (user?.level as Level) ?? "A1";
  const nextLevel = getNextLevel(currentLevel);

  const readiness: ReadinessResult = calculateReadiness(
    currentLevel,
    progressRowsToInputs(data?.progress ?? [], {
      hasPassedLevelTest: hasPassedLevelCheck,
    }),
  );

  const stateMessage = (() => {
    if (readiness.state === "passed_but_can_continue") {
      return nextLevel
        ? `You passed the ${currentLevel} check. Move to ${nextLevel}, or keep strengthening ${currentLevel}.`
        : `You've passed the highest level. Keep practicing to stay sharp.`;
    }
    if (readiness.state === "test_recommended") {
      return `You look ready for the ${nextLevel ?? currentLevel} check. Take the test now, or keep practicing ${currentLevel}.`;
    }
    return `Keep practicing ${currentLevel}. You're building confidence.`;
  })();

  // Exposed for the level-check screen to call ONLY on a successful test
  // result. Never fired on "Take level check" click — that would mark the
  // user as passed before the test produced any outcome.
  const _markPassedExternallyAvailable = async () => {
    setHasPassedLevelCheck(true);
    if (userId) {
      try {
        await AsyncStorage.setItem(PASSED_KEY(userId, currentLevel), "1");
      } catch {
        // ignore
      }
    }
  };
  void _markPassedExternallyAvailable;

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 100 : 80 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Typography variant="h2">
            {greeting}, {user?.displayName?.split(" ")[0] ?? "amigo"} 👋
          </Typography>
          <Typography variant="body" muted style={{ marginTop: 2 }}>
            Ready for today's Spanish?
          </Typography>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary + "30", borderColor: colors.primary }]}>
          <Typography variant="label" style={{ color: colors.primary }}>
            {user?.level ?? "A1"}
          </Typography>
        </View>
      </View>

      {/* Streak card */}
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.streakRow}>
          <View style={[styles.streakIcon, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="zap" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="h2">
              {streakCount} {streakCount === 1 ? "day" : "days"}
            </Typography>
            <Typography variant="caption" muted>
              Longest: {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </Typography>
          </View>
          <Card
            variant="muted"
            padding={10}
            onPress={() => router.push("/stats")}
            style={{ borderRadius: 12 }}
          >
            <Typography variant="caption" style={{ color: colors.foreground }}>
              View stats
            </Typography>
          </Card>
        </View>
      </Card>

      {/* Continue learning */}
      <Card
        variant="primary"
        onPress={() => {
          if (data?.lastActivity?.exerciseType === "grammar") {
            router.push("/(tabs)/grammar");
          } else if (data?.lastActivity?.exerciseType === "reading") {
            router.push("/(tabs)/reading");
          } else if (data?.lastActivity?.exerciseType === "vocabulary") {
            router.push("/(tabs)/vocabulary");
          } else {
            router.push("/(tabs)/exercises");
          }
        }}
        style={{ marginBottom: 16 }}
      >
        <Typography variant="caption" muted>
          CONTINUE LEARNING
        </Typography>
        <Typography variant="h3" style={{ marginTop: 4 }}>
          {data?.lastActivity?.exerciseLabel ?? "Pick where to start →"}
        </Typography>
        <Typography variant="caption" muted style={{ marginTop: 4 }}>
          {data?.lastActivity ? "Tap to resume" : "Browse exercises"}
        </Typography>
      </Card>

      {/* Pick up where you left off */}
      {recents.length > 0 && (
        <>
          <Typography variant="h3" style={{ marginBottom: 10 }}>
            Pick up where you left off
          </Typography>
          <View style={styles.recentsRow}>
            {recents.map((r) => (
              <Card
                key={`${r.type}-${r.id}`}
                onPress={() =>
                  router.push(r.type === "lesson" ? `/lesson/${r.id}` : `/passage/${r.id}`)
                }
                padding={12}
                style={{ flexBasis: "47%", flexGrow: 1 }}
              >
                <Typography variant="caption" muted>
                  {r.type === "lesson" ? "GRAMMAR" : "READING"}
                  {r.level ? ` · ${r.level}` : ""}
                </Typography>
                <Typography variant="label" style={{ marginTop: 6 }} numberOfLines={2}>
                  {r.title}
                </Typography>
              </Card>
            ))}
          </View>
          <View style={{ height: 16 }} />
        </>
      )}

      {/* Readiness overview */}
      <Typography variant="h3" style={{ marginBottom: 10 }}>
        {currentLevel} readiness
      </Typography>
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.readinessHeader}>
          <View style={{ flex: 1 }}>
            <Typography variant="h2" style={{ color: colors.primary }}>
              {readiness.score}%
            </Typography>
            <Typography variant="caption" muted style={{ marginTop: 2 }}>
              {readiness.state === "learning" && "Building confidence"}
              {readiness.state === "test_recommended" &&
                `Nearly ready for the ${nextLevel ?? currentLevel} check`}
              {readiness.state === "passed_but_can_continue" && "Ready to advance"}
            </Typography>
          </View>
        </View>
        <View style={{ height: 8 }} />
        <ProgressBar value={readiness.score} max={100} color={colors.primary} />
        <View style={{ height: 12 }} />
        {readiness.breakdown.map((b) => (
          <View key={b.category} style={{ marginBottom: 8 }}>
            <View style={styles.progressLabelRow}>
              <Typography variant="label">{CATEGORY_LABEL[b.category]}</Typography>
              <Typography variant="caption" muted>
                {b.percentage}%
              </Typography>
            </View>
            <ProgressBar value={b.percentage} max={100} color={colors.secondary} />
          </View>
        ))}
      </Card>

      {/* Level state actions */}
      <Card style={{ marginBottom: 16 }}>
        <Typography variant="caption" muted>
          {currentLevel.toUpperCase()}
        </Typography>
        <Typography variant="body" style={{ marginTop: 4, marginBottom: 12 }}>
          {stateMessage}
        </Typography>
        {readiness.state === "learning" && (
          <Card variant="muted" padding={12} onPress={() => router.push("/(tabs)/exercises")}>
            <Typography variant="label">Keep practicing this level</Typography>
          </Card>
        )}
        {readiness.state === "test_recommended" && (
          <View style={{ gap: 8 }}>
            <Typography variant="caption" muted>
              You look ready for the {nextLevel ?? currentLevel} check.
            </Typography>
            <Card
              variant="primary"
              padding={12}
              onPress={() => router.push("/level-check" as never)}
            >
              <Typography variant="label">Take level check</Typography>
            </Card>
            <Card variant="muted" padding={12} onPress={() => router.push("/(tabs)/exercises")}>
              <Typography variant="label">Keep practicing {currentLevel}</Typography>
            </Card>
            {readiness.weakSpots[0] && (
              <Card
                variant="muted"
                padding={12}
                onPress={() =>
                  router.push("/practice/session?mode=weak_spots" as never)
                }
              >
                <Typography variant="label">
                  Practice weak spots: {CATEGORY_LABEL[readiness.weakSpots[0]]}
                </Typography>
              </Card>
            )}
          </View>
        )}
        {readiness.state === "passed_but_can_continue" && (
          <View style={{ gap: 8 }}>
            {nextLevel && (
              <Card variant="primary" padding={12} onPress={() => router.push("/(tabs)/exercises")}>
                <Typography variant="label">Move to next level: {nextLevel}</Typography>
              </Card>
            )}
            <Card variant="muted" padding={12} onPress={() => router.push("/(tabs)/exercises")}>
              <Typography variant="label">Continue current level</Typography>
            </Card>
            {nextLevel && (
              <Card variant="muted" padding={12} onPress={() => router.push("/(tabs)/exercises")}>
                <Typography variant="label">Mix current + next level</Typography>
              </Card>
            )}
          </View>
        )}
      </Card>

      {/* Quick actions */}
      <Typography variant="h3" style={{ marginBottom: 10 }}>
        Jump in
      </Typography>
      <View style={styles.quickGrid}>
        <QuickAction icon="layers" label="Flashcards" onPress={() => router.push("/flashcards")} />
        <QuickAction icon="edit-3" label="Exercises" onPress={() => router.push("/(tabs)/exercises")} />
        <QuickAction icon="book-open" label="Reading" onPress={() => router.push("/(tabs)/reading")} />
        <QuickAction icon="book" label="Vocabulary" onPress={() => router.push("/(tabs)/vocabulary")} />
      </View>
    </ScrollView>
  );
}

function ProgressRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <View>
      <View style={styles.progressLabelRow}>
        <Typography variant="label">{label}</Typography>
        <Typography variant="caption" muted>
          {value}/{max}
        </Typography>
      </View>
      <ProgressBar value={value} max={max} color={color} />
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Card onPress={onPress} style={{ flexBasis: "47%", flexGrow: 1 }} padding={14}>
      <View style={[styles.quickIcon, { backgroundColor: colors.primary + "20" }]}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <Typography variant="label" style={{ marginTop: 10 }}>
        {label}
      </Typography>
    </Card>
  );
}

function greetingForHour(hour: number, lang: "sv" | "en"): string {
  if (lang === "sv") {
    if (hour < 12) return "God morgon";
    if (hour < 18) return "Hola";
    return "Buenas tardes";
  }
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Hola";
  return "Buenas tardes";
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  streakIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  recentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  readinessHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
});
