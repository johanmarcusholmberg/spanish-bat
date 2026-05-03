import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import EchoSteps from "@/components/EchoSteps";
import EchoRecorder from "@/components/EchoRecorder";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { learningFeedbackService } from "@/lib/learningFeedbackService";
import { getEchoPhrases, type EchoPhrase } from "@workspace/echo-content";

/**
 * /learn/echo — a focused, mobile-native Echo session.
 *
 * One card. One phrase. One clear action: echo it. Confidence updates feed
 * back through the learningFeedbackService so haptics stay consistent.
 *
 * Content parity with web: phrases come from the shared `@workspace/echo-content`
 * package and are filtered to the user's CEFR level, so a B1 learner on mobile
 * sees B1-appropriate sentences instead of the previous hard-coded A1/A2 list.
 * Per-session shuffle keeps the order fresh without making it feel random within
 * a single sitting (we only shuffle once on mount).
 */

export default function EchoLearnScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";
  const level = user?.level ?? "A1";

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [echoed, setEchoed] = useState(0);
  // Bumping `sessionSeed` triggers a fresh Fisher–Yates shuffle, so each
  // "Echo again" feels like a new session instead of replaying the same
  // order. Initial value 0 = first shuffle on mount.
  const [sessionSeed, setSessionSeed] = useState(0);

  const phrases: EchoPhrase[] = useMemo(() => {
    const pool = getEchoPhrases(level, 5);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
    // sessionSeed intentionally part of deps so restart yields new order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, sessionSeed]);

  const current = phrases[index];
  const progress = phrases.length > 0 ? ((index + 1) / phrases.length) * 100 : 0;
  const translation = current ? (lang === "sv" ? current.sv : current.en) : "";

  const advance = () => {
    setEchoed((n) => n + 1);
    if (index + 1 >= phrases.length) {
      setDone(true);
      learningFeedbackService.feedbackSessionComplete();
      return;
    }
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setIndex(0);
    setDone(false);
    setEchoed(0);
    setSessionSeed((n) => n + 1);
  };

  if (done) {
    return (
      <Screen>
        <ScrollView showsVerticalScrollIndicator={false} testID="echo-complete">
          <Card padding={20}>
            <View style={{ alignItems: "center" }}>
              <View style={[styles.celebrate, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="award" size={28} color={colors.primary} />
              </View>
              <Typography variant="h2" center style={{ marginTop: 10 }}>
                {lang === "sv" ? "Bra ekat!" : "Nice echoing!"}
              </Typography>
              <Typography variant="caption" muted center style={{ marginTop: 4 }}>
                {lang === "sv"
                  ? `${echoed} av ${phrases.length} fraser ekade`
                  : `${echoed} of ${phrases.length} phrases echoed`}
              </Typography>
              <Typography variant="caption" muted center style={{ marginTop: 4 }}>
                {lang === "sv"
                  ? "Korta, frekventa sessioner sätter sig bäst."
                  : "Short, frequent practice sticks best."}
              </Typography>
            </View>
            <Pressable
              onPress={restart}
              style={[styles.btn, { backgroundColor: colors.primary, marginTop: 18 }]}
            >
              <Feather name="refresh-cw" size={16} color={colors.primaryForeground} />
              <Typography
                variant="label"
                color={colors.primaryForeground}
                style={{ marginLeft: 6 }}
              >
                {lang === "sv" ? "Eka igen" : "Echo again"}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/practice" as never)}
              style={[styles.btn, { borderColor: colors.border, borderWidth: 1, marginTop: 8 }]}
            >
              <Typography variant="label">
                {lang === "sv" ? "Fortsätt dagens övning" : "Continue today's practice"}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/(tabs)" as never)}
              style={[styles.btn, { marginTop: 8 }]}
            >
              <Typography variant="caption" muted>
                {lang === "sv" ? "Tillbaka hem" : "Back to home"}
              </Typography>
            </Pressable>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  if (!current) return null;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        <Typography variant="caption" muted>
          {lang === "sv" ? "Avsluta" : "Exit"}
        </Typography>
      </Pressable>

      <View style={{ marginTop: 8 }}>
        <EchoSteps active="echo" />
      </View>

      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <View style={styles.metaRow}>
          <Typography variant="caption" muted>
            {index + 1} / {phrases.length}
          </Typography>
          <Typography variant="caption" muted>
            {lang === "sv" ? `Nivå ${level}` : `Level ${level}`}
          </Typography>
        </View>
        <ProgressBar value={progress} max={100} />
      </View>

      <Card padding={18}>
        <EchoRecorder
          phrase={current.es}
          translation={translation}
          onConfidence={(_level) => advance()}
        />
        <Pressable
          onPress={advance}
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 16 }]}
        >
          <Typography variant="label" color={colors.primaryForeground}>
            {index + 1 >= phrases.length ? (lang === "sv" ? "Avsluta" : "Finish") : (lang === "sv" ? "Nästa" : "Next")}
          </Typography>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  btn: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  celebrate: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
