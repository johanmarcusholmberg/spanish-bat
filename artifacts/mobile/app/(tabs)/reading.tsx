import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { loadReadingPassages } from "@/lib/contentCache";
import type { ReadingPassage, Level } from "@workspace/learning-content";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ReadingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const lang = user?.learningFrom ?? "sv";
  const userLevel = (user?.level ?? "A1") as Level;

  const [activeLevel, setActiveLevel] = useState<Level>(userLevel);
  const [allPassages, setAllPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadReadingPassages()
      .then((p) => {
        if (!cancelled) setAllPassages(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const passages = useMemo(
    () => allPassages.filter((p) => p.level === activeLevel),
    [allPassages, activeLevel]
  );

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { paddingTop: 67 } : { paddingTop: insets.top }),
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <LoadingState fullscreen label="Loading passages…" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Typography variant="h2">Reading</Typography>
        <Typography variant="body" muted style={{ marginTop: 4 }}>
          {lang === "sv" ? "Korta texter med förståelsefrågor" : "Short passages with comprehension"}
        </Typography>

        <View style={styles.levelRow}>
          {LEVELS.map((lvl) => {
            const active = activeLevel === lvl;
            return (
              <Card
                key={lvl}
                variant={active ? "primary" : "default"}
                padding={10}
                onPress={() => setActiveLevel(lvl)}
                style={{ flexBasis: "15%", flexGrow: 1, alignItems: "center" } as never}
              >
                <Typography
                  variant="label"
                  style={{ color: active ? colors.primary : colors.foreground }}
                >
                  {lvl}
                </Typography>
              </Card>
            );
          })}
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Platform.OS === "web" ? 100 : 80,
          gap: 10,
        }}
      >
        {passages.length === 0 ? (
          <Card>
            <Typography variant="body" muted center>
              No reading passages for level {activeLevel} yet. Try a different
              level above — we're adding new passages regularly.
            </Typography>
          </Card>
        ) : (
          passages.map((p) => (
            <Card key={p.id} onPress={() => router.push(`/passage/${p.id}`)}>
              <View style={styles.passageRow}>
                <View style={[styles.icon, { backgroundColor: colors.secondary + "40" }]}>
                  <Feather name="file-text" size={20} color={colors.secondaryForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="label">{p.title[lang]}</Typography>
                  <Typography variant="caption" muted style={{ marginTop: 4 }}>
                    {p.questions.length} questions · {p.level}
                  </Typography>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </View>
            </Card>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  levelRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    flexWrap: "wrap",
  },
  passageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
