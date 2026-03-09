import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { sentenceExercises } from "@/data/sentenceBuilder";
import { getItemsForLevel } from "@/data/spanishData";
import { Puzzle, Check, ArrowRight, RotateCcw } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";

const SentenceBuilderPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const exercises = useMemo(
    () => getItemsForLevel(sentenceExercises, user?.level || "A1"),
    [user?.level]
  );

  useEffect(() => {
    setExerciseIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, total: 0 });
  }, [user?.level]);

  const current = exercises[exerciseIndex % exercises.length];

  // Initialize available words (shuffled) when exercise changes
  useMemo(() => {
    if (current) {
      const shuffled = [...current.correctOrder].sort(() => Math.random() - 0.5);
      setAvailable(shuffled);
      setSelected([]);
      setResult(null);
    }
  }, [exerciseIndex, current?.id]);

  const handleSelectWord = useCallback((word: string, index: number) => {
    setAvailable((a) => a.filter((_, i) => i !== index));
    setSelected((s) => [...s, word]);
  }, []);

  const handleDeselectWord = useCallback((word: string, index: number) => {
    if (result) return;
    setSelected((s) => s.filter((_, i) => i !== index));
    setAvailable((a) => [...a, word]);
  }, [result]);

  const correctWordAt = useCallback((index: number): boolean => {
    if (!current) return false;
    return selected[index] === current.correctOrder[index];
  }, [selected, current]);

  const handleCheck = useCallback(() => {
    if (!current) return;
    const isCorrect = selected.join(" ") === current.correctOrder.join(" ");
    setResult(isCorrect ? "correct" : "incorrect");
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
  }, [selected, current]);

  const handleNext = useCallback(() => {
    setExerciseIndex((i) => i + 1);
  }, []);

  const handleReset = useCallback(() => {
    if (current) {
      const shuffled = [...current.correctOrder].sort(() => Math.random() - 0.5);
      setAvailable(shuffled);
      setSelected([]);
      setResult(null);
    }
  }, [current]);

  if (!current) {
    return <AppLayout><p className="text-muted-foreground">No exercises available.</p></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <Puzzle className="h-6 w-6" />
          {t("sentenceBuilder")}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{t("sentenceBuilderDesc")}</p>

        {/* Score */}
        <div className="text-sm text-muted-foreground mb-4">
          {t("score")}: {score.correct} / {score.total}
        </div>

        {/* Translation prompt */}
        <div className="bg-card rounded-lg p-4 shadow-soft mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("translate")}</p>
          <p className="font-heading font-bold text-foreground text-lg">
            {current.translation[language]}
          </p>
        </div>

        {/* Selected words + text indication */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-background rounded-lg border-2 border-dashed border-border p-4 min-h-[56px] flex flex-wrap gap-2">
            {selected.length === 0 && (
              <span className="text-muted-foreground text-sm">{t("tapWordsToOrder")}</span>
            )}
            {selected.map((word, i) => {
              const wordCorrect = result ? correctWordAt(i) : null;
              return (
                <button
                  key={`sel-${i}`}
                  onClick={() => handleDeselectWord(word, i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    wordCorrect === true
                      ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                      : wordCorrect === false
                      ? "bg-destructive/15 text-destructive ring-2 ring-destructive"
                      : "gradient-peach text-primary-foreground shadow-warm hover:opacity-90"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
          <div className="w-20 shrink-0 text-sm font-semibold text-center">
            {result === "correct" && <span className="text-secondary-foreground">✓ {t("correct")}</span>}
            {result === "incorrect" && <span className="text-destructive">✗ {t("incorrect")}</span>}
          </div>
        </div>

        {/* Available words — fixed height to prevent layout shift */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
          {available.map((word, i) => (
            <button
              key={`avail-${i}`}
              onClick={() => handleSelectWord(word, i)}
              disabled={!!result}
              className="px-3 py-1.5 rounded-md bg-card border border-border text-foreground text-sm font-medium hover:bg-muted transition disabled:opacity-50"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Correct answer display — fixed height to prevent layout shift */}
        <div className="min-h-[60px] mb-4">
          {result === "incorrect" && (
            <div className="bg-card rounded-lg p-3 shadow-soft">
              <p className="text-sm text-muted-foreground">{t("correctAnswer")}:</p>
              <p className="font-heading font-bold text-foreground">{current.correctOrder.join(" ")}</p>
            </div>
          )}
        </div>

        {/* Action buttons — both rendered, toggled by visibility to prevent layout shift */}
        <div className={`flex gap-3 ${result ? "hidden" : ""}`}>
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-lg bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition"
          >
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </button>
          <button
            onClick={handleCheck}
            disabled={selected.length !== current.correctOrder.length}
            className="flex-1 py-3 rounded-lg gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            {t("checkAnswer")}
          </button>
        </div>
        <div className={`${result ? "" : "hidden"}`}>
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {t("nextQuestion")} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SentenceBuilderPage;
