import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  PRACTICE_MODES,
  recommendPracticeMode,
  countDueItems,
  type PracticeMode,
} from "@workspace/practice";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { useColors } from "@/hooks/useColors";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import WeakSpotsCard from "@/components/WeakSpotsCard";

const MODE_ICONS: Record<PracticeMode, keyof typeof Feather.glyphMap> = {
  quick: "zap",
  weak_spots: "target",
  level: "award",
  review_previous: "refresh-cw",
  test_prep: "clipboard",
  challenge: "trending-up",
  due_review: "calendar",
};

export default function PracticeModesScreen() {
  const colors = useColors();
  const { stats, weakSpots, todaysFocus } = usePracticeStats();
  const dueCount = useMemo(
    () => countDueItems(stats),
    [stats.itemSchedule, stats.itemStats],
  );
  const recommended = useMemo(
    () => recommendPracticeMode({ stats, weakSpots, dueCount }),
    [stats, weakSpots, dueCount],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
          <Typography variant="caption" muted>
            Back
          </Typography>
        </Pressable>
        <Typography variant="h2" style={{ marginTop: 8 }}>
          Practice
        </Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          How do you want to practice today?
        </Typography>
      </View>

      <WeakSpotsCard weakSpots={weakSpots} todaysFocus={todaysFocus} />

      <View style={styles.grid}>
        {PRACTICE_MODES.map((m) => {
          const isRec = m.mode === recommended.mode;
          return (
            <Card
              key={m.mode}
              onPress={() =>
                router.push(`/practice/session?mode=${m.mode}` as never)
              }
              padding={16}
              style={
                isRec
                  ? { borderColor: colors.primary, borderWidth: 1.5 }
                  : undefined
              }
            >
              <View style={styles.cardRow}>
                <View
                  style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}
                >
                  <Feather
                    name={MODE_ICONS[m.mode]}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Typography variant="label">{m.title}</Typography>
                    {isRec && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Typography
                          variant="caption"
                          style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                        >
                          RECOMMENDED
                        </Typography>
                      </View>
                    )}
                  </View>
                  <Typography
                    variant="caption"
                    muted
                    style={{ marginTop: 2 }}
                  >
                    {m.description}
                  </Typography>
                  <View style={styles.metaRow}>
                    <Feather
                      name="clock"
                      size={11}
                      color={colors.mutedForeground}
                    />
                    <Typography variant="caption" muted style={{ fontSize: 11 }}>
                      ~{m.estimatedMinutes} min · ~{m.defaultSize} questions
                    </Typography>
                  </View>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.mutedForeground}
                />
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  grid: { gap: 10 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
});
