/**
 * Learning State model
 * --------------------
 * Replaces rigid "X / Y completed" counters with a soft, language-coach
 * friendly description of where a learner stands on a given item — be it
 * a word, phrase, grammar concept, pronunciation pattern, or sentence
 * shape. Pure functions, no UI assumptions, safe for web + mobile.
 */

export type LearningState =
  | "new"
  | "learning"
  | "practicing"
  | "strong"
  | "mastered"
  | "needs_review";

export interface LearningStateInput {
  /** Total times the user has seen / answered this item. */
  exposures?: number;
  /** Rolling accuracy in [0..1] over the recent attempts. */
  accuracy?: number;
  /** SRS interval in days, if known. Higher = better remembered. */
  intervalDays?: number;
  /** Timestamp (ms) the item is next due for SRS review, if any. */
  nextReviewAt?: number;
  /** Number of recent mistakes (last ~5 attempts). */
  recentMistakes?: number;
  /** "now" override for tests. */
  now?: number;
}

const DEFAULTS = {
  newMaxExposures: 1,
  learningMaxExposures: 4,
  strongMinAccuracy: 0.85,
  masteredMinIntervalDays: 21,
  masteredMinAccuracy: 0.9,
  recentMistakeThreshold: 2,
};

export function deriveLearningState(input: LearningStateInput): LearningState {
  const now = input.now ?? Date.now();
  const exposures = input.exposures ?? 0;
  const accuracy = input.accuracy ?? 0;
  const interval = input.intervalDays ?? 0;
  const recentMistakes = input.recentMistakes ?? 0;
  const due =
    typeof input.nextReviewAt === "number" && input.nextReviewAt <= now;

  if (recentMistakes >= DEFAULTS.recentMistakeThreshold) return "needs_review";
  if (due && exposures > 0) return "needs_review";

  if (exposures === 0) return "new";
  if (exposures <= DEFAULTS.newMaxExposures && accuracy < 0.5) return "new";

  if (
    interval >= DEFAULTS.masteredMinIntervalDays &&
    accuracy >= DEFAULTS.masteredMinAccuracy
  ) {
    return "mastered";
  }

  if (accuracy >= DEFAULTS.strongMinAccuracy && exposures >= 3) {
    return "strong";
  }

  if (exposures >= DEFAULTS.learningMaxExposures) return "practicing";
  return "learning";
}

export function learningStateLabel(
  state: LearningState,
  lang: "en" | "sv" = "en",
): string {
  const map: Record<LearningState, { en: string; sv: string }> = {
    new: { en: "New today", sv: "Nytt idag" },
    learning: { en: "Just learned", sv: "Precis lärt" },
    practicing: { en: "Practicing", sv: "Övar" },
    strong: { en: "Getting stronger", sv: "Blir starkare" },
    mastered: { en: "Mastered", sv: "Bemästrat" },
    needs_review: { en: "Needs review", sv: "Behöver repetition" },
  };
  return map[state][lang];
}

/**
 * Tailwind class hint for chip / badge styling per state — used by the
 * web client. Mobile clients should pick equivalent palette colors via
 * their theme hook.
 */
export function learningStateChipClass(state: LearningState): string {
  switch (state) {
    case "new":
      return "bg-blue-500/15 text-blue-700 border-blue-500/30";
    case "learning":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "practicing":
      return "bg-orange-500/15 text-orange-700 border-orange-500/30";
    case "strong":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "mastered":
      return "bg-green-600/15 text-green-700 border-green-600/30";
    case "needs_review":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30";
  }
}

export function bucketByState<T>(
  items: T[],
  read: (item: T) => LearningStateInput,
): Record<LearningState, number> {
  const out: Record<LearningState, number> = {
    new: 0,
    learning: 0,
    practicing: 0,
    strong: 0,
    mastered: 0,
    needs_review: 0,
  };
  for (const item of items) {
    const s = deriveLearningState(read(item));
    out[s] += 1;
  }
  return out;
}
