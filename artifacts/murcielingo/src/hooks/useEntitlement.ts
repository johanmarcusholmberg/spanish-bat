import { useSubscription } from "./useSubscription";
import type { EntitlementKey } from "@workspace/subscription";

/**
 * Returns true iff the current user holds the given entitlement.
 * Conservative on load: returns false until the API responds, so gated
 * UI never flashes on for free users.
 */
export function useEntitlement(key: EntitlementKey): {
  hasAccess: boolean;
  loading: boolean;
} {
  const { entitlements, loading } = useSubscription();
  return {
    hasAccess: entitlements.includes(key),
    loading,
  };
}
