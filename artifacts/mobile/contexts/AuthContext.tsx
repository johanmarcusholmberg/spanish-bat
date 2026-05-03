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

export interface PasswordLoginResult {
  error: string | null;
  needsSecondFactor: boolean;
  needsTotp?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  // Phase C: true once an admin has completed TOTP enrolment.
  // Non-admins always read true so callers don't need to branch.
  adminTotpEnrolled: boolean;
  user: UserProfile | null;
  userId: string | null;
  loading: boolean;
  // Phase B: password sign-in (primary)
  loginWithPassword: (email: string, password: string) => Promise<PasswordLoginResult>;
  verifySecondFactorCode: (code: string) => Promise<string | null>;
  verifyTotpSecondFactor: (code: string) => Promise<string | null>;
  verifyBackupCodeSecondFactor: (code: string) => Promise<string | null>;
  // Phase A: email-code sign-in (fallback)
  sendLoginCode: (email: string) => Promise<string | null>;
  verifyLoginCode: (code: string) => Promise<string | null>;
  sendRegisterCode: (email: string, displayName: string, password?: string) => Promise<string | null>;
  verifyRegisterCode: (code: string) => Promise<string | null>;
  resendLoginCode: () => Promise<string | null>;
  resendRegisterCode: () => Promise<string | null>;
  // Forgot password
  sendResetPasswordCode: (email: string) => Promise<string | null>;
  verifyResetPasswordCode: (code: string, newPassword: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  adminTotpEnrolled: true,
  user: null,
  userId: null,
  loading: true,
  loginWithPassword: async () => ({ error: null, needsSecondFactor: false }),
  verifySecondFactorCode: async () => null,
  verifyTotpSecondFactor: async () => null,
  verifyBackupCodeSecondFactor: async () => null,
  sendLoginCode: async () => null,
  verifyLoginCode: async () => null,
  sendRegisterCode: async () => null,
  verifyRegisterCode: async () => null,
  resendLoginCode: async () => null,
  resendRegisterCode: async () => null,
  sendResetPasswordCode: async () => null,
  verifyResetPasswordCode: async () => null,
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
  const [adminTotpEnrolled, setAdminTotpEnrolled] = useState(true);
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
      setAdminTotpEnrolled(true);
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

      const result = await api.profile.get().catch(() => ({ profile: null, isAdmin: false, adminTotpEnrolled: true }));

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
      setAdminTotpEnrolled(result.isAdmin ? !!(result as { adminTotpEnrolled?: boolean }).adminTotpEnrolled : true);
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

  // ─── Password sign-in (primary) ──────────────────────────────────────────
  // signIn.create({ strategy: "password", identifier, password }) signs the
  // user in directly when MFA is off. If the Clerk instance demands a second
  // factor (status === "needs_second_factor") we automatically dispatch the
  // email-code 2FA so the UI can prompt for it via verifySecondFactorCode().

  async function loginWithPassword(
    email: string,
    password: string,
  ): Promise<PasswordLoginResult> {
    if (!signIn || !setActiveSignIn) return { error: "Sign-in not available", needsSecondFactor: false };
    try {
      const trimmed = email.trim();
      if (!trimmed) return { error: "Please enter your email address.", needsSecondFactor: false };
      if (!password) return { error: "Please enter your password.", needsSecondFactor: false };
      const attempt = await signIn.create({
        identifier: trimmed,
        password,
        strategy: "password",
      });
      if (attempt.status === "complete") {
        await setActiveSignIn({ session: attempt.createdSessionId });
        return { error: null, needsSecondFactor: false };
      }
      if (attempt.status === "needs_second_factor") {
        const factors = attempt.supportedSecondFactors ?? [];
        const supportsTotp = factors.some((f: { strategy: string }) => f.strategy === "totp");
        if (supportsTotp) {
          // Admin path — user pulls the code from their authenticator app,
          // no email is sent. UI prompts via verifyTotpSecondFactor().
          return { error: null, needsSecondFactor: true, needsTotp: true };
        }
        const emailFactor = factors.find(
          (f: { strategy: string }) => f.strategy === "email_code",
        ) as { emailAddressId?: string } | undefined;
        try {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            ...(emailFactor?.emailAddressId ? { emailAddressId: emailFactor.emailAddressId } : {}),
          } as Parameters<typeof signIn.prepareSecondFactor>[0]);
        } catch (err) {
          return {
            error: clerkErrorMessage(err, "Could not send verification code"),
            needsSecondFactor: true,
          };
        }
        return { error: null, needsSecondFactor: true };
      }
      return { error: "Sign-in could not be completed.", needsSecondFactor: false };
    } catch (err) {
      return { error: clerkErrorMessage(err, "Sign-in failed"), needsSecondFactor: false };
    }
  }

  async function verifySecondFactorCode(code: string): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: trimmed,
      });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        api.audit.signIn("password+email-mfa").catch(() => {});
        return null;
      }
      return "Could not complete sign-in. Please request a new code.";
    } catch (err) {
      return clerkErrorMessage(err, "Invalid or expired code");
    }
  }

  async function verifyTotpSecondFactor(code: string): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Enter the 6-digit code from your authenticator app.";
      const result = await signIn.attemptSecondFactor({ strategy: "totp", code: trimmed });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        api.audit.signIn("password+totp").catch(() => {});
        return null;
      }
      return "Could not complete sign-in. Please try again.";
    } catch (err) {
      return clerkErrorMessage(err, "Invalid or expired code");
    }
  }

  async function verifyBackupCodeSecondFactor(code: string): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Enter one of your backup codes.";
      const result = await signIn.attemptSecondFactor({ strategy: "backup_code", code: trimmed });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        api.audit.signIn("password+backup-code").catch(() => {});
        return null;
      }
      return "Could not complete sign-in. Please try again.";
    } catch (err) {
      return clerkErrorMessage(err, "Invalid backup code");
    }
  }

  // ─── Forgot / reset password ─────────────────────────────────────────────
  // signIn.create({ strategy: "reset_password_email_code", identifier }) both
  // sets up the SignIn resource and dispatches the reset email. The verify
  // step submits both the code and the replacement password and finalises
  // the session in one shot.

  async function sendResetPasswordCode(email: string): Promise<string | null> {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = email.trim();
      if (!trimmed) return "Please enter your email address.";
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: trimmed,
      });
      return null;
    } catch (err) {
      return clerkErrorMessage(err, "Could not send reset code");
    }
  }

  async function verifyResetPasswordCode(
    code: string,
    newPassword: string,
  ): Promise<string | null> {
    if (!signIn || !setActiveSignIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      if (!newPassword || newPassword.length < 8) {
        return "Choose a password with at least 8 characters.";
      }
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: trimmed,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        return null;
      }
      return "Password reset, but sign-in could not be completed. Please sign in again.";
    } catch (err) {
      return clerkErrorMessage(err, "Could not reset password");
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
      const emailAddressId = emailFactor?.emailAddressId;
      if (!emailAddressId) {
        return "We couldn't find an email-code option for that address. Please double-check and try again.";
      }
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

  async function sendRegisterCode(
    email: string,
    displayName: string,
    password?: string,
  ): Promise<string | null> {
    if (!signUp) return "Sign-up not available";
    try {
      const trimmedEmail = email.trim();
      const trimmedName = displayName.trim();
      const trimmedPassword = (password ?? "").trim();
      if (!trimmedEmail) return "Please enter your email address.";
      // Password is optional in the UI — if filled we register the user
      // with a real credential; if blank we fall through to the Phase A
      // email-code-only path and Clerk treats the account as passwordless.
      const params: Record<string, unknown> = { emailAddress: trimmedEmail };
      if (trimmedName) params.firstName = trimmedName;
      if (trimmedPassword) params.password = trimmedPassword;
      await signUp.create(params as Parameters<typeof signUp.create>[0]);
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
    if (!loginEmailFactorId) return "Please enter your email and try again.";
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
        adminTotpEnrolled,
        user: profile,
        userId: clerkUser?.id ?? null,
        loading,
        loginWithPassword,
        verifySecondFactorCode,
        verifyTotpSecondFactor,
        verifyBackupCodeSecondFactor,
        sendLoginCode,
        verifyLoginCode,
        sendRegisterCode,
        verifyRegisterCode,
        resendLoginCode,
        resendRegisterCode,
        sendResetPasswordCode,
        verifyResetPasswordCode,
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
