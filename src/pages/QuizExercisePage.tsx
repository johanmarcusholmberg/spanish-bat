import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { quizItems, getItemsForLevel } from "@/data/spanishData";
import { checkMultiAnswer, getSoftReminders } from "@/lib/answerUtils";
import { ArrowLeft, RotateCcw, Volume2, Mic, MicOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import SelectionPopup from "@/components/SelectionPopup";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import CorrectionCard from "@/components/exercises/CorrectionCard";
import LevelPracticeSelector from "@/components/LevelPracticeSelector";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { analyzePronunciation, getEncouragement } from "@/lib/pronunciationAnalysis";

const categories = ["greetings", "dailyPhrases", "atTheStore", "atTheRestaurant", "vocabulary"];

type InputMode = "write" | "speak";

const QuizExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();
  const { speak: ttsSpeak, isSupported: ttsSupported } = useSpanishTTS();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported: sttSupported } = useSpanishSTT();

  useEffect(() => { trackLastActivity("exercises", "/exercises/quiz", t("quiz")); }, []);

  const userLevel = (user?.level || "A1") as Level;
  const [practiceLevel, setPracticeLevel] = useState<Level>(userLevel);
  const [selectedCategory, setSelectedCategory] = useState<string>("greetings");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("write");
  const [sttAnalysis, setSttAnalysis] = useState<ReturnType<typeof analyzePronunciation> | null>(null);
  const [sttProcessing, setSttProcessing] = useState(false);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  const tSv = (sv: string, en: string) => (language === "sv" ? sv : en);

  const available = useMemo(() => {
    const levelFiltered = quizItems.filter((q) => q.level === practiceLevel);
    const catFiltered = levelFiltered.filter((q) => q.category === selectedCategory);
    if (catFiltered.length >= 3) return catFiltered;
    // Fallback: cumulative level filtering
    const cumulative = getItemsForLevel(quizItems, practiceLevel).filter((q) => q.category === selectedCategory);
    return cumulative;
  }, [practiceLevel, selectedCategory]);

  // Pick a non-repeated index
  const pickNextIndex = useCallback(() => {
    if (available.length === 0) return 0;
    const remaining = available.map((_, i) => i).filter((i) => !usedIndices.has(i));
    if (remaining.length === 0) {
      setUsedIndices(new Set());
      return Math.floor(Math.random() * available.length);
    }
    return remaining[Math.floor(Math.random() * remaining.length)];
  }, [available, usedIndices]);

  useEffect(() => {
    setCurrentIndex(pickNextIndex());
    setAnswer("");
    setShowResult(false);
    setUsedIndices(new Set());
    setSttAnalysis(null);
    resetTranscript();
  }, [practiceLevel, selectedCategory]);

  const current = available.length > 0 ? available[currentIndex % available.length] : null;

  const checkResult = useMemo(() => {
    if (!current) return { correct: false, matchedAnswer: null };
    return checkMultiAnswer(answer, current.answer, current.accepted_answers);
  }, [answer, current]);

  const softReminders = useMemo(() => {
    if (!current || !checkResult.correct) return [];
    return getSoftReminders(answer, current.answer, language as "sv" | "en");
  }, [answer, current, checkResult.correct, language]);

  // STT handling
  useEffect(() => {
    if (inputMode === "speak" && transcript && !showResult) {
      setAnswer(transcript);
    }
  }, [transcript, inputMode, showResult]);

  const handleSttToggle = () => {
    if (isListening) {
      stopListening();
      setSttProcessing(true);
      setTimeout(() => {
        if (current && transcript) {
          const analysis = analyzePronunciation(transcript, current.answer);
          setSttAnalysis(analysis);
        }
        setSttProcessing(false);
      }, 400);
    } else {
      resetTranscript();
      setSttAnalysis(null);
      startListening();
    }
  };

  const handleCheck = () => {
    setShowResult(true);
    setTotalAnswered((p) => p + 1);
    if (checkResult.correct) setTotalScore((p) => p + 1);
  };

  const handleNext = () => {
    logActivity();
    updateProgress("exercises", totalAnswered + 1, available.length);
    setUsedIndices((prev) => new Set([...prev, currentIndex]));
    setCurrentIndex(pickNextIndex());
    setAnswer("");
    setShowResult(false);
    setSttAnalysis(null);
    resetTranscript();
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setAnswer("");
    setShowResult(false);
    setUsedIndices(new Set());
    setSttAnalysis(null);
    resetTranscript();
  };

  const translation = current
    ? (language === "sv" ? current.question.sv : current.question.en)
    : "";

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg" ref={contentRef}>
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("quiz")}</h1>
          <LevelPracticeSelector practiceLevel={practiceLevel} onLevelChange={setPracticeLevel} />
          {totalAnswered > 0 && (
            <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
              {t("score")}: {totalScore}/{totalAnswered}
            </span>
          )}
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? "gradient-peach text-primary-foreground shadow-warm"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>

        {/* Input mode toggle */}
        {sttSupported && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode("write")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                inputMode === "write"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              ✏️ {tSv("Skriv", "Write")}
            </button>
            <button
              onClick={() => setInputMode("speak")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                inputMode === "speak"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              🎤 {tSv("Tala", "Speak")}
            </button>
          </div>
        )}

        {current ? (
          <div className="bg-card rounded-lg p-6 shadow-soft">
            {/* Question */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">{t("translate")}</p>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {language === "sv" ? current.question.sv : current.question.en}
              </h2>
            </div>

            {/* Input area - fixed height */}
            <div className="mb-4 min-h-[80px]">
              {inputMode === "write" ? (
                <>
                  <label className="block text-sm font-medium text-foreground mb-1">{t("yourAnswer")}</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={showResult}
                    onKeyDown={(e) => e.key === "Enter" && !showResult && answer.trim() && handleCheck()}
                    className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                      showResult
                        ? checkResult.correct ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                        : "border-border bg-background"
                    }`}
                    placeholder={language === "sv" ? "Skriv på spanska..." : "Write in Spanish..."}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleSttToggle}
                    disabled={showResult || sttProcessing}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? "bg-destructive text-destructive-foreground animate-pulse"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {sttProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>
                  <p className="text-sm text-muted-foreground min-h-[20px]">
                    {isListening
                      ? (interimTranscript || tSv("Lyssnar...", "Listening..."))
                      : transcript
                        ? transcript
                        : tSv("Tryck för att tala", "Tap to speak")}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons - fixed position */}
            <div className="flex gap-3 mb-4">
              {!showResult ? (
                <button
                  onClick={handleCheck}
                  disabled={!answer.trim()}
                  className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50"
                >
                  {t("checkAnswer")}
                </button>
              ) : (
                <button onClick={handleNext} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {t("nextQuestion")}
                </button>
              )}
              {ttsSupported && current && (
                <button
                  onClick={() => ttsSpeak(current.answer)}
                  className="p-2.5 rounded-md bg-muted text-foreground hover:bg-accent transition"
                  title={tSv("Lyssna", "Listen")}
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Result area - fixed minimum height */}
            <div className="min-h-[160px]">
              {showResult && current && (
                <div className="space-y-3">
                  <CorrectionCard
                    isCorrect={checkResult.correct}
                    correctAnswer={current.answer}
                    translation={translation}
                    details={
                      current.accepted_answers && current.accepted_answers.length > 0
                        ? [{
                            label: tSv("Andra accepterade svar:", "Other accepted answers:"),
                            value: current.accepted_answers.filter((a) => a !== checkResult.matchedAnswer && a !== current.answer).slice(0, 3).join(", ") || "—",
                          }]
                        : []
                    }
                  >
                    {/* Soft reminders */}
                    {softReminders.length > 0 && (
                      <div className="bg-accent/30 rounded-md px-3 py-2 text-sm text-foreground">
                        <p className="font-medium text-primary mb-1">💡 {tSv("Tips", "Tip")}</p>
                        {softReminders.map((r, i) => (
                          <p key={i} className="text-muted-foreground">{r}</p>
                        ))}
                      </div>
                    )}
                  </CorrectionCard>

                  {/* STT pronunciation analysis */}
                  {inputMode === "speak" && sttAnalysis && (
                    <div className="bg-background rounded-md px-3 py-2 text-sm">
                      <p className="font-medium text-foreground mb-1">
                        🎤 {tSv("Uttal", "Pronunciation")}: {sttAnalysis.accuracy}%
                      </p>
                      <p className="text-muted-foreground italic">{getEncouragement(sttAnalysis.accuracy, language as "sv" | "en")}</p>
                    </div>
                  )}

                  {/* Save word button */}
                  <div className="flex items-center gap-2 pt-1">
                    <SaveWordButton
                      key={current.answer}
                      spanish={current.answer}
                      context={`${language === "sv" ? current.question.sv : current.question.en}`}
                      variant="button"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-6 shadow-soft text-center">
            <p className="text-muted-foreground">
              {tSv("Inga frågor tillgängliga för denna kategori och nivå.", "No questions available for this category and level.")}
            </p>
          </div>
        )}
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default QuizExercisePage;
