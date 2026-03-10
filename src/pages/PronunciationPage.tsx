import React, { useState, useCallback, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  pronunciationByLevel,
  getItemsByType,
  shuffleItems,
  type PronunciationItem,
} from "@/data/pronunciationData";
import {
  analyzePronunciation,
  getTips,
  getEncouragement,
  type PronunciationAnalysis,
} from "@/lib/pronunciationAnalysis";
import {
  Mic, MicOff, Volume2, SkipForward, RotateCcw,
  CheckCircle2, XCircle, BookmarkPlus, ChevronRight,
  Sparkles, Trophy, Lightbulb, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SelectionPopup from "@/components/SelectionPopup";

type Mode = "word" | "phrase" | "sentence" | "repeat" | "random";

interface AttemptResult {
  item: PronunciationItem;
  spoken: string;
  score: number;
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
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
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
      evaluatedRef.current = true;
      const result = analyzePronunciation(currentItem.spanish, spoken);
      setAnalysis(result);
      const success = result.score >= 80;
      setResult(success ? "correct" : "incorrect");
      setHistory(prev => [...prev, { item: currentItem, spoken, score: result.score, success }]);
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
    setAnalysis(null);
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
  const avgScore = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;

  // Compute score-based color for the circular indicator
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
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
              ? `Du klarade ${correctCount} av ${history.length} (snittpoäng ${avgScore}%)`
              : `You got ${correctCount} of ${history.length} correct (avg score ${avgScore}%)`}
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
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{h.item.spanish}</span>
                  <span className="text-muted-foreground text-sm ml-2">→ "{h.spoken || "—"}"</span>
                </div>
                <span className={cn("text-sm font-bold shrink-0", getScoreColor(h.score))}>{h.score}%</span>
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
              <div className="text-xs text-muted-foreground">{avgScore}% {language === "sv" ? "snitt" : "avg"}</div>
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

            {/* Live transcript / analyzing */}
            {analyzing && !isListening && !result && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground min-h-[1.5rem]">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                {language === "sv" ? "Analyserar..." : "Analyzing..."}
              </div>
            )}
            {(isListening || interimTranscript) && (
              <p className="text-center text-muted-foreground text-sm italic min-h-[1.5rem]">
                {interimTranscript || (language === "sv" ? "Lyssnar..." : "Listening...")}
              </p>
            )}

            {/* Result feedback */}
            {result && analysis && currentItem && (
              <div className="mt-4 rounded-xl border border-border p-4 transition-all animate-fade-in space-y-4">
                {/* Score + encouragement */}
                <div className="flex items-center gap-4">
                  <div className={cn("text-3xl font-bold", getScoreColor(analysis.score))}>
                    {analysis.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      {getEncouragement(analysis.summary, language)}
                    </p>
                    <Progress value={analysis.score} className="h-2 mt-1.5" />
                  </div>
                </div>

                {/* Word-by-word breakdown */}
                {currentItem.type !== "word" && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {language === "sv" ? "Ord-för-ord analys:" : "Word-by-word analysis:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.wordResults.filter(w => w.status !== "extra").map((w, i) => (
                        <span
                          key={i}
                          className={cn(
                            "px-2 py-1 rounded-md text-sm font-medium transition-all",
                            w.status === "correct" && "bg-green-500/15 text-green-700 dark:text-green-400",
                            w.status === "close" && "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
                            w.status === "skipped" && "bg-destructive/10 text-destructive line-through",
                            w.status === "wrong" && "bg-destructive/15 text-destructive",
                          )}
                          title={w.spoken ? `${language === "sv" ? "Du sa" : "You said"}: "${w.spoken}"` : undefined}
                        >
                          {w.target}
                          {w.status === "close" && w.spoken && (
                            <span className="text-xs ml-1 opacity-70">→ {w.spoken}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* What you said */}
                {transcript && (
                  <p className="text-xs text-muted-foreground">
                    {language === "sv" ? "Du sa" : "You said"}: <span className="font-medium italic">"{transcript}"</span>
                  </p>
                )}

                {/* Tips */}
                {analysis.score < 95 && (() => {
                  const tips = getTips(analysis, currentItem.spanish);
                  return tips.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        {language === "sv" ? "Tips:" : "Tips:"}
                      </p>
                      {tips.map((tip, i) => (
                        <p key={i} className="text-sm text-foreground/80 pl-5">
                          • {language === "sv" ? tip.sv : tip.en}
                        </p>
                      ))}
                    </div>
                  ) : null;
                })()}

                {/* Quick actions inside feedback */}
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {language === "sv" ? "Försök igen" : "Retry"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleListen} className="gap-1">
                    <Volume2 className="h-3.5 w-3.5" />
                    {language === "sv" ? "Lyssna igen" : "Listen again"}
                  </Button>
                  {analysis.closeWords.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => speak(analysis.closeWords[0])}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {language === "sv" ? `Öva "${analysis.closeWords[0]}"` : `Practice "${analysis.closeWords[0]}"`}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
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
