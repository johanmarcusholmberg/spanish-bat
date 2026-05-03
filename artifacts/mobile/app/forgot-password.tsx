import { Redirect, useRouter } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
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

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendResetPasswordCode } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await sendResetPasswordCode(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push({ pathname: "/reset-password", params: { email: email.trim() } });
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
            <Feather name="key" size={26} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 12 }}>
            Forgot your password?
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6, paddingHorizontal: 12 }}>
            Enter the email on your account and we'll send you a code to set a new password.
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            containerStyle={{ marginBottom: 18 }}
            testID="forgot-email"
          />
          <AppButton
            title={loading ? "Sending…" : "Send reset code"}
            onPress={handleSend}
            loading={loading}
            disabled={loading || !email.trim()}
            size="lg"
            testID="forgot-submit"
          />
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
});
