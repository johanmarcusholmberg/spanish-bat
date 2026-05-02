import { Router } from "express";
import { db } from "@workspace/db";
import { userStreaksTable, activityLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/streaks", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const streak = await db.select().from(userStreaksTable).where(eq(userStreaksTable.userId, userId)).limit(1);
    const activity = await db.select().from(activityLogTable).where(eq(activityLogTable.userId, userId));
    return res.json({
      streak: streak[0] || null,
      activityLog: activity,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch streaks");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/streaks", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { currentStreak, longestStreak, lastActiveDate } = req.body;
  try {
    const existing = await db.select().from(userStreaksTable).where(eq(userStreaksTable.userId, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(userStreaksTable).values({
        userId,
        currentStreak: currentStreak || 0,
        longestStreak: longestStreak || 0,
        lastActiveDate: lastActiveDate || null,
      });
    } else {
      await db.update(userStreaksTable).set({ currentStreak, longestStreak, lastActiveDate }).where(eq(userStreaksTable.userId, userId));
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert streak");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/activity-log", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { activityDate, count } = req.body;
  try {
    const existing = await db.select().from(activityLogTable)
      .where(eq(activityLogTable.userId, userId))
      .limit(1000);
    const found = existing.find(a => a.activityDate === activityDate);
    if (found) {
      await db.update(activityLogTable).set({ count }).where(eq(activityLogTable.id, found.id));
    } else {
      await db.insert(activityLogTable).values({
        id: crypto.randomUUID(),
        userId,
        activityDate,
        count: count || 0,
      });
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert activity log");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
