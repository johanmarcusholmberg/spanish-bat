import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * subscription_plans
 *
 * Catalog of plans the app supports. The "active" subscription model is
 * controlled in code (see `@workspace/subscription` config). This table is
 * the source of truth for billing-side identifiers (Stripe price IDs,
 * RevenueCat / store product IDs).
 *
 * planId is the stable internal identifier (e.g. "free", "premium",
 * "learn", "pro"). Every billing provider keys off of this.
 */
export const subscriptionPlansTable = pgTable(
  "subscription_plans",
  {
    planId: text("plan_id").primaryKey(),
    model: text("model").notNull(),
    displayName: text("display_name").notNull(),
    tier: integer("tier").notNull().default(0),
    stripePriceIdMonthly: text("stripe_price_id_monthly"),
    stripePriceIdYearly: text("stripe_price_id_yearly"),
    revenuecatEntitlementId: text("revenuecat_entitlement_id"),
    appleProductIdMonthly: text("apple_product_id_monthly"),
    appleProductIdYearly: text("apple_product_id_yearly"),
    googleProductIdMonthly: text("google_product_id_monthly"),
    googleProductIdYearly: text("google_product_id_yearly"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    modelIdx: index("subscription_plans_model_idx").on(t.model),
  }),
);

/**
 * user_subscriptions
 *
 * One row per user per provider subscription. A user can in theory have
 * historical rows (e.g. an expired Stripe sub plus a fresh App Store sub),
 * so we don't make user_id unique. The "current" subscription is computed
 * by picking the row with the highest tier among non-expired statuses.
 *
 * provider:        "stripe" | "apple" | "google" | "promo" | "manual"
 * status:          mirrors Stripe / RevenueCat statuses
 *                  ("active" | "trialing" | "past_due" | "canceled" |
 *                   "expired" | "in_grace_period")
 * providerSubscriptionId: id at the provider (Stripe sub id, RC original
 *                  txn id, etc).
 */
export const userSubscriptionsTable = pgTable(
  "user_subscriptions",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    userId: text("user_id").notNull(),
    planId: text("plan_id").notNull(),
    provider: text("provider").notNull(),
    providerSubscriptionId: text("provider_subscription_id"),
    status: text("status").notNull(),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: text("cancel_at_period_end"),
    trialEnd: timestamp("trial_end"),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("user_subscriptions_user_idx").on(t.userId),
    statusIdx: index("user_subscriptions_status_idx").on(t.status),
    providerSubIdx: uniqueIndex("user_subscriptions_provider_sub_idx").on(
      t.provider,
      t.providerSubscriptionId,
    ),
  }),
);

/**
 * user_entitlements
 *
 * Denormalized cache of per-user entitlement keys. We could derive these
 * from the active subscription + plan config on every request, but
 * persisting them lets us:
 *   1. Hand out promo / manual grants without inventing fake plans.
 *   2. Audit exactly what the server believes the user has access to.
 *   3. Cheaply answer "does this user have entitlement X?" from the API.
 *
 * The `source` column records why the entitlement was granted
 * ("plan:premium", "promo:beta", "manual:support"). expiresAt is nullable
 * for forever-grants; otherwise it should track the underlying
 * subscription period end.
 */
export const userEntitlementsTable = pgTable(
  "user_entitlements",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    userId: text("user_id").notNull(),
    entitlementKey: text("entitlement_key").notNull(),
    source: text("source").notNull(),
    grantedAt: timestamp("granted_at").defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => ({
    uniqUserKey: uniqueIndex("user_entitlements_user_key_idx").on(
      t.userId,
      t.entitlementKey,
    ),
    userIdx: index("user_entitlements_user_idx").on(t.userId),
  }),
);

/**
 * subscription_events
 *
 * Append-only log of subscription lifecycle events from any provider.
 * Used for debugging webhooks, reconciliation, and (eventually) showing
 * users their subscription history. We deliberately keep `payload` raw
 * so the full provider event is preserved.
 */
export const subscriptionEventsTable = pgTable(
  "subscription_events",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    userId: text("user_id"),
    provider: text("provider").notNull(),
    eventType: text("event_type").notNull(),
    providerEventId: text("provider_event_id"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    userIdx: index("subscription_events_user_idx").on(t.userId),
    providerEventIdx: uniqueIndex("subscription_events_provider_event_idx").on(
      t.provider,
      t.providerEventId,
    ),
  }),
);

/**
 * customer_mapping
 *
 * Maps our internal user_id (Clerk userId) to provider-side customer
 * identifiers (Stripe customer id, RevenueCat app_user_id). One row per
 * (user_id, provider) pair.
 */
export const customerMappingTable = pgTable(
  "customer_mapping",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    userId: text("user_id").notNull(),
    provider: text("provider").notNull(),
    providerCustomerId: text("provider_customer_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniqUserProvider: uniqueIndex("customer_mapping_user_provider_idx").on(
      t.userId,
      t.provider,
    ),
    uniqProviderCustomer: uniqueIndex(
      "customer_mapping_provider_customer_idx",
    ).on(t.provider, t.providerCustomerId),
  }),
);

export const insertSubscriptionPlanSchema = createInsertSchema(
  subscriptionPlansTable,
).omit({ createdAt: true, updatedAt: true });
export const insertUserSubscriptionSchema = createInsertSchema(
  userSubscriptionsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserEntitlementSchema = createInsertSchema(
  userEntitlementsTable,
).omit({ id: true, grantedAt: true });
export const insertSubscriptionEventSchema = createInsertSchema(
  subscriptionEventsTable,
).omit({ id: true, createdAt: true });
export const insertCustomerMappingSchema = createInsertSchema(
  customerMappingTable,
).omit({ id: true, createdAt: true });

export type SubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;
export type UserSubscriptionRow = typeof userSubscriptionsTable.$inferSelect;
export type UserEntitlementRow = typeof userEntitlementsTable.$inferSelect;
export type SubscriptionEvent = typeof subscriptionEventsTable.$inferSelect;
export type CustomerMapping = typeof customerMappingTable.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type InsertUserEntitlement = z.infer<typeof insertUserEntitlementSchema>;
export type InsertSubscriptionEvent = z.infer<typeof insertSubscriptionEventSchema>;
export type InsertCustomerMapping = z.infer<typeof insertCustomerMappingSchema>;
