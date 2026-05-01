import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name"),
  email: text("email"),
  level: text("level").notNull().default("A1"),
  learningFrom: text("learning_from").notNull().default("sv"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  placementTestCompleted: boolean("placement_test_completed").notNull().default(false),
  placementTestScore: jsonb("placement_test_score"),
  accountStatus: text("account_status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ createdAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
