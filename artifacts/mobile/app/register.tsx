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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendRegisterCode, signInWithGoogle, signInWithApple } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [displayName, setDisplayName] = useState("");
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

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const hasDisplayName = displayName.trim().length >= 2;
  const passwordOk = !password || password.length >= 8;
  const isValid = hasDisplayName && email.includes("@") && passwordOk;

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSendCode = async () => {
    if (!hasDisplayName || !email.includes("@")) {
      setError("Please enter your name and a valid email address.");
      return;
    }
    if (password && password.length < 8) {
      setError("Choose a password with at least 8 characters, or leave it blank.");
      return;
    }
    setError(null);
    setLoading(true);
    const err = await sendRegisterCode(email.trim(), displayName.trim(), password || undefined);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push({ pathname: "/verify-email", params: { email: email.trim(), mode: "register" } });
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={styles.backRow}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
            <Typography variant="caption" muted>Back to sign in</Typography>
          </TouchableOpacity>
          <LanguagePicker
            variant="globe"
            value={language}
            onChange={handleLanguageChange}
            testID="register-language-picker"
          />
        </View>

        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Murciélingo bat logo"
          />
          <Typography variant="h2" center style={{ marginTop: 10 }}>
            Create your account
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 4 }}>
            We&apos;ll email you a code to confirm.
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
            containerStyle={{ marginBottom: 16 }}
            testID="register-email"
          />

          <AppTextInput
            ref={passwordRef}
            label="Password (optional)"
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank for code sign-in"
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="send"
            onSubmitEditing={handleSendCode}
            containerStyle={{ marginBottom: 20 }}
            testID="register-password"
          />

          <AppButton
            title={loading ? "Sending…" : "Send code"}
            onPress={handleSendCode}
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
      <AuthMessageBanner message={error} />
    </KeyboardAvoidingView>
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
  logoImage: {
    width: 84,
    height: 84,
  },
  card: {
    borderRadius: 16,
    padding: 22,
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
    marginTop: 20,
    paddingHorizontal: 8,
  },
});
