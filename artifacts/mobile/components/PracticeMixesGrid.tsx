import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Native version of the web PracticeMixesGrid. Same 10 purpose-based
 * mixes, with mobile-friendly tap targets.
 */

interface Mix {
  key: string;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  minutes: number;
  icon: keyof typeof Feather.glyphMap;
  to: string;
}

const MIXES: Mix[] = [
  {
    key: "warmup",
    title: { en: "5-minute warm-up", sv: "5 minuters uppvärmning" },
    desc: {
      en: "A short, gentle mix to ease into Spanish today.",
      sv: "En kort, mjuk mix för att komma in i spanskan idag.",
    },
    minutes: 5,
    icon: "zap",
    to: "/practice/session?mode=quick",
  },
  {
    key: "daily",
    title: { en: "Daily review", sv: "Daglig repetition" },
    desc: {
      en: "Refresh items your brain is ready to revisit.",
      sv: "Fräscha upp det din hjärna är redo att repetera.",
    },
    minutes: 8,
    icon: "calendar",
    to: "/practice/session?mode=due_review",
  },
  {
    key: "weak",
    title: { en: "Weak words & spots", sv: "Svaga ord & områden" },
    desc: {
      en: "Focused practice on what you're still building.",
      sv: "Fokuserad övning på det du fortfarande bygger upp.",
    },
    minutes: 10,
    icon: "target",
    to: "/practice/session?mode=weak_spots",
  },
  {
    key: "speaking",
    title: { en: "Speaking confidence", sv: "Tala med självförtroende" },
    desc: { en: "Listen, echo, and say it out loud.", sv: "Lyssna, eka och säg det högt." },
    minutes: 10,
    icon: "mic",
    to: "/practice/session?mode=quick",
  },
  {
    key: "echo",
    title: { en: "Listen and echo", sv: "Lyssna och eka" },
    desc: {
      en: "See it, hear it, echo it, build it, use it.",
      sv: "Se, hör, eka, bygg, använd.",
    },
    minutes: 10,
    icon: "headphones",
    to: "/practice/session?mode=quick",
  },
  {
    key: "grammar",
    title: { en: "Grammar rescue", sv: "Grammatikräddning" },
    desc: {
      en: "A short set focused on grammar shapes.",
      sv: "En kort omgång fokuserad på grammatiska mönster.",
    },
    minutes: 10,
    icon: "book-open",
    to: "/practice/session?mode=level",
  },
  {
    key: "conversation",
    title: { en: "Conversation practice", sv: "Konversationsövning" },
    desc: {
      en: "Hold a short Spanish chat with Murci.",
      sv: "För en kort spansk konversation med Murci.",
    },
    minutes: 12,
    icon: "message-circle",
    to: "/practice/session?mode=quick",
  },
  {
    key: "review_previous",
    title: { en: "Travel Spanish refresh", sv: "Reseuppfräschning" },
    desc: {
      en: "Revisit travel-friendly basics from earlier levels.",
      sv: "Repetera resvänliga grunder från tidigare nivåer.",
    },
    minutes: 10,
    icon: "rotate-ccw",
    to: "/practice/session?mode=review_previous",
  },
  {
    key: "test_prep",
    title: { en: "Test readiness", sv: "Inför nivåkollen" },
    desc: {
      en: "A balanced set that feels like the level check.",
      sv: "En balanserad mix som liknar nivåkollen.",
    },
    minutes: 12,
    icon: "clipboard",
    to: "/practice/session?mode=test_prep",
  },
  {
    key: "challenge",
    title: { en: "Stretch me", sv: "Tänj på mig" },
    desc: {
      en: "A tougher mix with a peek at the next level.",
      sv: "En tuffare mix med en titt på nästa nivå.",
    },
    minutes: 12,
    icon: "trending-up",
    to: "/practice/session?mode=challenge",
  },
];

export const PracticeMixesGrid: React.FC = () => {
  const colors = useColors();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";

  return (
    <View style={styles.grid}>
      {MIXES.map((m) => (
        <Pressable
          key={m.key}
          onPress={() => router.push(m.to as never)}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
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
              <Typography
                variant="caption"
                muted
                style={{ marginTop: 2, fontSize: 11 }}
                numberOfLines={2}
              >
                {m.desc[lang]}
              </Typography>
              <View style={styles.metaRow}>
                <Feather name="clock" size={10} color={colors.mutedForeground} />
                <Typography variant="caption" muted style={{ fontSize: 10 }}>
                  ~{m.minutes} min
                </Typography>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default PracticeMixesGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    flexBasis: "100%",
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
});
