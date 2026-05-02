import type { EntitlementKey, PlanId, SubscriptionModel } from "./types";

/**
 * Active subscription model. The technical foundation supports both Model
 * A (Free / Premium) and Model B (Free / Learn / Pro) — switching this
 * flag changes which plans the UI surfaces and which entitlements the
 * default plan resolves to. Stripe / RevenueCat product IDs for the
 * inactive model can stay unconfigured.
 */
export const ACTIVE_SUBSCRIPTION_MODEL: SubscriptionModel = "A";

interface PlanDefinition {
  planId: PlanId;
  displayName: string;
  /** Higher tier wins when a user has overlapping subscriptions. */
  tier: number;
  /** Treat the user as "premium" (i.e. paying) for any UI that needs a single bit. */
  isPremium: boolean;
  entitlements: EntitlementKey[];
}

/**
 * Model A — the recommended/default model.
 *
 * Free users get a metered taste; Premium users get everything.
 */
export const MODEL_A_PLANS: Record<"free" | "premium", PlanDefinition> = {
  free: {
    planId: "free",
    displayName: "Free",
    tier: 0,
    isPremium: false,
    entitlements: [
      "lessons.limited",
      "vocabulary.limited",
      "exercises.limited",
      "progress.basic",
    ],
  },
  premium: {
    planId: "premium",
    displayName: "Premium",
    tier: 100,
    isPremium: true,
    entitlements: [
      "lessons.unlimited",
      "vocabulary.unlimited",
      "exercises.unlimited",
      "grammar.full",
      "reading.full",
      "review.mode",
      "progress.full",
    ],
  },
};

/**
 * Model B — represented in config so we can switch without rework. Not
 * currently surfaced in the UI. The "Pro" placeholders intentionally
 * include not-yet-built features (AI tutor, etc.) so we can light them
 * up once the entitlements map to real product surface.
 */
export const MODEL_B_PLANS: Record<"free" | "learn" | "pro", PlanDefinition> = {
  free: {
    planId: "free",
    displayName: "Free",
    tier: 0,
    isPremium: false,
    entitlements: [
      "lessons.limited",
      "vocabulary.limited",
      "exercises.limited",
      "progress.basic",
    ],
  },
  learn: {
    planId: "learn",
    displayName: "Learn",
    tier: 50,
    isPremium: true,
    entitlements: [
      "lessons.unlimited",
      "vocabulary.unlimited",
      "exercises.unlimited",
      "grammar.full",
      "progress.full",
    ],
  },
  pro: {
    planId: "pro",
    displayName: "Pro",
    tier: 100,
    isPremium: true,
    entitlements: [
      "lessons.unlimited",
      "vocabulary.unlimited",
      "exercises.unlimited",
      "grammar.full",
      "reading.full",
      "review.mode",
      "progress.full",
      "progress.advanced",
      "ai.tutor",
      "study.plan.personalized",
      "pronunciation.coach",
      "mistake.analysis",
    ],
  },
};

/** All plan definitions, regardless of which model is active. */
export const ALL_PLANS: Record<PlanId, PlanDefinition> = {
  free: MODEL_A_PLANS.free,
  premium: MODEL_A_PLANS.premium,
  learn: MODEL_B_PLANS.learn,
  pro: MODEL_B_PLANS.pro,
};

/** Plans surfaced in the UI for the currently active model. */
export const ACTIVE_PLANS: PlanDefinition[] =
  ACTIVE_SUBSCRIPTION_MODEL === "A"
    ? [MODEL_A_PLANS.free, MODEL_A_PLANS.premium]
    : [MODEL_B_PLANS.free, MODEL_B_PLANS.learn, MODEL_B_PLANS.pro];

/** Plan id used when a user has no paid subscription. */
export const DEFAULT_FREE_PLAN_ID: PlanId = "free";

/** Look up entitlements for a plan id (works for both models). */
export function entitlementsForPlan(planId: PlanId): EntitlementKey[] {
  return ALL_PLANS[planId]?.entitlements ?? ALL_PLANS.free.entitlements;
}

/** Get plan definition (or `free` as a safe fallback). */
export function getPlanDefinition(planId: PlanId): PlanDefinition {
  return ALL_PLANS[planId] ?? ALL_PLANS.free;
}

export type { PlanDefinition };
