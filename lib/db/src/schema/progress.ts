import { pgTable, text, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProgressTable = pgTable("user_progress", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  completed: integer("completed").notNull().default(0),
  total: integer("total").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userLastActivityTable = pgTable("user_last_activity", {
  userId: text("user_id").primaryKey(),
  exerciseType: text("exercise_type").notNull(),
  exercisePath: text("exercise_path").notNull(),
  exerciseLabel: text("exercise_label").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const grammarProgressTable = pgTable("grammar_progress", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  bestScore: integer("best_score").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgressTable).omit({ id: true, updatedAt: true });
export const insertGrammarProgressSchema = createInsertSchema(grammarProgressTable).omit({ id: true, updatedAt: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgressTable.$inferSelect;
export type GrammarProgress = typeof grammarProgressTable.$inferSelect;
