import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";

type Variant = "error" | "info";

interface Props {
  message: string | null;
  variant?: Variant;
}

/**
 * A seamless, animated message banner used across the auth screens.
 *
 * It is always mounted so the surrounding form never jumps when a message
 * appears or disappears. When `message` toggles, opacity, vertical translate
 * and max-height all animate together, producing a smooth fade-in/out and
 * collapse instead of a hard layout snap.
 */
export function AuthMessageBanner({ message, variant = "error" }: Props) {
  const colors = useColors();
  const progress = useRef(new Animated.Value(message ? 1 : 0)).current;
  // Latch the most recently shown text so it stays readable while the banner
  // animates closed (otherwise the text vanishes the instant `message` flips
  // back to null and we'd see the box fade out empty).
  const latched = useRef(message ?? "");
  if (message) latched.current = message;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: message ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [message, progress]);

  const isError = variant === "error";
  const accent = isError ? colors.destructive : colors.primary;
  const textColor = isError ? colors.destructive : colors.foreground;
  const iconName = isError ? "alert-circle" : "check-circle";

  return (
    <Animated.View
      pointerEvents={message ? "auto" : "none"}
      style={{
        opacity: progress,
        maxHeight: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }),
        transform: [
          {
            translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }),
          },
        ],
        marginBottom: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }),
        overflow: "hidden",
      }}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: accent + "20",
            borderColor: accent + "40",
          },
        ]}
      >
        <Feather name={iconName} size={16} color={accent} />
        <Text
          style={{
            color: textColor,
            fontSize: 14,
            flex: 1,
            fontFamily: "Inter_400Regular",
          }}
        >
          {latched.current}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
