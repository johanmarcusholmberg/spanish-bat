import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowRight, Star, TrendingUp, Play, Sparkles, Target } from "lucide-react";
import { getNextLevel, type SkillCategory } from "@workspace/readiness";

const interp = (str: string, vars: Record<string, string>) =>
  str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

const CATEGORY_KEY: Record<SkillCategory, string> = {
  vocabulary: "catVocabulary",
  grammar: "catGrammar",
  sentences: "catSentences",
  reading: "catReading",
  listening: "catListening",
  speaking: "catSpeaking",
};

const CATEGORY_PATH: Record<SkillCategory, string> = {
  vocabulary: "/learn/flashcards",
  grammar: "/learn/grammar",
  sentences: "/learn/sentences",
  reading: "/learn/reading",
  listening: "/exercises",
  speaking: "/conversation",
};

const CATEGORY_ICON: Record<SkillCategory, string> = {
  vocabulary: "🎴",
  grammar: "📚",
  sentences: "🧩",
  reading: "📖",
  listening: "🎧",
  speaking: "🗣️",
};

/**
 * Phase 12: Readiness-based progress overview.
 * Replaces the old "X of Y exercises completed" framing with a soft
 * "Level readiness" score and per-skill contribution bars.
 */
export const ProgressOverview = () => {
  const { t } = useLanguage();
  const { readiness } = useProgress();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {interp(t("readinessFor"), { level: readiness.level })}
            </CardTitle>
            <CardDescription className="mt-0.5">{t("readinessDescription")}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary leading-none tabular-nums">{readiness.score}%</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {readiness.state === "learning" ? t("buildingConfidence") : null}
              {readiness.state === "test_recommended"
                ? interp(t("nearlyReady"), { next: getNextLevel(readiness.level) ?? readiness.level })
                : null}
              {readiness.state === "passed_but_can_continue" ? t("readyToAdvance") : null}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5">
        <Progress value={readiness.score} className="h-2" />
        <div className="space-y-2.5 pt-1">
          {readiness.breakdown.map((b) => (
            <div key={b.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <span className="text-base">{CATEGORY_ICON[b.category]}</span>
                  {t(CATEGORY_KEY[b.category])}
                </span>
                <span className="text-muted-foreground tabular-nums text-xs">{b.percentage}%</span>
              </div>
              <Progress value={b.percentage} className="h-1.5" />
            </div>
          ))}
        </div>
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
  const { getNextRecommendation, readiness } = useProgress();
  const navigate = useNavigate();

  const recommendation = getNextRecommendation();

  // If user has weak spots, surface the first one as a "practice weak spot" CTA.
  const weakSpot = readiness.weakSpots[0];

  if (!recommendation && !weakSpot) return null;

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
          {recommendation && (
            <>
              <div>
                <div className="font-semibold">{t(recommendation.category)}</div>
                <p className="text-sm text-muted-foreground mt-1">{getReasonText(recommendation.reason)}</p>
              </div>
              <Button onClick={() => navigate(recommendation.path)} className="w-full group" size="sm">
                {t("startNow")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </>
          )}
          {weakSpot && (
            <div className="pt-2 border-t border-border/40">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                {t("weakSpotsLabel")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(CATEGORY_PATH[weakSpot])}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  {t("practiceWeakSpots")}: {t(CATEGORY_KEY[weakSpot])}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Phase 12: Level state card.
 *
 * Three states, never forces advancement:
 *   - learning              → "Keep practicing"
 *   - test_recommended      → "Take level check" / "Keep practicing" / "Practice weak spots"
 *   - passed_but_can_continue → "Move to next level" / "Continue current level" / "Mix"
 */
export const LevelAdvancementCard = () => {
  const { t, language } = useLanguage();
  const { readiness } = useProgress();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const currentLevel = (user?.level || "A1") as Level;
  const nextLevel = getNextLevel(currentLevel);

  const handleAdvance = async () => {
    if (!nextLevel) return;
    setAdvancing(true);
    try {
      await updateProfile({ level: nextLevel });
    } catch {
      // Optimistic update already applied
    }
    setAdvancing(false);
    setShowConfirm(false);
  };

  const levelName = (lvl: Level) => t(`level${lvl}`);

  // Build the localized status message.
  const statusMessage = (() => {
    if (readiness.state === "passed_but_can_continue") {
      if (!nextLevel) return t("msgPassedTopLevel");
      return interp(t("msgPassedCanContinue"), { current: currentLevel, next: nextLevel });
    }
    if (readiness.state === "test_recommended") {
      return interp(t("msgTestRecommended"), { current: currentLevel, next: nextLevel ?? currentLevel });
    }
    return t("msgKeepPracticing");
  })();

  const cardClass =
    readiness.state === "test_recommended"
      ? "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20"
      : readiness.state === "passed_but_can_continue"
        ? "border-green-500/40 bg-green-50/50 dark:bg-green-950/20"
        : "";

  return (
    <>
      <Card className={cardClass}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {levelName(currentLevel)}
          </CardTitle>
          <CardDescription>{statusMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {readiness.state === "learning" && (
              <Button
                variant="outline"
                className="w-full justify-between"
                size="sm"
                onClick={() => navigate("/exercises")}
              >
                {t("keepPracticingThisLevel")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {readiness.state === "test_recommended" && (
              <>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    // Navigate to the structured level check. The pass flag
                    // is only set after the test reports a successful result
                    // via `markLevelCheckPassed()` from ProgressContext —
                    // never on the click itself, so users who decline or
                    // fail are not prematurely marked as passed.
                    navigate("/level-check");
                  }}
                >
                  {t("takeLevelCheck")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => navigate("/exercises")}
                >
                  {t("keepPracticingThisLevel")}
                </Button>
                {readiness.weakSpots[0] && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    size="sm"
                    onClick={() => navigate(CATEGORY_PATH[readiness.weakSpots[0]])}
                  >
                    {t("practiceWeakSpots")}
                  </Button>
                )}
              </>
            )}

            {readiness.state === "passed_but_can_continue" && (
              <>
                {nextLevel ? (
                  <>
                    <Button className="w-full" size="sm" onClick={() => setShowConfirm(true)}>
                      {t("moveToNextLevel")}: {levelName(nextLevel)}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate("/exercises")}
                    >
                      {t("continueCurrentLevel")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      size="sm"
                      onClick={() => navigate("/exercises")}
                    >
                      {t("mixCurrentAndNext")}
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    {t("maxLevelReached")}
                  </div>
                )}
              </>
            )}
          </div>
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
              {advancing ? "..." : t("moveToNextLevel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
