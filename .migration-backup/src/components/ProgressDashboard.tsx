import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowRight, Star, TrendingUp, Play, ChevronUp, Sparkles } from "lucide-react";

const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const getNextLevel = (current: Level): Level | null => {
  const idx = LEVEL_ORDER.indexOf(current);
  return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
};

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
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("progressOverview")}
            </CardTitle>
            <CardDescription className="mt-0.5">{t("trackYourLearning")}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary leading-none">{progress.overall}%</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{t("overallProgress")}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                {cat.label}
              </span>
              <span className="text-muted-foreground tabular-nums text-xs">
                {cat.data.completed}/{cat.data.total} · {cat.data.percentage}%
              </span>
            </div>
            <Progress value={cat.data.percentage} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const ContinueCard = () => {
  const { t } = useLanguage();
  const { lastActivity } = useProgress();
  const navigate = useNavigate();

  if (!lastActivity) return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 shadow-sm">
      <CardContent className="flex items-center gap-4 py-4 px-5">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
          <Play className="h-5 w-5 text-primary fill-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">
            {t("continueWhereYouLeftOff")}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {lastActivity.exercise_label}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate(lastActivity.exercise_path)}
          className="flex-shrink-0 gap-1.5 text-xs h-8 px-3"
        >
          {t("continueButton")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" />
          {t("nextSteps")}
        </CardTitle>
        <CardDescription>{t("recommendedForYou")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="font-semibold">{t(recommendation.category)}</div>
            <p className="text-sm text-muted-foreground mt-1">{getReasonText(recommendation.reason)}</p>
          </div>
          <Button onClick={() => navigate(recommendation.path)} className="w-full group" size="sm">
            {t("startNow")}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const LevelAdvancementCard = () => {
  const { t, language } = useLanguage();
  const { canAdvanceLevel, progress } = useProgress();
  const { user, updateProfile } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const canAdvance = canAdvanceLevel();
  const currentLevel = (user?.level || "A1") as Level;
  const nextLevel = getNextLevel(currentLevel);

  const handleAdvance = async () => {
    if (!nextLevel) return;
    setAdvancing(true);
    await updateProfile({ level: nextLevel });
    setAdvancing(false);
    setShowConfirm(false);
  };

  const levelName = (lvl: Level) => t(`level${lvl}`);

  return (
    <>
      <Card className={canAdvance ? "border-green-500/40 bg-green-50/50 dark:bg-green-950/20" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChevronUp className="h-5 w-5 text-primary" />
            {t("levelAdvancement")}
          </CardTitle>
          <CardDescription>
            {canAdvance ? t("readyToAdvance") : t("keepLearning")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canAdvance && nextLevel ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span>{t("congratulationsAdvance")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{levelName(currentLevel)}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-semibold text-primary">{levelName(nextLevel)}</span>
              </div>
              <Button onClick={() => setShowConfirm(true)} className="w-full" size="sm">
                {t("advanceToNextLevel")}
              </Button>
            </div>
          ) : !nextLevel ? (
            <div className="text-center py-2">
              <div className="text-sm font-medium text-muted-foreground">{t("maxLevelReached")}</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("progressToAdvance")}</span>
                <span className="font-semibold tabular-nums">{progress.overall}%</span>
              </div>
              <Progress value={progress.overall} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{t("completeAllCategories")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmLevelUp")}</DialogTitle>
            <DialogDescription>
              {language === "sv"
                ? `Du kommer att gå från ${levelName(currentLevel)} till ${nextLevel ? levelName(nextLevel) : ""}. Du kan fortfarande öva på ${levelName(currentLevel)} efteråt.`
                : `You will move from ${levelName(currentLevel)} to ${nextLevel ? levelName(nextLevel) : ""}. You can still practice ${levelName(currentLevel)} afterwards.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirm(false)} size="sm">
              {t("stayCurrentLevel")}
            </Button>
            <Button onClick={handleAdvance} disabled={advancing} size="sm">
              {advancing ? "..." : t("advanceToNextLevel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
