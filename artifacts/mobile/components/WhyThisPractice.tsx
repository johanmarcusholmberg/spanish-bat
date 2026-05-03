import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  friendlySubskillName,
  type PracticeMode,
  type WeakSpot,
} from "@workspace/practice";
import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";

interface Props {
  mode: PracticeMode;
  weakSpots: WeakSpot[];
  dueCount: number;
  hasHistory: boolean;
  recommenderReason?: { en: string; sv: string };
  lang?: "en" | "sv";
}

const WhyThisPractice: React.FC<Props> = ({
  mode,
  weakSpots,
  dueCount,
  hasHistory,
  recommenderReason,
  lang = "en",
}) => {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  const bullets = useMemo<string[]>(() => {
    const out: string[] = [];
    if (recommenderReason) out.push(recommenderReason[lang]);
    if (!hasHistory) {
      out.push(
        lang === "sv"
          ? "Den här sessionen hjälper Murciélingo att lära sig din nuvarande nivå."
          : "This session helps Murciélingo learn your current level.",
      );
      out.push(
        lang === "sv"
          ? "Vi blandar lyssnande, återkallning och eko-övning så vanan blir starkare."
          : "We mix listening, recall, and echo practice to build a stronger habit.",
      );
      return out;
    }
    if (dueCount > 0) {
      out.push(
        lang === "sv"
          ? `${dueCount} fraser är redo att eka tillbaka idag.`
          : `${dueCount} phrases are ready to echo back today.`,
      );
    }
    const top = weakSpots.slice(0, 2).map((w) => friendlySubskillName(w.subskill, lang));
    if (top.length > 0) {
      out.push(
        lang === "sv"
          ? `Vi tar upp fraser från ${top.join(" och ")} som du tvekade på senast.`
          : `We're bringing back phrases from ${top.join(" and ")} you hesitated on.`,
      );
    }
    if (mode === "weak_spots") {
      out.push(
        lang === "sv"
          ? "Korta repetitioner i lite olika former så det fastnar lättare."
          : "Short repetitions in slightly different ways so it sticks more easily.",
      );
    } else if (mode === "due_review") {
      out.push(
        lang === "sv"
          ? "Murci tar tillbaka fraser precis när minnet behöver dem."
          : "Murci brings phrases back right when memory needs them.",
      );
    } else {
      out.push(
        lang === "sv"
          ? "En kort talrunda ingår om mikrofonen är på."
          : "A short speaking round is included if your mic is on.",
      );
    }
    return out;
  }, [dueCount, hasHistory, lang, mode, recommenderReason, weakSpots]);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={styles.toggle}
        hitSlop={6}
      >
        <Feather name="zap" size={11} color={colors.primary} />
        <Typography
          variant="caption"
          style={{ color: colors.primary, fontWeight: "600", fontSize: 11 }}
        >
          {lang === "sv" ? "Varför den här övningen?" : "Why this practice?"}
        </Typography>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={12}
          color={colors.primary}
        />
      </Pressable>
      {open && (
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          {bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Typography
                variant="caption"
                style={{ color: colors.primary, marginRight: 4 }}
              >
                ·
              </Typography>
              <Typography
                variant="caption"
                style={{ flex: 1, lineHeight: 18 }}
              >
                {b}
              </Typography>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default WhyThisPractice;

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  panel: {
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  bulletRow: {
    flexDirection: "row",
    marginVertical: 2,
  },
});
