/**
 * Murciélingo Level Check
 * -----------------------
 * A *separate* assessment flow from regular adaptive practice. The level
 * check is structured (per-section blueprint), single-attempt per item,
 * gives no live hints during the test, and produces a grade-style result
 * with strengths and focus areas.
 *
 * Critically: the level check is NEVER required. Even when readiness
 * suggests it, the user can always decline and keep practicing — that
 * decision is made in the UI, not enforced here.
 *
 * This package is shared by both the web app (`artifacts/murcielago`)
 * and the React Native mobile app (`artifacts/mobile`). It is content-
 * agnostic: callers pass candidate `PracticeItem`s (the same shape used
 * by `@workspace/practice`) and the generator selects items per section.
 */

import type {
  Level,
  PracticeItem,
  SkillCategory,
} from "@workspace/practice";

export type { Level, PracticeItem, SkillCategory } from "@workspace/practice";

// ───────────────────────────────────────────────────────────────────
// Blueprint types
// ───────────────────────────────────────────────────────────────────

/** A single section of a level check blueprint. */
export interface LevelCheckSection {
  /** Stable id for the section (e.g. "vocabulary", "sentence_building"). */
  id: string;
  /** Friendly label shown in result screens. */
  label: { en: string; sv: string };
  /** Skill category candidate items must match. */
  skill: SkillCategory;
  /** Optional subskill / category filter (matches `PracticeItem.category`). */
  subskill?: string;
  /** Number of items to draw for this section. */
  count: number;
  /**
   * Critical-skill minimum (0..1). If the user's accuracy in this
   * section is below this threshold, the overall result is "not passed"
   * even if the total score meets the pass threshold. Default 0.5.
   */
  minAccuracy?: number;
  /**
   * Optional weight for the section in the overall score (defaults to
   * the section's count).
   */
  weight?: number;
}

/** A complete blueprint for a CEFR level check. */
export interface LevelCheckBlueprint {
  level: Level;
  /** Title shown above the test. */
  title: { en: string; sv: string };
  /** One-line description shown to the user before they start. */
  description: { en: string; sv: string };
  sections: LevelCheckSection[];
  /** Pass threshold as a fraction (0..1). Typically 0.75–0.80. */
  passThreshold: number;
}

// ───────────────────────────────────────────────────────────────────
// A1 / A2 initial blueprints
// ───────────────────────────────────────────────────────────────────

export const A1_BLUEPRINT: LevelCheckBlueprint = {
  level: "A1",
  title: { en: "A1 Level Check", sv: "A1-nivåkontroll" },
  description: {
    en: "A short structured check covering A1 essentials. No hints during the test — you'll see results and focus areas at the end.",
    sv: "En kort strukturerad kontroll av A1-grunderna. Inga ledtrådar under testet — du ser resultat och fokusområden i slutet.",
  },
  sections: [
    {
      id: "vocabulary",
      label: { en: "Vocabulary", sv: "Ordförråd" },
      skill: "vocabulary",
      count: 5,
      minAccuracy: 0.4,
    },
    {
      id: "daily_phrases",
      label: { en: "Daily phrases", sv: "Vardagsfraser" },
      skill: "vocabulary",
      subskill: "phrases",
      count: 5,
      minAccuracy: 0.4,
    },
    {
      id: "sentence_building",
      label: { en: "Sentence building", sv: "Meningsbyggnad" },
      skill: "sentences",
      count: 5,
      minAccuracy: 0.4,
    },
    {
      id: "reading_comprehension",
      label: { en: "Reading comprehension", sv: "Läsförståelse" },
      skill: "reading",
      count: 3,
      minAccuracy: 0.34,
    },
    {
      id: "listening_speaking",
      label: { en: "Listening / speaking", sv: "Lyssna / tala" },
      skill: "listening",
      count: 2,
      minAccuracy: 0,
    },
  ],
  passThreshold: 0.75,
};

export const A2_BLUEPRINT: LevelCheckBlueprint = {
  level: "A2",
  title: { en: "A2 Level Check", sv: "A2-nivåkontroll" },
  description: {
    en: "A short structured check covering A2 essentials. No hints during the test — you'll see results and focus areas at the end.",
    sv: "En kort strukturerad kontroll av A2-grunderna. Inga ledtrådar under testet — du ser resultat och fokusområden i slutet.",
  },
  sections: [
    {
      id: "vocabulary",
      label: { en: "Vocabulary", sv: "Ordförråd" },
      skill: "vocabulary",
      count: 5,
      minAccuracy: 0.4,
    },
    {
      id: "grammar",
      label: { en: "Grammar", sv: "Grammatik" },
      skill: "grammar",
      count: 5,
      minAccuracy: 0.4,
    },
    {
      id: "sentence_building",
      label: { en: "Sentence building", sv: "Meningsbyggnad" },
      skill: "sentences",
      count: 5,
      minAccuracy: 0.4,
    },
    {
      id: "short_dialogue",
      label: { en: "Short dialogue", sv: "Kort dialog" },
      skill: "reading",
      subskill: "dialogue",
      count: 3,
      minAccuracy: 0.34,
    },
    {
      id: "practical_scenario",
      label: { en: "Practical scenario", sv: "Praktiskt scenario" },
      skill: "speaking",
      count: 2,
      minAccuracy: 0,
    },
  ],
  passThreshold: 0.75,
};

export const LEVEL_CHECK_BLUEPRINTS: Partial<Record<Level, LevelCheckBlueprint>> = {
  A1: A1_BLUEPRINT,
  A2: A2_BLUEPRINT,
};

export function getLevelCheckBlueprint(
  level: Level,
): LevelCheckBlueprint | null {
  return LEVEL_CHECK_BLUEPRINTS[level] ?? null;
}

// ───────────────────────────────────────────────────────────────────
// Session generator
// ───────────────────────────────────────────────────────────────────

export interface LevelCheckSessionItem<TPayload = unknown> {
  /** Index of the section in the blueprint. */
  sectionIndex: number;
  /** The blueprint section this item belongs to. */
  sectionId: string;
  item: PracticeItem<TPayload>;
}

export interface LevelCheckSession<TPayload = unknown> {
  sessionId: string;
  level: Level;
  blueprint: LevelCheckBlueprint;
  items: LevelCheckSessionItem<TPayload>[];
  /** ms epoch */
  createdAt: number;
  /** Sections that were partially or completely empty after generation. */
  thinSections: string[];
}

export interface BuildLevelCheckOptions<TPayload = unknown> {
  blueprint: LevelCheckBlueprint;
  /** Candidate items, typically from the same source as practice items. */
  items: ReadonlyArray<PracticeItem<TPayload>>;
  now?: number;
  random?: () => number;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateId(rng: () => number): string {
  return (
    "lc_" +
    Date.now().toString(36) +
    "_" +
    Math.floor(rng() * 1e9).toString(36)
  );
}

/**
 * Build a level-check session. For each section, draws `count` items
 * matching the section's skill (and subskill if specified) at the
 * blueprint's level. If the exact filter is too thin, falls back to:
 *   1. same skill at the level, ignoring subskill
 *   2. same skill at any level <= the blueprint level
 *   3. any item at the blueprint level
 * so the test never blocks the user.
 */
export function buildLevelCheckSession<TPayload = unknown>(
  opts: BuildLevelCheckOptions<TPayload>,
): LevelCheckSession<TPayload> {
  const random = opts.random ?? Math.random;
  const now = opts.now ?? Date.now();
  const used = new Set<string>();
  const out: LevelCheckSessionItem<TPayload>[] = [];
  const thin: string[] = [];
  const lvl = opts.blueprint.level;

  const candidates = opts.items.slice();

  opts.blueprint.sections.forEach((section, sectionIndex) => {
    const pickFrom = (pool: PracticeItem<TPayload>[]) => {
      const shuffled = shuffle(pool, random);
      const taken: PracticeItem<TPayload>[] = [];
      for (const it of shuffled) {
        if (taken.length >= section.count) break;
        if (used.has(it.id)) continue;
        taken.push(it);
        used.add(it.id);
      }
      return taken;
    };

    // 1. exact skill + subskill at the blueprint level
    let taken: PracticeItem<TPayload>[] = pickFrom(
      candidates.filter(
        (i) =>
          i.skill === section.skill &&
          i.level === lvl &&
          (section.subskill ? i.category === section.subskill : true),
      ),
    );

    // 2. same skill at the level, ignoring subskill
    if (taken.length < section.count) {
      const more = pickFrom(
        candidates.filter((i) => i.skill === section.skill && i.level === lvl),
      );
      for (const it of more) {
        if (taken.length >= section.count) break;
        taken.push(it);
      }
    }

    // 3. same skill at any level (prefers the same level due to ordering)
    if (taken.length < section.count) {
      const more = pickFrom(
        candidates.filter((i) => i.skill === section.skill),
      );
      for (const it of more) {
        if (taken.length >= section.count) break;
        taken.push(it);
      }
    }

    // 4. last resort: any item at the blueprint level
    if (taken.length < section.count) {
      const more = pickFrom(candidates.filter((i) => i.level === lvl));
      for (const it of more) {
        if (taken.length >= section.count) break;
        taken.push(it);
      }
    }

    if (taken.length < section.count) {
      thin.push(section.id);
    }

    for (const item of taken) {
      out.push({ sectionIndex, sectionId: section.id, item });
    }
  });

  return {
    sessionId: generateId(random),
    level: lvl,
    blueprint: opts.blueprint,
    items: out,
    createdAt: now,
    thinSections: thin,
  };
}

// ───────────────────────────────────────────────────────────────────
// Result evaluator
// ───────────────────────────────────────────────────────────────────

export interface LevelCheckAnswer {
  /** Index in `session.items`. */
  itemIndex: number;
  correct: boolean;
}

export interface LevelCheckSectionResult {
  sectionId: string;
  label: { en: string; sv: string };
  skill: SkillCategory;
  total: number;
  correct: number;
  /** 0..1 */
  accuracy: number;
  /** Section weight used for the overall score. */
  weight: number;
  /** True if section accuracy is below `minAccuracy`. */
  belowMinimum: boolean;
}

export interface LevelCheckResult {
  sessionId: string;
  level: Level;
  passed: boolean;
  /** 0..1 — weighted overall accuracy across sections. */
  overallAccuracy: number;
  passThreshold: number;
  sections: LevelCheckSectionResult[];
  /** Sections the user did well in (accuracy >= 0.8). */
  strengths: LevelCheckSectionResult[];
  /** Sections the user should focus on next. */
  focusAreas: LevelCheckSectionResult[];
  /** True iff at least one critical section was below its minimum. */
  anyBelowMinimum: boolean;
}

export function evaluateLevelCheck<TPayload>(
  session: LevelCheckSession<TPayload>,
  answers: ReadonlyArray<LevelCheckAnswer>,
): LevelCheckResult {
  const ansByIndex = new Map<number, boolean>();
  for (const a of answers) ansByIndex.set(a.itemIndex, a.correct);

  const bySection = new Map<
    string,
    { total: number; correct: number; section: LevelCheckSection }
  >();
  for (const sec of session.blueprint.sections) {
    bySection.set(sec.id, { total: 0, correct: 0, section: sec });
  }

  session.items.forEach((it, idx) => {
    const bucket = bySection.get(it.sectionId);
    if (!bucket) return;
    bucket.total += 1;
    if (ansByIndex.get(idx)) bucket.correct += 1;
  });

  const sections: LevelCheckSectionResult[] = [];
  let weightedSum = 0;
  let weightTotal = 0;
  let anyBelow = false;

  for (const [sectionId, b] of bySection) {
    const accuracy = b.total > 0 ? b.correct / b.total : 0;
    const weight = b.section.weight ?? b.section.count;
    const belowMinimum =
      b.total > 0 &&
      typeof b.section.minAccuracy === "number" &&
      b.section.minAccuracy > 0 &&
      accuracy < b.section.minAccuracy;
    if (belowMinimum) anyBelow = true;
    if (b.total > 0) {
      weightedSum += accuracy * weight;
      weightTotal += weight;
    }
    sections.push({
      sectionId,
      label: b.section.label,
      skill: b.section.skill,
      total: b.total,
      correct: b.correct,
      accuracy,
      weight,
      belowMinimum,
    });
  }

  const overallAccuracy = weightTotal > 0 ? weightedSum / weightTotal : 0;
  const passed =
    overallAccuracy >= session.blueprint.passThreshold && !anyBelow;

  const strengths = sections
    .filter((s) => s.total > 0 && s.accuracy >= 0.8)
    .sort((a, b) => b.accuracy - a.accuracy);
  const focusAreas = sections
    .filter((s) => s.total > 0 && s.accuracy < 0.7)
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    sessionId: session.sessionId,
    level: session.level,
    passed,
    overallAccuracy,
    passThreshold: session.blueprint.passThreshold,
    sections,
    strengths,
    focusAreas,
    anyBelowMinimum: anyBelow,
  };
}

// ───────────────────────────────────────────────────────────────────
// Localised result copy
// ───────────────────────────────────────────────────────────────────

export interface LevelCheckCopy {
  headline: string;
  body: string;
  /**
   * Suggested CTA labels for the result screen. UIs may freely re-order
   * or rename — the strings here are sensible defaults.
   */
  passedActions: { moveUp: string; continue: string; mix: string };
  failedActions: { practiceWeak: string; tryLater: string; continue: string };
}

export function getLevelCheckCopy(
  result: LevelCheckResult,
  language: "en" | "sv",
  nextLevel: Level | null,
): LevelCheckCopy {
  if (language === "sv") {
    return {
      headline: result.passed
        ? `Du klarade ${result.level}-kontrollen.`
        : "Nästan där. Vi stärker några områden först.",
      body: result.passed
        ? `Du fick ${Math.round(result.overallAccuracy * 100)}%. Bra jobbat!`
        : `Du fick ${Math.round(result.overallAccuracy * 100)}%. Tröskeln är ${Math.round(result.passThreshold * 100)}%.`,
      passedActions: {
        moveUp: nextLevel ? `Gå till ${nextLevel}` : "Fortsätt på din nivå",
        continue: `Fortsätt med ${result.level}`,
        mix: nextLevel ? `Mixa ${result.level} + ${nextLevel}` : "Fortsätt öva",
      },
      failedActions: {
        practiceWeak: "Öva svaga områden",
        tryLater: "Prova nivåkontroll igen senare",
        continue: `Fortsätt öva ${result.level}`,
      },
    };
  }
  return {
    headline: result.passed
      ? `You passed the ${result.level} check.`
      : "Almost there. Let's strengthen a few areas first.",
    body: result.passed
      ? `You scored ${Math.round(result.overallAccuracy * 100)}%. Nice work!`
      : `You scored ${Math.round(result.overallAccuracy * 100)}%. The pass threshold is ${Math.round(result.passThreshold * 100)}%.`,
    passedActions: {
      moveUp: nextLevel ? `Move to ${nextLevel}` : "Stay at your level",
      continue: `Continue ${result.level}`,
      mix: nextLevel ? `Mix ${result.level} + ${nextLevel}` : "Keep practicing",
    },
    failedActions: {
      practiceWeak: "Practice weak spots",
      tryLater: "Try another level check later",
      continue: `Continue ${result.level} practice`,
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// Recommendation helper (non-blocking)
// ───────────────────────────────────────────────────────────────────

/**
 * Given a readiness state + level, returns a structured recommendation
 * the UI can render. Returns `null` when no level check is configured
 * for the user's current level (e.g. B1+ until those blueprints exist).
 */
export interface LevelCheckRecommendation {
  /** The blueprint that should be offered. */
  blueprint: LevelCheckBlueprint;
  /** Level the check evaluates (same as blueprint.level). */
  forLevel: Level;
  /** Localised headline copy: "You look ready for the A2 check." */
  headline: { en: string; sv: string };
  /**
   * False whenever readiness is insufficient — the UI should not surface
   * the recommendation but the user can still start a check manually.
   */
  recommended: boolean;
}

export function getLevelCheckRecommendation(
  currentLevel: Level,
  readinessState: "learning" | "test_recommended" | "passed_but_can_continue",
): LevelCheckRecommendation | null {
  const blueprint = getLevelCheckBlueprint(currentLevel);
  if (!blueprint) return null;
  return {
    blueprint,
    forLevel: currentLevel,
    headline: {
      en: `You look ready for the ${currentLevel} check.`,
      sv: `Du verkar redo för ${currentLevel}-kontrollen.`,
    },
    recommended: readinessState === "test_recommended",
  };
}
