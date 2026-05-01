import { useState, useCallback, useMemo } from "react";

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

interface PerformanceWindow {
  correct: number;
  incorrect: number;
  streak: number;
  longestStreak: number;
  recentResults: boolean[]; // last N results
}

interface AdaptiveSettings {
  /** 1-5 difficulty scale */
  difficulty: DifficultyLevel;
  /** Whether to show hints */
  showHints: boolean;
  /** Whether to prefer shorter/simpler content */
  preferSimple: boolean;
  /** Translation direction bias: higher = more native→es */
  productionBias: number;
}

const WINDOW_SIZE = 10;

const calcDifficulty = (perf: PerformanceWindow): DifficultyLevel => {
  if (perf.recentResults.length < 3) return 2;
  const recentAccuracy = perf.recentResults.slice(-WINDOW_SIZE).filter(Boolean).length / 
    Math.min(perf.recentResults.length, WINDOW_SIZE);
  
  if (recentAccuracy >= 0.9 && perf.streak >= 5) return 5;
  if (recentAccuracy >= 0.8 && perf.streak >= 3) return 4;
  if (recentAccuracy >= 0.6) return 3;
  if (recentAccuracy >= 0.4) return 2;
  return 1;
};

export const useAdaptiveDifficulty = (initialDifficulty: DifficultyLevel = 2) => {
  const [performance, setPerformance] = useState<PerformanceWindow>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    longestStreak: 0,
    recentResults: [],
  });

  const recordAnswer = useCallback((correct: boolean) => {
    setPerformance(prev => {
      const newStreak = correct ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        recentResults: [...prev.recentResults, correct].slice(-WINDOW_SIZE * 2),
      };
    });
  }, []);

  const settings = useMemo((): AdaptiveSettings => {
    const difficulty = calcDifficulty(performance);
    return {
      difficulty,
      showHints: difficulty <= 2,
      preferSimple: difficulty <= 2,
      productionBias: Math.min(0.8, 0.3 + (difficulty - 1) * 0.12),
    };
  }, [performance]);

  const accuracy = useMemo(() => {
    const total = performance.correct + performance.incorrect;
    return total > 0 ? Math.round((performance.correct / total) * 100) : 0;
  }, [performance]);

  const reset = useCallback(() => {
    setPerformance({
      correct: 0, incorrect: 0, streak: 0, longestStreak: 0, recentResults: [],
    });
  }, []);

  return {
    settings,
    performance,
    accuracy,
    recordAnswer,
    reset,
  };
};
