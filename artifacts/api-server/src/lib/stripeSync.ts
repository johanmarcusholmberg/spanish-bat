/**
 * Persists Stripe webhook events into the existing subscription tables.
 *
 * The schema (`user_subscriptions`, `user_entitlements`,
 * `subscription_events`, `customer_mapping`) is provider-agnostic — Stripe
 * is just one of the writers (RevenueCat does the same on mobile). We
 * resolve the internal `userId` from Stripe metadata first, then fall
 * back to the `customer_mapping` table by Stripe customer id.
 */

import Stripe from "stripe";
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

const PROVIDER = "stripe" as const;

function mapStripeStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "unpaid":
      return "expired";
    case "paused":
      return "in_grace_period";
    case "incomplete":
    default:
      return "none";
  }
}

/** Resolve the price ID from a Stripe subscription's first item. */
function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0];
  return item?.price?.id ?? null;
}

/** Map a Stripe price ID to our internal plan id. */
function planIdFromPriceId(priceId: string | null): PlanId {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) return "premium";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM_YEARLY) return "premium";
  return "free";
}

export async function findUserIdByCustomer(
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  const rows = await db
    .select()
    .from(customerMappingTable)
    .where(
      and(
        eq(customerMappingTable.provider, PROVIDER),
        eq(customerMappingTable.providerCustomerId, customerId),
      ),
    )
    .limit(1);
  return rows[0]?.userId ?? null;
}

export async function upsertCustomerMapping(
  userId: string,
  customerId: string,
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
  if (existing.length > 0) {
    if (existing[0].providerCustomerId !== customerId) {
      logger.warn(
        { userId, oldCustomer: existing[0].providerCustomerId, customerId },
        "Stripe customer id changed for user — keeping old mapping",
      );
    }
    return;
  }
  await db
    .insert(customerMappingTable)
    .values({
      userId,
      provider: PROVIDER,
      providerCustomerId: customerId,
    })
    .onConflictDoNothing();
}

/** Resolve userId from a Stripe object. Prefers metadata, falls back to mapping. */
async function resolveUserId(
  metadataUserId: string | null | undefined,
  customerId: string | null,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  return findUserIdByCustomer(customerId);
}

/** Postgres "unique_violation" error code. */
const PG_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  return code === PG_UNIQUE_VIOLATION;
}

async function recordEvent(
  event: Stripe.Event,
  userId: string | null,
): Promise<{ alreadyProcessed: boolean }> {
  try {
    await db.insert(subscriptionEventsTable).values({
      userId,
      provider: PROVIDER,
      eventType: event.type,
      providerEventId: event.id,
      payload: event as unknown as Record<string, unknown>,
    });
    return { alreadyProcessed: false };
  } catch (err) {
    // Only treat the unique-index collision on (provider, provider_event_id)
    // as a duplicate. Any other DB failure must propagate so Stripe retries
    // — silently swallowing them would permanently miss state.
    if (isUniqueViolation(err)) {
      logger.info(
        { eventId: event.id, type: event.type },
        "Duplicate Stripe event ignored",
      );
      return { alreadyProcessed: true };
    }
    throw err;
  }
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

  // Wipe ALL plan-sourced entitlements for this user (any `plan:*` source),
  // then re-add the current ones if the subscription is active. This way a
  // downgrade premium → free, or a cancellation, correctly drops the old
  // premium grants instead of leaving them stranded. Manual / promo grants
  // (`promo:…`, `manual:…`) are preserved.
  await db
    .delete(userEntitlementsTable)
    .where(
      and(
        eq(userEntitlementsTable.userId, userId),
        like(userEntitlementsTable.source, "plan:%"),
      ),
    );

  if (isActive && planDef.isPremium) {
    const keys = entitlementsForPlan(planId);
    for (const key of keys) {
      await db
        .insert(userEntitlementsTable)
        .values({
          userId,
          entitlementKey: key,
          source: `plan:${planId}`,
          expiresAt: periodEnd ?? null,
        })
        .onConflictDoNothing();
    }
  }
}

async function upsertSubscriptionRow(
  userId: string,
  sub: Stripe.Subscription,
): Promise<{ planId: PlanId; status: SubscriptionStatus; periodEnd: Date | null }> {
  const priceId = priceIdFromSubscription(sub);
  const planId = planIdFromPriceId(priceId);
  const status = mapStripeStatus(sub.status);
  const item = sub.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000)
    : null;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  const existing = await db
    .select()
    .from(userSubscriptionsTable)
    .where(
      and(
        eq(userSubscriptionsTable.provider, PROVIDER),
        eq(userSubscriptionsTable.providerSubscriptionId, sub.id),
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
        cancelAtPeriodEnd: sub.cancel_at_period_end ? "true" : "false",
        trialEnd,
        rawPayload: sub as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptionsTable.id, existing[0].id));
  } else {
    await db.insert(userSubscriptionsTable).values({
      userId,
      planId,
      provider: PROVIDER,
      providerSubscriptionId: sub.id,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end ? "true" : "false",
      trialEnd,
      rawPayload: sub as unknown as Record<string, unknown>,
    });
  }

  return { planId, status, periodEnd };
}

export interface HandleEventResult {
  ok: boolean;
  reason?: string;
}

export async function handleStripeEvent(
  event: Stripe.Event,
): Promise<HandleEventResult> {
  let userId: string | null = null;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadataUserId =
        (session.metadata?.userId as string | undefined) ?? null;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;
      userId = await resolveUserId(metadataUserId, customerId);
      if (userId && customerId) {
        await upsertCustomerMapping(userId, customerId);
      }
      await recordEvent(event, userId);
      // Subscription itself will be synced via the subscription.created /
      // .updated event Stripe also emits — no-op here beyond mapping.
      return { ok: true };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const metadataUserId =
        (sub.metadata?.userId as string | undefined) ?? null;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      userId = await resolveUserId(metadataUserId, customerId);

      const dup = await recordEvent(event, userId);
      if (dup.alreadyProcessed) return { ok: true };

      if (!userId) {
        logger.warn(
          { stripeSubId: sub.id, customerId },
          "Stripe subscription event with no resolvable user — stored event only",
        );
        return { ok: true, reason: "no_user" };
      }
      if (customerId) {
        await upsertCustomerMapping(userId, customerId);
      }

      // For deletions, Stripe sets status="canceled" already; just mirror.
      const synced = await upsertSubscriptionRow(userId, sub);
      await syncEntitlementsForUser(
        userId,
        synced.planId,
        synced.status,
        synced.periodEnd,
      );
      return { ok: true };
    }

    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null;
      userId = await resolveUserId(null, customerId);
      await recordEvent(event, userId);
      // Status flips for failed payments arrive via subscription.updated;
      // we just log here.
      return { ok: true };
    }

    default: {
      await recordEvent(event, null);
      return { ok: true, reason: "ignored" };
    }
  }
}
