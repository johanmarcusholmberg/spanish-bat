import React, { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useStreak } from "@/contexts/StreakContext";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useVocabularySRS, SRSWord } from "@/hooks/useVocabularySRS";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart3, Target, Flame, TrendingUp, Trophy, Calendar,
  BookOpen, AlertTriangle, ChevronRight, Info
} from "lucide-react";

type CategoryKey = "grammar" | "flashcards" | "reading" | "sentences" | "exercises";

const StatsPage = () => {
  const { t, language } = useLanguage();
  const { progress } = useProgress();
  const { streak, getWeekActivity, getTotalExercises } = useStreak();
  const { user } = useAuth();
  const { words } = useVocabulary();
  const { getStats, getWeakWords } = useVocabularySRS();

  const sv = (s: string, e: string) => (language === "sv" ? s : e);

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const srsWords = words as unknown as SRSWord[];
  const vocabStats = useMemo(() => getStats(srsWords), [srsWords, getStats]);
  const weakWords = useMemo(() => getWeakWords(srsWords, 5), [srsWords, getWeakWords]);

  const weekData = getWeekActivity();
  const totalExercises = getTotalExercises();

  const activeDays = useMemo(() => Object.keys(streak.activityLog).length, [streak.activityLog]);

  const categories: { key: CategoryKey; label: string; color: string }[] = useMemo(() => [
    { key: "grammar", label: t("grammarLessons"), color: "hsl(var(--primary))" },
    { key: "flashcards", label: t("flashcards"), color: "hsl(14, 80%, 68%)" },
    { key: "reading", label: t("reading"), color: "hsl(131, 8%, 70%)" },
    { key: "sentences", label: t("sentenceBuilder"), color: "hsl(131, 12%, 60%)" },
    { key: "exercises", label: t("practice"), color: "hsl(14, 91%, 78%)" },
  ], [t]);

  const overallAccuracy = vocabStats.accuracy;

  // Weak areas detection
  const weakAreas = useMemo(() => {
    const areas: string[] = [];
    const sorted = categories
      .map(c => ({ ...c, pct: progress[c.key].percentage }))
      .sort((a, b) => a.pct - b.pct);

    sorted.slice(0, 2).forEach(c => {
      if (c.pct < 50) areas.push(c.label);
    });

    if (weakWords.length > 0) {
      areas.push(sv("Svåra glosor", "Difficult vocabulary"));
    }

    return areas;
  }, [categories, progress, weakWords, sv]);

  const selectedCat = selectedCategory
    ? { ...progress[selectedCategory], label: categories.find(c => c.key === selectedCategory)?.label || "" }
    : null;

  const maxWeekCount = Math.max(1, ...weekData.map(d => d.count));

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          {t("statistics")}
        </h1>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: Flame,
              value: streak.currentStreak,
              label: sv("Dagar i rad", "Current streak"),
              tip: sv("Antal dagar i rad du har gjort minst en övning", "Number of consecutive days you completed at least one exercise"),
            },
            {
              icon: Trophy,
              value: streak.longestStreak,
              label: sv("Längsta streak", "Longest streak"),
              tip: sv("Din längsta streak någonsin", "Your all-time longest streak"),
            },
            {
              icon: TrendingUp,
              value: totalExercises,
              label: sv("Totalt genomförda", "Total completed"),
              tip: sv("Totalt antal genomförda övningar", "Total number of exercises completed"),
            },
            {
              icon: Calendar,
              value: activeDays,
              label: sv("Aktiva dagar", "Active days"),
              tip: sv("Dagar där du genomfört minst en övning", "Days where you completed at least one exercise"),
            },
          ].map((s, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-default">
                    <CardContent className="p-4 text-center">
                      <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                      <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        {s.label}
                        <Info className="h-3 w-3 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">{s.tip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Accuracy + Vocabulary row */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{overallAccuracy}%</div>
              <div className="text-xs text-muted-foreground">{sv("Träffsäkerhet", "Accuracy")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{words.length}</div>
              <div className="text-xs text-muted-foreground">{sv("Sparade ord", "Saved words")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly activity - custom bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("weeklyActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekData.map((day) => {
                const height = day.count > 0 ? Math.max(15, (day.count / maxWeekCount) * 100) : 6;
                return (
                  <TooltipProvider key={day.date}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 flex flex-col items-center gap-1.5 cursor-default">
                          <div
                            className={`w-full rounded-t-md transition-all ${
                              day.isFuture
                                ? "bg-muted/40 border border-dashed border-border"
                                : day.count > 0
                                  ? "bg-primary"
                                  : "bg-muted"
                            } ${day.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                            style={{ height: `${height}%` }}
                          />
                          <span className={`text-[11px] leading-none ${
                            day.isToday ? "font-bold text-primary" : day.isFuture ? "text-muted-foreground/50" : "text-muted-foreground"
                          }`}>
                            {day.dayLabel}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">{day.count} {sv("övningar", "exercises")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown - clickable */}
        <Card>
          <CardHeader>
            <CardTitle>{t("categoryBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => {
              const p = progress[cat.key];
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.key)}
                  className={`w-full text-left rounded-lg p-3 transition-colors ${
                    isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      {cat.label}
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {p.percentage}% · {p.completed}/{p.total}
                    </span>
                  </div>
                  <Progress value={p.percentage} className="h-1.5" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Detailed drill-down */}
        {selectedCat && selectedCategory && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-base">
                {categories.find(c => c.key === selectedCategory)?.label} — {sv("Detaljer", "Details")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{selectedCat.completed}</div>
                  <div className="text-[11px] text-muted-foreground">{sv("Genomförda", "Completed")}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{selectedCat.percentage}%</div>
                  <div className="text-[11px] text-muted-foreground">{sv("Framsteg", "Progress")}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{selectedCat.total}</div>
                  <div className="text-[11px] text-muted-foreground">{sv("Totalt krävda", "Total required")}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">
                    {Math.max(0, selectedCat.total - selectedCat.completed)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{sv("Kvar", "Remaining")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vocabulary growth */}
        {words.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-primary" />
                {sv("Ordförråd", "Vocabulary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{vocabStats.mastered}</div>
                  <div className="text-[11px] text-muted-foreground">{sv("Bemästrade", "Mastered")}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{vocabStats.learning + vocabStats.familiar}</div>
                  <div className="text-[11px] text-muted-foreground">{sv("Lär sig", "Learning")}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{vocabStats.dueCount}</div>
                  <div className="text-[11px] text-muted-foreground">{sv("Att repetera", "Due")}</div>
                </div>
              </div>
              {/* Mastery bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{sv("Bemästringsgrad", "Mastery")}</span>
                  <span className="font-medium">
                    {vocabStats.total > 0 ? Math.round((vocabStats.mastered / vocabStats.total) * 100) : 0}%
                  </span>
                </div>
                <Progress value={vocabStats.total > 0 ? (vocabStats.mastered / vocabStats.total) * 100 : 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weak areas */}
        {weakAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {sv("Behöver mer övning", "Needs more practice")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {weakAreas.map((area, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
              {weakWords.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">{sv("Svåraste orden", "Hardest words")}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {weakWords.map(w => (
                      <span key={w.id} className="text-xs bg-destructive/10 text-destructive rounded-md px-2 py-0.5">
                        {w.spanish}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Overall progress */}
        <Card>
          <CardHeader>
            <CardTitle>{sv("Totalt framsteg", "Overall Progress")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{user?.level || "A1"}</span>
              <span className="font-medium">{progress.overall}%</span>
            </div>
            <Progress value={progress.overall} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StatsPage;
