import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { AppButton } from "@/components/AppButton";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { RequireAuth } from "@/components/RequireAuth";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

interface VocabWord {
  id: string;
  spanish: string;
  translation: string;
  context?: string | null;
  category?: string | null;
  itemType?: string | null;
  learned?: boolean | null;
  level?: string | null;
  usageExample?: string | null;
}

export default function WordDetailScreen() {
  return (
    <RequireAuth>
      <WordDetailScreenInner />
    </RequireAuth>
  );
}

function WordDetailScreenInner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [word, setWord] = useState<VocabWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.vocabulary.get();
        const found = ((res.words ?? []) as unknown[])
          .map((w) => w as VocabWord)
          .find((w) => w.id === id);
        if (mounted) setWord(found ?? null);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load word");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const toggleLearned = async () => {
    if (!word) return;
    setBusy(true);
    const next = !word.learned;
    setWord({ ...word, learned: next });
    try {
      await api.vocabulary.update(word.id, { learned: next });
    } catch {
      setWord({ ...word, learned: !next });
      Alert.alert("Failed to update", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    if (!word) return;
    Alert.alert("Remove word?", `Remove "${word.spanish}" from your dictionary?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.vocabulary.remove(word.id);
            router.back();
          } catch {
            Alert.alert("Failed", "Could not remove word.");
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: word?.spanish ?? "Word",
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      {loading ? (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <LoadingState fullscreen />
        </View>
      ) : error ? (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <ErrorState message={error} onRetry={() => router.back()} retryLabel="Back" />
        </View>
      ) : !word ? (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
          <ErrorState
            title="Word not found"
            message="This word may have been removed."
            onRetry={() => router.back()}
            retryLabel="Back"
          />
        </View>
      ) : (
        <Screen>
          <Card style={{ marginBottom: 14 }}>
            <Typography variant="caption" muted>
              SPANISH
            </Typography>
            <Typography variant="h1" style={{ marginTop: 4 }}>
              {word.spanish}
            </Typography>
            <Typography variant="body" muted style={{ marginTop: 14 }}>
              TRANSLATION
            </Typography>
            <Typography variant="h3" style={{ marginTop: 2 }}>
              {word.translation}
            </Typography>

            <View style={[styles.metaRow, { marginTop: 14 }]}>
              {word.level ? (
                <Pill label={word.level} bg={colors.primary + "20"} fg={colors.primary} />
              ) : null}
              {word.category ? (
                <Pill label={word.category} bg={colors.secondary + "30"} fg={colors.secondaryForeground} />
              ) : null}
              {word.itemType ? (
                <Pill label={word.itemType} bg={colors.muted} fg={colors.mutedForeground} />
              ) : null}
            </View>
          </Card>

          {word.context ? (
            <Card style={{ marginBottom: 14 }}>
              <Typography variant="label" muted style={{ marginBottom: 6 }}>
                Context
              </Typography>
              <Typography variant="body">{word.context}</Typography>
            </Card>
          ) : null}

          {word.usageExample ? (
            <Card style={{ marginBottom: 14 }}>
              <Typography variant="label" muted style={{ marginBottom: 6 }}>
                Example
              </Typography>
              <Typography variant="body" style={{ fontStyle: "italic" }}>
                {word.usageExample}
              </Typography>
            </Card>
          ) : null}

          <AppButton
            title={word.learned ? "Mark as learning" : "Mark as learned"}
            onPress={toggleLearned}
            loading={busy}
            variant={word.learned ? "outline" : "primary"}
            size="lg"
            style={{ marginBottom: 10 }}
          />
          <AppButton
            title="Remove from dictionary"
            onPress={remove}
            variant="destructive"
            size="md"
          />
        </Screen>
      )}
    </>
  );
}

function Pill({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Typography variant="caption" style={{ color: fg, fontWeight: "600" }}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
