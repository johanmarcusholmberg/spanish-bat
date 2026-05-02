import React from "react";
import { View, Text } from "react-native";

interface Props {
  size?: "sm" | "md";
}

export function PremiumBadge({ size = "sm" }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4926B",
        paddingHorizontal: size === "md" ? 12 : 8,
        paddingVertical: size === "md" ? 6 : 3,
        borderRadius: 999,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: size === "md" ? 13 : 11,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        ★ PREMIUM
      </Text>
    </View>
  );
}

export default PremiumBadge;
