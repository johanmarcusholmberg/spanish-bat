import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

import { useColors } from "@/hooks/useColors";

/**
 * Auth guard for stack routes that live outside the (tabs) auth gate.
 * - While Clerk is loading: render a centered spinner.
 * - If signed out: redirect to /login.
 * - If signed in: render children.
 *
 * Use at the top of every protected stack screen
 * (flashcards, stats, lesson/[id], passage/[id], word/[id]).
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const colors = useColors();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
