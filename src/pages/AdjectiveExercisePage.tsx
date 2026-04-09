import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { adjectives, getItemsForLevel } from "@/data/spanishData";
import { checkAnswer } from "@/lib/answerUtils";
import { ArrowLeft, RotateCcw, Volume2, Mic, MicOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import SelectionPopup from "@/components/SelectionPopup";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import CorrectionCard from "@/components/exercises/CorrectionCard";
import LevelPracticeSelector from "@/components/LevelPracticeSelector";
import { capitalizeFirst } from "@/lib/displayUtils";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { analyzePronunciation, getEncouragement } from "@/lib/pronunciationAnalysis";

type InputMode = "write" | "speak";
type ExerciseMode = "both" | "feminine" | "sentence";

const AdjectiveExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();
  const { speak: ttsSpeak, isSupported: ttsSupported } = useSpanishTTS();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported: sttSupported } = useSpanishSTT();

  useEffect(() => { trackLastActivity("exercises", "/exercises/adjectives", t("adjectives")); }, []);

  const userLevel = (user?.level || "A1") as Level;
  const [practiceLevel, setPracticeLevel] = useState<Level>(userLevel);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masculineAnswer, setMasculineAnswer] = useState("");
  const [feminineAnswer, setFeminineAnswer] = useState("");
  const [sentenceAnswer, setSentenceAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [completedAdj, setCompletedAdj] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("write");
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("both");
  const [sttAnalysis, setSttAnalysis] = useState<ReturnType<typeof analyzePronunciation> | null>(null);
  const [sttProcessing, setSttProcessing] = useState(false);

  const available = useMemo(() => {
    const levelFiltered = adjectives.filter((a) => a.level === practiceLevel);
    return levelFiltered.length >= 5 ? levelFiltered : getItemsForLevel(adjectives, practiceLevel);
  }, [practiceLevel]);

  useEffect(() => {
    setCurrentIndex(0);
    setMasculineAnswer("");
    setFeminineAnswer("");
    setSentenceAnswer("");
    setShowResults(false);
    setSttAnalysis(null);
    resetTranscript();
  }, [practiceLevel]);

  const contentRef = useRef<HTMLDivElement>(null);
  const current = available[currentIndex];

  // Build sentence fill-in (must be before early return for hooks rules)
  const sentenceBlank = useMemo(() => {
    if (!current) return { sentence: "", answer: "" };
    const es = current.example.es;
    const mascIdx = es.toLowerCase().indexOf(current.masculine.toLowerCase());
    const femIdx = es.toLowerCase().indexOf(current.feminine.toLowerCase());
    if (femIdx >= 0) {
      return {
        sentence: es.substring(0, femIdx) + "___" + es.substring(femIdx + current.feminine.length),
        answer: current.feminine,
      };
    }
    if (mascIdx >= 0) {
      return {
        sentence: es.substring(0, mascIdx) + "___" + es.substring(mascIdx + current.masculine.length),
        answer: current.masculine,
      };
    }
    return { sentence: es.replace(/\.\s*$/, "") + " ___.", answer: current.masculine };
  }, [current]);

  if (!current) return null;

  const word = language === "sv" ? current.sv : current.en;
  const lang = language === "sv" ? "sv" : "en";
  const tLocal = (sv: string, en: string) => (language === "sv" ? sv : en);

  const isInvariant = current.masculine === current.feminine;

  // Validation
  const mascCorrect = checkAnswer(masculineAnswer, current.masculine);
  const femCorrect = checkAnswer(feminineAnswer, current.feminine);
  const sentenceCorrect = checkAnswer(sentenceAnswer, sentenceBlank.answer);

  const isCorrect = exerciseMode === "both"
    ? mascCorrect && femCorrect
    : exerciseMode === "feminine"
    ? femCorrect
    : sentenceCorrect;

  const handleCheck = () => {
    if (inputMode === "speak" && isListening) {
      stopListening();
      setSttProcessing(true);
      setTimeout(() => {
        const finalTranscript = transcript + (interimTranscript || "");
        if (finalTranscript.trim()) {
          const target = exerciseMode === "feminine" ? current.feminine : current.masculine;
          setSttAnalysis(analyzePronunciation(target, finalTranscript));
        }
        setSttProcessing(false);
        setShowResults(true);
      }, 600);
      return;
    }
    setShowResults(true);
  };

  const handleNext = () => {
    logActivity();
    const newCompleted = completedAdj + 1;
    setCompletedAdj(newCompleted);
    updateProgress("exercises", newCompleted, available.length);
    setCurrentIndex((prev) => (prev + 1) % available.length);
    setMasculineAnswer("");
    setFeminineAnswer("");
    setSentenceAnswer("");
    setShowResults(false);
    setSttAnalysis(null);
    resetTranscript();
  };

  const handleStartSpeaking = () => {
    resetTranscript();
    setSttAnalysis(null);
    startListening();
  };

  // Smart feedback based on partial correctness
  const getSmartFeedback = (): string | null => {
    if (exerciseMode !== "both") return null;
    if (isCorrect) return null;
    if (mascCorrect && !femCorrect) {
      if (isInvariant) {
        return tLocal(
          "Du fick maskulina formen rätt. Det här adjektivet har samma form i femininum.",
          "You got the masculine form right. This adjective has the same feminine form."
        );
      }
      return tLocal(
        "Du fick maskulina formen rätt. Kom ihåg att ändra -o till -a i femininum.",
        "You got the masculine form right. Remember to change -o to -a for the feminine."
      );
    }
    if (!mascCorrect && femCorrect) {
      return tLocal(
        "Du fick feminina formen rätt. Kontrollera den maskulina formen.",
        "You got the feminine form right. Check the masculine form."
      );
    }
    return null;
  };

  // Correction details
  const correctionDetails = [
    { label: tLocal("Maskulinum:", "Masculine:"), value: current.masculine },
    { label: tLocal("Femininum:", "Feminine:"), value: current.feminine },
    ...(isInvariant
      ? [{ label: "", value: tLocal("Samma form i maskulinum och femininum.", "Same form for masculine and feminine.") }]
      : []),
  ];

  const ruleText = current.ruleExplanation?.[lang];
  const smartFeedback = showResults ? getSmartFeedback() : null;

  const exerciseModes: { key: ExerciseMode; label: string }[] = [
    { key: "both", label: tLocal("♂ + ♀", "♂ + ♀") },
    { key: "feminine", label: tLocal("♀ Femininum", "♀ Feminine") },
    { key: "sentence", label: tLocal("📝 Mening", "📝 Sentence") },
  ];

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg" ref={contentRef}>
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("adjectives")}</h1>
          <LevelPracticeSelector practiceLevel={practiceLevel} onLevelChange={setPracticeLevel} />
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          {/* Word + save + listen */}
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">{t("translate")}</p>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-heading font-bold text-foreground">{capitalizeFirst(word)}</h2>
              <SaveWordButton key={current.masculine} spanish={current.masculine} context={current.example.es} variant="icon" />
              {ttsSupported && (
                <button
                  onClick={() => ttsSpeak(`${current.masculine}, ${current.feminine}`)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                  title={tLocal("Lyssna", "Listen")}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <span className="inline-block mt-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{practiceLevel}</span>
          </div>

          {/* Exercise mode selector */}
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {exerciseModes.map((m) => (
              <button
                key={m.key}
                onClick={() => { if (!showResults) setExerciseMode(m.key); }}
                disabled={showResults}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  exerciseMode === m.key
                    ? "gradient-peach text-primary-foreground shadow-warm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Input mode toggle */}
          {sttSupported && exerciseMode !== "sentence" && (
            <div className="flex gap-2 mb-4 justify-center">
              {(["write", "speak"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { if (!showResults) { setInputMode(mode); resetTranscript(); setSttAnalysis(null); } }}
                  disabled={showResults}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    inputMode === mode
                      ? "gradient-peach text-primary-foreground shadow-warm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "write" ? tLocal("✍️ Skriv", "✍️ Write") : tLocal("🎤 Tala", "🎤 Speak")}
                </button>
              ))}
            </div>
          )}

          {/* Input area — fixed height */}
          <div className="mb-4 min-h-[120px]">
            {exerciseMode === "both" && inputMode === "write" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {tLocal("Maskulin form:", "Masculine form:")}
                  </label>
                  <input
                    type="text"
                    value={masculineAnswer}
                    onChange={(e) => setMasculineAnswer(e.target.value)}
                    disabled={showResults}
                    className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                      showResults
                        ? mascCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                        : "border-border bg-background"
                    }`}
                    placeholder="..."
                    onKeyDown={(e) => { if (e.key === "Enter" && !showResults) handleCheck(); }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {tLocal("Feminin form:", "Feminine form:")}
                  </label>
                  <input
                    type="text"
                    value={feminineAnswer}
                    onChange={(e) => setFeminineAnswer(e.target.value)}
                    disabled={showResults}
                    className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                      showResults
                        ? femCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                        : "border-border bg-background"
                    }`}
                    placeholder="..."
                    onKeyDown={(e) => { if (e.key === "Enter" && !showResults) handleCheck(); }}
                  />
                </div>
              </div>
            )}

            {exerciseMode === "feminine" && inputMode === "write" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {tLocal("Maskulinum:", "Masculine:")} <span className="font-bold text-foreground">{current.masculine}</span>
                  {" → "}
                  {tLocal("Femininum?", "Feminine?")}
                </label>
                <input
                  type="text"
                  value={feminineAnswer}
                  onChange={(e) => setFeminineAnswer(e.target.value)}
                  disabled={showResults}
                  className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                    showResults
                      ? femCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                  placeholder="..."
                  onKeyDown={(e) => { if (e.key === "Enter" && !showResults) handleCheck(); }}
                />
              </div>
            )}

            {exerciseMode === "sentence" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {tLocal("Fyll i det saknade adjektivet:", "Fill in the missing adjective:")}
                </label>
                <p className="text-base text-foreground mb-2 font-medium">{sentenceBlank.sentence}</p>
                <input
                  type="text"
                  value={sentenceAnswer}
                  onChange={(e) => setSentenceAnswer(e.target.value)}
                  disabled={showResults}
                  className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                    showResults
                      ? sentenceCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                  placeholder="..."
                  onKeyDown={(e) => { if (e.key === "Enter" && !showResults) handleCheck(); }}
                />
              </div>
            )}

            {inputMode === "speak" && exerciseMode !== "sentence" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {tLocal("Säg adjektivet:", "Say the adjective:")}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={isListening ? stopListening : handleStartSpeaking}
                    disabled={showResults || sttProcessing}
                    className={`p-2.5 rounded-md transition ${
                      isListening
                        ? "bg-destructive/20 text-destructive animate-pulse"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {sttProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 px-4 py-2.5 rounded-md border border-border bg-background text-sm text-foreground min-h-[42px] flex items-center">
                    {isListening && (
                      <span className="text-muted-foreground italic">
                        {interimTranscript || transcript || tLocal("Lyssnar...", "Listening...")}
                      </span>
                    )}
                    {!isListening && transcript && <span>{transcript}</span>}
                    {!isListening && !transcript && !showResults && (
                      <span className="text-muted-foreground">{tLocal("Tryck på mikrofonen och säg adjektivet", "Tap the mic and say the adjective")}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback area — fixed height */}
          <div className="min-h-[160px] mb-4">
            {showResults ? (
              <CorrectionCard
                isCorrect={isCorrect}
                correctAnswer={isInvariant ? current.masculine : `${current.masculine} / ${current.feminine}`}
                translation={capitalizeFirst(word)}
                details={correctionDetails}
                exampleSentence={{ es: current.example.es, translated: language === "sv" ? current.example.sv : current.example.en }}
              >
                {smartFeedback && (
                  <div className="rounded-md px-3 py-2 bg-accent/10 border border-accent/20 text-sm text-foreground">
                    {smartFeedback}
                  </div>
                )}
                {ruleText && (
                  <div className="rounded-md px-3 py-2 bg-primary/5 border border-primary/20 text-sm text-foreground">
                    💡 {ruleText}
                  </div>
                )}
                {inputMode === "speak" && sttAnalysis && (
                  <div className="rounded-md px-4 py-3 bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {tLocal("Uttal", "Pronunciation")}: {sttAnalysis.score}%
                    </p>
                    <p className="text-xs text-muted-foreground">{getEncouragement(sttAnalysis.summary, lang)}</p>
                  </div>
                )}
              </CorrectionCard>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/30 text-xs" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!showResults ? (
              <button
                onClick={handleCheck}
                disabled={sttProcessing}
                className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition"
              >
                {sttProcessing ? tLocal("Analyserar...", "Analyzing...") : t("checkAnswer")}
              </button>
            ) : (
              <button onClick={handleNext} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> {t("nextQuestion")}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          {currentIndex + 1} / {available.length}
        </p>
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default AdjectiveExercisePage;
