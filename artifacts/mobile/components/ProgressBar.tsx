import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
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
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);
  const ringColor = color ?? colors.primary;
  const ringTrack = trackColor ?? colors.muted;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringTrack}
          strokeWidth={thickness}
          fill="none"
        />
        {/* progress arc — rotated -90deg so 0% starts at top */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {children ?? <Typography variant="h3">{Math.round(pct)}%</Typography>}
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
