import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { grammarLessons, GrammarLesson, GrammarExercise } from "@/data/grammarLessons";
import {
  BookOpen, ChevronRight, ChevronDown, Lightbulb, Check, X,
  Lock, Trophy, ArrowRight, RotateCcw, GraduationCap, Pencil, Star, ArrowUp, Volume2
} from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { supabase } from "@/integrations/supabase/client";
import SelectionPopup from "@/components/SelectionPopup";

type LessonStep = "learn" | "practice" | "result";

interface LessonProgress {
  completed: boolean;
  bestScore: number;
  attempts: number;
}

const PASS_THRESHOLD = 80;
const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const GrammarPage = () => {
  const { t, language } = useLanguage();
  const { user, session, updateProfile } = useAuth();
  const { updateProgress: updateGlobalProgress } = useProgress();
  const { logActivity } = useStreak();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [step, setStep] = useState<LessonStep>("learn");
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [showLevelUpPrompt, setShowLevelUpPrompt] = useState(false);

  // Exercise state
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
  const [attempts, setAttempts] = useState(0);

  // Load grammar progress from DB
  useEffect(() => {
    if (!session?.user) return;
    const loadFromDB = async () => {
      const { data } = await supabase
        .from("grammar_progress")
        .select("*")
        .eq("user_id", session.user.id);

      if (data) {
        const loaded: Record<string, LessonProgress> = {};
        for (const row of data) {
          loaded[row.lesson_id] = {
            completed: row.completed,
            bestScore: row.best_score,
            attempts: row.attempts,
          };
        }
        setProgress(loaded);
        const completedCount = Object.values(loaded).filter(p => p.completed).length;
        const totalLessons = grammarLessons.filter(l => l.level === (user?.level || "A1")).length;
        if (completedCount > 0 && totalLessons > 0) {
          updateGlobalProgress("grammar", completedCount, totalLessons);
        }
      }
    };
    loadFromDB();
  }, [session?.user?.id, user?.level]);

  const userLevel = user?.level || "A1";

  // Only show lessons for the user's CURRENT level
  const lessons = useMemo(
    () => grammarLessons.filter(l => l.level === userLevel),
    [userLevel]
  );

  // Check if ALL lessons at current level are completed
  const allCurrentLevelCompleted = useMemo(() => {
    if (lessons.length === 0) return false;
    return lessons.every(l => progress[l.id]?.completed);
  }, [lessons, progress]);

  const nextLevel = useMemo(() => {
    const idx = LEVEL_ORDER.indexOf(userLevel);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  }, [userLevel]);

  // Show level-up prompt when all lessons completed
  useEffect(() => {
    if (allCurrentLevelCompleted && nextLevel) {
      setShowLevelUpPrompt(true);
    }
  }, [allCurrentLevelCompleted, nextLevel]);

  // Reset when level changes
  useEffect(() => {
    setOpenLesson(null);
    setStep("learn");
    setShowLevelUpPrompt(false);
    resetExercise();
  }, [userLevel]);

  const completedCount = useMemo(
    () => lessons.filter(l => progress[l.id]?.completed).length,
    [lessons, progress]
  );

  // Check if lesson is unlocked (sequential within current level)
  const isLessonUnlocked = useCallback((lessonId: string) => {
    const idx = lessons.findIndex(l => l.id === lessonId);
    if (idx <= 0) return true;
    const prev = lessons[idx - 1];
    return progress[prev.id]?.completed || false;
  }, [lessons, progress]);

  const currentLesson = lessons.find(l => l.id === openLesson);
  const currentExercise = currentLesson?.exercises[currentExIndex];

  const resetExercise = () => {
    setCurrentExIndex(0);
    setAnswer("");
    setShowResult(false);
    setShowHint(false);
    setExerciseResults([]);
    setAttempts(0);
  };

  const openLessonHandler = (id: string) => {
    if (!isLessonUnlocked(id)) return;
    setOpenLesson(openLesson === id ? null : id);
    setStep("learn");
    resetExercise();
  };

  const startPractice = () => {
    setStep("practice");
    resetExercise();
  };

  const checkAnswer = () => {
    if (!currentExercise) return;
    const correct = answer.trim().toLowerCase() === currentExercise.answer.toLowerCase();
    setShowResult(true);
    setAttempts(a => a + 1);
    if (correct || attempts >= 1) {
      setExerciseResults(prev => [...prev, correct]);
    }
  };

  const nextExercise = () => {
    if (!currentLesson) return;
    const nextIdx = currentExIndex + 1;
    if (nextIdx >= currentLesson.exercises.length) {
      const finalResults = [...exerciseResults];
      if (finalResults.length < currentLesson.exercises.length) {
        finalResults.push(answer.trim().toLowerCase() === currentExercise?.answer.toLowerCase());
      }
      const scorePercent = Math.round((finalResults.filter(Boolean).length / currentLesson.exercises.length) * 100);
      const passed = scorePercent >= PASS_THRESHOLD;

      if (session?.user) {
        const newProgress = { ...progress };
        const existing = newProgress[currentLesson.id];
        const lessonProgress = {
          completed: passed || existing?.completed || false,
          bestScore: Math.max(scorePercent, existing?.bestScore || 0),
          attempts: (existing?.attempts || 0) + 1,
        };
        newProgress[currentLesson.id] = lessonProgress;
        setProgress(newProgress);

        // Persist to DB
        supabase
          .from("grammar_progress")
          .upsert(
            {
              user_id: session.user.id,
              lesson_id: currentLesson.id,
              completed: lessonProgress.completed,
              best_score: lessonProgress.bestScore,
              attempts: lessonProgress.attempts,
            },
            { onConflict: "user_id,lesson_id" }
          )
          .then();

        // Update global progress
        const completedLessons = Object.values(newProgress).filter(p => p.completed).length;
        updateGlobalProgress("grammar", completedLessons, lessons.length);
        logActivity();
      }

      setExerciseResults(finalResults);
      setStep("result");
    } else {
      setCurrentExIndex(nextIdx);
      setAnswer("");
      setShowResult(false);
      setShowHint(false);
      setAttempts(0);
    }
  };

  const handleLevelUp = () => {
    if (nextLevel) {
      updateProfile({ level: nextLevel });
      setShowLevelUpPrompt(false);
    }
  };

  const scorePercent = currentLesson
    ? Math.round((exerciseResults.filter(Boolean).length / currentLesson.exercises.length) * 100)
    : 0;

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <AppLayout>
      <div className="animate-fade-in" ref={contentRef}>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          {t("grammarLessons")}
        </h1>
        <p className="text-muted-foreground mb-4 text-sm">{t("grammarDesc")}</p>

        {/* Current level indicator + progress */}
        <div className="bg-card rounded-lg p-4 shadow-soft mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("currentLevel")}</span>
            <h2 className="font-heading font-bold text-foreground text-lg">{t(`level${userLevel}`)}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">{t("progressLabel")}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: lessons.length > 0 ? `${(completedCount / lessons.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-sm font-bold text-foreground">{completedCount}/{lessons.length}</span>
            </div>
          </div>
        </div>

        {/* Level-up prompt */}
        {showLevelUpPrompt && nextLevel && (
          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-5 mb-6 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-3">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-foreground text-lg mb-1">
              {t("allLessonsCompleted")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("levelUpPrompt")} {t(`level${nextLevel}`)}?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowLevelUpPrompt(false)}
                className="px-5 py-2.5 rounded-md bg-muted text-foreground font-medium hover:bg-accent transition"
              >
                {t("stayCurrentLevel")}
              </button>
              <button
                onClick={handleLevelUp}
                className="px-5 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center gap-2"
              >
                <ArrowUp className="h-4 w-4" />
                {t("unlockNextLevel")}
              </button>
            </div>
          </div>
        )}

        {/* Lessons list */}
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const isOpen = openLesson === lesson.id;
            const unlocked = isLessonUnlocked(lesson.id);
            const lp = progress[lesson.id];

            return (
              <div key={lesson.id} className={`bg-card rounded-lg shadow-soft overflow-hidden transition ${!unlocked ? "opacity-60" : ""}`}>
                {/* Lesson header */}
                <button
                  onClick={() => openLessonHandler(lesson.id)}
                  className={`w-full flex items-center justify-between p-4 text-left transition ${unlocked ? "hover:bg-muted/50" : "cursor-not-allowed"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {!unlocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : lp?.completed ? (
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-border shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-foreground block truncate">
                        {lesson.title[language]}
                      </span>
                      {lp && (
                        <span className="text-xs text-muted-foreground">
                          {t("bestScore")}: {lp.bestScore}% · {lp.attempts} {t("attemptsLabel")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lp?.completed && <Star className="h-4 w-4 text-primary" />}
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Lesson content */}
                {isOpen && unlocked && (
                  <div className="border-t border-border">
                    {/* Step tabs */}
                    <div className="flex border-b border-border">
                      {[
                        { key: "learn" as const, icon: BookOpen, label: t("stepLearn") },
                        { key: "practice" as const, icon: Pencil, label: t("stepPractice") },
                      ].map(({ key, icon: Icon, label }) => (
                        <button
                          key={key}
                          onClick={() => { setStep(key); if (key === "practice") resetExercise(); }}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition border-b-2 ${
                            step === key || (step === "result" && key === "practice")
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* LEARN step */}
                    {step === "learn" && (
                      <div className="px-4 pb-4 space-y-5 pt-4">
                        {lesson.sections.map((section, si) => (
                          <div key={si}>
                            <h3 className="font-heading font-bold text-foreground mb-2">
                              {section.heading[language]}
                            </h3>
                            <p className="text-foreground text-sm leading-relaxed mb-3">
                              {section.explanation[language]}
                            </p>
                            <div className="bg-background rounded-md p-3 space-y-1.5 mb-3">
                              {section.examples.map((ex, ei) => (
                                <div key={ei} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                                  <span className="font-semibold text-accent-foreground flex items-center gap-1">
                                    {ex.es}
                                    {ttsSupported && (
                                      <button onClick={() => speak(ex.es)} className="text-muted-foreground hover:text-primary transition p-0.5" type="button" aria-label="Lyssna">
                                        <Volume2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </span>
                                  <span className="text-muted-foreground">
                                    — {language === "sv" ? ex.sv : ex.en}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {section.tip && (
                              <div className="flex items-start gap-2 bg-primary/10 rounded-md p-3">
                                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <p className="text-sm text-foreground">{section.tip[language]}</p>
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={startPractice}
                          className="w-full py-3 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("startExercises")}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* PRACTICE step */}
                    {step === "practice" && currentExercise && (
                      <div className="px-4 pb-4 pt-4">
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${((currentExIndex + 1) / lesson.exercises.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {currentExIndex + 1}/{lesson.exercises.length}
                          </span>
                        </div>

                        {/* Exercise type badge */}
                        <div className="mb-3">
                          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                            currentExercise.type === "fill-blank" ? "bg-secondary text-secondary-foreground" :
                            currentExercise.type === "multiple-choice" ? "bg-primary/15 text-primary" :
                            currentExercise.type === "translate" ? "bg-accent text-accent-foreground" :
                            "bg-destructive/15 text-destructive"
                          }`}>
                            {t(`exerciseType_${currentExercise.type}`)}
                          </span>
                        </div>

                        {/* Question */}
                        <p className="text-foreground font-medium mb-3">
                          {currentExercise.question[language]}
                        </p>

                        {/* Error correction: show incorrect sentence */}
                        {currentExercise.type === "error-correction" && currentExercise.incorrectSentence && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-3">
                            <p className="text-foreground font-mono text-sm line-through decoration-destructive">
                              {currentExercise.incorrectSentence}
                            </p>
                          </div>
                        )}

                        {/* Fill blank: show prompt */}
                        {currentExercise.type === "fill-blank" && currentExercise.prompt && (
                          <div className="bg-muted rounded-md p-3 mb-3">
                            <p className="text-foreground font-mono text-lg text-center">
                              {currentExercise.prompt.replace("___", answer || "___")}
                            </p>
                          </div>
                        )}

                        {/* Answer input */}
                        {currentExercise.type === "multiple-choice" && currentExercise.options ? (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {currentExercise.options.map((opt) => {
                              const selected = answer === opt;
                              const isCorrectOpt = opt === currentExercise.answer;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => !showResult && setAnswer(opt)}
                                  disabled={showResult}
                                  className={`py-3 px-4 rounded-md text-sm font-medium transition border-2 ${
                                    showResult && isCorrectOpt
                                      ? "border-primary bg-primary/10 text-primary"
                                      : showResult && selected && !isCorrectOpt
                                      ? "border-destructive bg-destructive/10 text-destructive"
                                      : selected
                                      ? "border-primary bg-primary/5 text-foreground"
                                      : "border-border bg-background text-foreground hover:border-muted-foreground"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !showResult && answer && checkAnswer()}
                            disabled={showResult}
                            placeholder={t("yourAnswer")}
                            className="w-full px-4 py-3 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-4"
                            autoFocus
                          />
                        )}

                        {/* Result feedback */}
                        {showResult && (
                          <div className={`rounded-md p-3 mb-4 flex items-start gap-2 ${
                            answer.trim().toLowerCase() === currentExercise.answer.toLowerCase()
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-destructive/10 border border-destructive/20"
                          }`}>
                            {answer.trim().toLowerCase() === currentExercise.answer.toLowerCase() ? (
                              <>
                                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-primary">{t("correct")}</p>
                                  <p className="text-sm text-foreground mt-1">{currentExercise.answer}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-destructive">{t("incorrect")}</p>
                                  <p className="text-sm text-foreground mt-1">
                                    {t("correctAnswer")}: <strong>{currentExercise.answer}</strong>
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Hint */}
                        {showHint && currentExercise.hint && !showResult && (
                          <div className="flex items-start gap-2 bg-accent/30 rounded-md p-3 mb-4">
                            <Lightbulb className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-foreground">{currentExercise.hint[language]}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!showResult ? (
                            <>
                              {!showHint && currentExercise.hint && (
                                <button
                                  onClick={() => setShowHint(true)}
                                  className="px-4 py-2.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-accent transition flex items-center gap-1"
                                >
                                  <Lightbulb className="h-3.5 w-3.5" />
                                  {t("showHint")}
                                </button>
                              )}
                              <button
                                onClick={checkAnswer}
                                disabled={!answer}
                                className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50"
                              >
                                {t("checkAnswer")}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={nextExercise}
                              className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                            >
                              {currentExIndex + 1 >= lesson.exercises.length ? t("seeResults") : t("nextQuestion")}
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* RESULT step */}
                    {step === "result" && (
                      <div className="px-4 pb-6 pt-6 text-center">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                          scorePercent >= PASS_THRESHOLD ? "bg-primary/15" : "bg-destructive/15"
                        }`}>
                          {scorePercent >= PASS_THRESHOLD ? (
                            <Trophy className="h-10 w-10 text-primary" />
                          ) : (
                            <RotateCcw className="h-10 w-10 text-destructive" />
                          )}
                        </div>

                        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                          {scorePercent >= PASS_THRESHOLD ? t("lessonPassed") : t("tryAgain")}
                        </h3>

                        <div className="text-3xl font-bold mb-2">
                          <span className={scorePercent >= PASS_THRESHOLD ? "text-primary" : "text-destructive"}>
                            {scorePercent}%
                          </span>
                        </div>

                        <p className="text-muted-foreground text-sm mb-1">
                          {exerciseResults.filter(Boolean).length} / {exerciseResults.length} {t("correctAnswers")}
                        </p>

                        {scorePercent < PASS_THRESHOLD && (
                          <p className="text-muted-foreground text-sm mb-4">
                            {t("needScore")} {PASS_THRESHOLD}% {t("toPass")}
                          </p>
                        )}

                        {/* Individual results */}
                        <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
                          {exerciseResults.map((correct, i) => (
                            <div
                              key={i}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                correct
                                  ? "bg-primary/15 text-primary"
                                  : "bg-destructive/15 text-destructive"
                              }`}
                            >
                              {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setStep("learn"); resetExercise(); }}
                            className="flex-1 py-2.5 rounded-md bg-muted text-foreground font-medium hover:bg-accent transition flex items-center justify-center gap-2"
                          >
                            <BookOpen className="h-4 w-4" />
                            {t("reviewLesson")}
                          </button>
                          <button
                            onClick={startPractice}
                            className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {t("retryExercises")}
                          </button>
                        </div>

                        {scorePercent >= PASS_THRESHOLD && (
                          <p className="text-sm text-primary mt-4 flex items-center justify-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {t("nextLessonUnlocked")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hint about profile override */}
        <p className="text-xs text-muted-foreground mt-6 text-center">
          {t("levelOverrideHint")}
        </p>
      </div>
    </AppLayout>
  );
};

export default GrammarPage;
