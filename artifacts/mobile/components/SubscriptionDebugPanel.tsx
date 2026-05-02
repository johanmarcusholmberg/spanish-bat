import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSubscription } from "@/hooks/useSubscription";
import { isRevenueCatConfigured, RC_CONFIG } from "@/lib/revenuecat";

/**
 * Mobile dev-only diagnostic panel. Renders nothing in release builds
 * (`__DEV__` is false). Surfaces resolved entitlements, last sync, and
 * presence-only RevenueCat env state. Mount it on debug-friendly screens
 * (paywall, profile) when triaging gating bugs.
 */
export function SubscriptionDebugPanel({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  if (!__DEV__) return null;
  return <Panel defaultOpen={defaultOpen} />;
}

function Panel({ defaultOpen }: { defaultOpen: boolean }) {
  const sub = useSubscription();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View
      style={{
        marginTop: 16,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#A78BFA",
        backgroundColor: "#F5F3FF",
        borderRadius: 8,
        padding: 8,
      }}
    >
      <Pressable onPress={() => setOpen((v) => !v)}>
        <Text style={{ color: "#5B21B6", fontWeight: "700", fontSize: 12 }}>
          🐞 Subscription debug (DEV) {open ? "▲" : "▼"}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ marginTop: 8, gap: 4 }}>
          <Row label="loading" value={String(sub.loading)} />
          <Row label="error" value={sub.error ?? "—"} />
          <Row label="planId" value={sub.planId} />
          <Row label="status" value={sub.status} />
          <Row label="isPremium" value={String(sub.isPremium)} />
          <Row label="lastSyncAt" value={sub.lastSyncAt ?? "never"} />
          <Row
            label="entitlements"
            value={sub.entitlements.length ? sub.entitlements.join(", ") : "—"}
          />
          <Row label="rc.configured" value={String(isRevenueCatConfigured())} />
          <Row
            label="rc.iosKey"
            value={RC_CONFIG.iosApiKey ? "set" : "missing"}
          />
          <Row
            label="rc.androidKey"
            value={RC_CONFIG.androidApiKey ? "set" : "missing"}
          />
          <Row label="rc.entitlementId" value={RC_CONFIG.entitlementId} />
          <Row label="rc.monthly" value={RC_CONFIG.productIds.monthly} />
          <Row label="rc.yearly" value={RC_CONFIG.productIds.yearly} />
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <Text
        style={{
          color: "#5B21B6",
          opacity: 0.7,
          fontSize: 11,
          fontFamily: "monospace",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: "#5B21B6",
          fontSize: 11,
          fontFamily: "monospace",
          flexShrink: 1,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default SubscriptionDebugPanel;
