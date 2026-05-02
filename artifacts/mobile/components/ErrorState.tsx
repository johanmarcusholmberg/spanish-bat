import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/components/Typography";
import { AppButton } from "@/components/AppButton";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  style,
}: ErrorStateProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[styles.iconBox, { backgroundColor: colors.destructive + "20" }]}
      >
        <Feather name="alert-circle" size={28} color={colors.destructive} />
      </View>
      <Typography variant="h3" center style={{ marginTop: 14 }}>
        {title}
      </Typography>
      {message ? (
        <Typography
          variant="body"
          muted
          center
          style={{ marginTop: 6, maxWidth: 320 }}
        >
          {message}
        </Typography>
      ) : null}
      {onRetry ? (
        <AppButton
          title={retryLabel}
          onPress={onRetry}
          variant="outline"
          size="md"
          style={{ marginTop: 18 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
