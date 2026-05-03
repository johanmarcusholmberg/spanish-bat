/**
 * Shared helper for the per-user daily-session counter. Centralises the
 * "what day is it for this user" rule and the two SQL primitives so
 * `/generate-practice-session` (the authoritative incrementer) and
 * `/daily-sessions/record` (the offline catch-up sync) agree.
 */

import { db, userDailySessionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

/**
 * Compute YYYY-MM-DD for a user given their reported timezone offset
 * in minutes east of UTC (matching `-Date.prototype.getTimezoneOffset()`).
 * Clamped to ±14h to bound abuse: even at the extremes the user can
 * only "skip" forward by ~28h once.
 */
export function deriveDay(tzOffsetMinutes: number, now: Date = new Date()): string {
  const clamped = Math.max(-14 * 60, Math.min(14 * 60, tzOffsetMinutes));
  const shifted = new Date(now.getTime() + clamped * 60_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseTzOffset(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

export interface ConsumeResult {
  /** True when the increment was applied (caller may proceed). */
  ok: boolean;
  /** Server-side count for `today` after the operation. */
  count: number;
  /** Effective day stored in the row. */
  day: string;
}

/**
 * Atomic check-and-increment: bump `count` for today by 1 iff doing so
 * would not exceed `limit`. New-day rolls reset to 1. A finite `limit`
 * is required; pass Infinity from the caller for premium and skip this
 * helper entirely.
 *
 * Implementation is a single `INSERT … ON CONFLICT DO UPDATE … WHERE`
 * so concurrent callers can't both pass a stale read check. The WHERE
 * filters the conflict update; if it matches but the predicate fails,
 * `RETURNING` is empty and we know we hit the cap.
 */
export async function tryConsumeDailySession(
  userId: string,
  today: string,
  limit: number,
): Promise<ConsumeResult> {
  const updated = await db
    .insert(userDailySessionsTable)
    .values({ userId, day: today, count: 1 })
    .onConflictDoUpdate({
      target: userDailySessionsTable.userId,
      set: {
        day: sql`EXCLUDED.day`,
        count: sql`CASE
            WHEN ${userDailySessionsTable.day} <> EXCLUDED.day THEN 1
            ELSE ${userDailySessionsTable.count} + 1
          END`,
        updatedAt: new Date(),
      },
      where: sql`${userDailySessionsTable.day} <> EXCLUDED.day OR ${userDailySessionsTable.count} < ${limit}`,
    })
    .returning({
      day: userDailySessionsTable.day,
      count: userDailySessionsTable.count,
    });
  if (updated.length > 0) {
    const r = updated[0]!;
    return { ok: true, count: r.count, day: r.day };
  }
  // Conflict matched but WHERE rejected → already at cap for today.
  const current = await db
    .select()
    .from(userDailySessionsTable)
    .where(eq(userDailySessionsTable.userId, userId))
    .limit(1);
  const c = current[0];
  return { ok: false, count: c?.count ?? limit, day: c?.day ?? today };
}

/**
 * Offline catch-up sync. Raises the stored count for `day` to at least
 * `localCount` without ever adding +1 on its own (so it can't
 * double-count alongside `tryConsumeDailySession`). On a new day the
 * stored row is reset to `max(1, localCount)`.
 */
export async function syncDailySessionFloor(
  userId: string,
  day: string,
  localCount: number,
): Promise<{ day: string; count: number }> {
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
              THEN GREATEST(${userDailySessionsTable.count}, EXCLUDED.count)
            ELSE EXCLUDED.count
          END`,
        updatedAt: new Date(),
      },
    })
    .returning({
      day: userDailySessionsTable.day,
      count: userDailySessionsTable.count,
    });
  const r = rows[0];
  if (!r) throw new Error("syncDailySessionFloor: empty returning");
  return { day: r.day, count: r.count };
}
