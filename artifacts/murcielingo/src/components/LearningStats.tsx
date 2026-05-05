import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useVocabularySRS, SRSWord } from "@/hooks/useVocabularySRS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Target, Award, Flame, AlertTriangle } from "lucide-react";

const LearningStats: React.FC = () => {
  const { language } = useLanguage();
  const { words } = useVocabulary();
  const { getStats, getWeakWords } = useVocabularySRS();
  const t = (sv: string, en: string) => (language === "sv" ? sv : en);

  const srsWords = words as SRSWord[];
  const stats = useMemo(() => getStats(srsWords), [srsWords, getStats]);
  const weakWords = useMemo(() => getWeakWords(srsWords, 5), [srsWords, getWeakWords]);

  if (words.length === 0) return null;

  const masteredPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t("Ordförrådsstatistik", "Vocabulary Stats")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: t("Totalt sparade", "Total saved"), value: stats.total, color: "text-foreground" },
            { icon: Award, label: t("Bemästrade", "Mastered"), value: stats.mastered, color: "text-primary" },
            { icon: Target, label: t("Träffsäkerhet", "Accuracy"), value: `${stats.accuracy}%`, color: "text-emerald-600" },
            { icon: Flame, label: t("Att repetera", "Due for review"), value: stats.dueCount, color: "text-amber-600" },
            { icon: AlertTriangle, label: t("Svåra ord", "Difficult words"), value: weakWords.length, color: "text-destructive" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color} flex-shrink-0`} />
              <div>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{t("Bemästringsgrad", "Mastery level")}</span>
            <span className="font-medium">{masteredPct}%</span>
          </div>
          <Progress value={masteredPct} className="h-1.5" />
        </div>

        {/* Review state distribution */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {stats.new > 0 && (
            <div className="bg-blue-400" style={{ width: `${(stats.new / stats.total) * 100}%` }} />
          )}
          {stats.learning > 0 && (
            <div className="bg-amber-400" style={{ width: `${(stats.learning / stats.total) * 100}%` }} />
          )}
          {stats.familiar > 0 && (
            <div className="bg-emerald-400" style={{ width: `${(stats.familiar / stats.total) * 100}%` }} />
          )}
          {stats.mastered > 0 && (
            <div className="bg-primary" style={{ width: `${(stats.mastered / stats.total) * 100}%` }} />
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />{t("Nya", "New")}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{t("Lär sig", "Learning")}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />{t("Bekanta", "Familiar")}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{t("Bemästrade", "Mastered")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningStats;
