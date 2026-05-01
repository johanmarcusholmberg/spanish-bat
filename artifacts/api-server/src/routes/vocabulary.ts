import { Router } from "express";
import { db } from "@workspace/db";
import { userVocabularyTable, flashcardSrsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/vocabulary", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const words = await db.select().from(userVocabularyTable).where(eq(userVocabularyTable.userId, userId));
    return res.json({ words });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch vocabulary");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/vocabulary", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
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
  const userId = (req as any).userId;
  const { id } = req.params;
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
  const userId = (req as any).userId;
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.update(userVocabularyTable).set(updates)
      .where(and(eq(userVocabularyTable.id, id), eq(userVocabularyTable.userId, userId)));
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update vocabulary");
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/flashcard-srs", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
  try {
    const data = await db.select().from(flashcardSrsTable).where(eq(flashcardSrsTable.userId, userId));
    return res.json({ data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch flashcard SRS");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/flashcard-srs", requireAuth, async (req, res) => {
  const userId = (req as any).userId;
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
