import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthMessageBanner } from "@/components/AuthMessageBanner";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type FactorMode = "email" | "totp" | "backup";

export default function Verify2FAScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();
  const { verifySecondFactorCode, verifyTotpSecondFactor, verifyBackupCodeSecondFactor } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const initial: FactorMode = params.mode === "totp" ? "totp" : "email";
  const [mode, setMode] = useState<FactorMode>(initial);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleVerify = async () => {
    if (!code.trim()) {
      setError(
        mode === "email"
          ? "Please enter the code from your email."
          : mode === "totp"
            ? "Enter the 6-digit code from your authenticator app."
            : "Enter one of your backup codes.",
      );
      return;
    }
    setError(null);
    setLoading(true);
    const err =
      mode === "email"
        ? await verifySecondFactorCode(code.trim())
        : mode === "totp"
          ? await verifyTotpSecondFactor(code.trim())
          : await verifyBackupCodeSecondFactor(code.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(tabs)");
    }
  };

  const headline =
    mode === "email"
      ? "Two-factor verification"
      : mode === "totp"
        ? "Authenticator code"
        : "Backup code";

  const subtitle =
    mode === "email"
      ? params.email
        ? `We sent a 6-digit code to ${params.email} to confirm it's you.`
        : "We sent a 6-digit code to your email to confirm it's you."
      : mode === "totp"
        ? "Open your authenticator app and enter the 6-digit code shown for Murciélingo."
        : "Enter one of the one-time backup codes you saved when you set up 2FA.";

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
          <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={26} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 12 }}>
            {headline}
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6, paddingHorizontal: 12 }}>
            {subtitle}
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppTextInput
            label={mode === "backup" ? "Backup code" : "Verification code"}
            value={code}
            onChangeText={setCode}
            placeholder={mode === "backup" ? "abcd-1234" : "123456"}
            keyboardType={mode === "backup" ? "default" : "number-pad"}
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            containerStyle={{ marginBottom: 18 }}
            testID="verify-2fa-code"
          />
          <AppButton
            title={loading ? "Verifying…" : "Verify"}
            onPress={handleVerify}
            loading={loading}
            disabled={loading || !code.trim()}
            size="lg"
            testID="verify-2fa-submit"
          />

          {(mode === "totp" || mode === "backup") && (
            <TouchableOpacity
              onPress={() => {
                setMode(mode === "backup" ? "totp" : "backup");
                setCode("");
                setError(null);
              }}
              style={styles.toggleRow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="verify-2fa-toggle"
            >
              <Typography variant="caption" muted>
                {mode === "backup"
                  ? "Use authenticator code instead"
                  : "Use a backup code instead"}
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <AuthMessageBanner message={error} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  header: { alignItems: "center", marginBottom: 24 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { borderRadius: 16, padding: 22, borderWidth: 1 },
  toggleRow: { alignSelf: "center", marginTop: 14 },
});
