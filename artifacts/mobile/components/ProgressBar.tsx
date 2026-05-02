import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Typography } from "@/components/Typography";

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  max = 100,
  height = 8,
  color,
  trackColor,
  showLabel = false,
  label,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <View style={style}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Typography variant="caption" muted>
            {label ?? "Progress"}
          </Typography>
          <Typography variant="caption" muted>
            {Math.round(pct)}%
          </Typography>
        </View>
      )}
      <View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? colors.muted,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color ?? colors.primary,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  thickness = 8,
  color,
  trackColor,
  children,
}: CircularProgressProps) {
  const colors = useColors();
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));
  const inner = size - thickness * 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: trackColor ?? colors.muted,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: color ?? colors.primary,
          opacity: pct >= 100 ? 1 : 0.85,
        }}
      />
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children ?? (
          <Typography variant="h3">{Math.round(pct)}%</Typography>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
});
