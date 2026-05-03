/**
 * Regression tests for the daily-session counter primitives. These hit
 * a real PostgreSQL via DATABASE_URL — they isolate by using random
 * synthetic userIds (no Clerk row required, the `user_id` column is
 * just a text key) and clean up after themselves.
 *
 * Run with: pnpm --filter @workspace/api-server test
 */

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { db, userDailySessionsTable, pool } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

import {
  deriveDay,
  tryConsumeDailySession,
  syncDailySessionFloor,
} from "../lib/dailySessions";

const createdUserIds: string[] = [];

function newUserId(label: string): string {
  const id = `test-${label}-${randomUUID()}`;
  createdUserIds.push(id);
  return id;
}

after(async () => {
  if (createdUserIds.length > 0) {
    await db
      .delete(userDailySessionsTable)
      .where(inArray(userDailySessionsTable.userId, createdUserIds));
  }
  await pool.end();
});

test("deriveDay shifts UTC by tz offset", () => {
  // Base instant: 2026-05-03T01:30:00Z
  const utc = new Date("2026-05-03T01:30:00Z");
  // UTC client: same calendar day
  assert.equal(deriveDay(0, utc), "2026-05-03");
  // Tokyo (+540): rolls forward
  assert.equal(deriveDay(540, utc), "2026-05-03");
  // Honolulu (-600): rolls back to previous day
  assert.equal(deriveDay(-600, utc), "2026-05-02");
  // Out-of-range offsets are clamped to ±840 (14h)
  assert.equal(deriveDay(99999, utc), deriveDay(840, utc));
  assert.equal(deriveDay(-99999, utc), deriveDay(-840, utc));
});

test("tryConsumeDailySession enforces the limit and rejects overflow", async () => {
  const userId = newUserId("cap");
  const today = "2026-05-03";

  const first = await tryConsumeDailySession(userId, today, 1);
  assert.equal(first.ok, true, "first call within limit should succeed");
  assert.equal(first.count, 1);

  const second = await tryConsumeDailySession(userId, today, 1);
  assert.equal(second.ok, false, "second call must be rejected by cap");
  assert.equal(second.count, 1, "rejected call must not bump count");

  // A higher limit on the same day allows another increment.
  const third = await tryConsumeDailySession(userId, today, 5);
  assert.equal(third.ok, true);
  assert.equal(third.count, 2);
});

test("tryConsumeDailySession resets cleanly on day rollover", async () => {
  const userId = newUserId("rollover");

  // Yesterday: hit the cap.
  const y1 = await tryConsumeDailySession(userId, "2026-05-02", 1);
  assert.equal(y1.ok, true);
  const y2 = await tryConsumeDailySession(userId, "2026-05-02", 1);
  assert.equal(y2.ok, false, "yesterday is at cap");

  // Today: a fresh day must not be blocked by yesterday's row, and
  // the count must reset to 1 (not increment to 2).
  const t1 = await tryConsumeDailySession(userId, "2026-05-03", 1);
  assert.equal(t1.ok, true, "new day must not be blocked by stale row");
  assert.equal(t1.count, 1, "new day must reset to 1");
  assert.equal(t1.day, "2026-05-03", "row.day must advance to today");
});

test("tryConsumeDailySession is atomic under concurrent calls", async () => {
  const userId = newUserId("race");
  const today = "2026-05-03";
  const limit = 3;

  // Fire 10 calls in parallel against a limit of 3. Exactly 3 must
  // succeed; the rest must be rejected.
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      tryConsumeDailySession(userId, today, limit),
    ),
  );

  const accepted = results.filter((r) => r.ok).length;
  const rejected = results.filter((r) => !r.ok).length;
  assert.equal(accepted, limit, "exactly `limit` calls should be accepted");
  assert.equal(rejected, 10 - limit, "the rest must be rejected");

  // Final stored count equals the limit — no overshoot.
  const rows = await db
    .select()
    .from(userDailySessionsTable)
    .where(eq(userDailySessionsTable.userId, userId));
  assert.equal(rows[0]?.count, limit, "stored count must not exceed limit");
});

test("syncDailySessionFloor never increments above max(stored, localCount)", async () => {
  const userId = newUserId("floor");
  const today = "2026-05-03";

  // Seed with count=2 via two consume calls (limit=10 so neither rejected).
  await tryConsumeDailySession(userId, today, 10);
  await tryConsumeDailySession(userId, today, 10);

  // Sync with a lower local count must NOT decrease and must NOT add +1.
  const r1 = await syncDailySessionFloor(userId, today, 1);
  assert.equal(r1.count, 2, "stored count must not drop and must not +1");

  // Sync with a higher local count raises the floor.
  const r2 = await syncDailySessionFloor(userId, today, 5);
  assert.equal(r2.count, 5, "floor must rise to localCount when higher");

  // Repeated identical sync is idempotent — no +1 on either path.
  const r3 = await syncDailySessionFloor(userId, today, 5);
  assert.equal(r3.count, 5, "repeated sync must be idempotent");
});

test("syncDailySessionFloor on new day resets to max(1, localCount)", async () => {
  const userId = newUserId("floorrollover");

  // Yesterday at count=3.
  await tryConsumeDailySession(userId, "2026-05-02", 10);
  await tryConsumeDailySession(userId, "2026-05-02", 10);
  await tryConsumeDailySession(userId, "2026-05-02", 10);

  // Sync today with localCount=0 → resets row to today and count=1.
  const r1 = await syncDailySessionFloor(userId, "2026-05-03", 0);
  assert.equal(r1.day, "2026-05-03");
  assert.equal(r1.count, 1, "new-day reset must seed count to max(1, local)");

  // Sync the same new day again with localCount=2 → floor rises to 2.
  const r2 = await syncDailySessionFloor(userId, "2026-05-03", 2);
  assert.equal(r2.count, 2);
});
