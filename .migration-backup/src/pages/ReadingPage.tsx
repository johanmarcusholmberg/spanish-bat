import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { readingTexts, ReadingText } from "@/data/readingTexts";
import { getItemsForLevel } from "@/data/spanishData";
import { BookOpen, Check, X, ArrowRight, RotateCcw, Tag } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import SelectionPopup from "@/components/SelectionPopup";

// Fisher-Yates shuffle seeded by a value to get deterministic-ish but varied order
function shuffleArray<T>(arr: T[], avoid: string[] = [], getId: (t: T) => string = () => ""): T[] {
  const copy = [...arr];
  // Move recently seen to end
  const recent = new Set(avoid);
  const fresh = copy.filter(i => !recent.has(getId(i)));
  const stale = copy.filter(i => recent.has(getId(i)));
  const ordered = [...fresh, ...stale];
  // Shuffle the fresh portion
  for (let i = fresh.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }
  return ordered;
}

const RECENT_KEY = "murci_reading_recent";
const MAX_RECENT = 6;

function getRecentIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}
function addRecentId(id: string) {
  const recent = getRecentIds().filter(r => r !== id);
  recent.unshift(id);
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

const topicLabels: Record<string, { sv: string; en: string }> = {
  family: { sv: "Familj", en: "Family" },
  "daily routine": { sv: "Vardag", en: "Daily routine" },
  home: { sv: "Hem", en: "Home" },
  shopping: { sv: "Shopping", en: "Shopping" },
  friendship: { sv: "Vänskap", en: "Friendship" },
  travel: { sv: "Resor", en: "Travel" },
  "life changes": { sv: "Livsförändringar", en: "Life changes" },
  food: { sv: "Mat", en: "Food" },
  work: { sv: "Arbete", en: "Work" },
  environment: { sv: "Miljö", en: "Environment" },
  technology: { sv: "Teknologi", en: "Technology" },
  education: { sv: "Utbildning", en: "Education" },
  health: { sv: "Hälsa", en: "Health" },
  history: { sv: "Historia", en: "History" },
  culture: { sv: "Kultur", en: "Culture" },
  society: { sv: "Samhälle", en: "Society" },
  art: { sv: "Konst", en: "Art" },
  economy: { sv: "Ekonomi", en: "Economy" },
  literature: { sv: "Litteratur", en: "Literature" },
  philosophy: { sv: "Filosofi", en: "Philosophy" },
  linguistics: { sv: "Lingvistik", en: "Linguistics" },
};

const ReadingPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();

  useEffect(() => { trackLastActivity("reading", "/learn/reading", t("reading")); }, []);

  const [textIndex, setTextIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Build shuffled text list, avoiding recently seen
  const orderedTexts = useMemo(() => {
    const levelTexts = getItemsForLevel(readingTexts, user?.level || "A1")
      .filter(t => t.level === (user?.level || "A1"));
    // Sort by difficulty within level first
    levelTexts.sort((a, b) => a.difficulty - b.difficulty);
    const recentIds = getRecentIds();
    return shuffleArray(levelTexts, recentIds, t => t.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.level]);

  // Also include texts from lower levels as fallback
  const allAvailableTexts = useMemo(() => {
    const all = getItemsForLevel(readingTexts, user?.level || "A1");
    const currentLevel = orderedTexts;
    const others = all.filter(t => t.level !== (user?.level || "A1"));
    const recentIds = getRecentIds();
    return [...currentLevel, ...shuffleArray(others, recentIds, t => t.id)];
  }, [orderedTexts, user?.level]);

  useEffect(() => {
    setTextIndex(0);
    setAnswers({});
    setSubmitted(false);
  }, [user?.level]);

  const contentRef = useRef<HTMLDivElement>(null);

  const current = allAvailableTexts[textIndex % allAvailableTexts.length];
  if (!current) return <AppLayout><p>No texts available.</p></AppLayout>;

  const handleSelect = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  };

  const handleSubmit = () => setSubmitted(true);

  const handleNext = () => {
    logActivity();
    addRecentId(current.id);
    const newCompleted = textIndex + 1;
    updateProgress("reading", newCompleted, allAvailableTexts.length);
    setTextIndex((i) => i + 1);
    setAnswers({});
    setSubmitted(false);
  };

  const correctCount = submitted
    ? current.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  const topicLabel = topicLabels[current.topic]?.[language] || current.topic;

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl mx-auto" ref={contentRef}>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          {t("reading")}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{t("readingDesc")}</p>

        {/* Text info */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading font-bold text-foreground text-lg">
            {current.title[language]}
          </h2>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
            {current.level}
          </span>
        </div>

        {/* Topic & grammar tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            <Tag className="h-3 w-3" />
            {topicLabel}
          </span>
          {current.grammarFocus && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {current.grammarFocus}
            </span>
          )}
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {language === "sv" ? "Svårighet" : "Difficulty"}: {"★".repeat(current.difficulty)}{"☆".repeat(3 - current.difficulty)}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="text-xs text-muted-foreground mb-3">
          {language === "sv" ? "Text" : "Text"} {(textIndex % allAvailableTexts.length) + 1} / {allAvailableTexts.length}
        </div>

        {/* Reading text */}
        <div className="bg-card rounded-lg p-5 shadow-soft mb-6 select-text">
          <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
            {current.text}
          </p>
          <p className="text-xs text-muted-foreground mt-3 italic">
            {language === "sv"
              ? "💡 Markera ett ord eller fras för att översätta och spara"
              : "💡 Select a word or phrase to translate and save"}
          </p>
        </div>

        {/* Questions */}
        <h3 className="font-heading font-bold text-foreground mb-3">{t("questions")}</h3>
        <div className="space-y-4 mb-6">
          {current.questions.map((q, qi) => (
            <div key={qi} className="bg-card rounded-lg p-4 shadow-soft">
              <p className="font-medium text-foreground text-sm mb-3">
                {qi + 1}. {q.question[language]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const isCorrect = q.correctIndex === oi;
                  let cls = "border border-border bg-background text-foreground hover:bg-muted";
                  if (submitted && isCorrect) {
                    cls = "border-2 border-secondary bg-secondary/20 text-foreground";
                  } else if (submitted && selected && !isCorrect) {
                    cls = "border-2 border-destructive bg-destructive/10 text-foreground";
                  } else if (selected) {
                    cls = "border-2 border-primary bg-primary/10 text-foreground";
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${cls}`}
                    >
                      {submitted && isCorrect && <Check className="h-4 w-4 text-secondary-foreground" />}
                      {submitted && selected && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit / Result */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < current.questions.length}
            className="w-full py-3 rounded-lg gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition disabled:opacity-50"
          >
            {t("checkAnswer")}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-card rounded-lg p-4 shadow-soft text-center">
              <p className="font-heading font-bold text-foreground text-lg">
                {correctCount} / {current.questions.length} {t("correct").toLowerCase()}!
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-lg gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {t("nextText")} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default ReadingPage;
