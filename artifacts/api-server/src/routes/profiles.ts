import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import {
  profilesTable,
  userRolesTable,
  userStreaksTable,
  activityLogTable,
  userProgressTable,
  userLastActivityTable,
  grammarProgressTable,
  userVocabularyTable,
  flashcardSrsTable,
  contactMessagesTable,
} from "@workspace/db";
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

// DELETE /profile — permanently delete the signed-in user's account.
//
// Required by App Store guideline 5.1.1(v) and Google Play account-deletion
// policy. We:
//   1. Delete every per-user row in our DB.
//   2. Delete the user from Clerk (which invalidates all of their sessions).
// The mobile app then signs out locally.
router.delete("/profile", requireAuth, async (req, res) => {
  const userId = req.userId!;
  try {
    // Wrap all per-user row deletes in a transaction so a partial failure
    // mid-deletion rolls back cleanly and the user can safely retry. Even
    // if the Clerk delete later fails, the user's content is gone from our
    // side once this transaction commits.
    await db.transaction(async (tx) => {
      await tx.delete(flashcardSrsTable).where(eq(flashcardSrsTable.userId, userId));
      await tx.delete(userVocabularyTable).where(eq(userVocabularyTable.userId, userId));
      await tx.delete(grammarProgressTable).where(eq(grammarProgressTable.userId, userId));
      await tx.delete(userLastActivityTable).where(eq(userLastActivityTable.userId, userId));
      await tx.delete(userProgressTable).where(eq(userProgressTable.userId, userId));
      await tx.delete(activityLogTable).where(eq(activityLogTable.userId, userId));
      await tx.delete(userStreaksTable).where(eq(userStreaksTable.userId, userId));
      await tx.delete(userRolesTable).where(eq(userRolesTable.userId, userId));
      await tx.delete(contactMessagesTable).where(eq(contactMessagesTable.userId, userId));
      await tx.delete(profilesTable).where(eq(profilesTable.userId, userId));
    });

    try {
      await clerkClient.users.deleteUser(userId);
    } catch (err) {
      req.log.error({ err, userId }, "Clerk user deletion failed after DB wipe");
      return res.status(502).json({
        error:
          "Account data deleted, but identity provider deletion failed. Please contact support to finish removing your account.",
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete account");
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
