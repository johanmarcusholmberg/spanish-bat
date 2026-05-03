import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStreak } from "@/contexts/StreakContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Zap, CalendarDays, Check, Sparkles } from "lucide-react";

/** Streak milestones that feel meaningful to a learner. */
const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

function nextMilestone(streak: number): number | null {
  for (const m of MILESTONES) {
    if (m > streak && m - streak <= 3) return m;
  }
  return null;
}

export const StreakCard = () => {
  const { t, language } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const { streak, getWeekActivity, getWeekNumber } = useStreak();
  const weekData = getWeekActivity();
  const weekNum = getWeekNumber();
  const maxCount = Math.max(1, ...weekData.map((d) => d.count));

  const weekLabel = lang === "sv" ? `Vecka ${weekNum}` : `Week ${weekNum}`;
  const today = weekData.find((d) => d.isToday);
  const practicedToday = (today?.count ?? 0) > 0;
  const weekTotal = weekData.reduce((sum, d) => sum + (d.isFuture ? 0 : d.count), 0);
  const milestone = nextMilestone(streak.currentStreak);
  const milestoneRemaining = milestone ? milestone - streak.currentStreak : 0;

  return (
    <Card data-testid="streak-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            {t("streakTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Today-status pill — answers "what does today look like?" at a glance. */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${
                practicedToday
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-amber-500/15 text-amber-700"
              }`}
              data-testid="streak-today-status"
            >
              {practicedToday ? <Check className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
              {practicedToday
                ? lang === "sv" ? "Övat idag" : "Practiced today"
                : lang === "sv" ? "Inte än idag" : "Not yet today"}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {weekLabel}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-background rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{streak.currentStreak}</div>
            <div className="text-xs text-muted-foreground">{t("currentStreak")}</div>
          </div>
          <div className="text-center bg-background rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{streak.longestStreak}</div>
            <div className="text-xs text-muted-foreground">{t("longestStreak")}</div>
          </div>
          {/* Replaced "Total exercises" with "This week" — directly visualised by
              the chart below, so the eye gets a number + a shape together. */}
          <div className="text-center bg-background rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{weekTotal}</div>
            <div className="text-xs text-muted-foreground">
              {lang === "sv" ? "Denna vecka" : "This week"}
            </div>
          </div>
        </div>

        {/* Milestone / empty-state hint — keeps the card warm. */}
        {streak.currentStreak === 0 ? (
          <p className="text-xs text-muted-foreground mb-4 text-center">
            {lang === "sv"
              ? "Starta en kort session för att tända din första dag."
              : "Start a short session to light your first day."}
          </p>
        ) : milestone ? (
          <p
            className="text-xs text-primary font-medium mb-4 text-center inline-flex items-center justify-center gap-1.5 w-full"
            data-testid="streak-milestone-hint"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {lang === "sv"
              ? `${milestoneRemaining} ${milestoneRemaining === 1 ? "dag" : "dagar"} till ${milestone}-dagars-streak!`
              : `${milestoneRemaining} ${milestoneRemaining === 1 ? "day" : "days"} to a ${milestone}-day streak!`}
          </p>
        ) : null}

        {/* Mon–Sun week bar chart */}
        <div className="flex items-end justify-between gap-1.5 h-20">
          {weekData.map((day) => {
            const practiced = day.count > 0;
            const height = practiced ? Math.max(25, (day.count / maxCount) * 100) : 10;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                {/* Check mark for practiced days */}
                {practiced && !day.isFuture && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all ${
                    day.isFuture
                      ? "bg-muted/40 border border-dashed border-border"
                      : practiced
                        ? "gradient-peach shadow-sm"
                        : "bg-muted"
                  } ${day.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.count} ${lang === "sv" ? "övningar" : "exercises"}`}
                />

                {/* Day label */}
                <span
                  className={`text-[10px] leading-none ${
                    day.isToday
                      ? "font-bold text-primary"
                      : day.isFuture
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground"
                  }`}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
