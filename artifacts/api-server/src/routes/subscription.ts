import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { userSubscriptionsTable, userEntitlementsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  getActiveSubscription,
  getUserEntitlements,
} from "../lib/subscription";
import {
  ACTIVE_PLANS,
  ACTIVE_SUBSCRIPTION_MODEL,
} from "@workspace/subscription";
import { isStripeConfigured } from "../lib/stripe";

const router = Router();

/**
 * Lookup the most recent provider-sourced sync timestamp for a user.
 * Used by the UI's debug panel and the manage page to surface "last
 * heard from the billing provider at X". Returns null when the user has
 * never had a paid subscription or entitlement row written.
 */
async function getLastSyncAt(userId: string): Promise<string | null> {
  const subRows = await db
    .select({ updatedAt: userSubscriptionsTable.updatedAt })
    .from(userSubscriptionsTable)
    .where(eq(userSubscriptionsTable.userId, userId))
    .orderBy(desc(userSubscriptionsTable.updatedAt))
    .limit(1);
  const entRows = await db
    .select({ grantedAt: userEntitlementsTable.grantedAt })
    .from(userEntitlementsTable)
    .where(eq(userEntitlementsTable.userId, userId))
    .orderBy(desc(userEntitlementsTable.grantedAt))
    .limit(1);
  const candidates = [
    subRows[0]?.updatedAt ?? null,
    entRows[0]?.grantedAt ?? null,
  ].filter((d): d is Date => d instanceof Date);
  if (candidates.length === 0) return null;
  return new Date(Math.max(...candidates.map((d) => d.getTime()))).toISOString();
}

/**
 * GET /api/subscription
 *
 * Returns the signed-in user's entitlement view + their active
 * subscription metadata. This is the single endpoint frontends should
 * call to render gating, paywalls, and account screens.
 */
router.get("/subscription", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const [entitlements, subscription, lastSyncAt] = await Promise.all([
      getUserEntitlements(userId),
      getActiveSubscription(userId),
      getLastSyncAt(userId),
    ]);
    return res.json({
      model: ACTIVE_SUBSCRIPTION_MODEL,
      plans: ACTIVE_PLANS.map((p) => ({
        planId: p.planId,
        displayName: p.displayName,
        tier: p.tier,
        isPremium: p.isPremium,
        entitlements: p.entitlements,
      })),
      entitlements,
      subscription,
      lastSyncAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load subscription");
    return res.status(500).json({ error: "Failed to load subscription" });
  }
});

/**
 * GET /api/subscription/plans
 *
 * Public list of plans for the active model (no auth required) — useful
 * for marketing pages and the pre-signup pricing screen.
 */
router.get("/subscription/plans", (_req, res) => {
  res.json({
    model: ACTIVE_SUBSCRIPTION_MODEL,
    plans: ACTIVE_PLANS.map((p) => ({
      planId: p.planId,
      displayName: p.displayName,
      tier: p.tier,
      isPremium: p.isPremium,
      entitlements: p.entitlements,
    })),
  });
});

/**
 * GET /api/subscription/health
 *
 * Public, no-auth health summary of the subscription stack. Reports
 * which providers are configured WITHOUT ever returning a secret value
 * — only "is this env var present" booleans. Safe to call from the web
 * bundle, the mobile app, and the admin dashboard.
 */
router.get("/subscription/health", (_req, res) => {
  res.json({
    model: ACTIVE_SUBSCRIPTION_MODEL,
    stripe: {
      configured: isStripeConfigured(),
      env: {
        STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
        STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        STRIPE_PRICE_PREMIUM_MONTHLY: Boolean(
          process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
        ),
        STRIPE_PRICE_PREMIUM_YEARLY: Boolean(
          process.env.STRIPE_PRICE_PREMIUM_YEARLY,
        ),
        VITE_STRIPE_PUBLISHABLE_KEY: Boolean(
          process.env.VITE_STRIPE_PUBLISHABLE_KEY,
        ),
      },
    },
    revenuecat: {
      // The mobile SDK keys are EXPO_PUBLIC_* and live in the mobile
      // bundle (intentionally public per RC's docs). The server only
      // needs the webhook auth secret to receive events.
      webhookConfigured: Boolean(process.env.REVENUECAT_WEBHOOK_AUTH),
      env: {
        REVENUECAT_WEBHOOK_AUTH: Boolean(process.env.REVENUECAT_WEBHOOK_AUTH),
        RC_PRODUCT_MONTHLY: Boolean(process.env.RC_PRODUCT_MONTHLY),
        RC_PRODUCT_YEARLY: Boolean(process.env.RC_PRODUCT_YEARLY),
      },
    },
  });
});

export default router;
