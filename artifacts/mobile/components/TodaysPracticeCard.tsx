import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  recommendPracticeMode,
  getPracticeModeMeta,
  countDueItems,
  type PracticeMode,
} from "@workspace/practice";

import { Card } from "./Card";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import WhyThisPractice from "./WhyThisPractice";

const MODE_ICON: Record<PracticeMode, keyof typeof Feather.glyphMap> = {
  quick: "zap",
  weak_spots: "target",
  level: "award",
  review_previous: "refresh-cw",
  test_prep: "clipboard",
  challenge: "trending-up",
  due_review: "calendar",
};

interface Props {
  readinessState?: "learning" | "test_recommended" | "passed_but_can_continue";
  hasResume?: boolean;
  lang?: "en" | "sv";
}

export const TodaysPracticeCard: React.FC<Props> = ({
  readinessState,
  hasResume = false,
  lang = "en",
}) => {
  const colors = useColors();
  const { stats, weakSpots } = usePracticeStats();
  const dueCount = useMemo(
    () => countDueItems(stats),
    [stats.itemSchedule, stats.itemStats],
  );
  const recommended = useMemo(
    () =>
      recommendPracticeMode({
        stats,
        weakSpots,
        readinessState,
        dueCount,
      }),
    [stats, weakSpots, readinessState, dueCount],
  );
  const meta = getPracticeModeMeta(recommended.mode);
  const showLevelCheck = readinessState === "test_recommended";
  const minMinutes = Math.max(2, meta.estimatedMinutes - 2);
  const maxMinutes = meta.estimatedMinutes + 2;
  const hasHistory =
    Object.keys(stats.itemStats ?? {}).length > 0 ||
    (stats.recentMistakeIds?.length ?? 0) > 0;
  const ctaLabel = hasResume
    ? lang === "sv"
      ? "Återuppta dagens övning"
      : "Resume today's practice"
    : lang === "sv"
      ? "Starta dagens övning"
      : "Start today's practice";

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
              {lang === "sv" ? "DAGENS EKO-ÖVNING" : "TODAY'S ECHO PRACTICE"}
            </Typography>
            <View style={[styles.badge, { backgroundColor: colors.primary + "20" }]}>
              <Typography
                variant="caption"
                style={{ color: colors.primary, fontWeight: "700", fontSize: 9 }}
              >
                {lang === "sv" ? "REKOMMENDERAS" : "RECOMMENDED"}
              </Typography>
            </View>
            {dueCount > 0 && (
              <View style={[styles.badge, { backgroundColor: "#f5970022" }]}>
                <Typography
                  variant="caption"
                  style={{ color: "#b45309", fontWeight: "700", fontSize: 9 }}
                >
                  {dueCount} {lang === "sv" ? "REDO" : "DUE"}
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="h3" style={{ marginTop: 4 }}>
            {lang === "sv" ? "Dagens eko-övning" : "Today's Echo Practice"}
          </Typography>
          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {recommended.reason[lang]}
          </Typography>
          <Typography
            variant="caption"
            muted
            style={{ marginTop: 4, fontStyle: "italic" }}
          >
            {lang === "sv"
              ? "Eka språket. Bygg minnet en session i taget."
              : "Echo the language. Build recall one session at a time."}
          </Typography>
          <View style={styles.metaRow}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Typography variant="caption" muted style={{ fontSize: 11 }}>
              {minMinutes}–{maxMinutes} min ·{" "}
              {lang === "sv"
                ? "kort talrunda ingår"
                : "short speaking round included"}
            </Typography>
          </View>
          <View style={{ marginTop: 8 }}>
            <WhyThisPractice
              mode={recommended.mode}
              weakSpots={weakSpots}
              dueCount={dueCount}
              hasHistory={hasHistory}
              recommenderReason={recommended.reason}
              lang={lang}
            />
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
          {ctaLabel}
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
