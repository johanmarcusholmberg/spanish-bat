import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const userRolesTable = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
});

export type UserRole = typeof userRolesTable.$inferSelect;
