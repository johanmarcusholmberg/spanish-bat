import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable, userRolesTable, userStreaksTable, userProgressTable, userLastActivityTable, userVocabularyTable, contactMessagesTable, activityLogTable } from "@workspace/db";
import { eq, gte, count, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// Middleware to require admin role
const requireAdmin = async (req: any, res: any, next: any) => {
  const userId = req.userId;
  try {
    const roles = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
    if (!roles.some(r => r.role === "admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch {
    return res.status(403).json({ error: "Forbidden" });
  }
};

// GET /admin/users - fetch all users with stats
router.get("/admin/users", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const profiles = await db.select().from(profilesTable).orderBy(desc(profilesTable.createdAt));
    const roles = await db.select().from(userRolesTable);
    const streaks = await db.select().from(userStreaksTable);
    const progressRows = await db.select().from(userProgressTable);
    const lastActivities = await db.select().from(userLastActivityTable);

    const users = profiles.map(p => {
      const userRoles = roles.filter(r => r.userId === p.userId).map(r => r.role);
      const streak = streaks.find(s => s.userId === p.userId);
      const progress = progressRows.filter(pr => pr.userId === p.userId);
      const lastAct = lastActivities.find(la => la.userId === p.userId);
      return {
        user_id: p.userId,
        display_name: p.displayName,
        email: p.email,
        level: p.level,
        learning_from: p.learningFrom,
        account_status: p.accountStatus,
        created_at: p.createdAt,
        roles: userRoles,
        streak: streak ? {
          current: streak.currentStreak,
          longest: streak.longestStreak,
          last_active: streak.lastActiveDate,
        } : null,
        progress: progress.map(pr => ({ category: pr.category, completed: pr.completed, total: pr.total })),
        last_activity: lastAct ? { type: lastAct.exerciseType, label: lastAct.exerciseLabel, date: lastAct.updatedAt } : null,
      };
    });
    return res.json({ users });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch admin users");
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/messages - fetch contact messages
router.get("/admin/messages", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const messages = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
    return res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch admin messages");
    return res.status(500).json({ error: "Server error" });
  }
});

// PATCH /admin/messages/:id - update contact message status
router.patch("/admin/messages/:id", requireAuth, requireAdmin, async (req: any, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;
  try {
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    await db.update(contactMessagesTable).set(updates).where(eq(contactMessagesTable.id, id));
    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update message");
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/insights - fetch aggregate insights
router.get("/admin/insights", requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const profiles = await db.select().from(profilesTable);
    const vocabulary = await db.select().from(userVocabularyTable);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const recentActivity = await db.select().from(activityLogTable).where(gte(activityLogTable.activityDate, oneWeekAgo));

    const levelDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    let recentSignups = 0;

    for (const p of profiles) {
      levelDistribution[p.level || "A1"] = (levelDistribution[p.level || "A1"] || 0) + 1;
      statusDistribution[p.accountStatus || "active"] = (statusDistribution[p.accountStatus || "active"] || 0) + 1;
      if (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        recentSignups++;
      }
    }

    const activeUsers = new Set(recentActivity.map(a => a.userId)).size;

    const insights = {
      levelDistribution,
      statusDistribution,
      recentSignups,
      activeUsersLastWeek: activeUsers,
      vocabularyStats: {
        total: vocabulary.length,
        learned: vocabulary.filter(v => v.learned).length,
      },
    };

    return res.json(insights);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch insights");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
