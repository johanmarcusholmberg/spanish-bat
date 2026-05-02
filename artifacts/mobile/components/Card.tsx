import React from "react";
import { View, ViewStyle, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
  variant?: "default" | "muted" | "primary" | "outline";
  testID?: string;
}

export function Card({
  children,
  onPress,
  style,
  padding = 16,
  variant = "default",
  testID,
}: CardProps) {
  const colors = useColors();

  const variantStyle: ViewStyle = (() => {
    switch (variant) {
      case "muted":
        return { backgroundColor: colors.muted, borderColor: colors.border };
      case "primary":
        return {
          backgroundColor: colors.primary + "15",
          borderColor: colors.primary + "40",
        };
      case "outline":
        return { backgroundColor: "transparent", borderColor: colors.border };
      default:
        return { backgroundColor: colors.card, borderColor: colors.border };
    }
  })();

  const baseStyle: ViewStyle = {
    borderRadius: 14,
    borderWidth: 1,
    padding,
    ...variantStyle,
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        style={({ pressed }) => [baseStyle, style as ViewStyle, pressed && { opacity: 0.85 }]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[baseStyle, style as ViewStyle]}>
      {children}
    </View>
  );
}
