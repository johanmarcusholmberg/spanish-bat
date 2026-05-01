import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStreak } from "@/contexts/StreakContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Zap, CalendarDays, Check } from "lucide-react";

export const StreakCard = () => {
  const { t, language } = useLanguage();
  const { streak, getWeekActivity, getWeekNumber, getTotalExercises } = useStreak();
  const weekData = getWeekActivity();
  const weekNum = getWeekNumber();
  const maxCount = Math.max(1, ...weekData.map((d) => d.count));

  const weekLabel = language === "sv" ? `Vecka ${weekNum}` : `Week ${weekNum}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            {t("streakTitle")}
          </CardTitle>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {weekLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
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
          <div className="text-center bg-background rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{getTotalExercises()}</div>
            <div className="text-xs text-muted-foreground">{t("totalExercises")}</div>
          </div>
        </div>

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
                  title={`${day.date}: ${day.count} ${language === "sv" ? "övningar" : "exercises"}`}
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
