import { Router } from "express";
import { db } from "@workspace/db";
import { userEchoMemoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function clampInt(value: unknown, max = 100000): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const n = Math.floor(value);
  if (n < 0) return 0;
  if (n > max) return max;
  return n;
}

function trimSubskill(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (t.length === 0) return null;
  return t.slice(0, 120);
}

interface UpsertPayload {
  trackedCount?: number;
  improvedCount?: number;
  dueCount?: number;
  weakCount?: number;
  topFocusSubskill?: string | null;
  topImprovedSubskill?: string | null;
}

function parseUpsert(body: unknown): UpsertPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  return {
    trackedCount: clampInt(b.trackedCount),
    improvedCount: clampInt(b.improvedCount),
    dueCount: clampInt(b.dueCount),
    weakCount: clampInt(b.weakCount),
    topFocusSubskill: trimSubskill(b.topFocusSubskill),
    topImprovedSubskill: trimSubskill(b.topImprovedSubskill),
  };
}

router.get("/echo-memory", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const rows = await db
      .select()
      .from(userEchoMemoryTable)
      .where(eq(userEchoMemoryTable.userId, userId))
      .limit(1);
    return res.json({ echoMemory: rows[0] ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch echo memory");
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/echo-memory", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const patch = parseUpsert(req.body);
  if (!patch) {
    return res.status(400).json({ error: "Invalid echo memory payload" });
  }
  try {
    await db
      .insert(userEchoMemoryTable)
      .values({
        userId,
        trackedCount: patch.trackedCount ?? 0,
        improvedCount: patch.improvedCount ?? 0,
        dueCount: patch.dueCount ?? 0,
        weakCount: patch.weakCount ?? 0,
        topFocusSubskill: patch.topFocusSubskill ?? null,
        topImprovedSubskill: patch.topImprovedSubskill ?? null,
      })
      .onConflictDoUpdate({
        target: userEchoMemoryTable.userId,
        set: { ...patch, updatedAt: new Date() },
      });
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert echo memory");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
