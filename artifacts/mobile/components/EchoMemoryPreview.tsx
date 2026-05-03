import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Card } from "./Card";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { useEchoMemory } from "@/hooks/useEchoMemory";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface Props {
  lang?: "en" | "sv";
}

const EchoMemoryPreview: React.FC<Props> = ({ lang = "en" }) => {
  const colors = useColors();
  const memory = useEchoMemory();
  const { isPremium, loading } = useFeatureAccess();
  if (loading) return null;

  const tagline =
    lang === "sv"
      ? "Murciélingo kommer ihåg fraserna du behöver repetera."
      : "Murciélingo remembers the phrases you need to repeat.";

  const detail = (() => {
    if (!memory.hasData) {
      return lang === "sv"
        ? "Gör en kort övning så börjar Murci minnas vad du behöver eka tillbaka."
        : "Do a short practice and Murci will start remembering what you need to echo back.";
    }
    const lines: string[] = [];
    if (memory.dueCount > 0) {
      lines.push(
        lang === "sv"
          ? `${memory.dueCount} fraser är redo att repetera.`
          : `${memory.dueCount} phrases are ready to review.`,
      );
    } else if (memory.weakCount > 0) {
      lines.push(
        lang === "sv"
          ? `${memory.weakCount} fraser väntar på en till runda.`
          : `${memory.weakCount} phrases are waiting for another round.`,
      );
    }
    if (memory.topImproved) {
      lines.push(
        lang === "sv"
          ? `Du blir starkare på ${memory.topImproved.sv}.`
          : `You're getting stronger on ${memory.topImproved.en}.`,
      );
    } else if (memory.topFocus) {
      lines.push(
        lang === "sv"
          ? `Fokus just nu: ${memory.topFocus.sv}.`
          : `Current focus: ${memory.topFocus.en}.`,
      );
    }
    if (lines.length === 0) {
      lines.push(
        lang === "sv"
          ? "Inget ligger på kö just nu — fortsätt så fyller vi minnet."
          : "Nothing queued right now — keep practicing and the memory will fill in.",
      );
    }
    return lines.join(" ");
  })();

  return (
    <Card style={{ marginBottom: 12 }} padding={16}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="cpu" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Typography variant="h3">
              {lang === "sv" ? "Eko-minne" : "Echo Memory"}
            </Typography>
            {!isPremium && (
              <View
                style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Typography
                  variant="caption"
                  muted
                  style={{ fontWeight: "700", fontSize: 9, letterSpacing: 0.6 }}
                >
                  {lang === "sv" ? "FÖRHANDS" : "PREVIEW"}
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {tagline}
          </Typography>
          <Typography variant="body" style={{ marginTop: 6, fontSize: 13, lineHeight: 19 }}>
            {detail}
          </Typography>
          {!isPremium ? (
            <Pressable
              onPress={() => router.push("/paywall" as never)}
              style={[styles.btnOutline, { borderColor: colors.border, marginTop: 10 }]}
            >
              <Feather name="lock" size={13} color={colors.foreground} />
              <Typography variant="label" style={{ marginLeft: 6, fontSize: 13 }}>
                {lang === "sv"
                  ? "Lås upp hela Eko-minnet"
                  : "Unlock full Echo Memory"}
              </Typography>
            </Pressable>
          ) : (
            memory.dueCount > 0 && (
              <Pressable
                onPress={() =>
                  router.push("/practice/session?mode=due_review" as never)
                }
                style={[styles.btn, { backgroundColor: colors.primary, marginTop: 10 }]}
              >
                <Typography variant="label" color="#fff">
                  {lang === "sv" ? "Repetera nu" : "Review now"}
                </Typography>
              </Pressable>
            )
          )}
        </View>
      </View>
    </Card>
  );
};

export default EchoMemoryPreview;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    borderWidth: 1,
  },
  btn: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  btnOutline: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});
