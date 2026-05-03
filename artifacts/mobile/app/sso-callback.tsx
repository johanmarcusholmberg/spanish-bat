import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";

import { useColors } from "@/hooks/useColors";

/**
 * Landing route after Clerk OAuth (Google / Apple) redirects back to the app.
 *
 * On native, `expo-web-browser`'s `maybeCompleteAuthSession()` (called at
 * module load in AuthContext) usually closes the in-app browser before this
 * screen renders, so the user never actually sees it.
 *
 * On web (Expo dev preview, real web build) the OAuth provider performs a
 * full-page redirect back to `<origin>/sso-callback`, so this screen *is*
 * rendered. We just wait for Clerk to finish hydrating the session, then
 * push the user to `/` — the index route will route them to the tabs if
 * they're signed in, or back to /login if something went wrong.
 */
export default function SSOCallbackScreen() {
  const colors = useColors();
  const { isLoaded, isSignedIn } = useClerkAuth();

  useEffect(() => {
    if (!isLoaded) return;
    router.replace(isSignedIn ? "/" : "/login");
  }, [isLoaded, isSignedIn]);

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
