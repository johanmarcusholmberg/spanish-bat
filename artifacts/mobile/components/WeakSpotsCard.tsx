import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  friendlyLabel,
  friendlySubskillName,
  type WeakSpot,
  type WeakSpotLabel,
} from "@workspace/practice";

import { Card } from "@/components/Card";
import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";

interface Props {
  weakSpots: WeakSpot[];
  todaysFocus: { en: string; sv: string };
  max?: number;
  hideWhenEmpty?: boolean;
}

function labelColors(label: WeakSpotLabel) {
  switch (label) {
    case "focus_area":
      return { bg: "#f9731622", fg: "#c2410c", border: "#f9731644" };
    case "needs_practice":
      return { bg: "#f59e0b22", fg: "#b45309", border: "#f59e0b44" };
    case "good_to_review":
      return { bg: "#3b82f622", fg: "#1d4ed8", border: "#3b82f644" };
    case "getting_stronger":
      return { bg: "#10b98122", fg: "#047857", border: "#10b98144" };
  }
}

const WeakSpotsCard: React.FC<Props> = ({
  weakSpots,
  todaysFocus,
  max = 4,
  hideWhenEmpty = false,
}) => {
  const colors = useColors();
  if (weakSpots.length === 0 && hideWhenEmpty) return null;
  const top = weakSpots.slice(0, max);
  const iconName = weakSpots.length === 0 ? "sun" : "target";

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + "22" }]}>
          <Feather name={iconName} size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Typography variant="label">Today's focus</Typography>
          <Typography variant="caption" muted style={{ marginTop: 4 }}>
            {todaysFocus.en}
          </Typography>
          {top.length > 0 && (
            <View style={styles.chipRow}>
              {top.map((w) => {
                const c = labelColors(w.label);
                return (
                  <View
                    key={w.key}
                    style={[
                      styles.chip,
                      { backgroundColor: c.bg, borderColor: c.border },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={{ color: c.fg, fontWeight: "600" }}
                    >
                      {friendlyLabel(w.label, "en")}
                    </Typography>
                    <Typography variant="caption" style={{ color: c.fg }}>
                      {" · "}
                      {friendlySubskillName(w.subskill, "en")}
                    </Typography>
                  </View>
                );
              })}
            </View>
          )}
          {weakSpots.length > 0 && (
            <Pressable
              onPress={() =>
                router.push("/practice/session?mode=weak_spots" as never)
              }
              style={[
                styles.btn,
                { backgroundColor: colors.primary },
              ]}
            >
              <Typography variant="label" color="#fff">
                Practice focus areas
              </Typography>
            </Pressable>
          )}
        </View>
      </View>
    </Card>
  );
};

export default WeakSpotsCard;

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  btn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
});
