import { Router, type Request, type Response } from "express";
import { db, userRolesTable } from "@workspace/db";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";
import { recordAudit, reqAudit } from "../lib/audit";
import { getClerkUserEmail } from "../lib/roles";

const router = Router();

// GET /admin/invites — list pending + accepted role rows so admins can
// see who has been invited and which invites have not yet been claimed.
router.get(
  "/admin/invites",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const rows = await db
        .select()
        .from(userRolesTable)
        .orderBy(desc(userRolesTable.createdAt));
      res.json({
        invites: rows.map((r) => ({
          id: r.id,
          email: r.email,
          role: r.role,
          clerk_user_id: r.clerkUserId,
          invited_by_email: r.invitedByEmail,
          invited_at: r.invitedAt ? r.invitedAt.toISOString() : null,
          accepted_at: r.acceptedAt ? r.acceptedAt.toISOString() : null,
          status: r.acceptedAt ? "accepted" : r.invitedAt ? "pending" : "active",
        })),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to list invites");
      res.status(500).json({ error: "Server error" });
    }
  },
);

// POST /admin/invites — invite a new admin by email. Calls Clerk's
// invitations API with public_metadata.role=admin so the invitee inherits
// the role on signup, and stores a pending row in user_roles. The Clerk
// webhook will later flip accepted_at + bind clerk_user_id.
router.post(
  "/admin/invites",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { email, role } = req.body as { email?: unknown; role?: unknown };
    const lowered = typeof email === "string" ? email.trim().toLowerCase() : "";
    const desiredRole = typeof role === "string" && role.trim() ? role.trim() : "admin";
    if (!lowered || !lowered.includes("@")) {
      res.status(400).json({ error: "Valid email required" });
      return;
    }

    const inviterEmail = await getClerkUserEmail(req.userId!);
    const { ip, userAgent } = reqAudit(req);

    try {
      // Idempotent: if a row already exists for (email, role), reuse it.
      const existing = await db
        .select()
        .from(userRolesTable)
        .where(and(eq(userRolesTable.email, lowered), eq(userRolesTable.role, desiredRole)))
        .limit(1);

      let rowId: number;
      if (existing.length === 0) {
        const inserted = await db
          .insert(userRolesTable)
          .values({
            email: lowered,
            role: desiredRole,
            invitedByEmail: inviterEmail ? inviterEmail.toLowerCase() : null,
            invitedAt: new Date(),
            userId: "",
          })
          .returning({ id: userRolesTable.id });
        rowId = inserted[0].id;
      } else {
        rowId = existing[0].id;
        await db
          .update(userRolesTable)
          .set({
            invitedByEmail: inviterEmail ? inviterEmail.toLowerCase() : existing[0].invitedByEmail,
            invitedAt: existing[0].invitedAt ?? new Date(),
          })
          .where(eq(userRolesTable.id, rowId));
      }

      // Best-effort Clerk invitation. The role row is the source of
      // truth — if Clerk's API is unreachable we still return ok so the
      // admin can retry with the row already in place. The returned
      // `clerkInvited` flag tells the UI whether the email actually went
      // out so it can prompt the admin to retry the dispatch.
      let clerkInvited = false;
      let clerkError: string | null = null;
      try {
        const apiKey = process.env.CLERK_SECRET_KEY;
        if (!apiKey) {
          clerkError = "CLERK_SECRET_KEY not configured";
        } else {
          const resp = await fetch("https://api.clerk.com/v1/invitations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email_address: lowered,
              public_metadata: { role: desiredRole },
              notify: true,
              ignore_existing: true,
            }),
          });
          if (resp.ok) {
            clerkInvited = true;
          } else {
            const txt = await resp.text().catch(() => "");
            clerkError = `Clerk responded ${resp.status}: ${txt.slice(0, 200)}`;
          }
        }
      } catch (err) {
        clerkError = err instanceof Error ? err.message : "Clerk request failed";
      }

      await recordAudit({
        userId: req.userId,
        email: inviterEmail,
        action: "invite_issued",
        target: lowered,
        ip,
        userAgent,
        metadata: { role: desiredRole, clerkInvited, clerkError },
      });

      res.json({ ok: true, id: rowId, clerkInvited, clerkError });
    } catch (err) {
      req.log.error({ err }, "Failed to issue invite");
      res.status(500).json({ error: "Server error" });
    }
  },
);

// DELETE /admin/invites/:id — revoke a pending or accepted role row.
router.delete(
  "/admin/invites/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (!Number.isInteger(idNum)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const inviterEmail = await getClerkUserEmail(req.userId!);
    const { ip, userAgent } = reqAudit(req);
    try {
      const existing = await db
        .select()
        .from(userRolesTable)
        .where(eq(userRolesTable.id, idNum))
        .limit(1);
      if (existing.length === 0) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      await db.delete(userRolesTable).where(eq(userRolesTable.id, idNum));
      await recordAudit({
        userId: req.userId,
        email: inviterEmail,
        action: "role_change",
        target: existing[0].email,
        ip,
        userAgent,
        metadata: { removed: existing[0].role },
      });
      res.json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Failed to delete invite");
      res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;

// Internal helper used by the Clerk webhook so role binding logic lives
// alongside the other invite code.
export async function bindInviteOnClerkUser(
  clerkUserId: string,
  email: string | null,
): Promise<{ bound: number }> {
  if (!email) return { bound: 0 };
  const lower = email.toLowerCase();
  const pending = await db
    .select()
    .from(userRolesTable)
    .where(
      and(
        eq(userRolesTable.email, lower),
        or(isNull(userRolesTable.clerkUserId), eq(userRolesTable.clerkUserId, "")),
      ),
    );
  if (pending.length === 0) return { bound: 0 };
  await db
    .update(userRolesTable)
    .set({ clerkUserId, userId: clerkUserId, acceptedAt: new Date() })
    .where(
      and(
        eq(userRolesTable.email, lower),
        or(isNull(userRolesTable.clerkUserId), eq(userRolesTable.clerkUserId, "")),
      ),
    );
  return { bound: pending.length };
}
