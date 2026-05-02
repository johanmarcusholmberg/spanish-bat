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
export const LEVEL_ORDER = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
];
// ───────────────────────────────────────────────────────────────────
// Internal helpers
// ───────────────────────────────────────────────────────────────────
const DEFAULT_SIZE = {
    quick: 5,
    weak_spots: 8,
    level: 8,
    review_previous: 8,
    test_prep: 10,
    challenge: 8,
};
const SECONDS_PER_ITEM = 25;
const WEAK_SKILL_ACCURACY = 0.7; // below this = "weak"
const REPETITION_RECENT_MS = 1000 * 60 * 60 * 24; // 24h window for repetition penalty
function levelIndex(level) {
    return LEVEL_ORDER.indexOf(level);
}
function weakSkillsFromStats(stats) {
    const out = new Set();
    const acc = stats.skillAccuracy ?? {};
    for (const skill of Object.keys(acc)) {
        const v = acc[skill];
        if (typeof v === "number" && v < WEAK_SKILL_ACCURACY)
            out.add(skill);
    }
    // If we have no accuracy data, treat nothing as "weak" — selection
    // will fall back to other signals (recent mistakes, due reviews).
    return out;
}
function shuffle(arr, rng) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}
function generateSessionId(rng) {
    return ("ps_" +
        Date.now().toString(36) +
        "_" +
        Math.floor(rng() * 1e9).toString(36));
}
export function scoreItem(item, mode, level, ctx) {
    const stat = ctx.stats.itemStats?.[item.id];
    const userIdx = levelIndex(level);
    const itemIdx = levelIndex(item.level);
    // Weak skill match
    const weakSkill = ctx.weakSkills.has(item.skill) ? 30 : 0;
    // Due-for-review (SRS)
    let dueForReview = 0;
    if (stat?.nextReviewAt && stat.nextReviewAt <= ctx.now) {
        dueForReview = 22;
    }
    else if (!stat || stat.timesSeen === 0) {
        // Brand-new content gets a small bump so it isn't drowned out.
        dueForReview = 8;
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
                        : 18;
    }
    else if (itemIdx < userIdx) {
        levelMatch =
            mode === "review_previous"
                ? 26
                : mode === "test_prep"
                    ? 8
                    : mode === "level"
                        ? 2
                        : 10;
    }
    else if (itemIdx === userIdx + 1) {
        levelMatch = mode === "challenge" ? 22 : -40; // preview only in challenge
    }
    else {
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
        if (mode === "challenge")
            difficulty = (item.difficulty - 1) * 6;
        else if (mode === "quick")
            difficulty = item.difficulty === 1 ? 4 : 0;
        else
            difficulty = item.difficulty === 2 ? 4 : 0;
    }
    // Small random jitter for variety / shuffling between equivalent items.
    const varietyJitter = Math.round(ctx.random() * 6);
    const total = weakSkill +
        dueForReview +
        levelMatch +
        recentMistake +
        repetitionPenalty +
        varietyJitter +
        difficulty;
    return {
        weakSkill,
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
function modeCandidates(items, mode, level) {
    const userIdx = levelIndex(level);
    switch (mode) {
        case "quick":
            // current + previous + a sprinkle of next-level if user is below C2
            return items.filter((i) => levelIndex(i.level) <= Math.min(userIdx + 1, LEVEL_ORDER.length - 1));
        case "weak_spots":
            return items.filter((i) => levelIndex(i.level) <= userIdx);
        case "level":
            return items.filter((i) => i.level === level);
        case "review_previous":
            return items.filter((i) => levelIndex(i.level) < userIdx);
        case "test_prep":
            return items.filter((i) => levelIndex(i.level) <= userIdx);
        case "challenge":
            return items.filter((i) => levelIndex(i.level) <= Math.min(userIdx + 1, LEVEL_ORDER.length - 1));
        default:
            return items.slice();
    }
}
// ───────────────────────────────────────────────────────────────────
// Selection with widening fallback
// ───────────────────────────────────────────────────────────────────
function widenIfTooThin(candidates, all, mode, level, targetSize) {
    if (candidates.length >= targetSize)
        return candidates;
    // Try widening rules in order of "least surprising" to "most permissive".
    const widened = new Set(candidates);
    const userIdx = levelIndex(level);
    // 1. Mix in previous levels.
    if (widened.size < targetSize) {
        for (const it of all) {
            if (levelIndex(it.level) < userIdx)
                widened.add(it);
            if (widened.size >= targetSize * 2)
                break;
        }
    }
    // 2. Mix in current level (covers review_previous when it's too thin).
    if (widened.size < targetSize) {
        for (const it of all) {
            if (it.level === level)
                widened.add(it);
            if (widened.size >= targetSize * 2)
                break;
        }
    }
    // 3. As a last resort, allow next-level items even if mode wouldn't.
    if (widened.size < targetSize && mode !== "challenge") {
        for (const it of all) {
            if (levelIndex(it.level) === userIdx + 1)
                widened.add(it);
            if (widened.size >= targetSize * 2)
                break;
        }
    }
    // 4. Truly any item — better than a dead-end.
    if (widened.size < targetSize) {
        for (const it of all) {
            widened.add(it);
            if (widened.size >= targetSize * 2)
                break;
        }
    }
    return Array.from(widened);
}
function pickWithVariety(scored, size, rng) {
    // Sort by score desc; take a top window then shuffle slightly to avoid
    // identical sessions every time.
    const sorted = scored.slice().sort((a, b) => b.score - a.score);
    const window = sorted.slice(0, Math.max(size * 3, size + 4));
    const shuffled = shuffle(window, rng);
    const picked = [];
    const seenSkills = [];
    const seenIds = new Set();
    // First pass: enforce variety — try not to pick more than ceil(size/2)
    // of any single skill.
    const maxPerSkill = Math.max(2, Math.ceil(size / 2));
    const skillCounts = new Map();
    for (const { item } of shuffled) {
        if (picked.length >= size)
            break;
        if (seenIds.has(item.id))
            continue;
        const cnt = skillCounts.get(item.skill) ?? 0;
        if (cnt >= maxPerSkill)
            continue;
        picked.push(item);
        seenIds.add(item.id);
        skillCounts.set(item.skill, cnt + 1);
        if (!seenSkills.includes(item.skill))
            seenSkills.push(item.skill);
    }
    // Second pass: top up if variety constraint left us short.
    if (picked.length < size) {
        for (const { item } of shuffled) {
            if (picked.length >= size)
                break;
            if (seenIds.has(item.id))
                continue;
            picked.push(item);
            seenIds.add(item.id);
        }
    }
    return picked;
}
function describeReason(mode, focus) {
    const focusStr = focus.length === 0
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
export function buildPracticeSession(opts) {
    const now = opts.now ?? Date.now();
    const random = opts.random ?? Math.random;
    const stats = opts.stats ?? {};
    const size = Math.max(1, opts.size ?? DEFAULT_SIZE[opts.mode]);
    const ctx = {
        now,
        random,
        stats,
        weakSkills: weakSkillsFromStats(stats),
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
export const PRACTICE_MODES = [
    {
        mode: "quick",
        title: "Quick practice",
        description: "A short mixed session, around 5 questions.",
        defaultSize: DEFAULT_SIZE.quick,
    },
    {
        mode: "weak_spots",
        title: "Weak spots",
        description: "Focus on skills where your accuracy is lower.",
        defaultSize: DEFAULT_SIZE.weak_spots,
    },
    {
        mode: "level",
        title: "Level practice",
        description: "Focus on your current CEFR level.",
        defaultSize: DEFAULT_SIZE.level,
    },
    {
        mode: "review_previous",
        title: "Review previous levels",
        description: "Mix earlier levels to keep your foundations strong.",
        defaultSize: DEFAULT_SIZE.review_previous,
    },
    {
        mode: "test_prep",
        title: "Test prep",
        description: "A balanced set that resembles the level check.",
        defaultSize: DEFAULT_SIZE.test_prep,
    },
    {
        mode: "challenge",
        title: "Challenge me",
        description: "Harder mix — current level plus a preview of what's next.",
        defaultSize: DEFAULT_SIZE.challenge,
    },
];
export const EMPTY_STATE_MESSAGE = "Practice content is being prepared. Try mixed review or check your connection.";
export * from "./templates";
