import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { Card } from "@/components/Card";
import { AppButton } from "@/components/AppButton";
import { ProgressBar } from "@/components/ProgressBar";
import { ErrorState } from "@/components/ErrorState";
import { RequireAuth } from "@/components/RequireAuth";
import { AnimatedScore } from "@/components/AnimatedScore";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GRAMMAR_LESSONS } from "@/lib/mockContent";
import { recentLessons } from "@/lib/storage";
import { encouragementFor } from "@/lib/encouragement";

type Step = "learn" | "practice" | "result";

export default function LessonDetailScreen() {
  return (
    <RequireAuth>
      <LessonDetailScreenInner />
    </RequireAuth>
  );
}

function LessonDetailScreenInner() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const lang = user?.learningFrom ?? "sv";

  const lesson = useMemo(() => GRAMMAR_LESSONS.find((l) => l.id === id), [id]);

  useEffect(() => {
    if (lesson) {
      recentLessons
        .add({ type: "lesson", id: lesson.id, title: lesson.title[lang], level: lesson.level })
        .catch(() => {});
    }
  }, [lesson, lang]);

  const [step, setStep] = useState<Step>("learn");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  if (!lesson) {
    return (
      <>
        <Stack.Screen options={{ title: "Lesson", headerShown: true }} />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <ErrorState
            title="Lesson not found"
            message="This lesson doesn't exist."
            onRetry={() => router.back()}
            retryLabel="Back"
          />
        </View>
      </>
    );
  }

  const currentQ = lesson.questions[qIndex];

  const startPractice = () => {
    setStep("practice");
    setQIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setResults([]);
  };

  const checkAnswer = () => {
    if (!selected || !currentQ) return;
    const isCorrect = selected === currentQ.answer;
    setResults((r) => [...r, isCorrect]);
    setShowFeedback(true);
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= lesson.questions.length) {
      const finalResults = results;
      const finalScore = Math.round(
        (finalResults.filter(Boolean).length / Math.max(1, lesson.questions.length)) * 100
      );
      api.progress
        .upsertGrammarProgress(lesson.id, finalScore >= 80, finalScore, 1)
        .catch(() => {});
      if (finalScore >= 80) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setStep("result");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const score = Math.round(
    (results.filter(Boolean).length / Math.max(1, lesson.questions.length)) * 100
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: lesson.title[lang],
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
        }}
      />
      <Screen>
        {step === "learn" && (
          <>
            <Typography variant="h2">{lesson.title[lang]}</Typography>
            <Typography variant="body" muted style={{ marginTop: 6 }}>
              {lesson.summary[lang]}
            </Typography>

            <Card style={{ marginTop: 16 }}>
              <Typography variant="body">{lesson.explanation[lang]}</Typography>
            </Card>

            <Typography variant="h3" style={{ marginTop: 18, marginBottom: 8 }}>
              Examples
            </Typography>
            <View style={{ gap: 8 }}>
              {lesson.examples.map((ex, i) => (
                <Card key={i} padding={14}>
                  <Typography variant="label" style={{ color: colors.primary }}>
                    {ex.es}
                  </Typography>
                  <Typography variant="bodySmall" muted style={{ marginTop: 4 }}>
                    {lang === "sv" ? ex.sv : ex.en}
                  </Typography>
                </Card>
              ))}
            </View>

            <AppButton
              title={`Start practice (${lesson.questions.length} questions)`}
              onPress={startPractice}
              size="lg"
              style={{ marginTop: 20 }}
            />
          </>
        )}

        {step === "practice" && currentQ && (
          <>
            <View style={styles.qHeader}>
              <Typography variant="caption" muted>
                Question {qIndex + 1} of {lesson.questions.length}
              </Typography>
            </View>
            <ProgressBar
              value={qIndex + 1}
              max={lesson.questions.length}
              style={{ marginBottom: 16 }}
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
                    style={[
                      styles.option,
                      { backgroundColor: bg, borderColor: border },
                    ]}
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
                onPress={checkAnswer}
                disabled={!selected}
                size="lg"
                style={{ marginTop: 16 }}
              />
            ) : (
              <AppButton
                title={qIndex + 1 >= lesson.questions.length ? "Finish" : "Next question"}
                onPress={nextQuestion}
                size="lg"
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}

        {step === "result" && (() => {
          const enc = encouragementFor(score, lang);
          return (
            <>
              <Card variant="primary" padding={24}>
                <AnimatedScore value={score} />
                <Typography variant="body" muted center style={{ marginTop: 6 }}>
                  {results.filter(Boolean).length} of {lesson.questions.length} correct
                </Typography>
                <Typography variant="h3" center style={{ marginTop: 16 }}>
                  {enc.emoji}
                </Typography>
                <Typography variant="body" center style={{ marginTop: 6 }}>
                  {enc.text}
                </Typography>
                <Typography variant="caption" muted center style={{ marginTop: 10 }}>
                  {score >= 80 ? "Lesson passed" : "80% needed to pass"}
                </Typography>
              </Card>
              <AppButton
                title="Try again"
                onPress={startPractice}
                variant="outline"
                size="lg"
                style={{ marginTop: 16 }}
              />
              <AppButton
                title="Back to grammar"
                onPress={() => router.back()}
                size="md"
                style={{ marginTop: 8 }}
              />
            </>
          );
        })()}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  qHeader: {
    marginBottom: 8,
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
