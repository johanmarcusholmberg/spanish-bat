/**
 * Stripe webhook router.
 *
 * MUST be mounted with `express.raw({ type: "application/json" })`
 * BEFORE the global `express.json()` parser, otherwise the body will be
 * parsed as JSON and signature verification will fail.
 *
 * The mount happens in `app.ts`.
 */

import { Router, type Request } from "express";
import type Stripe from "stripe";
import {
  getStripe,
  getWebhookSecret,
  isStripeConfigured,
  StripeNotConfiguredError,
} from "../lib/stripe";
import { handleStripeEvent } from "../lib/stripeSync";

const router: Router = Router();

// Mounted at /api/stripe/webhook in app.ts, so this is the root path.
router.post("/", async (req: Request, res) => {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "Stripe webhook is not configured." });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    // req.body must be a Buffer here (because of express.raw() in app.ts).
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      getWebhookSecret(),
    );
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      return res.status(503).json({ error: err.message });
    }
    req.log.warn({ err }, "Stripe webhook signature verification failed");
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    const result = await handleStripeEvent(event);
    return res.json({ received: true, ...result });
  } catch (err) {
    req.log.error({ err, eventType: event.type }, "Stripe webhook handler failed");
    // Returning 500 makes Stripe retry, which is what we want.
    return res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;
