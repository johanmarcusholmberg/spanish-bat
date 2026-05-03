import { useEffect, useMemo, useState } from "react";
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

  /** CEFR level shown alongside the card. */
  level: string | null;
  /** Practice mode the CTA should launch. */
  mode: PracticeMode;
  /** High-level focus area for today (used for badges/copy). */
  focus: TodayEchoFocus;

  estimatedMinutes: { min: number; max: number };

  /** 0..1 — for the in-progress state. */
  progress: number | null;

  /** Primary CTA copy. */
  primaryActionLabel: { en: string; sv: string };
  /** Where the primary CTA navigates to. */
  primaryHref: string | null;

  /** Reason the card is locked (free cap reached / completed). */
  lockedReason: { en: string; sv: string } | null;
  isLimitedForFreeUser: boolean;

  /** Suggested follow-up practice types for the "completed" / paid view. */
  suggestedPracticeTypes: TodayEchoFocus[];
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

  useEffect(() => {
    let cancelled = false;
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
      .catch(() => setResumeLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<TodayEchoPlan>(() => {
    const focus = FOCUS_BY_MODE[recommended.mode];
    const minMinutes = Math.max(2, meta.estimatedMinutes - 2);
    const maxMinutes = meta.estimatedMinutes + 2;
    const sessionHref = `/practice/session?mode=${recommended.mode}`;

    const hasHistory =
      Object.keys(stats.itemStats ?? {}).length > 0 ||
      (stats.recentMistakeIds?.length ?? 0) > 0;

    // ── Loading ─────────────────────────────────────────────────────
    if (access.loading || !resumeLoaded) {
      return {
        state: "loading",
        title: { en: "Today's Echo", sv: "Dagens Echo" },
        body: {
          en: "Preparing today's practice…",
          sv: "Förbereder dagens övning…",
        },
        level: user?.level ?? null,
        mode: recommended.mode,
        focus,
        estimatedMinutes: { min: minMinutes, max: maxMinutes },
        progress: null,
        primaryActionLabel: { en: "Loading…", sv: "Laddar…" },
        primaryHref: null,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        suggestedPracticeTypes: [],
      };
    }

    // ── Free limit reached ──────────────────────────────────────────
    if (!access.canUseTodayEcho && access.isFreeUser) {
      return {
        state: "free_limit_reached",
        title: {
          en: "Today's Echo complete",
          sv: "Dagens Echo är klart",
        },
        body: {
          en: "You've completed today's free session. Come back tomorrow, or unlock the full adaptive practice now.",
          sv: "Du har klarat dagens gratissession. Kom tillbaka i morgon, eller lås upp full adaptiv träning nu.",
        },
        level: user?.level ?? null,
        mode: recommended.mode,
        focus,
        estimatedMinutes: { min: minMinutes, max: maxMinutes },
        progress: 1,
        primaryActionLabel: {
          en: "Unlock full adaptive practice",
          sv: "Lås upp full adaptiv träning",
        },
        primaryHref: "/pricing",
        lockedReason: {
          en: "Free plan: one Echo per day.",
          sv: "Gratisplan: ett Echo per dag.",
        },
        isLimitedForFreeUser: true,
        suggestedPracticeTypes: ["vocabulary", "pronunciation"],
      };
    }

    // ── Completed today (Premium) ───────────────────────────────────
    // Premium users who already finished at least one Echo today and
    // have no active session see a "done for today" state with the
    // option to start another. Free users hit `free_limit_reached`
    // first (handled above), so this branch is Premium-only.
    if (
      !resume &&
      access.isPaidUser &&
      access.todaySessionCount > 0
    ) {
      return {
        state: "completed_today",
        title: {
          en: "Today's Echo complete",
          sv: "Dagens Echo är klart",
        },
        body: {
          en: "Nice work — your Echo for today is done. You can keep practicing as often as you like.",
          sv: "Snyggt jobbat — dagens Echo är klart. Du kan öva så ofta du vill.",
        },
        level: user?.level ?? null,
        mode: recommended.mode,
        focus,
        estimatedMinutes: { min: minMinutes, max: maxMinutes },
        progress: 1,
        primaryActionLabel: {
          en: "Start another session",
          sv: "Starta en till session",
        },
        primaryHref: sessionHref,
        lockedReason: null,
        isLimitedForFreeUser: false,
        suggestedPracticeTypes: [focus, "pronunciation", "listening"],
      };
    }

    // ── In progress ─────────────────────────────────────────────────
    if (resume) {
      const pct = (resume.stepIndex + 1) / Math.max(1, resume.totalSteps);
      return {
        state: "in_progress",
        title: { en: "Resume Today's Echo", sv: "Fortsätt dagens Echo" },
        body: {
          en: `You're ${Math.round(pct * 100)}% of the way through today's practice.`,
          sv: `Du är ${Math.round(pct * 100)}% av vägen genom dagens övning.`,
        },
        level: user?.level ?? null,
        mode: recommended.mode,
        focus,
        estimatedMinutes: { min: minMinutes, max: maxMinutes },
        progress: pct,
        primaryActionLabel: {
          en: "Resume today's practice",
          sv: "Fortsätt dagens övning",
        },
        primaryHref: sessionHref,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        suggestedPracticeTypes: [focus],
      };
    }

    // ── No data yet (first-time learner) ────────────────────────────
    if (!hasHistory) {
      return {
        state: "no_data",
        title: { en: "Start your first Echo", sv: "Starta ditt första Echo" },
        body: {
          en: "Murciélingo will adapt once you begin practicing. Five minutes is enough to get started.",
          sv: "Murciélingo anpassar sig så fort du börjar öva. Fem minuter räcker för att komma igång.",
        },
        level: user?.level ?? null,
        mode: recommended.mode,
        focus,
        estimatedMinutes: { min: minMinutes, max: maxMinutes },
        progress: 0,
        primaryActionLabel: {
          en: "Begin first practice",
          sv: "Starta första övningen",
        },
        primaryHref: sessionHref,
        lockedReason: null,
        isLimitedForFreeUser: !access.canUseFullTodayEcho,
        suggestedPracticeTypes: ["vocabulary", "pronunciation", "listening"],
      };
    }

    // ── Default: not started today ──────────────────────────────────
    return {
      state: "not_started",
      title: { en: "Today's Echo", sv: "Dagens Echo" },
      body: {
        en: "A short Spanish session built around what you need to repeat next.",
        sv: "En kort spansk session byggd kring det du behöver repetera härnäst.",
      },
      level: user?.level ?? null,
      mode: recommended.mode,
      focus,
      estimatedMinutes: { min: minMinutes, max: maxMinutes },
      progress: null,
      primaryActionLabel: {
        en: "Start today's practice",
        sv: "Starta dagens övning",
      },
      primaryHref: sessionHref,
      lockedReason: null,
      isLimitedForFreeUser: !access.canUseFullTodayEcho,
      suggestedPracticeTypes: [focus, "pronunciation", "listening"],
    };
  }, [access, recommended, meta, stats, resume, resumeLoaded, user?.level]);
}
