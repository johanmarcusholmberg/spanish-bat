import React from "react";
import { View, Text, Pressable } from "react-native";

interface Props {
  message?: string | null;
  onRetry?: () => void | Promise<void>;
  variant?:
    | "entitlement-load"
    | "revenuecat-unavailable"
    | "missing-env";
}

const COPY = {
  "entitlement-load": {
    title: "Couldn't load your subscription",
    desc: "We couldn't fetch your premium status right now. You can still use the free features.",
  },
  "revenuecat-unavailable": {
    title: "In-app purchases unavailable",
    desc: "The App Store / Play Store service isn't responding right now. Please try again in a moment.",
  },
  "missing-env": {
    title: "Subscriptions not enabled",
    desc: "In-app purchases aren't configured in this build. You can keep using the free experience.",
  },
} as const;

export function EntitlementError({
  message,
  onRetry,
  variant = "entitlement-load",
}: Props) {
  const t = COPY[variant];
  return (
    <View
      style={{
        backgroundColor: "#FFF7E6",
        borderColor: "#F4926B",
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        gap: 6,
      }}
      accessibilityRole="alert"
    >
      <Text style={{ fontWeight: "700", color: "#3F2E1E", fontSize: 15 }}>
        {t.title}
      </Text>
      <Text style={{ color: "#6B5A47", fontSize: 13 }}>{t.desc}</Text>
      {message ? (
        <Text
          style={{
            color: "#9A8975",
            fontSize: 11,
            fontFamily: "monospace",
            marginTop: 4,
          }}
        >
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <Pressable
          onPress={() => void onRetry()}
          style={{
            marginTop: 8,
            backgroundColor: "#3F2E1E",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 999,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
            Try again
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default EntitlementError;
