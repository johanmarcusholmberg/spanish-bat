/**
 * Stripe Checkout / Customer Portal endpoints (web subscriptions).
 *
 * The webhook lives in `stripeWebhook.ts` because it must be mounted
 * with `express.raw()` *before* the global JSON parser.
 */

import { Router } from "express";
import type Stripe from "stripe";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  getStripe,
  getStripePriceConfig,
  isStripeConfigured,
  StripeNotConfiguredError,
} from "../lib/stripe";
import { findUserIdByCustomer, upsertCustomerMapping } from "../lib/stripeSync";
import { db } from "@workspace/db";
import { customerMappingTable, userSubscriptionsTable } from "@workspace/db";

const router: Router = Router();

const PROVIDER = "stripe" as const;

function originFromReq(req: import("express").Request): string {
  const fwd = req.get("origin") || req.get("referer");
  if (fwd) {
    try {
      const u = new URL(fwd);
      return `${u.protocol}//${u.host}`;
    } catch {
      // fallthrough
    }
  }
  const host = req.get("host") ?? "localhost";
  const proto = req.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

async function findOrCreateCustomer(
  userId: string,
  email: string | null,
): Promise<string> {
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
  if (existing[0]?.providerCustomerId) {
    return existing[0].providerCustomerId;
  }
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });
  await upsertCustomerMapping(userId, customer.id);
  return customer.id;
}

/** GET /api/stripe/config — public price IDs + publishable key for the web UI. */
router.get("/stripe/config", (_req, res) => {
  const cfg = getStripePriceConfig();
  res.json({
    enabled: isStripeConfigured(),
    publishableKey: cfg.publishableKey,
    prices: {
      monthly: cfg.monthly,
      yearly: cfg.yearly,
    },
  });
});

/** POST /api/stripe/checkout — create a Checkout Session for the signed-in user. */
router.post("/stripe/checkout", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const interval = (req.body?.interval ?? "monthly") as "monthly" | "yearly";
  const cfg = getStripePriceConfig();
  const priceId = interval === "yearly" ? cfg.yearly : cfg.monthly;

  if (!isStripeConfigured() || !priceId) {
    return res.status(503).json({
      error:
        "Stripe is not fully configured. Set STRIPE_SECRET_KEY and the matching price ID to enable checkout.",
    });
  }

  try {
    const stripe = getStripe();
    const email =
      (req.body?.email as string | undefined) ??
      (req.headers["x-user-email"] as string | undefined) ??
      null;
    const customerId = await findOrCreateCustomer(userId, email);
    const origin = originFromReq(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancelled`,
      allow_promotion_codes: true,
      client_reference_id: userId,
      subscription_data: {
        metadata: { userId, interval },
      },
      metadata: { userId, interval },
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      return res.status(503).json({ error: err.message });
    }
    req.log.error({ err }, "Failed to create Stripe checkout session");
    return res.status(500).json({ error: "Failed to start checkout" });
  }
});

/** POST /api/stripe/portal — Stripe Customer Portal session (manage subscription). */
router.post("/stripe/portal", requireAuth, async (req, res) => {
  const userId = req.userId!;
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Stripe is not configured." });
  }
  try {
    const stripe = getStripe();
    const mapping = await db
      .select()
      .from(customerMappingTable)
      .where(
        and(
          eq(customerMappingTable.userId, userId),
          eq(customerMappingTable.provider, PROVIDER),
        ),
      )
      .limit(1);
    if (!mapping[0]?.providerCustomerId) {
      return res
        .status(404)
        .json({ error: "No Stripe customer on file for this account." });
    }
    const origin = originFromReq(req);
    const session = await stripe.billingPortal.sessions.create({
      customer: mapping[0].providerCustomerId,
      return_url: `${origin}/billing/manage`,
    });
    return res.json({ url: session.url });
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      return res.status(503).json({ error: err.message });
    }
    req.log.error({ err }, "Failed to create Stripe portal session");
    return res.status(500).json({ error: "Failed to open billing portal" });
  }
});

/**
 * GET /api/stripe/checkout/:sessionId — used by the success page to fetch
 * the just-completed session so we can reflect status quickly even before
 * the webhook lands.
 */
router.get("/stripe/checkout/:sessionId", requireAuth, async (req, res) => {
  const userId = req.userId!;
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Stripe is not configured." });
  }
  try {
    const stripe = getStripe();
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Strict ownership check: the session must positively belong to the
    // signed-in user. Accept either (a) metadata.userId match, (b)
    // client_reference_id match, or (c) the session's customer is mapped
    // to this user in our DB. Reject in all other cases — never let a
    // logged-in user fetch a stranger's session.
    const metaUserId = session.metadata?.userId ?? null;
    const refUserId = session.client_reference_id ?? null;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;
    let owns = metaUserId === userId || refUserId === userId;
    if (!owns && customerId) {
      const ownerId = await findUserIdByCustomer(customerId);
      owns = ownerId === userId;
    }
    if (!owns) {
      return res.status(403).json({ error: "Not your session" });
    }

    return res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as Stripe.Subscription | null)?.id ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to retrieve checkout session");
    return res.status(500).json({ error: "Failed to retrieve session" });
  }
});

/**
 * GET /api/stripe/subscription — convenience read for the manage page; the
 * canonical entitlement view is still /api/subscription.
 */
router.get("/stripe/subscription", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const rows = await db
    .select()
    .from(userSubscriptionsTable)
    .where(
      and(
        eq(userSubscriptionsTable.userId, userId),
        eq(userSubscriptionsTable.provider, PROVIDER),
      ),
    )
    .orderBy(desc(userSubscriptionsTable.updatedAt));
  return res.json({ subscriptions: rows });
});

export default router;
