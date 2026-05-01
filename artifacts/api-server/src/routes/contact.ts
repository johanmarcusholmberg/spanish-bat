import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

router.post("/contact", async (req, res) => {
  const auth = getAuth(req as any);
  const userId = (auth as any)?.sessionClaims?.userId || auth?.userId || null;
  const { subject, message, email } = req.body;
  try {
    if (!subject || !message || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const id = crypto.randomUUID();
    await db.insert(contactMessagesTable).values({ id, userId, subject, message, email, status: "new" });
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to insert contact message");
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/contact-messages", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const auth = getAuth(req as any);
    const messages = await db.select().from(contactMessagesTable);
    return res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch contact messages");
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/contact-messages/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  try {
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    await db.update(contactMessagesTable).set(updates).where(eq(contactMessagesTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update contact message");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
