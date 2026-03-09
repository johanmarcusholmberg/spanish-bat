import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { nouns, getItemsForLevel } from "@/data/spanishData";
import { checkAnswer } from "@/lib/answerUtils";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";

const NounExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateProgress } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genderAnswer, setGenderAnswer] = useState<"el" | "la" | "">("");
  const [translationAnswer, setTranslationAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [completedNouns, setCompletedNouns] = useState(0);

  const availableNouns = useMemo(
    () => getItemsForLevel(nouns, user?.level || "A1"),
    [user?.level]
  );

  useEffect(() => {
    setCurrentIndex(0);
    setGenderAnswer("");
    setTranslationAnswer("");
    setShowResults(false);
  }, [user?.level]);

  const current = availableNouns[currentIndex];
  if (!current) return null;

  const word = language === "sv" ? current.sv : current.en;
  const genderCorrect = genderAnswer === current.gender;
  const translationCorrect = checkAnswer(translationAnswer, current.spanish);

  const handleCheck = () => setShowResults(true);

  const handleNext = () => {
    const newCompleted = completedNouns + 1;
    setCompletedNouns(newCompleted);
    updateProgress("exercises", newCompleted, availableNouns.length);
    setCurrentIndex((prev) => (prev + 1) % availableNouns.length);
    setGenderAnswer("");
    setTranslationAnswer("");
    setShowResults(false);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg">
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{t("nouns")}</h1>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">{t("translate")}</p>
            <h2 className="text-2xl font-heading font-bold text-foreground">{word}</h2>
          </div>

          {/* Gender selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === "sv" ? "Välj genus:" : "Choose gender:"}
            </label>
            <div className="flex gap-3">
              {(["el", "la"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => !showResults && setGenderAnswer(g)}
                  disabled={showResults}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition ${
                    showResults
                      ? g === current.gender
                        ? "gradient-mint text-secondary-foreground"
                        : genderAnswer === g
                        ? "bg-destructive/20 border border-destructive text-foreground"
                        : "bg-background border border-border text-muted-foreground"
                      : genderAnswer === g
                      ? "gradient-peach text-primary-foreground shadow-warm"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Translation */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">{t("yourAnswer")}</label>
            <input
              type="text"
              value={translationAnswer}
              onChange={(e) => setTranslationAnswer(e.target.value)}
              disabled={showResults}
              className={`w-full px-4 py-2.5 rounded-md border text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring ${
                showResults
                  ? translationCorrect
                    ? "border-mint-dark bg-mint/20"
                    : "border-destructive bg-destructive/10"
                  : "border-border bg-background"
              }`}
              placeholder={language === "sv" ? "Skriv på spanska..." : "Write in Spanish..."}
            />
            {showResults && !translationCorrect && (
              <p className="text-sm mt-1 text-mint-dark">{t("correctAnswer")}: {current.spanish}</p>
            )}
          </div>

          {/* Example */}
          {showResults && (
            <div className="bg-background rounded-md px-3 py-2 mb-4 text-sm italic text-muted-foreground">
              "{current.example.es}" — {language === "sv" ? current.example.sv : current.example.en}
            </div>
          )}

          <div className="flex gap-3">
            {!showResults ? (
              <button onClick={handleCheck} className="flex-1 py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition">
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

export default NounExercisePage;
