import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Persistent practice items library.
 *
 * Holds approved practice items (curated, template-generated, or AI)
 * that can be reused across future sessions for any user. AI items are
 * inserted only after passing validation + personal-data filtering, and
 * dedup is enforced via a normalised prompt hash.
 */
export const practiceItemsTable = pgTable(
  "practice_items",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    level: text("level").notNull(),
    skill: text("skill").notNull(),
    subskill: text("subskill").notNull().default("general"),
    prompt: text("prompt").notNull(),
    expectedAnswer: text("expected_answer").notNull(),
    acceptedAnswers: jsonb("accepted_answers"),
    explanation: text("explanation"),
    difficulty: real("difficulty").notNull().default(0.5),
    source: text("source").notNull().default("ai"),
    createdAt: timestamp("created_at").defaultNow(),
    approved: boolean("approved").notNull().default(true),
    usageCount: integer("usage_count").notNull().default(0),
    successCount: integer("success_count").notNull().default(0),
    reportCount: integer("report_count").notNull().default(0),
    languageOfPrompt: text("language_of_prompt").notNull().default("en"),
    tags: jsonb("tags"),
    /** Normalised prompt + level used for dedup (unique). */
    promptNorm: text("prompt_norm").notNull(),
    /** Internal flag set by the report aggregator or an admin to hide an item. */
    flagged: boolean("flagged").notNull().default(false),
  },
  (table) => ({
    promptNormIdx: uniqueIndex("practice_items_prompt_norm_idx").on(
      table.promptNorm,
    ),
    approvedIdx: index("practice_items_approved_idx").on(
      table.approved,
      table.flagged,
    ),
    levelSkillIdx: index("practice_items_level_skill_idx").on(
      table.level,
      table.skill,
    ),
  }),
);

/**
 * User feedback on a practice item ("Something wrong?"). Aggregated into
 * `practice_items.reportCount` so we can hide low-quality items.
 */
export const practiceItemReportsTable = pgTable(
  "practice_item_reports",
  {
    id: text("id").primaryKey().default("gen_random_uuid()"),
    itemId: text("item_id").notNull(),
    userId: text("user_id").notNull(),
    reason: text("reason").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    itemIdx: index("practice_item_reports_item_idx").on(table.itemId),
    userItemIdx: index("practice_item_reports_user_item_idx").on(
      table.userId,
      table.itemId,
    ),
  }),
);

export const insertPracticeItemSchema = createInsertSchema(
  practiceItemsTable,
).omit({
  id: true,
  createdAt: true,
  usageCount: true,
  successCount: true,
  reportCount: true,
  flagged: true,
});
export const insertPracticeItemReportSchema = createInsertSchema(
  practiceItemReportsTable,
).omit({ id: true, createdAt: true });

export type InsertPracticeItem = z.infer<typeof insertPracticeItemSchema>;
export type PracticeItemRow = typeof practiceItemsTable.$inferSelect;
export type PracticeItemReportRow =
  typeof practiceItemReportsTable.$inferSelect;
