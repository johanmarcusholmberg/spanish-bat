/**
 * Murciélingo Adaptive Practice Session Engine
 * --------------------------------------------
 * Builds a fresh practice session every time the user starts practising,
 * instead of treating practice as a fixed list. The engine is shared by
 * both the web app and the React Native mobile app, and is intentionally
 * agnostic of any particular content shape — callers pass in candidate
 * `PracticeItem`s with an opaque `payload`, and receive back an ordered
 * `PracticeSession` to render however they like.
 *
 * Highlights:
 * - Six practice modes: quick, weak_spots, level, review_previous,
 *   test_prep, challenge.
 * - Score-based selection (weak skill match, due review, level fit,
 *   recent mistakes, repetition penalty, variety bonus).
 * - Never returns "no questions" if any candidate item exists. If a
 *   category is too thin, the engine widens the level / skill mix
 *   automatically and reshuffles with spacing rules instead of blocking.
 */

import { detectWeakSpots, subskillKey } from "./weakSpots";
import { isDue, type SrsState } from "./srs";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const LEVEL_ORDER: readonly Level[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type SkillCategory =
  | "vocabulary"
  | "grammar"
  | "sentences"
  | "reading"
  | "listening"
  | "speaking";

export type PracticeMode =
  | "quick"
  | "weak_spots"
  | "level"
  | "review_previous"
  | "test_prep"
  | "challenge"
  | "due_review";

export interface PracticeItem<TPayload = unknown> {
  /** Stable id for de-duplication, spacing, and stats lookup. */
  id: string;
  skill: SkillCategory;
  level: Level;
  /** Optional finer-grained sub-category (e.g. "greetings", "ser_estar"). */
  category?: string;
  /** Optional difficulty hint, 1 = easy, 3 = hard. */
  difficulty?: 1 | 2 | 3;
  /** Opaque payload — the renderer interprets this. */
  payload: TPayload;
}

export interface ItemStat {
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  /** ms epoch */
  lastSeenAt?: number;
  /** ms epoch — set by SRS-style logic if available. */
  nextReviewAt?: number;
}

export interface UserPracticeStats {
  /** Per-item performance/SRS history. */
  itemStats?: Record<string, ItemStat>;
  /** Per-skill rolling accuracy 0..1. Lower = weaker. */
  skillAccuracy?: Partial<Record<SkillCategory, number>>;
  /** Item ids the user got wrong recently (most recent first). */
  recentMistakeIds?: string[];
  /**
   * Per skill+subskill performance, populated by `recordAttempt`. Keyed
   * by `${skill}/${subskill}`. Used by `detectWeakSpots` and by the
   * session engine's weak-subskill scoring bonus.
   */
  subskillStats?: Record<string, import("./weakSpots").SubskillStat>;
  /**
   * Per-item SM-2-lite spaced repetition schedule, keyed by item id.
   * Populated by `recordAttempt`. Items with no entry are treated as
   * brand-new (i.e. immediately due) by the SRS layer.
   */
  itemSchedule?: Record<string, SrsState>;
}

export interface BuildSessionOptions<TPayload = unknown> {
  mode: PracticeMode;
  level: Level;
  /** All available candidate items across every skill/level. */
  items: ReadonlyArray<PracticeItem<TPayload>>;
  stats?: UserPracticeStats;
  /** Override default size for the mode. */
  size?: number;
  /** Inject for testing. */
  now?: number;
  random?: () => number;
}

export interface PracticeSession<TPayload = unknown> {
  sessionId: string;
  mode: PracticeMode;
  level: Level;
  items: PracticeItem<TPayload>[];
  /** ms epoch */
  createdAt: number;
  focusSkills: SkillCategory[];
  /** Estimated session duration in seconds. */
  estimatedDuration: number;
  /** Human-readable, locale-agnostic explanation. UI may localise. */
  reasonForSelection: string;
}

// ───────────────────────────────────────────────────────────────────
// Internal helpers
// ───────────────────────────────────────────────────────────────────

const DEFAULT_SIZE: Record<PracticeMode, number> = {
  quick: 5,
  weak_spots: 8,
  level: 8,
  review_previous: 8,
  test_prep: 10,
  challenge: 8,
  due_review: 10,
};

const SECONDS_PER_ITEM = 25;

const WEAK_SKILL_ACCURACY = 0.7; // below this = "weak"
const REPETITION_RECENT_MS = 1000 * 60 * 60 * 24; // 24h window for repetition penalty

interface InternalCtx {
  now: number;
  random: () => number;
  stats: UserPracticeStats;
  weakSkills: Set<SkillCategory>;
  weakSubskills: Set<string>;
  recentMistakeIds: Set<string>;
}

function levelIndex(level: Level): number {
  return LEVEL_ORDER.indexOf(level);
}

function weakSkillsFromStats(stats: UserPracticeStats): Set<SkillCategory> {
  const out = new Set<SkillCategory>();
  const acc = stats.skillAccuracy ?? {};
  for (const skill of Object.keys(acc) as SkillCategory[]) {
    const v = acc[skill];
    if (typeof v === "number" && v < WEAK_SKILL_ACCURACY) out.add(skill);
  }
  // If we have no accuracy data, treat nothing as "weak" — selection
  // will fall back to other signals (recent mistakes, due reviews).
  return out;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateSessionId(rng: () => number): string {
  return (
    "ps_" +
    Date.now().toString(36) +
    "_" +
    Math.floor(rng() * 1e9).toString(36)
  );
}

// ───────────────────────────────────────────────────────────────────
// Scoring
// ───────────────────────────────────────────────────────────────────

export interface ItemScoreBreakdown {
  weakSkill: number;
  weakSubskill: number;
  dueForReview: number;
  levelMatch: number;
  recentMistake: number;
  repetitionPenalty: number;
  varietyJitter: number;
  difficulty: number;
  total: number;
}

export function scoreItem<TPayload>(
  item: PracticeItem<TPayload>,
  mode: PracticeMode,
  level: Level,
  ctx: InternalCtx,
): ItemScoreBreakdown {
  const stat = ctx.stats.itemStats?.[item.id];
  const userIdx = levelIndex(level);
  const itemIdx = levelIndex(item.level);

  // Weak skill match
  const weakSkill = ctx.weakSkills.has(item.skill) ? 30 : 0;

  // Weak-subskill match (item.category interpreted as subskill).
  // Mirror recordAttempt's normalization so missing categories map to "general".
  const subKey = subskillKey(item.skill, item.category ?? "general");
  const weakSubskill = ctx.weakSubskills.has(subKey)
    ? mode === "weak_spots"
      ? 36
      : 22
    : 0;

  // Due-for-review (SRS). Prefer the per-item schedule when present.
  let dueForReview = 0;
  const sched = ctx.stats.itemSchedule?.[item.id];
  const dueByScheduleAt = sched?.nextReviewAt;
  const dueByLegacyAt = stat?.nextReviewAt;
  const dueAt = dueByScheduleAt ?? dueByLegacyAt;
  if (dueAt !== undefined && dueAt <= ctx.now) {
    // In due_review mode this is the *whole point*, so weight it heavily.
    dueForReview = mode === "due_review" ? 60 : 22;
    // Extra nudge for items that have been overdue for a while.
    const overdueDays = Math.max(0, (ctx.now - dueAt) / (24 * 60 * 60 * 1000));
    if (overdueDays > 0) {
      dueForReview += Math.min(20, Math.round(overdueDays * 2));
    }
  } else if (!stat || stat.timesSeen === 0) {
    // Brand-new content gets a small bump so it isn't drowned out — but
    // not in due_review mode, where the user explicitly wants reviews.
    dueForReview = mode === "due_review" ? 0 : 8;
  }

  // Level match (mode-dependent)
  let levelMatch = 0;
  if (itemIdx === userIdx) {
    levelMatch =
      mode === "level" || mode === "test_prep"
        ? 30
        : mode === "challenge"
          ? 18
          : mode === "review_previous"
            ? 0
            : mode === "due_review"
              ? 6 // small bump; due_review picks by schedule, not level
              : 18;
  } else if (itemIdx < userIdx) {
    levelMatch =
      mode === "review_previous"
        ? 26
        : mode === "test_prep"
          ? 8
          : mode === "level"
            ? 2
            : mode === "due_review"
              ? 6
              : 10;
  } else if (itemIdx === userIdx + 1) {
    levelMatch = mode === "challenge" ? 22 : -40; // preview only in challenge
  } else {
    levelMatch = -100; // too far above level — effectively excluded
  }

  // Recent mistake bonus
  const recentMistake = ctx.recentMistakeIds.has(item.id) ? 28 : 0;

  // Repetition penalty (recently seen same item)
  let repetitionPenalty = 0;
  if (stat?.lastSeenAt) {
    const age = ctx.now - stat.lastSeenAt;
    if (age < REPETITION_RECENT_MS) {
      // Up to -25 if seen in the last hour, decaying to ~0 at 24h.
      const closeness = 1 - age / REPETITION_RECENT_MS;
      repetitionPenalty = -Math.round(25 * closeness);
    }
  }
  if (stat && stat.timesSeen > 0) {
    // Tiny extra penalty for very heavy seen-counts, to encourage variety.
    repetitionPenalty -= Math.min(8, Math.floor(stat.timesSeen / 3));
  }

  // Difficulty preference (challenge favours harder, others favour mid)
  let difficulty = 0;
  if (typeof item.difficulty === "number") {
    if (mode === "challenge") difficulty = (item.difficulty - 1) * 6;
    else if (mode === "quick") difficulty = item.difficulty === 1 ? 4 : 0;
    else difficulty = item.difficulty === 2 ? 4 : 0;
  }

  // Small random jitter for variety / shuffling between equivalent items.
  const varietyJitter = Math.round(ctx.random() * 6);

  const total =
    weakSkill +
    weakSubskill +
    dueForReview +
    levelMatch +
    recentMistake +
    repetitionPenalty +
    varietyJitter +
    difficulty;

  return {
    weakSkill,
    weakSubskill,
    dueForReview,
    levelMatch,
    recentMistake,
    repetitionPenalty,
    varietyJitter,
    difficulty,
    total,
  };
}

// ───────────────────────────────────────────────────────────────────
// Mode-specific candidate filtering
// ───────────────────────────────────────────────────────────────────

function modeCandidates<TPayload>(
  items: ReadonlyArray<PracticeItem<TPayload>>,
  mode: PracticeMode,
  level: Level,
): PracticeItem<TPayload>[] {
  const userIdx = levelIndex(level);

  switch (mode) {
    case "quick":
      // current + previous + a sprinkle of next-level if user is below C2
      return items.filter(
        (i) => levelIndex(i.level) <= Math.min(userIdx + 1, LEVEL_ORDER.length - 1),
      );
    case "weak_spots":
      return items.filter((i) => levelIndex(i.level) <= userIdx);
    case "level":
      return items.filter((i) => i.level === level);
    case "review_previous":
      return items.filter((i) => levelIndex(i.level) < userIdx);
    case "test_prep":
      return items.filter((i) => levelIndex(i.level) <= userIdx);
    case "challenge":
      return items.filter(
        (i) => levelIndex(i.level) <= Math.min(userIdx + 1, LEVEL_ORDER.length - 1),
      );
    case "due_review":
      return items.filter((i) => levelIndex(i.level) <= userIdx);
    default:
      return items.slice();
  }
}

// ───────────────────────────────────────────────────────────────────
// Selection with widening fallback
// ───────────────────────────────────────────────────────────────────

function widenIfTooThin<TPayload>(
  candidates: PracticeItem<TPayload>[],
  all: ReadonlyArray<PracticeItem<TPayload>>,
  mode: PracticeMode,
  level: Level,
  targetSize: number,
): PracticeItem<TPayload>[] {
  if (candidates.length >= targetSize) return candidates;

  // Try widening rules in order of "least surprising" to "most permissive".
  const widened = new Set<PracticeItem<TPayload>>(candidates);
  const userIdx = levelIndex(level);

  // 1. Mix in previous levels.
  if (widened.size < targetSize) {
    for (const it of all) {
      if (levelIndex(it.level) < userIdx) widened.add(it);
      if (widened.size >= targetSize * 2) break;
    }
  }

  // 2. Mix in current level (covers review_previous when it's too thin).
  if (widened.size < targetSize) {
    for (const it of all) {
      if (it.level === level) widened.add(it);
      if (widened.size >= targetSize * 2) break;
    }
  }

  // 3. As a last resort, allow next-level items even if mode wouldn't.
  if (widened.size < targetSize && mode !== "challenge") {
    for (const it of all) {
      if (levelIndex(it.level) === userIdx + 1) widened.add(it);
      if (widened.size >= targetSize * 2) break;
    }
  }

  // 4. Truly any item — better than a dead-end.
  if (widened.size < targetSize) {
    for (const it of all) {
      widened.add(it);
      if (widened.size >= targetSize * 2) break;
    }
  }

  return Array.from(widened);
}

function pickWithVariety<TPayload>(
  scored: { item: PracticeItem<TPayload>; score: number }[],
  size: number,
  rng: () => number,
): PracticeItem<TPayload>[] {
  // Sort by score desc; take a top window then shuffle slightly to avoid
  // identical sessions every time.
  const sorted = scored.slice().sort((a, b) => b.score - a.score);
  const window = sorted.slice(0, Math.max(size * 3, size + 4));
  const shuffled = shuffle(window, rng);

  const picked: PracticeItem<TPayload>[] = [];
  const seenSkills: SkillCategory[] = [];
  const seenIds = new Set<string>();

  // First pass: enforce variety — try not to pick more than ceil(size/2)
  // of any single skill.
  const maxPerSkill = Math.max(2, Math.ceil(size / 2));
  const skillCounts = new Map<SkillCategory, number>();

  for (const { item } of shuffled) {
    if (picked.length >= size) break;
    if (seenIds.has(item.id)) continue;
    const cnt = skillCounts.get(item.skill) ?? 0;
    if (cnt >= maxPerSkill) continue;
    picked.push(item);
    seenIds.add(item.id);
    skillCounts.set(item.skill, cnt + 1);
    if (!seenSkills.includes(item.skill)) seenSkills.push(item.skill);
  }

  // Second pass: top up if variety constraint left us short.
  if (picked.length < size) {
    for (const { item } of shuffled) {
      if (picked.length >= size) break;
      if (seenIds.has(item.id)) continue;
      picked.push(item);
      seenIds.add(item.id);
    }
  }

  return picked;
}

function describeReason(mode: PracticeMode, focus: SkillCategory[]): string {
  const focusStr =
    focus.length === 0
      ? "a balanced mix of skills"
      : focus.length === 1
        ? `your ${focus[0]} skills`
        : `${focus.slice(0, -1).join(", ")} and ${focus[focus.length - 1]}`;
  switch (mode) {
    case "quick":
      return `A short mixed session covering ${focusStr}.`;
    case "weak_spots":
      return `Focused on ${focusStr} where you've been less accurate.`;
    case "level":
      return `Practice from your current level, focused on ${focusStr}.`;
    case "review_previous":
      return `Reviewing earlier levels to strengthen ${focusStr}.`;
    case "test_prep":
      return `A balanced set that resembles the level check across ${focusStr}.`;
    case "challenge":
      return `A tougher session — current level and a preview of what's next, in ${focusStr}.`;
    default:
      return `A mixed practice session covering ${focusStr}.`;
  }
}

// ───────────────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────────────

export function buildPracticeSession<TPayload = unknown>(
  opts: BuildSessionOptions<TPayload>,
): PracticeSession<TPayload> {
  const now = opts.now ?? Date.now();
  const random = opts.random ?? Math.random;
  const stats: UserPracticeStats = opts.stats ?? {};
  const size = Math.max(1, opts.size ?? DEFAULT_SIZE[opts.mode]);

  const weakSpots = detectWeakSpots(stats, { now });
  const ctx: InternalCtx = {
    now,
    random,
    stats,
    weakSkills: weakSkillsFromStats(stats),
    weakSubskills: new Set(weakSpots.map((w) => subskillKey(w.skill, w.subskill))),
    recentMistakeIds: new Set(stats.recentMistakeIds ?? []),
  };

  // 1. Mode-filtered candidates, widened if the pool is too thin.
  let candidates = modeCandidates(opts.items, opts.mode, opts.level);
  candidates = widenIfTooThin(candidates, opts.items, opts.mode, opts.level, size);

  // 2. Score everything.
  const scored = candidates.map((item) => ({
    item,
    score: scoreItem(item, opts.mode, opts.level, ctx).total,
  }));

  // 3. Pick with variety constraint.
  let picked = pickWithVariety(scored, size, random);

  // 4. If we *still* have nothing (truly empty pool), fall back to anything
  //    we can find — never block. The caller decides whether to surface a
  //    "content is being prepared" empty state when items.length === 0.
  if (picked.length === 0 && opts.items.length > 0) {
    picked = shuffle(opts.items.slice(), random).slice(0, size);
  }

  // 5. Light shuffle of final order for variety, but keep the very top
  //    item first so the user starts with the strongest match.
  if (picked.length > 2) {
    const head = picked[0];
    const rest = shuffle(picked.slice(1), random);
    picked = [head, ...rest];
  }

  const focusSkills = Array.from(new Set(picked.map((p) => p.skill)));

  return {
    sessionId: generateSessionId(random),
    mode: opts.mode,
    level: opts.level,
    items: picked,
    createdAt: now,
    focusSkills,
    estimatedDuration: picked.length * SECONDS_PER_ITEM,
    reasonForSelection: describeReason(opts.mode, focusSkills),
  };
}

/**
 * Convenience: list all practice modes with display metadata. UIs can map
 * over this to render the mode selector.
 */
export interface PracticeModeMeta {
  mode: PracticeMode;
  title: string;
  description: string;
  /** Approximate number of items for this mode at default size. */
  defaultSize: number;
}

export interface PracticeModeMetaWithTime extends PracticeModeMeta {
  estimatedMinutes: number;
}

function estimateMinutes(size: number): number {
  return Math.max(1, Math.round((size * SECONDS_PER_ITEM) / 60));
}

export const PRACTICE_MODES: readonly PracticeModeMetaWithTime[] = [
  {
    mode: "quick",
    title: "Quick practice",
    description: "A short mixed session — perfect when you only have a minute.",
    defaultSize: DEFAULT_SIZE.quick,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.quick),
  },
  {
    mode: "weak_spots",
    title: "Weak spots",
    description: "Gentle drills on the things you're still building.",
    defaultSize: DEFAULT_SIZE.weak_spots,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.weak_spots),
  },
  {
    mode: "level",
    title: "Level practice",
    description: "Stay in your current level and build confidence.",
    defaultSize: DEFAULT_SIZE.level,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.level),
  },
  {
    mode: "review_previous",
    title: "Review",
    description: "Revisit earlier levels to keep your foundations warm.",
    defaultSize: DEFAULT_SIZE.review_previous,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.review_previous),
  },
  {
    mode: "test_prep",
    title: "Test prep",
    description: "A balanced set that feels like the level check.",
    defaultSize: DEFAULT_SIZE.test_prep,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.test_prep),
  },
  {
    mode: "challenge",
    title: "Challenge me",
    description: "A tougher mix with a peek at the next level.",
    defaultSize: DEFAULT_SIZE.challenge,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.challenge),
  },
  {
    mode: "due_review",
    title: "Daily review",
    description: "Items your brain is ready to refresh today.",
    defaultSize: DEFAULT_SIZE.due_review,
    estimatedMinutes: estimateMinutes(DEFAULT_SIZE.due_review),
  },
] as const;

export const EMPTY_STATE_MESSAGE =
  "Practice content is being prepared. Try mixed review or check your connection.";

// ───────────────────────────────────────────────────────────────────
// Recommendation: which mode should we suggest right now?
// ───────────────────────────────────────────────────────────────────

export type ReadinessLikeState =
  | "learning"
  | "test_recommended"
  | "passed_but_can_continue";

export interface RecommendModeOptions {
  stats?: UserPracticeStats;
  weakSpots?: import("./weakSpots").WeakSpot[];
  /** Optional readiness signal from `@workspace/readiness`. */
  readinessState?: ReadinessLikeState;
  /** True if the user has practiced at all today. */
  practicedToday?: boolean;
  /**
   * How many SRS-scheduled items are due right now. When ≥5 the
   * recommender prefers `due_review` over the heuristic modes.
   */
  dueCount?: number;
  /** Trigger `due_review` once at least this many items are due. Default 5. */
  dueRecommendThreshold?: number;
  now?: number;
}

export interface RecommendedMode {
  mode: PracticeMode;
  /** Short, warm reason ("why this") in EN/SV. */
  reason: { en: string; sv: string };
}

export function recommendPracticeMode(
  opts: RecommendModeOptions = {},
): RecommendedMode {
  const weak = opts.weakSpots ?? [];
  const dueThreshold = opts.dueRecommendThreshold ?? 5;
  const due = opts.dueCount ?? 0;
  // test_prep takes precedence when the user is on the cusp of a level check —
  // we don't want to bury that signal under a long review queue.
  if (opts.readinessState === "test_recommended") {
    return {
      mode: "test_prep",
      reason: {
        en: "You look ready for a level check — let's warm up with a balanced set.",
        sv: "Du verkar redo för en nivåkoll — vi värmer upp med en balanserad mix.",
      },
    };
  }
  if (due >= dueThreshold) {
    return {
      mode: "due_review",
      reason: {
        en: `${due} items are ready for a quick review.`,
        sv: `${due} saker är redo för en snabb repetition.`,
      },
    };
  }
  if (weak.length >= 2) {
    return {
      mode: "weak_spots",
      reason: {
        en: "A few areas could use a friendly review today.",
        sv: "Några områden kan behöva en mjuk repetition idag.",
      },
    };
  }
  if (opts.readinessState === "passed_but_can_continue") {
    return {
      mode: "challenge",
      reason: {
        en: "You're cruising — try a slightly harder mix to stretch a little.",
        sv: "Det rullar på — testa en lite svårare mix för att tänja på det.",
      },
    };
  }
  if (opts.practicedToday === false) {
    return {
      mode: "quick",
      reason: {
        en: "A short session is a great way to start the day.",
        sv: "En kort session är ett bra sätt att börja dagen.",
      },
    };
  }
  return {
    mode: "level",
    reason: {
      en: "Let's keep building at your current level.",
      sv: "Vi fortsätter bygga på din nuvarande nivå.",
    },
  };
}

export function getPracticeModeMeta(
  mode: PracticeMode,
): PracticeModeMetaWithTime {
  return PRACTICE_MODES.find((m) => m.mode === mode) ?? PRACTICE_MODES[0];
}

/**
 * Return practice items that are due for SRS review at `now`, sorted
 * most-overdue first. Items without a schedule entry are treated as
 * brand-new and considered due (so first-time encounters surface here
 * too — they're "due" in the loose sense of "haven't been seen").
 */
export interface GetDueItemsOptions {
  now?: number;
  /** Cap on returned items. Default Infinity. */
  max?: number;
  /** When false (default), brand-new items (no schedule yet) are skipped. */
  includeNew?: boolean;
}

/**
 * Lightweight count of items currently due for review. Prefers the SRS
 * `itemSchedule`, but for backward compatibility (pre-Phase-20 stats blobs)
 * also counts legacy `itemStats[id].nextReviewAt <= now`. The two sources
 * are unioned by item id so a mirrored entry isn't double-counted.
 */
export function countDueItems(
  stats: UserPracticeStats,
  opts: { now?: number } = {},
): number {
  const now = opts.now ?? Date.now();
  const seen = new Set<string>();
  let n = 0;
  const sched = stats.itemSchedule ?? {};
  for (const id of Object.keys(sched)) {
    if (sched[id].nextReviewAt <= now) {
      seen.add(id);
      n++;
    }
  }
  const legacy = stats.itemStats ?? {};
  for (const id of Object.keys(legacy)) {
    if (seen.has(id)) continue;
    const due = legacy[id]?.nextReviewAt;
    if (typeof due === "number" && due <= now) n++;
  }
  return n;
}

export function getDueItems<TPayload>(
  stats: UserPracticeStats,
  items: ReadonlyArray<PracticeItem<TPayload>>,
  opts: GetDueItemsOptions = {},
): PracticeItem<TPayload>[] {
  const now = opts.now ?? Date.now();
  const max = opts.max ?? Infinity;
  const includeNew = opts.includeNew ?? false;
  const schedule = stats.itemSchedule ?? {};

  const scored: { item: PracticeItem<TPayload>; overdueMs: number }[] = [];
  for (const item of items) {
    const s = schedule[item.id];
    if (!s) {
      if (includeNew) scored.push({ item, overdueMs: 0 });
      continue;
    }
    if (!isDue(s, now)) continue;
    scored.push({ item, overdueMs: now - s.nextReviewAt });
  }
  scored.sort((a, b) => b.overdueMs - a.overdueMs);
  return scored.slice(0, max === Infinity ? scored.length : max).map((s) => s.item);
}

/**
 * Forecast how many items will be due over the next `days` days,
 * bucketed per day. Index 0 = today, index `days-1` = `days-1` days
 * from now. Useful for sparkline / heat-map style UIs.
 */
export function dueForecast(
  stats: UserPracticeStats,
  days: number,
  opts: { now?: number } = {},
): number[] {
  const now = opts.now ?? Date.now();
  const buckets = new Array(Math.max(1, days)).fill(0) as number[];
  const startOfToday = now;
  const ms = 24 * 60 * 60 * 1000;
  const schedule = stats.itemSchedule ?? {};
  for (const id of Object.keys(schedule)) {
    const s = schedule[id];
    const idx = Math.floor((s.nextReviewAt - startOfToday) / ms);
    if (idx < 0) buckets[0] += 1;
    else if (idx < buckets.length) buckets[idx] += 1;
  }
  return buckets;
}

export * from "./templates";
export * from "./weakSpots";
export * from "./aiEnrichment";
export * from "./srs";
