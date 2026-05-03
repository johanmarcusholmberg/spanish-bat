import React from "react";
import { ScrollView, StyleSheet, View, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { AppButton } from "@/components/AppButton";
import EchoSteps from "@/components/EchoSteps";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Welcome / first-session onboarding.
 *
 * Reached after sign-up email verification (and optionally after the first
 * level check). Ends with a single, friendly CTA: "Start your first 3-minute
 * practice." This is the bridge from "I just made an account" to "I have
 * a daily Spanish coach habit."
 */
export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";

  const startPractice = () => {
    router.replace("/practice/session?mode=quick" as never);
  };

  const skipToHome = () => {
    router.replace("/(tabs)" as never);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: Platform.OS === "web" ? 60 : insets.top + 24, paddingBottom: 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.logo, { backgroundColor: colors.primary }]}>
        <Feather name="zap" size={28} color={colors.primaryForeground} />
      </View>
      <Typography variant="h1" center style={{ marginTop: 16 }}>
        {lang === "sv" ? "Välkommen till Murcielingo" : "Welcome to Murcielingo"}
      </Typography>
      <Typography variant="body" muted center style={{ marginTop: 8, paddingHorizontal: 12 }}>
        {lang === "sv"
          ? "Eka språket, en liten övning i taget."
          : "Echo the language, one small session at a time."}
      </Typography>

      <Card padding={20} style={{ marginTop: 24 }}>
        <Typography variant="caption" muted style={styles.eyebrow}>
          {lang === "sv" ? "ECHO-METODEN" : "THE ECHO METHOD"}
        </Typography>
        <View style={{ marginTop: 8 }}>
          <EchoSteps />
        </View>
        <Typography variant="body" style={{ marginTop: 14 }}>
          {lang === "sv"
            ? "Du ser det, hör det, ekar det, bygger med det och använder det. Vi hjälper dig öva orden och fraserna som nästan sitter."
            : "You see it, hear it, echo it, build with it, and use it. We'll help you practice the words and phrases that are almost there."}
        </Typography>
      </Card>

      <Card padding={20} style={{ marginTop: 14 }}>
        <View style={styles.row}>
          <View style={[styles.iconBubble, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="clock" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="label">
              {lang === "sv" ? "Korta dagliga sessioner" : "Short daily sessions"}
            </Typography>
            <Typography variant="caption" muted style={{ marginTop: 2 }}>
              {lang === "sv"
                ? "Börja med 3 minuter idag."
                : "Start with 3 minutes today."}
            </Typography>
          </View>
        </View>
        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={[styles.iconBubble, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="compass" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="label">
              {lang === "sv" ? "Vi vägleder dig" : "We'll guide you"}
            </Typography>
            <Typography variant="caption" muted style={{ marginTop: 2 }}>
              {lang === "sv"
                ? "Du behöver inte välja en modul — Murcielingo vet vad du behöver eka härnäst."
                : "No need to choose a module — Murcielingo knows what to echo next."}
            </Typography>
          </View>
        </View>
      </Card>

      <AppButton
        title={
          lang === "sv"
            ? "Starta din första 3-minutersövning"
            : "Start your first 3-minute practice"
        }
        onPress={startPractice}
        size="lg"
        style={{ marginTop: 24 }}
      />
      <AppButton
        title={lang === "sv" ? "Hoppa över för nu" : "Skip for now"}
        variant="outline"
        size="md"
        onPress={skipToHome}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    alignItems: "stretch",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  eyebrow: { letterSpacing: 1, fontSize: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
