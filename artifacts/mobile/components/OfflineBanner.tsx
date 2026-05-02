import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

import { useColors } from "@/hooks/useColors";

/**
 * Top-of-screen banner that appears when the device is offline.
 * Mounted in the root layout so it overlays every screen.
 */
export function OfflineBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = React.useState(false);
  const slide = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    let mounted = true;
    const handleState = (state: NetInfoState) => {
      if (!mounted) return;
      const isOffline =
        state.isConnected === false ||
        (state.isConnected === true && state.isInternetReachable === false);
      setOffline(isOffline);
    };

    NetInfo.fetch().then(handleState).catch(() => {});
    const unsubscribe = NetInfo.addEventListener(handleState);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: offline ? 0 : -80,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [offline, slide]);

  const topPad = Platform.OS === "web" ? 12 : insets.top + 6;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          transform: [{ translateY: slide }],
          backgroundColor: colors.destructive,
          paddingTop: topPad,
        },
      ]}
    >
      <Feather name="wifi-off" size={14} color={colors.destructiveForeground} />
      <Text
        style={{
          color: colors.destructiveForeground,
          fontSize: 13,
          fontFamily: "Inter_500Medium",
        }}
      >
        You're offline — some features may not work
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
