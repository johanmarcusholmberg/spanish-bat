import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { sentenceExercises, SentenceExercise } from "@/data/sentenceBuilder";
import { getItemsForLevel } from "@/data/spanishData";
import { Puzzle, Check, ArrowRight, RotateCcw, BookmarkPlus, Mic, MicOff, Volume2 } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { analyzePronunciation } from "@/lib/pronunciationAnalysis";
import { normalizeAnswer } from "@/lib/answerUtils";
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

/** Check spoken answer against correct sentence */
function checkSpokenAnswer(
  spoken: string,
  exercise: SentenceExercise
): { correct: boolean; score: number } {
  const target = exercise.correctOrder.join(" ");
  // First try exact normalized match
  if (normalizeAnswer(spoken) === normalizeAnswer(target)) {
    return { correct: true, score: 100 };
  }
  // Check alternate orders
  if (exercise.alternateOrders) {
    for (const alt of exercise.alternateOrders) {
      if (normalizeAnswer(spoken) === normalizeAnswer(alt.join(" "))) {
        return { correct: true, score: 100 };
      }
    }
  }
  // Use pronunciation analysis for partial credit
  const analysis = analyzePronunciation(target, spoken);
  return { correct: analysis.score >= 60, score: analysis.score };
}

type InputMode = "tap" | "speak";

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

  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>("tap");

  // Speak mode state
  const stt = useSpanishSTT();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const [speakResult, setSpeakResult] = useState<null | { correct: boolean; score: number; spoken: string }>(null);
  const [speakChecking, setSpeakChecking] = useState(false);

  // Dictionary save
  const [wordPickerOpen, setWordPickerOpen] = useState(false);

  // Anti-repetition
  const recentIdsRef = useRef<string[]>([]);

  const exercises = useMemo(
    () => getItemsForLevel(sentenceExercises, user?.level || "A1"),
    [user?.level]
  );

  const [order, setOrder] = useState<number[]>([]);
  const [orderIndex, setOrderIndex] = useState(0);

  useEffect(() => {
    const newOrder = createSmartOrder(exercises, recentIdsRef.current);
    setOrder(newOrder);
    setOrderIndex(0);
    setSelected([]);
    setResult(null);
    setSpeakResult(null);
    setScore({ correct: 0, total: 0 });
  }, [user?.level, exercises.length]);

  useEffect(() => {
    if (exercises.length > 0 && order.length === 0) {
      setOrder(createSmartOrder(exercises, recentIdsRef.current));
    }
  }, [exercises]);

  const currentExerciseIdx = order[orderIndex % Math.max(order.length, 1)] ?? 0;
  const current = exercises[currentExerciseIdx];

  const wordCount = current?.correctOrder.length ?? 0;

  useEffect(() => {
    if (current) {
      setAvailable(shuffle([...current.correctOrder]));
      setSelected([]);
      setResult(null);
      setIsAlternate(false);
      setPrimaryAnswer("");
      setSpeakResult(null);
      setSpeakChecking(false);
      stt.resetTranscript();
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

  // Speak mode: check spoken answer
  const handleSpeakCheck = useCallback(() => {
    if (!current) return;
    stt.stopListening();
    setSpeakChecking(true);

    setTimeout(() => {
      const spoken = stt.transcript.trim();
      if (!spoken) {
        setSpeakResult({ correct: false, score: 0, spoken: "" });
        setSpeakChecking(false);
        setResult("incorrect");
        setScore(s => ({ correct: s.correct, total: s.total + 1 }));
        return;
      }
      const { correct, score: spkScore } = checkSpokenAnswer(spoken, current);
      setSpeakResult({ correct, score: spkScore, spoken });
      setSpeakChecking(false);
      setResult(correct ? "correct" : "incorrect");
      setScore(s => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
      }));
    }, 500);
  }, [current, stt]);

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
      setSpeakResult(null);
      setSpeakChecking(false);
      stt.resetTranscript();
    }
  }, [current, stt]);

  const contentRef = useRef<HTMLDivElement>(null);

  if (!current) {
    return <AppLayout><p className="text-muted-foreground">No exercises available.</p></AppLayout>;
  }

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
        <p className="text-muted-foreground text-sm mb-4">{t("sentenceBuilderDesc")}</p>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => { setInputMode("tap"); handleReset(); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              inputMode === "tap"
                ? "gradient-peach text-primary-foreground shadow-warm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {language === "sv" ? "Bygg mening" : "Build sentence"}
          </button>
          {stt.isSupported && (
            <button
              onClick={() => { setInputMode("speak"); handleReset(); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                inputMode === "speak"
                  ? "gradient-mint text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              {language === "sv" ? "Tala" : "Speak"}
            </button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">
            {t("score")}: {score.correct} / {score.total}
          </div>
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
            <div className="flex items-center gap-2">
              {ttsSupported && (
                <button
                  onClick={() => speak(current.correctOrder.join(" "))}
                  className="p-2 rounded-full hover:bg-muted transition text-muted-foreground hover:text-foreground"
                  title={language === "sv" ? "Lyssna" : "Listen"}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
              {current.grammarFocus && (
                <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
                  {current.grammarFocus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========== TAP MODE ========== */}
        {inputMode === "tap" && (
          <>
            {/* Selected words */}
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
                {!result && Array.from({ length: wordCount - selected.length }).map((_, i) => (
                  <span key={`ph-${i}`} className="px-3 py-1.5 rounded-md text-sm font-medium invisible">{"placeholder"}</span>
                ))}
              </div>
              <div className="w-20 shrink-0 text-sm font-semibold text-center min-h-[24px]">
                {result === "correct" && <span className="text-secondary-foreground">✓ {t("correct")}</span>}
                {result === "incorrect" && <span className="text-destructive">✗ {t("incorrect")}</span>}
              </div>
            </div>

            {/* Available words */}
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
              {!result && Array.from({ length: wordCount - available.length }).map((_, i) => (
                <span key={`aph-${i}`} className="px-3 py-1.5 rounded-md text-sm font-medium invisible">{"placeholder"}</span>
              ))}
            </div>
          </>
        )}

        {/* ========== SPEAK MODE ========== */}
        {inputMode === "speak" && (
          <div className="mb-4">
            {/* Microphone area */}
            <div className="bg-background rounded-lg border-2 border-dashed border-border p-6 text-center mb-4" style={{ minHeight: "120px" }}>
              {!result && !speakChecking && (
                <>
                  {!stt.isListening ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {language === "sv" ? "Tryck på mikrofonen och säg meningen på spanska" : "Tap the microphone and say the sentence in Spanish"}
                      </p>
                      <button
                        onClick={stt.startListening}
                        className="mx-auto w-16 h-16 rounded-full gradient-peach text-primary-foreground flex items-center justify-center shadow-warm hover:opacity-90 transition"
                      >
                        <Mic className="h-7 w-7" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        <span className="text-sm text-muted-foreground">
                          {language === "sv" ? "Lyssnar..." : "Listening..."}
                        </span>
                      </div>
                      <p className="font-medium text-foreground min-h-[24px]">
                        {stt.transcript || stt.interimTranscript || "..."}
                      </p>
                      <button
                        onClick={handleSpeakCheck}
                        className="mx-auto w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition"
                      >
                        <MicOff className="h-7 w-7" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {speakChecking && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    {language === "sv" ? "Analyserar..." : "Analyzing..."}
                  </span>
                </div>
              )}

              {speakResult && result && (
                <div className="space-y-2">
                  <div className={`text-lg font-bold ${speakResult.correct ? "text-secondary-foreground" : "text-destructive"}`}>
                    {speakResult.correct ? `✓ ${t("correct")}` : `✗ ${t("incorrect")}`}
                    <span className="text-sm font-normal text-muted-foreground ml-2">({speakResult.score}%)</span>
                  </div>
                  {speakResult.spoken && (
                    <div className="text-sm text-muted-foreground">
                      <span className="text-xs uppercase tracking-wider">{language === "sv" ? "Du sa:" : "You said:"}</span>
                      <p className="font-medium text-foreground mt-0.5">"{speakResult.spoken}"</p>
                    </div>
                  )}
                  {!speakResult.spoken && (
                    <p className="text-sm text-muted-foreground">
                      {language === "sv" ? "Inget tal uppfattades. Försök igen." : "No speech detected. Try again."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback for correct/incorrect */}
        <div className="min-h-[80px] mb-4">
          {result === "incorrect" && (
            <div className="bg-card rounded-lg p-3 shadow-soft">
              <p className="text-sm text-muted-foreground">{t("correctAnswer")}:</p>
              <p className="font-heading font-bold text-foreground">{current.correctOrder.join(" ")}</p>
            </div>
          )}
          {result === "correct" && isAlternate && inputMode === "tap" && (
            <div className="bg-card rounded-lg p-3 shadow-soft">
              <p className="text-sm text-muted-foreground">
                {language === "sv" ? "Också vanligt skrivet som:" : "Also commonly written as:"}
              </p>
              <p className="font-heading font-bold text-foreground">{primaryAnswer}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {inputMode === "tap" && (
          <>
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
          </>
        )}

        {/* Post-answer actions (shared between modes) */}
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
