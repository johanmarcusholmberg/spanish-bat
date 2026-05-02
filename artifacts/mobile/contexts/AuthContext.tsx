import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSignIn, useSignUp, useSession, useUser, useClerk, useSSO } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { setAuthTokenGetter, api } from "@/lib/api";
import { clearAllUserData } from "@/lib/storage";
import { identifyUser as rcIdentify, initRevenueCat, logoutUser as rcLogout } from "@/lib/revenuecat";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface UserProfile {
  displayName: string;
  email: string;
  level: Level;
  learningFrom: "sv" | "en";
  onboardingCompleted: boolean;
  placementTestCompleted: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
  userId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, displayName: string) => Promise<string | null>;
  verifyEmail: (code: string) => Promise<string | null>;
  resendVerificationCode: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  completeResetPassword: (code: string, password: string, email?: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  userId: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  verifyEmail: async () => null,
  resendVerificationCode: async () => null,
  resetPassword: async () => null,
  completeResetPassword: async () => null,
  signInWithGoogle: async () => null,
  signInWithApple: async () => null,
  logout: async () => {},
  updateProfile: async () => {},
});

function clerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "errors" in err) {
    const clerkErr = err as { errors: { longMessage?: string; message?: string }[] };
    return clerkErr.errors?.[0]?.longMessage ?? clerkErr.errors?.[0]?.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const { startSSOFlow } = useSSO();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const isLoaded = signInLoaded && signUpLoaded && sessionLoaded && userLoaded;

  useEffect(() => {
    setAuthTokenGetter(async () => {
      if (!session) return null;
      try {
        return await session.getToken();
      } catch {
        return null;
      }
    });
  }, [session]);

  useEffect(() => {
    if (!isLoaded) return;
    if (session && clerkUser) {
      loadProfile();
      // Identify the RevenueCat customer with the Clerk userId BEFORE any
      // purchase / restore / offerings call can run. Critical: the
      // server-side RC webhook trusts `app_user_id` as the internal
      // userId, so it must always be the Clerk id (never anonymous).
      void rcIdentify(clerkUser.id);
    } else {
      setProfile(null);
      setIsAdmin(false);
      // Make sure RC is reachable for an anonymous paywall view (e.g.
      // pricing screen before signup) but do not carry over a previous
      // user's identity. logoutUser() is a no-op when uninitialised /
      // already anonymous.
      void initRevenueCat(null);
      void rcLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, session?.id, clerkUser?.id]);

  async function loadProfile() {
    if (!clerkUser) return;
    setProfileLoading(true);
    try {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
      const defaultName = clerkUser.firstName ?? email.split("@")[0] ?? "";

      const result = await api.profile.get().catch(() => ({ profile: null, isAdmin: false }));

      if (result.profile) {
        const p = result.profile as Record<string, unknown>;
        setProfile({
          displayName: (p.displayName as string) ?? defaultName,
          email: (p.email as string) ?? email,
          level: ((p.level as Level) ?? "A1"),
          learningFrom: ((p.learningFrom as "sv" | "en") ?? "sv"),
          onboardingCompleted: !!(p.onboardingCompleted),
          placementTestCompleted: !!(p.placementTestCompleted),
        });
      } else {
        const newProfile: UserProfile = {
          displayName: defaultName,
          email,
          level: "A1",
          learningFrom: "sv",
          onboardingCompleted: false,
          placementTestCompleted: false,
        };
        setProfile(newProfile);
        await api.profile.upsert({
          displayName: defaultName,
          email,
          level: "A1",
          learningFrom: "sv",
          onboardingCompleted: false,
          placementTestCompleted: false,
        }).catch(() => {});
      }
      setIsAdmin(!!(result.isAdmin));
    } catch {
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
      setProfile({
        displayName: clerkUser?.firstName ?? email.split("@")[0] ?? "User",
        email,
        level: "A1",
        learningFrom: "sv",
        onboardingCompleted: false,
        placementTestCompleted: false,
      });
    } finally {
      setProfileLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        return null;
      }
      return "Login failed. Please check your credentials.";
    } catch (err: unknown) {
      return clerkErrorMessage(err, "Login failed");
    }
  }

  async function register(email: string, password: string, displayName: string): Promise<string | null> {
    if (!signUp) return "Sign-up not available";
    try {
      const trimmedName = displayName.trim();
      await signUp.create({
        emailAddress: email,
        password,
        ...(trimmedName ? { firstName: trimmedName } : {}),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      return null;
    } catch (err: unknown) {
      return clerkErrorMessage(err, "Registration failed");
    }
  }

  async function verifyEmail(code: string): Promise<string | null> {
    if (!signUp || !setActiveSignUp) return "Sign-up not available";
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        return null;
      }
      return "Verification incomplete. Please try again.";
    } catch (err: unknown) {
      return clerkErrorMessage(err, "Verification failed");
    }
  }

  async function resendVerificationCode(): Promise<string | null> {
    if (!signUp) return "Sign-up not available";
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      return null;
    } catch (err: unknown) {
      return clerkErrorMessage(err, "Could not resend code");
    }
  }

  async function resetPassword(email: string): Promise<string | null> {
    if (!signIn) return "Sign-in not available";
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      return null;
    } catch (err: unknown) {
      return clerkErrorMessage(err, "Could not send reset email");
    }
  }

  async function completeResetPassword(code: string, password: string, email?: string): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";

    async function attempt(): Promise<string | null> {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete") {
        await setActiveSignIn!({ session: result.createdSessionId });
        return null;
      }
      if (result.status === "needs_new_password") {
        return "Please enter a new password.";
      }
      return "Reset incomplete. Please try again.";
    }

    try {
      return await attempt();
    } catch (err: unknown) {
      // If the sign-in resource lost its reset_password_email_code factor (e.g. after
      // app restart, or arriving directly on /reset-password), re-initiate the flow
      // with the email and try once more before surfacing the error.
      if (email) {
        try {
          await signIn.create({
            strategy: "reset_password_email_code",
            identifier: email,
          });
          return await attempt();
        } catch (retryErr: unknown) {
          return clerkErrorMessage(retryErr, "Password reset failed");
        }
      }
      return clerkErrorMessage(err, "Password reset failed");
    }
  }

  async function startOAuth(strategy: "oauth_google" | "oauth_apple"): Promise<string | null> {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return null;
      }
      return null;
    } catch (err: unknown) {
      return clerkErrorMessage(err, "Sign-in cancelled");
    }
  }

  async function signInWithGoogle(): Promise<string | null> {
    return startOAuth("oauth_google");
  }

  async function signInWithApple(): Promise<string | null> {
    if (Platform.OS === "android") return "Apple Sign-In is not available on Android";
    return startOAuth("oauth_apple");
  }

  async function logout(): Promise<void> {
    try {
      await signOut();
    } finally {
      setProfile(null);
      setIsAdmin(false);
      // Wipe per-user persistence so a second user on the same device cannot
      // see the previous user's recents, dashboard cache, or exercise drafts.
      // Runs even if signOut() throws (network error, token expired, etc.).
      await clearAllUserData();
      // Drop the RevenueCat identity too — without this a second user on
      // the same device would inherit the first user's RC customer and
      // any active entitlements/purchases would be cross-attributed.
      await rcLogout();
    }
  }

  async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!clerkUser) return;
    const merged = profile ? { ...profile, ...updates } : null;
    if (merged) setProfile(merged);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.displayName = updates.displayName;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.learningFrom !== undefined) dbUpdates.learningFrom = updates.learningFrom;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboardingCompleted = updates.onboardingCompleted;
    if (updates.placementTestCompleted !== undefined) dbUpdates.placementTestCompleted = updates.placementTestCompleted;

    await api.profile.upsert(dbUpdates).catch(() => {});
  }

  const isLoggedIn = isLoaded && !!session && !!profile;
  const loading = !isLoaded || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        user: profile,
        userId: clerkUser?.id ?? null,
        loading,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        resetPassword,
        completeResetPassword,
        signInWithGoogle,
        signInWithApple,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

WebBrowser.maybeCompleteAuthSession();
