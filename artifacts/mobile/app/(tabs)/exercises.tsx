import React from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { PracticeMixesGrid } from "@/components/PracticeMixesGrid";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Practice tab — purpose-based "Practice Mixes" first (the warm path),
 * then a manual mode picker for users who already know what they want.
 */

interface ManualMode {
  icon: keyof typeof Feather.glyphMap;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  href: string;
}

const MANUAL_MODES: ManualMode[] = [
  {
    icon: "zap",
    title: { en: "Quick mix", sv: "Snabb mix" },
    desc: {
      en: "A short adaptive mix across all skills.",
      sv: "En kort adaptiv mix över alla färdigheter.",
    },
    href: "/practice/session?mode=quick",
  },
  {
    icon: "target",
    title: { en: "Weak spots", sv: "Svaga områden" },
    desc: {
      en: "Drill the things you've missed recently.",
      sv: "Träna det du missat på sistone.",
    },
    href: "/practice/session?mode=weak_spots",
  },
  {
    icon: "award",
    title: { en: "Level practice", sv: "Nivåövning" },
    desc: {
      en: "Stay focused on your current level.",
      sv: "Håll fokus på din nuvarande nivå.",
    },
    href: "/practice/session?mode=level",
  },
  {
    icon: "rotate-ccw",
    title: { en: "Review previous", sv: "Repetera tidigare" },
    desc: {
      en: "Revisit earlier-level content to keep it fresh.",
      sv: "Återbesök tidigare nivåer för att hålla det fräscht.",
    },
    href: "/practice/session?mode=review_previous",
  },
  {
    icon: "trending-up",
    title: { en: "Challenge me", sv: "Utmana mig" },
    desc: {
      en: "A harder mix with a peek at the next level.",
      sv: "En tuffare mix med en titt på nästa nivå.",
    },
    href: "/practice/session?mode=challenge",
  },
];

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        ...(Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top }),
      }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: Platform.OS === "web" ? 100 : 80,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Typography variant="h2">
          {lang === "sv" ? "Öva" : "Practice"}
        </Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          {lang === "sv"
            ? "Välj en mix nedan, eller välj ett läge du redan känner till."
            : "Pick a mix below, or choose a mode you already know."}
        </Typography>
      </View>

      <Typography variant="h3" style={{ marginBottom: 8 }}>
        {lang === "sv" ? "Övningsmixar" : "Practice mixes"}
      </Typography>
      <PracticeMixesGrid />

      <Typography variant="h3" style={{ marginTop: 22, marginBottom: 8 }}>
        {lang === "sv" ? "Välj ett läge själv" : "Choose a mode yourself"}
      </Typography>

      <View style={{ gap: 8 }}>
        {MANUAL_MODES.map((m) => (
          <Card
            key={m.title.en}
            onPress={() => router.push(m.href as never)}
            padding={14}
          >
            <View style={styles.cardRow}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}
              >
                <Feather name={m.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="label" style={{ fontWeight: "700" }}>
                  {m.title[lang]}
                </Typography>
                <Typography variant="caption" muted style={{ marginTop: 2 }}>
                  {m.desc[lang]}
                </Typography>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={colors.mutedForeground}
              />
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
