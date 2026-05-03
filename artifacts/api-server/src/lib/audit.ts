import { db, auditLogTable } from "@workspace/db";
import type { Request } from "express";
import { logger } from "./logger";

export type AuditAction =
  | "sign_in_success"
  | "sign_in_failure"
  | "sign_out"
  | "role_change"
  | "invite_issued"
  | "invite_accepted"
  | "admin_mutation"
  | "admin_2fa_enrolled";

export interface AuditInput {
  userId?: string | null;
  email?: string | null;
  action: AuditAction | string;
  target?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Append-only writer. Failures are swallowed so the calling request
// never breaks because of audit issues — they're logged at warn level
// instead so we can spot persistent breakage in pino output.
export async function recordAudit(entry: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogTable).values({
      userId: entry.userId ?? null,
      email: entry.email ? entry.email.toLowerCase() : null,
      action: entry.action,
      target: entry.target ?? null,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    logger.warn({ err, action: entry.action }, "audit log write failed");
  }
}

export function reqAudit(req: Request): { ip: string | null; userAgent: string | null } {
  const fwd = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(fwd) ? fwd[0] : (fwd ?? "").toString().split(",")[0].trim()) ||
    req.socket?.remoteAddress ||
    null;
  const ua = (req.headers["user-agent"] as string | undefined) ?? null;
  return { ip: ip || null, userAgent: ua };
}
