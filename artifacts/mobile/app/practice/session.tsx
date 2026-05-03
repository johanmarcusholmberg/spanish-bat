import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  buildPracticeSession,
  EMPTY_STATE_MESSAGE,
  PRACTICE_MODES,
  friendlySkillName,
  friendlySubskillName,
  type PracticeMode,
  type PracticeSession,
} from "@workspace/practice";

const VALID_MODES = new Set<string>(PRACTICE_MODES.map((m) => m.mode));
function coerceMode(input: unknown): PracticeMode {
  return typeof input === "string" && VALID_MODES.has(input)
    ? (input as PracticeMode)
    : "quick";
}

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import {
  buildAllPracticeItems,
  aiItemsToPracticeItems,
  type MobilePracticeItem,
  type MobilePracticePayload,
} from "@/lib/practiceItems";
import {
  savedItemsToPracticeItems,
  persistedIdFromLocalId,
} from "@/lib/savedPracticeItems";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { useDailySessionLimit } from "@/hooks/useDailySessionLimit";
import { api } from "@/lib/api";
import { learningFeedbackService } from "@/lib/learningFeedbackService";
import {
  sessionStorageService,
  type ActiveSessionState,
} from "@/lib/sessionStorageService";
import {
  cacheTodaySession,
  setOfflineFallbackSession,
} from "@/lib/learningCacheService";

export default function PracticeSessionScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { user } = useAuth();
  const userLevel = (user?.level ?? "A1") as
    | "A1"
    | "A2"
    | "B1"
    | "B2"
    | "C1"
    | "C2";

  const localItems = useMemo(() => buildAllPracticeItems(), []);
  const [savedItems, setSavedItems] = useState<MobilePracticeItem[]>([]);
  const [reported, setReported] = useState<Record<string, string>>({});
  const allItems = useMemo(() => {
    const ids = new Set(localItems.map((i) => i.id));
    return [...localItems, ...savedItems.filter((i) => !ids.has(i.id))];
  }, [localItems, savedItems]);
  const { stats, recordAttempt, weakSpots } = usePracticeStats();
  const dailyLimit = useDailySessionLimit();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await api.practiceItems.list();
        if (cancelled) return;
        setSavedItems(savedItemsToPracticeItems(resp.items, "en"));
      } catch {
        // best effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [session, setSession] = useState<PracticeSession<MobilePracticePayload> | null>(
    null,
  );
  const [showIntro, setShowIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const activeSessionRef = React.useRef<ActiveSessionState | null>(null);

  const start = (mode: PracticeMode, resumeFrom?: ActiveSessionState | null) => {
    const built = buildPracticeSession<MobilePracticePayload>({
      mode,
      level: userLevel,
      items: allItems,
      stats,
    });
    setSession(built);
    if (resumeFrom && resumeFrom.mode === mode && resumeFrom.totalSteps === built.items.length) {
      setShowIntro(false);
      setIndex(Math.min(resumeFrom.stepIndex, built.items.length - 1));
      setCorrect(resumeFrom.results.filter((r) => r.correct).length);
      activeSessionRef.current = resumeFrom;
    } else {
      setShowIntro(true);
      setIndex(0);
      setCorrect(0);
      // Count this against the daily session limit (Free plan cap).
      // Premium users still get the counter — it's harmless.
      void dailyLimit.recordStart();
      const fresh = sessionStorageService.newSession({
        sessionId: `${mode}-${Date.now()}`,
        mode,
        level: userLevel,
        totalSteps: built.items.length,
        label: `Practice — ${mode}`,
      });
      activeSessionRef.current = fresh;
      void sessionStorageService.saveSessionProgress(fresh);
      // Cache for offline foundation — best effort.
      void cacheTodaySession({
        mode,
        level: userLevel,
        itemIds: built.items.map((i) => i.id),
      }).catch(() => {});
      void setOfflineFallbackSession({
        itemIds: built.items.slice(0, 5).map((i) => i.id),
        capturedAt: Date.now(),
      }).catch(() => {});
    }
    setPicked(null);
    setRevealed(false);
    setDone(false);
    void enrichFromAI(mode);
  };

  const enrichFromAI = async (mode: PracticeMode) => {
    try {
      const recentMistakes = (stats.recentMistakeIds ?? []).slice(0, 5);
      const resp = await api.practice.generate({
        userLevel,
        practiceMode: mode,
        count: 6,
        interfaceLanguage: "en",
        previousMistakes: recentMistakes,
      });
      if (!resp?.items?.length) return;
      const newItems = aiItemsToPracticeItems(resp.items, "en");
      if (newItems.length === 0) return;
      setSession((prev) => {
        if (!prev || prev.mode !== mode) return prev;
        if (revealed || done || index > 0) return prev;
        const existingIds = new Set(prev.items.map((i) => i.id));
        const fresh = newItems.filter((i) => !existingIds.has(i.id));
        if (fresh.length === 0) return prev;
        return { ...prev, items: [...prev.items, ...fresh] };
      });
    } catch {
      // silent
    }
  };

  useEffect(() => {
    start(coerceMode(params.mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.mode]);

  if (allItems.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="body" muted center>
            {EMPTY_STATE_MESSAGE}
          </Typography>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Typography variant="label" color={colors.primary}>
              Back
            </Typography>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="body" muted>
            Preparing your session…
          </Typography>
        </View>
      </Screen>
    );
  }

  // Intro screen
  if (showIntro && session.items.length > 0) {
    const meta = PRACTICE_MODES.find((m) => m.mode === session.mode);
    const focusList = session.focusSkills.slice(0, 3).map((s) => friendlySkillName(s, "en"));
    const subFocus = (weakSpots ?? []).slice(0, 2).map((w) => friendlySubskillName(w.subskill, "en"));
    return (
      <Screen>
        <Pressable onPress={() => router.replace("/practice" as never)} style={styles.backRow}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
          <Typography variant="caption" muted>
            Change mode
          </Typography>
        </Pressable>
        <Card padding={20} style={{ marginTop: 12 }}>
          <Typography variant="caption" muted style={{ textTransform: "uppercase", letterSpacing: 1 }}>
            Today's session
          </Typography>
          <Typography variant="h2" style={{ marginTop: 4 }}>
            {meta?.title ?? "Practice"}
          </Typography>
          <Typography variant="body" style={{ marginTop: 10 }}>
            {`Today we'll practice ${focusList.join(", ") || "a balanced mix"}${
              subFocus.length ? ` with a focus on ${subFocus.join(" and ")}` : ""
            } because it's useful for your ${userLevel} progress.`}
          </Typography>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
              <Typography variant="caption" muted style={{ fontSize: 10 }}>
                QUESTIONS
              </Typography>
              <Typography variant="h3" style={{ marginTop: 2 }}>
                {session.items.length}
              </Typography>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
              <Typography variant="caption" muted style={{ fontSize: 10 }}>
                TIME
              </Typography>
              <Typography variant="h3" style={{ marginTop: 2 }}>
                ~{meta?.estimatedMinutes ?? 3} min
              </Typography>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
              <Typography variant="caption" muted style={{ fontSize: 10 }}>
                LEVEL
              </Typography>
              <Typography variant="h3" style={{ marginTop: 2 }}>
                {userLevel}
              </Typography>
            </View>
          </View>

          {focusList.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Typography variant="caption" muted style={{ marginBottom: 6, fontSize: 10, letterSpacing: 1 }}>
                FOCUS SKILLS
              </Typography>
              <View style={styles.chipRow}>
                {focusList.map((f) => (
                  <View
                    key={f}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" },
                    ]}
                  >
                    <Typography variant="caption" style={{ color: colors.primary, fontWeight: "600" }}>
                      {f}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Pressable
            onPress={() => setShowIntro(false)}
            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 18 }]}
          >
            <Feather name="play-circle" size={18} color="#fff" />
            <Typography variant="label" color="#fff" style={{ marginLeft: 6 }}>
              Let's go
            </Typography>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/practice" as never)}
            style={[styles.btn, { borderColor: colors.border, borderWidth: 1, marginTop: 8 }]}
          >
            <Typography variant="label">Change mode</Typography>
          </Pressable>
        </Card>
      </Screen>
    );
  }

  if (done) {
    const accuracy = Math.round((correct / session.items.length) * 100);
    const strengthened = session.focusSkills.slice(0, 3).map((s) => friendlySkillName(s, "en"));
    const repeatSoon = (weakSpots ?? [])
      .slice(0, 2)
      .map((w) => friendlySubskillName(w.subskill, "en"));
    const totalAttempted = session.items.length;
    const headline = "Nice work — today's echo practice is done.";
    const subline =
      accuracy >= 70
        ? "Take a breath, or do three more minutes — both work."
        : "Short, frequent practice sticks best.";
    return (
      <Screen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card padding={20}>
            <View style={{ alignItems: "center" }}>
              <View style={[styles.celebrate, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="award" size={28} color={colors.primary} />
              </View>
              <Typography variant="h2" center style={{ marginTop: 10 }}>
                {headline}
              </Typography>
              <Typography variant="caption" muted center style={{ marginTop: 4 }}>
                {subline}
              </Typography>
            </View>

            <View style={{ marginTop: 18, padding: 12, backgroundColor: colors.muted, borderRadius: 10 }}>
              <Typography variant="caption" muted style={{ fontSize: 10, letterSpacing: 1 }}>
                TODAY YOU PRACTICED
              </Typography>
              <Typography variant="body" style={{ marginTop: 4 }}>
                {totalAttempted} phrases · {correct} landed first try ({accuracy}%).
              </Typography>
            </View>

            {strengthened.length > 0 && (
              <View
                style={{
                  marginTop: 10,
                  padding: 12,
                  backgroundColor: "#10b98114",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#10b98133",
                }}
              >
                <Typography
                  variant="caption"
                  style={{ color: "#047857", marginBottom: 6, fontSize: 10, letterSpacing: 1 }}
                >
                  GETTING STRONGER
                </Typography>
                <View style={styles.chipRow}>
                  {strengthened.map((s) => (
                    <View
                      key={s}
                      style={[styles.chip, { backgroundColor: "#10b98122", borderColor: "#10b98144" }]}
                    >
                      <Typography variant="caption" style={{ color: "#047857", fontWeight: "600" }}>
                        {s}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {repeatSoon.length > 0 && (
              <View
                style={{
                  marginTop: 10,
                  padding: 12,
                  backgroundColor: "#f5970014",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#f5970033",
                }}
              >
                <Typography
                  variant="caption"
                  style={{ color: "#b45309", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}
                >
                  REPEAT SOON
                </Typography>
                <Typography variant="body">
                  Murci will bring {repeatSoon.join(" and ")} back tomorrow.
                </Typography>
              </View>
            )}

            <View style={{ marginTop: 10, padding: 12, backgroundColor: colors.muted, borderRadius: 10 }}>
              <Typography variant="caption" muted style={{ fontSize: 10, letterSpacing: 1 }}>
                RECOMMENDED NEXT STEP
              </Typography>
              <Typography variant="body" style={{ marginTop: 4 }}>
                {accuracy >= 70
                  ? "A few areas could use more time. Try focus areas next."
                  : "A short level practice will help it stick."}
              </Typography>
            </View>

            <Pressable
              onPress={() => router.replace("/(tabs)" as never)}
              style={[styles.btn, { backgroundColor: colors.primary, marginTop: 18 }]}
            >
              <Feather name="check" size={16} color="#fff" />
              <Typography variant="label" color="#fff" style={{ marginLeft: 6 }}>
                Done
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => start("review_previous")}
              style={[styles.btn, { borderColor: colors.border, borderWidth: 1, marginTop: 8 }]}
            >
              <Feather name="refresh-cw" size={16} color={colors.foreground} />
              <Typography variant="label" style={{ marginLeft: 6 }}>
                Continue for 3 more minutes
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => start("weak_spots")}
              style={[styles.btn, { borderColor: colors.border, borderWidth: 1, marginTop: 8 }]}
            >
              <Feather name="target" size={16} color={colors.foreground} />
              <Typography variant="label" style={{ marginLeft: 6 }}>
                Practice focus areas
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.push("/level-check" as never)}
              style={[styles.btn, { marginTop: 8 }]}
            >
              <Typography variant="label" color={colors.primary}>
                Take level check
              </Typography>
            </Pressable>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  if (session.items.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="body" muted center>
            {EMPTY_STATE_MESSAGE}
          </Typography>
          <Pressable
            onPress={() => router.replace("/practice" as never)}
            style={[styles.btn, { borderColor: colors.border, borderWidth: 1 }]}
          >
            <Typography variant="label">Change mode</Typography>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const current = session.items[index];
  if (!current) {
    setDone(true);
    return null;
  }
  const p = current.payload;
  const progress = ((index + 1) / session.items.length) * 100;

  const submit = () => {
    if (picked == null) return;
    const ok = picked === p.answer;
    if (ok) setCorrect((c) => c + 1);
    // De-dupe weak-spot/SRS updates on resume by tracking applied item ids.
    const active = activeSessionRef.current;
    const alreadyApplied = active?.appliedItemIds.includes(current.id) ?? false;
    if (!alreadyApplied) {
      recordAttempt({
        itemId: current.id,
        skill: current.skill,
        subskill: current.category,
        level: current.level,
        correct: ok,
      });
      const persistedId = persistedIdFromLocalId(current.id);
      if (persistedId) {
        void api.practiceItems.usage(persistedId, ok).catch(() => {});
      }
    }
    if (active) {
      const next: ActiveSessionState = {
        ...active,
        stepIndex: index,
        results: [
          ...active.results.filter((r) => r.itemId !== current.id),
          {
            itemId: current.id,
            picked,
            correct: ok,
            skill: current.skill,
            subskill: current.category,
            level: current.level,
            recordedAt: Date.now(),
          },
        ],
        appliedItemIds: alreadyApplied
          ? active.appliedItemIds
          : [...active.appliedItemIds, current.id],
      };
      activeSessionRef.current = next;
      void sessionStorageService.saveSessionProgress(next);
    }
    if (ok) {
      learningFeedbackService.feedbackCorrect();
    } else {
      learningFeedbackService.feedbackIncorrect();
    }
    setRevealed(true);
  };

  const reportItem = (reason: string) => {
    const persistedId = persistedIdFromLocalId(current.id);
    setReported((r) => ({ ...r, [current.id]: reason }));
    if (persistedId) {
      void api.practiceItems.report(persistedId, reason).catch(() => {});
    }
  };
  const next = () => {
    if (index + 1 >= session.items.length) {
      setDone(true);
      learningFeedbackService.feedbackSessionComplete();
      void sessionStorageService.clearCompletedSession();
      activeSessionRef.current = null;
      return;
    }
    const newIndex = index + 1;
    setIndex(newIndex);
    setPicked(null);
    setRevealed(false);
    const active = activeSessionRef.current;
    if (active) {
      const updated: ActiveSessionState = { ...active, stepIndex: newIndex };
      activeSessionRef.current = updated;
      void sessionStorageService.saveSessionProgress(updated);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        <Typography variant="caption" muted>
          Exit
        </Typography>
      </Pressable>

      <View style={{ marginTop: 8, marginBottom: 12 }}>
        <View style={styles.metaRow}>
          <Typography variant="caption" muted>
            {index + 1} / {session.items.length} · {current.skill} · {current.level}
          </Typography>
          <Typography variant="caption" muted>
            {correct} correct
          </Typography>
        </View>
        <ProgressBar value={progress} max={100} />
        <Typography
          variant="caption"
          muted
          style={{ marginTop: 6, fontStyle: "italic" }}
        >
          {session.reasonForSelection}
        </Typography>
      </View>

      <Card padding={18}>
        <Typography variant="h3" style={{ marginBottom: 14 }}>
          {p.prompt.en}
        </Typography>
        <View style={{ gap: 8 }}>
          {p.options.map((opt) => {
            const selected = picked === opt;
            const isAns = opt === p.answer;
            const bg = revealed
              ? isAns
                ? "#22c55e22"
                : selected
                  ? "#ef444422"
                  : colors.background
              : selected
                ? colors.primary + "22"
                : colors.background;
            const bd = revealed
              ? isAns
                ? "#22c55e"
                : selected
                  ? "#ef4444"
                  : colors.border
              : selected
                ? colors.primary
                : colors.border;
            return (
              <Pressable
                key={opt}
                disabled={revealed}
                onPress={() => setPicked(opt)}
                style={[styles.opt, { backgroundColor: bg, borderColor: bd }]}
              >
                <Typography variant="body">{opt}</Typography>
              </Pressable>
            );
          })}
        </View>
        {revealed && p.explanation ? (
          <Typography variant="caption" muted style={{ marginTop: 12 }}>
            {p.explanation.en}
          </Typography>
        ) : null}

        {revealed ? (
          reported[current.id] ? (
            <Typography variant="caption" muted style={{ marginTop: 12 }}>
              Thanks for the feedback!
            </Typography>
          ) : (
            <View style={{ marginTop: 12 }}>
              <Typography variant="caption" muted>
                Something off?
              </Typography>
              <View style={styles.reportRow}>
                {[
                  { value: "confusing", label: "Confusing" },
                  { value: "wrong_answer", label: "Wrong answer" },
                  { value: "too_hard", label: "Too hard" },
                  { value: "too_easy", label: "Too easy" },
                ].map((r) => (
                  <Pressable
                    key={r.value}
                    onPress={() => reportItem(r.value)}
                    style={[styles.reportChip, { borderColor: colors.border }]}
                  >
                    <Typography variant="caption">{r.label}</Typography>
                  </Pressable>
                ))}
              </View>
            </View>
          )
        ) : null}

        {!revealed ? (
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
              Check
            </Typography>
          </Pressable>
        ) : (
          <Pressable
            onPress={next}
            style={[
              styles.btn,
              { backgroundColor: colors.primary, marginTop: 16 },
            ]}
          >
            <Typography variant="label" color="#fff">
              {index + 1 >= session.items.length ? "Finish" : "Next"}
            </Typography>
          </Pressable>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
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
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  reportRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  reportChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  celebrate: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
