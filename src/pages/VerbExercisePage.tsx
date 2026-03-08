import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { verbs, tenseNames, getItemsForLevel } from "@/data/spanishData";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pronouns = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"] as const;
const pronounKeys = ["yo", "tú", "él", "nosotros", "vosotros", "ellos"] as const;

const VerbExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTense, setSelectedTense] = useState<string>("presente");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const availableVerbs = useMemo(
    () => getItemsForLevel(verbs, user?.level || "A1"),
    [user?.level]
  );

  const currentVerb = availableVerbs[currentIndex];
  if (!currentVerb) return null;

  const availableTenses = Object.keys(currentVerb.tenses);

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
    setCurrentIndex((prev) => (prev + 1) % availableVerbs.length);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg">
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">{t("verbs")}</h1>

        {/* Tense selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {availableTenses.map((tense) => (
            <button
              key={tense}
              onClick={() => { setSelectedTense(tense); setAnswers({}); setShowResults(false); }}
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

        {/* Verb card */}
        <div className="bg-card rounded-lg p-6 shadow-soft">
          <div className="text-center mb-4">
            <h2 className="text-xl font-heading font-bold text-foreground">{currentVerb.infinitive}</h2>
            <p className="text-muted-foreground text-sm">
              {language === "sv" ? currentVerb.sv : currentVerb.en}
            </p>
            {currentVerb.tenses[selectedTense]?.example && (
              <p className="text-sm mt-2 bg-background rounded-md px-3 py-2 italic text-muted-foreground truncate" title={`"${currentVerb.tenses[selectedTense].example.es}" — ${language === "sv" ? currentVerb.tenses[selectedTense].example.sv : currentVerb.tenses[selectedTense].example.en}`}>
                "{currentVerb.tenses[selectedTense].example.es}" — {language === "sv" ? currentVerb.tenses[selectedTense].example.sv : currentVerb.tenses[selectedTense].example.en}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {pronouns.map((pronoun, i) => {
              const key = pronounKeys[i];
              const tenseData = currentVerb.tenses[selectedTense];
              const correctAnswer = tenseData?.[key] || "";
              const userAnswer = answers[key] || "";
              const isCorrect = showResults && userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
              const isWrong = showResults && !isCorrect;

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
                    <span className="text-xs text-mint-dark font-medium min-w-[60px]">{correctAnswer}</span>
                  )}
                </div>
              );
            })}
          </div>

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
      </div>
    </AppLayout>
  );
};

export default VerbExercisePage;
