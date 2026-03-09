import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStreak } from "@/contexts/StreakContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Zap } from "lucide-react";

export const StreakCard = () => {
  const { t } = useLanguage();
  const { streak, getActivityForWeek, getTotalExercises } = useStreak();
  const weekData = getActivityForWeek();
  const maxCount = Math.max(1, ...weekData.map((d) => d.count));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          {t("streakTitle")}
        </CardTitle>
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
          <div className="text-center bg-background rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">{getTotalExercises()}</div>
            <div className="text-xs text-muted-foreground">{t("totalExercises")}</div>
          </div>
        </div>

        {/* Weekly activity bar chart */}
        <div className="flex items-end justify-between gap-1 h-16">
          {weekData.map((day) => {
            const height = day.count > 0 ? Math.max(20, (day.count / maxCount) * 100) : 8;
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    day.count > 0 ? "gradient-peach" : "bg-muted"
                  } ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                  style={{ height: `${height}%` }}
                />
                <span className={`text-[10px] ${isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
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
