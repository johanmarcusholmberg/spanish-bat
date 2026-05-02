import React from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

interface Resource {
  icon: keyof typeof Feather.glyphMap;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  href: string;
}

const RESOURCES: Resource[] = [
  {
    icon: "book-open",
    title: { en: "Grammar lessons", sv: "Grammatiklektioner" },
    desc: {
      en: "Structured lessons from A1 to C2 with examples.",
      sv: "Strukturerade lektioner från A1 till C2 med exempel.",
    },
    href: "/(tabs)/grammar",
  },
  {
    icon: "book",
    title: { en: "My dictionary", sv: "Min ordbok" },
    desc: {
      en: "Browse, search and review the words you've saved.",
      sv: "Bläddra, sök och repetera ord du har sparat.",
    },
    href: "/(tabs)/vocabulary",
  },
  {
    icon: "file-text",
    title: { en: "Reading passages", sv: "Lästexter" },
    desc: {
      en: "Short Spanish passages with comprehension questions.",
      sv: "Korta spanska texter med förståelsefrågor.",
    },
    href: "/(tabs)/reading",
  },
  {
    icon: "layers",
    title: { en: "Flashcards", sv: "Flashkort" },
    desc: {
      en: "Spaced-repetition review of your vocabulary.",
      sv: "Spaced-repetition repetition av ditt ordförråd.",
    },
    href: "/flashcards",
  },
];

export default function LibraryScreen() {
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
          {lang === "sv" ? "Bibliotek" : "Library"}
        </Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          {lang === "sv"
            ? "Lugna referenser och studieresurser. Inget tryck — bara här när du behöver dem."
            : "Calm references and study resources. No pressure — they're here when you need them."}
        </Typography>
      </View>

      <View style={{ gap: 10 }}>
        {RESOURCES.map((r) => (
          <Card
            key={r.title.en}
            onPress={() => router.push(r.href as never)}
            padding={16}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Feather name={r.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="label" style={{ fontWeight: "700" }}>
                  {r.title[lang]}
                </Typography>
                <Typography
                  variant="caption"
                  muted
                  style={{ marginTop: 2 }}
                  numberOfLines={2}
                >
                  {r.desc[lang]}
                </Typography>
              </View>
              <Feather
                name="chevron-right"
                size={20}
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
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
