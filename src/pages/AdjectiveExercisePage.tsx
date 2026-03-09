import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { adjectives, getItemsForLevel } from "@/data/spanishData";
import { checkAnswer } from "@/lib/answerUtils";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";

const AdjectiveExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateProgress } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masculineAnswer, setMasculineAnswer] = useState("");
  const [feminineAnswer, setFeminineAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [completedAdj, setCompletedAdj] = useState(0);

  const available = useMemo(
    () => getItemsForLevel(adjectives, user?.level || "A1"),
    [user?.level]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setMasculineAnswer("");
    setFeminineAnswer("");
    setShowResults(false);
  }, [user?.level]);

  const current = available[currentIndex];
  if (!current) return null;

  const word = language === "sv" ? current.sv : current.en;
  const mascCorrect = checkAnswer(masculineAnswer, current.masculine);
  const femCorrect = checkAnswer(feminineAnswer, current.feminine);

  const handleNext = () => {
    const newCompleted = completedAdj + 1;
    setCompletedAdj(newCompleted);
    updateProgress("exercises", newCompleted, available.length);
    setCurrentIndex((prev) => (prev + 1) % available.length);
    setMasculineAnswer("");
    setFeminineAnswer("");
    setShowResults(false);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg">
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{t("adjectives")}</h1>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">{t("translate")}</p>
            <h2 className="text-2xl font-heading font-bold text-foreground">{word}</h2>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {language === "sv" ? "Maskulin form:" : "Masculine form:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={masculineAnswer}
                  onChange={(e) => setMasculineAnswer(e.target.value)}
                  disabled={showResults}
                  className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                    showResults
                      ? mascCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                  placeholder="..."
                />
                {showResults && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {mascCorrect ? <Check className="h-4 w-4 text-mint-dark" /> : <X className="h-4 w-4 text-destructive" />}
                  </span>
                )}
              </div>
              {showResults && !mascCorrect && (
                <p className="text-sm mt-1 text-mint-dark">{t("correctAnswer")}: {current.masculine}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {language === "sv" ? "Feminin form:" : "Feminine form:"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={feminineAnswer}
                  onChange={(e) => setFeminineAnswer(e.target.value)}
                  disabled={showResults}
                  className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                    showResults
                      ? femCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                  placeholder="..."
                />
                {showResults && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {femCorrect ? <Check className="h-4 w-4 text-mint-dark" /> : <X className="h-4 w-4 text-destructive" />}
                  </span>
                )}
              </div>
              {showResults && !femCorrect && (
                <p className="text-sm mt-1 text-mint-dark">{t("correctAnswer")}: {current.feminine}</p>
              )}
            </div>
          </div>

          {showResults && (
            <div className="bg-background rounded-md px-3 py-2 mb-4 text-sm italic text-muted-foreground">
              "{current.example.es}" — {language === "sv" ? current.example.sv : current.example.en}
            </div>
          )}

          <div className="flex gap-3">
            {!showResults ? (
              <button onClick={() => setShowResults(true)} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition">
                {t("checkAnswer")}
              </button>
            ) : (
              <button onClick={handleNext} className="flex-1 py-2.5 rounded-md gradient-mint text-secondary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> {t("nextQuestion")}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdjectiveExercisePage;
