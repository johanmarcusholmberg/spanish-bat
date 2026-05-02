import { useCallback, useState } from "react";
import { useSubscription } from "./useSubscription";
import type { EntitlementKey } from "@workspace/subscription";

interface PremiumGateResult {
  isPremium: boolean;
  loading: boolean;
  showUpgrade: boolean;
  guard: (entitlement?: EntitlementKey) => boolean;
  dismiss: () => void;
}

export function usePremiumGate(): PremiumGateResult {
  const { isPremium, entitlements, loading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const guard = useCallback(
    (entitlement?: EntitlementKey) => {
      const allowed = entitlement
        ? entitlements.includes(entitlement)
        : isPremium;
      if (!allowed) {
        setShowUpgrade(true);
        return false;
      }
      return true;
    },
    [entitlements, isPremium],
  );

  return {
    isPremium,
    loading,
    showUpgrade,
    guard,
    dismiss: () => setShowUpgrade(false),
  };
}
