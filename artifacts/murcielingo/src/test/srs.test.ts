import { describe, it, expect } from "vitest";
import {
  scheduleReview,
  isDue,
  isLeech,
  gradeFromCorrect,
  daysUntilDue,
  newSrsState,
  getDueItems,
  recommendPracticeMode,
  recordAttempt,
  countDueItems,
  type UserPracticeStats,
  type PracticeItem,
} from "@workspace/practice";

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_700_000_000_000;

const makeItem = (id: string, level = "A1" as const): PracticeItem<unknown> => ({
  id,
  skill: "vocabulary",
  subskill: "core_vocab",
  level,
  payload: {},
});

describe("srs.scheduleReview", () => {
  it("schedules a fresh item to ~1 day on first correct", () => {
    const s = scheduleReview(undefined, gradeFromCorrect(true), T0);
    expect(s.repetitions).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.nextReviewAt).toBe(T0 + 1 * DAY);
    expect(s.lapses).toBe(0);
  });

  it("progresses interval 1 → 3 → 6 → 6*ease on consecutive correct", () => {
    let s = scheduleReview(undefined, gradeFromCorrect(true), T0);
    s = scheduleReview(s, gradeFromCorrect(true), T0 + 1 * DAY);
    expect(s.intervalDays).toBe(3);
    s = scheduleReview(s, gradeFromCorrect(true), T0 + 4 * DAY);
    expect(s.intervalDays).toBe(6);
    s = scheduleReview(s, gradeFromCorrect(true), T0 + 10 * DAY);
    expect(s.intervalDays).toBeGreaterThanOrEqual(Math.round(6 * 2.5) - 1);
  });

  it("resets interval and increments lapses on incorrect", () => {
    let s = scheduleReview(undefined, gradeFromCorrect(true), T0);
    s = scheduleReview(s, gradeFromCorrect(true), T0 + 1 * DAY);
    expect(s.intervalDays).toBe(3);
    s = scheduleReview(s, gradeFromCorrect(false), T0 + 4 * DAY);
    expect(s.lapses).toBe(1);
    expect(s.repetitions).toBe(0);
    expect(s.intervalDays).toBeLessThanOrEqual(1);
    expect(s.ease).toBeLessThan(2.5);
  });

  it("ease never drops below the floor (1.3)", () => {
    let s = newSrsState(T0);
    for (let i = 0; i < 20; i++) {
      s = scheduleReview(s, gradeFromCorrect(false), T0 + i * DAY);
    }
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe("srs.isDue / isLeech / daysUntilDue", () => {
  it("isDue reports items with nextReviewAt <= now", () => {
    const s = scheduleReview(undefined, gradeFromCorrect(true), T0);
    expect(isDue(s, T0 + 12 * 60 * 60 * 1000)).toBe(false);
    expect(isDue(s, T0 + 1 * DAY)).toBe(true);
    expect(isDue(s, T0 + 5 * DAY)).toBe(true);
  });

  it("daysUntilDue is non-negative until past due", () => {
    const s = scheduleReview(undefined, gradeFromCorrect(true), T0);
    expect(daysUntilDue(s, T0)).toBeCloseTo(1, 1);
    expect(daysUntilDue(s, T0 + 2 * DAY)).toBeLessThanOrEqual(0);
  });

  it("isLeech triggers after 8+ lapses", () => {
    let s = newSrsState(T0);
    for (let i = 0; i < 8; i++) {
      s = scheduleReview(s, gradeFromCorrect(false), T0 + i * DAY);
    }
    expect(isLeech(s)).toBe(true);
  });
});

describe("getDueItems", () => {
  it("returns due items sorted by overdue-ness, skipping unscheduled by default", () => {
    const items = [makeItem("a"), makeItem("b"), makeItem("c"), makeItem("d")];
    const stats: UserPracticeStats = {
      subskillStats: {},
      skillAccuracy: {},
      itemStats: {},
      recentMistakeIds: [],
      itemSchedule: {
        a: { ease: 2.5, intervalDays: 1, repetitions: 1, lapses: 0, lastReviewedAt: T0 - 5 * DAY, nextReviewAt: T0 - 4 * DAY },
        b: { ease: 2.5, intervalDays: 3, repetitions: 2, lapses: 0, lastReviewedAt: T0 - 5 * DAY, nextReviewAt: T0 - 1 * DAY },
        c: { ease: 2.5, intervalDays: 6, repetitions: 3, lapses: 0, lastReviewedAt: T0,           nextReviewAt: T0 + 6 * DAY },
        // d has no schedule
      },
    };
    const due = getDueItems(stats, items, { now: T0 });
    expect(due.map((i) => i.id)).toEqual(["a", "b"]);

    const withNew = getDueItems(stats, items, { now: T0, includeNew: true });
    expect(withNew.map((i) => i.id)).toContain("d");
  });
});

describe("recommendPracticeMode + dueCount", () => {
  const baseStats: UserPracticeStats = {
    subskillStats: {},
    skillAccuracy: {},
    itemStats: {},
    recentMistakeIds: [],
  };

  it("recommends due_review when dueCount >= threshold", () => {
    const rec = recommendPracticeMode({
      stats: baseStats,
      weakSpots: [],
      dueCount: 7,
    });
    expect(rec.mode).toBe("due_review");
    expect(rec.reason.en).toMatch(/due|review/i);
  });

  it("does not recommend due_review when below threshold", () => {
    const rec = recommendPracticeMode({
      stats: baseStats,
      weakSpots: [],
      dueCount: 2,
    });
    expect(rec.mode).not.toBe("due_review");
  });

  it("respects custom threshold", () => {
    const rec = recommendPracticeMode({
      stats: baseStats,
      weakSpots: [],
      dueCount: 3,
      dueRecommendThreshold: 3,
    });
    expect(rec.mode).toBe("due_review");
  });

  it("test_recommended takes precedence over due_review", () => {
    const rec = recommendPracticeMode({
      stats: baseStats,
      weakSpots: [],
      readinessState: "test_recommended",
      dueCount: 50,
    });
    expect(rec.mode).toBe("test_prep");
  });
});

describe("countDueItems backward compatibility", () => {
  it("counts SRS schedule entries that are due", () => {
    const stats: UserPracticeStats = {
      subskillStats: {},
      skillAccuracy: {},
      itemStats: {},
      recentMistakeIds: [],
      itemSchedule: {
        a: { ease: 2.5, intervalDays: 1, repetitions: 1, lapses: 0, lastReviewedAt: T0 - 5 * DAY, nextReviewAt: T0 - 1 * DAY },
        b: { ease: 2.5, intervalDays: 6, repetitions: 3, lapses: 0, lastReviewedAt: T0,           nextReviewAt: T0 + 6 * DAY },
      },
    };
    expect(countDueItems(stats, { now: T0 })).toBe(1);
  });

  it("falls back to legacy itemStats.nextReviewAt for pre-Phase-20 stats", () => {
    const stats: UserPracticeStats = {
      subskillStats: {},
      skillAccuracy: {},
      itemStats: {
        x: { attempts: 3, correct: 2, lastAttemptAt: T0 - 2 * DAY, nextReviewAt: T0 - 1 * DAY },
        y: { attempts: 1, correct: 1, lastAttemptAt: T0,           nextReviewAt: T0 + 5 * DAY },
      },
      recentMistakeIds: [],
    };
    expect(countDueItems(stats, { now: T0 })).toBe(1);
  });

  it("does not double-count mirrored entries (schedule + legacy for same id)", () => {
    const stats: UserPracticeStats = {
      subskillStats: {},
      skillAccuracy: {},
      itemStats: {
        a: { attempts: 2, correct: 1, lastAttemptAt: T0 - 1 * DAY, nextReviewAt: T0 - 1 * DAY },
      },
      recentMistakeIds: [],
      itemSchedule: {
        a: { ease: 2.5, intervalDays: 1, repetitions: 1, lapses: 1, lastReviewedAt: T0 - 1 * DAY, nextReviewAt: T0 - 1 * DAY },
      },
    };
    expect(countDueItems(stats, { now: T0 })).toBe(1);
  });
});

describe("recordAttempt writes itemSchedule", () => {
  it("creates and updates SRS schedule per attempt", () => {
    const stats0: UserPracticeStats = {
      subskillStats: {},
      skillAccuracy: {},
      itemStats: {},
      recentMistakeIds: [],
    };
    const stats1 = recordAttempt(stats0, {
      itemId: "v1",
      skill: "vocabulary",
      subskill: "core_vocab",
      level: "A1",
      correct: true,
      now: T0,
    });
    expect(stats1.itemSchedule?.v1?.repetitions).toBe(1);
    expect(stats1.itemSchedule?.v1?.nextReviewAt).toBe(T0 + DAY);

    const stats2 = recordAttempt(stats1, {
      itemId: "v1",
      skill: "vocabulary",
      subskill: "core_vocab",
      level: "A1",
      correct: false,
      now: T0 + DAY,
    });
    expect(stats2.itemSchedule?.v1?.lapses).toBe(1);
    expect(stats2.itemSchedule?.v1?.repetitions).toBe(0);
  });
});

describe("integration: 30-day simulation surfaces due_review at the right cadence", () => {
  it("after seeding many items, accumulates due reviews over time", () => {
    let stats: UserPracticeStats = {
      subskillStats: {},
      skillAccuracy: {},
      itemStats: {},
      recentMistakeIds: [],
    };
    const items = Array.from({ length: 20 }, (_, i) => makeItem(`w${i}`));

    // Day 0: study all 20 items correctly.
    for (const it of items) {
      stats = recordAttempt(stats, {
        itemId: it.id,
        skill: it.skill,
        subskill: it.subskill,
        level: it.level,
        correct: true,
        now: T0,
      });
    }
    // Day 0 evening: nothing due yet.
    expect(getDueItems(stats, items, { now: T0 + 12 * 60 * 60 * 1000 }).length).toBe(0);

    // Day 1: all 20 should be due.
    const dueDay1 = getDueItems(stats, items, { now: T0 + 1 * DAY });
    expect(dueDay1.length).toBe(20);

    const rec = recommendPracticeMode({
      stats,
      weakSpots: [],
      dueCount: dueDay1.length,
    });
    expect(rec.mode).toBe("due_review");
  });
});
