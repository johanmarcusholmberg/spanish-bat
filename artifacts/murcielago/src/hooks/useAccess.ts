import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "./useFeatureAccess";
import { useDailySessionLimit } from "./useDailySessionLimit";

/**
 * useAccess
 * ─────────
 * Single, central frontend entitlement helper. All payment, role and
 * feature gating throughout the dashboard / Today's Echo flows should
 * read from here instead of cobbling `isAdmin`, `isPremium`, daily
 * limit, and TOTP checks together at every call site.
 *
 * Conservative on load: anything we don't yet know about the user is
 * treated as "no access" so premium / admin affordances never flash on
 * before the API has answered.
 */
export interface AccessFlags {
  loading: boolean;

  // Identity
  isLoggedIn: boolean;
  isAdmin: boolean;

  // Plan
  isFreeUser: boolean;
  isPaidUser: boolean;

  // Today's Echo gating
  /** True if the user is logged in and not yet over the daily free cap. */
  canUseTodayEcho: boolean;
  /** True if the user gets the full adaptive experience (Premium). */
  canUseFullTodayEcho: boolean;
  /** True for any premium-only practice surface. */
  canAccessPremiumPractice: boolean;

  /** True if the user can access the admin area at all. */
  canAccessAdmin: boolean;

  /** Number of practice sessions started today (any plan). */
  todaySessionCount: number;
}

export function useAccess(): AccessFlags {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useFeatureAccess();
  const dailyLimit = useDailySessionLimit();

  return useMemo<AccessFlags>(() => {
    const loading = authLoading || subLoading;
    const isFreeUser = isLoggedIn && !isPremium;
    const isPaidUser = isLoggedIn && isPremium;

    // Free users still get *a* Today's Echo until they hit their daily
    // cap; paid users always do. Logged-out users get nothing.
    const canUseTodayEcho =
      isLoggedIn && (isPremium || dailyLimit.canStart);

    return {
      loading,
      isLoggedIn,
      isAdmin,
      isFreeUser,
      isPaidUser,
      canUseTodayEcho,
      canUseFullTodayEcho: isPaidUser,
      canAccessPremiumPractice: isPaidUser,
      canAccessAdmin: isLoggedIn && isAdmin,
      todaySessionCount: dailyLimit.count,
    };
  }, [
    authLoading,
    subLoading,
    isLoggedIn,
    isAdmin,
    isPremium,
    dailyLimit.canStart,
    dailyLimit.count,
  ]);
}
