import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface TypographyProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "bodySmall" | "caption" | "label";
  color?: string;
  muted?: boolean;
  center?: boolean;
  bold?: boolean;
}

export function Typography({
  variant = "body",
  color,
  muted,
  center,
  bold,
  style,
  children,
  ...props
}: TypographyProps) {
  const colors = useColors();

  const baseColor = color ?? (muted ? colors.mutedForeground : colors.foreground);

  const variantStyles: Record<string, object> = {
    h1: {
      fontSize: 28,
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
      lineHeight: 34,
    },
    h2: {
      fontSize: 22,
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: "400" as const,
      fontFamily: "Inter_400Regular",
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: "400" as const,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400" as const,
      fontFamily: "Inter_400Regular",
      lineHeight: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "500" as const,
      fontFamily: "Inter_500Medium",
      lineHeight: 20,
    },
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        {
          color: baseColor,
          textAlign: center ? "center" : "left",
          fontWeight: bold ? "700" : undefined,
          fontFamily: bold ? "Inter_700Bold" : undefined,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
