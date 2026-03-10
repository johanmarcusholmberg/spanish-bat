import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { normalizeAnswer } from "@/lib/answerUtils";
import {
  pronunciationByLevel,
  getItemsByType,
  shuffleItems,
  type PronunciationItem,
} from "@/data/pronunciationData";
import {
  Mic, MicOff, Volume2, SkipForward, RotateCcw,
  CheckCircle2, XCircle, BookmarkPlus, ChevronRight,
  Sparkles, Trophy, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SelectionPopup from "@/components/SelectionPopup";

type Mode = "word" | "phrase" | "sentence" | "repeat" | "random";

interface AttemptResult {
  item: PronunciationItem;
  spoken: string;
  success: boolean;
}

const PronunciationPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const {
    isListening, transcript, interimTranscript,
    startListening, stopListening, resetTranscript,
    isSupported: sttSupported,
  } = useSpanishSTT();
  const { addWord } = useVocabulary();

  const level = user?.level ?? "A1";
  const contentRef = useRef<HTMLDivElement>(null);

  // Mode & state
  const [mode, setMode] = useState<Mode>("word");
  const [items, setItems] = useState<PronunciationItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [hasListened, setHasListened] = useState(false);
  const [history, setHistory] = useState<AttemptResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);
  const stoppedManually = useRef(false);
  const evaluatedRef = useRef(false);

  // Build items when mode or level changes
  useEffect(() => {
    const allItems = pronunciationByLevel[level] || pronunciationByLevel.A1;
    let selected: PronunciationItem[];
    if (mode === "random") {
      selected = shuffleItems(allItems);
    } else if (mode === "repeat") {
      selected = shuffleItems(allItems);
    } else {
      selected = shuffleItems(getItemsByType(allItems, mode));
    }
    setItems(selected.length > 0 ? selected : allItems);
    setCurrentIdx(0);
    setResult(null);
    setHasListened(false);
    setHistory([]);
    setShowSummary(false);
    resetTranscript();
  }, [mode, level, resetTranscript]);

  const currentItem = items[currentIdx] ?? null;
  const progressPct = items.length > 0 ? Math.round(((currentIdx) / items.length) * 100) : 0;

  // Listen to correct pronunciation
  const handleListen = useCallback(() => {
    if (currentItem) {
      speak(currentItem.spanish);
      setHasListened(true);
    }
  }, [currentItem, speak]);

  // Start recording
  const handleRecord = useCallback(() => {
    setResult(null);
    setAnalyzing(false);
    stoppedManually.current = false;
    resetTranscript();
    startListening();
  }, [resetTranscript, startListening]);

  // Stop recording — show analyzing state immediately
  const handleStopAndEvaluate = useCallback(() => {
    stoppedManually.current = true;
    setAnalyzing(true);
    stopListening();
  }, [stopListening]);

  // Evaluate as soon as transcript updates after manual stop
  useEffect(() => {
    if (stoppedManually.current) evaluatedRef.current = false;
  }, [currentIdx]);

  useEffect(() => {
    if (!stoppedManually.current || evaluatedRef.current || !currentItem) return;
    // Wait until STT is done (isListening false) or we have a transcript
    const spoken = transcript.trim();
    if (!spoken && isListening) return; // still recording
    if (!spoken && !isListening) {
      // STT ended with nothing
      setAnalyzing(false);
      return;
    }
    if (!isListening) {
      // Final result ready
      evaluatedRef.current = true;
      const success = normalizeAnswer(spoken) === normalizeAnswer(currentItem.spanish);
      setResult(success ? "correct" : "incorrect");
      setHistory(prev => [...prev, { item: currentItem, spoken, success }]);
      setAnalyzing(false);
    }
  }, [isListening, transcript, currentItem]);

  // Next item
  const handleNext = useCallback(() => {
    if (currentIdx >= items.length - 1) {
      setShowSummary(true);
      return;
    }
    setCurrentIdx(i => i + 1);
    setResult(null);
    setHasListened(false);
    resetTranscript();
  }, [currentIdx, items.length, resetTranscript]);

  // Retry current
  const handleRetry = useCallback(() => {
    setResult(null);
    resetTranscript();
  }, [resetTranscript]);

  // Save to vocabulary
  const handleSave = useCallback(async () => {
    if (!currentItem) return;
    const translation = language === "sv" ? currentItem.swedish : currentItem.english;
    await addWord(currentItem.spanish, translation, currentItem.type);
    setSavedIds(prev => new Set(prev).add(currentItem.id));
  }, [currentItem, addWord, language]);

  // Restart
  const handleRestart = useCallback(() => {
    const allItems = pronunciationByLevel[level] || pronunciationByLevel.A1;
    let selected: PronunciationItem[];
    if (mode === "random" || mode === "repeat") {
      selected = shuffleItems(allItems);
    } else {
      selected = shuffleItems(getItemsByType(allItems, mode));
    }
    setItems(selected.length > 0 ? selected : allItems);
    setCurrentIdx(0);
    setResult(null);
    setHasListened(false);
    setHistory([]);
    setShowSummary(false);
    resetTranscript();
  }, [mode, level, resetTranscript]);

  const modes: { key: Mode; labelSv: string; labelEn: string; icon: string }[] = [
    { key: "word", labelSv: "Ord", labelEn: "Words", icon: "🔤" },
    { key: "phrase", labelSv: "Fraser", labelEn: "Phrases", icon: "💬" },
    { key: "sentence", labelSv: "Meningar", labelEn: "Sentences", icon: "📝" },
    { key: "repeat", labelSv: "Upprepa", labelEn: "Repeat", icon: "🔁" },
    { key: "random", labelSv: "Slumpmässig", labelEn: "Random", icon: "🎲" },
  ];

  const correctCount = history.filter(h => h.success).length;
  const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;

  // Feedback text
  const getFeedback = () => {
    if (!result || !currentItem) return null;
    const spoken = transcript.trim();
    if (result === "correct") {
      const msgs = language === "sv"
        ? ["Perfekt uttal! 🎉", "Utmärkt! Du låter fantastisk! ⭐", "Bra jobbat! Fortsätt så! 💪"]
        : ["Perfect pronunciation! 🎉", "Excellent! You sound amazing! ⭐", "Great job! Keep it up! 💪"];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    // incorrect
    const target = currentItem.spanish;
    if (!spoken) {
      return language === "sv" ? "Jag hörde inget. Försök igen!" : "I didn't catch that. Try again!";
    }
    const tNorm = normalizeAnswer(target).split(" ");
    const sNorm = normalizeAnswer(spoken).split(" ");
    const mismatched = tNorm.filter((w, i) => sNorm[i] !== w);
    if (mismatched.length > 0 && mismatched.length < tNorm.length) {
      const parts = mismatched.slice(0, 3).join(", ");
      return language === "sv"
        ? `Nästan! Öva lite mer på: ${parts}`
        : `Almost! Practice a bit more: ${parts}`;
    }
    return language === "sv"
      ? "Inte riktigt. Lyssna igen och försök en gång till!"
      : "Not quite. Listen again and give it another try!";
  };

  // Summary view
  if (showSummary) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-lg mx-auto text-center py-8">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {language === "sv" ? "Session klar!" : "Session complete!"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === "sv"
              ? `Du klarade ${correctCount} av ${history.length} (${accuracy}% rätt)`
              : `You got ${correctCount} of ${history.length} correct (${accuracy}% accuracy)`}
          </p>
          <div className="space-y-2 mb-6 text-left">
            {history.map((h, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                h.success ? "bg-green-500/10" : "bg-destructive/10"
              )}>
                {h.success
                  ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{h.item.spanish}</span>
                  <span className="text-muted-foreground text-sm ml-2">→ "{h.spoken || "—"}"</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {language === "sv" ? "Gör om" : "Try again"}
            </Button>
            <Button onClick={() => { setMode("random"); }}>
              <Sparkles className="h-4 w-4 mr-1" />
              {language === "sv" ? "Nytt läge" : "New mode"}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl mx-auto" ref={contentRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {language === "sv" ? "Uttalsövning" : "Pronunciation Practice"}
          </h1>
          <div className="text-right">
            <span className="text-sm font-medium text-primary">{level}</span>
            {history.length > 0 && (
              <div className="text-xs text-muted-foreground">{accuracy}% {language === "sv" ? "rätt" : "correct"}</div>
            )}
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                mode === m.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="mr-1.5">{m.icon}</span>
              {language === "sv" ? m.labelSv : m.labelEn}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentIdx + 1} / {items.length}</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {/* STT not supported warning */}
        {!sttSupported && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-4 text-sm">
            {language === "sv"
              ? "Din webbläsare stöder inte röstinmatning. Prova Chrome eller Edge."
              : "Your browser does not support speech recognition. Try Chrome or Edge."}
          </div>
        )}

        {/* Current item card */}
        {currentItem && (
          <div className="bg-card rounded-2xl shadow-soft p-6 sm:p-8 mb-6">
            {/* Type badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                currentItem.type === "word" && "bg-primary/15 text-primary",
                currentItem.type === "phrase" && "bg-accent/50 text-accent-foreground",
                currentItem.type === "sentence" && "bg-secondary text-secondary-foreground",
              )}>
                {currentItem.type === "word"
                  ? (language === "sv" ? "Ord" : "Word")
                  : currentItem.type === "phrase"
                    ? (language === "sv" ? "Fras" : "Phrase")
                    : (language === "sv" ? "Mening" : "Sentence")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleSave}
                disabled={savedIds.has(currentItem.id)}
                title={language === "sv" ? "Spara till ordbok" : "Save to dictionary"}
              >
                <BookmarkPlus className={cn("h-5 w-5", savedIds.has(currentItem.id) && "text-primary")} />
              </Button>
            </div>

            {/* Target text */}
            <p className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2 leading-snug select-text">
              {currentItem.spanish}
            </p>
            <p className="text-center text-muted-foreground text-sm mb-1">
              {language === "sv" ? currentItem.swedish : currentItem.english}
            </p>

            {/* Hint */}
            {currentItem.hint && (
              <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground mt-2 mb-1">
                <Lightbulb className="h-3.5 w-3.5" />
                {currentItem.hint}
              </div>
            )}

            {/* Listen button */}
            <div className="flex justify-center mt-5 mb-4">
              <Button
                variant="outline"
                onClick={handleListen}
                disabled={!ttsSupported}
                className="gap-2"
              >
                <Volume2 className="h-5 w-5" />
                {hasListened
                  ? (language === "sv" ? "Lyssna igen" : "Listen again")
                  : (language === "sv" ? "Lyssna" : "Listen")}
              </Button>
            </div>

            {/* Microphone button */}
            <div className="flex justify-center mb-4">
              {isListening ? (
                <button
                  onClick={handleStopAndEvaluate}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg animate-pulse transition-all"
                  aria-label="Stop recording"
                >
                  <MicOff className="h-8 w-8 sm:h-10 sm:w-10" />
                </button>
              ) : (
                <button
                  onClick={handleRecord}
                  disabled={!sttSupported}
                  className={cn(
                    "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg transition-all",
                    sttSupported
                      ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  aria-label="Start recording"
                >
                  <Mic className="h-8 w-8 sm:h-10 sm:w-10" />
                </button>
              )}
            </div>

            {/* Live transcript */}
            {(isListening || interimTranscript) && (
              <p className="text-center text-muted-foreground text-sm italic min-h-[1.5rem]">
                {interimTranscript || (language === "sv" ? "Lyssnar..." : "Listening...")}
              </p>
            )}

            {/* Result feedback */}
            {result && (
              <div className={cn(
                "mt-4 rounded-xl p-4 text-center transition-all animate-fade-in",
                result === "correct" ? "bg-green-500/10" : "bg-destructive/10"
              )}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  {result === "correct"
                    ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                    : <XCircle className="h-6 w-6 text-destructive" />}
                  <span className={cn(
                    "font-bold text-lg",
                    result === "correct" ? "text-green-600 dark:text-green-400" : "text-destructive"
                  )}>
                    {result === "correct"
                      ? (language === "sv" ? "Rätt!" : "Correct!")
                      : (language === "sv" ? "Försök igen" : "Try again")}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{getFeedback()}</p>
                {transcript && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "sv" ? "Du sa" : "You said"}: <span className="font-medium">"{transcript}"</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          {result === "incorrect" && (
            <Button variant="outline" onClick={handleRetry} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              {language === "sv" ? "Försök igen" : "Retry"}
            </Button>
          )}
          {result && (
            <Button onClick={handleNext} className="gap-1.5">
              {currentIdx >= items.length - 1
                ? (language === "sv" ? "Se resultat" : "See results")
                : (language === "sv" ? "Nästa" : "Next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {!result && !isListening && (
            <Button variant="ghost" onClick={handleNext} className="gap-1.5 text-muted-foreground">
              <SkipForward className="h-4 w-4" />
              {language === "sv" ? "Hoppa över" : "Skip"}
            </Button>
          )}
        </div>

        {/* Session stats */}
        {history.length > 0 && (
          <div className="mt-8 flex justify-center gap-6 text-center text-sm text-muted-foreground">
            <div>
              <div className="text-lg font-bold text-foreground">{history.length}</div>
              {language === "sv" ? "Försök" : "Attempts"}
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">{correctCount}</div>
              {language === "sv" ? "Rätt" : "Correct"}
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{accuracy}%</div>
              {language === "sv" ? "Precision" : "Accuracy"}
            </div>
          </div>
        )}
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default PronunciationPage;
