import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Redirect, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tab layout — Phase 22 "session-first" navigation:
 *   Today / Practice / Library / Progress / Profile
 *
 * The vocabulary, grammar, and reading routes are kept (so deep links
 * still work) but hidden from the bar — they live inside Library now.
 */

function useTabLabels() {
  const { user } = useAuth();
  const lang: "en" | "sv" = user?.learningFrom === "sv" ? "sv" : "en";
  return lang === "sv"
    ? {
        today: "Idag",
        practice: "Öva",
        library: "Bibliotek",
        progress: "Framsteg",
        profile: "Profil",
      }
    : {
        today: "Today",
        practice: "Practice",
        library: "Library",
        progress: "Progress",
        profile: "Profile",
      };
}

function NativeTabLayout() {
  const labels = useTabLabels();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} />
        <Label>{labels.today}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="exercises">
        <Icon sf={{ default: "dumbbell", selected: "dumbbell.fill" }} />
        <Label>{labels.practice}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} />
        <Label>{labels.library}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <Icon sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }} />
        <Label>{labels.progress}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>{labels.profile}</Label>
      </NativeTabs.Trigger>
      {/*
        Legacy routes — kept registered so Library cards and deep links
        can still navigate to them, but hidden from the bar via
        `hidden`. Without this, the iOS NativeTabs path would not
        surface the route file and `router.push("/(tabs)/grammar")`
        could behave inconsistently across platforms.
      */}
      <NativeTabs.Trigger name="vocabulary" hidden>
        <Label>vocabulary</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grammar" hidden>
        <Label>grammar</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reading" hidden>
        <Label>reading</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const labels = useTabLabels();

  const tabIcon = (
    color: string,
    iosName: string,
    androidName: keyof typeof Feather.glyphMap,
  ) =>
    isIOS ? (
      <SymbolView name={iosName as never} tintColor={color} size={24} />
    ) : (
      <Feather name={androidName} size={22} color={color} />
    );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: labels.today,
          tabBarIcon: ({ color }) => tabIcon(color, "sparkles", "zap"),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: labels.practice,
          tabBarIcon: ({ color }) => tabIcon(color, "dumbbell", "activity"),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: labels.library,
          tabBarIcon: ({ color }) => tabIcon(color, "books.vertical", "book"),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: labels.progress,
          tabBarIcon: ({ color }) => tabIcon(color, "chart.line.uptrend.xyaxis", "trending-up"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: labels.profile,
          tabBarIcon: ({ color }) => tabIcon(color, "person", "user"),
        }}
      />
      {/* Hidden routes — still reachable via deep links / Library cards */}
      <Tabs.Screen name="vocabulary" options={{ href: null }} />
      <Tabs.Screen name="grammar" options={{ href: null }} />
      <Tabs.Screen name="reading" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useClerkAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#D9CFBC" }}>
        <ActivityIndicator size="large" color="#F4926B" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
