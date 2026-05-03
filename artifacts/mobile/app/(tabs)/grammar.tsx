import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { loadGrammarLessons } from "@/lib/contentCache";
import type { GrammarLesson, Level } from "@workspace/learning-content";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface LessonProgress {
  completed: boolean;
  bestScore: number;
  attempts: number;
}

export default function GrammarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userLevel = (user?.level ?? "A1") as Level;
  const lang = user?.learningFrom ?? "sv";

  const [activeLevel, setActiveLevel] = useState<Level>(userLevel);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [allLessons, setAllLessons] = useState<GrammarLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveLevel(userLevel);
  }, [userLevel]);

  const load = useCallback(async () => {
    try {
      const [progressRes, lessonsRes] = await Promise.all([
        api.progress.getGrammarProgress().catch(() => ({ grammarProgress: [] })),
        loadGrammarLessons(),
      ]);
      const map: Record<string, LessonProgress> = {};
      for (const row of progressRes.grammarProgress ?? []) {
        map[row.lessonId] = {
          completed: row.completed,
          bestScore: row.bestScore,
          attempts: row.attempts,
        };
      }
      setProgress(map);
      setAllLessons(lessonsRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const lessons = useMemo(
    () => allLessons.filter((l) => l.level === activeLevel),
    [allLessons, activeLevel]
  );

  const completed = useMemo(
    () => lessons.filter((l) => progress[l.id]?.completed).length,
    [lessons, progress]
  );

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top }),
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <LoadingState fullscreen label="Loading lessons…" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Typography variant="h2">Grammar</Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          {lang === "sv" ? "Grammatiklektioner från A1 till C2" : "Lessons from A1 to C2"}
        </Typography>

        <View style={styles.levelRow}>
          {LEVELS.map((lvl) => {
            const active = activeLevel === lvl;
            return (
              <Card
                key={lvl}
                variant={active ? "primary" : "default"}
                padding={10}
                onPress={() => setActiveLevel(lvl)}
                style={{ flexBasis: "15%", flexGrow: 1, alignItems: "center" } as never}
              >
                <Typography
                  variant="label"
                  style={{ color: active ? colors.primary : colors.foreground }}
                >
                  {lvl}
                </Typography>
              </Card>
            );
          })}
        </View>

        <View style={styles.progressRow}>
          <Typography variant="caption" muted>
            {lessons.length === 0
              ? "No lessons yet"
              : `${completed}/${lessons.length} completed`}
          </Typography>
        </View>
        <ProgressBar
          value={completed}
          max={Math.max(1, lessons.length)}
          style={{ marginTop: 4, marginBottom: 12 }}
        />
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === "web" ? 100 : 80,
          gap: 10,
        }}
      >
        {lessons.length === 0 ? (
          <Card>
            <Typography variant="body" muted center>
              No grammar lessons for level {activeLevel} yet. Try a different
              level above — we're adding new lessons regularly.
            </Typography>
          </Card>
        ) : (
          lessons.map((lesson) => {
            const lp = progress[lesson.id];
            return (
              <Card
                key={lesson.id}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
              >
                <View style={styles.lessonRow}>
                  <View
                    style={[
                      styles.lessonIcon,
                      {
                        backgroundColor: lp?.completed
                          ? colors.success + "30"
                          : colors.primary + "20",
                      },
                    ]}
                  >
                    <Feather
                      name={lp?.completed ? "check" : "book-open"}
                      size={20}
                      color={lp?.completed ? colors.success : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="label">{lesson.title[lang]}</Typography>
                    <Typography variant="caption" muted style={{ marginTop: 2 }}>
                      {lesson.summary[lang]}
                    </Typography>
                    {lp ? (
                      <Typography variant="caption" muted style={{ marginTop: 4 }}>
                        Best: {lp.bestScore}% · {lp.attempts}{" "}
                        {lp.attempts === 1 ? "attempt" : "attempts"}
                      </Typography>
                    ) : null}
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </View>
              </Card>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  levelRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    flexWrap: "wrap",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
