import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { AuthMessageBanner } from "@/components/AuthMessageBanner";
import { Typography } from "@/components/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

type Step = "intro" | "verify" | "backup";

interface TotpResource {
  uri?: string | null;
  secret?: string | null;
}

interface BackupCodeResource {
  codes?: string[];
}

export default function AdminSetup2FAScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { isAdmin, adminTotpEnrolled } = useAuth();

  const [step, setStep] = useState<Step>("intro");
  const [totp, setTotp] = useState<TotpResource | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoaded && (!isAdmin || adminTotpEnrolled)) {
    return <Redirect href="/(tabs)" />;
  }

  const startEnrolment = async () => {
    if (!clerkUser) return;
    setError(null);
    setLoading(true);
    try {
      const created = (await clerkUser.createTOTP()) as TotpResource;
      setTotp(created);
      setStep("verify");
    } catch (err) {
      const msg =
        err && typeof err === "object" && "errors" in err
          ? ((err as { errors: { longMessage?: string; message?: string }[] }).errors?.[0]?.longMessage ??
            (err as { errors: { message?: string }[] }).errors?.[0]?.message ??
            "Could not start 2FA setup")
          : "Could not start 2FA setup";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndIssueBackup = async () => {
    if (!clerkUser) return;
    if (!code.trim()) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await clerkUser.verifyTOTP({ code: code.trim() });
      const backup = (await clerkUser.createBackupCode()) as BackupCodeResource;
      setBackupCodes(backup.codes ?? []);
      api.audit.twoFaEnrolled().catch(() => {});
      setStep("backup");
    } catch (err) {
      const msg =
        err && typeof err === "object" && "errors" in err
          ? ((err as { errors: { longMessage?: string; message?: string }[] }).errors?.[0]?.longMessage ??
            (err as { errors: { message?: string }[] }).errors?.[0]?.message ??
            "Invalid code")
          : "Invalid code";
      setError(msg);
    } finally {
      setLoading(false);
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
          onPress={() => router.replace("/(tabs)")}
          style={styles.backRow}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
          <Typography variant="caption" muted>Back</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={26} color={colors.primaryForeground} />
          </View>
          <Typography variant="h2" center style={{ marginTop: 12 }}>
            Set up admin 2FA
          </Typography>
          <Typography variant="body" muted center style={{ marginTop: 6, paddingHorizontal: 12 }}>
            Admins must complete two-factor authentication with an authenticator app before continuing.
          </Typography>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {step === "intro" && (
            <>
              <Typography variant="body" style={{ marginBottom: 14 }}>
                You'll need an authenticator app like 1Password, Google Authenticator, or Authy. We'll
                show you a setup secret you can paste into the app.
              </Typography>
              <AppButton
                title={loading ? "Generating…" : "Start setup"}
                onPress={startEnrolment}
                loading={loading}
                disabled={loading}
                size="lg"
                testID="admin-2fa-start"
              />
            </>
          )}

          {step === "verify" && (
            <>
              <Typography variant="caption" muted style={{ marginBottom: 6 }}>
                Setup secret
              </Typography>
              <View style={[styles.codeBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Typography variant="body" style={{ fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) }}>
                  {totp?.secret ?? "—"}
                </Typography>
              </View>
              {totp?.uri && (
                <Typography variant="caption" muted style={{ marginBottom: 12 }}>
                  Or scan the otpauth URI in your authenticator app's QR scanner.
                </Typography>
              )}
              <AppTextInput
                label="6-digit code"
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                returnKeyType="done"
                onSubmitEditing={verifyAndIssueBackup}
                containerStyle={{ marginBottom: 16 }}
                testID="admin-2fa-code"
              />
              <AppButton
                title={loading ? "Verifying…" : "Verify & continue"}
                onPress={verifyAndIssueBackup}
                loading={loading}
                disabled={loading || !code.trim()}
                size="lg"
                testID="admin-2fa-verify"
              />
            </>
          )}

          {step === "backup" && (
            <>
              <Typography variant="body" style={{ marginBottom: 12 }}>
                Save these backup codes somewhere safe — each can be used once if you lose your authenticator.
              </Typography>
              <View style={[styles.codeBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                {backupCodes.map((bc) => (
                  <Typography
                    key={bc}
                    variant="body"
                    style={{ fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) }}
                  >
                    {bc}
                  </Typography>
                ))}
              </View>
              <AppButton
                title="Done"
                onPress={() => router.replace("/(tabs)")}
                size="lg"
                testID="admin-2fa-done"
              />
            </>
          )}
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
  iconWrap: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 16, padding: 22, borderWidth: 1 },
  codeBox: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 14, gap: 4 },
});
