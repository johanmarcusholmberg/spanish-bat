import { pgTable, text, serial, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Append-only audit log for security-sensitive events. Written by
// `recordAudit()` in the API server. Never updated or deleted from app code.
//
// Indexed on (createdAt desc) for the "latest 200" admin view, and on
// (action) so admins can filter the history by event type.
export const auditLogTable = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id"),
    email: text("email"),
    action: text("action").notNull(),
    target: text("target"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    createdAtIdx: index("audit_log_created_at_idx").on(t.createdAt),
    actionIdx: index("audit_log_action_idx").on(t.action),
  }),
);

export type AuditLogEntry = typeof auditLogTable.$inferSelect;
export type NewAuditLogEntry = typeof auditLogTable.$inferInsert;
