import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Native version of the web EchoSteps strip. Renders the
 * See → Hear → Echo → Build → Use chip row used as a recurring identity
 * across the product.
 */

export type EchoStepKey = "see" | "hear" | "echo" | "build" | "use";

const ORDER: readonly EchoStepKey[] = ["see", "hear", "echo", "build", "use"];

const ICONS: Record<EchoStepKey, keyof typeof Feather.glyphMap> = {
  see: "eye",
  hear: "headphones",
  echo: "mic",
  build: "tool",
  use: "star",
};

const LABELS: Record<EchoStepKey, { en: string; sv: string }> = {
  see: { en: "See", sv: "Se" },
  hear: { en: "Hear", sv: "Hör" },
  echo: { en: "Echo", sv: "Eka" },
  build: { en: "Build", sv: "Bygg" },
  use: { en: "Use", sv: "Använd" },
};

interface Props {
  active?: EchoStepKey;
  completed?: EchoStepKey[];
  compact?: boolean;
}

export const EchoSteps: React.FC<Props> = ({
  active,
  completed = [],
  compact = false,
}) => {
  const colors = useColors();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";
  const done = new Set(completed);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {ORDER.map((step, i) => {
        const isActive = step === active;
        const isDone = done.has(step);
        const iconName: keyof typeof Feather.glyphMap = isDone ? "check" : ICONS[step];

        const bg = isActive
          ? colors.primary
          : isDone
            ? "#10b98126"
            : colors.muted;
        const fg = isActive
          ? "#fff"
          : isDone
            ? "#047857"
            : colors.mutedForeground;
        const borderColor = isActive
          ? colors.primary
          : isDone
            ? "#10b98166"
            : colors.border;

        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.chip,
                { backgroundColor: bg, borderColor, borderWidth: 1 },
              ]}
            >
              <Feather name={iconName} size={12} color={fg} />
              {!compact && (
                <Typography
                  variant="caption"
                  style={{ color: fg, fontSize: 11, fontWeight: "600" }}
                >
                  {LABELS[step][lang]}
                </Typography>
              )}
            </View>
            {i < ORDER.length - 1 && (
              <Typography
                variant="caption"
                style={{ color: colors.mutedForeground, fontSize: 11 }}
              >
                ›
              </Typography>
            )}
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
};

export default EchoSteps;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
