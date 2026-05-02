import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { AppButton } from "@/components/AppButton";
import { ProgressBar } from "@/components/ProgressBar";
import { ErrorState } from "@/components/ErrorState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { READING_PASSAGES } from "@/lib/mockContent";

type Step = "read" | "quiz" | "result";

export default function PassageDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const lang = user?.learningFrom ?? "sv";

  const passage = useMemo(() => READING_PASSAGES.find((p) => p.id === id), [id]);

  const [step, setStep] = useState<Step>("read");
  const [showTranslation, setShowTranslation] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  if (!passage) {
    return (
      <>
        <Stack.Screen options={{ title: "Reading", headerShown: true }} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ErrorState
            title="Passage not found"
            onRetry={() => router.back()}
            retryLabel="Back"
          />
        </View>
      </>
    );
  }

  const currentQ = passage.questions[qIndex];

  const startQuiz = () => {
    setStep("quiz");
    setQIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setResults([]);
  };

  const check = () => {
    if (!selected || !currentQ) return;
    setResults((r) => [...r, selected === currentQ.answer]);
    setShowFeedback(true);
  };

  const next = () => {
    if (qIndex + 1 >= passage.questions.length) {
      setStep("result");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const score = Math.round(
    (results.filter(Boolean).length / Math.max(1, passage.questions.length)) * 100
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: passage.title[lang],
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <Screen>
        {step === "read" && (
          <>
            <Typography variant="h2">{passage.title[lang]}</Typography>
            <Typography variant="caption" muted style={{ marginTop: 4 }}>
              Level {passage.level} · {passage.questions.length} questions
            </Typography>

            <Card style={{ marginTop: 16 }} padding={18}>
              <Typography variant="body" style={{ lineHeight: 24 }}>
                {passage.text}
              </Typography>
            </Card>

            <Pressable
              onPress={() => setShowTranslation((v) => !v)}
              style={{ marginTop: 12, alignSelf: "flex-start" }}
            >
              <View style={styles.translateToggle}>
                <Feather
                  name={showTranslation ? "eye-off" : "eye"}
                  size={16}
                  color={colors.primary}
                />
                <Typography variant="label" style={{ color: colors.primary }}>
                  {showTranslation ? "Hide translation" : "Show translation"}
                </Typography>
              </View>
            </Pressable>

            {showTranslation ? (
              <Card variant="muted" padding={16} style={{ marginTop: 8 }}>
                <Typography variant="bodySmall">{passage.translation[lang]}</Typography>
              </Card>
            ) : null}

            <AppButton
              title="Start comprehension quiz"
              onPress={startQuiz}
              size="lg"
              style={{ marginTop: 20 }}
            />
          </>
        )}

        {step === "quiz" && currentQ && (
          <>
            <Typography variant="caption" muted>
              Question {qIndex + 1} of {passage.questions.length}
            </Typography>
            <ProgressBar
              value={qIndex + 1}
              max={passage.questions.length}
              style={{ marginTop: 6, marginBottom: 16 }}
            />

            <Card>
              <Typography variant="body">{currentQ.prompt[lang]}</Typography>
            </Card>

            <View style={{ gap: 8, marginTop: 12 }}>
              {currentQ.options.map((opt) => {
                const isSelected = selected === opt;
                const isCorrect = opt === currentQ.answer;
                let bg = colors.card;
                let border = colors.border;
                if (showFeedback) {
                  if (isCorrect) {
                    bg = colors.success + "25";
                    border = colors.success;
                  } else if (isSelected) {
                    bg = colors.destructive + "20";
                    border = colors.destructive;
                  }
                } else if (isSelected) {
                  bg = colors.primary + "15";
                  border = colors.primary;
                }
                return (
                  <Pressable
                    key={opt}
                    disabled={showFeedback}
                    onPress={() => setSelected(opt)}
                    style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                  >
                    <Typography variant="body">{opt}</Typography>
                    {showFeedback && isCorrect ? (
                      <Feather name="check" size={18} color={colors.success} />
                    ) : showFeedback && isSelected && !isCorrect ? (
                      <Feather name="x" size={18} color={colors.destructive} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {!showFeedback ? (
              <AppButton
                title="Check answer"
                onPress={check}
                disabled={!selected}
                size="lg"
                style={{ marginTop: 16 }}
              />
            ) : (
              <AppButton
                title={qIndex + 1 >= passage.questions.length ? "See results" : "Next"}
                onPress={next}
                size="lg"
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}

        {step === "result" && (
          <>
            <Card variant="primary" padding={24}>
              <Typography variant="h1" center>
                {score}%
              </Typography>
              <Typography variant="body" muted center style={{ marginTop: 6 }}>
                {results.filter(Boolean).length} / {passage.questions.length} correct
              </Typography>
            </Card>
            <AppButton
              title="Try again"
              onPress={startQuiz}
              variant="outline"
              size="lg"
              style={{ marginTop: 16 }}
            />
            <AppButton
              title="Back to reading"
              onPress={() => router.back()}
              size="md"
              style={{ marginTop: 8 }}
            />
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  translateToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  option: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
