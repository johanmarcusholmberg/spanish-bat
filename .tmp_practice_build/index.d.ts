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
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export declare const LEVEL_ORDER: readonly Level[];
export type SkillCategory = "vocabulary" | "grammar" | "sentences" | "reading" | "listening" | "speaking";
export type PracticeMode = "quick" | "weak_spots" | "level" | "review_previous" | "test_prep" | "challenge";
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
interface InternalCtx {
    now: number;
    random: () => number;
    stats: UserPracticeStats;
    weakSkills: Set<SkillCategory>;
    recentMistakeIds: Set<string>;
}
export interface ItemScoreBreakdown {
    weakSkill: number;
    dueForReview: number;
    levelMatch: number;
    recentMistake: number;
    repetitionPenalty: number;
    varietyJitter: number;
    difficulty: number;
    total: number;
}
export declare function scoreItem<TPayload>(item: PracticeItem<TPayload>, mode: PracticeMode, level: Level, ctx: InternalCtx): ItemScoreBreakdown;
export declare function buildPracticeSession<TPayload = unknown>(opts: BuildSessionOptions<TPayload>): PracticeSession<TPayload>;
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
export declare const PRACTICE_MODES: readonly PracticeModeMeta[];
export declare const EMPTY_STATE_MESSAGE = "Practice content is being prepared. Try mixed review or check your connection.";
export * from "./templates";
//# sourceMappingURL=index.d.ts.map