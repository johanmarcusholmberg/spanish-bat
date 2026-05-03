/**
 * Granular per-feature access derived from a plan id.
 *
 * The existing `EntitlementKey` array on `UserEntitlements` answers
 * coarse questions ("does the user have grammar.full?"). This file
 * answers the *product-shape* questions the Free vs Premium spec calls
 * out: how many sessions per day, which session lengths, which Practice
 * Mixes, AI/echo/offline/notification access, level-check attempts.
 *
 * Frontends should always call `getFeatureAccess(planId)` instead of
 * branching on `planId === "premium"` directly — that way moving a
 * feature between tiers is a single edit here.
 *
 * Pure data + functions, no DOM/React/Node — safe to import from web,
 * mobile and server bundles alike.
 */

import type { PlanId } from "./types";

/**
 * Practice Mix keys must stay in sync with the keys used by
 * `PracticeMixesGrid` on web and mobile. Adding a new mix here without
 * adding it to the grid is harmless (it's just unused config); adding a
 * mix to the grid without listing it here will fall back to "full"
 * access, which is intentional — new mixes default to visible.
 */
export type PracticeMixKey =
  | "warmup"
  | "daily"
  | "weak"
  | "speaking"
  | "echo"
  | "grammar"
  | "conversation"
  | "review_previous"
  | "test_prep"
  | "challenge";

/**
 * - "full"    → fully usable
 * - "preview" → tappable but the session is shortened/locked content is
 *               replaced with a soft paywall after a sample
 * - "locked"  → visible in the grid (so the user knows it exists) but
 *               opens the paywall instead of the session
 */
export type FeatureAccessLevel = "full" | "preview" | "locked";

export interface PlanFeatureAccess {
  /** Maximum number of "Today's Practice" sessions a user can start per local day. */
  dailySessionLimit: number;
  /** Maximum number of practice steps per single session. `Infinity` = unlimited. */
  maxSessionSteps: number;
  /** Session-length picker options (in minutes). Free has a single fixed length. */
  availableSessionLengths: number[];
  /** Per-mix access map. Mixes not listed default to "full". */
  practiceMixAccess: Record<PracticeMixKey, FeatureAccessLevel>;
  /** AI-generated practice variations (sentences, dialogues, echo phrases…). */
  aiPractice: boolean;
  /** Full mistake memory (recurring mistake patterns, deep insights). */
  fullMistakeMemory: boolean;
  /** Detailed progress: skill strengths, weak areas, learning history, readiness. */
  advancedProgress: boolean;
  /** Full Echo features (extended sessions, longer phrase sets). */
  fullEcho: boolean;
  /** Recording + playback of speaking attempts. */
  recordingPlayback: boolean;
  /** Offline review mode. */
  offlineMode: boolean;
  /** Custom notification timing / categories. */
  customNotifications: boolean;
  /** Number of level-check attempts per level. `Infinity` = unlimited. */
  levelCheckAttemptsPerLevel: number;
  /** Library: how much of the catalogue is fully usable. */
  libraryAccess: FeatureAccessLevel;
  /** Show locked Premium content in the UI so users understand what they unlock. */
  showLockedPreviews: boolean;
}

/**
 * Free plan = the daily habit preview.
 * One short session per day, basic mixes, manual confidence Echo,
 * limited insights — but never *blocked* before the user has felt
 * the product.
 */
export const FREE_FEATURE_ACCESS: PlanFeatureAccess = {
  dailySessionLimit: 1,
  maxSessionSteps: 12,
  availableSessionLengths: [5],
  practiceMixAccess: {
    warmup: "full",
    daily: "full",
    weak: "preview",
    speaking: "locked",
    echo: "full",
    grammar: "locked",
    conversation: "preview",
    review_previous: "preview",
    test_prep: "preview",
    challenge: "locked",
  },
  aiPractice: false,
  fullMistakeMemory: false,
  advancedProgress: false,
  fullEcho: false,
  recordingPlayback: false,
  offlineMode: false,
  customNotifications: false,
  levelCheckAttemptsPerLevel: 1,
  libraryAccess: "preview",
  showLockedPreviews: true,
};

/**
 * Premium plan = the personal Spanish coach.
 * Unlimited sessions, all mixes, adaptive insights, AI variations,
 * full Echo, offline + custom reminders, generous level-check.
 */
export const PREMIUM_FEATURE_ACCESS: PlanFeatureAccess = {
  dailySessionLimit: Number.POSITIVE_INFINITY,
  maxSessionSteps: Number.POSITIVE_INFINITY,
  availableSessionLengths: [2, 5, 10, 15],
  practiceMixAccess: {
    warmup: "full",
    daily: "full",
    weak: "full",
    speaking: "full",
    echo: "full",
    grammar: "full",
    conversation: "full",
    review_previous: "full",
    test_prep: "full",
    challenge: "full",
  },
  aiPractice: true,
  fullMistakeMemory: true,
  advancedProgress: true,
  fullEcho: true,
  recordingPlayback: true,
  offlineMode: true,
  customNotifications: true,
  levelCheckAttemptsPerLevel: Number.POSITIVE_INFINITY,
  libraryAccess: "full",
  showLockedPreviews: false,
};

/**
 * Resolve plan-level feature access. Any non-free / non-premium plan id
 * (Model B "learn" or "pro") collapses to Premium for now — both grant
 * the full personal-coach experience. Update here when intermediate
 * plans differ.
 */
export function getFeatureAccess(planId: PlanId): PlanFeatureAccess {
  if (planId === "free") return FREE_FEATURE_ACCESS;
  return PREMIUM_FEATURE_ACCESS;
}

/** Convenience: access level for a specific mix, with safe default. */
export function getMixAccess(
  planId: PlanId,
  mix: PracticeMixKey,
): FeatureAccessLevel {
  return getFeatureAccess(planId).practiceMixAccess[mix] ?? "full";
}

/** Convenience: can the user start another session today? */
export function canStartAnotherSession(
  planId: PlanId,
  sessionsCompletedToday: number,
): boolean {
  return sessionsCompletedToday < getFeatureAccess(planId).dailySessionLimit;
}
