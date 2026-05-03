import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { clerkTokenCache } from "@/lib/storage";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function RootLayoutNav() {
  const { isLoaded } = useClerkAuth();
  // Wait for the persisted app language to hydrate from AsyncStorage before
  // mounting any language-dependent screens. Without this, screens would
  // briefly render in FALLBACK_APP_LANGUAGE and then re-render once the
  // stored preference resolved a tick later (visible flicker on cold start).
  const { ready: languageReady } = useLanguage();

  if (!isLoaded || !languageReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#D9CFBC",
        }}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
      >
        <ActivityIndicator size="large" color="#F4926B" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="verify-2fa" options={{ headerShown: false }} />
        <Stack.Screen name="admin-setup-2fa" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
        <Stack.Screen name="flashcards" options={{ headerShown: true }} />
        <Stack.Screen name="stats" options={{ headerShown: true }} />
        <Stack.Screen name="lesson/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="passage/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="word/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="paywall" options={{ headerShown: true, presentation: "modal" }} />
        <Stack.Screen name="level-check" options={{ headerShown: true, title: "Level check" }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="learn/echo" options={{ headerShown: true, title: "Echo" }} />
      </Stack>
      <OfflineBanner />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={clerkTokenCache}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <LanguageProvider>
                  <AuthProvider>
                    <RootLayoutNav />
                  </AuthProvider>
                </LanguageProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
