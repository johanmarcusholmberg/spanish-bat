import { useMemo } from "react";
import {
  getFeatureAccess,
  getMixAccess,
  type FeatureAccessLevel,
  type PlanFeatureAccess,
  type PracticeMixKey,
} from "@workspace/subscription";
import { useSubscription } from "./useSubscription";

interface UseFeatureAccessResult {
  loading: boolean;
  isPremium: boolean;
  /** Granular feature-access map for the user's current plan. */
  access: PlanFeatureAccess;
  /** Convenience: per-mix access lookup. */
  mixAccess: (mix: PracticeMixKey) => FeatureAccessLevel;
}

/**
 * Central hook for product-shape entitlement questions ("how many
 * sessions per day?", "is this mix locked?"). Backed by the same
 * `useSubscription` query as `useEntitlement` — there is no separate
 * fetch.
 *
 * On loading / unauthenticated, returns the Free feature-access map so
 * the UI never flashes Premium affordances on for a free user.
 */
export function useFeatureAccess(): UseFeatureAccessResult {
  const { planId, isPremium, loading } = useSubscription();
  const access = useMemo(() => getFeatureAccess(planId), [planId]);
  return {
    loading,
    isPremium,
    access,
    mixAccess: (mix) => getMixAccess(planId, mix),
  };
}
