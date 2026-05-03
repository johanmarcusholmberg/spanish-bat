import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { Typography } from "@/components/Typography";
import { useColors } from "@/hooks/useColors";
import {
  AppLanguage,
  getEnabledAppLanguages,
} from "@/lib/languages";

export type { AppLanguage };

const OPTIONS = getEnabledAppLanguages();

interface LanguagePickerProps {
  value: AppLanguage;
  onChange: (lang: AppLanguage) => void;
  variant?: "segmented" | "card" | "minimal" | "globe";
  style?: ViewStyle;
  testID?: string;
}

/**
 * Standardized language picker. Used in four visual modes:
 * - `segmented`: compact pill (settings rows)
 * - `card`:      side-by-side cards (Profile / settings)
 * - `minimal`:   borderless inline text toggle
 * - `globe`:     globe icon + lang code -> bottom sheet (auth screens, scales to many languages)
 */
export function LanguagePicker({
  value,
  onChange,
  variant = "segmented",
  style,
  testID,
}: LanguagePickerProps) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  if (variant === "globe") {
    const current = OPTIONS.find((o) => o.code === value) ?? OPTIONS[0];
    return (
      <>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Change language"
          testID={testID ?? "language-globe-trigger"}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.globeBtn, style]}
        >
          <Feather name="globe" size={14} color={colors.mutedForeground} />
          <Typography
            variant="caption"
            style={{
              color: colors.mutedForeground,
              fontWeight: "600",
              letterSpacing: 0.4,
            }}
          >
            {current.short}
          </Typography>
        </Pressable>

        <Modal
          visible={open}
          animationType="fade"
          transparent
          onRequestClose={() => setOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.sheet,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  accessibilityViewIsModal
                  accessibilityRole="menu"
                >
                  <Typography
                    variant="label"
                    style={{
                      color: colors.mutedForeground,
                      paddingHorizontal: 16,
                      paddingTop: 14,
                      paddingBottom: 6,
                      fontWeight: "600",
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      fontSize: 11,
                    }}
                  >
                    Language
                  </Typography>
                  {OPTIONS.map((opt) => {
                    const active = value === opt.code;
                    return (
                      <Pressable
                        key={opt.code}
                        onPress={() => {
                          onChange(opt.code);
                          setOpen(false);
                        }}
                        accessibilityRole="menuitem"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={opt.long}
                        testID={`language-globe-option-${opt.code}`}
                        style={({ pressed }) => [
                          styles.sheetRow,
                          pressed && { backgroundColor: colors.muted },
                        ]}
                      >
                        <Typography
                          variant="body"
                          style={{ fontSize: 18, marginRight: 12 }}
                        >
                          {opt.flag}
                        </Typography>
                        <Typography
                          variant="body"
                          style={{
                            flex: 1,
                            color: colors.foreground,
                            fontWeight: active ? "700" : "500",
                          }}
                        >
                          {opt.long}
                        </Typography>
                        {active ? (
                          <Feather
                            name="check"
                            size={18}
                            color={colors.primary}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  }

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
  globeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingBottom: 28,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
