import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { getCustomerInfo, isRevenueCatConfigured } from "@/lib/revenuecat";
import type {
  EntitlementKey,
  PlanId,
  SubscriptionStatus,
  UserEntitlements,
  UserSubscription,
} from "@workspace/subscription";

interface SubscriptionPayload {
  model: "A" | "B";
  plans: Array<{
    planId: PlanId;
    displayName: string;
    tier: number;
    isPremium: boolean;
    entitlements: EntitlementKey[];
  }>;
  entitlements: UserEntitlements;
  subscription: UserSubscription;
}

interface UseSubscriptionResult {
  loading: boolean;
  error: string | null;
  data: SubscriptionPayload | null;
  planId: PlanId;
  status: SubscriptionStatus;
  isPremium: boolean;
  entitlements: EntitlementKey[];
  refresh: () => Promise<void>;
}

/**
 * Mobile twin of the web `useSubscription` hook. Same shape so screens
 * shared between platforms can be lifted unchanged. Mobile-specific
 * RevenueCat refresh logic will hook in via `refresh()` later.
 */
export function useSubscription(): UseSubscriptionResult {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<SubscriptionPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Best-effort: refresh local RC customer info so the next render has
      // the most current entitlement state, then fetch the canonical view
      // from the API server (which is fed by the RC webhook).
      if (isRevenueCatConfigured()) {
        try {
          await getCustomerInfo();
        } catch {
          // ignore — server-side state is the source of truth.
        }
      }
      const resp = (await api.subscription.get()) as SubscriptionPayload;
      setData(resp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Note: RevenueCat identification lives in AuthContext (it has direct
  // access to the Clerk userId BEFORE the API subscription payload is
  // available). Doing it here would race the paywall and risk creating
  // an anonymous RC customer that then purchases and writes corrupt
  // app_user_ids into our subscription tables.

  return useMemo(
    () => ({
      loading,
      error,
      data,
      planId: data?.entitlements.planId ?? "free",
      status: data?.entitlements.status ?? "none",
      isPremium: data?.entitlements.isPremium ?? false,
      entitlements: data?.entitlements.entitlements ?? [],
      refresh,
    }),
    [loading, error, data, refresh],
  );
}
