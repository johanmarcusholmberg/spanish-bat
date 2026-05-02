import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
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
  lastSyncAt: string | null;
}

interface UseSubscriptionResult {
  loading: boolean;
  error: string | null;
  data: SubscriptionPayload | null;
  planId: PlanId;
  status: SubscriptionStatus;
  isPremium: boolean;
  entitlements: EntitlementKey[];
  lastSyncAt: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads the signed-in user's subscription + entitlements from the API.
 * Returns a Free-tier shape for unauthenticated users so callers don't
 * need to special-case the loading/logged-out state for gating.
 *
 * On error, the hook keeps the last known good payload so a transient
 * network blip doesn't accidentally downgrade a premium user in the UI;
 * `error` is exposed so callers can render an `<EntitlementError>`.
 */
export function useSubscription(): UseSubscriptionResult {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<SubscriptionPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
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

  return useMemo(
    () => ({
      loading,
      error,
      data,
      planId: data?.entitlements.planId ?? "free",
      status: data?.entitlements.status ?? "none",
      isPremium: data?.entitlements.isPremium ?? false,
      entitlements: data?.entitlements.entitlements ?? [],
      lastSyncAt: data?.lastSyncAt ?? null,
      refresh,
    }),
    [loading, error, data, refresh],
  );
}
