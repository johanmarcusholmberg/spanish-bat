import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TextInput, Pressable, FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { AppButton } from "@/components/AppButton";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

type FilterTab = "all" | "unlearned" | "learned";

interface VocabWord {
  id: string;
  spanish: string;
  translation: string;
  context?: string | null;
  category?: string | null;
  itemType?: string | null;
  learned?: boolean | null;
  level?: string | null;
}

export default function VocabularyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.vocabulary.get();
      setWords(((res.words ?? []) as unknown[]).map((w) => w as VocabWord));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vocabulary");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      if (filter === "learned" && !w.learned) return false;
      if (filter === "unlearned" && w.learned) return false;
      if (!q) return true;
      return (
        w.spanish.toLowerCase().includes(q) ||
        (w.translation ?? "").toLowerCase().includes(q)
      );
    });
  }, [words, search, filter]);

  const total = words.length;
  const learnedCount = words.filter((w) => w.learned).length;

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top }),
  };

  if (loading && words.length === 0) {
    return (
      <View style={containerStyle}>
        <LoadingState fullscreen label="Loading vocabulary…" />
      </View>
    );
  }

  if (error && words.length === 0) {
    return (
      <View style={containerStyle}>
        <ErrorState message={error} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Typography variant="h2">Vocabulary</Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          {total} {total === 1 ? "word" : "words"} · {learnedCount} learned
        </Typography>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search Spanish or translation…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.foreground }]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.tabsRow}>
          {(["all", "unlearned", "learned"] as FilterTab[]).map((t) => {
            const active = filter === t;
            return (
              <Pressable
                key={t}
                onPress={() => setFilter(t)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: active ? colors.primaryForeground : colors.mutedForeground,
                    fontWeight: "600",
                  }}
                >
                  {labelFor(t)}
                </Typography>
              </Pressable>
            );
          })}
          <View style={{ flex: 1 }} />
          <AppButton
            title="Review"
            size="sm"
            onPress={() => router.push("/flashcards")}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === "web" ? 100 : 80,
          gap: 8,
        }}
        ListEmptyComponent={
          <EmptyState
            icon="book"
            title={
              search
                ? "No matches"
                : filter !== "all"
                ? "Nothing here yet"
                : "Your dictionary is empty"
            }
            description={
              search
                ? `No words match "${search}".`
                : filter === "learned"
                ? "Mark words as learned in flashcards to fill this list."
                : "Save words from grammar lessons or reading to build your dictionary."
            }
            actionLabel={!search && filter === "all" ? "Browse exercises" : undefined}
            onAction={!search && filter === "all" ? () => router.push("/(tabs)/exercises") : undefined}
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/word/${item.id}`)}>
            <View style={styles.wordRow}>
              <View style={{ flex: 1 }}>
                <Typography variant="label" style={{ fontSize: 16 }}>
                  {item.spanish}
                </Typography>
                <Typography variant="bodySmall" muted style={{ marginTop: 2 }}>
                  {item.translation}
                </Typography>
              </View>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: item.learned ? colors.success + "30" : colors.muted,
                    borderColor: item.learned ? colors.success : colors.border,
                  },
                ]}
              >
                <Typography
                  variant="caption"
                  style={{ color: item.learned ? colors.success : colors.mutedForeground, fontWeight: "600" }}
                >
                  {item.learned ? "Learned" : "Learning"}
                </Typography>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

function labelFor(t: FilterTab): string {
  switch (t) {
    case "all":
      return "All";
    case "unlearned":
      return "Learning";
    case "learned":
      return "Learned";
  }
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
});
