import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getNextLevel,
  type Level,
  type ReadinessResult,
} from "@workspace/readiness";

import { Card } from "./Card";
import { Typography } from "./Typography";
import { ProgressBar } from "./ProgressBar";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Native LevelReadinessCard — the warm, never-pushy "where am I?" card.
 *
 * Mirrors the web component:
 *   - learning             → "Practice this level" (single non-pushy CTA)
 *   - test_recommended     → "Take the level check" + "Keep practicing"
 *   - passed_but_can_continue → "Move up to X" + "Stay & polish"
 *
 * Always offers an alternative when suggesting the level check or a
 * level-up. Never auto-starts the level check.
 */

interface Props {
  readiness: ReadinessResult;
}

const SKILL_LABELS: Record<string, { en: string; sv: string }> = {
  vocabulary: { en: "Vocabulary", sv: "Ordförråd" },
  grammar: { en: "Grammar", sv: "Grammatik" },
  sentences: { en: "Sentences", sv: "Meningar" },
  reading: { en: "Reading", sv: "Läsning" },
  listening: { en: "Listening", sv: "Hörförståelse" },
  speaking: { en: "Speaking", sv: "Tal" },
};

export const LevelReadinessCard: React.FC<Props> = ({ readiness }) => {
  const colors = useColors();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";
  const currentLevel = (user?.level as Level) ?? "A1";
  const nextLevel = getNextLevel(currentLevel);

  const strengths = readiness.breakdown
    .filter((b) => b.percentage >= 70)
    .slice(0, 3);
  const stillBuilding = readiness.breakdown
    .filter((b) => b.percentage < 60)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 2);

  const headline =
    readiness.state === "test_recommended"
      ? lang === "sv"
        ? "Du ser redo ut för en nivåkoll"
        : "You look ready for a level check"
      : readiness.state === "passed_but_can_continue"
        ? lang === "sv"
          ? "Din spanska är starkare nu"
          : "Your Spanish is getting stronger"
        : lang === "sv"
          ? "Vi bygger vidare"
          : "We're still building";

  const subline =
    readiness.state === "test_recommended"
      ? lang === "sv"
        ? "Ingen brådska — du kan fortsätta öva och göra kollen när du vill."
        : "No rush — you can keep practicing and take the check whenever you're ready."
      : readiness.state === "passed_but_can_continue"
        ? lang === "sv"
          ? `Du klarade ${currentLevel}. Du kan gå vidare eller fortsätta finslipa.`
          : `You passed ${currentLevel}. Move up, or keep polishing — both are fine.`
        : lang === "sv"
          ? "Fortsätt öva i lugn takt. Murci säger till när en nivåkoll är nära."
          : "Keep practicing at your own pace. Murci will tell you when a level check is close.";

  const tone =
    readiness.state === "test_recommended"
      ? { borderColor: "#f59e0b66", backgroundColor: "#fef3c7aa" }
      : readiness.state === "passed_but_can_continue"
        ? { borderColor: "#10b98166", backgroundColor: "#d1fae5aa" }
        : {};

  return (
    <Card
      style={[{ marginBottom: 12, borderWidth: 1 }, tone]}
      padding={16}
    >
      <View style={styles.headlineRow}>
        <Feather name="award" size={18} color={colors.primary} />
        <Typography variant="h3" style={{ flex: 1 }}>
          {headline}
        </Typography>
      </View>
      <Typography variant="caption" muted style={{ marginTop: 4 }}>
        {subline}
      </Typography>

      <View style={{ marginTop: 12 }}>
        <View style={styles.progressTopRow}>
          <Typography variant="caption" muted>
            {lang === "sv" ? "Nivåberedskap" : "Level readiness"} · {currentLevel}
          </Typography>
          <Typography variant="caption" muted>
            {readiness.score}%
          </Typography>
        </View>
        <ProgressBar value={readiness.score} max={100} color={colors.primary} />
      </View>

      {strengths.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Typography
            variant="caption"
            muted
            style={{ fontSize: 10, letterSpacing: 0.5, marginBottom: 6 }}
          >
            {(lang === "sv" ? "STARKA OMRÅDEN" : "STRONG AREAS")}
          </Typography>
          <View style={styles.chipRow}>
            {strengths.map((b) => (
              <View
                key={b.category}
                style={[styles.chip, { backgroundColor: "#10b98126", borderColor: "#10b98166" }]}
              >
                <Feather name="check" size={10} color="#047857" />
                <Typography variant="caption" style={{ color: "#047857", fontSize: 11 }}>
                  {SKILL_LABELS[b.category]?.[lang] ?? b.category}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      )}

      {stillBuilding.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Typography
            variant="caption"
            muted
            style={{ fontSize: 10, letterSpacing: 0.5, marginBottom: 6 }}
          >
            {(lang === "sv" ? "BEHÖVER LITE MER ÖVNING" : "STILL BUILDING")}
          </Typography>
          <View style={styles.chipRow}>
            {stillBuilding.map((b) => (
              <View
                key={b.category}
                style={[styles.chip, { backgroundColor: "#f59e0b26", borderColor: "#f59e0b66" }]}
              >
                <Feather name="zap" size={10} color="#92400e" />
                <Typography variant="caption" style={{ color: "#92400e", fontSize: 11 }}>
                  {SKILL_LABELS[b.category]?.[lang] ?? b.category}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {readiness.state === "test_recommended" && (
          <>
            <Pressable
              onPress={() => router.push("/level-check" as never)}
              style={[styles.btn, { backgroundColor: colors.primary, flex: 1 }]}
            >
              <Typography variant="label" color="#fff">
                {lang === "sv" ? "Gör nivåkollen" : "Take the level check"}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/exercises" as never)}
              style={[
                styles.btn,
                { borderColor: colors.border, borderWidth: 1, flex: 1 },
              ]}
            >
              <Typography variant="label">
                {lang === "sv" ? "Fortsätt öva" : "Keep practicing"}
              </Typography>
            </Pressable>
          </>
        )}
        {readiness.state === "passed_but_can_continue" && nextLevel && (
          <>
            <Pressable
              onPress={() => router.push("/(tabs)/exercises" as never)}
              style={[styles.btn, { backgroundColor: colors.primary, flex: 1 }]}
            >
              <Typography variant="label" color="#fff">
                {lang === "sv" ? `Gå till ${nextLevel}` : `Move up to ${nextLevel}`}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/exercises" as never)}
              style={[
                styles.btn,
                { borderColor: colors.border, borderWidth: 1, flex: 1 },
              ]}
            >
              <Typography variant="label">
                {lang === "sv" ? "Stanna & finslipa" : "Stay & polish"}
              </Typography>
            </Pressable>
          </>
        )}
        {readiness.state === "learning" && (
          <Pressable
            onPress={() => router.push("/(tabs)/exercises" as never)}
            style={[
              styles.btn,
              { borderColor: colors.border, borderWidth: 1, flex: 1 },
            ]}
          >
            <Typography variant="label">
              {lang === "sv" ? "Öva på den här nivån" : "Practice this level"}
            </Typography>
          </Pressable>
        )}
      </View>
    </Card>
  );
};

export default LevelReadinessCard;

const styles = StyleSheet.create({
  headlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  btn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
});
