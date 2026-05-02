import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { useColors } from "@/hooks/useColors";

interface ExerciseCard {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  desc: string;
  href: string;
}

const EXERCISES: ExerciseCard[] = [
  {
    icon: "book-open",
    title: "Grammar Lessons",
    desc: "Structured lessons from A1 to C2 with examples and practice.",
    href: "/(tabs)/grammar",
  },
  {
    icon: "file-text",
    title: "Reading",
    desc: "Read short Spanish passages and answer comprehension questions.",
    href: "/(tabs)/reading",
  },
  {
    icon: "layers",
    title: "Flashcards",
    desc: "Review your saved vocabulary with spaced repetition.",
    href: "/flashcards",
  },
  {
    icon: "book",
    title: "My Vocabulary",
    desc: "Browse, search, and review the words you've saved.",
    href: "/(tabs)/vocabulary",
  },
];

export default function ExercisesScreen() {
  const colors = useColors();

  return (
    <Screen>
      <View style={styles.header}>
        <Typography variant="h2">Exercises</Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          Pick a way to practice today.
        </Typography>
      </View>

      <View style={styles.grid}>
        {EXERCISES.map((ex) => (
          <Card
            key={ex.title}
            onPress={() => router.push(ex.href as never)}
            padding={16}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
                <Feather name={ex.icon} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="label">{ex.title}</Typography>
                <Typography variant="caption" muted style={{ marginTop: 2 }}>
                  {ex.desc}
                </Typography>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  grid: { gap: 10 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
