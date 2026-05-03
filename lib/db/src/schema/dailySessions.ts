import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Per-user daily session counter — server-side mirror of the local
 * `dailySessionCounter` so the Free-tier "1 Today's Practice per day"
 * cap survives uninstalls and device switches. The local counter still
 * provides offline UX; the server takes the max of (local, server) so
 * a user offline for a day can still record their session when they
 * come back online without losing their cap accounting.
 *
 * `day` is the user's local YYYY-MM-DD as the client reports it. We
 * store the most recent day only — old day counts roll off when the
 * client posts a new day.
 */
export const userDailySessionsTable = pgTable("user_daily_sessions", {
  userId: text("user_id").primaryKey(),
  day: text("day").notNull(),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserDailySessions = typeof userDailySessionsTable.$inferSelect;
