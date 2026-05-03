import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
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

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const { verifyEmail, resendVerificationCode } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleVerify = async () => {
    if (code.trim().length === 0) {
      setError("Please enter the verification code from your email.");
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    const err = await verifyEmail(code.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      // Land brand-new accounts on the welcome / first-session intro instead
      // of dropping them straight onto the dashboard.
      router.replace("/welcome");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    const err = await resendVerificationCode();
    setResending(false);
    if (err) {
      setError(err);
    } else {
      setInfo("A new code is on its way. Check your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
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
            paddingTop: Platform.OS === "web" ? 80 : insets.top + 40,
            paddingBottom: Platform.OS === "web" ? 60 : insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Feather name="mail" size={28} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 14 }}>
            Verify your email
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6, paddingHorizontal: 12 }}>
            We sent a 6-digit code to{params.email ? "" : " your email"}
            {params.email ? <Text style={{ color: colors.foreground }}> {params.email}</Text> : null}
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AuthMessageBanner message={error} />
          <AuthMessageBanner message={info} variant="info" />

          <AppTextInput
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            containerStyle={{ marginBottom: 20 }}
            testID="verify-email-code"
          />

          <AppButton
            title={loading ? "Verifying…" : "Verify email"}
            onPress={handleVerify}
            loading={loading}
            disabled={loading || code.trim().length === 0}
            size="lg"
            testID="verify-email-submit"
          />
        </View>

        <View style={styles.footer}>
          <Typography variant="caption" muted center>
            Didn't receive a code?{" "}
            <Text
              onPress={handleResend}
              style={{
                color: cooldown > 0 || resending ? colors.mutedForeground : colors.primary,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </Text>
          </Typography>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
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
  footer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
});
