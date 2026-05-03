import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthMessageBanner } from "@/components/AuthMessageBanner";
import { LanguagePicker } from "@/components/LanguagePicker";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

type Mode = "password" | "code";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithPassword, sendLoginCode, signInWithGoogle, signInWithApple } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handlePasswordSignIn = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await loginWithPassword(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsSecondFactor) {
      router.push({
        pathname: "/verify-2fa",
        params: { email: email.trim(), mode: result.needsTotp ? "totp" : "email" },
      });
    }
  };

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await sendLoginCode(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push({ pathname: "/verify-email", params: { email: email.trim(), mode: "login" } });
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
            paddingTop: Platform.OS === "web" ? 80 : insets.top + 40,
            paddingBottom: Platform.OS === "web" ? 60 : insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
          <LanguagePicker
            variant="globe"
            testID="login-language-picker"
          />
        </View>

        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Murciélingo bat logo"
          />
          <Typography variant="h1" center style={{ marginTop: 12 }}>
            Murciélingo
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 4 }}>
            {t("login.tagline")}
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Typography variant="h3" style={{ marginBottom: 6 }}>
            {t("login.title")}
          </Typography>
          <Typography variant="caption" muted style={{ marginBottom: 18 }}>
            {mode === "password"
              ? t("login.subtitlePassword")
              : t("login.subtitleCode")}
          </Typography>

          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType={mode === "password" ? "next" : "send"}
            onSubmitEditing={
              mode === "password" ? () => passwordRef.current?.focus() : handleSendCode
            }
            containerStyle={{ marginBottom: 16 }}
            testID="login-email"
          />

          {mode === "password" && (
            <>
              <AppTextInput
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="current-password"
                returnKeyType="send"
                onSubmitEditing={handlePasswordSignIn}
                containerStyle={{ marginBottom: 8 }}
                testID="login-password"
              />
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                style={styles.forgotRow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="login-forgot-password"
              >
                <Typography variant="caption" style={{ color: colors.primary }}>
                  {t("login.forgotPassword")}
                </Typography>
              </TouchableOpacity>
              <AppButton
                title={loading ? t("login.submitting") : t("login.submit")}
                onPress={handlePasswordSignIn}
                loading={loading}
                disabled={loading || !email.trim() || !password}
                size="lg"
                testID="login-submit"
              />
              <TouchableOpacity
                onPress={() => {
                  setMode("code");
                  setError(null);
                  setPassword("");
                }}
                style={styles.toggleRow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="login-use-code"
              >
                <Typography variant="caption" muted>
                  {t("login.useCodeInstead")}
                </Typography>
              </TouchableOpacity>
            </>
          )}

          {mode === "code" && (
            <>
              <AppButton
                title={loading ? t("login.sendingCode") : t("login.sendCode")}
                onPress={handleSendCode}
                loading={loading}
                disabled={loading || !email.trim()}
                size="lg"
                testID="login-submit"
              />
              <TouchableOpacity
                onPress={() => {
                  setMode("password");
                  setError(null);
                }}
                style={styles.toggleRow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                testID="login-use-password"
              >
                <Typography variant="caption" muted>
                  {t("login.usePasswordInstead")}
                </Typography>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Typography variant="caption" muted>{t("login.orSignInWith")}</Typography>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={{ gap: 10 }}>
            <AppButton
              title={t("login.continueWithGoogle")}
              onPress={() => handleOAuth("google")}
              variant="outline"
              size="lg"
              disabled={loading}
              testID="login-google"
            />
            {Platform.OS !== "android" && (
              <AppButton
                title={t("login.continueWithApple")}
                onPress={() => handleOAuth("apple")}
                variant="outline"
                size="lg"
                disabled={loading}
                testID="login-apple"
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Typography variant="caption" muted center>
            {t("login.noAccount")}{" "}
            <Text
              onPress={() => router.push("/register")}
              style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
            >
              {t("login.createOne")}
            </Text>
          </Typography>
        </View>
      </ScrollView>
      <AuthMessageBanner message={error} />
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
    marginBottom: 32,
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  toggleRow: {
    alignSelf: "center",
    marginTop: 12,
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
    marginTop: 24,
    paddingHorizontal: 8,
  },
});
