import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function VerifyEmailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { verifyEmail } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleVerify = async () => {
    if (code.trim().length === 0) {
      setError("Please enter the verification code from your email.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await verifyEmail(code.trim());
    setLoading(false);
    if (err) {
      setError(err);
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
              onPress={() => router.replace("/register")}
              style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
            >
              Try again
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
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
});
