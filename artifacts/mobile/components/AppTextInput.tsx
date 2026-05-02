import React, { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ label, error, hint, isPassword, containerStyle, style, testID, ...props }, ref) => {
    const colors = useColors();
    const [showPassword, setShowPassword] = useState(false);

    const inputBorderColor = error ? colors.destructive : colors.border;

    return (
      <View style={[{ marginBottom: 16 }, containerStyle]}>
        {label ? (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.foreground,
              marginBottom: 6,
              fontFamily: "Inter_500Medium",
            }}
          >
            {label}
          </Text>
        ) : null}

        <View style={{ position: "relative" }}>
          <TextInput
            ref={ref}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.mutedForeground}
            testID={testID}
            {...props}
            style={[
              {
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: inputBorderColor,
                borderRadius: colors.radius,
                paddingVertical: 12,
                paddingHorizontal: 14,
                paddingRight: isPassword ? 44 : 14,
                fontSize: 15,
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
              },
              style,
            ]}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.destructive,
              marginTop: 4,
              fontFamily: "Inter_400Regular",
            }}
          >
            {error}
          </Text>
        ) : null}

        {hint && !error ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.mutedForeground,
              marginTop: 4,
              fontFamily: "Inter_400Regular",
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

AppTextInput.displayName = "AppTextInput";
