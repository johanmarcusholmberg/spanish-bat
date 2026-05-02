import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register, signInWithGoogle, signInWithApple } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const hasDisplayName = displayName.trim().length >= 2;
  const isValid = hasDisplayName && hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch && email.includes("@");

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleRegister = async () => {
    if (!isValid) {
      setError("Please complete all fields and meet password requirements.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await register(email.trim(), password, displayName.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push({ pathname: "/verify-email", params: { email: email.trim() } });
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    setLoading(true);
    const err = provider === "google" ? await signInWithGoogle() : await signInWithApple();
    setLoading(false);
    if (err) setError(err);
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
            <Feather name="user-plus" size={28} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 14 }}>
            Create your account
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 4 }}>
            Start learning Spanish today
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
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="What should we call you?"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            testID="register-display-name"
          />

          <AppTextInput
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            testID="register-email"
          />

          <AppTextInput
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            testID="register-password"
          />

          <View style={styles.requirements}>
            <Requirement met={hasMinLength} text="At least 8 characters" colors={colors} />
            <Requirement met={hasUppercase} text="One uppercase letter" colors={colors} />
            <Requirement met={hasNumber} text="One number" colors={colors} />
            <Requirement met={hasSpecial} text="One special character" colors={colors} />
          </View>

          <AppTextInput
            ref={confirmRef}
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={confirmPassword.length > 0 && !passwordsMatch ? "Passwords don't match" : undefined}
            containerStyle={{ marginTop: 12, marginBottom: 20 }}
            testID="register-confirm-password"
          />

          <AppButton
            title={loading ? "Creating account…" : "Create account"}
            onPress={handleRegister}
            loading={loading}
            disabled={loading || !isValid}
            size="lg"
            testID="register-submit"
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Typography variant="caption" muted>or sign up with</Typography>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={{ gap: 10 }}>
            <AppButton
              title="Continue with Google"
              onPress={() => handleOAuth("google")}
              variant="outline"
              size="lg"
              disabled={loading}
              testID="register-google"
            />
            {Platform.OS !== "android" && (
              <AppButton
                title="Continue with Apple"
                onPress={() => handleOAuth("apple")}
                variant="outline"
                size="lg"
                disabled={loading}
                testID="register-apple"
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Typography variant="caption" muted center>
            Already have an account?{" "}
            <Text
              onPress={() => router.replace("/login")}
              style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
            >
              Sign in
            </Text>
          </Typography>
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
});
