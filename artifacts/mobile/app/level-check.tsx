import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  buildLevelCheckSession,
  evaluateLevelCheck,
  getLevelCheckBlueprint,
  getLevelCheckCopy,
  type LevelCheckAnswer,
  type LevelCheckResult,
  type LevelCheckSession,
} from "@workspace/level-check";
import { getNextLevel, type Level } from "@workspace/readiness";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import {
  buildAllPracticeItems,
  type MobilePracticePayload,
} from "@/lib/practiceItems";

const PASSED_KEY = (userId: string, level: string) =>
  `murci.passedLevelCheck.${userId}.${level}`;

export default function LevelCheckScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ level?: string }>();
  const { user, userId, updateProfile } = useAuth();

  const userLevel = (user?.level ?? "A1") as Level;
  const requestedLevel = ((params.level as Level | undefined) ?? userLevel) as Level;
  const blueprint = getLevelCheckBlueprint(requestedLevel);

  const allItems = useMemo(() => buildAllPracticeItems(), []);

  const [started, setStarted] = useState(false);
  const [session, setSession] = useState<LevelCheckSession<MobilePracticePayload> | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<LevelCheckAnswer[]>([]);
  const [result, setResult] = useState<LevelCheckResult | null>(null);

  useEffect(() => {
    if (started && blueprint && !session) {
      const built = buildLevelCheckSession<MobilePracticePayload>({
        blueprint,
        items: allItems,
      });
      setSession(built);
    }
  }, [started, blueprint, session, allItems]);

  if (!blueprint) {
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="body" muted center>
            No level check is available for {requestedLevel} yet. Keep practicing —
            more are coming.
          </Typography>
          <Pressable
            onPress={() => router.back()}
            style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
          >
            <Typography variant="label">Back</Typography>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // ─── Intro ────────────────────────────────────────────────────
  if (!started) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
          <Typography variant="caption" muted>
            Back
          </Typography>
        </Pressable>
        <ScrollView style={{ marginTop: 8 }}>
          <Card padding={18}>
            <View style={styles.headerRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="clipboard" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="h2">{blueprint.title.en}</Typography>
                <Typography variant="caption" muted style={{ marginTop: 4 }}>
                  {blueprint.description.en}
                </Typography>
              </View>
            </View>

            <View style={{ marginTop: 18 }}>
              {blueprint.sections.map((s) => (
                <View key={s.id} style={styles.sectionRow}>
                  <Typography variant="body">{s.label.en}</Typography>
                  <Typography variant="caption" muted>
                    {s.count} {s.count === 1 ? "item" : "items"}
                  </Typography>
                </View>
              ))}
            </View>

            <Typography variant="caption" muted style={{ marginTop: 14 }}>
              Pass threshold ≈ {Math.round(blueprint.passThreshold * 100)}%. You can
              exit any time — this is never required.
            </Typography>

            <Pressable
              onPress={() => setStarted(true)}
              style={[styles.btn, { backgroundColor: colors.primary, marginTop: 16 }]}
            >
              <Typography variant="label" color="#fff">
                Start level check
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/practice" as never)}
              style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
            >
              <Typography variant="label">Keep practicing instead</Typography>
            </Pressable>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────
  if (!session) {
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="body" muted>
            Preparing your level check…
          </Typography>
        </View>
      </Screen>
    );
  }

  // ─── Empty guard ──────────────────────────────────────────────
  if (session.items.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="body" muted center>
            Not enough content available for this level check yet.
          </Typography>
          <Pressable
            onPress={() => router.back()}
            style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
          >
            <Typography variant="label">Back</Typography>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // ─── Result ───────────────────────────────────────────────────
  if (result) {
    const nextLevel = getNextLevel(result.level);
    const copy = getLevelCheckCopy(result, "en", nextLevel);
    const moveUp = async () => {
      if (!nextLevel) return;
      try {
        await updateProfile({ level: nextLevel });
      } catch {
        /* optimistic */
      }
      router.replace("/(tabs)" as never);
    };
    return (
      <Screen>
        <ScrollView>
          <Card padding={18}>
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: result.passed ? "#22c55e20" : "#f59e0b20",
                  },
                ]}
              >
                <Feather
                  name={result.passed ? "check-circle" : "alert-circle"}
                  size={22}
                  color={result.passed ? "#16a34a" : "#d97706"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="h2">{copy.headline}</Typography>
                <Typography variant="caption" muted style={{ marginTop: 4 }}>
                  {copy.body}
                </Typography>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              {result.sections.map((s) => (
                <View key={s.sectionId} style={{ marginBottom: 10 }}>
                  <View style={styles.sectionRow}>
                    <Typography variant="label">
                      {s.label.en}
                      {s.belowMinimum ? "  ⚠" : ""}
                    </Typography>
                    <Typography variant="caption" muted>
                      {s.correct}/{s.total} ({Math.round(s.accuracy * 100)}%)
                    </Typography>
                  </View>
                  <ProgressBar value={s.accuracy * 100} max={100} color={colors.primary} />
                </View>
              ))}
            </View>

            {result.strengths.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Typography variant="caption" muted>
                  STRENGTHS
                </Typography>
                <Typography variant="body">
                  {result.strengths.map((s) => s.label.en).join(", ")}
                </Typography>
              </View>
            )}
            {result.focusAreas.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Typography variant="caption" muted>
                  FOCUS AREAS
                </Typography>
                <Typography variant="body">
                  {result.focusAreas.map((s) => s.label.en).join(", ")}
                </Typography>
              </View>
            )}

            <View style={{ marginTop: 18, gap: 8 }}>
              {result.passed ? (
                <>
                  {nextLevel && (
                    <Pressable
                      onPress={moveUp}
                      style={[styles.btn, { backgroundColor: colors.primary }]}
                    >
                      <Typography variant="label" color="#fff">
                        {copy.passedActions.moveUp}
                      </Typography>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => router.replace("/practice" as never)}
                    style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <Typography variant="label">{copy.passedActions.continue}</Typography>
                  </Pressable>
                  {nextLevel && (
                    <Pressable
                      onPress={() =>
                        router.replace("/practice/session?mode=challenge" as never)
                      }
                      style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
                    >
                      <Typography variant="label">{copy.passedActions.mix}</Typography>
                    </Pressable>
                  )}
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() =>
                      router.replace("/practice/session?mode=weak_spots" as never)
                    }
                    style={[styles.btn, { backgroundColor: colors.primary }]}
                  >
                    <Typography variant="label" color="#fff">
                      {copy.failedActions.practiceWeak}
                    </Typography>
                  </Pressable>
                  <Pressable
                    onPress={() => router.replace("/(tabs)" as never)}
                    style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <Typography variant="label">{copy.failedActions.tryLater}</Typography>
                  </Pressable>
                  <Pressable
                    onPress={() => router.replace("/practice" as never)}
                    style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
                  >
                    <Typography variant="label">{copy.failedActions.continue}</Typography>
                  </Pressable>
                </>
              )}
            </View>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  // ─── Test runner ──────────────────────────────────────────────
  const current = session.items[index];
  if (!current) return null;
  const p = current.item.payload;
  const section = blueprint.sections[current.sectionIndex];
  const progress = ((index + 1) / session.items.length) * 100;

  const submit = async () => {
    if (picked == null) return;
    const ok = picked === p.answer;
    const next = [...answers, { itemIndex: index, correct: ok }];
    setAnswers(next);
    if (index + 1 >= session.items.length) {
      const evald = evaluateLevelCheck(session, next);
      setResult(evald);
      if (evald.passed && userId) {
        try {
          await AsyncStorage.setItem(PASSED_KEY(userId, evald.level), "1");
        } catch {
          /* ignore */
        }
      }
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const exit = () => {
    Alert.alert(
      "Exit level check?",
      "You can start over any time — your progress in regular practice is unaffected.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  return (
    <Screen>
      <Pressable onPress={exit} style={styles.backRow}>
        <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        <Typography variant="caption" muted>
          Exit
        </Typography>
      </Pressable>

      <View style={{ marginTop: 8, marginBottom: 12 }}>
        <View style={styles.metaRow}>
          <Typography variant="caption" muted>
            {index + 1} / {session.items.length} · {section.label.en}
          </Typography>
          <Typography variant="caption" muted>
            {session.level}
          </Typography>
        </View>
        <ProgressBar value={progress} max={100} />
      </View>

      <Card padding={18}>
        <Typography variant="h3" style={{ marginBottom: 14 }}>
          {p.prompt.en}
        </Typography>
        <View style={{ gap: 8 }}>
          {p.options.map((opt) => {
            const selected = picked === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setPicked(opt)}
                style={[
                  styles.opt,
                  {
                    backgroundColor: selected ? colors.primary + "22" : colors.background,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Typography variant="body">{opt}</Typography>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={submit}
          disabled={!picked}
          style={[
            styles.btn,
            {
              backgroundColor: picked ? colors.primary : colors.muted,
              marginTop: 16,
            },
          ]}
        >
          <Typography variant="label" color={picked ? "#fff" : undefined}>
            {index + 1 >= session.items.length ? "Finish" : "Next"}
          </Typography>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  opt: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
});
