import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { AppButton } from "@/components/AppButton";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <Screen>
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Typography
            variant="h1"
            style={{ color: colors.primaryForeground, fontSize: 32 }}
          >
            {(user?.displayName?.[0] ?? "?").toUpperCase()}
          </Typography>
        </View>
        <Typography variant="h2" center style={{ marginTop: 14 }}>
          {user?.displayName ?? "Learner"}
        </Typography>
        <Typography variant="body" muted center style={{ marginTop: 4 }}>
          {user?.email ?? ""}
        </Typography>
        {isAdmin && (
          <View style={[styles.adminBadge, { backgroundColor: colors.accent + "30", borderColor: colors.accent }]}>
            <Typography variant="caption" style={{ color: colors.primary }}>
              Admin
            </Typography>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Typography variant="label" muted style={{ marginBottom: 12 }}>
          LEARNING SETTINGS
        </Typography>

        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.secondary + "40" }]}>
            <Feather name="bar-chart-2" size={18} color={colors.secondaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="label">Current Level</Typography>
            <Typography variant="caption" muted>
              {user?.level ?? "A1"} — {levelName(user?.level)}
            </Typography>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.secondary + "40" }]}>
            <Feather name="globe" size={18} color={colors.secondaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="label">Learning From</Typography>
            <Typography variant="caption" muted>
              {user?.learningFrom === "sv" ? "🇸🇪 Swedish" : "🇬🇧 English"}
            </Typography>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: colors.secondary + "40" }]}>
            <Feather name="shield" size={18} color={colors.secondaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="label">Account</Typography>
            <Typography variant="caption" muted>
              Free plan
            </Typography>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Typography variant="caption" muted center style={{ marginBottom: 12 }}>
          Profile editing and learning settings available in Phase 2.
        </Typography>
      </View>

      <AppButton
        title="Sign out"
        onPress={handleLogout}
        variant="outline"
        size="lg"
        style={{ marginTop: 8 }}
        testID="logout-button"
      />
    </Screen>
  );
}

function levelName(level?: string): string {
  const names: Record<string, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Mastery",
  };
  return names[level ?? "A1"] ?? "Beginner";
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 6,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
});
