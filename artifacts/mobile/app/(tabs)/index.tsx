import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface DashboardData {
  streak: { currentStreak: number; longestStreak: number; lastActiveDate: string } | null;
  progress: { category: string; completed: number; total: number }[];
  lastActivity: { exerciseType: string; exercisePath: string; exerciseLabel: string } | null;
  vocabCount: number;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [streaksRes, progressRes, vocabRes] = await Promise.all([
        api.streaks.get().catch(() => ({ streak: null, activityLog: [] })),
        api.progress.get().catch(() => ({ progress: [], lastActivity: null })),
        api.vocabulary.get().catch(() => ({ words: [] })),
      ]);
      setData({
        streak: streaksRes.streak as DashboardData["streak"],
        progress: progressRes.progress ?? [],
        lastActivity: progressRes.lastActivity as DashboardData["lastActivity"],
        vocabCount: (vocabRes.words ?? []).length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
  const grammarRow = data?.progress.find((p) => p.category === "grammar");
  const vocabRow = data?.progress.find((p) => p.category === "vocabulary");

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

      {/* Progress overview */}
      <Typography variant="h3" style={{ marginBottom: 10 }}>
        Your progress
      </Typography>
      <Card style={{ marginBottom: 16 }}>
        <ProgressRow
          label="Grammar"
          value={grammarRow?.completed ?? 0}
          max={grammarRow?.total || 1}
          color={colors.primary}
        />
        <View style={{ height: 12 }} />
        <ProgressRow
          label="Vocabulary"
          value={vocabRow?.completed ?? data?.vocabCount ?? 0}
          max={(vocabRow?.total ?? 0) || Math.max(20, data?.vocabCount ?? 0)}
          color={colors.secondary}
        />
        <View style={{ height: 12 }} />
        <ProgressRow
          label="Saved words"
          value={data?.vocabCount ?? 0}
          max={Math.max(20, data?.vocabCount ?? 0)}
          color={colors.accent}
        />
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
});
