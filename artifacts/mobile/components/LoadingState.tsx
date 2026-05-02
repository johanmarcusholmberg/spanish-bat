import React from "react";
import { View, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/components/Typography";

interface LoadingStateProps {
  label?: string;
  fullscreen?: boolean;
  style?: ViewStyle;
}

export function LoadingState({
  label,
  fullscreen = false,
  style,
}: LoadingStateProps) {
  const colors = useColors();

  return (
    <View
      style={[
        fullscreen ? styles.fullscreen : styles.inline,
        fullscreen && { backgroundColor: colors.background },
        style,
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <Typography variant="bodySmall" muted style={{ marginTop: 12 }}>
          {label}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inline: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
