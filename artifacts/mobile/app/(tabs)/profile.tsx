import React, { useState } from "react";
import { View, StyleSheet, Alert, Pressable, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { Screen } from "@/components/Screen";
import { Typography } from "@/components/Typography";
import { AppButton } from "@/components/AppButton";
import { AppTextInput } from "@/components/AppTextInput";
import { Card } from "@/components/Card";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useColors } from "@/hooks/useColors";
import { useAuth, Level } from "@/contexts/AuthContext";
import { setPreferredLanguage } from "@/lib/languagePreference";
import { api } from "@/lib/api";
import { legalLinks } from "@/lib/legal";
import NotificationPreferences from "@/components/NotificationPreferences";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout, isAdmin, updateProfile } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  };

  const openExternal = async (url?: string) => {
    if (!url) return;
    try {
      if (Platform.OS === "web") {
        await Linking.openURL(url);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch {
      Alert.alert("Could not open link", "Please try again later.");
    }
  };

  const openSupport = async () => {
    const { supportEmail, supportUrl } = legalLinks;
    if (supportEmail) {
      const subject = encodeURIComponent("Murciélingo support");
      const url = `mailto:${supportEmail}?subject=${subject}`;
      const can = await Linking.canOpenURL(url).catch(() => false);
      if (can) {
        Linking.openURL(url).catch(() => openExternal(supportUrl));
        return;
      }
    }
    openExternal(supportUrl);
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      await api.profile.delete();
      // Server has wiped data + Clerk user; sign out locally to clear session
      // and per-device cache. logout() handles routing back to /login.
      await logout();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not delete your account. Please try again or contact support.";
      Alert.alert("Account deletion failed", message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This permanently deletes your Murciélingo account, including your profile, progress, vocabulary, flashcards, and streaks. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Are you sure?",
              "Tap “Delete my account” to permanently remove your account and all of your data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete my account",
                  style: "destructive",
                  onPress: performDelete,
                },
              ],
            );
          },
        },
      ],
    );
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Display name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ displayName: trimmed });
      setEditingName(false);
    } catch {
      Alert.alert("Failed to save", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const setLevel = async (lvl: Level) => {
    if (lvl === user?.level) return;
    try {
      await updateProfile({ level: lvl });
    } catch {
      Alert.alert("Failed to save", "Please try again.");
    }
  };

  const setLanguage = async (lang: "sv" | "en") => {
    if (lang === user?.learningFrom) return;
    try {
      await updateProfile({ learningFrom: lang });
      await setPreferredLanguage(lang);
    } catch {
      Alert.alert("Failed to save", "Please try again.");
    }
  };

  return (
    <Screen>
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Typography
            variant="h1"
            style={{ color: colors.primaryForeground, fontSize: 32 }}
          >
            {(user?.displayName?.[0] ?? "?").toUpperCase()}
          </Typography>
        </View>

        {editingName ? (
          <View style={{ width: "100%", marginTop: 14 }}>
            <AppTextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Display name"
              autoFocus
            />
            <View style={styles.editActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => {
                  setNameDraft(user?.displayName ?? "");
                  setEditingName(false);
                }}
              />
              <AppButton
                title="Save"
                size="sm"
                loading={saving}
                onPress={saveName}
              />
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setNameDraft(user?.displayName ?? "");
              setEditingName(true);
            }}
            style={{ alignItems: "center", marginTop: 14 }}
          >
            <View style={styles.nameRow}>
              <Typography variant="h2">{user?.displayName ?? "Learner"}</Typography>
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
            </View>
          </Pressable>
        )}

        <Typography variant="body" muted center style={{ marginTop: 4 }}>
          {user?.email ?? ""}
        </Typography>
        {isAdmin && (
          <View
            style={[
              styles.adminBadge,
              { backgroundColor: colors.accent + "30", borderColor: colors.accent },
            ]}
          >
            <Typography variant="caption" style={{ color: colors.primary }}>
              Admin
            </Typography>
          </View>
        )}
      </View>

      {/* Level selector */}
      <Card style={{ marginBottom: 12 }}>
        <Typography variant="label" muted style={{ marginBottom: 10 }}>
          CURRENT LEVEL
        </Typography>
        <View style={styles.levelRow}>
          {LEVELS.map((lvl) => {
            const active = user?.level === lvl;
            return (
              <Pressable
                key={lvl}
                onPress={() => setLevel(lvl)}
                style={[
                  styles.levelChip,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Typography
                  variant="label"
                  style={{
                    color: active ? colors.primaryForeground : colors.mutedForeground,
                  }}
                >
                  {lvl}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Language */}
      <Card style={{ marginBottom: 12 }}>
        <Typography variant="label" muted style={{ marginBottom: 10 }}>
          LEARNING FROM
        </Typography>
        <LanguagePicker
          variant="card"
          value={user?.learningFrom ?? "sv"}
          onChange={setLanguage}
          testID="profile-language-picker"
        />
      </Card>

      {/* Notification preferences */}
      <NotificationPreferences />

      {/* Stats link */}
      <Card onPress={() => router.push("/stats")} style={{ marginBottom: 12, marginTop: 12 }}>
        <View style={styles.linkRow}>
          <View style={[styles.linkIcon, { backgroundColor: colors.secondary + "40" }]}>
            <Feather name="bar-chart-2" size={18} color={colors.secondaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Typography variant="label">Statistics</Typography>
            <Typography variant="caption" muted style={{ marginTop: 2 }}>
              Streaks, progress, vocabulary mastery
            </Typography>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </View>
      </Card>

      {/* Account & legal */}
      <Card style={{ marginBottom: 12 }}>
        <Typography variant="label" muted style={{ marginBottom: 10 }}>
          ACCOUNT
        </Typography>

        <Pressable
          onPress={() => openExternal(legalLinks.privacyPolicyUrl)}
          style={styles.linkRow}
          testID="privacy-link"
        >
          <View style={[styles.linkIcon, { backgroundColor: colors.muted }]}>
            <Feather name="shield" size={16} color={colors.mutedForeground} />
          </View>
          <Typography variant="label" style={{ flex: 1 }}>
            Privacy Policy
          </Typography>
          <Feather name="external-link" size={16} color={colors.mutedForeground} />
        </Pressable>

        <Pressable
          onPress={() => openExternal(legalLinks.termsOfServiceUrl)}
          style={[styles.linkRow, { marginTop: 10 }]}
          testID="terms-link"
        >
          <View style={[styles.linkIcon, { backgroundColor: colors.muted }]}>
            <Feather name="file-text" size={16} color={colors.mutedForeground} />
          </View>
          <Typography variant="label" style={{ flex: 1 }}>
            Terms of Service
          </Typography>
          <Feather name="external-link" size={16} color={colors.mutedForeground} />
        </Pressable>

        <Pressable
          onPress={openSupport}
          style={[styles.linkRow, { marginTop: 10 }]}
          testID="support-link"
        >
          <View style={[styles.linkIcon, { backgroundColor: colors.muted }]}>
            <Feather name="help-circle" size={16} color={colors.mutedForeground} />
          </View>
          <Typography variant="label" style={{ flex: 1 }}>
            Contact support
          </Typography>
          <Feather name="external-link" size={16} color={colors.mutedForeground} />
        </Pressable>
      </Card>

      <AppButton
        title="Sign out"
        onPress={handleLogout}
        variant="outline"
        size="lg"
        style={{ marginTop: 8 }}
        testID="logout-button"
      />

      <AppButton
        title={deleting ? "Deleting…" : "Delete account"}
        onPress={handleDeleteAccount}
        variant="outline"
        size="lg"
        loading={deleting}
        disabled={deleting}
        style={{
          marginTop: 12,
          borderColor: colors.destructive ?? "#B33A3A",
        }}
        textStyle={{ color: colors.destructive ?? "#B33A3A" }}
        testID="delete-account-button"
      />
      <Typography
        variant="caption"
        muted
        center
        style={{ marginTop: 8, marginBottom: 8 }}
      >
        Deleting your account permanently removes your profile and all
        learning data from Murciélingo.
      </Typography>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    justifyContent: "flex-end",
  },
  adminBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  levelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  langRow: {
    flexDirection: "row",
    gap: 10,
  },
  langCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
