import { useCallback, useState } from "react";
import { useSubscription } from "./useSubscription";
import type { EntitlementKey } from "@workspace/subscription";

interface PremiumGateResult {
  isPremium: boolean;
  loading: boolean;
  /** True when the upgrade prompt should be shown. */
  showUpgrade: boolean;
  /**
   * Call this when the user attempts a premium action. Returns true if
   * the action should proceed, false if the upgrade prompt was opened.
   */
  guard: (entitlement?: EntitlementKey) => boolean;
  dismiss: () => void;
}

/**
 * Convenience wrapper for "this CTA requires Premium". Tracks a local
 * upgrade-prompt visibility flag so each consumer can render its own
 * paywall modal without lifting state.
 */
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
