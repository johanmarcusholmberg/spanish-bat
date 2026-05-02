/**
 * RevenueCat webhook router.
 *
 * RevenueCat secures webhooks with a simple shared-secret Authorization
 * header configured in the dashboard. We compare it against
 * `REVENUECAT_WEBHOOK_AUTH` (set in Replit Secrets). Without that env
 * var the endpoint refuses all traffic — fail closed.
 *
 * Mounted at `/api/revenuecat/webhook` in app.ts. Uses the global
 * express.json() parser (no signed body to verify, unlike Stripe).
 */

import { Router } from "express";
import {
  handleRevenueCatEvent,
  type RevenueCatEvent,
} from "../lib/revenuecatSync";

const router: Router = Router();

router.post("/", async (req, res) => {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected) {
    return res
      .status(503)
      .json({ error: "RevenueCat webhook not configured." });
  }

  const auth = req.headers.authorization ?? "";
  if (auth !== expected && auth !== `Bearer ${expected}`) {
    return res.status(401).json({ error: "Invalid webhook auth." });
  }

  const evt = req.body as RevenueCatEvent | undefined;
  if (!evt || !evt.event) {
    return res.status(400).json({ error: "Invalid payload." });
  }

  try {
    const result = await handleRevenueCatEvent(evt);
    return res.json({ received: true, ...result });
  } catch (err) {
    req.log.error(
      { err, eventType: evt.event.type },
      "RevenueCat webhook handler failed",
    );
    return res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;
