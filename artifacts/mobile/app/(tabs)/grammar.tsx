import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const GRAMMAR_TOPICS = [
  "Nouns & Gender",
  "Articles",
  "Present Tense",
  "Past Tense",
  "Future Tense",
  "Pronouns",
  "Adjectives",
  "Prepositions",
];

export default function GrammarScreen() {
  const colors = useColors();

  return (
    <Screen>
      <View style={styles.header}>
        <Typography variant="h2">Grammar</Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          Structured lessons from A1 to C2
        </Typography>
      </View>

      <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Typography variant="label" muted style={{ marginBottom: 10 }}>
          CEFR Levels
        </Typography>
        <View style={styles.levelGrid}>
          {LEVELS.map((level, i) => (
            <View
              key={level}
              style={[
                styles.levelChip,
                {
                  backgroundColor: i === 0 ? colors.primary : colors.muted,
                  borderColor: i === 0 ? colors.primary : colors.border,
                },
              ]}
            >
              <Typography
                variant="label"
                style={{ color: i === 0 ? colors.primaryForeground : colors.mutedForeground }}
              >
                {level}
              </Typography>
            </View>
          ))}
        </View>
      </View>

      <Typography variant="h3" style={{ marginBottom: 12, marginTop: 8 }}>
        Topics coming in Phase 2
      </Typography>

      <View style={styles.topicList}>
        {GRAMMAR_TOPICS.map((topic) => (
          <View
            key={topic}
            style={[styles.topicItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="lock" size={14} color={colors.mutedForeground} />
            <Typography variant="body" muted>
              {topic}
            </Typography>
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
  levelCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  topicList: {
    gap: 8,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
