import { pgTable, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userStreaksTable = pgTable("user_streaks", {
  userId: text("user_id").primaryKey(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityLogTable = pgTable("activity_log", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  userId: text("user_id").notNull(),
  activityDate: text("activity_date").notNull(),
  count: integer("count").notNull().default(0),
});

export const insertUserStreakSchema = createInsertSchema(userStreaksTable);
export const insertActivityLogSchema = createInsertSchema(activityLogTable);
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaksTable.$inferSelect;
export type ActivityLog = typeof activityLogTable.$inferSelect;
