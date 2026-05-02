import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  getActiveSubscription,
  getUserEntitlements,
} from "../lib/subscription";
import {
  ACTIVE_PLANS,
  ACTIVE_SUBSCRIPTION_MODEL,
} from "@workspace/subscription";

const router = Router();

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
    const [entitlements, subscription] = await Promise.all([
      getUserEntitlements(userId),
      getActiveSubscription(userId),
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
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load subscription");
    return res.status(500).json({ error: "Server error" });
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

export default router;
