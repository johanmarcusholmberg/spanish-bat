import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { AppButton } from "@/components/AppButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { RequireAuth } from "@/components/RequireAuth";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { applyRating, defaultSrsState, isDue, SrsRating, SrsState } from "@/lib/srs";
import { SEED_FLASHCARDS } from "@/lib/mockContent";

interface CardItem {
  id: string;
  spanish: string;
  translation: string;
  state: SrsState;
  isSeed: boolean;
}

export default function FlashcardsScreen() {
  return (
    <RequireAuth>
      <FlashcardsScreenInner />
    </RequireAuth>
  );
}

function FlashcardsScreenInner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [queue, setQueue] = useState<CardItem[]>([]);
  const [allCards, setAllCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [sessionCounts, setSessionCounts] = useState({ correct: 0, incorrect: 0 });

  const load = useCallback(async () => {
    setError(null);
    try {
      const [vocabRes, srsRes] = await Promise.all([
        api.vocabulary.get().catch(() => ({ words: [] })),
        api.flashcardSrs.get().catch(() => ({ data: [] })),
      ]);

      const srsByCard = new Map<string, SrsState>();
      for (const row of (srsRes.data ?? []) as Record<string, unknown>[]) {
        const cardId = row.cardId as string | undefined;
        if (!cardId) continue;
        srsByCard.set(cardId, {
          reviewState: ((row.reviewState as SrsState["reviewState"]) ?? "new"),
          intervalDays: Number(row.intervalDays ?? 0),
          easeFactor: Number(row.easeFactor ?? 2.5),
          reviewCount: Number(row.reviewCount ?? 0),
          correctCount: Number(row.correctCount ?? 0),
          incorrectCount: Number(row.incorrectCount ?? 0),
          nextReview: String(row.nextReview ?? new Date().toISOString()),
        });
      }

      const live: CardItem[] = ((vocabRes.words ?? []) as Record<string, unknown>[])
        .map((w) => ({
          id: w.id as string,
          spanish: String(w.spanish ?? ""),
          translation: String(w.translation ?? ""),
          state: srsByCard.get(w.id as string) ?? defaultSrsState(),
          isSeed: false,
        }))
        .filter((c) => c.spanish);

      const userLevel = user?.level ?? "A1";
      const seeds: CardItem[] =
        live.length === 0
          ? SEED_FLASHCARDS.filter((c) => levelOrder(c.level) <= levelOrder(userLevel)).map(
              (c) => ({
                id: c.id,
                spanish: c.spanish,
                translation:
                  user?.learningFrom === "en" ? c.translation.en : c.translation.sv,
                state: defaultSrsState(),
                isSeed: true,
              })
            )
          : [];

      const cards = live.length > 0 ? live : seeds;
      const due = cards.filter((c) => isDue(c.state));
      const initial = (due.length > 0 ? due : cards).slice(0, 30);

      setAllCards(cards);
      setQueue(initial);
      setDoneCount(0);
      setSessionCounts({ correct: 0, incorrect: 0 });
      setRevealed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }, [user?.level, user?.learningFrom]);

  useEffect(() => {
    load();
  }, [load]);

  const totalForSession = useMemo(() => doneCount + queue.length, [doneCount, queue.length]);
  const current = queue[0] ?? null;

  const onRate = async (rating: SrsRating) => {
    if (!current) return;
    const newState = applyRating(current.state, rating);
    const correct = rating !== "again";

    if (!current.isSeed) {
      try {
        await api.flashcardSrs.upsert({
          cardId: current.id,
          reviewState: newState.reviewState,
          nextReview: newState.nextReview,
          easeFactor: newState.easeFactor,
          intervalDays: newState.intervalDays,
          reviewCount: newState.reviewCount,
          correctCount: newState.correctCount,
          incorrectCount: newState.incorrectCount,
        });
      } catch {
        // best-effort: persistence failures shouldn't block the session
      }
    }

    setSessionCounts((c) => ({
      correct: c.correct + (correct ? 1 : 0),
      incorrect: c.incorrect + (correct ? 0 : 1),
    }));

    if (rating === "again") {
      // reinsert later in the queue
      setQueue((q) => {
        const [head, ...rest] = q;
        const insertAt = Math.min(rest.length, 3);
        const updated = { ...head, state: newState };
        return [...rest.slice(0, insertAt), updated, ...rest.slice(insertAt)];
      });
    } else {
      setQueue((q) => q.slice(1));
      setDoneCount((d) => d + 1);
    }
    setRevealed(false);
  };

  const headerOptions = {
    title: "Flashcards",
    headerShown: true,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.foreground,
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <LoadingState fullscreen label="Preparing your cards…" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 16 }}>
          <ErrorState message={error} onRetry={load} />
        </View>
      </>
    );
  }

  if (allCards.length === 0) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 16 }}>
          <EmptyState
            icon="layers"
            title="No cards to review"
            description="Save vocabulary first, then come back to review with spaced repetition."
            actionLabel="Browse exercises"
            onAction={() => router.replace("/(tabs)/exercises")}
          />
        </View>
      </>
    );
  }

  if (!current) {
    const total = sessionCounts.correct + sessionCounts.incorrect;
    const pct = total === 0 ? 0 : Math.round((sessionCounts.correct / total) * 100);
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: 16,
            paddingTop: insets.top + 16,
          }}
        >
          <Card variant="primary" padding={20}>
            <Typography variant="h2" center>
              Session complete 🎉
            </Typography>
            <Typography variant="body" muted center style={{ marginTop: 6 }}>
              {sessionCounts.correct} correct · {sessionCounts.incorrect} missed · {pct}% accuracy
            </Typography>
          </Card>
          <View style={{ height: 16 }} />
          <AppButton title="Review again" onPress={load} size="lg" />
          <View style={{ height: 8 }} />
          <AppButton
            title="Back to dashboard"
            onPress={() => router.replace("/")}
            variant="outline"
            size="md"
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: 16,
          paddingTop: insets.top + 8,
          paddingBottom: 24 + insets.bottom,
        }}
      >
        <View style={styles.progressRow}>
          <Typography variant="caption" muted>
            Card {doneCount + 1} / {totalForSession}
          </Typography>
          <Typography variant="caption" muted>
            {sessionCounts.correct} ✓ · {sessionCounts.incorrect} ✗
          </Typography>
        </View>
        <ProgressBar
          value={doneCount}
          max={Math.max(1, totalForSession)}
          style={{ marginTop: 6, marginBottom: 16 }}
        />

        <Pressable style={{ flex: 1 }} onPress={() => setRevealed((r) => !r)}>
          <Card padding={24} style={styles.cardFace}>
            <Typography variant="caption" muted style={{ alignSelf: "flex-start" }}>
              {revealed ? "TRANSLATION" : "TAP TO REVEAL"}
            </Typography>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h1" center>
                {revealed ? current.translation : current.spanish}
              </Typography>
              {revealed ? (
                <Typography variant="body" muted center style={{ marginTop: 12 }}>
                  ({current.spanish})
                </Typography>
              ) : null}
            </View>
            <View style={styles.flipHint}>
              <Feather name="rotate-cw" size={14} color={colors.mutedForeground} />
              <Typography variant="caption" muted>
                Tap card
              </Typography>
            </View>
          </Card>
        </Pressable>

        {revealed ? (
          <View style={styles.ratingRow}>
            <RatingButton label="Again" color={colors.destructive} onPress={() => onRate("again")} />
            <RatingButton label="Hard" color={colors.warning} onPress={() => onRate("hard")} />
            <RatingButton label="Good" color={colors.primary} onPress={() => onRate("good")} />
            <RatingButton label="Easy" color={colors.success} onPress={() => onRate("easy")} />
          </View>
        ) : (
          <AppButton
            title="Show translation"
            onPress={() => setRevealed(true)}
            size="lg"
            style={{ marginTop: 16 }}
          />
        )}
      </View>
    </>
  );
}

function RatingButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ratingBtn,
        { backgroundColor: color, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Typography variant="label" style={{ color: "#fff", fontWeight: "700" }}>
        {label}
      </Typography>
    </Pressable>
  );
}

function levelOrder(level: string): number {
  return ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(level);
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFace: {
    flex: 1,
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  ratingBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
