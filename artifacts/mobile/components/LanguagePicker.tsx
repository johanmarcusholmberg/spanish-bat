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
  variant?: "segmented" | "card" | "minimal";
  style?: ViewStyle;
  testID?: string;
}

/**
 * Standardized language picker. Used in three visual modes:
 * - `segmented`: compact pill (settings rows)
 * - `card`:      side-by-side cards (Profile / settings)
 * - `minimal`:   borderless inline text toggle (auth screens — blends with background)
 */
export function LanguagePicker({
  value,
  onChange,
  variant = "segmented",
  style,
  testID,
}: LanguagePickerProps) {
  const colors = useColors();

  if (variant === "minimal") {
    return (
      <View
        style={[styles.minimalRow, style]}
        accessibilityRole="radiogroup"
        testID={testID}
      >
        {OPTIONS.map((opt, i) => {
          const active = value === opt.code;
          return (
            <React.Fragment key={opt.code}>
              {i > 0 ? (
                <View
                  style={[styles.minimalDivider, { backgroundColor: colors.border }]}
                />
              ) : null}
              <Pressable
                onPress={() => onChange(opt.code)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active, selected: active }}
                accessibilityLabel={opt.long}
                testID={`language-minimal-${opt.code}`}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                style={styles.minimalBtn}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: active ? colors.primary : colors.mutedForeground,
                    fontWeight: active ? "700" : "500",
                    letterSpacing: 0.4,
                  }}
                >
                  {opt.short}
                </Typography>
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>
    );
  }

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
  minimalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  minimalBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  minimalDivider: {
    width: 1,
    height: 12,
    opacity: 0.5,
  },
});
