import { isAdmin, getClerkUserEmail, bindRolesToClerkUser } from "../lib/roles";
import type { Request, Response, NextFunction } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminEmail?: string | null;
    }
  }
}

// Phase C: roles are looked up by (clerkUserId, email) so OAuth-linked
// users with a matching invitation row are recognised as admin without
// needing a manual user_id insert. We also opportunistically bind any
// pending invite row to this clerk user so subsequent calls hit the
// fast path.
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    const email = await getClerkUserEmail(userId);
    req.adminEmail = email;
    // Bind on the way in — cheap idempotent update if there's nothing
    // pending, and lets the user_roles row track who actually accepted
    // the invite.
    await bindRolesToClerkUser(userId, email);
    if (!(await isAdmin(userId, email))) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
};
