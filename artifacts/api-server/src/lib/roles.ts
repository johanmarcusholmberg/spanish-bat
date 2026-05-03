import { db, userRolesTable } from "@workspace/db";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/express";

// Returns the roles attached to a user, looked up by Clerk ID first and
// then by email so invites that pre-date the user account also resolve.
export async function getUserRoles(
  clerkUserId: string,
  email: string | null,
): Promise<string[]> {
  const lower = email ? email.toLowerCase() : null;
  const rows = await db
    .select()
    .from(userRolesTable)
    .where(
      or(
        eq(userRolesTable.clerkUserId, clerkUserId),
        eq(userRolesTable.userId, clerkUserId),
        lower ? eq(userRolesTable.email, lower) : sql`false`,
      ),
    );
  return Array.from(new Set(rows.map((r) => r.role)));
}

// Bind any pending invite rows to a freshly-signed-in Clerk user so
// subsequent role checks can use the cheap clerkUserId path.
export async function bindRolesToClerkUser(
  clerkUserId: string,
  email: string | null,
): Promise<{ bound: number; roles: string[] }> {
  const lower = email ? email.toLowerCase() : null;
  if (!lower) return { bound: 0, roles: await getUserRoles(clerkUserId, null) };
  const pending = await db
    .select()
    .from(userRolesTable)
    .where(
      and(
        eq(userRolesTable.email, lower),
        or(isNull(userRolesTable.clerkUserId), eq(userRolesTable.clerkUserId, "")),
      ),
    );
  if (pending.length > 0) {
    await db
      .update(userRolesTable)
      .set({
        clerkUserId,
        userId: clerkUserId,
        acceptedAt: new Date(),
      })
      .where(
        and(
          eq(userRolesTable.email, lower),
          or(isNull(userRolesTable.clerkUserId), eq(userRolesTable.clerkUserId, "")),
        ),
      );
  }
  const roles = await getUserRoles(clerkUserId, lower);
  return { bound: pending.length, roles };
}

export async function isAdmin(clerkUserId: string, email: string | null): Promise<boolean> {
  const roles = await getUserRoles(clerkUserId, email);
  return roles.includes("admin");
}

// Pull the user's primary email from Clerk so middleware doesn't need
// the request body. Falls back to null on any Clerk-side error.
export async function getClerkUserEmail(clerkUserId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(clerkUserId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((e) => e.id === primaryId) ?? user.emailAddresses[0];
    return primary?.emailAddress ?? null;
  } catch {
    return null;
  }
}

// Read TOTP-completion flag from Clerk public metadata. Set when an
// admin finishes the /admin/setup-2fa flow on the web or mobile.
export function adminTotpCompleted(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const m = metadata as Record<string, unknown>;
  return m.adminTotpEnrolled === true;
}
