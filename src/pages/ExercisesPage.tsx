import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import AppLayout from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Type, Palette, HelpCircle, GraduationCap, Layers, FileText, Puzzle } from "lucide-react";

const ExercisesPage = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();
  const navigate = useNavigate();

  const learnItems = [
    { key: "grammarLessons", progressKey: "grammar" as const, icon: GraduationCap, path: "/learn/grammar", color: "gradient-peach" },
    { key: "flashcards", progressKey: "flashcards" as const, icon: Layers, path: "/learn/flashcards", color: "gradient-mint" },
    { key: "reading", progressKey: "reading" as const, icon: FileText, path: "/learn/reading", color: "gradient-peach" },
    { key: "sentenceBuilder", progressKey: "sentences" as const, icon: Puzzle, path: "/learn/sentences", color: "gradient-mint" },
  ];

  const exercises = [
    { key: "verbs", icon: BookOpen, path: "/exercises/verbs", color: "gradient-peach" },
    { key: "nouns", icon: Type, path: "/exercises/nouns", color: "gradient-mint" },
    { key: "adjectives", icon: Palette, path: "/exercises/adjectives", color: "gradient-peach" },
    { key: "quiz", icon: HelpCircle, path: "/exercises/quiz", color: "gradient-mint" },
  ];

  const renderLearnGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {learnItems.map((item) => {
        const categoryProgress = progress[item.progressKey];
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className="bg-card rounded-lg p-6 shadow-soft hover:shadow-warm transition-all hover:-translate-y-1 text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center`}>
                <item.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {categoryProgress.completed}/{categoryProgress.total}
              </span>
            </div>
            <h3 className="font-heading font-bold text-foreground text-lg">{t(item.key)}</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-3">{t(item.key + "Desc")}</p>
            <div className="space-y-1">
              <Progress value={categoryProgress.percentage} className="h-2" />
              <span className="text-xs text-muted-foreground">{categoryProgress.percentage}% {t("complete")}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderExercisesGrid = () => {
    const exerciseProgress = progress.exercises;
    const perExercise = Math.floor(exerciseProgress.total / exercises.length);
    const completedPerExercise = Math.floor(exerciseProgress.completed / exercises.length);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercises.map((ex, index) => {
          // Distribute progress across exercises
          const thisCompleted = Math.min(perExercise, completedPerExercise + (index < exerciseProgress.completed % exercises.length ? 1 : 0));
          const thisPercentage = Math.round((thisCompleted / perExercise) * 100) || 0;
          
          return (
            <button
              key={ex.key}
              onClick={() => navigate(ex.path)}
              className="bg-card rounded-lg p-6 shadow-soft hover:shadow-warm transition-all hover:-translate-y-1 text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg ${ex.color} flex items-center justify-center`}>
                  <ex.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {thisCompleted}/{perExercise}
                </span>
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg">{t(ex.key)}</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-3">{t(ex.key + "Desc")}</p>
              <div className="space-y-1">
                <Progress value={thisPercentage} className="h-2" />
                <span className="text-xs text-muted-foreground">{thisPercentage}% {t("complete")}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("exercises")}</h1>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progress.overall}%</div>
            <div className="text-xs text-muted-foreground">{t("overallProgress")}</div>
          </div>
        </div>

        <h2 className="font-heading font-bold text-foreground text-lg mb-3 flex items-center gap-2">
          <GraduationCap className="h-5 w-5" /> {t("learn")}
        </h2>
        {renderLearnGrid()}

        <h2 className="font-heading font-bold text-foreground text-lg mb-3 mt-8 flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> {t("practice")}
        </h2>
        {renderExercisesGrid()}
      </div>
    </AppLayout>
  );
};

export default ExercisesPage;
