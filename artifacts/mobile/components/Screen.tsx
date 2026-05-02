import React from "react";
import { View, ScrollView, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: object;
  contentContainerStyle?: object;
}

export function Screen({ children, scrollable = true, style, contentContainerStyle }: ScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === "web" ? { paddingTop: 67 } : {}),
  };

  const contentStyle = {
    padding: 16,
    paddingBottom: Platform.OS === "web" ? 100 : 80,
    ...contentContainerStyle,
  };

  if (!scrollable) {
    return (
      <View style={[containerStyle, style]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[containerStyle, style]}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
