import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { nouns, getItemsForLevel } from "@/data/spanishData";
import { checkAnswer } from "@/lib/answerUtils";
import { ArrowLeft, RotateCcw, Volume2, Mic, MicOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import SelectionPopup from "@/components/SelectionPopup";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import { capitalizeFirst } from "@/lib/displayUtils";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { analyzePronunciation, getEncouragement } from "@/lib/pronunciationAnalysis";

type InputMode = "write" | "speak";

const NounExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();
  const { speak: ttsSpeak, isSupported: ttsSupported } = useSpanishTTS();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported: sttSupported } = useSpanishSTT();

  useEffect(() => { trackLastActivity("exercises", "/exercises/nouns", t("nouns")); }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [genderAnswer, setGenderAnswer] = useState<"el" | "la" | "">("");
  const [translationAnswer, setTranslationAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [completedNouns, setCompletedNouns] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("write");
  const [sttAnalysis, setSttAnalysis] = useState<ReturnType<typeof analyzePronunciation> | null>(null);
  const [sttProcessing, setSttProcessing] = useState(false);

  const availableNouns = useMemo(
    () => getItemsForLevel(nouns, user?.level || "A1"),
    [user?.level]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setGenderAnswer("");
    setTranslationAnswer("");
    setShowResults(false);
    setSttAnalysis(null);
  }, [user?.level]);

  const contentRef = useRef<HTMLDivElement>(null);

  const current = availableNouns[currentIndex];
  if (!current) return null;

  const word = language === "sv" ? current.sv : current.en;
  const genderCorrect = genderAnswer === current.gender;
  const translationCorrect = inputMode === "write"
    ? checkAnswer(translationAnswer, current.spanish)
    : (sttAnalysis?.score ?? 0) >= 60;

  const handleCheck = () => {
    if (inputMode === "speak" && isListening) {
      stopListening();
      setSttProcessing(true);
      setTimeout(() => {
        const finalTranscript = transcript + (interimTranscript || "");
        if (finalTranscript.trim()) {
          const analysis = analyzePronunciation(current.spanish, finalTranscript);
          setSttAnalysis(analysis);
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
    const newCompleted = completedNouns + 1;
    setCompletedNouns(newCompleted);
    updateProgress("exercises", newCompleted, availableNouns.length);
    setCurrentIndex((prev) => (prev + 1) % availableNouns.length);
    setGenderAnswer("");
    setTranslationAnswer("");
    setShowResults(false);
    setSttAnalysis(null);
    resetTranscript();
  };

  const handleStartSpeaking = () => {
    resetTranscript();
    setSttAnalysis(null);
    startListening();
  };

  const lang = language === "sv" ? "sv" : "en";

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg" ref={contentRef}>
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{t("nouns")}</h1>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          {/* Word + save + listen */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">{t("translate")}</p>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-heading font-bold text-foreground">{capitalizeFirst(word)}</h2>
              <SaveWordButton spanish={current.spanish} context={current.example.es} variant="icon" />
              {ttsSupported && (
                <button
                  onClick={() => ttsSpeak(`${current.gender} ${current.spanish}`)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                  title={language === "sv" ? "Lyssna" : "Listen"}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Input mode toggle */}
          {sttSupported && (
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
                  {mode === "write"
                    ? (language === "sv" ? "✍️ Skriv" : "✍️ Write")
                    : (language === "sv" ? "🎤 Tala" : "🎤 Speak")}
                </button>
              ))}
            </div>
          )}

          {/* Gender selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === "sv" ? "Välj genus:" : "Choose gender:"}
            </label>
            <div className="flex gap-3">
              {(["el", "la"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => !showResults && setGenderAnswer(g)}
                  disabled={showResults}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition ${
                    showResults
                      ? g === current.gender
                        ? "gradient-mint text-secondary-foreground"
                        : genderAnswer === g
                        ? "bg-destructive/20 border border-destructive text-foreground"
                        : "bg-background border border-border text-muted-foreground"
                      : genderAnswer === g
                      ? "gradient-peach text-primary-foreground shadow-warm"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Translation input — fixed min-height to prevent layout shift */}
          <div className="mb-4 min-h-[76px]">
            <label className="block text-sm font-medium text-foreground mb-1">{t("yourAnswer")}</label>
            {inputMode === "write" ? (
              <input
                type="text"
                value={translationAnswer}
                onChange={(e) => setTranslationAnswer(e.target.value)}
                disabled={showResults}
                className={`w-full px-4 py-2.5 rounded-md border text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring ${
                  showResults
                    ? translationCorrect
                      ? "border-mint-dark bg-mint/20"
                      : "border-destructive bg-destructive/10"
                    : "border-border bg-background"
                }`}
                placeholder={language === "sv" ? "Skriv på spanska..." : "Write in Spanish..."}
                onKeyDown={(e) => { if (e.key === "Enter" && !showResults) handleCheck(); }}
              />
            ) : (
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
                      {interimTranscript || transcript || (language === "sv" ? "Lyssnar..." : "Listening...")}
                    </span>
                  )}
                  {!isListening && transcript && <span>{transcript}</span>}
                  {!isListening && !transcript && !showResults && (
                    <span className="text-muted-foreground">{language === "sv" ? "Tryck på mikrofonen och säg ordet" : "Tap the mic and say the word"}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Static feedback area — always present, fixed height */}
          <div className="min-h-[160px] mb-4">
            {showResults ? (
              <div className="space-y-3 animate-fade-in">
                {/* Harmonized correction block */}
                <div className={`rounded-md px-4 py-3 border ${
                  genderCorrect && translationCorrect
                    ? "border-mint-dark bg-mint/10"
                    : "border-destructive bg-destructive/5"
                }`}>
                  <p className={`text-sm font-semibold mb-1 ${
                    genderCorrect && translationCorrect ? "text-mint-dark" : "text-destructive"
                  }`}>
                    {genderCorrect && translationCorrect
                      ? (language === "sv" ? "Rätt ✓" : "Correct ✓")
                      : (language === "sv" ? "Inte helt rätt ✗" : "Not quite right ✗")}
                  </p>
                  <div className="text-sm text-foreground space-y-0.5">
                    <p><span className="text-muted-foreground">{language === "sv" ? "Rätt svar:" : "Correct answer:"}</span> <span className="font-medium">{current.gender} {current.spanish}</span></p>
                    <p><span className="text-muted-foreground">{language === "sv" ? "Översättning:" : "Translation:"}</span> <span className="font-medium">{capitalizeFirst(word)}</span></p>
                    <p><span className="text-muted-foreground">{language === "sv" ? "Genus:" : "Gender:"}</span> <span className="font-medium">{current.gender === "el" ? (language === "sv" ? "maskulinum" : "masculine") : (language === "sv" ? "femininum" : "feminine")}</span></p>
                    <p><span className="text-muted-foreground">{language === "sv" ? "Plural:" : "Plural:"}</span> <span className="font-medium">{current.plural}</span></p>
                  </div>
                </div>

                {/* Speech analysis feedback */}
                {inputMode === "speak" && sttAnalysis && (
                  <div className="rounded-md px-4 py-3 bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {language === "sv" ? "Uttal" : "Pronunciation"}: {sttAnalysis.score}%
                    </p>
                    <p className="text-xs text-muted-foreground">{getEncouragement(sttAnalysis.summary, lang)}</p>
                  </div>
                )}

                {/* Example sentence */}
                <div className="bg-background rounded-md px-3 py-2 text-sm italic text-muted-foreground">
                  "{current.example.es}" — {language === "sv" ? current.example.sv : current.example.en}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/30 text-xs">
                {/* Reserved space for feedback */}
              </div>
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
                {sttProcessing
                  ? (language === "sv" ? "Analyserar..." : "Analyzing...")
                  : t("checkAnswer")}
              </button>
            ) : (
              <button onClick={handleNext} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> {t("nextQuestion")}
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {currentIndex + 1} / {availableNouns.length}
        </p>
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default NounExercisePage;
