import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <Feather name="book-open" size={32} color={colors.primaryForeground} />
          </View>
          <Typography variant="h1" center style={{ marginTop: 16 }}>
            Murciélago
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
            containerStyle={{ marginBottom: 24 }}
            testID="login-password"
          />

          <AppButton
            title={loading ? "Signing in…" : "Sign in"}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            size="lg"
            style={{ marginBottom: 12 }}
            testID="login-submit"
          />
        </View>

        <View style={styles.footer}>
          <Typography variant="caption" muted center>
            Don't have an account? Sign up at murcielago.app
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
  footer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
});
