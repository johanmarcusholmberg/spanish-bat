import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSignIn, useSignUp, useSession, useUser, useClerk, useSSO } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import { setAuthTokenGetter, api } from "@/lib/api";
import { clearAllUserData } from "@/lib/storage";
import { identifyUser as rcIdentify, initRevenueCat, logoutUser as rcLogout } from "@/lib/revenuecat";
import { getPreferredLanguage } from "@/lib/languagePreference";

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
  sendLoginCode: (email: string) => Promise<string | null>;
  verifyLoginCode: (code: string) => Promise<string | null>;
  sendRegisterCode: (email: string, displayName: string) => Promise<string | null>;
  verifyRegisterCode: (code: string) => Promise<string | null>;
  resendLoginCode: () => Promise<string | null>;
  resendRegisterCode: () => Promise<string | null>;
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
  sendLoginCode: async () => null,
  verifyLoginCode: async () => null,
  sendRegisterCode: async () => null,
  verifyRegisterCode: async () => null,
  resendLoginCode: async () => null,
  resendRegisterCode: async () => null,
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
  // Track which passwordless flows have been initialised so resend-code
  // can re-dispatch on the existing in-progress signIn / signUp resource
  // instead of re-creating it (Clerk rejects calling create twice).
  const [loginEmailFactorId, setLoginEmailFactorId] = useState<string | null>(null);
  const [registerCodeReady, setRegisterCodeReady] = useState(false);

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
      void rcIdentify(clerkUser.id);
    } else {
      setProfile(null);
      setIsAdmin(false);
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
        const preferred = await getPreferredLanguage();
        const newProfile: UserProfile = {
          displayName: defaultName,
          email,
          level: "A1",
          learningFrom: preferred,
          onboardingCompleted: false,
          placementTestCompleted: false,
        };
        setProfile(newProfile);
        await api.profile.upsert({
          displayName: defaultName,
          email,
          level: "A1",
          learningFrom: preferred,
          onboardingCompleted: false,
          placementTestCompleted: false,
        }).catch(() => {});
      }
      setIsAdmin(!!(result.isAdmin));
    } catch {
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
      const preferred = await getPreferredLanguage();
      setProfile({
        displayName: clerkUser?.firstName ?? email.split("@")[0] ?? "User",
        email,
        level: "A1",
        learningFrom: preferred,
        onboardingCompleted: false,
        placementTestCompleted: false,
      });
    } finally {
      setProfileLoading(false);
    }
  }

  // ─── Email-code login ────────────────────────────────────────────────────
  // The Clerk instance is configured passwordless: `email_code` is the only
  // first-factor strategy. We dispatch the code via signIn.create and redeem
  // it via attemptFirstFactor before activating the session.

  async function sendLoginCode(email: string): Promise<string | null> {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = email.trim();
      if (!trimmed) return "Please enter your email address.";
      const attempt = await signIn.create({ identifier: trimmed });
      // Pick the email_code factor from the supported list — the strategy
      // factor's `emailAddressId` is required by attemptFirstFactor on most
      // Clerk instances, even though our config exposes only one factor.
      const emailFactor = attempt.supportedFirstFactors?.find(
        (f: { strategy: string }) => f.strategy === "email_code",
      ) as { emailAddressId?: string } | undefined;
      const emailAddressId = emailFactor?.emailAddressId ?? "";
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId,
      });
      setLoginEmailFactorId(emailAddressId);
      return null;
    } catch (err) {
      return clerkErrorMessage(err, "Could not send code");
    }
  }

  async function verifyLoginCode(code: string): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      const result = await signIn.attemptFirstFactor({ strategy: "email_code", code: trimmed });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        return null;
      }
      return result.status === "needs_second_factor"
        ? "Two-factor authentication is required for this account."
        : "Could not complete sign-in. Please request a new code.";
    } catch (err) {
      return clerkErrorMessage(err, "Invalid or expired code");
    }
  }

  // ─── Email-code registration ─────────────────────────────────────────────

  async function sendRegisterCode(email: string, displayName: string): Promise<string | null> {
    if (!signUp) return "Sign-up not available";
    try {
      const trimmedEmail = email.trim();
      const trimmedName = displayName.trim();
      if (!trimmedEmail) return "Please enter your email address.";
      await signUp.create({
        emailAddress: trimmedEmail,
        ...(trimmedName ? { firstName: trimmedName } : {}),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setRegisterCodeReady(true);
      return null;
    } catch (err) {
      return clerkErrorMessage(err, "Registration failed");
    }
  }

  async function verifyRegisterCode(code: string): Promise<string | null> {
    if (!signUp || !setActiveSignUp) return "Sign-up not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      const result = await signUp.attemptEmailAddressVerification({ code: trimmed });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        return null;
      }
      return "Could not complete sign-up. Please request a new code.";
    } catch (err) {
      return clerkErrorMessage(err, "Invalid or expired code");
    }
  }

  async function resendLoginCode(): Promise<string | null> {
    if (!signIn) return "Sign-in not available";
    if (loginEmailFactorId === null) return "Please enter your email and try again.";
    try {
      // Re-dispatch the code on the existing in-progress signIn rather
      // than re-creating it (Clerk treats create as one-shot per flow).
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: loginEmailFactorId,
      });
      return null;
    } catch (err) {
      return clerkErrorMessage(err, "Could not resend code");
    }
  }

  async function resendRegisterCode(): Promise<string | null> {
    if (!signUp) return "Sign-up not available";
    if (!registerCodeReady) return "Please enter your details and try again.";
    try {
      // Don't call signUp.create again — Clerk rejects creating a second
      // signUp while one is already in progress. Just re-prepare the
      // email-address verification on the existing resource.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      return null;
    } catch (err) {
      return clerkErrorMessage(err, "Could not resend code");
    }
  }

  async function startOAuth(strategy: "oauth_google" | "oauth_apple"): Promise<string | null> {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "murcielago",
        path: "sso-callback",
      });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return null;
      }
      return null;
    } catch (err) {
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
      setLoginEmailFactorId(null);
      setRegisterCodeReady(false);
      await clearAllUserData();
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
        sendLoginCode,
        verifyLoginCode,
        sendRegisterCode,
        verifyRegisterCode,
        resendLoginCode,
        resendRegisterCode,
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
