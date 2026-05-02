import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  buildPracticeSession,
  EMPTY_STATE_MESSAGE,
  PRACTICE_MODES,
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
  type MobilePracticePayload,
} from "@/lib/practiceItems";

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

  const allItems = useMemo(() => buildAllPracticeItems(), []);
  const [session, setSession] = useState<PracticeSession<MobilePracticePayload> | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const start = (mode: PracticeMode) => {
    const built = buildPracticeSession<MobilePracticePayload>({
      mode,
      level: userLevel,
      items: allItems,
    });
    setSession(built);
    setIndex(0);
    setPicked(null);
    setRevealed(false);
    setCorrect(0);
    setDone(false);
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

  if (done) {
    const accuracy = Math.round((correct / session.items.length) * 100);
    return (
      <Screen>
        <View style={styles.center}>
          <Typography variant="h2" center>
            Nice work!
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6 }}>
            {correct} / {session.items.length} ({accuracy}%)
          </Typography>
          <Pressable
            onPress={() => start(session.mode)}
            style={[styles.btn, { backgroundColor: colors.primary }]}
          >
            <Typography variant="label" color="#fff">
              New session
            </Typography>
          </Pressable>
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
    if (picked === p.answer) setCorrect((c) => c + 1);
    setRevealed(true);
  };
  const next = () => {
    if (index + 1 >= session.items.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
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
                style={[
                  styles.opt,
                  { backgroundColor: bg, borderColor: bd },
                ]}
              >
                <Typography variant="body">{opt}</Typography>
              </Pressable>
            );
          })}
        </View>
        {revealed && p.explanation ? (
          <Typography
            variant="caption"
            muted
            style={{ marginTop: 12 }}
          >
            {p.explanation.en}
          </Typography>
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
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
});
