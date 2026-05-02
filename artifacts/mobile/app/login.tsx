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
import { LanguagePicker, type AppLanguage } from "@/components/LanguagePicker";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { getPreferredLanguage, setPreferredLanguage } from "@/lib/languagePreference";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, signInWithGoogle, signInWithApple } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const passwordRef = useRef<TextInput>(null);

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await login(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
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
            variant="segmented"
            value={language}
            onChange={handleLanguageChange}
            testID="login-language-picker"
          />
        </View>

        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Feather name="book-open" size={32} color={colors.primaryForeground} />
          </View>
          <Typography variant="h1" center style={{ marginTop: 16 }}>
            Murciélingo
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 4 }}>
            Learn Spanish naturally
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Typography variant="h3" style={{ marginBottom: 20 }}>
            Sign in
          </Typography>

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
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            testID="login-email"
          />

          <AppTextInput
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            containerStyle={{ marginBottom: 8 }}
            testID="login-password"
          />

          <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            style={styles.forgotRow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: "Inter_500Medium" }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <AppButton
            title={loading ? "Signing in…" : "Sign in"}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
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
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: 24,
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
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: -4,
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
