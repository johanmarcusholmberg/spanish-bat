import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

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

interface ProgressContextType {
  progress: LevelProgress;
  updateProgress: (category: keyof Omit<LevelProgress, "overall">, completed: number, total: number) => void;
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

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LevelProgress>({
    grammar: { completed: 0, total: 5, percentage: 0 },
    flashcards: { completed: 0, total: 20, percentage: 0 },
    reading: { completed: 0, total: 3, percentage: 0 },
    sentences: { completed: 0, total: 10, percentage: 0 },
    exercises: { completed: 0, total: 15, percentage: 0 },
    overall: 0,
  });

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`progress_${user?.email || "guest"}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      // Initialize with current level requirements
      const level = user?.level || "A1";
      const requirements = LEVEL_REQUIREMENTS[level as keyof typeof LEVEL_REQUIREMENTS] || LEVEL_REQUIREMENTS.A1;
      
      setProgress({
        grammar: { completed: 0, total: requirements.grammar, percentage: 0 },
        flashcards: { completed: 0, total: requirements.flashcards, percentage: 0 },
        reading: { completed: 0, total: requirements.reading, percentage: 0 },
        sentences: { completed: 0, total: requirements.sentences, percentage: 0 },
        exercises: { completed: 0, total: requirements.exercises, percentage: 0 },
        overall: 0,
      });
    }
  }, [user?.email, user?.level]);

  const updateProgress = (category: keyof Omit<LevelProgress, "overall">, completed: number, total: number) => {
    setProgress((prev) => {
      const percentage = Math.min(100, Math.round((completed / total) * 100));
      const newProgress = {
        ...prev,
        [category]: { completed, total, percentage },
      };

      // Calculate overall progress with weighted average
      const weights = { grammar: 0.25, flashcards: 0.20, reading: 0.20, sentences: 0.15, exercises: 0.20 };
      const overall = Math.round(
        newProgress.grammar.percentage * weights.grammar +
        newProgress.flashcards.percentage * weights.flashcards +
        newProgress.reading.percentage * weights.reading +
        newProgress.sentences.percentage * weights.sentences +
        newProgress.exercises.percentage * weights.exercises
      );

      newProgress.overall = overall;

      // Save to localStorage
      localStorage.setItem(`progress_${user?.email || "guest"}`, JSON.stringify(newProgress));

      return newProgress;
    });
  };

  const getNextRecommendation = () => {
    const categories = [
      { key: "grammar", label: "grammarLessons", path: "/learn/grammar", percentage: progress.grammar.percentage },
      { key: "flashcards", label: "flashcards", path: "/learn/flashcards", percentage: progress.flashcards.percentage },
      { key: "reading", label: "reading", path: "/learn/reading", percentage: progress.reading.percentage },
      { key: "sentences", label: "sentenceBuilder", path: "/learn/sentences", percentage: progress.sentences.percentage },
      { key: "exercises", label: "exercises", path: "/exercises", percentage: progress.exercises.percentage },
    ];

    // Find the category with the lowest progress
    const lowest = categories.reduce((min, cat) => 
      cat.percentage < min.percentage ? cat : min
    );

    // If everything is at 100%, suggest review
    if (lowest.percentage >= 100) {
      return {
        category: categories[0].label,
        path: categories[0].path,
        reason: "reviewContent"
      };
    }

    // If there's a category with 0%, prioritize it
    const zero = categories.find(cat => cat.percentage === 0);
    if (zero) {
      return {
        category: zero.label,
        path: zero.path,
        reason: "notStarted"
      };
    }

    return {
      category: lowest.label,
      path: lowest.path,
      reason: "lowestProgress"
    };
  };

  const canAdvanceLevel = () => {
    // User can advance if overall progress >= 80% and all categories have some progress
    const allCategoriesStarted = 
      progress.grammar.percentage > 0 &&
      progress.flashcards.percentage > 0 &&
      progress.reading.percentage > 0 &&
      progress.sentences.percentage > 0 &&
      progress.exercises.percentage > 0;

    return progress.overall >= 80 && allCategoriesStarted;
  };

  return (
    <ProgressContext.Provider value={{ progress, updateProgress, getNextRecommendation, canAdvanceLevel }}>
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
