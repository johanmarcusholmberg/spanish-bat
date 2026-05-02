/**
 * Shared subscription/entitlement types.
 *
 * These are platform-agnostic and safe to import from web (Vite) and
 * mobile (Expo) frontends as well as the API server.
 */

export type SubscriptionModel = "A" | "B";

/** Plan identifiers across both supported models. */
export type PlanId = "free" | "premium" | "learn" | "pro";

/**
 * Entitlement keys are the unit of feature gating. The mapping from plan
 * to entitlements lives in `config.ts`. Frontends should always check
 * entitlements (e.g. "lessons.unlimited") rather than plan ids directly,
 * so we can move features between tiers without code changes.
 */
export type EntitlementKey =
  | "lessons.limited"
  | "lessons.unlimited"
  | "vocabulary.limited"
  | "vocabulary.unlimited"
  | "exercises.limited"
  | "exercises.unlimited"
  | "grammar.full"
  | "reading.full"
  | "review.mode"
  | "progress.basic"
  | "progress.full"
  | "progress.advanced"
  | "ai.tutor"
  | "study.plan.personalized"
  | "pronunciation.coach"
  | "mistake.analysis";

/** Mirrors Stripe / RevenueCat status vocabulary. */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired"
  | "in_grace_period"
  | "none";

export type SubscriptionProvider =
  | "stripe"
  | "apple"
  | "google"
  | "promo"
  | "manual";

export interface UserSubscription {
  planId: PlanId;
  status: SubscriptionStatus;
  provider: SubscriptionProvider | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

export interface UserEntitlements {
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  isPremium: boolean;
  entitlements: EntitlementKey[];
  /** Cheap O(1) lookup; mirrors the `entitlements` array. */
  entitlementSet: Record<EntitlementKey, true>;
}
