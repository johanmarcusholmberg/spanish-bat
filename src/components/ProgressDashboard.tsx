import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";

export const ProgressOverview = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();

  const categories = [
    { key: "grammar", icon: "📚", label: t("grammarLessons"), data: progress.grammar },
    { key: "flashcards", icon: "🎴", label: t("flashcards"), data: progress.flashcards },
    { key: "reading", icon: "📖", label: t("reading"), data: progress.reading },
    { key: "sentences", icon: "🧩", label: t("sentenceBuilder"), data: progress.sentences },
    { key: "exercises", icon: "✍️", label: t("practice"), data: progress.exercises },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("progressOverview")}
            </CardTitle>
            <CardDescription>{t("trackYourLearning")}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{progress.overall}%</div>
            <div className="text-xs text-muted-foreground">{t("overallProgress")}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.label}
              </span>
              <span className="text-muted-foreground">
                {cat.data.completed}/{cat.data.total} • {cat.data.percentage}%
              </span>
            </div>
            <Progress value={cat.data.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const NextStepsCard = () => {
  const { t } = useLanguage();
  const { getNextRecommendation } = useProgress();
  const navigate = useNavigate();

  const recommendation = getNextRecommendation();

  if (!recommendation) return null;

  const getReasonText = (reason: string) => {
    switch (reason) {
      case "notStarted":
        return t("recommendationNotStarted");
      case "lowestProgress":
        return t("recommendationLowest");
      case "reviewContent":
        return t("recommendationReview");
      case "almostFinished":
        return t("recommendationAlmostFinished");
      default:
        return t("recommendationContinue");
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          {t("nextSteps")}
        </CardTitle>
        <CardDescription>{t("recommendedForYou")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="font-semibold text-lg">{t(recommendation.category)}</div>
            <p className="text-sm text-muted-foreground mt-1">{getReasonText(recommendation.reason)}</p>
          </div>
          <Button onClick={() => navigate(recommendation.path)} className="w-full group">
            {t("startNow")}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const LevelAdvancementCard = () => {
  const { t } = useLanguage();
  const { canAdvanceLevel, progress } = useProgress();
  const navigate = useNavigate();

  const canAdvance = canAdvanceLevel();

  return (
    <Card className={canAdvance ? "border-green-500/50 bg-green-50 dark:bg-green-950/20" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {canAdvance ? "🎉" : "🎯"}
          {t("levelAdvancement")}
        </CardTitle>
        <CardDescription>
          {canAdvance ? t("readyToAdvance") : t("keepLearning")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canAdvance ? (
          <div className="space-y-4">
            <p className="text-sm">{t("congratulationsAdvance")}</p>
            <Button onClick={() => navigate("/profile")} variant="default" className="w-full">
              {t("advanceToNextLevel")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("progressToAdvance")}</span>
              <span className="font-semibold">{progress.overall}%</span>
            </div>
            <Progress value={progress.overall} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{t("completeAllCategories")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
