import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  buildLevelCheckSession,
  evaluateLevelCheck,
  getLevelCheckBlueprint,
  getLevelCheckCopy,
  type LevelCheckAnswer,
  type LevelCheckResult,
  type LevelCheckSession,
} from "@workspace/level-check";
import { getNextLevel } from "@workspace/readiness";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, type Level } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ClipboardCheck, CheckCircle2, AlertCircle } from "lucide-react";
import {
  buildAllPracticeItems,
  type PracticePayload,
  type LocalPracticeItem,
} from "@/lib/practiceItems";
import { checkMultiAnswer } from "@/lib/answerUtils";

const LevelCheckPage = () => {
  const { language } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { markLevelCheckPassed } = useProgress();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userLevel = (user?.level || "A1") as Level;
  const requestedLevel = (searchParams.get("level") as Level | null) || userLevel;
  const blueprint = getLevelCheckBlueprint(requestedLevel);

  const allItems = useMemo<LocalPracticeItem[]>(() => buildAllPracticeItems(), []);

  const [session, setSession] = useState<LevelCheckSession<PracticePayload> | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<LevelCheckAnswer[]>([]);
  const [result, setResult] = useState<LevelCheckResult | null>(null);
  const [started, setStarted] = useState(false);

  // Build session when started
  useEffect(() => {
    if (started && blueprint && !session) {
      const built = buildLevelCheckSession<PracticePayload>({
        blueprint,
        items: allItems,
      });
      setSession(built);
    }
  }, [started, blueprint, allItems, session]);

  if (!blueprint) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {language === "sv"
              ? `Det finns ingen nivåkontroll för ${requestedLevel} än. Fortsätt öva — vi lägger till fler snart.`
              : `No level check is available for ${requestedLevel} yet. Keep practicing — more are coming.`}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "sv" ? "Tillbaka" : "Back"}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ─── Intro screen ─────────────────────────────────────────────
  if (!started) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "sv" ? "Tillbaka" : "Back"}
          </button>
          <div className="bg-card rounded-lg p-6 shadow-soft">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center shrink-0">
                <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-heading font-bold">
                  {language === "sv" ? blueprint.title.sv : blueprint.title.en}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === "sv"
                    ? blueprint.description.sv
                    : blueprint.description.en}
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              {blueprint.sections.map((s) => (
                <li key={s.id} className="flex justify-between border-b border-border/50 pb-1">
                  <span>{language === "sv" ? s.label.sv : s.label.en}</span>
                  <span className="text-muted-foreground">
                    {s.count} {s.count === 1
                      ? language === "sv" ? "fråga" : "item"
                      : language === "sv" ? "frågor" : "items"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mb-4">
              {language === "sv"
                ? `Klargränsen är ungefär ${Math.round(blueprint.passThreshold * 100)} %. Du kan alltid avbryta — det här är inte obligatoriskt.`
                : `Pass threshold is around ${Math.round(blueprint.passThreshold * 100)}%. You can always exit — this is never required.`}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setStarted(true)} className="flex-1">
                {language === "sv" ? "Starta nivåkontroll" : "Start level check"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/practice")}
                className="flex-1"
              >
                {language === "sv" ? "Fortsätt öva istället" : "Keep practicing instead"}
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Loading session ──────────────────────────────────────────
  if (!session) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            {language === "sv" ? "Förbereder nivåkontroll…" : "Preparing your level check…"}
          </p>
        </div>
      </AppLayout>
    );
  }

  // ─── Empty session guard ──────────────────────────────────────
  if (session.items.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {language === "sv"
              ? "Det finns inte tillräckligt med innehåll för en nivåkontroll just nu."
              : "Not enough content available for this level check yet."}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            {language === "sv" ? "Tillbaka" : "Back"}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ─── Result screen ────────────────────────────────────────────
  if (result) {
    const nextLevel = getNextLevel(result.level);
    const copy = getLevelCheckCopy(result, language as "en" | "sv", nextLevel);
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-card rounded-lg p-6 shadow-soft">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  result.passed
                    ? "bg-green-500/15 text-green-600"
                    : "bg-amber-500/15 text-amber-600"
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-heading font-bold">{copy.headline}</h2>
                <p className="text-sm text-muted-foreground mt-1">{copy.body}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {result.sections.map((s) => (
                <div key={s.sectionId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      {language === "sv" ? s.label.sv : s.label.en}
                      {s.belowMinimum && (
                        <span className="ml-1 text-amber-600">
                          ({language === "sv" ? "under tröskeln" : "below minimum"})
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      {s.correct}/{s.total} ({Math.round(s.accuracy * 100)}%)
                    </span>
                  </div>
                  <Progress value={s.accuracy * 100} className="h-2" />
                </div>
              ))}
            </div>

            {result.strengths.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {language === "sv" ? "Styrkor" : "Strengths"}
                </p>
                <p className="text-sm">
                  {result.strengths
                    .map((s) => (language === "sv" ? s.label.sv : s.label.en))
                    .join(", ")}
                </p>
              </div>
            )}
            {result.focusAreas.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {language === "sv" ? "Fokusområden" : "Focus areas"}
                </p>
                <p className="text-sm">
                  {result.focusAreas
                    .map((s) => (language === "sv" ? s.label.sv : s.label.en))
                    .join(", ")}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {result.passed ? (
                <>
                  {nextLevel && (
                    <Button
                      onClick={async () => {
                        try {
                          await updateProfile({ level: nextLevel });
                        } catch {
                          /* optimistic */
                        }
                        navigate("/dashboard");
                      }}
                    >
                      {copy.passedActions.moveUp}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate("/practice")}>
                    {copy.passedActions.continue}
                  </Button>
                  {nextLevel && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigate(`/practice/session?mode=challenge`)
                      }
                    >
                      {copy.passedActions.mix}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate(`/practice/session?mode=weak_spots`)}
                  >
                    {copy.failedActions.practiceWeak}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    {copy.failedActions.tryLater}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/practice")}>
                    {copy.failedActions.continue}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Test runner ──────────────────────────────────────────────
  const current = session.items[index];
  if (!current) return null;
  const p = current.item.payload;
  const section = blueprint.sections[current.sectionIndex];
  const progressPct = ((index + 1) / session.items.length) * 100;

  const grade = (): boolean => {
    if (p.kind === "translate" || p.kind === "fill") {
      const accepted = p.kind === "translate" ? p.acceptedAnswers : undefined;
      return checkMultiAnswer(answer, p.answer, accepted).correct;
    }
    if (p.kind === "mcq") {
      return (picked ?? "") === p.answer;
    }
    if (p.kind === "sentence") {
      const tokens = answer.trim().split(/\s+/);
      const orders = [p.correctOrder, ...(p.alternateOrders ?? [])];
      return orders.some(
        (o) => o.length === tokens.length && o.every((tok, i) => tok === tokens[i]),
      );
    }
    return false;
  };

  const submit = () => {
    const ok = grade();
    const next = [...answers, { itemIndex: index, correct: ok }];
    setAnswers(next);
    if (index + 1 >= session.items.length) {
      const evald = evaluateLevelCheck(session, next);
      setResult(evald);
      if (evald.passed) {
        try {
          markLevelCheckPassed();
        } catch {
          /* ignore */
        }
      }
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setPicked(null);
  };

  const canSubmit =
    p.kind === "mcq" ? !!picked : !!answer.trim();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => {
            if (
              window.confirm(
                language === "sv"
                  ? "Avbryta nivåkontrollen? Du kan börja om när som helst."
                  : "Exit the level check? You can start over any time.",
              )
            ) {
              navigate("/dashboard");
            }
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === "sv" ? "Avsluta" : "Exit"}
        </button>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {index + 1} / {session.items.length} ·{" "}
              {language === "sv" ? section.label.sv : section.label.en}
            </span>
            <span>{session.level}</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          {(p.kind === "translate" || p.kind === "fill") && (
            <>
              <p className="text-lg font-semibold mb-2">
                {language === "sv" ? p.prompt.sv : p.prompt.en}
              </p>
              {p.kind === "fill" && p.sentence ? (
                <p className="font-mono text-base mb-3 text-muted-foreground">
                  {p.sentence}
                </p>
              ) : null}
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={language === "sv" ? "Ditt svar…" : "Your answer…"}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) submit();
                }}
                autoFocus
              />
            </>
          )}

          {p.kind === "mcq" && (
            <>
              <p className="text-lg font-semibold mb-4">
                {language === "sv" ? p.prompt.sv : p.prompt.en}
              </p>
              <div className="grid gap-2">
                {p.options.map((opt) => {
                  const selected = picked === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setPicked(opt)}
                      className={`text-left px-3 py-2 rounded-lg border transition-all ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {p.kind === "sentence" && (
            <>
              <p className="text-sm text-muted-foreground mb-1">
                {language === "sv" ? "Översätt:" : "Translate:"}
              </p>
              <p className="text-lg font-semibold mb-4">
                {language === "sv" ? p.translation.sv : p.translation.en}
              </p>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={
                  language === "sv"
                    ? "Skriv meningen på spanska…"
                    : "Type the sentence in Spanish…"
                }
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit) submit();
                }}
                autoFocus
              />
            </>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={submit} disabled={!canSubmit}>
              {index + 1 >= session.items.length
                ? language === "sv"
                  ? "Avsluta"
                  : "Finish"
                : language === "sv"
                  ? "Nästa"
                  : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LevelCheckPage;
