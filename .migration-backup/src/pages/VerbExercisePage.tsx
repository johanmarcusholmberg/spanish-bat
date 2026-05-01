import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { verbs, tenseNames, getItemsForLevel } from "@/data/spanishData";
import { checkAnswer } from "@/lib/answerUtils";
import { ArrowLeft, Check, X, RotateCcw, Info, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import SelectionPopup from "@/components/SelectionPopup";
import SaveWordButton from "@/components/vocabulary/SaveWordButton";
import {
  filterVerbTenses,
  tenseExplanations,
  getVerbPattern,
  splitVerbEnding,
  getSmartFeedback,
  getGrammarLessonForTense,
} from "@/lib/verbUtils";
import { supabase } from "@/integrations/supabase/client";

const pronouns = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"] as const;
const pronounKeys = ["yo", "tú", "él", "nosotros", "vosotros", "ellos"] as const;

const VerbExercisePage = () => {
  const { language, t } = useLanguage();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { updateProgress, trackLastActivity } = useProgress();
  const { logActivity } = useStreak();

  useEffect(() => { trackLastActivity("exercises", "/exercises/verbs", t("verbs")); }, []);
  const [selectedTense, setSelectedTense] = useState<string>("presente");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [completedVerbs, setCompletedVerbs] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showStructureWarning, setShowStructureWarning] = useState<string | null>(null);

  // Grammar progress for structure validation
  const [grammarProgress, setGrammarProgress] = useState<Record<string, boolean>>({});

  const availableVerbs = useMemo(
    () => getItemsForLevel(verbs, user?.level || "A1"),
    [user?.level]
  );

  // Load grammar progress to check if user studied tenses
  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("grammar_progress")
      .select("lesson_id, completed")
      .eq("user_id", session.user.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, boolean> = {};
          data.forEach((r) => { map[r.lesson_id] = r.completed; });
          setGrammarProgress(map);
        }
      });
  }, [session?.user]);

  // Filter tenses by user level
  const availableTenses = useMemo(() => {
    if (!availableVerbs[currentIndex]) return ["presente"];
    return filterVerbTenses(availableVerbs[currentIndex].tenses, user?.level || "A1");
  }, [availableVerbs, currentIndex, user?.level]);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setSelectedTense("presente");
  }, [user?.level]);

  // Reset selected tense if not available
  useEffect(() => {
    if (!availableTenses.includes(selectedTense)) {
      setSelectedTense(availableTenses[0] || "presente");
    }
  }, [availableTenses, selectedTense]);

  const contentRef = useRef<HTMLDivElement>(null);

  const currentVerb = availableVerbs[currentIndex];
  const pattern = currentVerb ? getVerbPattern(currentVerb.infinitive) : "-ar";

  // Find other verbs with same pattern for pattern grouping
  const patternSiblings = useMemo(() => {
    if (!currentVerb) return [];
    return availableVerbs
      .filter((v) => getVerbPattern(v.infinitive) === pattern && v.infinitive !== currentVerb.infinitive)
      .slice(0, 3);
  }, [availableVerbs, pattern, currentVerb?.infinitive]);

  if (!currentVerb) return null;

  const handleTenseSelect = (tense: string) => {
    // Check if user has studied this tense
    const lessonId = getGrammarLessonForTense(tense);
    if (lessonId && !grammarProgress[lessonId] && tense !== "presente") {
      setShowStructureWarning(tense);
      return;
    }
    setSelectedTense(tense);
    setAnswers({});
    setShowResults(false);
    setShowStructureWarning(null);
  };

  const proceedWithTense = (tense: string) => {
    setSelectedTense(tense);
    setAnswers({});
    setShowResults(false);
    setShowStructureWarning(null);
  };

  const handleCheck = () => {
    let correct = 0;
    pronounKeys.forEach((p) => {
      const tenseData = currentVerb.tenses[selectedTense];
      if (tenseData && answers[p]?.trim().toLowerCase() === tenseData[p].toLowerCase()) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);
  };

  const handleNext = () => {
    logActivity();
    const newCompleted = completedVerbs + 1;
    setCompletedVerbs(newCompleted);
    updateProgress("exercises", newCompleted, availableVerbs.length);
    setCurrentIndex((prev) => (prev + 1) % availableVerbs.length);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setShowBreakdown(false);
  };

  const tenseData = currentVerb.tenses[selectedTense];
  const tenseExpl = tenseExplanations[selectedTense];

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg" ref={contentRef}>
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">{t("verbs")}</h1>

        {/* Tense selector - filtered by level */}
        <div className="flex flex-wrap gap-2 mb-4">
          {availableTenses.map((tense) => (
            <button
              key={tense}
              onClick={() => handleTenseSelect(tense)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedTense === tense
                  ? "gradient-peach text-primary-foreground shadow-warm"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {tenseNames[tense]?.[language] || tense}
            </button>
          ))}
        </div>

        {/* Structure warning modal */}
        {showStructureWarning && (
          <div className="bg-accent/50 border border-accent rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2 mb-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {language === "sv"
                  ? `Denna övning använder ${tenseNames[showStructureWarning]?.sv || showStructureWarning}. Du har inte studerat denna struktur ännu.`
                  : `This exercise uses the ${tenseNames[showStructureWarning]?.en || showStructureWarning}. You have not studied this structure yet.`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/learn/grammar")}
                className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {language === "sv" ? "Gå till lektion" : "Go to lesson"}
              </button>
              <button
                onClick={() => proceedWithTense(showStructureWarning)}
                className="flex-1 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition"
              >
                {language === "sv" ? "Fortsätt ändå" : "Continue anyway"}
              </button>
            </div>
          </div>
        )}

        {/* Verb card */}
        <div className="bg-card rounded-lg p-6 shadow-soft">
          {/* Verb header + save + pattern badge */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-heading font-bold text-foreground">{currentVerb.infinitive}</h2>
              <SaveWordButton
                spanish={currentVerb.infinitive}
                context={tenseData?.example?.es}
                variant="icon"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {language === "sv" ? currentVerb.sv : currentVerb.en}
            </p>
            {/* Pattern badge */}
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {pattern.toUpperCase()} {language === "sv" ? "verb" : "verb"}
            </span>
          </div>

          {/* Contextual sentence */}
          {tenseData?.example && (
            <div className="bg-background rounded-md px-3 py-2 mb-4 text-sm">
              <p className="italic text-foreground">"{tenseData.example.es}"</p>
              <p className="text-muted-foreground mt-0.5">
                {language === "sv" ? tenseData.example.sv : tenseData.example.en}
              </p>
            </div>
          )}

          {/* Conjugation inputs */}
          <div className="space-y-3">
            {pronouns.map((pronoun, i) => {
              const key = pronounKeys[i];
              const correctAnswer = tenseData?.[key] || "";
              const userAnswer = answers[key] || "";
              const isCorrect = showResults && checkAnswer(userAnswer, correctAnswer);
              const isWrong = showResults && !isCorrect;
              const parts = showResults && isCorrect ? splitVerbEnding(correctAnswer, currentVerb.infinitive) : null;

              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium text-foreground">{pronoun}</span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                      disabled={showResults}
                      className={`w-full px-3 py-2 rounded-md border text-sm transition focus:outline-none focus:ring-2 focus:ring-ring ${
                        showResults
                          ? isCorrect
                            ? "border-mint-dark bg-mint/20 text-foreground"
                            : "border-destructive bg-destructive/10 text-foreground"
                          : "border-border bg-background text-foreground"
                      }`}
                      placeholder="..."
                    />
                    {showResults && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isCorrect ? <Check className="h-4 w-4 text-mint-dark" /> : <X className="h-4 w-4 text-destructive" />}
                      </span>
                    )}
                  </div>
                  {isWrong && (
                    <div className="min-w-[80px]">
                      {/* Highlighted verb ending */}
                      {(() => {
                        const split = splitVerbEnding(correctAnswer, currentVerb.infinitive);
                        if (split) {
                          return (
                            <span className="text-xs font-medium">
                              <span className="text-foreground">{split.stem}</span>
                              <span className="text-primary font-bold">{split.ending}</span>
                            </span>
                          );
                        }
                        return <span className="text-xs text-mint-dark font-medium">{correctAnswer}</span>;
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Smart error feedback */}
          {showResults && score < 6 && (
            <div className="mt-4 bg-accent/30 rounded-md px-3 py-2.5 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  {pronounKeys.map((key) => {
                    const correctAnswer = tenseData?.[key] || "";
                    const userAnswer = answers[key] || "";
                    if (checkAnswer(userAnswer, correctAnswer)) return null;
                    const feedback = getSmartFeedback(userAnswer, correctAnswer, selectedTense, language);
                    if (!feedback) return null;
                    return (
                      <p key={key} className="text-muted-foreground mb-1 last:mb-0">
                        <span className="font-medium text-foreground">{pronouns[pronounKeys.indexOf(key)]}:</span> {feedback}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tense explanation after check */}
          {showResults && tenseExpl && (
            <div className="mt-4 bg-background rounded-md px-3 py-2.5 text-sm border border-border">
              <p className="font-medium text-foreground mb-1">
                {language === "sv" ? `Tempus: ${tenseExpl.sv}` : `Tense: ${tenseExpl.en}`}
              </p>
              <p className="text-muted-foreground">
                {language === "sv" ? tenseExpl.usage_sv : tenseExpl.usage_en}
              </p>
            </div>
          )}

          {/* Verb structure breakdown (collapsible) */}
          {showResults && (
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition"
            >
              {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {language === "sv" ? "Visa verbstruktur" : "Show verb structure"}
            </button>
          )}
          {showBreakdown && (
            <div className="mt-2 bg-background rounded-md px-3 py-2.5 text-sm border border-border space-y-2">
              <p className="text-foreground">
                <span className="font-medium">{currentVerb.infinitive}</span>
                {" → "}
                {language === "sv" ? "infinitiv" : "infinitive"}
              </p>
              {pattern !== "irregular" && (
                <>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{currentVerb.infinitive.slice(0, -2)}-</span>
                    {" → "}
                    {language === "sv" ? "stam" : "stem"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-primary">-{currentVerb.infinitive.slice(-2)}</span>
                    {" → "}
                    {language === "sv" ? "verbändelse" : "verb ending"}
                    {" "}({pattern})
                  </p>
                </>
              )}
              {/* Pattern siblings */}
              {patternSiblings.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === "sv" ? `Andra ${pattern}-verb:` : `Other ${pattern} verbs:`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patternSiblings.map((v) => (
                      <span key={v.infinitive} className="px-2 py-0.5 rounded-full text-xs bg-muted text-foreground">
                        {v.infinitive}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {!showResults ? (
              <button onClick={handleCheck} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition">
                {t("checkAnswer")}
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {t("score")}: {score}/6
                </div>
                <button onClick={handleNext} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {t("nextQuestion")}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          {currentIndex + 1} / {availableVerbs.length}
        </p>
      </div>
      <SelectionPopup containerRef={contentRef} />
    </AppLayout>
  );
};

export default VerbExercisePage;
