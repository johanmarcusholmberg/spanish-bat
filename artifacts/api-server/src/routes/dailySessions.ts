import { Router } from "express";
import { db, userDailySessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  deriveDay,
  parseTzOffset,
  syncDailySessionFloor,
} from "../lib/dailySessions";

const router = Router();

function parseLocalCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  const n = Math.floor(value);
  if (n < 0) return 0;
  if (n > 1000) return 1000;
  return n;
}

router.get("/daily-sessions", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const rows = await db
      .select()
      .from(userDailySessionsTable)
      .where(eq(userDailySessionsTable.userId, userId))
      .limit(1);
    return res.json({ dailySession: rows[0] ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch daily session counter");
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Offline catch-up sync. The authoritative session-start increment now
 * happens inside `/generate-practice-session`; this endpoint only
 * raises the server count to match a higher local count from a client
 * that started sessions while offline. It never adds +1 on its own, so
 * it can't double-count when called alongside `/generate`.
 *
 * On a new day the server stored row is reset to `max(1, localCount)`
 * — preserves any offline sessions the client recorded locally before
 * coming back online.
 */
router.post("/daily-sessions/record", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = (req.body ?? {}) as Record<string, unknown>;
  const tzOffsetMinutes = parseTzOffset(body.tzOffsetMinutes);
  const localCount = parseLocalCount(body.localCount);
  const day = deriveDay(tzOffsetMinutes);

  try {
    const row = await syncDailySessionFloor(userId, day, localCount);
    return res.json({ dailySession: { day: row.day, count: row.count } });
  } catch (err) {
    req.log.error({ err }, "Failed to record daily session");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
