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
  access: PlanFeatureAccess;
  mixAccess: (mix: PracticeMixKey) => FeatureAccessLevel;
}

/**
 * Mobile twin of the web `useFeatureAccess` hook. Same shape so screens
 * shared between platforms can be lifted unchanged.
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
