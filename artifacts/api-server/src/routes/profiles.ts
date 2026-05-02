import { Router } from "express";
import { db } from "@workspace/db";
import { profilesTable, userRolesTable } from "@workspace/db";
import type { Profile } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/profile", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    const role = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId)).limit(1);
    if (profile.length === 0) {
      return res.json({ profile: null, isAdmin: false });
    }
    return res.json({ profile: profile[0], isAdmin: role.some(r => r.role === "admin") });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch profile");
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/profile", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const { displayName, email, level, learningFrom, onboardingCompleted, placementTestCompleted, placementTestScore, accountStatus } = req.body;
  try {
    const existing = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    if (existing.length === 0) {
      await db.insert(profilesTable).values({
        userId,
        displayName,
        email,
        level: level || "A1",
        learningFrom: learningFrom || "sv",
        onboardingCompleted: onboardingCompleted || false,
        placementTestCompleted: placementTestCompleted || false,
        placementTestScore: placementTestScore || null,
        accountStatus: accountStatus || "active",
      });
    } else {
      const updates: Partial<Omit<Profile, "userId" | "createdAt">> = {};
      if (displayName !== undefined) updates.displayName = displayName;
      if (email !== undefined) updates.email = email;
      if (level !== undefined) updates.level = level;
      if (learningFrom !== undefined) updates.learningFrom = learningFrom;
      if (onboardingCompleted !== undefined) updates.onboardingCompleted = onboardingCompleted;
      if (placementTestCompleted !== undefined) updates.placementTestCompleted = placementTestCompleted;
      if (placementTestScore !== undefined) updates.placementTestScore = placementTestScore;
      if (accountStatus !== undefined) updates.accountStatus = accountStatus;
      if (Object.keys(updates).length > 0) {
        await db.update(profilesTable).set(updates).where(eq(profilesTable.userId, userId));
      }
    }
    const profile = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
    return res.json({ profile: profile[0] });
  } catch (err) {
    req.log.error({ err }, "Failed to upsert profile");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
