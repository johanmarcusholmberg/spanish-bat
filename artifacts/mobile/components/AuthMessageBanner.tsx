import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Variant = "error" | "info";

interface Props {
  message: string | null;
  variant?: Variant;
}

/**
 * A floating, toast-style message banner for the auth screens.
 *
 * Rendered as an absolute-positioned overlay anchored to the top of the
 * screen, so it never affects the form's layout — the inputs and buttons
 * stay perfectly still and the banner just "pops up" over the top of the
 * card. Slides in from above with a fade and slides back out when cleared.
 */
export function AuthMessageBanner({ message, variant = "error" }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(message ? 1 : 0)).current;

  // Latch the most recently shown text so it stays readable while the banner
  // animates closed (otherwise the text would vanish the instant `message`
  // flips back to null and we'd see the box fade out empty).
  const latched = useRef(message ?? "");
  if (message) latched.current = message;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: message ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [message, progress]);

  const isError = variant === "error";
  const accent = isError ? colors.destructive : colors.primary;
  const textColor = isError ? colors.destructive : colors.foreground;
  const iconName = isError ? "alert-circle" : "check-circle";

  // Anchor below the safe-area / status bar with a small breathing gap.
  const topOffset = (insets.top || (Platform.OS === "web" ? 16 : 0)) + 12;

  return (
    <Animated.View
      pointerEvents={message ? "box-none" : "none"}
      style={[
        styles.overlay,
        {
          top: topOffset,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.card,
            borderColor: accent + "55",
            shadowColor: accent,
          },
        ]}
      >
        <View style={[styles.accentStripe, { backgroundColor: accent }]} />
        <Feather name={iconName} size={18} color={accent} style={{ marginLeft: 12 }} />
        <Text
          style={{
            color: textColor,
            fontSize: 14,
            flex: 1,
            paddingVertical: 12,
            paddingRight: 14,
            paddingLeft: 10,
            fontFamily: "Inter_500Medium",
          }}
          numberOfLines={3}
        >
          {latched.current}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 12,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  accentStripe: {
    width: 4,
    alignSelf: "stretch",
  },
});
