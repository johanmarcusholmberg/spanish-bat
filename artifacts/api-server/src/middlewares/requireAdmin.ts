import { db } from "@workspace/db";
import { userRolesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    const roles = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
    if (!roles.some((r) => r.role === "admin")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch {
    res.status(403).json({ error: "Forbidden" });
  }
};
