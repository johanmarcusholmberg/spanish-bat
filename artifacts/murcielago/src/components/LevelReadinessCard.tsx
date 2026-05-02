import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth, type Level } from "@/contexts/AuthContext";
import { getNextLevel } from "@workspace/readiness";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Sparkles, ArrowRight, Check } from "lucide-react";

/**
 * Level Readiness — a warm, never-pushy card that tells the learner where
 * they stand and gives them a real choice between taking the level check
 * and continuing to practice. It is intentionally separate from the
 * older "LevelAdvancementCard" so we can iterate on the Today framing
 * without disturbing the dashboard's legacy components.
 *
 * Three states (matches @workspace/readiness):
 *   - learning             → "Keep practicing" only
 *   - test_recommended     → "Take the level check" + "Keep practicing"
 *   - passed_but_can_continue → "Move up" + "Stay & polish"
 *
 * The user can always decline a level check.
 */
const LevelReadinessCard: React.FC = () => {
  const { t, language } = useLanguage();
  const lang = language === "sv" ? "sv" : "en";
  const { readiness } = useProgress();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [advancing, setAdvancing] = useState(false);

  const currentLevel = (user?.level || "A1") as Level;
  const nextLevel = getNextLevel(currentLevel);

  const strengths = readiness.breakdown
    .filter((b) => b.percentage >= 70)
    .slice(0, 3);
  const stillBuilding = readiness.breakdown
    .filter((b) => b.percentage < 60)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 2);

  const skillLabel = (key: string) =>
    t(
      key === "vocabulary"
        ? "catVocabulary"
        : key === "grammar"
          ? "catGrammar"
          : key === "sentences"
            ? "catSentences"
            : key === "reading"
              ? "catReading"
              : key === "listening"
                ? "catListening"
                : key === "speaking"
                  ? "catSpeaking"
                  : key,
    );

  const handleAdvance = async () => {
    if (!nextLevel) return;
    setAdvancing(true);
    try {
      await updateProfile({ level: nextLevel });
    } catch {
      /* optimistic */
    }
    setAdvancing(false);
  };

  const tone =
    readiness.state === "test_recommended"
      ? "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20"
      : readiness.state === "passed_but_can_continue"
        ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20"
        : "";

  const headline = (() => {
    if (readiness.state === "test_recommended")
      return lang === "sv"
        ? "Du ser redo ut för en nivåkoll"
        : "You look ready for a level check";
    if (readiness.state === "passed_but_can_continue")
      return lang === "sv"
        ? "Din spanska är starkare nu"
        : "Your Spanish is getting stronger";
    return lang === "sv" ? "Vi bygger vidare" : "We're still building";
  })();

  const subline = (() => {
    if (readiness.state === "test_recommended")
      return lang === "sv"
        ? "Ingen brådska — du kan fortsätta öva och göra kollen när du vill."
        : "No rush — you can keep practicing and take the check whenever you're ready.";
    if (readiness.state === "passed_but_can_continue")
      return lang === "sv"
        ? `Du klarade ${currentLevel}. Du kan gå vidare eller fortsätta finslipa.`
        : `You passed ${currentLevel}. Move up, or keep polishing — both are fine.`;
    return lang === "sv"
      ? "Fortsätt öva i lugn takt. Murci säger till när du är nära en kollkoll."
      : "Keep practicing at your own pace. Murci will tell you when a level check is close.";
  })();

  return (
    <Card className={tone}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          {headline}
        </CardTitle>
        <CardDescription>{subline}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {lang === "sv" ? "Nivåberedskap" : "Level readiness"} · {currentLevel}
            </span>
            <span className="tabular-nums">{readiness.score}%</span>
          </div>
          <Progress value={readiness.score} className="h-2" />
        </div>

        {strengths.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
              {lang === "sv" ? "Starka områden" : "Strong areas"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {strengths.map((b) => (
                <span
                  key={b.category}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                >
                  <Check className="h-3 w-3" />
                  {skillLabel(b.category)}
                </span>
              ))}
            </div>
          </div>
        )}

        {stillBuilding.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
              {lang === "sv" ? "Behöver lite mer övning" : "Still building"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stillBuilding.map((b) => (
                <span
                  key={b.category}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30"
                >
                  <Sparkles className="h-3 w-3" />
                  {skillLabel(b.category)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {readiness.state === "test_recommended" && (
            <>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => navigate("/level-check")}
              >
                {lang === "sv" ? "Gör nivåkollen" : "Take the level check"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/practice")}
              >
                {lang === "sv" ? "Fortsätt öva" : "Keep practicing"}
              </Button>
            </>
          )}
          {readiness.state === "passed_but_can_continue" && nextLevel && (
            <>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleAdvance}
                disabled={advancing}
              >
                {lang === "sv" ? `Gå till ${nextLevel}` : `Move up to ${nextLevel}`}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/practice")}
              >
                {lang === "sv" ? "Stanna och finslipa" : "Stay & polish"}
              </Button>
            </>
          )}
          {readiness.state === "learning" && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/practice")}
            >
              {lang === "sv" ? "Öva på den här nivån" : "Practice this level"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelReadinessCard;
