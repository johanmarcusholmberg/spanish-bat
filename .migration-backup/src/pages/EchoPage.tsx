import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { analyzePronunciation, getEncouragement } from "@/lib/pronunciationAnalysis";
import { checkAnswer } from "@/lib/answerUtils";
import { capitalizeFirst } from "@/lib/displayUtils";
import { useEchoLoop, EchoStep } from "@/hooks/useEchoLoop";
import AppLayout from "@/components/AppLayout";
import MurciMascot from "@/components/MurciMascot";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import SelectionPopup from "@/components/SelectionPopup";
import { ArrowLeft, Volume2, Mic, MicOff, Loader2, RotateCcw, ChevronRight, Trophy } from "lucide-react";

const murciMessages = {
  recognition: { sv: "Lär dig det nya ordet!", en: "Learn the new word!" },
  speaking: { sv: "Säg det högt – eka språket!", en: "Say it aloud – echo the language!" },
  context: { sv: "Fyll i det saknade ordet!", en: "Fill in the missing word!" },
  production: { sv: "Nu producera en hel mening!", en: "Now produce a full sentence!" },
  correct: { sv: "Perfekt! 🎉", en: "Perfect! 🎉" },
  tryAgain: { sv: "Nästan! Försök igen.", en: "Almost! Try again." },
  done: { sv: "Sessionen är klar! Bra jobbat! 🦇", en: "Session complete! Great job! 🦇" },
};

const EchoPage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();
  const { speak: ttsSpeak, isSupported: ttsSupported } = useSpanishTTS();
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript, isSupported: sttSupported } = useSpanishSTT();

  const lang = language === "sv" ? "sv" : "en";
  const {
    currentWord, currentStep, echoNumber, totalEchos,
    wordIndex, totalWords, wordsCompleted, completed,
    advanceStep, resetSession,
  } = useEchoLoop((user?.level || "A1") as any, lang);

  useEffect(() => { trackLastActivity("exercises", "/learn/echo", "Echo"); }, []);

  const [showResult, setShowResult] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sttAnalysis, setSttAnalysis] = useState<ReturnType<typeof analyzePronunciation> | null>(null);
  const [sttProcessing, setSttProcessing] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const resetStepState = () => {
    setShowResult(false);
    setInputValue("");
    setSttAnalysis(null);
    setSttProcessing(false);
    setIsCorrect(false);
    resetTranscript();
  };

  if (completed) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-lg mx-auto text-center" ref={contentRef}>
          <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
            <ArrowLeft className="h-4 w-4" /> {t("exercises")}
          </button>
          <div className="bg-card rounded-lg p-8 shadow-soft">
            <MurciMascot size="lg" mood="celebrating" message={murciMessages.done[lang]} />
            <div className="mt-6">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                {lang === "sv" ? "Echo-session klar!" : "Echo Session Complete!"}
              </h2>
              <p className="text-muted-foreground mb-1">
                {lang === "sv" ? `${wordsCompleted} ord bemästrade` : `${wordsCompleted} words mastered`}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {lang === "sv" ? "Orden kommer att komma tillbaka för repetition." : "Words will return for review."}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { resetSession(); resetStepState(); }} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> {lang === "sv" ? "Ny session" : "New Session"}
              </button>
              <button onClick={() => navigate("/exercises")} className="flex-1 py-2.5 rounded-md bg-muted text-foreground font-semibold hover:bg-muted/80 transition">
                {t("exercises")}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!currentWord) return null;

  const noun = currentWord.noun;
  const wordDisplay = `${noun.gender} ${noun.spanish}`;
  const translation = lang === "sv" ? noun.sv : noun.en;

  // --- Step handlers ---

  const handleRecognitionContinue = () => {
    ttsSupported && ttsSpeak(wordDisplay);
    advanceStep();
    resetStepState();
  };

  const handleSpeakingCheck = () => {
    if (isListening) {
      stopListening();
      setSttProcessing(true);
      setTimeout(() => {
        const final = transcript + (interimTranscript || "");
        if (final.trim()) {
          const analysis = analyzePronunciation(wordDisplay, final);
          setSttAnalysis(analysis);
          setIsCorrect(analysis.score >= 60);
        }
        setSttProcessing(false);
        setShowResult(true);
      }, 600);
      return;
    }
    // If no STT, just pass
    setIsCorrect(true);
    setShowResult(true);
  };

  const handleContextCheck = () => {
    const correct = checkAnswer(inputValue, currentWord.contextAnswer);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleProductionCheck = () => {
    const correct = checkAnswer(inputValue, currentWord.productionAnswer);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    logActivity();
    updateProgress("exercises", wordsCompleted + 1, totalWords);
    advanceStep();
    resetStepState();
  };

  const stepLabel = (step: EchoStep) => {
    const labels: Record<EchoStep, { sv: string; en: string }> = {
      recognition: { sv: "Lär känna", en: "Recognize" },
      speaking: { sv: "Uttala", en: "Speak" },
      context: { sv: "Kontext", en: "Context" },
      production: { sv: "Producera", en: "Produce" },
    };
    return labels[step][lang];
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg mx-auto" ref={contentRef}>
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">Echo Learning</h1>
          <span className="text-sm text-muted-foreground">{wordIndex + 1}/{totalWords}</span>
        </div>

        {/* Echo step progress */}
        <div className="flex items-center gap-1.5 mb-4">
          {(["recognition", "speaking", "context", "production"] as EchoStep[]).map((step, i) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all ${
                i < echoNumber - 1 ? "bg-primary" :
                i === echoNumber - 1 ? "gradient-peach" :
                "bg-muted"
              }`} />
              <span className={`text-[10px] font-medium ${
                i === echoNumber - 1 ? "text-primary" : "text-muted-foreground"
              }`}>{stepLabel(step)}</span>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          {/* Murci guide */}
          <div className="flex justify-center mb-4">
            <MurciMascot
              size="sm"
              mood={showResult ? (isCorrect ? "celebrating" : "encouraging") : "happy"}
              message={showResult
                ? (isCorrect ? murciMessages.correct[lang] : murciMessages.tryAgain[lang])
                : murciMessages[currentStep][lang]}
            />
          </div>

          <p className="text-center text-xs text-muted-foreground mb-4">
            Echo {echoNumber}/{totalEchos} — {stepLabel(currentStep)}
          </p>

          {/* ============ STEP: RECOGNITION ============ */}
          {currentStep === "recognition" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-heading font-bold text-foreground">{capitalizeFirst(noun.spanish)}</h2>
                <SaveWordButton spanish={noun.spanish} context={noun.example.es} variant="icon" />
                {ttsSupported && (
                  <button onClick={() => ttsSpeak(wordDisplay)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{capitalizeFirst(translation)}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">{noun.gender}</span> — {noun.gender === "el" ? (lang === "sv" ? "maskulinum" : "masculine") : (lang === "sv" ? "femininum" : "feminine")}</p>
                <p>{lang === "sv" ? "Plural:" : "Plural:"} <span className="font-medium text-foreground">{noun.plural}</span></p>
              </div>
              <div className="bg-background rounded-md px-3 py-2 text-sm italic text-muted-foreground">
                "{noun.example.es}" — {lang === "sv" ? noun.example.sv : noun.example.en}
              </div>
              <button onClick={handleRecognitionContinue} className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2">
                {lang === "sv" ? "Jag har lärt mig" : "Got it"} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ============ STEP: SPEAKING ============ */}
          {currentStep === "speaking" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">{lang === "sv" ? "Säg:" : "Say:"}</p>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground">"{wordDisplay}"</h2>
                  {ttsSupported && (
                    <button onClick={() => ttsSpeak(wordDisplay)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-[60px]">
                {sttSupported ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isListening) { handleSpeakingCheck(); }
                        else { resetTranscript(); setSttAnalysis(null); startListening(); }
                      }}
                      disabled={showResult || sttProcessing}
                      className={`p-2.5 rounded-md transition ${
                        isListening ? "bg-destructive/20 text-destructive animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {sttProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <div className="flex-1 px-4 py-2.5 rounded-md border border-border bg-background text-sm text-foreground min-h-[42px] flex items-center">
                      {isListening && <span className="text-muted-foreground italic">{interimTranscript || transcript || (lang === "sv" ? "Lyssnar..." : "Listening...")}</span>}
                      {!isListening && transcript && <span>{transcript}</span>}
                      {!isListening && !transcript && !showResult && <span className="text-muted-foreground">{lang === "sv" ? "Tryck på mikrofonen" : "Tap the mic"}</span>}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    {lang === "sv" ? "Röstigenkänning stöds inte i denna webbläsare." : "Speech recognition not supported in this browser."}
                  </p>
                )}
              </div>

              {/* Result area */}
              <div className="min-h-[60px]">
                {showResult && sttAnalysis && (
                  <div className={`rounded-md px-4 py-3 border ${isCorrect ? "border-mint-dark bg-mint/10" : "border-destructive bg-destructive/5"}`}>
                    <p className={`text-sm font-semibold ${isCorrect ? "text-mint-dark" : "text-destructive"}`}>
                      {isCorrect ? (lang === "sv" ? "Bra uttal! ✓" : "Good pronunciation! ✓") : (lang === "sv" ? "Försök igen ✗" : "Try again ✗")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{sttAnalysis.score}% — {getEncouragement(sttAnalysis.summary, lang)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!showResult ? (
                  <button onClick={handleSpeakingCheck} disabled={sttProcessing} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition">
                    {sttProcessing ? (lang === "sv" ? "Analyserar..." : "Analyzing...") : t("checkAnswer")}
                  </button>
                ) : (
                  <button onClick={handleContinue} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    <ChevronRight className="h-4 w-4" /> {lang === "sv" ? "Fortsätt" : "Continue"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============ STEP: CONTEXT ============ */}
          {currentStep === "context" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{lang === "sv" ? "Fyll i det saknade ordet:" : "Fill in the missing word:"}</p>
                <p className="text-xl font-heading font-bold text-foreground">{currentWord.contextSentence}</p>
              </div>

              <div className="min-h-[52px]">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={showResult}
                  className={`w-full px-4 py-2.5 rounded-md border text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring ${
                    showResult
                      ? isCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                  placeholder={lang === "sv" ? "Skriv svaret..." : "Type the answer..."}
                  onKeyDown={(e) => { if (e.key === "Enter" && !showResult) handleContextCheck(); }}
                />
              </div>

              <div className="min-h-[60px]">
                {showResult && (
                  <div className={`rounded-md px-4 py-3 border ${isCorrect ? "border-mint-dark bg-mint/10" : "border-destructive bg-destructive/5"}`}>
                    <p className={`text-sm font-semibold ${isCorrect ? "text-mint-dark" : "text-destructive"}`}>
                      {isCorrect ? (lang === "sv" ? "Rätt ✓" : "Correct ✓") : (lang === "sv" ? "Inte helt rätt ✗" : "Not quite right ✗")}
                    </p>
                    {!isCorrect && <p className="text-sm text-foreground mt-1">{lang === "sv" ? "Rätt svar:" : "Correct answer:"} <span className="font-medium">{currentWord.contextAnswer}</span></p>}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!showResult ? (
                  <button onClick={handleContextCheck} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition">
                    {t("checkAnswer")}
                  </button>
                ) : (
                  <button onClick={handleContinue} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    <ChevronRight className="h-4 w-4" /> {lang === "sv" ? "Fortsätt" : "Continue"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============ STEP: PRODUCTION ============ */}
          {currentStep === "production" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{lang === "sv" ? "Översätt till spanska:" : "Translate to Spanish:"}</p>
                <p className="text-xl font-heading font-bold text-foreground">"{currentWord.productionPrompt[lang]}"</p>
              </div>

              <div className="min-h-[52px]">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={showResult}
                  className={`w-full px-4 py-2.5 rounded-md border text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring ${
                    showResult
                      ? isCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                  placeholder={lang === "sv" ? "Skriv på spanska..." : "Write in Spanish..."}
                  onKeyDown={(e) => { if (e.key === "Enter" && !showResult) handleProductionCheck(); }}
                />
              </div>

              <div className="min-h-[60px]">
                {showResult && (
                  <div className={`rounded-md px-4 py-3 border ${isCorrect ? "border-mint-dark bg-mint/10" : "border-destructive bg-destructive/5"}`}>
                    <p className={`text-sm font-semibold ${isCorrect ? "text-mint-dark" : "text-destructive"}`}>
                      {isCorrect ? (lang === "sv" ? "Rätt ✓" : "Correct ✓") : (lang === "sv" ? "Inte helt rätt ✗" : "Not quite right ✗")}
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      <span className="text-muted-foreground">{lang === "sv" ? "Korrekt:" : "Correct:"}</span>{" "}
                      <span className="font-medium">{currentWord.productionAnswer}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!showResult ? (
                  <button onClick={handleProductionCheck} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition">
                    {t("checkAnswer")}
                  </button>
                ) : (
                  <button onClick={handleContinue} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                    <ChevronRight className="h-4 w-4" /> {lang === "sv" ? "Fortsätt" : "Continue"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Word counter */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {lang === "sv" ? "Ord" : "Word"} {wordIndex + 1} / {totalWords}
        </p>
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default EchoPage;
