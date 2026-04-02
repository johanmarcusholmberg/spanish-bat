import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { sentenceExercises, SentenceExercise } from "@/data/sentenceBuilder";
import { getItemsForLevel } from "@/data/spanishData";
import { Puzzle, Check, ArrowRight, RotateCcw, BookmarkPlus } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import SelectionPopup from "@/components/SelectionPopup";
import SentenceWordPicker from "@/components/vocabulary/SentenceWordPicker";

/** Shuffle array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Create a non-repeating order for exercises, avoiding recently seen IDs at the start */
function createSmartOrder(exercises: SentenceExercise[], recentIds: string[]): number[] {
  const indices = exercises.map((_, i) => i);
  const shuffled = shuffle(indices);
  // Move recently-seen items to the end
  const recent = new Set(recentIds);
  const fresh = shuffled.filter(i => !recent.has(exercises[i].id));
  const stale = shuffled.filter(i => recent.has(exercises[i].id));
  return [...fresh, ...stale];
}

/** Check if selected order matches any valid order */
function checkSentenceAnswer(
  selected: string[],
  exercise: SentenceExercise
): { correct: boolean; isAlternate: boolean; primaryAnswer: string } {
  const selectedStr = selected.join(" ");
  const primaryStr = exercise.correctOrder.join(" ");
  if (selectedStr === primaryStr) {
    return { correct: true, isAlternate: false, primaryAnswer: primaryStr };
  }
  if (exercise.alternateOrders) {
    for (const alt of exercise.alternateOrders) {
      if (selectedStr === alt.join(" ")) {
        return { correct: true, isAlternate: true, primaryAnswer: primaryStr };
      }
    }
  }
  return { correct: false, isAlternate: false, primaryAnswer: primaryStr };
}

const RECENT_HISTORY_SIZE = 6;

const SentenceBuilderPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();

  useEffect(() => { trackLastActivity("sentences", "/learn/sentences", t("sentenceBuilder")); }, []);

  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [isAlternate, setIsAlternate] = useState(false);
  const [primaryAnswer, setPrimaryAnswer] = useState("");

  // Dictionary save
  const [wordPickerOpen, setWordPickerOpen] = useState(false);

  // Anti-repetition
  const recentIdsRef = useRef<string[]>([]);

  const exercises = useMemo(
    () => getItemsForLevel(sentenceExercises, user?.level || "A1"),
    [user?.level]
  );

  // Smart ordering
  const [order, setOrder] = useState<number[]>([]);
  const [orderIndex, setOrderIndex] = useState(0);

  // Reset when level changes
  useEffect(() => {
    const newOrder = createSmartOrder(exercises, recentIdsRef.current);
    setOrder(newOrder);
    setOrderIndex(0);
    setSelected([]);
    setResult(null);
    setScore({ correct: 0, total: 0 });
  }, [user?.level, exercises.length]);

  // Initialize order on first mount
  useEffect(() => {
    if (exercises.length > 0 && order.length === 0) {
      setOrder(createSmartOrder(exercises, recentIdsRef.current));
    }
  }, [exercises]);

  const currentExerciseIdx = order[orderIndex % Math.max(order.length, 1)] ?? 0;
  const current = exercises[currentExerciseIdx];

  // All words for the current exercise (for fixed slot sizing)
  const wordCount = current?.correctOrder.length ?? 0;

  // Initialize available words when exercise changes
  useEffect(() => {
    if (current) {
      setAvailable(shuffle([...current.correctOrder]));
      setSelected([]);
      setResult(null);
      setIsAlternate(false);
      setPrimaryAnswer("");
    }
  }, [current?.id, orderIndex]);

  const handleSelectWord = useCallback((word: string, index: number) => {
    setAvailable(a => a.filter((_, i) => i !== index));
    setSelected(s => [...s, word]);
  }, []);

  const handleDeselectWord = useCallback((word: string, index: number) => {
    if (result) return;
    setSelected(s => s.filter((_, i) => i !== index));
    setAvailable(a => [...a, word]);
  }, [result]);

  const handleCheck = useCallback(() => {
    if (!current) return;
    const { correct, isAlternate: alt, primaryAnswer: pa } = checkSentenceAnswer(selected, current);
    setResult(correct ? "correct" : "incorrect");
    setIsAlternate(alt);
    setPrimaryAnswer(pa);
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
  }, [selected, current]);

  const handleNext = useCallback(() => {
    logActivity();
    if (current) {
      recentIdsRef.current = [
        current.id,
        ...recentIdsRef.current.slice(0, RECENT_HISTORY_SIZE - 1),
      ];
    }
    const newIndex = orderIndex + 1;
    updateProgress("sentences", newIndex, exercises.length);
    if (newIndex >= order.length) {
      // Reshuffle when we've gone through all
      setOrder(createSmartOrder(exercises, recentIdsRef.current));
      setOrderIndex(0);
    } else {
      setOrderIndex(newIndex);
    }
  }, [orderIndex, order.length, exercises, current, updateProgress, logActivity]);

  const handleReset = useCallback(() => {
    if (current) {
      setAvailable(shuffle([...current.correctOrder]));
      setSelected([]);
      setResult(null);
    }
  }, [current]);

  const contentRef = useRef<HTMLDivElement>(null);

  if (!current) {
    return <AppLayout><p className="text-muted-foreground">No exercises available.</p></AppLayout>;
  }

  // Per-word correctness for feedback
  const correctWordAt = (index: number): boolean | null => {
    if (!result) return null;
    return selected[index] === current.correctOrder[index];
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg mx-auto" ref={contentRef}>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("translate")}</p>
              <p className="font-heading font-bold text-foreground text-lg">
                {current.translation[language]}
              </p>
            </div>
            {current.grammarFocus && (
              <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                {current.grammarFocus}
              </span>
            )}
          </div>
        </div>

        {/* Selected words — fixed-slot layout */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-background rounded-lg border-2 border-dashed border-border p-3 flex flex-wrap gap-2"
            style={{ minHeight: `${Math.max(56, Math.ceil(wordCount / 4) * 44)}px` }}
          >
            {selected.length === 0 && (
              <span className="text-muted-foreground text-sm">{t("tapWordsToOrder")}</span>
            )}
            {selected.map((word, i) => {
              const wc = correctWordAt(i);
              return (
                <button
                  key={`sel-${i}`}
                  onClick={() => handleDeselectWord(word, i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    wc === true
                      ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                      : wc === false
                      ? "bg-destructive/15 text-destructive ring-2 ring-destructive"
                      : "gradient-peach text-primary-foreground shadow-warm hover:opacity-90"
                  }`}
                >
                  {word}
                </button>
              );
            })}
            {/* Invisible placeholders to keep height stable */}
            {!result && Array.from({ length: wordCount - selected.length }).map((_, i) => (
              <span key={`ph-${i}`} className="px-3 py-1.5 rounded-md text-sm font-medium invisible">{"placeholder"}</span>
            ))}
          </div>
          <div className="w-20 shrink-0 text-sm font-semibold text-center min-h-[24px]">
            {result === "correct" && <span className="text-secondary-foreground">✓ {t("correct")}</span>}
            {result === "incorrect" && <span className="text-destructive">✗ {t("incorrect")}</span>}
          </div>
        </div>

        {/* Available words — fixed height */}
        <div className="flex flex-wrap gap-2 mb-4" style={{ minHeight: `${Math.max(40, Math.ceil(wordCount / 4) * 44)}px` }}>
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
          {/* Invisible placeholders */}
          {!result && Array.from({ length: wordCount - available.length }).map((_, i) => (
            <span key={`aph-${i}`} className="px-3 py-1.5 rounded-md text-sm font-medium invisible">{"placeholder"}</span>
          ))}
        </div>

        {/* Feedback for correct/incorrect — fixed height */}
        <div className="min-h-[80px] mb-4">
          {result === "incorrect" && (
            <div className="bg-card rounded-lg p-3 shadow-soft">
              <p className="text-sm text-muted-foreground">{t("correctAnswer")}:</p>
              <p className="font-heading font-bold text-foreground">{current.correctOrder.join(" ")}</p>
            </div>
          )}
          {result === "correct" && isAlternate && (
            <div className="bg-card rounded-lg p-3 shadow-soft">
              <p className="text-sm text-muted-foreground">
                {language === "sv" ? "Också vanligt skrivet som:" : "Also commonly written as:"}
              </p>
              <p className="font-heading font-bold text-foreground">{primaryAnswer}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
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
        <div className={`flex gap-3 ${result ? "" : "hidden"}`}>
          <button
            onClick={() => setWordPickerOpen(true)}
            className="flex-none py-3 px-4 rounded-lg bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition"
          >
            <BookmarkPlus className="h-4 w-4" />
            {language === "sv" ? "Spara ord" : "Save words"}
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-lg gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {t("nextQuestion")} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SelectionPopup containerRef={contentRef} />

      {/* Dictionary save modal */}
      <SentenceWordPicker
        sentence={current.correctOrder.join(" ")}
        context={`${t("sentenceBuilder")} – ${current.translation[language]}`}
        open={wordPickerOpen}
        onOpenChange={setWordPickerOpen}
      />
    </AppLayout>
  );
};

export default SentenceBuilderPage;
