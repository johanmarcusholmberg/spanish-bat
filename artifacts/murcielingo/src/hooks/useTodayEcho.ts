import { useCallback, useEffect, useMemo, useState } from "react";
import {
  recommendPracticeMode,
  getPracticeModeMeta,
  countDueItems,
  type PracticeMode,
} from "@workspace/practice";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { usePracticeStats } from "@/hooks/usePracticeStats";
import { useAccess } from "@/hooks/useAccess";
import { sessionStorageService } from "@/lib/learningCoachStores";

export type TodayEchoState =
  | "loading"
  | "error"
  | "no_data"
  | "not_started"
  | "in_progress"
  | "completed_today"
  | "free_limit_reached";

export type TodayEchoFocus =
  | "pronunciation"
  | "listening"
  | "vocabulary"
  | "sentences"
  | "mixed_review"
  | "weak_spots"
  | "due_review";

export interface TodayEchoPlan {
  state: TodayEchoState;

  /** "Today's Echo", "Resume Today's Echo", etc. */
  title: { en: string; sv: string };
  /** One supportive sentence describing what the user will practice. */
  body: { en: string; sv: string };
  /** Alias of `body` — kept for callers that prefer the name. */
  description: { en: string; sv: string };

  /** CEFR level shown alongside the card. */
  level: string | null;
  /** Practice mode the CTA should launch. */
  mode: PracticeMode;
  /** High-level focus area for today (used for badges/copy). */
  focus: TodayEchoFocus;
  /** Friendly session-type label, e.g. "Adaptive session". */
  sessionType: { en: string; sv: string };

  estimatedMinutes: { min: number; max: number };

  /** 0..1 — for the in-progress state. */
  progress: number | null;
  /** Discrete progress, e.g. "3 of 8". `null` when not in progress. */
  progressCurrent: number | null;
  progressTotal: number | null;

  /** Primary CTA copy. */
  primaryActionLabel: { en: string; sv: string };
  /** Where the primary CTA navigates to. */
  primaryHref: string | null;

  /** Optional secondary CTA (e.g. "Review saved words"). */
  secondaryActionLabel: { en: string; sv: string } | null;
  secondaryHref: string | null;

  /** Reason the card is locked (free cap reached / completed). */
  lockedReason: { en: string; sv: string } | null;
  isLimitedForFreeUser: boolean;
  /** Friendly upgrade reason, only set in `free_limit_reached`. */
  upgradeReason: { en: string; sv: string } | null;

  /** Plain-language "Why this today?" explanation. */
  explanation: { en: string; sv: string };

  /** Suggested follow-up practice types for the "completed" / paid view. */
  suggestedPracticeTypes: TodayEchoFocus[];

  /** Retry the resume / state probe — used by the error state. */
  retry: () => void;
}

const FOCUS_BY_MODE: Record<PracticeMode, TodayEchoFocus> = {
  quick: "mixed_review",
  weak_spots: "weak_spots",
  level: "vocabulary",
  review_previous: "mixed_review",
  test_prep: "mixed_review",
  challenge: "sentences",
  due_review: "due_review",
};

const FOCUS_DESCRIPTOR: Record<TodayEchoFocus, { en: string; sv: string }> = {
  pronunciation: { en: "pronunciation", sv: "uttal" },
  listening: { en: "listening", sv: "lyssna" },
  vocabulary: { en: "vocabulary recall", sv: "ordförråd" },
  sentences: { en: "sentence building", sv: "meningsbygge" },
  mixed_review: { en: "a balanced mix", sv: "en blandad repetition" },
  weak_spots: { en: "your weak spots", sv: "dina fokusområden" },
  due_review: { en: "your daily review queue", sv: "din dagliga repetition" },
};

function buildExplanation(
  focus: TodayEchoFocus,
  level: string | null,
  reason: { en: string; sv: string },
): { en: string; sv: string } {
  const f = FOCUS_DESCRIPTOR[focus];
  const lvl = level ?? "your";
  return {
    en: `Based on your ${lvl} level and recent practice, today focuses on ${f.en}. ${reason.en}`,
    sv: `Baserat på din ${lvl}-nivå och senaste övning fokuserar dagens session på ${f.sv}. ${reason.sv}`,
  };
}

/**
 * useTodayEcho
 * ────────────
 * Builds the data shape that the Today's Echo hero card renders. All
 * the picking / CTA / locked-state logic lives here so the JSX stays
 * thin. Marked TEMPORARY where it falls back to local mock data — the
 * adaptive backend can replace these branches without touching the UI.
 */
export function useTodayEcho(): TodayEchoPlan {
  const { user } = useAuth();
  const { readiness, progress } = useProgress();
  const { stats: trackedStats, weakSpots } = usePracticeStats();
  const access = useAccess();

  // Merge raw category percentages into the SRS stats so the
  // recommender can run against a single shape. Mirrors what
  // TodaysPracticeCard used to do inline.
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

  const dueCount = useMemo(
    () => countDueItems(stats),
    [stats.itemSchedule, stats.itemStats],
  );

  const recommended = useMemo(
    () =>
      recommendPracticeMode({
        stats,
        weakSpots,
        readinessState: readiness?.state,
        dueCount,
      }),
    [stats, weakSpots, readiness?.state, dueCount],
  );

  const meta = getPracticeModeMeta(recommended.mode);

  // Active session detection — drives the in_progress state.
  const [resume, setResume] = useState<{
    stepIndex: number;
    totalSteps: number;
  } | null>(null);
  const [resumeLoaded, setResumeLoaded] = useState(false);
  const [resumeError, setResumeError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setResumeLoaded(false);
    setResumeError(false);
    sessionStorageService
      .loadActiveSession()
      .then((s) => {
        if (cancelled) return;
        if (s && s.totalSteps > 0 && s.stepIndex < s.totalSteps - 1) {
          setResume({ stepIndex: s.stepIndex, totalSteps: s.totalSteps });
        } else {
          setResume(null);
        }
        setResumeLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setResumeError(true);
        setResumeLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const retry = useCallback(() => setRetryToken((t) => t + 1), []);

  return useMemo<TodayEchoPlan>(() => {
    const focus = FOCUS_BY_MODE[recommended.mode];
    const minMinutes = Math.max(2, meta.estimatedMinutes - 2);
    const maxMinutes = meta.estimatedMinutes + 2;
    // Pass `source=today` so the practice page can later distinguish a
    // Today's Echo entry from a manual mode pick (e.g. for analytics).
    const sessionHref = `/practice/session?mode=${recommended.mode}&source=today`;
    const explanation = buildExplanation(
      focus,
      user?.level ?? null,
      recommended.reason,
    );
    const level = user?.level ?? null;

    const hasHistory =
      Object.keys(stats.itemStats ?? {}).length > 0 ||
      (stats.recentMistakeIds?.length ?? 0) > 0;

    const baseShape = {
      level,
      mode: recommended.mode,
      focus,
      estimatedMinutes: { min: minMinutes, max: maxMinutes },
      retry,
    };

    // ── Loading ─────────────────────────────────────────────────────
    if (access.loading || !resumeLoaded) {
      const body = {
        en: "Preparing today's practice…",
        sv: "Förbereder dagens övning…",
      };
      return {
        ...baseShape,
        state: "loading",
        title: { en: "Today's Echo", sv: "Dagens Echo" },
        body,
        description: body,
        sessionType: { en: "Adaptive session", sv: "Adaptiv session" },
        progress: null,
        progressCurrent: null,
        progressTotal: null,
        primaryActionLabel: { en: "Loading…", sv: "Laddar…" },
        primaryHref: null,
        secondaryActionLabel: null,
        secondaryHref: null,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        upgradeReason: null,
        explanation,
        suggestedPracticeTypes: [],
      };
    }

    // ── Error ───────────────────────────────────────────────────────
    if (resumeError) {
      const body = {
        en: "We couldn't load today's practice. You can try again, or jump straight into a session.",
        sv: "Vi kunde inte ladda dagens övning. Försök igen, eller hoppa direkt in i en session.",
      };
      return {
        ...baseShape,
        state: "error",
        title: { en: "Something went wrong", sv: "Något gick fel" },
        body,
        description: body,
        sessionType: { en: "Adaptive session", sv: "Adaptiv session" },
        progress: null,
        progressCurrent: null,
        progressTotal: null,
        primaryActionLabel: { en: "Try again", sv: "Försök igen" },
        primaryHref: null,
        secondaryActionLabel: {
          en: "Start a session anyway",
          sv: "Starta en session ändå",
        },
        secondaryHref: sessionHref,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        upgradeReason: null,
        explanation,
        suggestedPracticeTypes: [],
      };
    }

    // ── Free limit reached ──────────────────────────────────────────
    if (!access.canUseTodayEcho && access.isFreeUser) {
      const body = {
        en: "You've completed today's free session. Come back tomorrow, or unlock the full adaptive practice now.",
        sv: "Du har klarat dagens gratissession. Kom tillbaka i morgon, eller lås upp full adaptiv träning nu.",
      };
      return {
        ...baseShape,
        state: "free_limit_reached",
        title: {
          en: "Today's Echo complete",
          sv: "Dagens Echo är klart",
        },
        body,
        description: body,
        sessionType: { en: "Free limit reached", sv: "Gratisgräns nådd" },
        progress: 1,
        progressCurrent: null,
        progressTotal: null,
        primaryActionLabel: {
          en: "Unlock full adaptive practice",
          sv: "Lås upp full adaptiv träning",
        },
        primaryHref: "/pricing",
        secondaryActionLabel: {
          en: "Review saved words",
          sv: "Repetera sparade ord",
        },
        secondaryHref: "/practice/flashcards",
        lockedReason: {
          en: "Free plan: one Echo per day.",
          sv: "Gratisplan: ett Echo per dag.",
        },
        isLimitedForFreeUser: true,
        upgradeReason: {
          en: "Premium unlocks unlimited daily sessions and longer adaptive practice.",
          sv: "Premium ger obegränsade dagliga sessioner och längre adaptiv träning.",
        },
        explanation,
        suggestedPracticeTypes: ["vocabulary", "pronunciation"],
      };
    }

    // ── Completed today (Premium) ───────────────────────────────────
    if (
      !resume &&
      access.isPaidUser &&
      access.todaySessionCount > 0
    ) {
      const body = {
        en: "Nice work — your Echo for today is done. You can keep practicing as often as you like.",
        sv: "Snyggt jobbat — dagens Echo är klart. Du kan öva så ofta du vill.",
      };
      return {
        ...baseShape,
        state: "completed_today",
        title: {
          en: "Today's Echo complete",
          sv: "Dagens Echo är klart",
        },
        body,
        description: body,
        sessionType: { en: "Done for today", sv: "Klar för idag" },
        progress: 1,
        progressCurrent: null,
        progressTotal: null,
        primaryActionLabel: {
          en: "Start another session",
          sv: "Starta en till session",
        },
        primaryHref: sessionHref,
        secondaryActionLabel: {
          en: "Review saved words",
          sv: "Repetera sparade ord",
        },
        secondaryHref: "/practice/flashcards",
        lockedReason: null,
        isLimitedForFreeUser: false,
        upgradeReason: null,
        explanation,
        suggestedPracticeTypes: [focus, "pronunciation", "listening"],
      };
    }

    // ── In progress ─────────────────────────────────────────────────
    if (resume) {
      const current = resume.stepIndex + 1;
      const total = Math.max(1, resume.totalSteps);
      const pct = current / total;
      const body = {
        en: `You're ${current} of ${total} through today's practice.`,
        sv: `Du är på steg ${current} av ${total} i dagens övning.`,
      };
      return {
        ...baseShape,
        state: "in_progress",
        title: { en: "Resume Today's Echo", sv: "Fortsätt dagens Echo" },
        body,
        description: body,
        sessionType: { en: "In-progress session", sv: "Pågående session" },
        progress: pct,
        progressCurrent: current,
        progressTotal: total,
        primaryActionLabel: {
          en: "Resume today's practice",
          sv: "Fortsätt dagens övning",
        },
        primaryHref: sessionHref,
        secondaryActionLabel: null,
        secondaryHref: null,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        upgradeReason: null,
        explanation,
        suggestedPracticeTypes: [focus],
      };
    }

    // ── No data yet (first-time learner) ────────────────────────────
    if (!hasHistory) {
      const body = {
        en: "Murciélingo will adapt once you begin practicing. Five minutes is enough to get started.",
        sv: "Murciélingo anpassar sig så fort du börjar öva. Fem minuter räcker för att komma igång.",
      };
      return {
        ...baseShape,
        state: "no_data",
        title: { en: "Start your first Echo", sv: "Starta ditt första Echo" },
        body,
        description: body,
        sessionType: { en: "First session", sv: "Första sessionen" },
        progress: 0,
        progressCurrent: null,
        progressTotal: null,
        primaryActionLabel: {
          en: "Begin first practice",
          sv: "Starta första övningen",
        },
        primaryHref: sessionHref,
        secondaryActionLabel: null,
        secondaryHref: null,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        upgradeReason: null,
        explanation: {
          en: "Murciélingo adapts after your first few sessions. We'll start with a friendly mix.",
          sv: "Murciélingo anpassar sig efter dina första sessioner. Vi börjar med en mjuk mix.",
        },
        suggestedPracticeTypes: ["vocabulary", "pronunciation", "listening"],
      };
    }

    // ── Default: not started today ──────────────────────────────────
    const body = {
      en: "A short Spanish session built around what you need to repeat next.",
      sv: "En kort spansk session byggd kring det du behöver repetera härnäst.",
    };
    return {
      ...baseShape,
      state: "not_started",
      title: { en: "Today's Echo", sv: "Dagens Echo" },
      body,
      description: body,
      sessionType: { en: "Adaptive session", sv: "Adaptiv session" },
      progress: null,
      progressCurrent: null,
      progressTotal: null,
      primaryActionLabel: {
        en: "Start today's practice",
        sv: "Starta dagens övning",
      },
      primaryHref: sessionHref,
      secondaryActionLabel: {
        en: "Review saved words",
        sv: "Repetera sparade ord",
      },
      secondaryHref: "/practice/flashcards",
      lockedReason: null,
      isLimitedForFreeUser: !access.canUseFullTodayEcho,
      upgradeReason: null,
      explanation,
      suggestedPracticeTypes: [focus, "pronunciation", "listening"],
    };
  }, [access, recommended, meta, stats, resume, resumeLoaded, resumeError, user?.level, retry]);
}
