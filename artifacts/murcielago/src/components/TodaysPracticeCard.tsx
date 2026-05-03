import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  recommendPracticeMode,
  getPracticeModeMeta,
  countDueItems,
  type PracticeMode,
} from "@workspace/practice";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { Button } from "@/components/ui/button";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useDailySessionLimit } from "@/hooks/useDailySessionLimit";
import SoftPaywall from "@/components/SoftPaywall";
import {
  Sparkles,
  Target,
  GraduationCap,
  History,
  ClipboardCheck,
  Flame,
  Clock,
  Star,
  PlayCircle,
  CalendarCheck,
} from "lucide-react";

const MODE_ICONS: Record<PracticeMode, React.ElementType> = {
  quick: Sparkles,
  weak_spots: Target,
  level: GraduationCap,
  review_previous: History,
  test_prep: ClipboardCheck,
  challenge: Flame,
  due_review: CalendarCheck,
};

const TodaysPracticeCard: React.FC = () => {
  const { language, t } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();
  const { readiness, progress } = useProgress();
  const { stats: trackedStats, weakSpots, todaysFocus } = usePracticeStats();

  const stats = useMemo(() => {
    const skillAccuracy: Record<string, number> = {
      ...(trackedStats.skillAccuracy ?? {}),
    };
    const map: Record<string, "vocabulary" | "grammar" | "sentences" | "reading"> = {
      flashcards: "vocabulary",
      grammar: "grammar",
      sentences: "sentences",
      reading: "reading",
      exercises: "vocabulary",
    };
    for (const [k, v] of Object.entries(progress)) {
      const skill = map[k];
      if (!skill || skillAccuracy[skill] !== undefined) continue;
      const cat = v as { percentage?: number };
      if (typeof cat.percentage === "number") {
        skillAccuracy[skill] = Math.min(1, cat.percentage / 100);
      }
    }
    return { ...trackedStats, skillAccuracy };
  }, [progress, trackedStats]);

  const dueCount = useMemo(
    () => countDueItems(stats),
    [stats.itemSchedule, stats.itemStats],
  );

  const recommended = useMemo(
    () =>
      recommendPracticeMode({
        stats,
        weakSpots,
        readinessState: readiness?.state,
        dueCount,
      }),
    [stats, weakSpots, readiness?.state, dueCount],
  );

  const meta = getPracticeModeMeta(recommended.mode);
  const Icon = MODE_ICONS[recommended.mode];
  const showTestCta = readiness?.state === "test_recommended";
  const dueBadgeText = t("practiceDueBadge").replace("{n}", String(dueCount));
  const { isPremium } = useFeatureAccess();
  const dailyLimit = useDailySessionLimit();
  const dailyDone = !isPremium && !dailyLimit.canStart;

  if (dailyDone) {
    return (
      <SoftPaywall
        context="daily_session_done"
        onSecondary={() => navigate("/practice/flashcards")}
      />
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl gradient-peach flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              {t("practiceTodaysLabel")}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-primary/15 text-primary px-2 py-0.5 rounded-full">
              <Star className="h-2.5 w-2.5" />
              {t("practiceRecommended")}
            </span>
            {dueCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full">
                <CalendarCheck className="h-2.5 w-2.5" />
                {dueBadgeText}
              </span>
            )}
          </div>
          <h3 className="font-heading font-bold text-lg leading-snug">
            {t(`practiceMode_${meta.mode}_title`)}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {recommended.reason[lang]}
          </p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            {todaysFocus[lang]}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />~{meta.estimatedMinutes} min
            </span>
            <span>· ~{meta.defaultSize} {t("practiceQuestions")}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/practice/session?mode=${recommended.mode}`)}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              {t("practiceContinue")}
            </Button>
            {showTestCta && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/level-check")}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                {t("practiceReadyForLevelCheck")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysPracticeCard;
