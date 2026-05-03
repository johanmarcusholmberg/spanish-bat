import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthMessageBanner } from "@/components/AuthMessageBanner";
import { LanguagePicker, type AppLanguage } from "@/components/LanguagePicker";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getPreferredLanguage, setPreferredLanguage } from "@/lib/languagePreference";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendLoginCode, signInWithGoogle, signInWithApple } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<AppLanguage>("sv");

  React.useEffect(() => {
    getPreferredLanguage().then(setLanguage);
  }, []);

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
    setPreferredLanguage(lang);
  };

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

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
            value={language}
            onChange={handleLanguageChange}
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
            Learn Spanish naturally
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Typography variant="h3" style={{ marginBottom: 6 }}>
            Sign in
          </Typography>
          <Typography variant="caption" muted style={{ marginBottom: 18 }}>
            We&apos;ll email you a one-time code — no password needed.
          </Typography>

          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handleSendCode}
            containerStyle={{ marginBottom: 16 }}
            testID="login-email"
          />

          <AppButton
            title={loading ? "Sending…" : "Send code"}
            onPress={handleSendCode}
            loading={loading}
            disabled={loading || !email.trim()}
            size="lg"
            testID="login-submit"
          />

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Typography variant="caption" muted>or sign in with</Typography>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={{ gap: 10 }}>
            <AppButton
              title="Continue with Google"
              onPress={() => handleOAuth("google")}
              variant="outline"
              size="lg"
              disabled={loading}
              testID="login-google"
            />
            {Platform.OS !== "android" && (
              <AppButton
                title="Continue with Apple"
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
            Don't have an account?{" "}
            <Text
              onPress={() => router.push("/register")}
              style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
            >
              Create one
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
