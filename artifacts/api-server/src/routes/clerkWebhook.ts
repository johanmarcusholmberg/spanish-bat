import { Router, type Request, type Response } from "express";
import { Webhook } from "svix";
import { recordAudit, reqAudit } from "../lib/audit";
import { bindInviteOnClerkUser } from "./adminInvites";

const router = Router();

// POST /api/clerk/webhook — Clerk Svix webhook receiver. Mounted with
// `express.raw({ type: "application/json" })` upstream so we can verify
// the Svix signature against the unparsed body. Without a verified
// signature we never touch the database.
router.post("/", async (req: Request, res: Response) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    req.log?.warn("CLERK_WEBHOOK_SECRET not configured — webhook rejected");
    res.status(503).json({ error: "Webhook not configured" });
    return;
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSig = req.headers["svix-signature"];
  if (!svixId || !svixTimestamp || !svixSig) {
    res.status(400).json({ error: "Missing svix headers" });
    return;
  }

  const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : "";
  let evt: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(rawBody, {
      "svix-id": String(svixId),
      "svix-timestamp": String(svixTimestamp),
      "svix-signature": String(svixSig),
    }) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    req.log?.warn({ err }, "Clerk webhook signature verification failed");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const { ip, userAgent } = reqAudit(req);

  try {
    if (evt.type === "user.created") {
      const data = evt.data as {
        id?: string;
        email_addresses?: { email_address?: string; id?: string }[];
        primary_email_address_id?: string;
      };
      const userId = data.id ?? null;
      const primaryId = data.primary_email_address_id;
      const primary =
        (data.email_addresses ?? []).find((e) => e.id === primaryId) ??
        (data.email_addresses ?? [])[0];
      const email = primary?.email_address ?? null;
      if (userId) {
        const { bound } = await bindInviteOnClerkUser(userId, email);
        if (bound > 0) {
          await recordAudit({
            userId,
            email,
            action: "invite_accepted",
            ip,
            userAgent,
            metadata: { boundRoles: bound },
          });
        }
      }
    } else if (evt.type === "session.created") {
      const data = evt.data as { user_id?: string };
      const userId = data.user_id ?? null;
      if (userId) {
        await recordAudit({
          userId,
          action: "sign_in_success",
          target: "clerk_webhook",
          ip,
          userAgent,
        });
      }
    } else if (evt.type === "session.ended" || evt.type === "session.removed") {
      const data = evt.data as { user_id?: string };
      const userId = data.user_id ?? null;
      if (userId) {
        await recordAudit({ userId, action: "sign_out", ip, userAgent });
      }
    }
  } catch (err) {
    req.log?.error({ err, type: evt.type }, "Clerk webhook handling failed");
    // We still return 200 so Clerk doesn't keep retrying for transient
    // DB issues — every action is also logged via recordAudit's warn path.
  }

  res.json({ ok: true });
});

export default router;
