import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

interface Props {
  title?: string;
  description?: string;
  ctaLabel?: string;
}

export function LockedFeature({
  title = "Premium feature",
  description = "Upgrade to Premium to unlock this.",
  ctaLabel = "See plans",
}: Props) {
  return (
    <View
      style={{
        backgroundColor: "#FFF7F0",
        borderColor: "#F4926B",
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 32 }}>🔒</Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: "#3F2E1E",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6B5A47",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {description}
      </Text>
      <Pressable
        onPress={() => router.push("/paywall" as never)}
        style={{
          backgroundColor: "#F4926B",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 999,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

export default LockedFeature;
