/**
 * Server-side subscription/entitlement helpers.
 *
 * Resolves a user's current plan and entitlements by combining:
 *   1. Plan config (`@workspace/subscription`) — what each plan grants.
 *   2. `user_subscriptions` rows — paid subscriptions across all
 *      providers; the highest-tier non-expired row wins.
 *   3. `user_entitlements` rows — extra grants (promo, manual support
 *      bumps) that aren't tied to a paid subscription.
 *
 * Free users always resolve to `{ planId: "free", status: "none" }`
 * with the free entitlements; nothing in the app should require a paid
 * provider just to function.
 */

import { db } from "@workspace/db";
import { userSubscriptionsTable, userEntitlementsTable } from "@workspace/db";
import { and, eq, or } from "drizzle-orm";
import {
  DEFAULT_FREE_PLAN_ID,
  entitlementsForPlan,
  getPlanDefinition,
} from "@workspace/subscription";
import type {
  EntitlementKey,
  PlanId,
  SubscriptionStatus,
  UserEntitlements,
  UserSubscription,
} from "@workspace/subscription";

const ACTIVE_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
  "in_grace_period",
];

function isActiveStatus(s: string): s is SubscriptionStatus {
  return (ACTIVE_STATUSES as string[]).includes(s);
}

/** Pick the highest-tier active subscription for a user. */
async function getActiveSubscription(
  userId: string,
): Promise<UserSubscription> {
  const rows = await db
    .select()
    .from(userSubscriptionsTable)
    .where(
      and(
        eq(userSubscriptionsTable.userId, userId),
        or(
          eq(userSubscriptionsTable.status, "active"),
          eq(userSubscriptionsTable.status, "trialing"),
          eq(userSubscriptionsTable.status, "in_grace_period"),
        ),
      ),
    );

  if (rows.length === 0) {
    return {
      planId: DEFAULT_FREE_PLAN_ID,
      status: "none",
      provider: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEnd: null,
    };
  }

  const sorted = [...rows].sort((a, b) => {
    const at = getPlanDefinition(a.planId as PlanId).tier;
    const bt = getPlanDefinition(b.planId as PlanId).tier;
    return bt - at;
  });
  const top = sorted[0];

  return {
    planId: top.planId as PlanId,
    status: isActiveStatus(top.status)
      ? (top.status as SubscriptionStatus)
      : "none",
    provider: (top.provider as UserSubscription["provider"]) ?? null,
    currentPeriodEnd: top.currentPeriodEnd
      ? top.currentPeriodEnd.toISOString()
      : null,
    cancelAtPeriodEnd: top.cancelAtPeriodEnd === "true",
    trialEnd: top.trialEnd ? top.trialEnd.toISOString() : null,
  };
}

/** Extra entitlements granted directly (promo, manual). */
async function getExtraEntitlements(
  userId: string,
): Promise<EntitlementKey[]> {
  const rows = await db
    .select()
    .from(userEntitlementsTable)
    .where(eq(userEntitlementsTable.userId, userId));
  const now = Date.now();
  return rows
    .filter((r) => !r.expiresAt || r.expiresAt.getTime() > now)
    .map((r) => r.entitlementKey as EntitlementKey);
}

/** Compute a user's full entitlement view. Always returns something usable. */
export async function getUserEntitlements(
  userId: string,
): Promise<UserEntitlements> {
  const [sub, extras] = await Promise.all([
    getActiveSubscription(userId),
    getExtraEntitlements(userId),
  ]);

  const planDef = getPlanDefinition(sub.planId);
  const merged = new Set<EntitlementKey>([
    ...entitlementsForPlan(sub.planId),
    ...extras,
  ]);
  const entitlements = Array.from(merged);
  const entitlementSet = entitlements.reduce(
    (acc, k) => {
      acc[k] = true;
      return acc;
    },
    {} as Record<EntitlementKey, true>,
  );

  return {
    userId,
    planId: sub.planId,
    status: sub.status,
    isPremium: planDef.isPremium,
    entitlements,
    entitlementSet,
  };
}

export async function hasEntitlement(
  userId: string,
  key: EntitlementKey,
): Promise<boolean> {
  const e = await getUserEntitlements(userId);
  return Boolean(e.entitlementSet[key]);
}

export async function getCurrentPlan(userId: string): Promise<PlanId> {
  const e = await getUserEntitlements(userId);
  return e.planId;
}

export async function isPremium(userId: string): Promise<boolean> {
  const e = await getUserEntitlements(userId);
  return e.isPremium;
}

export { getActiveSubscription };
