import { useSubscription } from "./useSubscription";
import type { EntitlementKey } from "@workspace/subscription";

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
