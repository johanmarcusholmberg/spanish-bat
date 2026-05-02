import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  recommendPracticeMode,
  getPracticeModeMeta,
  type PracticeMode,
} from "@workspace/practice";

import { Card } from "./Card";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { usePracticeStats } from "@/hooks/usePracticeStats";

const MODE_ICON: Record<PracticeMode, keyof typeof Feather.glyphMap> = {
  quick: "zap",
  weak_spots: "target",
  level: "award",
  review_previous: "refresh-cw",
  test_prep: "clipboard",
  challenge: "trending-up",
};

interface Props {
  readinessState?: "learning" | "test_recommended" | "passed_but_can_continue";
}

export const TodaysPracticeCard: React.FC<Props> = ({ readinessState }) => {
  const colors = useColors();
  const { stats, weakSpots, todaysFocus } = usePracticeStats();
  const recommended = useMemo(
    () =>
      recommendPracticeMode({
        stats,
        weakSpots,
        readinessState,
      }),
    [stats, weakSpots, readinessState],
  );
  const meta = getPracticeModeMeta(recommended.mode);
  const showLevelCheck = readinessState === "test_recommended";

  return (
    <Card
      style={[
        { marginBottom: 12, borderColor: colors.primary + "40", borderWidth: 1 },
      ]}
      padding={16}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
          <Feather name={MODE_ICON[recommended.mode]} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Typography
              variant="caption"
              style={{ color: colors.primary, fontWeight: "700", letterSpacing: 1, fontSize: 10 }}
            >
              TODAY'S PRACTICE
            </Typography>
            <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
              <Typography
                variant="caption"
                style={{ color: colors.primary, fontWeight: "700", fontSize: 9 }}
              >
                RECOMMENDED
              </Typography>
            </View>
          </View>
          <Typography variant="h3" style={{ marginTop: 4 }}>
            {meta.title}
          </Typography>
          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {recommended.reason.en}
          </Typography>
          <Typography
            variant="caption"
            muted
            style={{ marginTop: 4, fontStyle: "italic" }}
          >
            {todaysFocus.en}
          </Typography>
          <View style={styles.metaRow}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Typography variant="caption" muted style={{ fontSize: 11 }}>
              ~{meta.estimatedMinutes} min · ~{meta.defaultSize} questions
            </Typography>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() =>
          router.push(`/practice/session?mode=${recommended.mode}` as never)
        }
        style={[styles.btn, { backgroundColor: colors.primary, marginTop: 14 }]}
      >
        <Feather name="play-circle" size={16} color="#fff" />
        <Typography variant="label" color="#fff" style={{ marginLeft: 6 }}>
          Continue practice
        </Typography>
      </Pressable>
      {showLevelCheck && (
        <Pressable
          onPress={() => router.push("/level-check" as never)}
          style={[styles.btn, { borderColor: colors.border, borderWidth: 1, marginTop: 8 }]}
        >
          <Feather name="clipboard" size={16} color={colors.foreground} />
          <Typography variant="label" style={{ marginLeft: 6 }}>
            You look ready for a level check
          </Typography>
        </Pressable>
      )}
    </Card>
  );
};

export default TodaysPracticeCard;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
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
  btn: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
