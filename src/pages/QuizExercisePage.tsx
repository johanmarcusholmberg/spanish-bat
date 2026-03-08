import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { quizItems, getItemsForLevel } from "@/data/spanishData";
import { checkAnswer } from "@/lib/answerUtils";
import { ArrowLeft, Check, X, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["greetings", "dailyPhrases", "atTheStore", "atTheRestaurant", "vocabulary"];

const QuizExercisePage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("greetings");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const available = useMemo(() => {
    const levelFiltered = getItemsForLevel(quizItems, user?.level || "A1");
    return levelFiltered.filter((q) => q.category === selectedCategory);
  }, [user?.level, selectedCategory]);

  const current = available[currentIndex % Math.max(available.length, 1)];

  const isCorrect = current && checkAnswer(answer, current.answer);

  const handleCheck = () => {
    setShowResult(true);
    setTotalAnswered((p) => p + 1);
    if (isCorrect) setTotalScore((p) => p + 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % available.length);
    setAnswer("");
    setShowResult(false);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setAnswer("");
    setShowResult(false);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg">
        <button onClick={() => navigate("/exercises")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("exercises")}
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("quiz")}</h1>
          {totalAnswered > 0 && (
            <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
              {t("score")}: {totalScore}/{totalAnswered}
            </span>
          )}
        </div>

        {/* Category selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? "gradient-peach text-primary-foreground shadow-warm"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>

        {current ? (
          <div className="bg-card rounded-lg p-6 shadow-soft">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">{t("translate")}</p>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {language === "sv" ? current.question.sv : current.question.en}
              </h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">{t("yourAnswer")}</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={showResult}
                onKeyDown={(e) => e.key === "Enter" && !showResult && handleCheck()}
                className={`w-full px-4 py-2.5 rounded-md border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
                  showResult
                    ? isCorrect ? "border-mint-dark bg-mint/20" : "border-destructive bg-destructive/10"
                    : "border-border bg-background"
                }`}
                placeholder={language === "sv" ? "Skriv på spanska..." : "Write in Spanish..."}
              />
              {showResult && !isCorrect && (
                <p className="text-sm mt-1 text-mint-dark">{t("correctAnswer")}: {current.answer}</p>
              )}
              {showResult && isCorrect && (
                <p className="text-sm mt-1 text-mint-dark font-medium">{t("correct")} 🎉</p>
              )}
            </div>

            <div className="flex gap-3">
              {!showResult ? (
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
        ) : (
          <div className="bg-card rounded-lg p-6 shadow-soft text-center">
            <p className="text-muted-foreground">
              {language === "sv" ? "Inga frågor tillgängliga för denna kategori och nivå." : "No questions available for this category and level."}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QuizExercisePage;
