import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userVocabularyTable = pgTable("user_vocabulary", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  spanish: text("spanish").notNull(),
  translation: text("translation").notNull(),
  context: text("context"),
  category: text("category").notNull().default("conversation"),
  itemType: text("item_type").notNull().default("word"),
  learned: boolean("learned").notNull().default(false),
  usageExample: text("usage_example"),
  level: text("level"),
  topicTags: jsonb("topic_tags"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flashcardSrsTable = pgTable("flashcard_srs", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  cardId: text("card_id").notNull(),
  reviewState: text("review_state").notNull().default("new"),
  nextReview: text("next_review"),
  easeFactor: text("ease_factor").notNull().default("2.5"),
  intervalDays: text("interval_days").notNull().default("0"),
  reviewCount: text("review_count").notNull().default("0"),
  correctCount: text("correct_count").notNull().default("0"),
  incorrectCount: text("incorrect_count").notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserVocabularySchema = createInsertSchema(userVocabularyTable).omit({ id: true, createdAt: true });
export const insertFlashcardSrsSchema = createInsertSchema(flashcardSrsTable).omit({ id: true, updatedAt: true });
export type InsertUserVocabulary = z.infer<typeof insertUserVocabularySchema>;
export type UserVocabulary = typeof userVocabularyTable.$inferSelect;
export type FlashcardSrs = typeof flashcardSrsTable.$inferSelect;
