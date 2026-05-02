/**
 * SM-2-lite spaced repetition scheduler for practice items.
 *
 * Tiny, dependency-free, well-tested. Each practice item has its own
 * `SrsState`; on every answer the caller passes the previous state and
 * the user's grade, and gets back a new state with `nextReviewAt`
 * pointing into the future.
 *
 * Grading model:
 *   "again" → wrong / didn't know — reset interval to 1 day, drop ease.
 *   "hard"  → got it but it was a struggle — short next interval.
 *   "good"  → standard correct — step up the schedule.
 *   "easy"  → trivially correct — bigger jump.
 *
 * The math is intentionally close to classic SM-2 with a few guards so
 * callers can't end up with a NaN ease or a negative interval.
 */

export type SrsGrade = "again" | "hard" | "good" | "easy";

export interface SrsState {
  /** Ease factor, ≥ 1.3. Higher = longer steps. */
  ease: number;
  /** Days until the next review after the most recent grading. */
  intervalDays: number;
  /** How many consecutive successful (good/easy) reviews we've had. */
  repetitions: number;
  /** ms epoch — when the item is next due for review. */
  nextReviewAt: number;
  /** ms epoch — when the most recent review happened. */
  lastReviewedAt: number;
  /** Lifetime count of "again" gradings. Used to detect leeches. */
  lapses: number;
}

export const SRS_DEFAULT_EASE = 2.5;
export const SRS_MIN_EASE = 1.3;
/** Items reset to this many days after a lapse. */
export const SRS_LAPSE_INTERVAL_DAYS = 1;
/** First successful step. */
export const SRS_FIRST_INTERVAL_DAYS = 1;
/** Second successful step. */
export const SRS_SECOND_INTERVAL_DAYS = 3;
/** Third successful step before ease takes over. */
export const SRS_THIRD_INTERVAL_DAYS = 6;
/** A subskill is a "leech" after this many lapses. */
export const SRS_LEECH_THRESHOLD = 8;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Build a fresh SRS state for a brand-new item. */
export function newSrsState(now: number = Date.now()): SrsState {
  return {
    ease: SRS_DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    // New items are immediately due so the engine treats them as "due".
    nextReviewAt: now,
    lastReviewedAt: 0,
    lapses: 0,
  };
}

function clampEase(ease: number): number {
  if (!Number.isFinite(ease)) return SRS_DEFAULT_EASE;
  return Math.max(SRS_MIN_EASE, ease);
}

function daysToMs(days: number): number {
  return Math.max(0, Math.round(days * MS_PER_DAY));
}

/**
 * Apply one SM-2-lite step. Pure — never mutates `prev`.
 */
export function scheduleReview(
  prev: SrsState | undefined,
  grade: SrsGrade,
  now: number = Date.now(),
): SrsState {
  const base: SrsState = prev
    ? { ...prev }
    : newSrsState(now);

  let { ease, intervalDays, repetitions, lapses } = base;
  ease = clampEase(ease);

  if (grade === "again") {
    repetitions = 0;
    lapses += 1;
    intervalDays = SRS_LAPSE_INTERVAL_DAYS;
    ease = clampEase(ease - 0.2);
  } else {
    if (grade === "hard") {
      ease = clampEase(ease - 0.15);
    } else if (grade === "easy") {
      ease = clampEase(ease + 0.15);
    }

    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = SRS_FIRST_INTERVAL_DAYS;
    } else if (repetitions === 2) {
      intervalDays = grade === "easy"
        ? SRS_THIRD_INTERVAL_DAYS
        : SRS_SECOND_INTERVAL_DAYS;
    } else if (repetitions === 3) {
      intervalDays = SRS_THIRD_INTERVAL_DAYS;
    } else {
      const prevInterval = Math.max(1, intervalDays);
      const factor = grade === "hard" ? 1.2 : grade === "easy" ? ease * 1.3 : ease;
      intervalDays = Math.max(1, Math.round(prevInterval * factor));
    }
  }

  return {
    ease,
    intervalDays,
    repetitions,
    nextReviewAt: now + daysToMs(intervalDays),
    lastReviewedAt: now,
    lapses,
  };
}

/** True when the item is due for review at `now`. */
export function isDue(state: SrsState | undefined, now: number = Date.now()): boolean {
  if (!state) return true;
  return state.nextReviewAt <= now;
}

/** True when the item has lapsed enough times to be flagged as a leech. */
export function isLeech(state: SrsState | undefined): boolean {
  if (!state) return false;
  return state.lapses >= SRS_LEECH_THRESHOLD;
}

/**
 * Map a correct/incorrect answer (the existing recordAttempt signal)
 * onto an SRS grade. Easy/hard variants stay available for callers that
 * surface those buttons.
 */
export function gradeFromCorrect(correct: boolean): SrsGrade {
  return correct ? "good" : "again";
}

/**
 * Returns "due in X days" for forecasting. Negative for overdue items.
 */
export function daysUntilDue(
  state: SrsState | undefined,
  now: number = Date.now(),
): number {
  if (!state) return 0;
  return (state.nextReviewAt - now) / MS_PER_DAY;
}
