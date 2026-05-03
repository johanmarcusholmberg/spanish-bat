import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
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
import { AuthMessageBanner } from "@/components/AuthMessageBanner";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { verifyResetPasswordCode } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await verifyResetPasswordCode(code.trim(), password);
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
      >
        <TouchableOpacity
          onPress={() => router.replace("/forgot-password")}
          style={styles.backRow}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
          <Typography variant="caption" muted>Change email</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
            <Feather name="lock" size={26} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 12 }}>
            Choose a new password
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6, paddingHorizontal: 12 }}>
            Enter the 6-digit code we sent to
            {params.email ? <Text style={{ color: colors.foreground }}> {params.email}</Text> : " your email"} and pick a new password.
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppTextInput
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            containerStyle={{ marginBottom: 16 }}
            testID="reset-code"
          />
          <AppTextInput
            ref={passwordRef}
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            containerStyle={{ marginBottom: 18 }}
            testID="reset-password"
          />
          <AppButton
            title={loading ? "Resetting…" : "Reset & sign in"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !code.trim() || !password}
            size="lg"
            testID="reset-submit"
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
