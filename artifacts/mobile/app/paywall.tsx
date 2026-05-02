import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Stack, router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import {
  getCurrentOffering,
  identifyUser,
  isRevenueCatConfigured,
  purchasePackage,
  restorePurchases,
  type Offering,
  type OfferingPackage,
} from "@/lib/revenuecat";

const COPY = {
  title: "Go Premium",
  subtitle: "Unlock the full Murciélingo experience.",
  monthlyLabel: "Monthly",
  yearlyLabel: "Yearly · best value",
  features: [
    "Unlimited lessons & exercises",
    "Full grammar library",
    "All reading passages",
    "Spaced-repetition review mode",
    "Advanced progress stats",
  ],
  restore: "Restore purchases",
  notConfigured:
    "In-app purchases aren't enabled in this build. You can keep using the free experience.",
  notSignedIn: "Please sign in to subscribe.",
  signIn: "Sign in",
  thanks: "Thanks for subscribing!",
  restored: "Purchases restored.",
  noRestore: "No previous purchases found.",
  loadingOfferings: "Loading plans…",
  noOfferings:
    "No subscription plans are currently available. Try again later.",
  alreadyPremium: "You're already a Premium member 🎉",
  manage:
    "Subscriptions are managed in the App Store / Play Store settings on your device.",
} as const;

export default function PaywallScreen() {
  const { isLoggedIn, user, userId } = useAuth();
  const { isPremium, refresh } = useSubscription();

  const [offering, setOffering] = useState<Offering | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const configured = isRevenueCatConfigured();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!configured) {
        setLoadingOfferings(false);
        return;
      }
      try {
        const o = await getCurrentOffering();
        if (!cancelled) setOffering(o);
      } finally {
        if (!cancelled) setLoadingOfferings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [configured]);

  /**
   * Hard guard: every purchase/restore re-asserts the RC identity matches
   * the current Clerk userId. AuthContext already does this on auth
   * changes, but a slow Clerk session restore could leave the SDK
   * anonymous when the screen first mounts. Better one extra logIn() than
   * a purchase that writes `$RCAnonymousID...` into our subscription
   * tables.
   */
  async function ensureIdentity(): Promise<boolean> {
    if (!userId) return false;
    await identifyUser(userId);
    return true;
  }

  async function onPurchase(pkg: OfferingPackage) {
    if (!isLoggedIn || !userId) {
      router.push("/login" as never);
      return;
    }
    if (!(await ensureIdentity())) {
      Alert.alert("Sign-in required", "Please sign in before purchasing.");
      return;
    }
    setBusyId(pkg.identifier);
    const result = await purchasePackage(pkg);
    setBusyId(null);
    if (result.cancelled) return;
    if (!result.ok) {
      Alert.alert("Purchase failed", result.error ?? "Please try again.");
      return;
    }
    await refresh();
    Alert.alert("Welcome to Premium", COPY.thanks);
  }

  async function onRestore() {
    if (!isLoggedIn || !userId) {
      router.push("/login" as never);
      return;
    }
    if (!(await ensureIdentity())) {
      Alert.alert("Sign-in required", "Please sign in before restoring.");
      return;
    }
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);
    if (!result.ok) {
      Alert.alert("Restore failed", result.error ?? "Please try again.");
      return;
    }
    await refresh();
    Alert.alert(COPY.restored, COPY.manage);
  }

  return (
    <>
      <Stack.Screen options={{ title: "Premium" }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: "#FBF6EE" }}
        contentContainerStyle={{ padding: 24, gap: 20 }}
      >
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#3F2E1E" }}>
            {COPY.title}
          </Text>
          <Text style={{ fontSize: 15, color: "#6B5A47" }}>{COPY.subtitle}</Text>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}
        >
          {COPY.features.map((f) => (
            <View
              key={f}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={{ color: "#F4926B", fontWeight: "700" }}>✓</Text>
              <Text style={{ color: "#3F2E1E", fontSize: 15 }}>{f}</Text>
            </View>
          ))}
        </View>

        {isPremium && (
          <View
            style={{
              backgroundColor: "#E8F5E9",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: "#2E7D32", fontWeight: "700", marginBottom: 4 }}
            >
              {COPY.alreadyPremium}
            </Text>
            <Text style={{ color: "#2E7D32", fontSize: 13 }}>{COPY.manage}</Text>
          </View>
        )}

        {!configured && (
          <View
            style={{
              backgroundColor: "#FFF3CD",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#856404", fontSize: 14 }}>
              {COPY.notConfigured}
            </Text>
          </View>
        )}

        {configured && !isPremium && loadingOfferings && (
          <View style={{ alignItems: "center", padding: 24 }}>
            <ActivityIndicator color="#F4926B" />
            <Text style={{ marginTop: 8, color: "#6B5A47" }}>
              {COPY.loadingOfferings}
            </Text>
          </View>
        )}

        {configured && !isPremium && !loadingOfferings && !offering && (
          <View
            style={{
              backgroundColor: "#FDECEA",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#B71C1C" }}>{COPY.noOfferings}</Text>
          </View>
        )}

        {configured && !isPremium && offering && (
          <View style={{ gap: 12 }}>
            {offering.yearly && (
              <PlanButton
                label={COPY.yearlyLabel}
                pkg={offering.yearly}
                busy={busyId === offering.yearly.identifier}
                disabled={busyId !== null}
                highlight
                onPress={() => onPurchase(offering.yearly!)}
              />
            )}
            {offering.monthly && (
              <PlanButton
                label={COPY.monthlyLabel}
                pkg={offering.monthly}
                busy={busyId === offering.monthly.identifier}
                disabled={busyId !== null}
                onPress={() => onPurchase(offering.monthly!)}
              />
            )}
            {!offering.monthly &&
              !offering.yearly &&
              offering.all.map((pkg) => (
                <PlanButton
                  key={pkg.identifier}
                  label={pkg.identifier}
                  pkg={pkg}
                  busy={busyId === pkg.identifier}
                  disabled={busyId !== null}
                  onPress={() => onPurchase(pkg)}
                />
              ))}
          </View>
        )}

        {!isLoggedIn && (
          <Pressable
            onPress={() => router.push("/login" as never)}
            style={{
              backgroundColor: "#3F2E1E",
              paddingVertical: 14,
              borderRadius: 999,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {COPY.signIn}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onRestore}
          disabled={restoring || !configured}
          style={{
            paddingVertical: 14,
            alignItems: "center",
            opacity: restoring || !configured ? 0.5 : 1,
          }}
        >
          {restoring ? (
            <ActivityIndicator color="#3F2E1E" />
          ) : (
            <Text style={{ color: "#3F2E1E", fontWeight: "600" }}>
              {COPY.restore}
            </Text>
          )}
        </Pressable>

        {user && (
          <Text
            style={{
              fontSize: 11,
              color: "#9A8975",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Signed in as {user.email}
          </Text>
        )}
      </ScrollView>
    </>
  );
}

interface PlanButtonProps {
  label: string;
  pkg: OfferingPackage;
  busy: boolean;
  disabled: boolean;
  highlight?: boolean;
  onPress: () => void;
}

function PlanButton({
  label,
  pkg,
  busy,
  disabled,
  highlight,
  onPress,
}: PlanButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: highlight ? "#F4926B" : "#fff",
        borderColor: "#F4926B",
        borderWidth: 2,
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: disabled && !busy ? 0.5 : 1,
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: highlight ? "#fff" : "#3F2E1E",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: highlight ? "#FFF7F0" : "#6B5A47",
            marginTop: 2,
          }}
        >
          {pkg.productIdentifier}
        </Text>
      </View>
      {busy ? (
        <ActivityIndicator color={highlight ? "#fff" : "#F4926B"} />
      ) : (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: highlight ? "#fff" : "#3F2E1E",
          }}
        >
          {pkg.priceString}
        </Text>
      )}
    </Pressable>
  );
}
