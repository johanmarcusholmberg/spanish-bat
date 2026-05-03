import { Router, type Request, type Response } from "express";
import { db, auditLogTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit, reqAudit } from "../lib/audit";
import { getClerkUserEmail } from "../lib/roles";

const router = Router();

// GET /admin/audit — most recent 200 audit entries with optional
// (action, email) filters. Admin-only.
router.get(
  "/admin/audit",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const action = typeof req.query.action === "string" ? req.query.action : null;
    const email = typeof req.query.email === "string" ? req.query.email.toLowerCase() : null;
    try {
      const conditions = [];
      if (action) conditions.push(eq(auditLogTable.action, action));
      if (email) conditions.push(eq(auditLogTable.email, email));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = where
        ? await db.select().from(auditLogTable).where(where).orderBy(desc(auditLogTable.createdAt)).limit(200)
        : await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(200);
      const distinctActions = await db
        .selectDistinct({ action: auditLogTable.action })
        .from(auditLogTable)
        .orderBy(sql`${auditLogTable.action} asc`);
      res.json({
        entries: rows.map((r) => ({
          id: r.id,
          user_id: r.userId,
          email: r.email,
          action: r.action,
          target: r.target,
          ip: r.ip,
          user_agent: r.userAgent,
          metadata: r.metadata,
          created_at: r.createdAt.toISOString(),
        })),
        actions: distinctActions.map((a) => a.action),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to read audit log");
      res.status(500).json({ error: "Server error" });
    }
  },
);

// POST /admin/audit/sign-in — clients call this after a successful
// sign-in (web + mobile) so we can record the event with the request's
// real IP/UA. Server can't intercept Clerk's first-factor flow itself.
router.post("/audit/sign-in", requireAuth, async (req: Request, res: Response) => {
  const userId = req.userId!;
  const email = await getClerkUserEmail(userId);
  const { ip, userAgent } = reqAudit(req);
  const method = typeof req.body?.method === "string" ? req.body.method : "unknown";
  await recordAudit({
    userId,
    email,
    action: "sign_in_success",
    target: method,
    ip,
    userAgent,
  });
  res.json({ ok: true });
});

// POST /admin/audit/sign-out — fire-and-forget log of a deliberate
// client-side sign-out. We can't get the userId from Clerk anymore once
// the session is cleared, so the client passes its remembered id/email.
router.post("/audit/sign-out", async (req: Request, res: Response) => {
  const userId = typeof req.body?.userId === "string" ? req.body.userId : null;
  const email = typeof req.body?.email === "string" ? req.body.email : null;
  const { ip, userAgent } = reqAudit(req);
  await recordAudit({
    userId,
    email,
    action: "sign_out",
    ip,
    userAgent,
  });
  res.json({ ok: true });
});

// POST /admin/audit/2fa-enrolled — admin-only, fired by the TOTP setup
// page once the user verifies their authenticator app + saves backup
// codes. The handler also flips Clerk public_metadata.adminTotpEnrolled.
router.post(
  "/audit/2fa-enrolled",
  requireAuth,
  async (req: Request, res: Response) => {
    const userId = req.userId!;
    const email = await getClerkUserEmail(userId);
    const { ip, userAgent } = reqAudit(req);
    try {
      const apiKey = process.env.CLERK_SECRET_KEY;
      if (apiKey) {
        await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_metadata: { adminTotpEnrolled: true, adminTotpEnrolledAt: new Date().toISOString() },
          }),
        });
      }
    } catch (err) {
      req.log.warn({ err }, "Failed to set adminTotpEnrolled metadata");
    }
    await recordAudit({
      userId,
      email,
      action: "admin_2fa_enrolled",
      ip,
      userAgent,
    });
    res.json({ ok: true });
  },
);

export default router;
