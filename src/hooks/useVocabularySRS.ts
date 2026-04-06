import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VocabularyWord } from "@/hooks/useVocabulary";

export type ReviewState = "new" | "learning" | "familiar" | "mastered";

export interface SRSWord extends VocabularyWord {
  review_state: ReviewState;
  next_review: string;
  ease_factor: number;
  interval_days: number;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
}

type ReviewQuality = "again" | "hard" | "good" | "easy";

const QUALITY_MAP: Record<ReviewQuality, number> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

function calculateNextReview(
  quality: ReviewQuality,
  currentInterval: number,
  currentEase: number,
  reviewCount: number,
): { interval_days: number; ease_factor: number; review_state: ReviewState } {
  const q = QUALITY_MAP[quality];
  let newInterval: number;
  let newEase = currentEase;

  if (q === 0) {
    // Again — reset
    newInterval = 0;
    newEase = Math.max(1.3, currentEase - 0.3);
  } else if (q === 1) {
    // Hard
    newInterval = Math.max(1, Math.round(currentInterval * 1.2));
    newEase = Math.max(1.3, currentEase - 0.15);
  } else if (q === 2) {
    // Good
    if (currentInterval === 0) newInterval = 1;
    else if (currentInterval === 1) newInterval = 3;
    else newInterval = Math.round(currentInterval * currentEase);
    newEase = currentEase + 0.05;
  } else {
    // Easy
    if (currentInterval === 0) newInterval = 3;
    else newInterval = Math.round(currentInterval * currentEase * 1.3);
    newEase = currentEase + 0.15;
  }

  const totalReviews = reviewCount + 1;
  let review_state: ReviewState;
  if (q === 0) review_state = "learning";
  else if (newInterval >= 21 && totalReviews >= 5) review_state = "mastered";
  else if (newInterval >= 7 && totalReviews >= 3) review_state = "familiar";
  else review_state = "learning";

  return { interval_days: newInterval, ease_factor: newEase, review_state };
}

export const useVocabularySRS = () => {
  const recordReview = useCallback(async (
    wordId: string,
    quality: ReviewQuality,
    currentWord: SRSWord,
  ) => {
    const isCorrect = quality !== "again";
    const { interval_days, ease_factor, review_state } = calculateNextReview(
      quality,
      currentWord.interval_days,
      currentWord.ease_factor,
      currentWord.review_count,
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval_days);

    const updates = {
      review_state,
      next_review: nextReview.toISOString(),
      ease_factor,
      interval_days,
      review_count: currentWord.review_count + 1,
      correct_count: currentWord.correct_count + (isCorrect ? 1 : 0),
      incorrect_count: currentWord.incorrect_count + (isCorrect ? 0 : 1),
      learned: review_state === "mastered",
    };

    await supabase
      .from("user_vocabulary")
      .update(updates as any)
      .eq("id", wordId);

    return { ...currentWord, ...updates };
  }, []);

  const getDueWords = useCallback((words: SRSWord[]): SRSWord[] => {
    const now = new Date().toISOString();
    return words
      .filter(w => w.next_review <= now || w.review_state === "new")
      .sort((a, b) => {
        // New words first, then by next_review
        if (a.review_state === "new" && b.review_state !== "new") return -1;
        if (b.review_state === "new" && a.review_state !== "new") return 1;
        return a.next_review.localeCompare(b.next_review);
      });
  }, []);

  const getWeakWords = useCallback((words: SRSWord[], limit = 10): SRSWord[] => {
    return words
      .filter(w => w.review_count > 0)
      .sort((a, b) => {
        const aAccuracy = a.review_count > 0 ? a.correct_count / a.review_count : 1;
        const bAccuracy = b.review_count > 0 ? b.correct_count / b.review_count : 1;
        return aAccuracy - bAccuracy;
      })
      .slice(0, limit);
  }, []);

  const getStats = useCallback((words: SRSWord[]) => {
    const states = { new: 0, learning: 0, familiar: 0, mastered: 0 };
    let totalReviews = 0;
    let totalCorrect = 0;

    for (const w of words) {
      states[w.review_state as ReviewState] = (states[w.review_state as ReviewState] || 0) + 1;
      totalReviews += w.review_count;
      totalCorrect += w.correct_count;
    }

    return {
      ...states,
      total: words.length,
      accuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
      dueCount: words.filter(w => w.next_review <= new Date().toISOString() || w.review_state === "new").length,
    };
  }, []);

  return { recordReview, getDueWords, getWeakWords, getStats };
};
