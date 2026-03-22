import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CategoryProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface LevelProgress {
  grammar: CategoryProgress;
  flashcards: CategoryProgress;
  reading: CategoryProgress;
  sentences: CategoryProgress;
  exercises: CategoryProgress;
  overall: number;
}

interface LastActivity {
  exercise_type: string;
  exercise_path: string;
  exercise_label: string;
}

interface ProgressContextType {
  progress: LevelProgress;
  lastActivity: LastActivity | null;
  updateProgress: (category: keyof Omit<LevelProgress, "overall">, completed: number, total: number) => void;
  trackLastActivity: (type: string, path: string, label: string) => void;
  getNextRecommendation: () => { category: string; path: string; reason: string } | null;
  canAdvanceLevel: () => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LEVEL_REQUIREMENTS = {
  A1: { grammar: 5, flashcards: 20, reading: 3, sentences: 10, exercises: 15 },
  A2: { grammar: 6, flashcards: 30, reading: 4, sentences: 15, exercises: 20 },
  B1: { grammar: 8, flashcards: 40, reading: 5, sentences: 20, exercises: 25 },
  B2: { grammar: 10, flashcards: 50, reading: 6, sentences: 25, exercises: 30 },
  C1: { grammar: 12, flashcards: 60, reading: 8, sentences: 30, exercises: 35 },
  C2: { grammar: 15, flashcards: 75, reading: 10, sentences: 40, exercises: 40 },
};

const calcPercentage = (completed: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [progress, setProgress] = useState<LevelProgress>({
    grammar: { completed: 0, total: 5, percentage: 0 },
    flashcards: { completed: 0, total: 20, percentage: 0 },
    reading: { completed: 0, total: 3, percentage: 0 },
    sentences: { completed: 0, total: 10, percentage: 0 },
    exercises: { completed: 0, total: 15, percentage: 0 },
    overall: 0,
  });

  useEffect(() => {
    if (!session?.user) return;
    const level = user?.level || "A1";
    const requirements = LEVEL_REQUIREMENTS[level as keyof typeof LEVEL_REQUIREMENTS] || LEVEL_REQUIREMENTS.A1;

    const loadFromDB = async () => {
      // Load progress and last activity in parallel
      const [progressResult, lastActivityResult] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", session.user.id),
        supabase.from("user_last_activity").select("*").eq("user_id", session.user.id).single(),
      ]);

      const base: LevelProgress = {
        grammar: { completed: 0, total: requirements.grammar, percentage: 0 },
        flashcards: { completed: 0, total: requirements.flashcards, percentage: 0 },
        reading: { completed: 0, total: requirements.reading, percentage: 0 },
        sentences: { completed: 0, total: requirements.sentences, percentage: 0 },
        exercises: { completed: 0, total: requirements.exercises, percentage: 0 },
        overall: 0,
      };

      if (progressResult.data) {
        for (const row of progressResult.data) {
          const cat = row.category as keyof Omit<LevelProgress, "overall">;
          if (base[cat]) {
            base[cat] = {
              completed: row.completed,
              total: row.total,
              percentage: calcPercentage(row.completed, row.total),
            };
          }
        }
      }

      const weights = { grammar: 0.25, flashcards: 0.20, reading: 0.20, sentences: 0.15, exercises: 0.20 };
      base.overall = Math.round(
        base.grammar.percentage * weights.grammar +
        base.flashcards.percentage * weights.flashcards +
        base.reading.percentage * weights.reading +
        base.sentences.percentage * weights.sentences +
        base.exercises.percentage * weights.exercises
      );

      setProgress(base);

      if (lastActivityResult.data) {
        setLastActivity({
          exercise_type: lastActivityResult.data.exercise_type,
          exercise_path: lastActivityResult.data.exercise_path,
          exercise_label: lastActivityResult.data.exercise_label,
        });
      }
    };

    loadFromDB();
  }, [session?.user?.id, user?.level]);

  const updateProgress = useCallback((category: keyof Omit<LevelProgress, "overall">, completed: number, total: number) => {
    const percentage = calcPercentage(completed, total);

    setProgress((prev) => {
      const newProgress = {
        ...prev,
        [category]: { completed, total, percentage },
      };

      const weights = { grammar: 0.25, flashcards: 0.20, reading: 0.20, sentences: 0.15, exercises: 0.20 };
      newProgress.overall = Math.round(
        newProgress.grammar.percentage * weights.grammar +
        newProgress.flashcards.percentage * weights.flashcards +
        newProgress.reading.percentage * weights.reading +
        newProgress.sentences.percentage * weights.sentences +
        newProgress.exercises.percentage * weights.exercises
      );

      return newProgress;
    });

    if (session?.user) {
      supabase
        .from("user_progress")
        .upsert(
          { user_id: session.user.id, category, completed, total },
          { onConflict: "user_id,category" }
        )
        .then();
    }
  }, [session?.user?.id]);

  const trackLastActivity = useCallback((type: string, path: string, label: string) => {
    setLastActivity({ exercise_type: type, exercise_path: path, exercise_label: label });

    if (session?.user) {
      supabase
        .from("user_last_activity")
        .upsert(
          { user_id: session.user.id, exercise_type: type, exercise_path: path, exercise_label: label },
          { onConflict: "user_id" }
        )
        .then();
    }
  }, [session?.user?.id]);

  const getNextRecommendation = useCallback(() => {
    const categories = [
      { key: "grammar", label: "grammarLessons", path: "/learn/grammar", percentage: progress.grammar.percentage },
      { key: "flashcards", label: "flashcards", path: "/learn/flashcards", percentage: progress.flashcards.percentage },
      { key: "reading", label: "reading", path: "/learn/reading", percentage: progress.reading.percentage },
      { key: "sentences", label: "sentenceBuilder", path: "/learn/sentences", percentage: progress.sentences.percentage },
      { key: "exercises", label: "practice", path: "/exercises", percentage: progress.exercises.percentage },
    ];

    const almostFinished = categories
      .filter(cat => cat.percentage >= 70 && cat.percentage < 100)
      .sort((a, b) => b.percentage - a.percentage);
    if (almostFinished.length > 0) {
      return { category: almostFinished[0].label, path: almostFinished[0].path, reason: "almostFinished" };
    }

    const zero = categories.find(cat => cat.percentage === 0);
    if (zero) {
      return { category: zero.label, path: zero.path, reason: "notStarted" };
    }

    const lowest = categories.reduce((min, cat) => cat.percentage < min.percentage ? cat : min);
    if (lowest.percentage >= 100) {
      return { category: "practice", path: "/exercises", reason: "reviewContent" };
    }

    return { category: lowest.label, path: lowest.path, reason: "lowestProgress" };
  }, [progress]);

  const canAdvanceLevel = useCallback(() => {
    const allStarted =
      progress.grammar.percentage > 0 &&
      progress.flashcards.percentage > 0 &&
      progress.reading.percentage > 0 &&
      progress.sentences.percentage > 0 &&
      progress.exercises.percentage > 0;
    return progress.overall >= 80 && allStarted;
  }, [progress]);

  return (
    <ProgressContext.Provider value={{ progress, lastActivity, updateProgress, trackLastActivity, getNextRecommendation, canAdvanceLevel }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};
