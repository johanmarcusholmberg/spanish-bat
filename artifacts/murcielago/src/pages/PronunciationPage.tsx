import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
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
  assessPronunciation,
  type AssessmentResult,
} from "@/lib/pronunciationAssessmentService";
import { getEncouragement } from "@/lib/pronunciationAnalysis";
import {
  recordPronunciationAttempt,
  decayWeakness,
} from "@/lib/pronunciationStats";
import {
  Mic, MicOff, Volume2, SkipForward, RotateCcw,
  CheckCircle2, XCircle, BookmarkPlus, ChevronRight,
  Sparkles, Trophy, Lightbulb, AlertCircle, Info,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import SentenceWordPicker from "@/components/vocabulary/SentenceWordPicker";

type Mode = "word" | "phrase" | "sentence" | "repeat" | "random";

interface AttemptResult {
  item: PronunciationItem;
  spoken: string;
  score: number;
  success: boolean;
}

const MAX_RECORDING_MS = 15_000;

const PronunciationPage = () => {
  const { user, session } = useAuth();
  const { t, language } = useLanguage();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const { addWord } = useVocabulary();

  const level = user?.level ?? "A1";
  const userId = session?.user?.id ?? null;
  const contentRef = useRef<HTMLDivElement>(null);
  const [showWordPicker, setShowWordPicker] = useState(false);

  // Mode & state
  const [mode, setMode] = useState<Mode>("word");
  const [items, setItems] = useState<PronunciationItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [history, setHistory] = useState<AttemptResult[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [retryingSamePhrase, setRetryingSamePhrase] = useState(false);

  const currentItem = items[currentIdx] ?? null;

  // Refs let `handleTranscript` (which the recorder captures once) always
  // see the latest values without needing to re-create the callback.
  const ctxRef = useRef({
    item: currentItem,
    level,
    language: language as "sv" | "en",
    userId,
    retryingSamePhrase,
  });
  ctxRef.current = {
    item: currentItem,
    level,
    language: language as "sv" | "en",
    userId,
    retryingSamePhrase,
  };
  const recorderRef = useRef<ReturnType<typeof useAudioRecorder> | null>(null);

  // When the recorder finishes, run the assessment. Stable identity so the
  // recorder hook does not re-subscribe on every render.
  const handleTranscript = useCallback(async (transcriptText: string) => {
    const ctx = ctxRef.current;
    const item = ctx.item;
    if (!item) return;
    const result = await assessPronunciation({
      expectedText: item.spanish,
      transcript: transcriptText,
      level: ctx.level,
      uiLang: ctx.language,
    });
    setAssessment(result);
    const success = result.score >= 80;
    setHistory((prev) => [
      ...prev,
      {
        item,
        spoken: transcriptText,
        score: result.score,
        success,
      },
    ]);
    recordPronunciationAttempt(ctx.userId, {
      phraseId: item.id,
      score: result.score,
      isRetry: ctx.retryingSamePhrase,
      weakSounds: result.weakSounds,
      weakWords: result.weakWords,
    });
    if (success) {
      decayWeakness(ctx.userId, result.weakSounds, result.weakWords);
    }
    recorderRef.current?.markFeedbackReady();
  }, []);

  const recorder = useAudioRecorder({
    maxDurationMs: MAX_RECORDING_MS,
    onTranscript: handleTranscript,
  });
  recorderRef.current = recorder;

  // Build items when mode or level changes
  useEffect(() => {
    const allItems = pronunciationByLevel[level] || pronunciationByLevel.A1;
    let selected: PronunciationItem[];
    if (mode === "random" || mode === "repeat") {
      selected = shuffleItems(allItems);
    } else {
      selected = shuffleItems(getItemsByType(allItems, mode));
    }
    setItems(selected.length > 0 ? selected : allItems);
    setCurrentIdx(0);
    setAssessment(null);
    setHasListened(false);
    setHistory([]);
    setShowSummary(false);
    setRetryingSamePhrase(false);
    recorder.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level]);

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
    setAssessment(null);
    void recorder.start();
  }, [recorder]);

  const handleStop = useCallback(() => {
    recorder.stop();
  }, [recorder]);

  // Next item
  const handleNext = useCallback(() => {
    if (currentIdx >= items.length - 1) {
      setShowSummary(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setAssessment(null);
    setHasListened(false);
    setRetryingSamePhrase(false);
    recorder.reset();
  }, [currentIdx, items.length, recorder]);

  // Retry current
  const handleRetry = useCallback(() => {
    setAssessment(null);
    setRetryingSamePhrase(true);
    recorder.reset();
  }, [recorder]);

  // Save to vocabulary
  const handleSave = useCallback(async () => {
    if (!currentItem) return;
    const translation = language === "sv" ? currentItem.swedish : currentItem.english;
    await addWord(currentItem.spanish, translation, currentItem.type);
    setSavedIds((prev) => new Set(prev).add(currentItem.id));
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
    setAssessment(null);
    setHasListened(false);
    setHistory([]);
    setShowSummary(false);
    setRetryingSamePhrase(false);
    recorder.reset();
  }, [mode, level, recorder]);

  const modes: { key: Mode; tKey: string; icon: string }[] = useMemo(
    () => [
      { key: "word", tKey: "pronModeWords", icon: "🔤" },
      { key: "phrase", tKey: "pronModePhrases", icon: "💬" },
      { key: "sentence", tKey: "pronModeSentences", icon: "📝" },
      { key: "repeat", tKey: "pronModeRepeat", icon: "🔁" },
      { key: "random", tKey: "pronModeRandom", icon: "🎲" },
    ],
    [],
  );

  const correctCount = history.filter((h) => h.success).length;
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
      : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  // Derived recorder UI states
  const isRecording = recorder.state === "recording";
  const isProcessing = recorder.state === "processing";
  const showInterim =
    isRecording && (recorder.interimTranscript || recorder.transcript);
  const recError = recorder.error;

  // Summary view
  if (showSummary) {
    return (
      <AppLayout>
        <div className="animate-fade-in max-w-lg mx-auto text-center py-8">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {t("pronSessionComplete")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("pronSessionSummary")
              .replace("{correct}", String(correctCount))
              .replace("{total}", String(history.length))
              .replace("{avg}", String(avgScore))}
          </p>
          <div className="space-y-2 mb-6 text-left">
            {history.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  h.success ? "bg-green-500/10" : "bg-destructive/10",
                )}
              >
                {h.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{h.item.spanish}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    → "{h.spoken || "—"}"
                  </span>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold shrink-0",
                    getScoreColor(h.score),
                  )}
                >
                  {h.score}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("pronTryAgainSession")}
            </Button>
            <Button onClick={() => setMode("random")}>
              <Sparkles className="h-4 w-4 mr-1" />
              {t("pronNewMode")}
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {t("pronTitle")}
          </h1>
          <div className="text-right">
            <span className="text-sm font-medium text-primary">{level}</span>
            {history.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {avgScore}% {t("pronAvg")}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t("pronTagline")}</p>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[40px]",
                mode === m.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              <span className="mr-1.5">{m.icon}</span>
              {t(m.tKey)}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {currentIdx + 1} / {items.length}
            </span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {/* Recorder error / unsupported / permission states */}
        {!recorder.isSupported && (
          <PermissionBanner
            tone="error"
            icon={<AlertCircle className="h-5 w-5 shrink-0" />}
            message={t("micUnsupported")}
          />
        )}
        {recorder.isSupported && recorder.permission === "denied" && (
          <PermissionBanner
            tone="error"
            icon={<ShieldAlert className="h-5 w-5 shrink-0" />}
            message={t("micDenied")}
          />
        )}
        {recorder.isSupported &&
          recError?.kind === "no_microphone" && (
            <PermissionBanner
              tone="error"
              icon={<AlertCircle className="h-5 w-5 shrink-0" />}
              message={t("micUnavailable")}
              action={
                <Button size="sm" variant="outline" onClick={() => recorder.requestPermission()}>
                  {t("micRetryButton")}
                </Button>
              }
            />
          )}
        {recorder.isSupported &&
          recorder.permission === "prompt" &&
          recorder.state !== "requesting_permission" && (
            <PermissionBanner
              tone="info"
              icon={<Info className="h-5 w-5 shrink-0" />}
              message={t("micNeedAccess")}
              action={
                <Button size="sm" onClick={() => recorder.requestPermission()}>
                  {t("micGrantAccess")}
                </Button>
              }
            />
          )}
        {recorder.state === "requesting_permission" && (
          <PermissionBanner
            tone="info"
            icon={<Info className="h-5 w-5 shrink-0 animate-pulse" />}
            message={t("micCheckingPermission")}
          />
        )}

        {/* Current item card */}
        {currentItem && (
          <div className="bg-card rounded-2xl shadow-soft p-6 sm:p-8 mb-6">
            {/* Type badge + save */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full",
                  currentItem.type === "word" && "bg-primary/15 text-primary",
                  currentItem.type === "phrase" &&
                    "bg-accent/50 text-accent-foreground",
                  currentItem.type === "sentence" &&
                    "bg-secondary text-secondary-foreground",
                )}
              >
                {currentItem.type === "word"
                  ? t("pronWordLabel")
                  : currentItem.type === "phrase"
                    ? t("pronPhraseLabel")
                    : t("pronSentenceLabel")}
              </span>
              {currentItem.type === "word" ? (
                <SaveWordButton spanish={currentItem.spanish} context="pronunciation" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => setShowWordPicker(true)}
                  title={t("pronSaveToDict")}
                  aria-label={t("pronSaveToDict")}
                >
                  <BookmarkPlus className="h-5 w-5" />
                </Button>
              )}
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
                className="gap-2 min-h-[44px]"
              >
                <Volume2 className="h-5 w-5" />
                {hasListened ? t("pronListenAgain") : t("pronListen")}
              </Button>
            </div>

            {/* Echo (mic) button */}
            <div className="flex flex-col items-center gap-2 mb-4">
              {isRecording ? (
                <button
                  onClick={handleStop}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg animate-pulse transition-all touch-manipulation"
                  aria-label={t("pronStop")}
                >
                  <MicOff className="h-8 w-8 sm:h-10 sm:w-10" />
                </button>
              ) : (
                <button
                  onClick={handleRecord}
                  disabled={
                    !recorder.isSupported ||
                    recorder.permission === "denied" ||
                    isProcessing
                  }
                  className={cn(
                    "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg transition-all touch-manipulation",
                    recorder.isSupported &&
                      recorder.permission !== "denied" &&
                      !isProcessing
                      ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                  aria-label={t("pronStart")}
                >
                  <Mic className="h-8 w-8 sm:h-10 sm:w-10" />
                </button>
              )}
              <span className="text-xs text-muted-foreground">
                {isRecording
                  ? t("pronRecording")
                  : isProcessing
                    ? t("pronAnalyzing")
                    : t("pronEcho")}
              </span>
            </div>

            {/* Live transcript / processing */}
            {isProcessing && !assessment && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground min-h-[1.5rem]">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                {recError?.kind === "max_duration"
                  ? t("micMaxReached")
                  : t("pronAnalyzing")}
              </div>
            )}
            {showInterim && (
              <p className="text-center text-muted-foreground text-sm italic min-h-[1.5rem]">
                {recorder.interimTranscript || t("pronListening")}
              </p>
            )}

            {/* Result feedback */}
            {assessment && currentItem && (
              <div className="mt-4 rounded-xl border border-border p-4 transition-all animate-fade-in space-y-4">
                {/* Score + encouragement */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(assessment.score),
                    )}
                  >
                    {assessment.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      {getEncouragement(
                        assessment.analysis.summary,
                        language as "sv" | "en",
                      )}
                    </p>
                    <Progress
                      value={assessment.score}
                      className="h-2 mt-1.5"
                    />
                  </div>
                </div>

                {/* Word-by-word breakdown */}
                {currentItem.type !== "word" && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t("pronWordByWord")}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {assessment.analysis.wordResults
                        .filter((w) => w.status !== "extra")
                        .map((w, i) => (
                          <span
                            key={i}
                            className={cn(
                              "px-2 py-1 rounded-md text-sm font-medium transition-all",
                              w.status === "correct" &&
                                "bg-green-500/15 text-green-700 dark:text-green-400",
                              w.status === "close" &&
                                "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
                              w.status === "skipped" &&
                                "bg-destructive/10 text-destructive line-through",
                              w.status === "wrong" &&
                                "bg-destructive/15 text-destructive",
                            )}
                            title={
                              w.spoken
                                ? `${t("pronYouSaid")}: "${w.spoken}"`
                                : undefined
                            }
                          >
                            {w.target}
                            {w.status === "close" && w.spoken && (
                              <span className="text-xs ml-1 opacity-70">
                                → {w.spoken}
                              </span>
                            )}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* What you said */}
                {assessment.transcript && (
                  <p className="text-xs text-muted-foreground">
                    {t("pronYouSaid")}:{" "}
                    <span className="font-medium italic">
                      "{assessment.transcript}"
                    </span>
                  </p>
                )}

                {/* Suggestions */}
                {assessment.suggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5" />
                      {t("pronTipsLabel")}:
                    </p>
                    {assessment.suggestions.map((s, i) => (
                      <p
                        key={i}
                        className="text-sm text-foreground/80 pl-5"
                      >
                        • {s.message}
                      </p>
                    ))}
                  </div>
                )}

                {/* Honest disclosure */}
                {assessment.source === "heuristic_placeholder" && (
                  <p className="text-[11px] text-muted-foreground/70 italic flex items-start gap-1">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    {t("pronAssessmentNote")}
                  </p>
                )}

                {/* Quick actions inside feedback */}
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="gap-1 min-h-[40px]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("pronRetry")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleListen}
                    className="gap-1 min-h-[40px]"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    {t("pronListenAgain")}
                  </Button>
                  {assessment.analysis.closeWords.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 min-h-[40px]"
                      onClick={() => speak(assessment.analysis.closeWords[0])}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {t("pronPracticeWord")} "
                      {assessment.analysis.closeWords[0]}"
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          {assessment && (
            <Button onClick={handleNext} className="gap-1.5 min-h-[44px]">
              {currentIdx >= items.length - 1
                ? t("pronSeeResults")
                : t("pronContinue")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {!assessment && !isRecording && !isProcessing && (
            <Button
              variant="ghost"
              onClick={handleNext}
              className="gap-1.5 text-muted-foreground min-h-[44px]"
            >
              <SkipForward className="h-4 w-4" />
              {t("pronSkip")}
            </Button>
          )}
        </div>

        {/* Session stats */}
        {history.length > 0 && (
          <div className="mt-8 flex justify-center gap-6 text-center text-sm text-muted-foreground">
            <div>
              <div className="text-lg font-bold text-foreground">
                {history.length}
              </div>
              {t("pronAttempts")}
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">
                {correctCount}
              </div>
              {t("pronCorrect")}
            </div>
            <div>
              <div className="text-lg font-bold text-primary">{avgScore}%</div>
              {t("pronAccuracy")}
            </div>
          </div>
        )}
      </div>
      {currentItem && currentItem.type !== "word" && (
        <SentenceWordPicker
          sentence={currentItem.spanish}
          context="pronunciation"
          open={showWordPicker}
          onOpenChange={setShowWordPicker}
        />
      )}
    </AppLayout>
  );
};

interface PermissionBannerProps {
  tone: "info" | "error";
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}

const PermissionBanner: React.FC<PermissionBannerProps> = ({
  tone,
  icon,
  message,
  action,
}) => (
  <div
    className={cn(
      "rounded-lg p-4 mb-4 flex items-center gap-3",
      tone === "error"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-foreground",
    )}
  >
    {icon}
    <p className="flex-1 text-sm">{message}</p>
    {action}
  </div>
);

export default PronunciationPage;
