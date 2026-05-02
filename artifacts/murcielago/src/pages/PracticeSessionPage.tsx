import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  buildPracticeSession,
  PRACTICE_MODES,
  EMPTY_STATE_MESSAGE,
  recommendPracticeMode,
  friendlySkillName,
  friendlySubskillName,
  type PracticeMode,
  type PracticeSession,
} from "@workspace/practice";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, type Level } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Sparkles,
  Target,
  GraduationCap,
  History,
  ClipboardCheck,
  Flame,
  CalendarCheck,
  RefreshCw,
  Clock,
  Star,
  PlayCircle,
  Home,
} from "lucide-react";
import {
  buildAllPracticeItems,
  aiItemsToPracticeItems,
  type PracticePayload,
  type LocalPracticeItem,
} from "@/lib/practiceItems";
import {
  savedItemsToPracticeItems,
  persistedIdFromLocalId,
} from "@/lib/savedPracticeItems";
import { api } from "@/lib/api";
import { checkMultiAnswer } from "@/lib/answerUtils";
import { usePracticeStats } from "@/hooks/usePracticeStats";

const MODE_ICONS: Record<PracticeMode, React.ElementType> = {
  quick: Sparkles,
  weak_spots: Target,
  level: GraduationCap,
  review_previous: History,
  test_prep: ClipboardCheck,
  challenge: Flame,
  due_review: CalendarCheck,
};

const PracticeSessionPage = () => {
  const { t, language } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const { user } = useAuth();
  const { progress, updateProgress, trackLastActivity, readiness } = useProgress();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<PracticeSession<PracticePayload> | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const userLevel = (user?.level || "A1") as Level;
  const localItems = useMemo<LocalPracticeItem[]>(() => buildAllPracticeItems(), []);
  const [savedItems, setSavedItems] = useState<LocalPracticeItem[]>([]);
  const [reported, setReported] = useState<Record<string, string>>({});
  const allItems = useMemo<LocalPracticeItem[]>(() => {
    const ids = new Set(localItems.map((i) => i.id));
    return [...localItems, ...savedItems.filter((i) => !ids.has(i.id))];
  }, [localItems, savedItems]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await api.practiceItems.list();
        if (cancelled) return;
        const converted = savedItemsToPracticeItems(resp.items, lang);
        setSavedItems(converted);
      } catch {
        // best effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const { stats: trackedStats, recordAttempt, weakSpots } = usePracticeStats();

  const stats = useMemo(() => {
    const skillAccuracy: Record<string, number> = { ...(trackedStats.skillAccuracy ?? {}) };
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

  const recommended = useMemo(
    () =>
      recommendPracticeMode({
        stats,
        weakSpots,
        readinessState: readiness?.state,
      }),
    [stats, weakSpots, readiness?.state],
  );

  const buildSession = (mode: PracticeMode) => {
    return buildPracticeSession<PracticePayload>({
      mode,
      level: userLevel,
      items: allItems,
      stats,
    });
  };

  const prepareSession = (mode: PracticeMode) => {
    const built = buildSession(mode);
    setSession(built);
    setShowIntro(true);
    setIndex(0);
    setAnswer("");
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
    trackLastActivity("exercises", `/practice/session?mode=${mode}`, t("practice"));
    void enrichSessionFromAI(mode);
  };

  const startNow = () => setShowIntro(false);

  const enrichSessionFromAI = async (mode: PracticeMode) => {
    try {
      const weakSubs = (weakSpots ?? []).slice(0, 5).map((w) => w.subskill).filter(Boolean);
      const recentMistakes = (stats.recentMistakeIds ?? []).slice(0, 5);
      const resp = await api.practice.generate({
        userLevel,
        practiceMode: mode,
        count: 4,
        interfaceLanguage: lang,
        weakSpots: weakSubs,
        previousMistakes: recentMistakes,
      });
      if (!resp?.items?.length) return;
      const newItems = aiItemsToPracticeItems(resp.items, lang);
      if (newItems.length === 0) return;
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
      // graceful
    }
  };

  useEffect(() => {
    const m = searchParams.get("mode") as PracticeMode | null;
    if (m && PRACTICE_MODES.some((p) => p.mode === m) && !session) {
      prepareSession(m);
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
    const persistedId = persistedIdFromLocalId(current.id);
    if (persistedId) {
      void api.practiceItems.usage(persistedId, ok).catch(() => {});
    }
    setRevealed(true);
  };

  const handleReport = (reason: string) => {
    if (!current) return;
    const persistedId = persistedIdFromLocalId(current.id);
    if (!persistedId) {
      setReported((r) => ({ ...r, [current.id]: reason }));
      return;
    }
    setReported((r) => ({ ...r, [current.id]: reason }));
    void api.practiceItems.report(persistedId, reason).catch(() => {
      setReported((r) => {
        const copy = { ...r };
        delete copy[current.id];
        return copy;
      });
    });
  };

  const handleNext = () => {
    if (!session) return;
    if (index + 1 >= session.items.length) {
      setFinished(true);
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

  // No content
  if (allItems.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
          <Button className="mt-4" onClick={() => navigate("/practice")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Mode selector
  if (!session) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/practice")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </button>
          <h1 className="text-2xl font-heading font-bold mb-2">{t("practice")}</h1>
          <p className="text-muted-foreground mb-5 text-sm">
            {lang === "sv"
              ? "Hur vill du öva idag? Välj ett läge — vi sätter ihop en ny session åt dig varje gång."
              : "How do you want to practice today? Pick a mode — we'll build a fresh session each time."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {PRACTICE_MODES.map((m) => {
              const Icon = MODE_ICONS[m.mode];
              const isRec = m.mode === recommended.mode;
              return (
                <button
                  key={m.mode}
                  onClick={() => prepareSession(m.mode)}
                  className={`relative text-left bg-card rounded-xl p-5 shadow-soft hover:shadow-warm hover:-translate-y-0.5 transition-all border ${
                    isRec ? "border-primary/40 ring-1 ring-primary/30" : "border-transparent"
                  }`}
                >
                  {isRec && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3" />
                      {t("practiceRecommended")}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg gradient-peach flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-base">
                        {t(`practiceMode_${m.mode}_title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(`practiceMode_${m.mode}_desc`)}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />~{m.estimatedMinutes} min
                        </span>
                        <span>· ~{m.defaultSize} {t("practiceQuestions")}</span>
                      </div>
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

  // Session intro
  if (showIntro && session.items.length > 0) {
    const meta = PRACTICE_MODES.find((m) => m.mode === session.mode);
    const focusList = session.focusSkills.slice(0, 3).map((s) => friendlySkillName(s, lang));
    const subFocus = (weakSpots ?? []).slice(0, 2).map((w) => friendlySubskillName(w.subskill, lang));
    const ModeIcon = MODE_ICONS[session.mode];
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-6">
          <button
            onClick={() => setSession(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {lang === "sv" ? "Byt läge" : "Change mode"}
          </button>
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-peach flex items-center justify-center">
                <ModeIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("practiceTodaysSession")}
                </p>
                <h2 className="text-xl font-heading font-bold">
                  {meta ? t(`practiceMode_${meta.mode}_title`) : ""}
                </h2>
              </div>
            </div>
            <p className="text-sm text-foreground mb-4">
              {lang === "sv"
                ? `Idag övar vi ${focusList.join(", ")}${subFocus.length ? ` med fokus på ${subFocus.join(" och ")}` : ""}, eftersom det är användbart för dina framsteg på ${userLevel}.`
                : `Today we'll practice ${focusList.join(", ")}${subFocus.length ? ` with a focus on ${subFocus.join(" and ")}` : ""} because it's useful for your ${userLevel} progress.`}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {lang === "sv" ? "Frågor" : "Questions"}
                </p>
                <p className="font-bold text-lg">{session.items.length}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {lang === "sv" ? "Tid" : "Time"}
                </p>
                <p className="font-bold text-lg">~{meta?.estimatedMinutes} min</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {lang === "sv" ? "Nivå" : "Level"}
                </p>
                <p className="font-bold text-lg">{userLevel}</p>
              </div>
            </div>
            {focusList.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {lang === "sv" ? "Fokus" : "Focus skills"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {focusList.map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={startNow} className="flex-1">
                <PlayCircle className="h-4 w-4 mr-2" />
                {lang === "sv" ? "Sätt igång" : "Let's go"}
              </Button>
              <Button variant="outline" onClick={() => setSession(null)} className="flex-1">
                {lang === "sv" ? "Byt läge" : "Change mode"}
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Empty session guard
  if (session.items.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">{EMPTY_STATE_MESSAGE}</p>
          <Button variant="outline" onClick={() => setSession(null)}>
            {lang === "sv" ? "Byt läge" : "Change mode"}
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Finished
  if (finished) {
    const accuracy = Math.round((correctCount / session.items.length) * 100);
    const strengthened = session.focusSkills.slice(0, 3).map((s) => friendlySkillName(s, lang));
    const headline =
      accuracy >= 90
        ? lang === "sv" ? "Riktigt bra jobbat!" : "Brilliant work!"
        : accuracy >= 70
          ? lang === "sv" ? "Bra jobbat — du blir starkare." : "Nice work — you're getting stronger."
          : accuracy >= 50
            ? lang === "sv" ? "Bra moment att repetera detta." : "Good moment to review this."
            : lang === "sv" ? "Vi gör det här mer automatiskt." : "Let's make this more automatic.";
    const subline =
      accuracy >= 70
        ? lang === "sv" ? "Vill du fortsätta öva eller ta en paus?" : "Want to keep practicing or take a break?"
        : lang === "sv" ? "En kort repetition fastnar bäst." : "Short, frequent practice sticks best.";
    const showLevelCheck = readiness?.state !== "learning";
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border text-center">
            <div className="w-14 h-14 mx-auto rounded-full gradient-peach flex items-center justify-center mb-3">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-heading font-bold">{headline}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subline}</p>

            <div className="grid grid-cols-2 gap-3 mt-5 text-center">
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {lang === "sv" ? "Träffsäkerhet" : "Accuracy"}
                </p>
                <p className="font-bold text-2xl text-primary">{accuracy}%</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {lang === "sv" ? "Rätt" : "Correct"}
                </p>
                <p className="font-bold text-2xl">
                  {correctCount}<span className="text-sm text-muted-foreground">/{session.items.length}</span>
                </p>
              </div>
            </div>

            {strengthened.length > 0 && (
              <div className="mt-5 text-left">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {lang === "sv" ? "Du stärkte" : "You strengthened"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {strengthened.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 text-left bg-background/40 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {lang === "sv" ? "Föreslås härnäst" : "What to practice next"}
              </p>
              <p className="text-sm">
                {accuracy >= 70
                  ? lang === "sv"
                    ? "Behöver övning på några områden? Prova fokusområden."
                    : "A few areas could use more time. Try focus areas next."
                  : lang === "sv"
                    ? "En kort sammanställning av nuvarande nivå hjälper det att fastna."
                    : "A short level practice will help it stick."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
              <Button onClick={() => prepareSession(session.mode)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {lang === "sv" ? "Öva igen" : "Practice again"}
              </Button>
              <Button variant="outline" onClick={() => prepareSession("weak_spots")}>
                <Target className="h-4 w-4 mr-2" />
                {lang === "sv" ? "Öva fokusområden" : "Practice focus areas"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                {lang === "sv" ? "Tillbaka till start" : "Back to dashboard"}
              </Button>
              {showLevelCheck && (
                <Button variant="ghost" onClick={() => navigate("/level-check")}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  {lang === "sv" ? "Gör nivåkollen" : "Take level check"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Question runner
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
          <ArrowLeft className="h-4 w-4" /> {lang === "sv" ? "Avsluta" : "Exit"}
        </button>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {index + 1} / {session.items.length} · {current.skill} · {current.level}
            </span>
            <span>
              {correctCount} {lang === "sv" ? "rätt" : "correct"}
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 italic">{session.reasonForSelection}</p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-soft">
          {(p.kind === "translate" || p.kind === "fill") && (
            <>
              <p className="text-lg font-semibold mb-2">{lang === "sv" ? p.prompt.sv : p.prompt.en}</p>
              {p.kind === "fill" && p.sentence ? (
                <p className="font-mono text-base mb-3 text-muted-foreground">{p.sentence}</p>
              ) : null}
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={revealed}
                placeholder={lang === "sv" ? "Ditt svar..." : "Your answer..."}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !revealed) handleSubmit();
                }}
              />
              {revealed && (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">{lang === "sv" ? "Svar:" : "Answer:"}</span>{" "}
                  {p.answer}
                </p>
              )}
            </>
          )}

          {p.kind === "mcq" && (
            <>
              <p className="text-lg font-semibold mb-4">{lang === "sv" ? p.prompt.sv : p.prompt.en}</p>
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
                  {lang === "sv" ? p.explanation.sv : p.explanation.en}
                </p>
              )}
            </>
          )}

          {p.kind === "sentence" && (
            <>
              <p className="text-sm text-muted-foreground mb-1">{lang === "sv" ? "Översätt:" : "Translate:"}</p>
              <p className="text-lg font-semibold mb-4">{lang === "sv" ? p.translation.sv : p.translation.en}</p>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={revealed}
                placeholder={lang === "sv" ? "Skriv meningen på spanska..." : "Type the sentence in Spanish..."}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !revealed) handleSubmit();
                }}
              />
              {revealed && (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">{lang === "sv" ? "Svar:" : "Answer:"}</span>{" "}
                  {p.correctOrder.join(" ")}
                </p>
              )}
            </>
          )}

          {revealed && (
            <div className="mt-4 pt-3 border-t border-border">
              {reported[current.id] ? (
                <p className="text-xs text-muted-foreground">
                  {lang === "sv" ? "Tack för din feedback!" : "Thanks for the feedback!"}
                </p>
              ) : (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground select-none">
                    {lang === "sv" ? "Något fel med frågan?" : "Something off?"}
                  </summary>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { value: "confusing", sv: "Förvirrande", en: "Confusing" },
                      { value: "wrong_answer", sv: "Fel svar", en: "Wrong answer" },
                      { value: "too_hard", sv: "För svår", en: "Too hard" },
                      { value: "too_easy", sv: "För lätt", en: "Too easy" },
                    ].map((r) => (
                      <button
                        key={r.value}
                        onClick={() => handleReport(r.value)}
                        className="px-2 py-1 rounded border border-border hover:border-primary/50 text-xs"
                      >
                        {lang === "sv" ? r.sv : r.en}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            {!revealed ? (
              <Button onClick={handleSubmit} disabled={!answer.trim()}>
                {lang === "sv" ? "Kontrollera" : "Check"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {index + 1 >= session.items.length
                  ? lang === "sv"
                    ? "Klar"
                    : "Finish"
                  : lang === "sv"
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
