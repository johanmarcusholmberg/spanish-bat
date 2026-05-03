import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import EchoSteps from "@/components/EchoSteps";
import EchoRecorder from "@/components/EchoRecorder";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { learningFeedbackService } from "@/lib/learningFeedbackService";

/**
 * /learn/echo — a focused, mobile-native Echo session.
 *
 * One card. One phrase. One clear action: echo it. Confidence updates feed
 * back through the learningFeedbackService so haptics stay consistent.
 */

interface EchoPhrase {
  es: string;
  en: string;
}

const PHRASES: EchoPhrase[] = [
  { es: "Hola, ¿cómo estás?", en: "Hi, how are you?" },
  { es: "Mucho gusto en conocerte.", en: "Nice to meet you." },
  { es: "Me gustaría un café, por favor.", en: "I'd like a coffee, please." },
  { es: "¿Dónde está la estación?", en: "Where is the station?" },
  { es: "Hablo un poco de español.", en: "I speak a little Spanish." },
];

export default function EchoLearnScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";

  const phrases = useMemo(() => PHRASES, []);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const current = phrases[index];
  const progress = ((index + 1) / phrases.length) * 100;

  const advance = () => {
    if (index + 1 >= phrases.length) {
      setDone(true);
      learningFeedbackService.feedbackSessionComplete();
      return;
    }
    setIndex((i) => i + 1);
  };

  if (done) {
    return (
      <Screen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card padding={20}>
            <View style={{ alignItems: "center" }}>
              <View style={[styles.celebrate, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="award" size={28} color={colors.primary} />
              </View>
              <Typography variant="h2" center style={{ marginTop: 10 }}>
                {lang === "sv" ? "Bra ekat!" : "Nice echoing!"}
              </Typography>
              <Typography variant="caption" muted center style={{ marginTop: 4 }}>
                {lang === "sv"
                  ? "Korta, frekventa sessioner sätter sig bäst."
                  : "Short, frequent practice sticks best."}
              </Typography>
            </View>
            <Pressable
              onPress={() => {
                setIndex(0);
                setDone(false);
              }}
              style={[styles.btn, { backgroundColor: colors.primary, marginTop: 18 }]}
            >
              <Feather name="refresh-cw" size={16} color={colors.primaryForeground} />
              <Typography
                variant="label"
                color={colors.primaryForeground}
                style={{ marginLeft: 6 }}
              >
                {lang === "sv" ? "Eka igen" : "Echo again"}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/(tabs)" as never)}
              style={[styles.btn, { borderColor: colors.border, borderWidth: 1, marginTop: 8 }]}
            >
              <Typography variant="label">{lang === "sv" ? "Tillbaka hem" : "Back to home"}</Typography>
            </Pressable>
          </Card>
        </ScrollView>
      </Screen>
    );
  }

  if (!current) return null;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        <Typography variant="caption" muted>
          {lang === "sv" ? "Avsluta" : "Exit"}
        </Typography>
      </Pressable>

      <View style={{ marginTop: 8 }}>
        <EchoSteps active="echo" />
      </View>

      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <View style={styles.metaRow}>
          <Typography variant="caption" muted>
            {index + 1} / {phrases.length}
          </Typography>
          <Typography variant="caption" muted>
            {lang === "sv" ? "Eka & säg det högt" : "Echo & say it out loud"}
          </Typography>
        </View>
        <ProgressBar value={progress} max={100} />
      </View>

      <Card padding={18}>
        <EchoRecorder
          phrase={current.es}
          translation={current.en}
          onConfidence={(_level) => advance()}
        />
        <Pressable
          onPress={advance}
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 16 }]}
        >
          <Typography variant="label" color={colors.primaryForeground}>
            {index + 1 >= phrases.length ? (lang === "sv" ? "Avsluta" : "Finish") : (lang === "sv" ? "Nästa" : "Next")}
          </Typography>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  btn: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  celebrate: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
