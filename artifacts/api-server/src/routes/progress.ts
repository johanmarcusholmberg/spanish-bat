import { Router } from "express";
import { db } from "@workspace/db";
import { userProgressTable, userLastActivityTable, grammarProgressTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/progress", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const progress = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
    const lastActivity = await db.select().from(userLastActivityTable).where(eq(userLastActivityTable.userId, userId)).limit(1);
    return res.json({
      progress,
      lastActivity: lastActivity[0] || null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch progress");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/progress", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { category, completed, total } = req.body;
  try {
    const existing = await db.select().from(userProgressTable)
      .where(and(eq(userProgressTable.userId, userId), eq(userProgressTable.category, category)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(userProgressTable).values({ id: crypto.randomUUID(), userId, category, completed, total });
    } else {
      await db.update(userProgressTable).set({ completed, total }).where(eq(userProgressTable.id, existing[0].id));
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert progress");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/last-activity", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { exerciseType, exercisePath, exerciseLabel } = req.body;
  try {
    const existing = await db.select().from(userLastActivityTable).where(eq(userLastActivityTable.userId, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(userLastActivityTable).values({ userId, exerciseType, exercisePath, exerciseLabel });
    } else {
      await db.update(userLastActivityTable).set({ exerciseType, exercisePath, exerciseLabel }).where(eq(userLastActivityTable.userId, userId));
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert last activity");
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/grammar-progress", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const grammarProgress = await db.select().from(grammarProgressTable).where(eq(grammarProgressTable.userId, userId));
    return res.json({ grammarProgress });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch grammar progress");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/grammar-progress", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { lessonId, completed, bestScore, attempts } = req.body;
  try {
    const existing = await db.select().from(grammarProgressTable)
      .where(and(eq(grammarProgressTable.userId, userId), eq(grammarProgressTable.lessonId, lessonId)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(grammarProgressTable).values({ id: crypto.randomUUID(), userId, lessonId, completed, bestScore, attempts });
    } else {
      await db.update(grammarProgressTable).set({ completed, bestScore, attempts }).where(eq(grammarProgressTable.id, existing[0].id));
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert grammar progress");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
