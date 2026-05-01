import React, { useState, useMemo } from "react";
import MurciMascot from "@/components/MurciMascot";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Level } from "@/contexts/AuthContext";
import { flashcardData } from "@/data/flashcardData";
import { grammarLessons, GrammarExercise } from "@/data/grammarLessons";
import { ChevronRight, Check, X, SkipForward } from "lucide-react";

interface PlacementTestProps {
  open: boolean;
  lang: "sv" | "en";
  onComplete: (level: Level, score: Record<string, number>) => void;
  onSkip: () => void;
}

interface TestQuestion {
  id: string;
  level: Level;
  type: "vocab" | "grammar-mc" | "grammar-fill";
  question: string;
  correctAnswer: string;
  options?: string[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(lang: "sv" | "en"): TestQuestion[] {
  const questions: TestQuestion[] = [];

  // Vocab questions from flashcards — pick from each level
  const levels: Level[] = ["A1", "A2", "B1", "B2"];
  levels.forEach((lvl) => {
    const cards = shuffleArray(flashcardData.filter((c) => c.level === lvl));
    cards.slice(0, 3).forEach((card, i) => {
      const front = card.front[lang];
      const correct = card.back.split("/")[0].replace(/^(el |la |los |las )/, "").trim();
      // Generate 3 wrong options from same level
      const wrongCards = flashcardData
        .filter((c) => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const wrongOptions = wrongCards.map(
        (c) => c.back.split("/")[0].replace(/^(el |la |los |las )/, "").trim()
      );
      questions.push({
        id: `vocab-${lvl}-${i}`,
        level: lvl,
        type: "vocab",
        question:
          lang === "sv"
            ? `Vad betyder "${front}" på spanska?`
            : `What is "${front}" in Spanish?`,
        correctAnswer: card.back,
        options: shuffleArray([card.back, ...wrongCards.map((c) => c.back)]).slice(0, 4),
      });
    });
  });

  // Grammar MC questions from grammar lessons
  levels.forEach((lvl) => {
    const lessons = grammarLessons.filter((l) => l.level === lvl);
    const mcExercises: { ex: GrammarExercise; lesson: typeof lessons[0] }[] = [];
    lessons.forEach((lesson) => {
      lesson.exercises
        .filter((ex) => ex.type === "multiple-choice" && ex.options)
        .forEach((ex) => mcExercises.push({ ex, lesson }));
    });
    shuffleArray(mcExercises)
      .slice(0, 2)
      .forEach(({ ex }, i) => {
        questions.push({
          id: `grammar-${lvl}-${i}`,
          level: lvl,
          type: "grammar-mc",
          question: ex.question[lang],
          correctAnswer: ex.answer,
          options: ex.options,
        });
      });
  });

  return shuffleArray(questions).slice(0, 15);
}

function calculateLevel(results: { level: Level; correct: boolean }[]): { level: Level; scores: Record<string, number> } {
  const levelOrder: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const scores: Record<string, { correct: number; total: number }> = {};

  results.forEach((r) => {
    if (!scores[r.level]) scores[r.level] = { correct: 0, total: 0 };
    scores[r.level].total++;
    if (r.correct) scores[r.level].correct++;
  });

  // Determine level: highest level where user scores ≥60%
  let assignedLevel: Level = "A1";
  for (const lvl of levelOrder) {
    const s = scores[lvl];
    if (s && s.total > 0 && s.correct / s.total >= 0.6) {
      assignedLevel = lvl;
    } else {
      break; // Stop at first level where performance drops
    }
  }

  const flatScores: Record<string, number> = {};
  Object.entries(scores).forEach(([lvl, s]) => {
    flatScores[lvl] = Math.round((s.correct / s.total) * 100);
  });

  return { level: assignedLevel, scores: flatScores };
}

const PlacementTest: React.FC<PlacementTestProps> = ({ open, lang, onComplete, onSkip }) => {
  const isSv = lang === "sv";
  const questions = useMemo(() => buildQuestions(lang), []);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<{ level: Level; correct: boolean }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [phase, setPhase] = useState<"intro" | "test" | "done">("intro");
  const [finalLevel, setFinalLevel] = useState<Level>("A1");
  const [finalScores, setFinalScores] = useState<Record<string, number>>({});

  const q = questions[current];

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
    const isCorrect = option.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
    setResults((prev) => [...prev, { level: q.level, correct: isCorrect }]);
  };

  const handleNext = () => {
    setSelected(null);
    setShowResult(false);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Calculate result
      const { level, scores } = calculateLevel(results);
      setFinalLevel(level);
      setFinalScores(scores);
      setPhase("done");
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Intro phase */}
        {phase === "intro" && (
          <div className="p-6 flex flex-col items-center text-center gap-5 min-h-[380px] justify-center">
            <MurciMascot size="md" mood="thinking" />
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {isSv ? "Placeringstest" : "Placement Test"}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-sm">
                {isSv
                  ? "Detta korta test hjälper oss uppskatta din nuvarande spanskanivå. Det tar bara ett par minuter."
                  : "This short test helps us estimate your current Spanish level. It only takes a couple of minutes."}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => setPhase("test")}
                className="w-full py-2.5 rounded-lg gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {isSv ? "Starta testet" : "Start the test"}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={onSkip}
                className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
              >
                <SkipForward className="h-4 w-4" />
                {isSv
                  ? "Hoppa över — starta på A1"
                  : "Skip — start at A1"}
              </button>
              <p className="text-xs text-muted-foreground mt-1">
                {isSv
                  ? "Du kan ändra din nivå i profilen när som helst."
                  : "You can change your level in the profile anytime."}
              </p>
            </div>
          </div>
        )}

        {/* Test phase */}
        {phase === "test" && q && (
          <div className="p-6 flex flex-col min-h-[380px]">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-medium">
                {current + 1} / {questions.length}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {q.level}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full mb-5">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <p className="text-foreground font-semibold text-base mb-4">{q.question}</p>

            {/* Options */}
            <div className="space-y-2 flex-1">
              {q.options?.map((opt, i) => {
                const isCorrect = opt.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                const isSelected = selected === opt;
                let cls = "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition ";
                if (showResult) {
                  if (isCorrect) cls += "border-green-500 bg-green-500/10 text-foreground";
                  else if (isSelected && !isCorrect) cls += "border-destructive bg-destructive/10 text-foreground";
                  else cls += "border-border bg-background text-muted-foreground opacity-60";
                } else {
                  cls += "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5";
                }
                return (
                  <button key={i} onClick={() => handleSelect(opt)} className={cls} disabled={showResult}>
                    <span className="flex items-center gap-2">
                      {showResult && isCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                      {showResult && isSelected && !isCorrect && <X className="h-4 w-4 text-destructive shrink-0" />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            {showResult && (
              <button
                onClick={handleNext}
                className="mt-4 w-full py-2.5 rounded-lg gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {current + 1 < questions.length
                  ? (isSv ? "Nästa" : "Next")
                  : (isSv ? "Se resultat" : "See results")}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Done phase */}
        {phase === "done" && (
          <div className="p-6 flex flex-col items-center text-center gap-5 min-h-[380px] justify-center">
            <MurciMascot size="lg" mood="celebrating" />
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {isSv ? "Din uppskattade nivå" : "Your estimated level"}
              </h2>
              <div className="mt-3 inline-flex items-center justify-center w-20 h-20 rounded-full gradient-peach text-primary-foreground text-3xl font-bold shadow-warm">
                {finalLevel}
              </div>
            </div>

            {/* Score breakdown */}
            <div className="w-full max-w-xs space-y-2">
              {Object.entries(finalScores).map(([lvl, pct]) => (
                <div key={lvl} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-8 text-muted-foreground">{lvl}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground max-w-sm">
              {isSv
                ? "Du kan ändra din nivå i profilen när som helst."
                : "You can change your level in the profile anytime."}
            </p>

            <button
              onClick={() => onComplete(finalLevel, finalScores)}
              className="w-full max-w-xs py-2.5 rounded-lg gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition"
            >
              {isSv ? "Fortsätt till appen" : "Continue to the app"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlacementTest;
