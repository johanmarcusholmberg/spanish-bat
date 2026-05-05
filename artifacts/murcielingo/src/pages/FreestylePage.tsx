import React, { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  ArrowLeft,
  Check,
  X,
  Volume2,
  ChevronRight,
  RotateCcw,
  BookmarkPlus,
} from "lucide-react";
import {
  LEVEL_ORDER,
  getFreestyleTopics,
  getChallengeTopics,
  type CurriculumTopic,
  type FreestyleItem,
  type ExerciseMode,
} from "@/config/curriculum";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { useVocabulary } from "@/hooks/useVocabulary";
import { cn } from "@/lib/utils";

type Phase = "select-level" | "select-topic" | "select-mode" | "practice" | "results";

const FreestylePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { trackLastActivity } = useProgress();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const { addWord, words: savedWords } = useVocabulary();

  const currentLevel = (user?.level || "A1") as Level;
  const [practiceLevel, setPracticeLevel] = useState<Level>(currentLevel);
  const [selectedTopic, setSelectedTopic] = useState<CurriculumTopic | null>(null);
  const [selectedMode, setSelectedMode] = useState<ExerciseMode>("multiple-choice");
  const [phase, setPhase] = useState<Phase>("select-topic");

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const [results, setResults] = useState<{ item: FreestyleItem; correct: boolean }[]>([]);

  const loc = (sv: string, en: string) => (language === "sv" ? sv : en);

  // Available levels
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
  const availableLevels = LEVEL_ORDER.slice(0, Math.min(currentIdx + 2, LEVEL_ORDER.length));

  // Topics for selected level
  const topics = useMemo(() => {
    const main = getFreestyleTopics(practiceLevel, true);
    if (practiceLevel !== currentLevel) return main;
    const challenge = getChallengeTopics(practiceLevel);
    return [...main, ...challenge];
  }, [practiceLevel, currentLevel]);

  const isChallenge = selectedTopic ? LEVEL_ORDER.indexOf(selectedTopic.level) > currentIdx : false;
  const isReview = selectedTopic ? LEVEL_ORDER.indexOf(selectedTopic.level) < currentIdx : false;

  // Exercise items
  const items = useMemo(() => {
    if (!selectedTopic?.sampleContent) return [];
    return [...selectedTopic.sampleContent].sort(() => Math.random() - 0.5);
  }, [selectedTopic]);

  const currentItem = items[currentIndex];

  // Direction: mix native→es and es→native
  const direction = useMemo(() => {
    if (!currentItem) return "to-es" as const;
    return currentIndex % 3 === 0 ? "from-es" : "to-es";
  }, [currentIndex, currentItem]);

  const getQuestion = () => {
    if (!currentItem) return "";
    if (direction === "to-es") return language === "sv" ? currentItem.sv : currentItem.en;
    return currentItem.es;
  };

  const getCorrectAnswer = () => {
    if (!currentItem) return "";
    if (direction === "to-es") return currentItem.es;
    return language === "sv" ? currentItem.sv : currentItem.en;
  };

  // Generate MC options
  const options = useMemo(() => {
    if (!currentItem || selectedMode !== "multiple-choice") return [];
    const correct = getCorrectAnswer();
    const others = items
      .filter((it) => it !== currentItem)
      .map((it) => (direction === "to-es" ? it.es : language === "sv" ? it.sv : it.en))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const all = [correct, ...others].sort(() => Math.random() - 0.5);
    return all;
  }, [currentItem, selectedMode, direction, items, language]);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    const correct = answer.toLowerCase().trim() === getCorrectAnswer().toLowerCase().trim();
    if (correct) setScore((s) => s + 1);
    setResults((r) => [...r, { item: currentItem, correct }]);
  };

  const handleNext = () => {
    if (currentIndex >= items.length - 1) {
      setPhase("results");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setAnswered(false);
    setSelectedAnswer(null);
    setUserInput("");
    setShowFlashcardBack(false);
  };

  const resetPractice = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setUserInput("");
    setShowFlashcardBack(false);
    setResults([]);
    setPhase("practice");
  };

  const startPractice = (topic: CurriculumTopic, mode: ExerciseMode) => {
    setSelectedTopic(topic);
    setSelectedMode(mode);
    resetPractice();
    trackLastActivity("freestyle", "/exercises/freestyle", `Freestyle: ${topic.label[language === "sv" ? "sv" : "en"]}`);
  };

  const isWordSaved = (es: string) =>
    savedWords.some((w) => w.spanish.toLowerCase().trim() === es.toLowerCase().trim());

  const handleSaveWord = async (item: FreestyleItem) => {
    if (isWordSaved(item.es)) return;
    await addWord(
      item.es,
      language === "sv" ? item.sv : item.en,
      undefined,
      "freestyle",
      false,
      "word",
    );
  };

  // ── Topic selection ──
  if (phase === "select-topic" || phase === "select-level" || phase === "select-mode") {
    return (
      <AppLayout>
        <div className="animate-fade-in space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {loc("Freestyle", "Freestyle")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {loc("Välj ämne och övningstyp", "Choose topic and exercise type")}
              </p>
            </div>
          </div>

          {/* Level selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">{loc("Nivå", "Level")}:</span>
            <Select value={practiceLevel} onValueChange={(v) => setPracticeLevel(v as Level)}>
              <SelectTrigger className="w-auto h-9 text-sm min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}{" "}
                    {lvl === currentLevel
                      ? `(${loc("nuvarande", "current")})`
                      : LEVEL_ORDER.indexOf(lvl) < currentIdx
                      ? `(${loc("repetition", "review")})`
                      : `(${loc("utmaning", "challenge")})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((topic) => {
              const topicIsChallenge = LEVEL_ORDER.indexOf(topic.level) > currentIdx;
              const topicIsReview = LEVEL_ORDER.indexOf(topic.level) < currentIdx;

              return (
                <Card
                  key={topic.id}
                  className="cursor-pointer hover:shadow-warm transition-all hover:-translate-y-0.5"
                  onClick={() => {
                    setSelectedTopic(topic);
                    setPhase("select-mode");
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-foreground">
                          {topic.label[language === "sv" ? "sv" : "en"]}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {topic.sampleContent?.length || 0} {loc("objekt", "items")} · {topic.level}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {topicIsChallenge && (
                          <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">
                            {loc("Utmaning", "Challenge")}
                          </Badge>
                        )}
                        {topicIsReview && (
                          <Badge variant="secondary" className="text-[10px]">
                            {loc("Repetition", "Review")}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Mode selection modal */}
        {phase === "select-mode" && selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setPhase("select-topic")}>
            <div className="bg-card w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading font-bold text-lg text-foreground">
                {selectedTopic.label[language === "sv" ? "sv" : "en"]}
              </h3>
              <p className="text-sm text-muted-foreground">
                {loc("Välj övningstyp:", "Choose exercise type:")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {selectedTopic.exerciseModes.map((mode) => (
                  <Button
                    key={mode}
                    variant="outline"
                    className="h-auto py-3 text-sm"
                    onClick={() => startPractice(selectedTopic, mode)}
                  >
                    {modeLabel(mode, language)}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setPhase("select-topic")}>
                {loc("Tillbaka", "Back")}
              </Button>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  // ── Results ──
  if (phase === "results") {
    const pct = items.length > 0 ? Math.round((score / items.length) * 100) : 0;
    return (
      <AppLayout>
        <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}{" "}
              {loc("Resultat", "Results")}
            </h2>
            <p className="text-4xl font-bold text-primary">{score}/{items.length}</p>
            <Progress value={pct} className="h-3" />
            <p className="text-sm text-muted-foreground">{pct}% {loc("rätt", "correct")}</p>
          </div>

          {/* Missed items */}
          {results.filter((r) => !r.correct).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">{loc("Att repetera", "To review")}:</h3>
              {results
                .filter((r) => !r.correct)
                .map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{r.item.es}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === "sv" ? r.item.sv : r.item.en}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveWord(r.item)}
                      disabled={isWordSaved(r.item.es)}
                    >
                      {isWordSaved(r.item.es) ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" onClick={resetPractice}>
              <RotateCcw className="h-4 w-4 mr-1" /> {loc("Försök igen", "Try again")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setPhase("select-topic")}>
              {loc("Nytt ämne", "New topic")}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Practice ──
  if (!currentItem) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">
          {loc("Inga övningsobjekt tillgängliga", "No practice items available")}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setPhase("select-topic")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {loc("Tillbaka", "Back")}
          </Button>
          <div className="flex items-center gap-2">
            {isChallenge && <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">{loc("Utmaning", "Challenge")}</Badge>}
            {isReview && <Badge variant="secondary" className="text-[10px]">{loc("Repetition", "Review")}</Badge>}
            <span className="text-sm font-medium text-muted-foreground">
              {currentIndex + 1}/{items.length}
            </span>
          </div>
        </div>

        <Progress value={((currentIndex + 1) / items.length) * 100} className="h-2" />

        {/* Direction label */}
        <p className="text-xs text-center text-muted-foreground">
          {direction === "to-es"
            ? loc("Översätt till spanska", "Translate to Spanish")
            : loc("Vad betyder detta?", "What does this mean?")}
        </p>

        {/* Question */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-xl font-bold text-foreground">{getQuestion()}</p>
            {ttsSupported && direction === "from-es" && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => speak(currentItem.es)}>
                <Volume2 className="h-4 w-4 mr-1" /> {loc("Lyssna", "Listen")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Answer area */}
        {selectedMode === "flashcards" ? (
          <div className="space-y-3">
            {showFlashcardBack ? (
              <>
                <Card className="border-primary/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-lg font-medium text-primary">{getCorrectAnswer()}</p>
                  </CardContent>
                </Card>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-destructive/50 text-destructive"
                    onClick={() => {
                      setResults((r) => [...r, { item: currentItem, correct: false }]);
                      handleNext();
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> {loc("Visste inte", "Didn't know")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setScore((s) => s + 1);
                      setResults((r) => [...r, { item: currentItem, correct: true }]);
                      handleNext();
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" /> {loc("Visste!", "Knew it!")}
                  </Button>
                </div>
              </>
            ) : (
              <Button className="w-full h-14" onClick={() => setShowFlashcardBack(true)}>
                {loc("Visa svar", "Show answer")}
              </Button>
            )}
          </div>
        ) : selectedMode === "typing" ? (
          <div className="space-y-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !answered && userInput.trim() && handleAnswer(userInput)}
              disabled={answered}
              placeholder={loc("Skriv ditt svar…", "Type your answer…")}
              className="w-full rounded-lg border bg-card px-4 py-3 text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {!answered ? (
              <Button className="w-full" onClick={() => handleAnswer(userInput)} disabled={!userInput.trim()}>
                {loc("Kontrollera", "Check")}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className={cn("rounded-lg p-3 text-center text-sm font-medium",
                  selectedAnswer?.toLowerCase().trim() === getCorrectAnswer().toLowerCase().trim()
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {selectedAnswer?.toLowerCase().trim() === getCorrectAnswer().toLowerCase().trim()
                    ? `✓ ${loc("Rätt!", "Correct!")}`
                    : `✗ ${loc("Rätt svar:", "Correct answer:")} ${getCorrectAnswer()}`}
                </div>
                <Button className="w-full" onClick={handleNext}>
                  {currentIndex >= items.length - 1 ? loc("Se resultat", "See results") : loc("Nästa", "Next")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* multiple-choice / default */
          <div className="space-y-2">
            {options.map((opt, i) => {
              const isCorrect = opt.toLowerCase().trim() === getCorrectAnswer().toLowerCase().trim();
              const isSelected = selectedAnswer === opt;
              return (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-3 text-sm justify-start",
                    answered && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                    answered && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20",
                  )}
                  onClick={() => handleAnswer(opt)}
                  disabled={answered}
                >
                  {opt}
                </Button>
              );
            })}
            {answered && (
              <Button className="w-full mt-2" onClick={handleNext}>
                {currentIndex >= items.length - 1 ? loc("Se resultat", "See results") : loc("Nästa", "Next")}
              </Button>
            )}
          </div>
        )}

        {/* Save word shortcut */}
        {answered && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSaveWord(currentItem)}
              disabled={isWordSaved(currentItem.es)}
              className="text-xs gap-1"
            >
              {isWordSaved(currentItem.es) ? (
                <><Check className="h-3 w-3" /> {loc("Sparad", "Saved")}</>
              ) : (
                <><BookmarkPlus className="h-3 w-3" /> {loc("Spara till ordbok", "Save to dictionary")}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function modeLabel(mode: ExerciseMode, lang: string): string {
  const labels: Record<ExerciseMode, { sv: string; en: string }> = {
    flashcards: { sv: "Flashcards", en: "Flashcards" },
    "multiple-choice": { sv: "Flerval", en: "Multiple choice" },
    typing: { sv: "Skriva", en: "Typing" },
    matching: { sv: "Matcha", en: "Matching" },
    pronunciation: { sv: "Uttal", en: "Pronunciation" },
    "sentence-completion": { sv: "Komplettera", en: "Complete" },
    "mixed-quiz": { sv: "Blandat quiz", en: "Mixed quiz" },
  };
  return labels[mode]?.[lang === "sv" ? "sv" : "en"] || mode;
}

export default FreestylePage;
