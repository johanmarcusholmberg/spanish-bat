import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";

export type AppLanguage = "sv" | "en";

const OPTIONS: {
  code: AppLanguage;
  flag: string;
  short: string;
  long: string;
}[] = [
  { code: "sv", flag: "🇸🇪", short: "SV", long: "Swedish" },
  { code: "en", flag: "🇬🇧", short: "EN", long: "English" },
];

interface LanguagePickerProps {
  value: AppLanguage;
  onChange: (lang: AppLanguage) => void;
  variant?: "segmented" | "card";
  style?: ViewStyle;
  testID?: string;
}

/**
 * Standardized language picker. Used in two visual modes:
 * - `segmented`: compact pill (auth screens, top-right)
 * - `card`:      side-by-side cards (Profile / settings)
 */
export function LanguagePicker({
  value,
  onChange,
  variant = "segmented",
  style,
  testID,
}: LanguagePickerProps) {
  const colors = useColors();

  if (variant === "card") {
    return (
      <View
        style={[styles.cardRow, style]}
        testID={testID}
        accessibilityRole="radiogroup"
      >
        {OPTIONS.map((opt) => {
          const active = value === opt.code;
          return (
            <Pressable
              key={opt.code}
              onPress={() => onChange(opt.code)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, selected: active }}
              accessibilityLabel={opt.long}
              testID={`language-card-${opt.code}`}
              style={[
                styles.card,
                {
                  backgroundColor: active ? colors.primary + "15" : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Typography
                variant="label"
                style={{
                  color: active ? colors.primary : colors.foreground,
                }}
              >
                {opt.flag}  {opt.long}
              </Typography>
              {active ? (
                <Feather name="check" size={16} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  }

  // segmented (compact)
  return (
    <View
      style={[
        styles.segmentedWrap,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
      accessibilityRole="radiogroup"
      testID={testID}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.code;
        return (
          <Pressable
            key={opt.code}
            onPress={() => onChange(opt.code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active, selected: active }}
            accessibilityLabel={opt.long}
            testID={`language-pill-${opt.code}`}
            style={[
              styles.pill,
              {
                backgroundColor: active ? colors.primary : "transparent",
              },
            ]}
          >
            <Typography
              variant="caption"
              style={{
                color: active ? colors.primaryForeground : colors.mutedForeground,
                fontWeight: "600",
              }}
            >
              {opt.flag} {opt.short}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    gap: 2,
    alignSelf: "flex-start",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
