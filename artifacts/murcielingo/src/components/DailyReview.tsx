import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useVocabularySRS, SRSWord } from "@/hooks/useVocabularySRS";
import { useAdaptiveDifficulty } from "@/hooks/useAdaptiveDifficulty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import MurciMascot from "@/components/MurciMascot";
import { capitalizeFirst } from "@/lib/displayUtils";
import {
  CalendarCheck,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Volume2,
  Brain,
  Target,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";

type ReviewPhase = "overview" | "session" | "results";
type ExerciseType = "recall" | "multiple_choice" | "fill_blank" | "reverse";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const DailyReviewCard: React.FC = () => {
  const { language } = useLanguage();
  const { words, loading } = useVocabulary();
  const { getDueWords, getWeakWords, getStats, recordReview } = useVocabularySRS();
  const { settings, recordAnswer, accuracy, performance, reset: resetAdaptive } = useAdaptiveDifficulty();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const navigate = useNavigate();
  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  const [phase, setPhase] = useState<ReviewPhase>("overview");
  const [queue, setQueue] = useState<SRSWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exerciseType, setExerciseType] = useState<ExerciseType>("recall");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const srsWords = words as SRSWord[];
  const stats = useMemo(() => getStats(srsWords), [srsWords, getStats]);
  const dueWords = useMemo(() => getDueWords(srsWords), [srsWords, getDueWords]);
  const weakWords = useMemo(() => getWeakWords(srsWords, 5), [srsWords, getWeakWords]);

  const pickExerciseType = useCallback((word: SRSWord, diff: number): ExerciseType => {
    const types: ExerciseType[] = ["recall", "multiple_choice"];
    if (word.item_type === "word" || word.item_type === "phrase") types.push("fill_blank");
    if (diff >= 3) types.push("reverse");
    // Bias: weak words get easier types
    if (word.review_state === "new" || word.review_state === "learning") {
      return Math.random() < 0.6 ? "multiple_choice" : "recall";
    }
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const generateMcOptions = useCallback((word: SRSWord, isReverse: boolean) => {
    const correct = isReverse ? word.spanish : word.translation;
    const pool = srsWords.filter(w => w.id !== word.id);
    const distractors = shuffle(pool)
      .slice(0, 3)
      .map(w => isReverse ? w.spanish : w.translation);
    const opts = shuffle([correct, ...distractors]);
    if (!opts.includes(correct)) opts[0] = correct;
    setMcOptions(opts);
  }, [srsWords]);

  const startReview = useCallback(() => {
    const reviewQueue = shuffle(dueWords).slice(0, Math.min(10, dueWords.length));
    if (reviewQueue.length === 0) return;
    setQueue(reviewQueue);
    setCurrentIdx(0);
    setSessionScore(0);
    resetAdaptive();
    
    const firstType = pickExerciseType(reviewQueue[0], 2);
    setExerciseType(firstType);
    if (firstType === "multiple_choice") generateMcOptions(reviewQueue[0], false);
    if (firstType === "reverse") generateMcOptions(reviewQueue[0], true);
    
    setAnswer("");
    setChecked(false);
    setFlipped(false);
    setMcSelected(null);
    setPhase("session");
  }, [dueWords, pickExerciseType, generateMcOptions, resetAdaptive]);

  const handleCheck = useCallback((correct: boolean) => {
    setIsCorrect(correct);
    setChecked(true);
    recordAnswer(correct);
    if (correct) setSessionScore(s => s + 1);

    const word = queue[currentIdx];
    if (word) {
      recordReview(word.id, correct ? "good" : "again", word);
    }
  }, [queue, currentIdx, recordAnswer, recordReview]);

  const handleNext = useCallback(() => {
    const next = currentIdx + 1;
    if (next >= queue.length) {
      setPhase("results");
      return;
    }
    setCurrentIdx(next);
    const nextWord = queue[next];
    const nextType = pickExerciseType(nextWord, settings.difficulty);
    setExerciseType(nextType);
    if (nextType === "multiple_choice") generateMcOptions(nextWord, false);
    if (nextType === "reverse") generateMcOptions(nextWord, true);
    setAnswer("");
    setChecked(false);
    setFlipped(false);
    setMcSelected(null);
  }, [currentIdx, queue, settings.difficulty, pickExerciseType, generateMcOptions]);

  if (loading) return null;

  // RESULTS
  if (phase === "results") {
    const pct = queue.length > 0 ? Math.round((sessionScore / queue.length) * 100) : 0;
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6 space-y-4 text-center">
          <MurciMascot
            size="sm"
            mood={pct >= 80 ? "celebrating" : pct >= 50 ? "encouraging" : "thinking"}
            message={pct >= 80
              ? t("Fantastiskt! 🎉", "Amazing! 🎉")
              : pct >= 50
                ? t("Bra jobbat!", "Good job!")
                : t("Fortsätt öva! 💪", "Keep practicing! 💪")}
            className="mx-auto"
          />
          <div className="text-3xl font-bold text-primary">{pct}%</div>
          <p className="text-sm text-muted-foreground">
            {sessionScore}/{queue.length} {t("rätt", "correct")}
          </p>
          <Progress value={pct} className="h-2" />
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setPhase("overview")}>
              {t("Klar", "Done")}
            </Button>
            <Button onClick={startReview}>
              <RotateCcw className="h-4 w-4 mr-1" /> {t("Igen", "Again")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // SESSION
  if (phase === "session" && queue.length > 0) {
    const word = queue[currentIdx];
    const progress = ((currentIdx + 1) / queue.length) * 100;
    const isReverse = exerciseType === "reverse";
    const prompt = isReverse ? word.translation : word.spanish;
    const correctAnswer = isReverse ? word.spanish : word.translation;

    return (
      <Card className="border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-[10px]">
              {exerciseType === "recall" ? t("Minns du?", "Do you recall?")
                : exerciseType === "multiple_choice" ? t("Flerval", "Multiple choice")
                : exerciseType === "fill_blank" ? t("Fyll i", "Fill in")
                : t("Omvänd", "Reverse")}
            </Badge>
            <span className="text-xs text-muted-foreground">{currentIdx + 1}/{queue.length}</span>
          </div>
          <Progress value={progress} className="h-1.5" />

          <div className="text-center py-3">
            <p className="text-lg font-bold">{capitalizeFirst(prompt)}</p>
            {!isReverse && ttsSupported && (
              <button onClick={() => speak(word.spanish)} className="mt-1 text-muted-foreground hover:text-foreground">
                <Volume2 className="h-4 w-4 mx-auto" />
              </button>
            )}
            <Badge variant="outline" className="text-[9px] mt-1">
              {word.review_state === "new" ? t("Nytt", "New")
                : word.review_state === "learning" ? t("Lär sig", "Learning")
                : word.review_state === "familiar" ? t("Bekant", "Familiar")
                : t("Bemästrat", "Mastered")}
            </Badge>
          </div>

          {/* RECALL MODE */}
          {exerciseType === "recall" && (
            <div className="space-y-2">
              {!flipped ? (
                <Button className="w-full" onClick={() => setFlipped(true)}>
                  {t("Visa svar", "Show answer")}
                </Button>
              ) : (
                <>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="font-medium">{capitalizeFirst(correctAnswer)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { handleCheck(false); }}>
                      <X className="h-4 w-4 mr-1" /> {t("Visste inte", "Didn't know")}
                    </Button>
                    <Button className="flex-1" onClick={() => { handleCheck(true); }}>
                      <Check className="h-4 w-4 mr-1" /> {t("Visste!", "Knew it!")}
                    </Button>
                  </div>
                  {checked && (
                    <Button className="w-full" variant="secondary" onClick={handleNext}>
                      {t("Nästa", "Next")} <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* MULTIPLE CHOICE / REVERSE */}
          {(exerciseType === "multiple_choice" || exerciseType === "reverse") && (
            <div className="space-y-2">
              {mcOptions.map((opt, i) => {
                let cls = "border bg-card hover:bg-muted";
                if (mcSelected) {
                  if (opt.toLowerCase() === correctAnswer.toLowerCase()) cls = "border-2 border-primary bg-primary/10";
                  else if (opt === mcSelected) cls = "border-2 border-destructive bg-destructive/10";
                }
                return (
                  <button
                    key={i}
                    disabled={!!mcSelected}
                    onClick={() => {
                      setMcSelected(opt);
                      const correct = opt.toLowerCase() === correctAnswer.toLowerCase();
                      handleCheck(correct);
                    }}
                    className={`w-full rounded-lg p-3 text-left text-sm transition ${cls}`}
                  >
                    {capitalizeFirst(opt)}
                  </button>
                );
              })}
              {checked && (
                <Button className="w-full" variant="secondary" onClick={handleNext}>
                  {t("Nästa", "Next")} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* FILL IN BLANK */}
          {exerciseType === "fill_blank" && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!checked) {
                const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                handleCheck(correct);
              } else {
                handleNext();
              }
            }} className="space-y-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t("Skriv svaret...", "Type the answer...")}
                disabled={checked}
                autoFocus
                className={checked ? (isCorrect ? "border-primary" : "border-destructive") : ""}
              />
              {checked && !isCorrect && (
                <p className="text-sm text-destructive">
                  {t("Rätt:", "Correct:")} <span className="font-medium">{capitalizeFirst(correctAnswer)}</span>
                </p>
              )}
              {checked && isCorrect && (
                <p className="text-sm text-primary flex items-center gap-1">
                  <Check className="h-4 w-4" /> {t("Rätt!", "Correct!")}
                </p>
              )}
              <Button type="submit" className="w-full">
                {checked ? t("Nästa", "Next") : t("Kontrollera", "Check")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  // OVERVIEW
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarCheck className="h-5 w-5 text-primary" />
          {t("Daglig repetition", "Daily Review")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats overview */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: t("Nya", "New"), value: stats.new, color: "text-blue-600" },
            { label: t("Lär sig", "Learning"), value: stats.learning, color: "text-amber-600" },
            { label: t("Bekanta", "Familiar"), value: stats.familiar, color: "text-emerald-600" },
            { label: t("Bemästrade", "Mastered"), value: stats.mastered, color: "text-primary" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Due words */}
        {dueWords.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {dueWords.length} {t("ord att repetera", "words due for review")}
              </span>
            </div>
            <Button className="w-full" onClick={startReview}>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("Starta repetition", "Start Review")}
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <MurciMascot size="xs" mood="celebrating" className="mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {words.length === 0
                ? t("Spara ord för att börja repetera!", "Save words to start reviewing!")
                : t("Alla ord repeterade! Bra jobbat! 🎉", "All words reviewed! Great job! 🎉")}
            </p>
          </div>
        )}

        {/* Weak words */}
        {weakWords.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground">
                {t("Behöver extra övning", "Needs extra practice")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weakWords.slice(0, 5).map(w => (
                <Badge key={w.id} variant="outline" className="text-[10px]">
                  {capitalizeFirst(w.spanish)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Accuracy */}
        {stats.total > 0 && stats.accuracy > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t("Total träffsäkerhet:", "Overall accuracy:")} {stats.accuracy}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReviewCard;
