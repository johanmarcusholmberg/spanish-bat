import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Target, Flame, TrendingUp } from "lucide-react";

const StatsPage = () => {
  const { t, language } = useLanguage();
  const { progress } = useProgress();
  const { streak, getActivityForWeek, getTotalExercises } = useStreak();
  const { user } = useAuth();

  const categoryData = useMemo(() => [
    { name: t("grammarLessons"), value: progress.grammar.percentage, color: "hsl(14, 91%, 78%)" },
    { name: t("flashcards"), value: progress.flashcards.percentage, color: "hsl(14, 80%, 68%)" },
    { name: t("reading"), value: progress.reading.percentage, color: "hsl(131, 8%, 70%)" },
    { name: t("sentenceBuilder"), value: progress.sentences.percentage, color: "hsl(131, 12%, 60%)" },
    { name: t("practice"), value: progress.exercises.percentage, color: "hsl(14, 91%, 78%)" },
  ], [progress, t]);

  const weekData = getActivityForWeek();

  const activeDays = useMemo(() => {
    return Object.keys(streak.activityLog).length;
  }, [streak.activityLog]);

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          {t("statistics")}
        </h1>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{streak.currentStreak}</div>
              <div className="text-xs text-muted-foreground">{t("currentStreak")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{progress.overall}%</div>
              <div className="text-xs text-muted-foreground">{t("overallProgress")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{getTotalExercises()}</div>
              <div className="text-xs text-muted-foreground">{t("totalExercises")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{activeDays}</div>
              <div className="text-xs text-muted-foreground">{t("activeDays")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly activity chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("weeklyActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <XAxis dataKey="dayLabel" tick={{ fontSize: 12 }} stroke="hsl(20, 10%, 45%)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(20, 10%, 45%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(42, 30%, 92%)",
                    border: "1px solid hsl(42, 20%, 75%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} ${t("exercisesUnit")}`, t("activity")]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? "hsl(14, 91%, 78%)" : "hsl(42, 20%, 80%)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t("categoryBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(20, 10%, 45%)" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="hsl(20, 10%, 45%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(42, 30%, 92%)",
                    border: "1px solid hsl(42, 20%, 75%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, t("progressLabel")]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed progress */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detailedProgress")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.value}%</span>
                </div>
                <Progress value={cat.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StatsPage;
