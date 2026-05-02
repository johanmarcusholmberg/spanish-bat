import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { PRACTICE_MODES, type PracticeMode } from "@workspace/practice";

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
};

export default function PracticeModesScreen() {
  const colors = useColors();
  const { weakSpots, todaysFocus } = usePracticeStats();
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
          Pick a mode — we'll build a fresh session for you each time.
        </Typography>
      </View>

      <WeakSpotsCard weakSpots={weakSpots} todaysFocus={todaysFocus} />

      <View style={styles.grid}>
        {PRACTICE_MODES.map((m) => (
          <Card
            key={m.mode}
            onPress={() =>
              router.push(`/practice/session?mode=${m.mode}` as never)
            }
            padding={16}
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
                <Typography variant="label">{m.title}</Typography>
                <Typography
                  variant="caption"
                  muted
                  style={{ marginTop: 2 }}
                >
                  {m.description}
                </Typography>
                <Typography
                  variant="caption"
                  muted
                  style={{ marginTop: 4, fontSize: 11 }}
                >
                  ~{m.defaultSize} questions
                </Typography>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.mutedForeground}
              />
            </View>
          </Card>
        ))}
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
});
