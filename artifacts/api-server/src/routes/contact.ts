import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";
import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";

const router = Router();

router.post("/contact", async (req: Request, res: Response) => {
  const auth = getAuth(req);
  const userId = auth?.userId ?? null;
  const { subject, message, email } = req.body;
  try {
    if (!subject || !message || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const id = crypto.randomUUID();
    await db.insert(contactMessagesTable).values({ id, userId, subject, message, email, status: "new" });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to insert contact message");
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/contact-messages", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const messages = await db.select().from(contactMessagesTable);
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch contact messages");
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/contact-messages/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, adminNotes } = req.body;
  try {
    const updates: Record<string, string> = {};
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    await db.update(contactMessagesTable).set(updates).where(eq(contactMessagesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update contact message");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
