import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  buildPracticeSession,
  PRACTICE_MODES,
  EMPTY_STATE_MESSAGE,
  type PracticeMode,
  type PracticeSession,
} from "@workspace/practice";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, type Level } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sparkles, Target, GraduationCap, History, ClipboardCheck, Flame, RefreshCw } from "lucide-react";
import {
  buildAllPracticeItems,
  aiItemsToPracticeItems,
  type PracticePayload,
  type LocalPracticeItem,
} from "@/lib/practiceItems";
import { api } from "@/lib/api";
import { checkMultiAnswer } from "@/lib/answerUtils";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import WeakSpotsCard from "@/components/WeakSpotsCard";

const MODE_ICONS: Record<PracticeMode, React.ElementType> = {
  quick: Sparkles,
  weak_spots: Target,
  level: GraduationCap,
  review_previous: History,
  test_prep: ClipboardCheck,
  challenge: Flame,
};

const PracticeSessionPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { progress, updateProgress, trackLastActivity } = useProgress();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<PracticeSession<PracticePayload> | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const userLevel = (user?.level || "A1") as Level;
  const allItems = useMemo<LocalPracticeItem[]>(() => buildAllPracticeItems(), []);
  const {
    stats: trackedStats,
    recordAttempt,
    weakSpots,
    todaysFocus,
  } = usePracticeStats();

  // Merge tracked subskill stats with a coarse approximation derived from
  // existing progress percentages so brand-new users still get sensible
  // skill-level signals before they've answered enough questions.
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

  const startSession = (mode: PracticeMode) => {
    const built = buildPracticeSession<PracticePayload>({
      mode,
      level: userLevel,
      items: allItems,
      stats,
    });
    setSession(built);
    setIndex(0);
    setAnswer("");
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
    trackLastActivity("exercises", `/practice/session?mode=${mode}`, t("practice"));
    // Background AI enrichment — never blocks, never required.
    void enrichSessionFromAI(mode);
  };

  // Fetches AI-generated practice items in the background and appends
  // them to the current session. Silently no-ops on failure.
  const enrichSessionFromAI = async (mode: PracticeMode) => {
    try {
      const weakSubs = (weakSpots ?? [])
        .slice(0, 5)
        .map((w) => w.subskill)
        .filter(Boolean);
      const recentMistakes = (stats.recentMistakeIds ?? []).slice(0, 5);
      const resp = await api.practice.generate({
        userLevel,
        practiceMode: mode,
        count: 4,
        interfaceLanguage: language === "sv" ? "sv" : "en",
        weakSpots: weakSubs,
        previousMistakes: recentMistakes,
      });
      if (!resp?.items?.length) return;
      const newItems = aiItemsToPracticeItems(
        resp.items,
        language === "sv" ? "sv" : "en",
      );
      if (newItems.length === 0) return;
      // Only enrich if the user is still near the start of the session.
      // Appending mid-session would shift the "finish" goalpost and confuse
      // the progress bar.
      setSession((prev) => {
        if (!prev || prev.mode !== mode) return prev;
        if (revealed || finished) return prev;
        if (index > 0) return prev;
        const existingIds = new Set(prev.items.map((i) => i.id));
        const fresh = newItems.filter((i) => !existingIds.has(i.id));
        if (fresh.length === 0) return prev;
        return { ...prev, items: [...prev.items, ...fresh] };
      });
    } catch {
      // Graceful: AI is enrichment, not a requirement.
    }
  };

  // Auto-start if ?mode= is provided, else show mode picker.
  useEffect(() => {
    const m = searchParams.get("mode") as PracticeMode | null;
    if (m && PRACTICE_MODES.some((p) => p.mode === m) && !session) {
      startSession(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const current = session?.items[index];

  const handleSubmit = () => {
    if (!current) return;
    let ok = false;
    const p = current.payload;
    if (p.kind === "translate" || p.kind === "fill") {
      const accepted = p.kind === "translate" ? p.acceptedAnswers : undefined;
      ok = checkMultiAnswer(answer, p.answer, accepted).correct;
    } else if (p.kind === "mcq") {
      ok = answer.trim() === p.answer;
    } else if (p.kind === "sentence") {
      const tokens = answer.trim().split(/\s+/);
      const orders = [p.correctOrder, ...(p.alternateOrders ?? [])];
      ok = orders.some(
        (o) => o.length === tokens.length && o.every((tok, i) => tok === tokens[i]),
      );
    }
    if (ok) setCorrectCount((c) => c + 1);
    recordAttempt({
      itemId: current.id,
      skill: current.skill,
      subskill: current.category,
      level: current.level,
      correct: ok,
    });
    setRevealed(true);
  };

  const handleNext = () => {
    if (!session) return;
    if (index + 1 >= session.items.length) {
      setFinished(true);
      // Lightweight progress nudging
      const skillKey =
        session.focusSkills[0] === "grammar"
          ? "grammar"
          : session.focusSkills[0] === "sentences"
            ? "sentences"
            : "exercises";
      const cur = (progress as unknown as Record<string, { completed: number; total: number }>)[skillKey];
      const baseTotal = cur?.total ?? Math.max(20, (cur?.completed ?? 0) + session.items.length);
      updateProgress(
        skillKey as "grammar" | "sentences" | "exercises",
        (cur?.completed ?? 0) + correctCount,
        baseTotal,
      );
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setRevealed(false);
  };

  // ─── No content anywhere ──────────────────────────────────────
  if (allItems.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
          <Button className="mt-4" onClick={() => navigate("/exercises")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ─── Mode selector ────────────────────────────────────────────
  if (!session) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/exercises")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </button>
          <h1 className="text-2xl font-heading font-bold mb-2">{t("practice")}</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {language === "sv"
              ? "Välj ett övningsläge — vi sätter ihop en ny session åt dig varje gång."
              : "Pick a practice mode — we'll assemble a fresh session for you every time."}
          </p>
          <div className="mb-6">
            <WeakSpotsCard weakSpots={weakSpots} todaysFocus={todaysFocus} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRACTICE_MODES.map((m) => {
              const Icon = MODE_ICONS[m.mode];
              return (
                <button
                  key={m.mode}
                  onClick={() => startSession(m.mode)}
                  className="text-left bg-card rounded-lg p-5 shadow-soft hover:shadow-warm hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold">{m.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        ~{m.defaultSize} {m.defaultSize === 1 ? "question" : "questions"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Empty session guard ──────────────────────────────────────
  if (session.items.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">{EMPTY_STATE_MESSAGE}</p>
          <Button variant="outline" onClick={() => setSession(null)}>
            {language === "sv" ? "Byt läge" : "Change mode"}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ─── Finished ─────────────────────────────────────────────────
  if (finished) {
    const accuracy = Math.round((correctCount / session.items.length) * 100);
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-2">
            {language === "sv" ? "Bra jobbat!" : "Nice work!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {correctCount} / {session.items.length} ({accuracy}%)
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => startSession(session.mode)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === "sv" ? "Ny session" : "New session"}
            </Button>
            <Button variant="outline" onClick={() => setSession(null)}>
              {language === "sv" ? "Byt läge" : "Change mode"}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Question runner ──────────────────────────────────────────
  if (!current) return null;
  const p = current.payload;
  const progressPct = ((index + 1) / session.items.length) * 100;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => setSession(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> {language === "sv" ? "Avsluta" : "Exit"}
        </button>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {index + 1} / {session.items.length} · {current.skill} · {current.level}
            </span>
            <span>
              {correctCount} {language === "sv" ? "rätt" : "correct"}
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 italic">{session.reasonForSelection}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          {(p.kind === "translate" || p.kind === "fill") && (
            <>
              <p className="text-lg font-semibold mb-2">
                {language === "sv" ? p.prompt.sv : p.prompt.en}
              </p>
              {p.kind === "fill" && p.sentence ? (
                <p className="font-mono text-base mb-3 text-muted-foreground">{p.sentence}</p>
              ) : null}
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={revealed}
                placeholder={language === "sv" ? "Ditt svar..." : "Your answer..."}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !revealed) handleSubmit();
                }}
              />
              {revealed && (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">
                    {language === "sv" ? "Svar:" : "Answer:"}
                  </span>{" "}
                  {p.answer}
                </p>
              )}
            </>
          )}

          {p.kind === "mcq" && (
            <>
              <p className="text-lg font-semibold mb-4">
                {language === "sv" ? p.prompt.sv : p.prompt.en}
              </p>
              <div className="grid gap-2">
                {p.options.map((opt) => {
                  const selected = answer === opt;
                  const isAns = opt === p.answer;
                  const cls = revealed
                    ? isAns
                      ? "border-green-500 bg-green-500/10"
                      : selected
                        ? "border-red-500 bg-red-500/10"
                        : "border-border"
                    : selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50";
                  return (
                    <button
                      key={opt}
                      disabled={revealed}
                      onClick={() => setAnswer(opt)}
                      className={`text-left px-3 py-2 rounded-lg border transition-all ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed && p.explanation && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {language === "sv" ? p.explanation.sv : p.explanation.en}
                </p>
              )}
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
                disabled={revealed}
                placeholder={
                  language === "sv"
                    ? "Skriv meningen på spanska..."
                    : "Type the sentence in Spanish..."
                }
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !revealed) handleSubmit();
                }}
              />
              {revealed && (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">
                    {language === "sv" ? "Svar:" : "Answer:"}
                  </span>{" "}
                  {p.correctOrder.join(" ")}
                </p>
              )}
            </>
          )}

          <div className="flex justify-end mt-6">
            {!revealed ? (
              <Button onClick={handleSubmit} disabled={!answer.trim()}>
                {language === "sv" ? "Kontrollera" : "Check"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {index + 1 >= session.items.length
                  ? language === "sv"
                    ? "Klar"
                    : "Finish"
                  : language === "sv"
                    ? "Nästa"
                    : "Next"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PracticeSessionPage;
