/**
 * POST /api/generate-practice-session
 *
 * AI-backed practice generation. Used as a fallback / enrichment layer
 * by the client `practiceSessionEngine`. The route:
 *   1. Parses + clamps the request.
 *   2. Calls OpenAI with a strict JSON-only prompt.
 *   3. Validates each item (CEFR fit, Spanish answer, dedup, safety).
 *   4. Returns the approved items in `PracticeItem` shape.
 *
 * Failure mode: returns a 200 with `{items: [], degraded: true}` when
 * AI is unavailable — clients are designed to silently fall back.
 */

import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth } from "../middlewares/requireAuth";
import {
  buildPracticePrompt,
  validateAIPracticeItems,
  looksPersonal,
  normalizePromptForDedup,
  type AIPracticeRequest,
} from "@workspace/practice-ai";
import { db, practiceItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Save validated, generic AI items to the shared library so future
 * sessions can reuse them. Skips items with personal data and items
 * whose normalised prompt already exists. Returns the persisted ids
 * (in input order) — null where the item wasn't saved.
 */
async function persistApprovedAIItems(
  items: ReadonlyArray<{
    level: string;
    skill: string;
    subskill: string;
    prompt: string;
    expectedAnswer: string;
    acceptedAnswers?: string[];
    explanation?: string;
    difficulty: number;
  }>,
  languageOfPrompt: "en" | "sv",
): Promise<(string | null)[]> {
  const ids: (string | null)[] = [];
  for (const it of items) {
    if (
      looksPersonal(it.prompt, it.expectedAnswer, it.explanation) ||
      (it.acceptedAnswers ?? []).some((a) => looksPersonal(a))
    ) {
      ids.push(null);
      continue;
    }
    const promptNorm = normalizePromptForDedup(it.prompt);
    try {
      const existing = await db
        .select({ id: practiceItemsTable.id })
        .from(practiceItemsTable)
        .where(eq(practiceItemsTable.promptNorm, promptNorm))
        .limit(1);
      if (existing.length > 0) {
        ids.push(existing[0].id);
        continue;
      }
      const id = crypto.randomUUID();
      await db.insert(practiceItemsTable).values({
        id,
        level: it.level,
        skill: it.skill,
        subskill: it.subskill || "general",
        prompt: it.prompt,
        expectedAnswer: it.expectedAnswer,
        acceptedAnswers: it.acceptedAnswers ?? null,
        explanation: it.explanation ?? null,
        difficulty: it.difficulty,
        source: "ai",
        approved: true,
        languageOfPrompt,
        tags: [it.subskill || "general"],
        promptNorm,
      });
      ids.push(id);
    } catch {
      // Swallow — persistence is best-effort, response still works.
      ids.push(null);
    }
  }
  return ids;
}

const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

router.post("/generate-practice-session", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as Partial<AIPracticeRequest> & {
    avoidPrompts?: unknown;
  };

  const userLevel =
    typeof body.userLevel === "string" && VALID_LEVELS.has(body.userLevel)
      ? body.userLevel
      : "A1";

  const interfaceLanguage = body.interfaceLanguage === "sv" ? "sv" : "en";

  const count = Math.min(
    15,
    Math.max(1, typeof body.count === "number" ? Math.round(body.count) : 6),
  );

  const targetSkill =
    typeof body.targetSkill === "string" && body.targetSkill.trim()
      ? body.targetSkill.trim().slice(0, 80)
      : "general daily-life conversation";

  const weakSpots = Array.isArray(body.weakSpots)
    ? body.weakSpots
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const previousMistakes = Array.isArray(body.previousMistakes)
    ? body.previousMistakes
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const avoidPrompts = Array.isArray(body.avoidPrompts)
    ? (body.avoidPrompts as unknown[])
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 30)
    : [];

  const practiceMode =
    typeof body.practiceMode === "string"
      ? (body.practiceMode as AIPracticeRequest["practiceMode"])
      : "quick";

  const aiRequest: AIPracticeRequest = {
    userLevel: userLevel as AIPracticeRequest["userLevel"],
    interfaceLanguage,
    count,
    targetSkill,
    weakSpots,
    previousMistakes,
    avoidPrompts,
    practiceMode,
  };

  const { system, user } = buildPracticePrompt(aiRequest);

  let parsed: unknown = null;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to recover a JSON object from the response.
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }
  } catch (err) {
    req.log.error({ err }, "Practice AI generation failed");
    // Graceful fallback — clients treat this as "no AI items".
    return res.json({ items: [], degraded: true });
  }

  if (!parsed) {
    return res.json({ items: [], degraded: true });
  }

  const { items, rejected } = validateAIPracticeItems(parsed, {
    userLevel: userLevel as AIPracticeRequest["userLevel"],
    avoidPrompts,
    maxLevelsAbove: practiceMode === "challenge" ? 1 : 0,
  });

  if (rejected.length > 0) {
    req.log.info(
      { rejectedCount: rejected.length, reasons: rejected.map((r) => r.reason) },
      "Practice AI items rejected by validator",
    );
  }

  // Persist approved generic items to the shared library so the next
  // user (or session) gets them for free. Best-effort; failures don't
  // affect the response.
  let persistedIds: (string | null)[] = [];
  try {
    persistedIds = await persistApprovedAIItems(items, interfaceLanguage);
  } catch (err) {
    req.log.error({ err }, "Failed to persist AI practice items");
  }

  const itemsWithIds = items.map((it, i) => ({
    ...it,
    id: persistedIds[i] ?? undefined,
  }));

  return res.json({ items: itemsWithIds });
});

export default router;
