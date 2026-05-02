import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";

const EXERCISE_TYPES = [
  { icon: "book-open" as const, title: "Grammar Lessons", desc: "Learn Spanish grammar rules with examples and exercises" },
  { icon: "file-text" as const, title: "Reading", desc: "Practice reading comprehension at your level" },
  { icon: "shuffle" as const, title: "Sentence Builder", desc: "Build correct sentences from Spanish words" },
  { icon: "message-circle" as const, title: "Conversation", desc: "Practice AI-powered conversations in Spanish" },
  { icon: "mic" as const, title: "Pronunciation", desc: "Improve your Spanish pronunciation and accent" },
  { icon: "layers" as const, title: "Flashcards", desc: "Spaced repetition flashcard practice" },
];

export default function ExercisesScreen() {
  const colors = useColors();

  return (
    <Screen>
      <View style={styles.header}>
        <Typography variant="h2">Exercises</Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          Practice and reinforce your Spanish skills
        </Typography>
      </View>

      <View style={styles.grid}>
        {EXERCISE_TYPES.map((ex) => (
          <View
            key={ex.title}
            style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
              <Feather name={ex.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="label">{ex.title}</Typography>
              <Typography variant="caption" muted style={{ marginTop: 2 }}>
                {ex.desc}
              </Typography>
            </View>
            <View style={[styles.comingSoon, { backgroundColor: colors.muted }]}>
              <Typography variant="caption" muted>
                Coming
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  grid: {
    gap: 10,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
