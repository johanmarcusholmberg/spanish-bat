import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";

const VOCAB_FEATURES = [
  { icon: "book" as const, title: "My Dictionary", desc: "Words you've saved from conversations and exercises" },
  { icon: "layers" as const, title: "Flashcard SRS", desc: "Spaced repetition for efficient vocabulary retention" },
  { icon: "search" as const, title: "Browse & Filter", desc: "Filter by type, source, or learning status" },
  { icon: "mic" as const, title: "Audio Pronunciation", desc: "Listen to native Spanish pronunciation" },
];

export default function VocabularyScreen() {
  const colors = useColors();

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="book-open" size={28} color={colors.primary} />
        </View>
        <Typography variant="h2" style={{ marginTop: 14 }}>
          Vocabulary
        </Typography>
        <Typography variant="body" muted center style={{ marginTop: 6, marginBottom: 6 }}>
          Build and review your personal Spanish dictionary.
        </Typography>
      </View>

      <View style={[styles.statsRow]}>
        {[
          { label: "Words", value: "—" },
          { label: "Learned", value: "—" },
          { label: "Phrases", value: "—" },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
          >
            <Typography variant="h3">{stat.value}</Typography>
            <Typography variant="caption" muted>
              {stat.label}
            </Typography>
          </View>
        ))}
      </View>

      <View style={styles.featureList}>
        {VOCAB_FEATURES.map((f) => (
          <View
            key={f.title}
            style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary + "40" }]}>
              <Feather name={f.icon} size={20} color={colors.secondaryForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="label">{f.title}</Typography>
              <Typography variant="caption" muted style={{ marginTop: 2 }}>
                {f.desc}
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
    alignItems: "center",
    marginBottom: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 2,
  },
  featureList: {
    gap: 10,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
