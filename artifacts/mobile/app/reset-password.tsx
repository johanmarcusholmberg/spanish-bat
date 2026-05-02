import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { completeResetPassword } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = code.trim().length > 0 && hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please complete all fields and meet password requirements.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await completeResetPassword(code.trim(), password, params.email);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? 60 : insets.top + 24,
            paddingBottom: Platform.OS === "web" ? 60 : insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={styles.backRow}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
          <Typography variant="caption" muted>Back to sign in</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Feather name="lock" size={28} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 14 }}>
            Reset password
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6, paddingHorizontal: 12 }}>
            Enter the code{params.email ? <Text style={{ color: colors.foreground }}> sent to {params.email}</Text> : null} and choose a new password.
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: colors.destructive + "20", borderColor: colors.destructive + "40" },
              ]}
            >
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text
                style={{
                  color: colors.destructive,
                  fontSize: 14,
                  flex: 1,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <AppTextInput
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            testID="reset-password-code"
          />

          <AppTextInput
            ref={passwordRef}
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            testID="reset-password-new"
          />

          <View style={styles.requirements}>
            <Requirement met={hasMinLength} text="At least 8 characters" colors={colors} />
            <Requirement met={hasUppercase} text="One uppercase letter" colors={colors} />
            <Requirement met={hasNumber} text="One number" colors={colors} />
            <Requirement met={hasSpecial} text="One special character" colors={colors} />
          </View>

          <AppTextInput
            ref={confirmRef}
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={confirmPassword.length > 0 && !passwordsMatch ? "Passwords don't match" : undefined}
            containerStyle={{ marginTop: 12, marginBottom: 20 }}
            testID="reset-password-confirm"
          />

          <AppButton
            title={loading ? "Resetting…" : "Reset password"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !isValid}
            size="lg"
            testID="reset-password-submit"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Requirement({ met, text, colors }: { met: boolean; text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.requirementRow}>
      <Feather
        name={met ? "check-circle" : "circle"}
        size={14}
        color={met ? colors.primary : colors.mutedForeground}
      />
      <Text
        style={{
          fontSize: 13,
          color: met ? colors.foreground : colors.mutedForeground,
          fontFamily: "Inter_400Regular",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  requirements: {
    gap: 6,
    marginTop: -8,
    marginBottom: 4,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
