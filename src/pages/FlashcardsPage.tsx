import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { flashcardData } from "@/data/flashcardData";
import { getItemsForLevel } from "@/data/spanishData";
import { RotateCcw, ThumbsUp, ThumbsDown, Layers, Volume2 } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { supabase } from "@/integrations/supabase/client";
import SelectionPopup from "@/components/SelectionPopup";

interface CardState {
  interval: number; // days until next review
  nextReview: number; // timestamp (ms)
  ease: number;
}

const FlashcardsPage = () => {
  const { t, language } = useLanguage();
  const { user, session } = useAuth();
  const { updateProgress } = useProgress();
  const { logActivity } = useStreak();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [sessionScore, setSessionScore] = useState({ correct: 0, incorrect: 0 });

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
    setSessionScore({ correct: 0, incorrect: 0 });
  }, [user?.level]);

  // Sort: cards due for review first (SRS), then new cards
  const sortedCards = useMemo(() => {
    const now = Date.now();
    return [...allCards].sort((a, b) => {
      const stateA = cardStates[a.id];
      const stateB = cardStates[b.id];
      const dueA = stateA ? stateA.nextReview : 0;
      const dueB = stateB ? stateB.nextReview : 0;
      if (dueA <= now && dueB > now) return -1;
      if (dueA > now && dueB <= now) return 1;
      return dueA - dueB;
    });
  }, [allCards, cardStates]);

  const currentCard = sortedCards[currentIndex % sortedCards.length];

  const handleRate = useCallback(
    (quality: "hard" | "ok" | "easy") => {
      if (!currentCard) return;
      const prev = cardStates[currentCard.id];
      const multiplier = quality === "hard" ? 0.5 : quality === "ok" ? 1 : 2;
      const baseInterval = prev ? prev.interval : 1;
      const newInterval = Math.max(1, Math.round(baseInterval * multiplier * (quality === "hard" ? 1 : 1.5)));
      // Use real days for SRS
      const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;

      const newStates = {
        ...cardStates,
        [currentCard.id]: {
          interval: newInterval,
          nextReview,
          ease: quality === "hard" ? 1 : quality === "ok" ? 2 : 3,
        },
      };
      setCardStates(newStates);

      // Persist SRS to DB
      if (session?.user) {
        supabase
          .from("flashcard_srs")
          .upsert(
            {
              user_id: session.user.id,
              card_id: currentCard.id,
              interval_days: newInterval,
              next_review: new Date(nextReview).toISOString(),
              ease: quality === "hard" ? 1 : quality === "ok" ? 2 : 3,
            },
            { onConflict: "user_id,card_id" }
          )
          .then();
      }

      if (quality !== "hard") {
        setSessionScore((s) => {
          const newCorrect = s.correct + 1;
          updateProgress("flashcards", newCorrect, allCards.length);
          return { ...s, correct: newCorrect };
        });
      } else {
        setSessionScore((s) => ({ ...s, incorrect: s.incorrect + 1 }));
      }

      logActivity();
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    },
    [currentCard, cardStates, session?.user?.id, allCards.length]
  );

  if (!currentCard) {
    return (
      <AppLayout>
        <p className="text-muted-foreground">{t("noCards")}</p>
      </AppLayout>
    );
  }

  const reviewed = sessionScore.correct + sessionScore.incorrect;

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg mx-auto" ref={contentRef}>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <Layers className="h-6 w-6" />
          {t("flashcards")}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{t("flashcardsDesc")}</p>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{t("score")}: {sessionScore.correct} ✓ / {sessionScore.incorrect} ✗</span>
          <span>{reviewed} / {sortedCards.length} {t("reviewed")}</span>
        </div>

        {/* Card */}
        <div
          onClick={() => !flipped && setFlipped(true)}
          className={`relative bg-card rounded-xl shadow-soft p-8 min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all ${
            flipped ? "" : "hover:-translate-y-1 hover:shadow-warm"
          }`}
        >
          {!flipped ? (
            <>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                {currentCard.category}
              </span>
              <span className="text-2xl font-heading font-bold text-foreground text-center">
                {currentCard.front[language]}
              </span>
              <span className="text-sm text-muted-foreground mt-4">{t("tapToFlip")}</span>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                {t("answer")}
              </span>
              <span className="text-2xl font-heading font-bold text-foreground text-center flex items-center gap-2">
                {currentCard.back}
                {ttsSupported && (
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(currentCard.back); }}
                    className="text-muted-foreground hover:text-primary transition p-1"
                    type="button"
                    aria-label="Lyssna"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                )}
              </span>
              <span className="text-sm text-muted-foreground mt-2">
                ({currentCard.front[language === "sv" ? "en" : "sv"]})
              </span>
            </>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleRate("hard")}
              className="flex-1 py-3 rounded-lg bg-destructive/10 text-destructive font-medium flex items-center justify-center gap-2 hover:bg-destructive/20 transition"
            >
              <ThumbsDown className="h-4 w-4" />
              {t("hard")}
            </button>
            <button
              onClick={() => handleRate("ok")}
              className="flex-1 py-3 rounded-lg bg-muted text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition"
            >
              <RotateCcw className="h-4 w-4" />
              {t("ok")}
            </button>
            <button
              onClick={() => handleRate("easy")}
              className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition"
            >
              <ThumbsUp className="h-4 w-4" />
              {t("easy")}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FlashcardsPage;
