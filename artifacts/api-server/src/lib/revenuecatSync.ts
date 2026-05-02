/**
 * Persists RevenueCat webhook events into the shared subscription tables.
 *
 * RevenueCat is the mobile-side counterpart to Stripe (web). We reuse
 * the same `user_subscriptions`, `user_entitlements`,
 * `subscription_events` and `customer_mapping` tables so the entitlement
 * resolver in `lib/subscription.ts` doesn't need to know which provider
 * a grant came from.
 *
 * Identity:
 *   The mobile client identifies the RC customer with the Clerk user
 *   id, so RC's `app_user_id` IS our internal userId. We still record
 *   the mapping (`provider="revenuecat"`) for parity with Stripe and so
 *   admin tools can list users-by-provider uniformly.
 *
 * The handler is intentionally tolerant: any unrecognised event type is
 * just stored (so we never lose data) and acknowledged.
 */

import { and, eq, like } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  customerMappingTable,
  subscriptionEventsTable,
  userEntitlementsTable,
  userSubscriptionsTable,
} from "@workspace/db";
import {
  entitlementsForPlan,
  getPlanDefinition,
  type PlanId,
  type SubscriptionStatus,
} from "@workspace/subscription";
import { logger } from "./logger";

const PROVIDER = "revenuecat" as const;
const PG_UNIQUE_VIOLATION = "23505";

/**
 * RevenueCat webhook event payload (only the fields we use).
 * See https://www.revenuecat.com/docs/webhooks.
 */
export interface RevenueCatEvent {
  api_version?: string;
  event: {
    id: string;
    type: string;
    app_user_id: string;
    original_app_user_id?: string;
    product_id?: string;
    period_type?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number | null;
    store?: "APP_STORE" | "PLAY_STORE" | "STRIPE" | "PROMOTIONAL" | string;
    environment?: "SANDBOX" | "PRODUCTION" | string;
    entitlement_id?: string | null;
    entitlement_ids?: string[] | null;
    transaction_id?: string;
    original_transaction_id?: string;
    is_trial_conversion?: boolean;
    cancel_reason?: string;
  };
}

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: unknown }).code === PG_UNIQUE_VIOLATION;
}

function mapStore(store?: string): "apple" | "google" | "stripe" | "promo" {
  switch (store) {
    case "APP_STORE":
      return "apple";
    case "PLAY_STORE":
      return "google";
    case "STRIPE":
      return "stripe";
    case "PROMOTIONAL":
      return "promo";
    default:
      return "apple";
  }
}

/** Map RC event type → our subscription status. */
function statusForEvent(eventType: string): SubscriptionStatus {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION":
      return "active";
    case "TRIAL_STARTED":
      return "trialing";
    case "TRIAL_CONVERTED":
      return "active";
    case "TRIAL_CANCELLED":
    case "CANCELLATION":
      // Cancelled but still active until period end → keep "active";
      // RC will send EXPIRATION when access actually ends.
      return "active";
    case "BILLING_ISSUE":
      return "past_due";
    case "SUBSCRIPTION_PAUSED":
      return "in_grace_period";
    case "EXPIRATION":
      return "expired";
    case "SUBSCRIBER_ALIAS":
    case "TRANSFER":
    case "TEST":
    default:
      return "none";
  }
}

/**
 * Map a RC product id to our internal plan id. Both monthly and yearly
 * products of the same tier collapse to the same `planId` ("premium")
 * — billing cadence is purely a price/period concern.
 */
function planIdFromProduct(productId: string | undefined): PlanId {
  if (!productId) return "free";
  const monthly = process.env.RC_PRODUCT_MONTHLY;
  const yearly = process.env.RC_PRODUCT_YEARLY;
  if (productId === monthly || productId === yearly) return "premium";
  // Heuristic fallback so placeholder products still resolve.
  if (/premium|pro/i.test(productId)) return "premium";
  return "free";
}

async function recordEvent(
  evt: RevenueCatEvent,
  userId: string | null,
): Promise<{ alreadyProcessed: boolean }> {
  try {
    await db.insert(subscriptionEventsTable).values({
      userId,
      provider: PROVIDER,
      eventType: evt.event.type,
      providerEventId: evt.event.id,
      payload: evt as unknown as Record<string, unknown>,
    });
    return { alreadyProcessed: false };
  } catch (err) {
    if (isUniqueViolation(err)) {
      logger.info(
        { eventId: evt.event.id, type: evt.event.type },
        "Duplicate RevenueCat event ignored",
      );
      return { alreadyProcessed: true };
    }
    throw err;
  }
}

async function upsertCustomerMapping(
  userId: string,
  rcAppUserId: string,
): Promise<void> {
  const existing = await db
    .select()
    .from(customerMappingTable)
    .where(
      and(
        eq(customerMappingTable.userId, userId),
        eq(customerMappingTable.provider, PROVIDER),
      ),
    )
    .limit(1);
  if (existing.length > 0) return;
  try {
    await db
      .insert(customerMappingTable)
      .values({
        userId,
        provider: PROVIDER,
        providerCustomerId: rcAppUserId,
      })
      .onConflictDoNothing();
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
  }
}

async function upsertSubscriptionRow(
  userId: string,
  evt: RevenueCatEvent,
): Promise<{ planId: PlanId; status: SubscriptionStatus; periodEnd: Date | null }> {
  const e = evt.event;
  const planId = planIdFromProduct(e.product_id);
  const status = statusForEvent(e.type);
  const periodEnd =
    typeof e.expiration_at_ms === "number"
      ? new Date(e.expiration_at_ms)
      : null;
  const periodStart =
    typeof e.purchased_at_ms === "number"
      ? new Date(e.purchased_at_ms)
      : null;
  const provider = mapStore(e.store);
  // Use the original transaction id when present so renewals collapse onto
  // a single row; fall back to the event's transaction id.
  const providerSubId =
    e.original_transaction_id ?? e.transaction_id ?? `${e.app_user_id}:${planId}`;

  const existing = await db
    .select()
    .from(userSubscriptionsTable)
    .where(
      and(
        eq(userSubscriptionsTable.provider, provider),
        eq(userSubscriptionsTable.providerSubscriptionId, providerSubId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userSubscriptionsTable)
      .set({
        userId,
        planId,
        status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: e.type === "CANCELLATION" ? "true" : "false",
        rawPayload: evt as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptionsTable.id, existing[0].id));
  } else {
    await db.insert(userSubscriptionsTable).values({
      userId,
      planId,
      provider,
      providerSubscriptionId: providerSubId,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: e.type === "CANCELLATION" ? "true" : "false",
      rawPayload: evt as unknown as Record<string, unknown>,
    });
  }

  return { planId, status, periodEnd };
}

async function syncEntitlementsForUser(
  userId: string,
  planId: PlanId,
  status: SubscriptionStatus,
  periodEnd: Date | null,
): Promise<void> {
  const planDef = getPlanDefinition(planId);
  const isActive =
    status === "active" || status === "trialing" || status === "in_grace_period";

  // Wipe ALL plan-sourced entitlements for this user (any `plan:*` source)
  // and re-insert if active. Matches the Stripe sync behaviour exactly so
  // a user with both web + mobile subs always converges to the highest
  // tier resolved at GET /api/subscription time, not webhook ordering.
  // Manual / promo grants are preserved.
  await db
    .delete(userEntitlementsTable)
    .where(
      and(
        eq(userEntitlementsTable.userId, userId),
        like(userEntitlementsTable.source, "plan:%"),
      ),
    );

  if (isActive && planDef.isPremium) {
    for (const key of entitlementsForPlan(planId)) {
      try {
        await db.insert(userEntitlementsTable).values({
          userId,
          entitlementKey: key,
          source: `plan:${planId}`,
          expiresAt: periodEnd ?? null,
        });
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
      }
    }
  }
}

export interface HandleRevenueCatResult {
  ok: boolean;
  reason?: string;
}

/**
 * Validate that an RC `app_user_id` looks like a Clerk userId
 * ("user_..."). The mobile client always identifies the RC customer
 * with the Clerk id BEFORE any purchase, so any other shape (especially
 * RC's anonymous "$RCAnonymousID:..." prefix) means a client bug or a
 * spoofed event. We still log the event for debugging, but refuse to
 * write to the shared subscription tables — bad identity here would
 * corrupt entitlements for all users.
 */
function isValidClerkUserId(appUserId: string): boolean {
  return /^user_[A-Za-z0-9]+$/.test(appUserId);
}

export async function handleRevenueCatEvent(
  evt: RevenueCatEvent,
): Promise<HandleRevenueCatResult> {
  const e = evt.event;
  if (!e?.id || !e?.type || !e?.app_user_id) {
    return { ok: false, reason: "invalid_payload" };
  }

  // Identity: app_user_id IS our Clerk userId (set by the mobile client
  // via Purchases.logIn / configure). Reject anything that doesn't look
  // like a Clerk id — see isValidClerkUserId above.
  const appUserId = e.app_user_id;
  const userIdValid = isValidClerkUserId(appUserId);
  const userId = userIdValid ? appUserId : null;

  const dup = await recordEvent(evt, userId);
  if (dup.alreadyProcessed) return { ok: true };

  if (!userIdValid) {
    logger.warn(
      { eventId: e.id, eventType: e.type, appUserId },
      "RevenueCat event with non-Clerk app_user_id — event stored, entitlements not synced",
    );
    return { ok: true, reason: "anonymous_user" };
  }

  // Test-mode pings — record only.
  if (e.type === "TEST" || e.type === "SUBSCRIBER_ALIAS" || e.type === "TRANSFER") {
    return { ok: true, reason: "noop" };
  }

  await upsertCustomerMapping(userId!, appUserId);
  const synced = await upsertSubscriptionRow(userId!, evt);
  await syncEntitlementsForUser(
    userId!,
    synced.planId,
    synced.status,
    synced.periodEnd,
  );
  return { ok: true };
}
