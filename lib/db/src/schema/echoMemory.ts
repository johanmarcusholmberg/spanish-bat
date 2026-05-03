import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Per-user "Echo Memory" summary — a small, server-persisted snapshot of
 * what Murci has learned about the user's practice patterns. Lets the
 * Today screen show "you're getting stronger on X" and "current focus: Y"
 * even after a fresh install / cleared local storage / device switch.
 *
 * The summary is intentionally tiny (no per-item history): full SRS state
 * still lives in client-side `usePracticeStats`. This is the brand promise
 * surface only.
 */
export const userEchoMemoryTable = pgTable("user_echo_memory", {
  userId: text("user_id").primaryKey(),
  /** Number of items the user is actively practising. */
  trackedCount: integer("tracked_count").notNull().default(0),
  /** Items the user is improving on (recent accuracy > 0.5). */
  improvedCount: integer("improved_count").notNull().default(0),
  /** Items currently due for review per local SRS. */
  dueCount: integer("due_count").notNull().default(0),
  /** Items the user got wrong in the last week. */
  weakCount: integer("weak_count").notNull().default(0),
  /** Subskill key (e.g. "ser_estar") of the user's top current focus. */
  topFocusSubskill: text("top_focus_subskill"),
  /** Subskill key of the user's top improving area. */
  topImprovedSubskill: text("top_improved_subskill"),
  /** Free-form extras for forward-compat without another migration. */
  meta: jsonb("meta"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserEchoMemorySchema = createInsertSchema(
  userEchoMemoryTable,
).omit({ updatedAt: true });
export type InsertUserEchoMemory = z.infer<typeof insertUserEchoMemorySchema>;
export type UserEchoMemory = typeof userEchoMemoryTable.$inferSelect;
