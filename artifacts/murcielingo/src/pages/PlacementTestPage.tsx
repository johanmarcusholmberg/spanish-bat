import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";
import MurciMascot from "@/components/MurciMascot";
import { Check, X, ChevronRight, SkipForward, ArrowLeft, Trophy } from "lucide-react";
import { flashcardData } from "@/data/flashcardData";
import { grammarLessons, GrammarExercise } from "@/data/grammarLessons";

type Phase = "intro" | "test" | "result" | "confirmed";

interface TestQuestion {
  id: string;
  level: Level;
  type: "vocab" | "grammar-mc";
  question: string;
  correctAnswer: string;
  options: string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestionsForLevel(level: Level, lang: "sv" | "en", count: number): TestQuestion[] {
  const questions: TestQuestion[] = [];

  const vocabCards = shuffleArray(flashcardData.filter((c) => c.level === level));
  vocabCards.slice(0, Math.ceil(count / 2)).forEach((card, i) => {
    const front = card.front[lang];
    const wrongCards = shuffleArray(
      flashcardData.filter((c) => c.id !== card.id)
    ).slice(0, 3);
    questions.push({
      id: `vocab-${level}-${i}`,
      level,
      type: "vocab",
      question: lang === "sv"
        ? `Vad betyder "${front}" på spanska?`
        : `What is "${front}" in Spanish?`,
      correctAnswer: card.back,
      options: shuffleArray([card.back, ...wrongCards.map((c) => c.back)]).slice(0, 4),
    });
  });

  const lessons = grammarLessons.filter((l) => l.level === level);
  const mcExercises: { ex: GrammarExercise }[] = [];
  lessons.forEach((lesson) => {
    lesson.exercises
      .filter((ex) => ex.type === "multiple-choice" && ex.options && ex.options.length > 1)
      .forEach((ex) => mcExercises.push({ ex }));
  });
  shuffleArray(mcExercises)
    .slice(0, Math.floor(count / 2))
    .forEach(({ ex }, i) => {
      if (!ex.options) return;
      questions.push({
        id: `grammar-${level}-${i}`,
        level,
        type: "grammar-mc",
        question: ex.question[lang],
        correctAnswer: ex.answer,
        options: ex.options,
      });
    });

  return shuffleArray(questions).slice(0, count);
}

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Guarantees a non-empty batch by borrowing from adjacent levels when the
// requested level has too few questions. Borrowed questions retain their
// own `level` so handleSelect attributes the score correctly.
function buildQuestionsForLevelSafe(level: Level, lang: "sv" | "en", count: number): TestQuestion[] {
  const collected = buildQuestionsForLevel(level, lang, count);
  if (collected.length >= count) return collected;

  const idx = LEVELS.indexOf(level);
  const seenIds = new Set(collected.map((q) => q.id));

  const fallbackOrder: Level[] = [];
  for (let offset = 1; offset < LEVELS.length; offset++) {
    if (idx - offset >= 0) fallbackOrder.push(LEVELS[idx - offset]);
    if (idx + offset < LEVELS.length) fallbackOrder.push(LEVELS[idx + offset]);
  }
  for (const lvl of fallbackOrder) {
    if (collected.length >= count) break;
    const extras = buildQuestionsForLevel(lvl, lang, count);
    for (const q of extras) {
      if (collected.length >= count) break;
      if (!seenIds.has(q.id)) {
        collected.push(q);
        seenIds.add(q.id);
      }
    }
  }

  return collected;
}

// Adaptive: 2-question batches with up/down branching after each batch.
// Fixed length of 12 questions for a reliable placement signal.
const QUESTIONS_PER_LEVEL = 2;
const TOTAL_QUESTIONS = 12;
const PASS_THRESHOLD = 0.5;

// Sequential mastery: highest level passed where every prior level also
// passed. Stops at the first failed or untested level.
function highestLevelPassed(scores: Record<string, { correct: number; total: number }>): Level {
  let assigned: Level = "A1";
  for (const lvl of LEVELS) {
    const s = scores[lvl];
    if (s && s.total > 0 && s.correct / s.total >= PASS_THRESHOLD) {
      assigned = lvl;
    } else {
      break;
    }
  }
  return assigned;
}

const levelDescriptions: Record<Level, { sv: string; en: string }> = {
  A1: { sv: "Nybörjare – du lär dig grunderna!", en: "Beginner – you're learning the basics!" },
  A2: { sv: "Grundläggande – du kan enkla fraser!", en: "Elementary – you can manage simple phrases!" },
  B1: { sv: "Mellannivå – du kan kommunicera på spanska!", en: "Intermediate – you can communicate in Spanish!" },
  B2: { sv: "Övre mellannivå – du hanterar komplexa ämnen!", en: "Upper intermediate – you handle complex topics!" },
  C1: { sv: "Avancerad – du uttrycker dig flytande!", en: "Advanced – you express yourself fluently!" },
  C2: { sv: "Behärskar språket – du är nästan infödd!", en: "Mastery – you're near native level!" },
};

const PlacementTestPage = () => {
  const { language } = useLanguage();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const lang: "sv" | "en" = user?.learningFrom ?? (language === "sv" ? "sv" : "en");
  const isSv = lang === "sv";

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [questionsForLevel, setQuestionsForLevel] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [levelScores, setLevelScores] = useState<Record<string, { correct: number; total: number }>>({});
  const [finalLevel, setFinalLevel] = useState<Level>("A1");
  const [saving, setSaving] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [batchCorrect, setBatchCorrect] = useState(0);

  const generateQuestionsForLevel = useCallback((level: Level) => {
    return buildQuestionsForLevelSafe(level, lang, QUESTIONS_PER_LEVEL);
  }, [lang]);

  const startTest = () => {
    const lvl = LEVELS[0];
    const qs = generateQuestionsForLevel(lvl);
    setQuestionsForLevel(qs);
    setCurrentLevelIndex(0);
    setCurrentQuestionIndex(0);
    setLevelScores({});
    setFinalLevel("A1");
    setTotalAnswered(0);
    setBatchCorrect(0);
    setSelected(null);
    setShowResult(false);
    setPhase("test");
  };

  const currentQuestion = questionsForLevel[currentQuestionIndex] ?? null;
  const currentLevel = LEVELS[currentLevelIndex];

  const handleSelect = (option: string) => {
    if (showResult || !currentQuestion) return;
    setSelected(option);
    setShowResult(true);
    const isCorrect = option.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    const scoredLevel = currentQuestion.level;
    setLevelScores((prev) => {
      const existing = prev[scoredLevel] || { correct: 0, total: 0 };
      return {
        ...prev,
        [scoredLevel]: { correct: existing.correct + (isCorrect ? 1 : 0), total: existing.total + 1 },
      };
    });
    setTotalAnswered((n) => n + 1);
    if (isCorrect) setBatchCorrect((n) => n + 1);
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    setSelected(null);
    setShowResult(false);

    const nextQIndex = currentQuestionIndex + 1;
    if (nextQIndex < questionsForLevel.length) {
      setCurrentQuestionIndex(nextQIndex);
      return;
    }

    // End-of-batch: branch up or down based on this batch's pass/fail.
    // Uses the per-batch counter (not the cumulative levelScores aggregate)
    // so revisiting a level gives an unbiased decision based only on the
    // questions just answered.
    const passed = batchCorrect / questionsForLevel.length >= PASS_THRESHOLD;

    if (totalAnswered >= TOTAL_QUESTIONS) {
      setFinalLevel(highestLevelPassed(levelScores));
      setPhase("result");
      return;
    }

    const delta = passed ? 1 : -1;
    const nextLevelIndex = Math.max(
      0,
      Math.min(LEVELS.length - 1, currentLevelIndex + delta),
    );
    const nextLevel = LEVELS[nextLevelIndex];
    const nextQuestions = generateQuestionsForLevel(nextLevel);
    setCurrentLevelIndex(nextLevelIndex);
    setCurrentQuestionIndex(0);
    setQuestionsForLevel(nextQuestions);
    setBatchCorrect(0);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await updateProfile({ level: finalLevel, placementTestCompleted: true });
      setPhase("confirmed");
    } catch (err) {
      toast({
        title: isSv ? "Kunde inte spara nivån" : "Could not save your level",
        description: isSv
          ? "Kontrollera din anslutning och försök igen."
          : "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    try {
      await updateProfile({ placementTestCompleted: true });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: isSv ? "Kunde inte hoppa över" : "Could not skip placement",
        description: isSv
          ? "Kontrollera din anslutning och försök igen."
          : "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  // Progress through the fixed 12-question placement quiz.
  const progressPct = Math.min((totalAnswered / TOTAL_QUESTIONS) * 100, 100);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto animate-fade-in">

        {/* INTRO */}
        {phase === "intro" && (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <MurciMascot size="lg" mood="thinking" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {isSv ? "Placeringstest" : "Placement Test"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                {isSv
                  ? "Svara på några frågor så rekommenderar vi rätt spanskanivå för dig. Testet anpassar sig automatiskt efter dina svar."
                  : "Answer a few questions and we'll recommend the right Spanish level for you. The test adapts automatically based on your answers."}
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl text-sm text-left">
                <span className="text-xl">⚡</span>
                <span className="text-muted-foreground">
                  {isSv ? "Tar bara 2–5 minuter" : "Takes only 2–5 minutes"}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl text-sm text-left">
                <span className="text-xl">🎯</span>
                <span className="text-muted-foreground">
                  {isSv ? "Anpassar sig till din nivå" : "Adapts to your level"}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl text-sm text-left">
                <span className="text-xl">✏️</span>
                <span className="text-muted-foreground">
                  {isSv ? "Du kan ändra nivå i profilen" : "You can always change level in your profile"}
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-2 pt-2">
              <button
                onClick={startTest}
                className="w-full py-3 rounded-xl gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {isSv ? "Starta testet" : "Start the test"}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
              >
                <SkipForward className="h-4 w-4" />
                {isSv ? "Hoppa över för nu" : "Skip for now"}
              </button>
            </div>
          </div>
        )}

        {/* TEST */}
        {phase === "test" && currentQuestion && (
          <div className="space-y-5 py-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPhase("intro")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="h-4 w-4" />
                {isSv ? "Avbryt" : "Cancel"}
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {currentLevel}
              </span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">
                  {isSv
                    ? `Fråga ${Math.min(totalAnswered + (showResult ? 0 : 1), TOTAL_QUESTIONS)} av ${TOTAL_QUESTIONS}`
                    : `Question ${Math.min(totalAnswered + (showResult ? 0 : 1), TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isSv ? `Nivå ${currentLevel}` : `Level ${currentLevel}`}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
              <p className="text-foreground font-semibold text-base leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => {
                  const isCorrect = opt.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
                  const isSelected = selected === opt;
                  let cls = "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ";
                  if (showResult) {
                    if (isCorrect) cls += "border-green-500 bg-green-500/10 text-foreground";
                    else if (isSelected && !isCorrect) cls += "border-destructive bg-destructive/10 text-foreground";
                    else cls += "border-border bg-background text-muted-foreground opacity-50";
                  } else {
                    cls += "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5 cursor-pointer";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={cls}
                      disabled={showResult}
                    >
                      <span className="flex items-center gap-2">
                        {showResult && isCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                        {showResult && isSelected && !isCorrect && <X className="h-4 w-4 text-destructive shrink-0" />}
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`text-sm font-medium px-3 py-2 rounded-lg ${selected?.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
                  {selected?.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                    ? (isSv ? "Rätt svar! 🎉" : "Correct! 🎉")
                    : (isSv ? `Rätt svar: ${currentQuestion.correctAnswer}` : `Correct answer: ${currentQuestion.correctAnswer}`)}
                </div>
              )}
            </div>

            {showResult && (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {currentQuestionIndex + 1 < questionsForLevel.length
                  ? (isSv ? "Nästa fråga" : "Next question")
                  : (isSv ? "Fortsätt" : "Continue")}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <MurciMascot size="lg" mood="celebrating" />
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">
                {isSv ? "Din rekommenderade nivå" : "Your recommended level"}
              </p>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-peach text-primary-foreground text-4xl font-bold shadow-warm mb-3">
                {finalLevel}
              </div>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {levelDescriptions[finalLevel][isSv ? "sv" : "en"]}
              </h2>
            </div>

            {/* Score breakdown */}
            {Object.keys(levelScores).length > 0 && (
              <div className="w-full max-w-xs space-y-2 bg-muted/40 rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {isSv ? "Resultat per nivå" : "Score per level"}
                </p>
                {Object.entries(levelScores).map(([lvl, s]) => {
                  const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                  const passed = pct >= PASS_THRESHOLD * 100;
                  return (
                    <div key={lvl} className="flex items-center gap-2">
                      <span className="text-xs font-semibold w-8 text-left text-muted-foreground">{lvl}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${passed ? "bg-green-500" : "bg-destructive"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-sm text-muted-foreground max-w-sm">
              {isSv
                ? "Bekräfta denna nivå för att börja lära dig, eller välj en annan nivå i profilen."
                : "Confirm this level to start learning, or change your level anytime in the profile."}
            </p>

            <div className="w-full max-w-xs space-y-2">
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="w-full py-3 rounded-xl gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                {saving
                  ? (isSv ? "Sparar..." : "Saving...")
                  : (isSv ? `Bekräfta nivå ${finalLevel}` : `Confirm level ${finalLevel}`)}
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition text-sm"
              >
                {isSv ? "Välj annan nivå i profilen" : "Choose a different level in profile"}
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMED */}
        {phase === "confirmed" && (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {isSv ? "Nivå sparad!" : "Level saved!"}
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                {isSv
                  ? `Du är nu inställd på nivå ${finalLevel}. Dags att börja lära dig!`
                  : `You're now set to level ${finalLevel}. Time to start learning!`}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full max-w-xs py-3 rounded-xl gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {isSv ? "Gå till instrumentpanelen" : "Go to dashboard"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PlacementTestPage;
