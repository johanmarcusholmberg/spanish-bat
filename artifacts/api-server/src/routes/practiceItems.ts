/**
 * Persistent practice items library.
 *
 *   GET  /api/practice-items                -> approved, non-flagged items
 *   POST /api/practice-items/:id/report     -> user feedback
 *   POST /api/practice-items/:id/usage      -> increment usage / success counters
 *
 * AI items are saved server-side from `practiceAi.ts` after validation.
 */

import { Router } from "express";
import { db } from "@workspace/db";
import {
  practiceItemsTable,
  practiceItemReportsTable,
} from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const VALID_REASONS = new Set([
  "confusing",
  "wrong_answer",
  "too_hard",
  "too_easy",
]);

/** Items with this many independent reports are auto-flagged. */
const REPORT_FLAG_THRESHOLD = 3;

router.get("/practice-items", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(
      500,
      Math.max(1, Number(req.query.limit) || 200),
    );
    const level = typeof req.query.level === "string" ? req.query.level : null;

    const baseWhere = and(
      eq(practiceItemsTable.approved, true),
      eq(practiceItemsTable.flagged, false),
    );

    const rows = await db
      .select()
      .from(practiceItemsTable)
      .where(
        level
          ? and(baseWhere, eq(practiceItemsTable.level, level))
          : baseWhere,
      )
      .limit(limit);

    return res.json({ items: rows });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch practice items");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/practice-items/:id/report", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = String(req.params.id);
  const reason = String(req.body?.reason ?? "").trim();
  const note =
    typeof req.body?.note === "string"
      ? req.body.note.trim().slice(0, 500)
      : null;

  if (!VALID_REASONS.has(reason)) {
    return res.status(400).json({ error: "Invalid reason" });
  }

  try {
    const existing = await db
      .select()
      .from(practiceItemsTable)
      .where(eq(practiceItemsTable.id, id))
      .limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    // Dedup: one report per (user, item, reason).
    const dupe = await db
      .select()
      .from(practiceItemReportsTable)
      .where(
        and(
          eq(practiceItemReportsTable.userId, userId),
          eq(practiceItemReportsTable.itemId, id),
          eq(practiceItemReportsTable.reason, reason),
        ),
      )
      .limit(1);

    if (dupe.length === 0) {
      await db.insert(practiceItemReportsTable).values({
        id: crypto.randomUUID(),
        itemId: id,
        userId,
        reason,
        note,
      });

      const newCount = (existing[0].reportCount ?? 0) + 1;
      const shouldFlag = newCount >= REPORT_FLAG_THRESHOLD;
      await db
        .update(practiceItemsTable)
        .set({
          reportCount: newCount,
          ...(shouldFlag ? { flagged: true } : {}),
        })
        .where(eq(practiceItemsTable.id, id));
    }

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to record practice item report");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/practice-items/:id/usage", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const correct = Boolean(req.body?.correct);

  try {
    await db
      .update(practiceItemsTable)
      .set({
        usageCount: sql`${practiceItemsTable.usageCount} + 1`,
        ...(correct
          ? { successCount: sql`${practiceItemsTable.successCount} + 1` }
          : {}),
      })
      .where(eq(practiceItemsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update practice item usage");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
