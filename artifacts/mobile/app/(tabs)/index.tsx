import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Typography variant="h2">
            Hola, {user?.displayName?.split(" ")[0] ?? "learner"} 👋
          </Typography>
          <Typography variant="body" muted style={{ marginTop: 2 }}>
            Ready to practice today?
          </Typography>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: colors.primary + "30", borderColor: colors.primary }]}>
          <Typography variant="label" style={{ color: colors.primary }}>
            {user?.level ?? "A1"}
          </Typography>
        </View>
      </View>

      <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="home" size={28} color={colors.primary} />
        </View>
        <Typography variant="h3" style={{ marginTop: 12 }}>
          Dashboard
        </Typography>
        <Typography variant="body" muted center style={{ marginTop: 8, lineHeight: 22 }}>
          Your learning progress, streak, and daily review will appear here in Phase 2.
        </Typography>
      </View>

      <View style={[styles.statsRow, { gap: 12 }]}>
        {[
          { icon: "zap" as const, label: "Streak", value: "—" },
          { icon: "check-circle" as const, label: "Progress", value: "—" },
          { icon: "star" as const, label: "Level", value: user?.level ?? "A1" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
          >
            <Feather name={stat.icon} size={20} color={colors.primary} />
            <Typography variant="h3" style={{ marginTop: 6 }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" muted>
              {stat.label}
            </Typography>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  placeholderCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 2,
  },
});
