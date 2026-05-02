/**
 * Murciélingo readiness model
 * --------------------------------
 * The app no longer treats learning as a finite "X of Y" checklist.
 * Each level instead has a *readiness score* from 0–100 that estimates
 * how prepared the user is to take the level test for the next CEFR level.
 *
 * Inputs (all optional — missing inputs are treated as zero):
 *   - vocabulary practice           (count of items practised)
 *   - grammar practice              (count of lessons studied)
 *   - sentence building             (count of sentences built)
 *   - reading                       (count of passages read)
 *   - listening / speaking          (count of practice rounds)
 *   - recent accuracy (0..1)        (average accuracy of recent rounds)
 *   - repeated mistakes (count)     (lowers readiness slightly)
 *   - skill categories practised    (the more skill types touched,
 *                                    the higher the variety bonus)
 *
 * The score is a weighted blend of:
 *   1. Coverage  (how many activities of each kind, capped per category)
 *   2. Variety   (how many distinct skill categories have been touched)
 *   3. Quality   (recent accuracy, with a small penalty for repeated mistakes)
 *
 * Coverage is intentionally *capped* per category so that drilling one
 * skill alone never reaches "test ready" — variety always matters.
 *
 * Thresholds:
 *   < 70  → "learning"             (keep practising)
 *   70-99 → "test_recommended"     (offer the level check, never force it)
 *   = 100 (after passing test) → "passed_but_can_continue"
 *
 * Backward compatibility:
 *   The old `{ category, completed, total }` rows are mapped via
 *   `progressRowsToInputs()` so existing saved progress still produces a
 *   sensible readiness number.
 */

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const LEVEL_ORDER: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type ReadinessState =
  | "learning"
  | "test_recommended"
  | "passed_but_can_continue";

export type SkillCategory =
  | "vocabulary"
  | "grammar"
  | "sentences"
  | "reading"
  | "listening"
  | "speaking";

export interface ReadinessInputs {
  vocabularyPractice?: number;
  grammarPractice?: number;
  sentenceBuilding?: number;
  reading?: number;
  listening?: number;
  speaking?: number;
  /** 0..1 — average accuracy of recent practice rounds. */
  recentAccuracy?: number;
  /** Count of items the user keeps getting wrong. */
  repeatedMistakes?: number;
  /** Has the user passed the level check for this level? */
  hasPassedLevelTest?: boolean;
}

export interface CategoryBreakdown {
  category: SkillCategory;
  count: number;
  /** 0..100 — share of this category's contribution toward "ready". */
  percentage: number;
}

export interface ReadinessResult {
  level: Level;
  /** 0..100 */
  score: number;
  state: ReadinessState;
  /** Per-category breakdown for UI display. */
  breakdown: CategoryBreakdown[];
  /** Categories with the lowest contribution — good for "practice weak spots". */
  weakSpots: SkillCategory[];
  /** How many distinct skill categories the user has touched. */
  categoriesTouched: number;
  /** Short message key the UI can localise. */
  messageKey:
    | "msgKeepPracticing"
    | "msgTestRecommended"
    | "msgPassedCanContinue";
}

/**
 * Per-CEFR-level "target" amount of practice in each category before
 * the user is considered well-covered. These are *soft* targets used
 * only for normalising into a 0..1 scale, not hard checklists.
 */
const LEVEL_TARGETS: Record<Level, Record<SkillCategory, number>> = {
  A1: { vocabulary: 30, grammar: 6, sentences: 12, reading: 4, listening: 4, speaking: 4 },
  A2: { vocabulary: 45, grammar: 8, sentences: 18, reading: 6, listening: 6, speaking: 6 },
  B1: { vocabulary: 60, grammar: 10, sentences: 24, reading: 8, listening: 8, speaking: 8 },
  B2: { vocabulary: 80, grammar: 12, sentences: 30, reading: 10, listening: 10, speaking: 10 },
  C1: { vocabulary: 100, grammar: 15, sentences: 36, reading: 12, listening: 12, speaking: 12 },
  C2: { vocabulary: 120, grammar: 18, sentences: 42, reading: 14, listening: 14, speaking: 14 },
};

const CATEGORY_WEIGHTS: Record<SkillCategory, number> = {
  vocabulary: 0.22,
  grammar: 0.22,
  sentences: 0.18,
  reading: 0.16,
  listening: 0.11,
  speaking: 0.11,
};

const COVERAGE_WEIGHT = 0.7;
const VARIETY_WEIGHT = 0.15;
const QUALITY_WEIGHT = 0.15;

const TEST_RECOMMENDED_THRESHOLD = 70;

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

export function calculateReadiness(
  level: Level,
  inputs: ReadinessInputs,
): ReadinessResult {
  const targets = LEVEL_TARGETS[level] ?? LEVEL_TARGETS.A1;

  const counts: Record<SkillCategory, number> = {
    vocabulary: Math.max(0, inputs.vocabularyPractice ?? 0),
    grammar: Math.max(0, inputs.grammarPractice ?? 0),
    sentences: Math.max(0, inputs.sentenceBuilding ?? 0),
    reading: Math.max(0, inputs.reading ?? 0),
    listening: Math.max(0, inputs.listening ?? 0),
    speaking: Math.max(0, inputs.speaking ?? 0),
  };

  let coverage = 0;
  const breakdown: CategoryBreakdown[] = [];
  for (const cat of Object.keys(CATEGORY_WEIGHTS) as SkillCategory[]) {
    const target = targets[cat] || 1;
    const ratio = clamp(counts[cat] / target, 0, 1);
    coverage += ratio * CATEGORY_WEIGHTS[cat];
    breakdown.push({
      category: cat,
      count: counts[cat],
      percentage: Math.round(ratio * 100),
    });
  }

  const categoriesTouched = breakdown.filter((b) => b.count > 0).length;
  const variety = clamp(categoriesTouched / 4, 0, 1); // 4+ skill types = full variety

  const accuracy = clamp(inputs.recentAccuracy ?? 0.7, 0, 1);
  const mistakePenalty = clamp((inputs.repeatedMistakes ?? 0) / 20, 0, 0.4);
  const quality = clamp(accuracy - mistakePenalty, 0, 1);

  const raw =
    COVERAGE_WEIGHT * coverage +
    VARIETY_WEIGHT * variety +
    QUALITY_WEIGHT * quality;

  let score = Math.round(clamp(raw, 0, 1) * 100);

  // Require at least 2 skill categories before the user can be "test ready".
  if (categoriesTouched < 2 && score >= TEST_RECOMMENDED_THRESHOLD) {
    score = TEST_RECOMMENDED_THRESHOLD - 1;
  }

  let state: ReadinessResult["state"];
  let messageKey: ReadinessResult["messageKey"];
  if (inputs.hasPassedLevelTest) {
    state = "passed_but_can_continue";
    messageKey = "msgPassedCanContinue";
  } else if (score >= TEST_RECOMMENDED_THRESHOLD) {
    state = "test_recommended";
    messageKey = "msgTestRecommended";
  } else {
    state = "learning";
    messageKey = "msgKeepPracticing";
  }

  const weakSpots = [...breakdown]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 2)
    .filter((b) => b.percentage < 70)
    .map((b) => b.category);

  return {
    level,
    score,
    state,
    breakdown,
    weakSpots,
    categoriesTouched,
    messageKey,
  };
}

/**
 * Map legacy `{ category, completed, total }` rows from the old progress
 * model into readiness inputs so saved progress is preserved.
 */
export function progressRowsToInputs(
  rows: Array<{ category: string; completed: number; total?: number }>,
  extras: Pick<
    ReadinessInputs,
    "recentAccuracy" | "repeatedMistakes" | "hasPassedLevelTest"
  > = {},
): ReadinessInputs {
  const get = (name: string) =>
    rows.find((r) => r.category === name)?.completed ?? 0;
  return {
    vocabularyPractice: get("flashcards") + get("vocabulary"),
    grammarPractice: get("grammar"),
    sentenceBuilding: get("sentences"),
    reading: get("reading"),
    listening: get("listening"),
    speaking: get("speaking"),
    ...extras,
  };
}

export function getNextLevel(level: Level): Level | null {
  const i = LEVEL_ORDER.indexOf(level);
  return i >= 0 && i < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[i + 1] : null;
}
