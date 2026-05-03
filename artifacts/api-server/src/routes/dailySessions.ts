import { Router } from "express";
import { db } from "@workspace/db";
import { userDailySessionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

/**
 * Compute YYYY-MM-DD for a user given their reported timezone offset
 * (in minutes east of UTC, matching JS `-Date.prototype.getTimezoneOffset()`
 * — i.e. positive for east of UTC). We clamp to ±14h to bound abuse:
 * even at the extremes the user can only "skip" forward by ~28h once.
 */
function deriveDay(tzOffsetMinutes: number): string {
  const clamped = Math.max(-14 * 60, Math.min(14 * 60, tzOffsetMinutes));
  const now = new Date(Date.now() + clamped * 60_000);
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseTzOffset(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

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
 * Record that the user started a session today. The client supplies its
 * timezone offset (so the day boundary respects user-local time) and
 * its local counter (used as a floor for offline catch-up). The
 * canonical `day` is derived server-side — the client cannot forge a
 * future day to reset the counter.
 *
 * The upsert is a single atomic SQL expression so concurrent requests
 * cannot lose increments.
 */
router.post("/daily-sessions/record", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const body = (req.body ?? {}) as Record<string, unknown>;
  const tzOffsetMinutes = parseTzOffset(body.tzOffsetMinutes);
  const localCount = parseLocalCount(body.localCount);
  const day = deriveDay(tzOffsetMinutes);

  try {
    const seedCount = Math.max(1, localCount);
    const rows = await db
      .insert(userDailySessionsTable)
      .values({ userId, day, count: seedCount })
      .onConflictDoUpdate({
        target: userDailySessionsTable.userId,
        set: {
          day: sql`EXCLUDED.day`,
          count: sql`CASE
              WHEN ${userDailySessionsTable.day} = EXCLUDED.day
                THEN GREATEST(${userDailySessionsTable.count} + 1, EXCLUDED.count)
              ELSE EXCLUDED.count
            END`,
          updatedAt: new Date(),
        },
      })
      .returning({
        day: userDailySessionsTable.day,
        count: userDailySessionsTable.count,
      });
    const row = rows[0];
    if (!row) {
      return res.status(500).json({ error: "Server error" });
    }
    return res.json({ dailySession: { day: row.day, count: row.count } });
  } catch (err) {
    req.log.error({ err }, "Failed to record daily session");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
