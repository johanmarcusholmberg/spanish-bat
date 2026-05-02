import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable, userRolesTable, userStreaksTable, userProgressTable, userLastActivityTable, userVocabularyTable, contactMessagesTable, activityLogTable, userSubscriptionsTable, userEntitlementsTable, subscriptionEventsTable } from "@workspace/db";
import { eq, gte, desc } from "drizzle-orm";
import { getPlanDefinition, type PlanId } from "@workspace/subscription";
import { requireAuth } from "../middlewares/requireAuth";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  getActiveSubscription,
  getUserEntitlements,
} from "../lib/subscription";
import type { Request, Response } from "express";

const router = Router();

// GET /admin/users - fetch all users with stats
router.get("/admin/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const profiles = await db.select().from(profilesTable).orderBy(desc(profilesTable.createdAt));
    const roles = await db.select().from(userRolesTable);
    const streaks = await db.select().from(userStreaksTable);
    const progressRows = await db.select().from(userProgressTable);
    const lastActivities = await db.select().from(userLastActivityTable);

    const users = profiles.map((p) => {
      const userRoles = roles.filter((r) => r.userId === p.userId).map((r) => r.role);
      const streak = streaks.find((s) => s.userId === p.userId);
      const progress = progressRows.filter((pr) => pr.userId === p.userId);
      const lastAct = lastActivities.find((la) => la.userId === p.userId);
      return {
        user_id: p.userId,
        display_name: p.displayName,
        email: p.email,
        level: p.level,
        learning_from: p.learningFrom,
        account_status: p.accountStatus,
        created_at: p.createdAt,
        roles: userRoles,
        streak: streak
          ? { current: streak.currentStreak, longest: streak.longestStreak, last_active: streak.lastActiveDate }
          : null,
        progress: progress.map((pr) => ({ category: pr.category, completed: pr.completed, total: pr.total })),
        last_activity: lastAct
          ? { type: lastAct.exerciseType, label: lastAct.exerciseLabel, date: lastAct.updatedAt }
          : null,
      };
    });
    res.json({ users });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch admin users");
    res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/messages - fetch contact messages
router.get("/admin/messages", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const messages = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch admin messages");
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /admin/messages/:id - update contact message status
router.patch("/admin/messages/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, adminNotes } = req.body;
  try {
    const updates: Record<string, string> = {};
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    await db.update(contactMessagesTable).set(updates).where(eq(contactMessagesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update message");
    res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/insights - fetch aggregate insights
router.get("/admin/insights", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const profiles = await db.select().from(profilesTable);
    const vocabulary = await db.select().from(userVocabularyTable);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const recentActivity = await db
      .select()
      .from(activityLogTable)
      .where(gte(activityLogTable.activityDate, oneWeekAgo));

    const levelDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    let recentSignups = 0;

    for (const p of profiles) {
      const lvl = p.level ?? "A1";
      const status = p.accountStatus ?? "active";
      levelDistribution[lvl] = (levelDistribution[lvl] ?? 0) + 1;
      statusDistribution[status] = (statusDistribution[status] ?? 0) + 1;
      if (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        recentSignups++;
      }
    }

    const activeUsers = new Set(recentActivity.map((a) => a.userId)).size;

    const progressRows = await db.select().from(userProgressTable);
    const categoryProgress: Record<string, { completed: number; total: number }> = {};
    for (const row of progressRows) {
      const cat = row.category;
      if (!categoryProgress[cat]) categoryProgress[cat] = { completed: 0, total: 0 };
      categoryProgress[cat].completed += row.completed ?? 0;
      categoryProgress[cat].total += row.total ?? 0;
    }

    res.json({
      levelDistribution,
      statusDistribution,
      recentSignups,
      activeUsersLastWeek: activeUsers,
      categoryProgress,
      vocabularyStats: {
        total: vocabulary.length,
        learned: vocabulary.filter((v) => v.learned).length,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch insights");
    res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/subscriptions - per-user current plan, entitlements, last sync
router.get("/admin/subscriptions", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const profiles = await db.select().from(profilesTable).orderBy(desc(profilesTable.createdAt));
    const subs = await db.select().from(userSubscriptionsTable);
    const ents = await db.select().from(userEntitlementsTable);
    const recentEvents = await db
      .select()
      .from(subscriptionEventsTable)
      .orderBy(desc(subscriptionEventsTable.createdAt))
      .limit(50);

    // Use the shared subscription resolver per user so admin view never
    // drifts from what users actually see in /api/subscription. Sequential
    // is fine — admin pages are low-volume.
    const rows = await Promise.all(
      profiles.map(async (p) => {
        const userSubs = subs.filter((s) => s.userId === p.userId);
        const userEnts = ents.filter((e) => e.userId === p.userId);
        const [view, active] = await Promise.all([
          getUserEntitlements(p.userId),
          getActiveSubscription(p.userId),
        ]);
        const def = getPlanDefinition(view.planId as PlanId);
        const lastSubUpdate = userSubs.reduce<Date | null>((acc, s) => {
          if (!s.updatedAt) return acc;
          return !acc || s.updatedAt > acc ? s.updatedAt : acc;
        }, null);
        const lastEntGrant = userEnts.reduce<Date | null>((acc, e) => {
          if (!e.grantedAt) return acc;
          return !acc || e.grantedAt > acc ? e.grantedAt : acc;
        }, null);
        const lastSyncAt =
          lastSubUpdate && lastEntGrant
            ? lastSubUpdate > lastEntGrant
              ? lastSubUpdate
              : lastEntGrant
            : (lastSubUpdate ?? lastEntGrant);
        return {
          user_id: p.userId,
          email: p.email,
          display_name: p.displayName,
          plan_id: view.planId,
          plan_label: def.displayName,
          is_premium: view.isPremium,
          status: view.status,
          provider: active.provider,
          current_period_end: active.currentPeriodEnd,
          cancel_at_period_end: active.cancelAtPeriodEnd,
          entitlements: userEnts.map((e) => ({
            key: e.entitlementKey,
            source: e.source,
            expires_at: e.expiresAt ? e.expiresAt.toISOString() : null,
          })),
          last_sync_at: lastSyncAt ? lastSyncAt.toISOString() : null,
        };
      }),
    );

    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.plan_id] = (counts[r.plan_id] ?? 0) + 1;

    res.json({
      users: rows,
      counts,
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        provider: e.provider,
        event_type: e.eventType,
        user_id: e.userId,
        created_at: e.createdAt ? e.createdAt.toISOString() : null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch admin subscriptions");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
