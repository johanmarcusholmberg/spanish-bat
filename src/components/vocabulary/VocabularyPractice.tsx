import React, { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { VocabularyWord } from "@/hooks/useVocabulary";
import { useSpanishTTS } from "@/hooks/useSpanishTTS";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MurciMascot from "@/components/MurciMascot";
import {
  ArrowLeft,
  Check,
  Volume2,
  X,
  RotateCcw,
  Shuffle,
} from "lucide-react";

type PracticeMode = "select" | "flashcard" | "multiple_choice" | "typing" | "sentence_completion";
type TranslationDirection = "es_to_native" | "native_to_es";

interface Props {
  words: VocabularyWord[];
  allWords: VocabularyWord[];
  onExit: () => void;
  onToggleLearned: (id: string) => Promise<boolean>;
}

const MODES = [
  { id: "flashcard" as const, labelSv: "Flashcards", labelEn: "Flashcards", icon: "🃏", minWords: 3 },
  { id: "multiple_choice" as const, labelSv: "Flerval", labelEn: "Multiple Choice", icon: "🔘", minWords: 4 },
  { id: "typing" as const, labelSv: "Skriv översättning", labelEn: "Type Translation", icon: "⌨️", minWords: 3 },
  { id: "sentence_completion" as const, labelSv: "Fyll i meningen", labelEn: "Sentence Completion", icon: "📝", minWords: 3 },
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/** Pick a random direction, biased 50/50 */
const pickDirection = (): TranslationDirection =>
  Math.random() < 0.5 ? "es_to_native" : "native_to_es";

const VocabularyPractice: React.FC<Props> = ({ words, allWords, onExit, onToggleLearned }) => {
  const { language } = useLanguage();
  const { speak, isSupported: ttsSupported } = useSpanishTTS();
  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  const [mode, setMode] = useState<PracticeMode>("select");
  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [directions, setDirections] = useState<TranslationDirection[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Flashcard state
  const [flipped, setFlipped] = useState(false);

  // Multiple choice state
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [mcSelected, setMcSelected] = useState<string | null>(null);

  // Typing state
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typingChecked, setTypingChecked] = useState(false);
  const [typingCorrect, setTypingCorrect] = useState(false);

  // Sentence completion state
  const [scAnswer, setScAnswer] = useState("");
  const [scChecked, setScChecked] = useState(false);
  const [scCorrect, setScCorrect] = useState(false);

  const currentDirection = directions[current] ?? "es_to_native";

  /** Get the "prompt" text based on direction */
  const getPrompt = (word: VocabularyWord, dir: TranslationDirection) =>
    dir === "es_to_native" ? word.spanish : word.translation;

  /** Get the "answer" text based on direction */
  const getAnswer = (word: VocabularyWord, dir: TranslationDirection) =>
    dir === "es_to_native" ? word.translation : word.spanish;

  const startMode = useCallback((m: PracticeMode) => {
    const shuffled = shuffle(words).slice(0, 10);
    const dirs = shuffled.map(() => pickDirection());
    setQueue(shuffled);
    setDirections(dirs);
    setCurrent(0);
    setScore(0);
    setTotal(shuffled.length);
    setShowResult(false);
    setFlipped(false);
    setMcSelected(null);
    setTypedAnswer("");
    setTypingChecked(false);
    setScAnswer("");
    setScChecked(false);
    setMode(m);

    if (m === "multiple_choice") {
      generateMcOptions(shuffled[0], shuffled, dirs[0]);
    }
  }, [words]);

  const generateMcOptions = (word: VocabularyWord, pool: VocabularyWord[], dir: TranslationDirection) => {
    const correct = getAnswer(word, dir);
    const distractors = shuffle(allWords.filter(w => w.id !== word.id))
      .slice(0, 3)
      .map(w => getAnswer(w, dir));
    const opts = shuffle([correct, ...distractors.slice(0, 3)]);
    if (!opts.includes(correct)) opts[0] = correct;
    setMcOptions(opts);
    setMcSelected(null);
  };

  const nextQuestion = useCallback(() => {
    const next = current + 1;
    if (next >= queue.length) {
      setShowResult(true);
      return;
    }
    setCurrent(next);
    setFlipped(false);
    setMcSelected(null);
    setTypedAnswer("");
    setTypingChecked(false);
    setScAnswer("");
    setScChecked(false);

    if (mode === "multiple_choice") {
      generateMcOptions(queue[next], queue, directions[next]);
    }
  }, [current, queue, mode, directions]);

  const card = queue[current];
  const progress = queue.length > 0 ? ((current + 1) / queue.length) * 100 : 0;

  const dirLabel = currentDirection === "es_to_native"
    ? t("🇪🇸 → Översätt", "🇪🇸 → Translate")
    : t("→ 🇪🇸 Skriv på spanska", "→ 🇪🇸 Write in Spanish");

  // Result screen
  if (showResult) {
    const pct = Math.round((score / total) * 100);
    const murciMood = pct >= 80 ? "celebrating" : pct >= 50 ? "encouraging" : "thinking";
    const murciMsg = pct >= 80
      ? t("Fantastiskt! 🎉", "Amazing! 🎉")
      : pct >= 50
        ? t("Bra jobbat! Fortsätt öva!", "Good job! Keep practicing!")
        : t("Övning ger färdighet! 💪", "Practice makes perfect! 💪");

    return (
      <div className="animate-fade-in space-y-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center">{t("Resultat", "Results")}</h2>
        <MurciMascot size="md" mood={murciMood} message={murciMsg} className="mx-auto" />
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-4xl font-bold text-primary">{pct}%</p>
            <p className="text-muted-foreground">{score}/{total} {t("rätt", "correct")}</p>
            <Progress value={pct} className="h-3" />
          </CardContent>
        </Card>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("Tillbaka", "Back")}
          </Button>
          <Button onClick={() => startMode(mode)}>
            <RotateCcw className="h-4 w-4 mr-1" /> {t("Igen", "Again")}
          </Button>
        </div>
      </div>
    );
  }

  // Mode selection
  if (mode === "select") {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onExit}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{t("Välj övningstyp", "Choose practice type")}</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {words.length} {t("ord att öva på", "words to practice")} · {t("Blandar översättningsriktning", "Mixed translation directions")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.filter(m => words.length >= m.minWords).map((m) => (
            <button
              key={m.id}
              onClick={() => startMode(m.id)}
              className="rounded-xl border bg-card p-5 text-left transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="text-2xl mb-2">{m.icon}</div>
              <h3 className="font-semibold">{language === "sv" ? m.labelSv : m.labelEn}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!card) return null;

  const prompt = getPrompt(card, currentDirection);
  const answer = getAnswer(card, currentDirection);

  // Direction badge
  const DirectionBadge = () => (
    <Badge variant="secondary" className="text-[10px]">{dirLabel}</Badge>
  );

  // FLASHCARD MODE
  if (mode === "flashcard") {
    return (
      <div className="animate-fade-in space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode("select")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("Tillbaka", "Back")}
          </Button>
          <div className="flex items-center gap-2">
            <DirectionBadge />
            <span className="text-sm text-muted-foreground">{current + 1}/{queue.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <Card
          className="cursor-pointer transition-transform hover:scale-[1.01] min-h-[220px] flex items-center justify-center"
          onClick={() => setFlipped(!flipped)}
        >
          <CardContent className="p-8 text-center">
            <p className="text-2xl font-bold">{flipped ? answer : prompt}</p>
            {!flipped && currentDirection === "es_to_native" && ttsSupported && (
              <button onClick={(e) => { e.stopPropagation(); speak(card.spanish); }} className="mt-3 text-muted-foreground hover:text-foreground">
                <Volume2 className="h-5 w-5" />
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-4">{t("Tryck för att vända", "Tap to flip")}</p>
          </CardContent>
        </Card>
        {flipped && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => { nextQuestion(); }}>{t("Visste inte", "Didn't know")}</Button>
            <Button onClick={() => { setScore(s => s + 1); onToggleLearned(card.id); nextQuestion(); }}>
              <Check className="h-4 w-4 mr-1" /> {t("Visste!", "Knew it!")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // MULTIPLE CHOICE MODE
  if (mode === "multiple_choice") {
    const isCorrect = mcSelected === answer;
    return (
      <div className="animate-fade-in space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode("select")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("Tillbaka", "Back")}
          </Button>
          <div className="flex items-center gap-2">
            <DirectionBadge />
            <span className="text-sm text-muted-foreground">{current + 1}/{queue.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t("Vad betyder:", "What does this mean:")}</p>
            <p className="text-xl font-bold">{prompt}</p>
            {currentDirection === "es_to_native" && ttsSupported && (
              <button onClick={() => speak(card.spanish)} className="mt-2 text-muted-foreground hover:text-foreground">
                <Volume2 className="h-4 w-4" />
              </button>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-2">
          {mcOptions.map((opt, i) => {
            let cls = "border bg-card hover:bg-muted";
            if (mcSelected) {
              if (opt === answer) cls = "border-2 border-primary bg-primary/10";
              else if (opt === mcSelected) cls = "border-2 border-destructive bg-destructive/10";
            }
            return (
              <button
                key={i}
                disabled={!!mcSelected}
                onClick={() => {
                  setMcSelected(opt);
                  if (opt === answer) setScore(s => s + 1);
                }}
                className={`rounded-lg p-3 text-left text-sm transition ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {mcSelected && (
          <div className="flex justify-center">
            <Button onClick={nextQuestion}>
              {current < queue.length - 1 ? t("Nästa", "Next") : t("Se resultat", "See results")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // TYPING MODE
  if (mode === "typing") {
    const checkTyping = () => {
      const correct = answer.toLowerCase().trim();
      const typed = typedAnswer.toLowerCase().trim();
      const isCorrect = correct === typed;
      setTypingCorrect(isCorrect);
      setTypingChecked(true);
      if (isCorrect) setScore(s => s + 1);
    };

    return (
      <div className="animate-fade-in space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode("select")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("Tillbaka", "Back")}
          </Button>
          <div className="flex items-center gap-2">
            <DirectionBadge />
            <span className="text-sm text-muted-foreground">{current + 1}/{queue.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t("Översätt:", "Translate:")}</p>
            <p className="text-xl font-bold">{prompt}</p>
            {currentDirection === "es_to_native" && ttsSupported && (
              <button onClick={() => speak(card.spanish)} className="mt-2 text-muted-foreground hover:text-foreground">
                <Volume2 className="h-4 w-4" />
              </button>
            )}
          </CardContent>
        </Card>
        <form onSubmit={(e) => { e.preventDefault(); if (!typingChecked) checkTyping(); else nextQuestion(); }}>
          <Input
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder={currentDirection === "native_to_es"
              ? t("Skriv på spanska...", "Type in Spanish...")
              : t("Skriv översättningen...", "Type the translation...")}
            disabled={typingChecked}
            autoFocus
            className={typingChecked ? (typingCorrect ? "border-primary" : "border-destructive") : ""}
          />
          {typingChecked && !typingCorrect && (
            <p className="text-sm text-destructive mt-2">
              {t("Rätt svar:", "Correct answer:")} <span className="font-medium">{answer}</span>
            </p>
          )}
          {typingChecked && typingCorrect && (
            <p className="text-sm text-primary mt-2 flex items-center gap-1">
              <Check className="h-4 w-4" /> {t("Rätt!", "Correct!")}
            </p>
          )}
          <Button type="submit" className="w-full mt-3">
            {typingChecked ? (current < queue.length - 1 ? t("Nästa", "Next") : t("Se resultat", "See results")) : t("Kontrollera", "Check")}
          </Button>
        </form>
      </div>
    );
  }

  // SENTENCE COMPLETION MODE
  if (mode === "sentence_completion") {
    const spanishWord = card.spanish;
    const blankLength = Math.max(3, spanishWord.length);
    const blanks = "_".repeat(blankLength);
    const hint = `${t("Fyll i det spanska ordet som betyder", "Fill in the Spanish word that means")}: "${card.translation}"`;

    const checkSc = () => {
      const correct = spanishWord.toLowerCase().trim();
      const typed = scAnswer.toLowerCase().trim();
      const isCorrect = correct === typed;
      setScCorrect(isCorrect);
      setScChecked(true);
      if (isCorrect) setScore(s => s + 1);
    };

    return (
      <div className="animate-fade-in space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode("select")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("Tillbaka", "Back")}
          </Button>
          <span className="text-sm text-muted-foreground">{current + 1}/{queue.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">{hint}</p>
            <p className="text-2xl font-mono tracking-widest text-primary">{blanks}</p>
            {card.context && (
              <p className="text-xs text-muted-foreground mt-3 italic">
                {t("Kontext:", "Context:")} "{card.context}"
              </p>
            )}
          </CardContent>
        </Card>
        <form onSubmit={(e) => { e.preventDefault(); if (!scChecked) checkSc(); else nextQuestion(); }}>
          <Input
            value={scAnswer}
            onChange={(e) => setScAnswer(e.target.value)}
            placeholder={t("Skriv det spanska ordet...", "Type the Spanish word...")}
            disabled={scChecked}
            autoFocus
            className={scChecked ? (scCorrect ? "border-primary" : "border-destructive") : ""}
          />
          {scChecked && !scCorrect && (
            <p className="text-sm text-destructive mt-2">
              {t("Rätt svar:", "Correct answer:")} <span className="font-medium">{spanishWord}</span>
            </p>
          )}
          {scChecked && scCorrect && (
            <p className="text-sm text-primary mt-2 flex items-center gap-1">
              <Check className="h-4 w-4" /> {t("Rätt!", "Correct!")}
            </p>
          )}
          <Button type="submit" className="w-full mt-3">
            {scChecked ? (current < queue.length - 1 ? t("Nästa", "Next") : t("Se resultat", "See results")) : t("Kontrollera", "Check")}
          </Button>
        </form>
      </div>
    );
  }

  return null;
};

export default VocabularyPractice;
