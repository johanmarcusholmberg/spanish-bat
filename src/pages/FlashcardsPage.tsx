import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { flashcardData } from "@/data/flashcardData";
import { getItemsForLevel } from "@/data/spanishData";
import { RotateCcw, ThumbsUp, ThumbsDown, Layers, Volume2, Pen, Mic, MicOff, Eye, BarChart3 } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useSpanishSTT } from "@/hooks/useSpanishSTT";
import { supabase } from "@/integrations/supabase/client";
import SelectionPopup from "@/components/SelectionPopup";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeAnswer } from "@/lib/answerUtils";
import { analyzePronunciation } from "@/lib/pronunciationAnalysis";

type FlashcardMode = "classic" | "write" | "speak";

interface CardState {
  interval: number;
  nextReview: number;
  ease: number;
}

interface SessionStats {
  total: number;
  correct: number;
  incorrect: number;
  byMode: Record<FlashcardMode, { correct: number; incorrect: number }>;
}

const emptyStats: SessionStats = {
  total: 0, correct: 0, incorrect: 0,
  byMode: {
    classic: { correct: 0, incorrect: 0 },
    write: { correct: 0, incorrect: 0 },
    speak: { correct: 0, incorrect: 0 },
  },
};

const FlashcardsPage = () => {
  const { t, language } = useLanguage();
  const { user, session } = useAuth();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();

  useEffect(() => { trackLastActivity("flashcards", "/practice/flashcards", t("flashcards")); }, []);
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const stt = useSpanishSTT();

  const [mode, setMode] = useState<FlashcardMode>("classic");
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [stats, setStats] = useState<SessionStats>({ ...emptyStats });

  // Write mode state
  const [writeAnswer, setWriteAnswer] = useState("");
  const [writeResult, setWriteResult] = useState<null | "correct" | "incorrect">(null);

  // Speak mode state
  const [speakResult, setSpeakResult] = useState<null | { correct: boolean; score: number; spoken: string }>(null);
  const [speakChecking, setSpeakChecking] = useState(false);

  // Load SRS states from DB
  useEffect(() => {
    if (!session?.user) return;
    const load = async () => {
      const { data } = await supabase
        .from("flashcard_srs")
        .select("*")
        .eq("user_id", session.user.id);
      if (data) {
        const states: Record<string, CardState> = {};
        for (const row of data) {
          states[row.card_id] = {
            interval: row.interval_days,
            nextReview: new Date(row.next_review).getTime(),
            ease: row.ease,
          };
        }
        setCardStates(states);
      }
    };
    load();
  }, [session?.user?.id]);

  const allCards = useMemo(
    () => getItemsForLevel(flashcardData, user?.level || "A1"),
    [user?.level]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setStats({ ...emptyStats });
  }, [user?.level]);

  // Sort: due review first, then shuffle new cards
  const sortedCards = useMemo(() => {
    const now = Date.now();
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    return shuffled.sort((a, b) => {
      const stateA = cardStates[a.id];
      const stateB = cardStates[b.id];
      const dueA = stateA ? stateA.nextReview : 0;
      const dueB = stateB ? stateB.nextReview : 0;
      if (dueA <= now && dueB > now) return -1;
      if (dueA > now && dueB <= now) return 1;
      return 0;
    });
  }, [allCards, cardStates]);

  const currentCard = sortedCards[currentIndex % sortedCards.length];

  const recordResult = useCallback((correct: boolean, currentMode: FlashcardMode) => {
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      byMode: {
        ...prev.byMode,
        [currentMode]: {
          correct: prev.byMode[currentMode].correct + (correct ? 1 : 0),
          incorrect: prev.byMode[currentMode].incorrect + (correct ? 0 : 1),
        },
      },
    }));
    if (correct) {
      updateProgress("flashcards", stats.correct + 1, allCards.length);
    }
    logActivity();
  }, [stats.correct, allCards.length, updateProgress, logActivity]);

  const persistSRS = useCallback((quality: "hard" | "ok" | "easy") => {
    if (!currentCard || !session?.user) return;
    const prev = cardStates[currentCard.id];
    const multiplier = quality === "hard" ? 0.5 : quality === "ok" ? 1 : 2;
    const baseInterval = prev ? prev.interval : 1;
    const newInterval = Math.max(1, Math.round(baseInterval * multiplier * (quality === "hard" ? 1 : 1.5)));
    const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;
    const ease = quality === "hard" ? 1 : quality === "ok" ? 2 : 3;

    setCardStates(s => ({
      ...s,
      [currentCard.id]: { interval: newInterval, nextReview, ease },
    }));

    supabase.from("flashcard_srs").upsert({
      user_id: session.user.id,
      card_id: currentCard.id,
      interval_days: newInterval,
      next_review: new Date(nextReview).toISOString(),
      ease,
    }, { onConflict: "user_id,card_id" }).then();
  }, [currentCard, cardStates, session?.user?.id]);

  const advanceCard = useCallback(() => {
    setFlipped(false);
    setWriteAnswer("");
    setWriteResult(null);
    setSpeakResult(null);
    setSpeakChecking(false);
    stt.resetTranscript();
    setCurrentIndex(i => i + 1);
  }, [stt]);

  // Classic mode handlers
  const handleRate = useCallback((quality: "hard" | "ok" | "easy") => {
    if (!currentCard) return;
    persistSRS(quality);
    recordResult(quality !== "hard", "classic");
    advanceCard();
  }, [currentCard, persistSRS, recordResult, advanceCard]);

  // Write mode handler
  const handleWriteSubmit = useCallback(() => {
    if (!currentCard || !writeAnswer.trim()) return;
    const correct = normalizeAnswer(writeAnswer) === normalizeAnswer(currentCard.back);
    setWriteResult(correct ? "correct" : "incorrect");
    persistSRS(correct ? "ok" : "hard");
    recordResult(correct, "write");
    setFlipped(true);
  }, [currentCard, writeAnswer, persistSRS, recordResult]);

  // Speak mode handler
  const handleSpeakCheck = useCallback(() => {
    if (!currentCard) return;
    stt.stopListening();
    setSpeakChecking(true);

    setTimeout(() => {
      const spoken = stt.transcript.trim();
      if (!spoken) {
        setSpeakResult({ correct: false, score: 0, spoken: "" });
        setSpeakChecking(false);
        persistSRS("hard");
        recordResult(false, "speak");
        setFlipped(true);
        return;
      }
      const analysis = analyzePronunciation(currentCard.back, spoken);
      const correct = analysis.score >= 60;
      setSpeakResult({ correct, score: analysis.score, spoken });
      setSpeakChecking(false);
      persistSRS(correct ? (analysis.score >= 90 ? "easy" : "ok") : "hard");
      recordResult(correct, "speak");
      setFlipped(true);
    }, 500);
  }, [currentCard, stt, persistSRS, recordResult]);

  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input in write mode
  useEffect(() => {
    if (mode === "write" && !flipped && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, currentIndex, flipped]);

  const tt = (sv: string, en: string) => language === "sv" ? sv : en;

  if (!currentCard) {
    return (
      <AppLayout>
        <p className="text-muted-foreground">{t("noCards")}</p>
      </AppLayout>
    );
  }

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg mx-auto" ref={contentRef}>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <Layers className="h-6 w-6" />
          {t("flashcards")}
        </h1>
        <p className="text-muted-foreground text-sm mb-4">{t("flashcardsDesc")}</p>

        {/* Mode selector */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4">
          {([
            { key: "classic" as const, icon: Eye, label: tt("Klassisk", "Classic") },
            { key: "write" as const, icon: Pen, label: tt("Skriv", "Write") },
            { key: "speak" as const, icon: Mic, label: tt("Tala", "Speak") },
          ]).map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setFlipped(false); setWriteResult(null); setSpeakResult(null); setWriteAnswer(""); stt.resetTranscript(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                mode === m.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <m.icon className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Session stats bar */}
        <div className="flex items-center justify-between text-sm mb-4 bg-card rounded-lg px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-foreground font-medium">{stats.total} {tt("kort", "cards")}</span>
            <span className="text-green-600">✓ {stats.correct}</span>
            <span className="text-destructive">✗ {stats.incorrect}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{accuracy}%</span>
          </div>
        </div>

        {/* Card */}
        <div
          onClick={() => mode === "classic" && !flipped && setFlipped(true)}
          className={`relative bg-card rounded-xl shadow-soft p-8 min-h-[220px] flex flex-col items-center justify-center transition-all ${
            mode === "classic" && !flipped ? "cursor-pointer hover:-translate-y-1 hover:shadow-warm" : ""
          }`}
        >
          {!flipped && !writeResult && !speakResult ? (
            <>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                {currentCard.category}
              </span>
              <span className="text-2xl font-heading font-bold text-foreground text-center">
                {currentCard.front[language]}
              </span>
              {mode === "classic" && (
                <span className="text-sm text-muted-foreground mt-4">{t("tapToFlip")}</span>
              )}

              {/* Write mode input */}
              {mode === "write" && (
                <form
                  onSubmit={e => { e.preventDefault(); handleWriteSubmit(); }}
                  className="mt-5 w-full space-y-3"
                >
                  <Input
                    ref={inputRef}
                    value={writeAnswer}
                    onChange={e => setWriteAnswer(e.target.value)}
                    placeholder={tt("Skriv svaret på spanska...", "Type the answer in Spanish...")}
                    className="text-center text-lg"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <Button type="submit" className="w-full" disabled={!writeAnswer.trim()}>
                    {t("checkAnswer")}
                  </Button>
                </form>
              )}

              {/* Speak mode */}
              {mode === "speak" && (
                <div className="mt-5 w-full flex flex-col items-center gap-3">
                  {!stt.isSupported ? (
                    <p className="text-sm text-muted-foreground text-center">
                      {tt("Taligenkänning stöds inte i din webbläsare", "Speech recognition is not supported in your browser")}
                    </p>
                  ) : (
                    <>
                      <button
                        onClick={() => stt.isListening ? stt.stopListening() : stt.startListening()}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          stt.isListening
                            ? "bg-destructive text-destructive-foreground animate-pulse"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {stt.isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                      </button>
                      {(stt.transcript || stt.interimTranscript) && (
                        <p className="text-sm text-muted-foreground text-center">
                          {stt.transcript}{stt.interimTranscript && <span className="opacity-50">{stt.interimTranscript}</span>}
                        </p>
                      )}
                      {stt.transcript && !stt.isListening && (
                        <Button onClick={handleSpeakCheck} disabled={speakChecking} className="w-full">
                          {speakChecking ? tt("Analyserar...", "Analyzing...") : t("checkAnswer")}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Answer / result view */
            <>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                {t("answer")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-heading font-bold text-foreground text-center">
                  {currentCard.back}
                </span>
                {ttsSupported && (
                  <button
                    onClick={e => { e.stopPropagation(); speak(currentCard.back); }}
                    className="text-muted-foreground hover:text-primary transition p-1"
                    type="button"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
                <SaveWordButton
                  spanish={currentCard.back}
                  context={`Flashcard: ${currentCard.front[language]}`}
                />
              </div>
              <span className="text-sm text-muted-foreground mt-2">
                ({currentCard.front[language === "sv" ? "en" : "sv"]})
              </span>

              {/* Write result feedback */}
              {writeResult && (
                <div className={`mt-3 text-sm font-medium ${writeResult === "correct" ? "text-green-600" : "text-destructive"}`}>
                  {writeResult === "correct" ? `✓ ${t("correct")}` : `✗ ${t("incorrect")}`}
                  {writeResult === "incorrect" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {tt("Du skrev:", "You wrote:")} <span className="italic">{writeAnswer}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Speak result feedback */}
              {speakResult && (
                <div className={`mt-3 text-sm font-medium ${speakResult.correct ? "text-green-600" : "text-destructive"}`}>
                  {speakResult.correct ? `✓ ${t("correct")}` : `✗ ${t("incorrect")}`}
                  <p className="text-xs text-muted-foreground mt-1">
                    {tt("Uttal:", "Pronunciation:")} {speakResult.score}%
                    {speakResult.spoken && <> — "{speakResult.spoken}"</>}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Classic rating buttons */}
        {mode === "classic" && flipped && (
          <div className="flex gap-3 mt-4">
            <button onClick={() => handleRate("hard")} className="flex-1 py-3 rounded-lg bg-destructive/10 text-destructive font-medium flex items-center justify-center gap-2 hover:bg-destructive/20 transition">
              <ThumbsDown className="h-4 w-4" /> {t("hard")}
            </button>
            <button onClick={() => handleRate("ok")} className="flex-1 py-3 rounded-lg bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition">
              <RotateCcw className="h-4 w-4" /> {t("ok")}
            </button>
            <button onClick={() => handleRate("easy")} className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition">
              <ThumbsUp className="h-4 w-4" /> {t("easy")}
            </button>
          </div>
        )}

        {/* Write/Speak: next button after result */}
        {(mode === "write" || mode === "speak") && (writeResult || speakResult) && (
          <Button onClick={advanceCard} className="w-full mt-4">
            {t("nextQuestion")}
          </Button>
        )}
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default FlashcardsPage;
