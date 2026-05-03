import { pgTable, text, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Phase C: keyed by (clerk_user_id, email).
//
//  - `email` is normalised to lowercase and is the stable identity used by
//    invitations: an admin invites someone by email *before* they have a
//    Clerk account, and the row is matched up with `clerkUserId` on first
//    sign-in via the Clerk webhook (or, as a fallback, the next time the
//    profile is loaded).
//  - `userId` is kept for backwards compatibility with the rest of the
//    app (subscriptions, profile delete, etc.) and is mirrored to
//    `clerkUserId` once the row is bound to a Clerk user.
//  - The unique index on (lower(email), role) prevents duplicate role
//    rows for the same email across re-invites.
export const userRolesTable = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().default(""),
    clerkUserId: text("clerk_user_id"),
    email: text("email").notNull().default(""),
    role: text("role").notNull(),
    invitedByEmail: text("invited_by_email"),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailRoleUnique: uniqueIndex("user_roles_email_role_unique").on(t.email, t.role),
  }),
);

export type UserRole = typeof userRolesTable.$inferSelect;
export type NewUserRole = typeof userRolesTable.$inferInsert;
