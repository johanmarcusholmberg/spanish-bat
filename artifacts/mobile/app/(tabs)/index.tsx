import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { dashboardCache, recentLessons, type RecentLesson } from "@/lib/storage";
import {
  calculateReadiness,
  progressRowsToInputs,
  type Level,
  type ReadinessResult,
} from "@workspace/readiness";
import TodaysPracticeCard from "@/components/TodaysPracticeCard";
import EchoSteps from "@/components/EchoSteps";
import LevelReadinessCard from "@/components/LevelReadinessCard";
import { useResumableSession } from "@/hooks/useResumableSession";

const PASSED_KEY = (userId: string, level: string) =>
  `murci.passedLevelCheck.${userId}.${level}`;

interface DashboardData {
  streak: { currentStreak: number; longestStreak: number; lastActiveDate: string } | null;
  progress: { category: string; completed: number; total: number }[];
  lastActivity: { exerciseType: string; exercisePath: string; exerciseLabel: string } | null;
  vocabCount: number;
}

/**
 * Today — Phase 22 "session-first" home screen.
 *
 * Order is intentional and matches the web client:
 *   1. Greeting + Echo steps strip (recurring brand identity)
 *   2. Today's recommended practice (single primary CTA)
 *   3. Continue where you left off (if any)
 *   4. Level Readiness (warm, never-pushy)
 *   5. Streak summary
 *
 * The dense category readiness breakdown moved to the Progress tab so
 * Today stays calm.
 */
export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, userId } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [recents, setRecents] = useState<RecentLesson[]>([]);
  const [hasPassedLevelCheck, setHasPassedLevelCheck] = useState(false);
  const { activeSession, hasResumable, refresh: refreshResumable, clear: clearResumable } =
    useResumableSession();

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
      void refreshResumable();
      return () => {
        active = false;
      };
    }, [refreshResumable])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const greeting = greetingForHour(new Date().getHours(), lang);
  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top }),
  };

  if (loading && !data) {
    return (
      <View style={containerStyle}>
        <LoadingState fullscreen label={lang === "sv" ? "Laddar idag…" : "Loading today…"} />
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

  const readiness: ReadinessResult = calculateReadiness(
    currentLevel,
    progressRowsToInputs(data?.progress ?? [], {
      hasPassedLevelTest: hasPassedLevelCheck,
    }),
  );

  return (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 100 : 80 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* 1. Greeting + level badge */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Typography variant="h2">
            {greeting}, {user?.displayName?.split(" ")[0] ?? "amigo"} 👋
          </Typography>
          <Typography variant="body" muted style={{ marginTop: 2 }}>
            {lang === "sv" ? "Redo för dagens spanska?" : "Ready for today's Spanish?"}
          </Typography>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary + "30", borderColor: colors.primary }]}>
          <Typography variant="label" style={{ color: colors.primary }}>
            {user?.level ?? "A1"}
          </Typography>
        </View>
      </View>

      {/* 2. Echo identity strip */}
      <View style={{ marginBottom: 16 }}>
        <EchoSteps />
      </View>

      {/* 3. Continue today's practice (resume) */}
      {hasResumable && activeSession && (
        <Card
          variant="primary"
          onPress={() => {
            router.push({
              pathname: "/practice/session",
              params: { mode: activeSession.mode },
            } as never);
          }}
          style={{ marginBottom: 14 }}
        >
          <Typography variant="caption" muted style={{ letterSpacing: 1 }}>
            {lang === "sv" ? "FORTSÄTT DAGENS ÖVNING" : "CONTINUE TODAY'S PRACTICE"}
          </Typography>
          <Typography variant="h3" style={{ marginTop: 4 }}>
            {activeSession.label ?? `Practice — ${activeSession.mode}`}
          </Typography>
          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {lang === "sv"
              ? `Steg ${activeSession.stepIndex + 1} av ${activeSession.totalSteps}`
              : `Step ${activeSession.stepIndex + 1} of ${activeSession.totalSteps}`}
          </Typography>
          <View style={{ flexDirection: "row", marginTop: 10, gap: 16, alignItems: "center" }}>
            <Typography variant="caption" style={{ color: colors.primary, fontWeight: "600" }}>
              {lang === "sv" ? "Återuppta" : "Resume"}
            </Typography>
            <Pressable onPress={() => void clearResumable()} hitSlop={8}>
              <Typography variant="caption" muted>
                {lang === "sv" ? "Börja om" : "Start fresh"}
              </Typography>
            </Pressable>
          </View>
        </Card>
      )}

      {/* 4. Today's recommended practice */}
      <TodaysPracticeCard readinessState={readiness.state} />

      {/* 4. Continue where you left off */}
      {data?.lastActivity && (
        <Card
          variant="primary"
          onPress={() => {
            const t = data?.lastActivity?.exerciseType;
            if (t === "grammar") router.push("/(tabs)/grammar");
            else if (t === "reading") router.push("/(tabs)/reading");
            else if (t === "vocabulary") router.push("/(tabs)/vocabulary");
            else router.push("/(tabs)/exercises");
          }}
          style={{ marginBottom: 14 }}
        >
          <Typography variant="caption" muted>
            {lang === "sv" ? "FORTSÄTT LÄRA" : "CONTINUE LEARNING"}
          </Typography>
          <Typography variant="h3" style={{ marginTop: 4 }}>
            {data.lastActivity.exerciseLabel}
          </Typography>
          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {lang === "sv" ? "Tryck för att fortsätta" : "Tap to resume"}
          </Typography>
        </Card>
      )}

      {recents.length > 0 && (
        <>
          <Typography variant="h3" style={{ marginBottom: 10 }}>
            {lang === "sv" ? "Plocka upp där du slutade" : "Pick up where you left off"}
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
                  {r.type === "lesson"
                    ? lang === "sv"
                      ? "GRAMMATIK"
                      : "GRAMMAR"
                    : lang === "sv"
                      ? "LÄSNING"
                      : "READING"}
                  {r.level ? ` · ${r.level}` : ""}
                </Typography>
                <Typography variant="label" style={{ marginTop: 6 }} numberOfLines={2}>
                  {r.title}
                </Typography>
              </Card>
            ))}
          </View>
          <View style={{ height: 14 }} />
        </>
      )}

      {/* 5. Level readiness — warm, never pushy */}
      <LevelReadinessCard readiness={readiness} />

      {/* 6. Streak summary */}
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.streakRow}>
          <View style={[styles.streakIcon, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="zap" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="h3">
              {streakCount}{" "}
              {streakCount === 1
                ? lang === "sv" ? "dag" : "day"
                : lang === "sv" ? "dagar" : "days"}
            </Typography>
            <Typography variant="caption" muted>
              {lang === "sv" ? "Längst" : "Longest"}: {longestStreak}{" "}
              {longestStreak === 1
                ? lang === "sv" ? "dag" : "day"
                : lang === "sv" ? "dagar" : "days"}
            </Typography>
          </View>
          <Card
            variant="muted"
            padding={10}
            onPress={() => router.push("/(tabs)/progress")}
            style={{ borderRadius: 12 }}
          >
            <Typography variant="caption" style={{ color: colors.foreground }}>
              {lang === "sv" ? "Se framsteg" : "View progress"}
            </Typography>
          </Card>
        </View>
      </Card>
    </ScrollView>
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
    marginBottom: 14,
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
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  recentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
