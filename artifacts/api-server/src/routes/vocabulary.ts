import { Router } from "express";
import { db } from "@workspace/db";
import { userVocabularyTable, flashcardSrsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const VOCAB_FIELDS = new Set([
  "spanish", "translation", "context", "category",
  "itemType", "learned", "usageExample", "level", "topicTags",
]);

const SRS_FIELDS = new Set([
  "reviewState", "nextReview", "easeFactor",
  "intervalDays", "reviewCount", "correctCount", "incorrectCount",
]);

router.get("/vocabulary", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const words = await db.select().from(userVocabularyTable)
      .where(eq(userVocabularyTable.userId, userId));

    const srsData = await db.select().from(flashcardSrsTable)
      .where(eq(flashcardSrsTable.userId, userId));

    const srsMap = new Map(srsData.map(s => [s.cardId, s]));

    const merged = words.map(w => {
      const srs = srsMap.get(w.id);
      return {
        ...w,
        reviewState: srs?.reviewState ?? "new",
        nextReview: srs?.nextReview ?? new Date().toISOString(),
        easeFactor: srs ? Number(srs.easeFactor) : 2.5,
        intervalDays: srs ? Number(srs.intervalDays) : 0,
        reviewCount: srs ? Number(srs.reviewCount) : 0,
        correctCount: srs ? Number(srs.correctCount) : 0,
        incorrectCount: srs ? Number(srs.incorrectCount) : 0,
      };
    });

    return res.json({ words: merged });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch vocabulary");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/vocabulary", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { spanish, translation, context, category, itemType, learned, usageExample, level, topicTags } = req.body;
  try {
    const existing = await db.select().from(userVocabularyTable)
      .where(and(eq(userVocabularyTable.userId, userId), eq(userVocabularyTable.spanish, spanish)))
      .limit(1);
    if (existing.length > 0) {
      await db.update(userVocabularyTable).set({
        translation, context, category: category || "conversation",
        itemType: itemType || "word", learned: learned || false,
        usageExample, level, topicTags,
      }).where(eq(userVocabularyTable.id, existing[0].id));
      return res.json({ id: existing[0].id, updated: true });
    }
    const id = crypto.randomUUID();
    await db.insert(userVocabularyTable).values({
      id, userId, spanish, translation, context,
      category: category || "conversation", itemType: itemType || "word",
      learned: learned || false, usageExample, level, topicTags,
    });
    return res.json({ id, updated: false });
  } catch (err) {
    req.log.error({ err }, "Failed to add vocabulary");
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/vocabulary/:id", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = String(req.params.id);
  try {
    await db.delete(userVocabularyTable)
      .where(and(eq(userVocabularyTable.id, id), eq(userVocabularyTable.userId, userId)));
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete vocabulary");
    return res.status(500).json({ error: "Server error" });
  }
});

router.patch("/vocabulary/:id", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const id = String(req.params.id);
  const body = req.body as Record<string, unknown>;

  const vocabUpdates: Record<string, unknown> = {};
  const srsUpdates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (VOCAB_FIELDS.has(key)) vocabUpdates[key] = value;
    else if (SRS_FIELDS.has(key)) srsUpdates[key] = value;
  }

  try {
    if (Object.keys(vocabUpdates).length > 0) {
      await db.update(userVocabularyTable).set(vocabUpdates)
        .where(and(eq(userVocabularyTable.id, id), eq(userVocabularyTable.userId, userId)));
    }

    if (Object.keys(srsUpdates).length > 0) {
      const { reviewState, nextReview, easeFactor, intervalDays, reviewCount, correctCount, incorrectCount } = srsUpdates;
      const existing = await db.select().from(flashcardSrsTable)
        .where(and(eq(flashcardSrsTable.userId, userId), eq(flashcardSrsTable.cardId, id)))
        .limit(1);

      if (existing.length > 0) {
        await db.update(flashcardSrsTable).set({
          ...(reviewState !== undefined && { reviewState: String(reviewState) }),
          ...(nextReview !== undefined && { nextReview: String(nextReview) }),
          ...(easeFactor !== undefined && { easeFactor: String(easeFactor) }),
          ...(intervalDays !== undefined && { intervalDays: String(intervalDays) }),
          ...(reviewCount !== undefined && { reviewCount: String(reviewCount) }),
          ...(correctCount !== undefined && { correctCount: String(correctCount) }),
          ...(incorrectCount !== undefined && { incorrectCount: String(incorrectCount) }),
        }).where(eq(flashcardSrsTable.id, existing[0].id));
      } else {
        await db.insert(flashcardSrsTable).values({
          id: crypto.randomUUID(),
          userId,
          cardId: id,
          reviewState: String(reviewState ?? "new"),
          nextReview: String(nextReview ?? new Date().toISOString()),
          easeFactor: String(easeFactor ?? 2.5),
          intervalDays: String(intervalDays ?? 0),
          reviewCount: String(reviewCount ?? 0),
          correctCount: String(correctCount ?? 0),
          incorrectCount: String(incorrectCount ?? 0),
        });
      }
    }

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update vocabulary");
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/flashcard-srs", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const data = await db.select().from(flashcardSrsTable).where(eq(flashcardSrsTable.userId, userId));
    return res.json({ data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch flashcard SRS");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/flashcard-srs", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { cardId, reviewState, nextReview, easeFactor, intervalDays, reviewCount, correctCount, incorrectCount } = req.body;
  try {
    const existing = await db.select().from(flashcardSrsTable)
      .where(and(eq(flashcardSrsTable.userId, userId), eq(flashcardSrsTable.cardId, cardId)))
      .limit(1);
    if (existing.length > 0) {
      await db.update(flashcardSrsTable).set({
        reviewState, nextReview,
        easeFactor: String(easeFactor),
        intervalDays: String(intervalDays),
        reviewCount: String(reviewCount),
        correctCount: String(correctCount),
        incorrectCount: String(incorrectCount),
      }).where(eq(flashcardSrsTable.id, existing[0].id));
    } else {
      await db.insert(flashcardSrsTable).values({
        id: crypto.randomUUID(), userId, cardId, reviewState, nextReview,
        easeFactor: String(easeFactor || 2.5),
        intervalDays: String(intervalDays || 0),
        reviewCount: String(reviewCount || 0),
        correctCount: String(correctCount || 0),
        incorrectCount: String(incorrectCount || 0),
      });
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert flashcard SRS");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
