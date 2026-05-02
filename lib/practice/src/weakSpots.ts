/**
 * Weak-spot tracking & detection — shared between web and React Native.
 *
 * Pure data + functions. No I/O, no React. Each artifact owns its own
 * persistence layer (localStorage on web, AsyncStorage on mobile) and
 * pipes the resulting `UserPracticeStats` back into the practice engine.
 *
 * The data model is intentionally additive: we extend `UserPracticeStats`
 * with `subskillStats`, while the engine still works for callers that
 * never touch this module.
 */

import type { Level, SkillCategory, UserPracticeStats } from "./index";

// ───────────────────────────────────────────────────────────────────
// Subskill statistics
// ───────────────────────────────────────────────────────────────────

export interface SubskillStat {
  skill: SkillCategory;
  subskill: string;
  /** Most recent level the subskill was practised at. */
  level: Level;
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  /** Last N answers (true=correct), most recent at the end. */
  recentResults: boolean[];
  /** Cached share of `true`s in `recentResults`, 0..1. */
  recentAccuracy: number;
  /** ms epoch */
  lastPracticedAt?: number;
  /** Lifetime miss count. */
  mistakeCount: number;
  /** 0..1 — blends recent accuracy with sample size and a 0.5 prior. */
  confidenceScore: number;
  /** Most recently-missed item ids, newest first, deduped. */
  exampleMissedItemIds: string[];
}

export const SUBSKILL_RECENT_WINDOW = 20;
export const SUBSKILL_MISSED_EXAMPLES = 5;
export const RECENT_MISTAKE_HISTORY = 30;

export function subskillKey(skill: SkillCategory, subskill: string): string {
  return `${skill}/${subskill}`;
}

// ───────────────────────────────────────────────────────────────────
// Result handling
// ───────────────────────────────────────────────────────────────────

export interface RecordAttemptInput {
  itemId: string;
  skill: SkillCategory;
  /** Falls back to `"general"` if the item has no finer category. */
  subskill?: string;
  level: Level;
  correct: boolean;
  /** Inject for tests. */
  now?: number;
}

/**
 * Apply one practice attempt to the stats and return an updated copy.
 * Pure — never mutates the input. Suitable for `setState(prev => ...)`.
 */
export function recordAttempt(
  stats: UserPracticeStats,
  input: RecordAttemptInput,
): UserPracticeStats {
  const now = input.now ?? Date.now();
  const sub = input.subskill?.trim() || "general";
  const key = subskillKey(input.skill, sub);

  // Subskill rollup
  const subskillStats: Record<string, SubskillStat> = {
    ...(stats.subskillStats ?? {}),
  };
  const prev: SubskillStat = subskillStats[key] ?? {
    skill: input.skill,
    subskill: sub,
    level: input.level,
    attempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    recentResults: [],
    recentAccuracy: 0,
    mistakeCount: 0,
    confidenceScore: 0.5,
    exampleMissedItemIds: [],
  };
  const recentResults = [...prev.recentResults, input.correct].slice(
    -SUBSKILL_RECENT_WINDOW,
  );
  const recentCorrect = recentResults.filter(Boolean).length;
  const recentAccuracy = recentResults.length
    ? recentCorrect / recentResults.length
    : 0;
  const sampleWeight = Math.min(1, recentResults.length / 10);
  const confidenceScore = Math.max(
    0,
    Math.min(1, sampleWeight * recentAccuracy + (1 - sampleWeight) * 0.5),
  );

  let exampleMissedItemIds = prev.exampleMissedItemIds;
  if (!input.correct) {
    exampleMissedItemIds = [
      input.itemId,
      ...prev.exampleMissedItemIds.filter((i) => i !== input.itemId),
    ].slice(0, SUBSKILL_MISSED_EXAMPLES);
  }

  subskillStats[key] = {
    skill: input.skill,
    subskill: sub,
    level: input.level,
    attempts: prev.attempts + 1,
    correctAttempts: prev.correctAttempts + (input.correct ? 1 : 0),
    incorrectAttempts: prev.incorrectAttempts + (input.correct ? 0 : 1),
    recentResults,
    recentAccuracy,
    lastPracticedAt: now,
    mistakeCount: prev.mistakeCount + (input.correct ? 0 : 1),
    confidenceScore,
    exampleMissedItemIds,
  };

  // Skill-level accuracy = average across subskills weighted by attempts.
  const skillAccuracy: Partial<Record<SkillCategory, number>> = {
    ...(stats.skillAccuracy ?? {}),
  };
  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const s of Object.values(subskillStats)) {
    if (s.skill !== input.skill) continue;
    totalAttempts += s.attempts;
    totalCorrect += s.correctAttempts;
  }
  if (totalAttempts > 0) {
    skillAccuracy[input.skill] = totalCorrect / totalAttempts;
  }

  // Item stats
  const itemStats = { ...(stats.itemStats ?? {}) };
  const prevItem = itemStats[input.itemId] ?? {
    timesSeen: 0,
    timesCorrect: 0,
    timesWrong: 0,
  };
  itemStats[input.itemId] = {
    ...prevItem,
    timesSeen: prevItem.timesSeen + 1,
    timesCorrect: prevItem.timesCorrect + (input.correct ? 1 : 0),
    timesWrong: prevItem.timesWrong + (input.correct ? 0 : 1),
    lastSeenAt: now,
  };

  // Recent mistake ring buffer
  let recentMistakeIds = stats.recentMistakeIds ?? [];
  if (!input.correct) {
    recentMistakeIds = [
      input.itemId,
      ...recentMistakeIds.filter((i) => i !== input.itemId),
    ].slice(0, RECENT_MISTAKE_HISTORY);
  }

  return {
    ...stats,
    subskillStats,
    skillAccuracy,
    itemStats,
    recentMistakeIds,
  };
}

// ───────────────────────────────────────────────────────────────────
// Detection
// ───────────────────────────────────────────────────────────────────

export type WeakSpotReason =
  | "low_accuracy"
  | "repeated_misses"
  | "low_confidence"
  | "stale";

export type WeakSpotLabel =
  | "needs_practice"
  | "good_to_review"
  | "getting_stronger"
  | "focus_area";

export interface WeakSpot {
  key: string;
  skill: SkillCategory;
  subskill: string;
  level: Level;
  reasons: WeakSpotReason[];
  recentAccuracy: number;
  confidenceScore: number;
  mistakeCount: number;
  attempts: number;
  lastPracticedAt?: number;
  exampleMissedItemIds: string[];
  /** 0..1 sortable severity. */
  severity: number;
  /** Friendly bucket the UI can colour-code. */
  label: WeakSpotLabel;
}

export interface DetectWeakSpotsOptions {
  now?: number;
  /** Below this rolling accuracy = weak. Default 0.7 */
  lowAccuracyThreshold?: number;
  /** Below this confidence = weak. Default 0.55 */
  lowConfidenceThreshold?: number;
  /** A subskill is "stale" after this many ms without practice. Default 7d */
  staleAfterMs?: number;
  /** Min attempts before considering a subskill at all. Default 3 */
  minAttempts?: number;
  /** Lifetime miss threshold for "repeated_misses". Default 3 */
  mistakeThreshold?: number;
}

export const DEFAULT_LOW_ACCURACY = 0.7;
export const DEFAULT_LOW_CONFIDENCE = 0.55;
export const DEFAULT_STALE_MS = 1000 * 60 * 60 * 24 * 7;

export function detectWeakSpots(
  stats: UserPracticeStats,
  opts: DetectWeakSpotsOptions = {},
): WeakSpot[] {
  const now = opts.now ?? Date.now();
  const lowAcc = opts.lowAccuracyThreshold ?? DEFAULT_LOW_ACCURACY;
  const lowConf = opts.lowConfidenceThreshold ?? DEFAULT_LOW_CONFIDENCE;
  const staleMs = opts.staleAfterMs ?? DEFAULT_STALE_MS;
  const minAttempts = opts.minAttempts ?? 3;
  const mistakeThreshold = opts.mistakeThreshold ?? 3;

  const out: WeakSpot[] = [];
  const subs = stats.subskillStats ?? {};
  for (const key of Object.keys(subs)) {
    const s = subs[key];
    if (s.attempts < minAttempts) continue;

    const reasons: WeakSpotReason[] = [];
    if (s.recentAccuracy < lowAcc) reasons.push("low_accuracy");
    if (
      s.exampleMissedItemIds.length >= 2 ||
      s.mistakeCount >= mistakeThreshold
    ) {
      reasons.push("repeated_misses");
    }
    if (s.confidenceScore < lowConf) reasons.push("low_confidence");
    if (s.lastPracticedAt && now - s.lastPracticedAt > staleMs) {
      reasons.push("stale");
    }
    if (reasons.length === 0) continue;

    const accGap = Math.max(0, lowAcc - s.recentAccuracy);
    const confGap = Math.max(0, lowConf - s.confidenceScore);
    const mistakeWeight = Math.min(0.3, s.mistakeCount / 30);
    const staleWeight = reasons.includes("stale") ? 0.2 : 0;
    const severity = Math.max(
      0,
      Math.min(1, accGap * 0.9 + confGap * 0.6 + mistakeWeight + staleWeight),
    );

    let label: WeakSpotLabel;
    if (severity >= 0.45 || s.recentAccuracy < 0.4) label = "focus_area";
    else if (s.recentAccuracy < 0.6) label = "needs_practice";
    else if (s.recentAccuracy < lowAcc) label = "good_to_review";
    else label = "getting_stronger";

    out.push({
      key,
      skill: s.skill,
      subskill: s.subskill,
      level: s.level,
      reasons,
      recentAccuracy: s.recentAccuracy,
      confidenceScore: s.confidenceScore,
      mistakeCount: s.mistakeCount,
      attempts: s.attempts,
      lastPracticedAt: s.lastPracticedAt,
      exampleMissedItemIds: s.exampleMissedItemIds.slice(),
      severity,
      label,
    });
  }
  out.sort((a, b) => b.severity - a.severity);
  return out;
}

// ───────────────────────────────────────────────────────────────────
// Friendly labels
// ───────────────────────────────────────────────────────────────────

export const SUBSKILL_LABELS: Record<string, { en: string; sv: string }> = {
  noun_gender: { en: "noun gender", sv: "substantivets genus" },
  plurals: { en: "plural forms", sv: "pluralformer" },
  plural_forms: { en: "plural forms", sv: "pluralformer" },
  ser_estar: { en: "ser vs estar", sv: "ser vs estar" },
  ser_vs_estar: { en: "ser vs estar", sv: "ser vs estar" },
  question_word_order: {
    en: "question word order",
    sv: "frågeordföljd",
  },
  verb_present: { en: "present-tense verbs", sv: "presens verb" },
  present_tense_ar_verbs: {
    en: "present tense -ar verbs",
    sv: "presens -ar verb",
  },
  basic_prepositions: {
    en: "basic prepositions",
    sv: "grundläggande prepositioner",
  },
  food_drink: { en: "café phrases", sv: "kafé-fraser" },
  household: { en: "household words", sv: "hushållsord" },
  greetings: { en: "greetings", sv: "hälsningar" },
  daily_phrases: { en: "everyday phrases", sv: "vardagliga fraser" },
  scenarios: { en: "real situations", sv: "verkliga situationer" },
  expressing_wants: { en: "expressing wants", sv: "att uttrycka önskemål" },
  describing_actions: {
    en: "describing actions",
    sv: "att beskriva handlingar",
  },
  shopping_phrases: { en: "shopping phrases", sv: "shoppingfraser" },
  restaurant_phrases: { en: "restaurant phrases", sv: "restaurangfraser" },
  pronunciation_confidence: {
    en: "pronunciation confidence",
    sv: "uttalssäkerhet",
  },
  general: { en: "general practice", sv: "allmän övning" },
};

export function friendlySubskillName(
  subskill: string,
  lang: "en" | "sv" = "en",
): string {
  const known = SUBSKILL_LABELS[subskill];
  if (known) return known[lang];
  return subskill.replace(/_/g, " ");
}

const SKILL_LABELS: Record<SkillCategory, { en: string; sv: string }> = {
  vocabulary: { en: "vocabulary", sv: "ordförråd" },
  grammar: { en: "grammar", sv: "grammatik" },
  sentences: { en: "sentence building", sv: "meningsbyggnad" },
  reading: { en: "reading", sv: "läsning" },
  listening: { en: "listening", sv: "hörförståelse" },
  speaking: { en: "speaking", sv: "tal" },
};

export function friendlySkillName(
  skill: SkillCategory,
  lang: "en" | "sv" = "en",
): string {
  return SKILL_LABELS[skill][lang];
}

const LABEL_TEXT: Record<WeakSpotLabel, { en: string; sv: string }> = {
  needs_practice: { en: "Needs practice", sv: "Behöver övning" },
  good_to_review: { en: "Good to review", sv: "Bra att repetera" },
  getting_stronger: { en: "Getting stronger", sv: "Blir starkare" },
  focus_area: { en: "Focus area", sv: "Fokusområde" },
};

export function friendlyLabel(
  label: WeakSpotLabel,
  lang: "en" | "sv" = "en",
): string {
  return LABEL_TEXT[label][lang];
}

// ───────────────────────────────────────────────────────────────────
// Today's focus message
// ───────────────────────────────────────────────────────────────────

export interface TodaysFocusMessage {
  en: string;
  sv: string;
}

export interface BuildTodaysFocusOptions {
  weakSpots?: WeakSpot[];
  now?: number;
  /** Max subskills to mention in the message. Default 2. */
  max?: number;
}

export function buildTodaysFocusMessage(
  stats: UserPracticeStats,
  opts: BuildTodaysFocusOptions = {},
): TodaysFocusMessage {
  const weakSpots =
    opts.weakSpots ?? detectWeakSpots(stats, { now: opts.now });
  const max = Math.max(1, opts.max ?? 2);

  if (weakSpots.length === 0) {
    const acc = stats.skillAccuracy ?? {};
    const entries = (Object.entries(acc) as [SkillCategory, number][]).filter(
      (e) => typeof e[1] === "number",
    );
    const strong = entries
      .filter(([, v]) => v >= 0.8)
      .sort((a, b) => b[1] - a[1])[0];
    const weakSkill = entries
      .filter(([, v]) => v < 0.7)
      .sort((a, b) => a[1] - b[1])[0];
    if (strong && weakSkill && strong[0] !== weakSkill[0]) {
      return {
        en: `You're strong in ${friendlySkillName(strong[0], "en")}. Let's strengthen ${friendlySkillName(weakSkill[0], "en")}.`,
        sv: `Du är stark i ${friendlySkillName(strong[0], "sv")}. Låt oss stärka ${friendlySkillName(weakSkill[0], "sv")}.`,
      };
    }
    return {
      en: "Today's focus: a balanced mix to keep your skills sharp.",
      sv: "Dagens fokus: en balanserad mix för att hålla dina färdigheter skarpa.",
    };
  }

  const top = weakSpots.slice(0, max);
  const namesEn = top.map((w) => friendlySubskillName(w.subskill, "en"));
  const namesSv = top.map((w) => friendlySubskillName(w.subskill, "sv"));
  const join = (names: string[], conj: string) =>
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} ${conj} ${names[names.length - 1]}`;
  return {
    en: `Today's focus: ${join(namesEn, "and")}.`,
    sv: `Dagens fokus: ${join(namesSv, "och")}.`,
  };
}
