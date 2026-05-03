import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser, useClerk, useSignIn, useSignUp } from "@clerk/react";
type OAuthStrategy = `oauth_${string}`;
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface UserProfile {
  displayName: string;
  email: string;
  level: Level;
  learningFrom: "sv" | "en";
  onboardingCompleted: boolean;
  placementTestCompleted: boolean;
}

interface SessionLike {
  user: { id: string };
  access_token: string;
}

interface ClerkError {
  longMessage?: string;
  message?: string;
  code?: string;
}

export interface PasswordLoginResult {
  error: string | null;
  needsSecondFactor: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
  session: SessionLike | null;
  loading: boolean;
  // Phase B: password sign-in (primary)
  loginWithPassword: (email: string, password: string) => Promise<PasswordLoginResult>;
  verifySecondFactorCode: (code: string) => Promise<string | null>;
  // Phase A: email-code sign-in (fallback)
  sendLoginCode: (email: string) => Promise<string | null>;
  resendLoginCode: () => Promise<string | null>;
  verifyLoginCode: (code: string) => Promise<string | null>;
  // Registration: optional password — empty falls back to email-code only
  sendRegisterCode: (email: string, displayName: string, password?: string) => Promise<string | null>;
  resendRegisterCode: () => Promise<string | null>;
  verifyRegisterCode: (code: string) => Promise<string | null>;
  // Forgot password
  sendResetPasswordCode: (email: string) => Promise<string | null>;
  verifyResetPasswordCode: (code: string, newPassword: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  session: null,
  loading: true,
  loginWithPassword: async () => ({ error: null, needsSecondFactor: false }),
  verifySecondFactorCode: async () => null,
  sendLoginCode: async () => null,
  resendLoginCode: async () => null,
  verifyLoginCode: async () => null,
  sendRegisterCode: async () => null,
  resendRegisterCode: async () => null,
  verifyRegisterCode: async () => null,
  sendResetPasswordCode: async () => null,
  verifyResetPasswordCode: async () => null,
  logout: async () => {},
  updateProfile: async () => {},
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
});

function clerkErr(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "errors" in err) {
    const e = err as { errors: ClerkError[] };
    return e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

function resultErr(error: unknown, fallback: string): string {
  const e = error as ClerkError | undefined;
  return e?.longMessage ?? e?.message ?? fallback;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  // Track which passwordless flows have been initialised so resend
  // calls can re-dispatch on the existing in-progress resource and so
  // we can fall back to a fresh send if the page was reloaded.
  const [pendingLoginEmail, setPendingLoginEmail] = useState<string | null>(null);
  const [pendingRegisterEmail, setPendingRegisterEmail] = useState<string | null>(null);
  const { setProfileLang } = useLanguage();

  const session: SessionLike | null = clerkUser
    ? { user: { id: clerkUser.id }, access_token: "clerk" }
    : null;

  const fetchAndSetProfile = async () => {
    if (!clerkUser) return;
    setProfileLoading(true);
    try {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const defaultName = clerkUser.firstName || email.split("@")[0] || "";

      const result = await api.profile.get().catch(() => ({ profile: null, isAdmin: false }));

      if (result.profile) {
        setProfile({
          displayName: result.profile.displayName || defaultName,
          email: result.profile.email || email,
          level: (result.profile.level as Level) || "A1",
          learningFrom: (result.profile.learningFrom as "sv" | "en") || "sv",
          onboardingCompleted: !!result.profile.onboardingCompleted,
          placementTestCompleted: !!result.profile.placementTestCompleted,
        });
        setProfileLang?.(result.profile.learningFrom || "sv");
      } else {
        const newProfile = {
          displayName: defaultName,
          email,
          level: "A1" as Level,
          learningFrom: "sv" as const,
          onboardingCompleted: false,
          placementTestCompleted: false,
        };
        setProfile(newProfile);
        setProfileLang?.("sv");
        await api.profile
          .upsert({
            displayName: defaultName,
            email,
            level: "A1",
            learningFrom: "sv",
            onboardingCompleted: false,
            placementTestCompleted: false,
          })
          .catch(() => {});
      }
      setIsAdmin(!!result.isAdmin);
    } catch {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      setProfile({
        displayName: clerkUser.firstName || email.split("@")[0] || "",
        email,
        level: "A1",
        learningFrom: "sv",
        onboardingCompleted: false,
        placementTestCompleted: false,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (clerkUser) {
      fetchAndSetProfile();
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, clerkUser?.id]);

  // ─── Password sign-in (primary) ───────────────────────────────────────────
  // signIn.password() signs the user in directly when MFA is off. If the
  // Clerk instance later gets MFA enforced, the SignIn resource transitions
  // to `needs_second_factor`; we automatically dispatch an email-code 2FA
  // and let the UI prompt for it via verifySecondFactorCode().

  const loginWithPassword = async (
    email: string,
    password: string,
  ): Promise<PasswordLoginResult> => {
    if (!signIn) return { error: "Sign-in not available", needsSecondFactor: false };
    try {
      const trimmed = email.trim();
      if (!trimmed) return { error: "Please enter your email address.", needsSecondFactor: false };
      if (!password) return { error: "Please enter your password.", needsSecondFactor: false };
      const { error } = await signIn.password({ emailAddress: trimmed, password });
      if (error) return { error: resultErr(error, "Sign-in failed"), needsSecondFactor: false };
      if (signIn.status === "complete") {
        await signIn.finalize();
        return { error: null, needsSecondFactor: false };
      }
      if (signIn.status === "needs_second_factor") {
        // Pre-dispatch the email-code 2FA so the user can enter it next.
        const { error: mfaErr } = await signIn.mfa.sendEmailCode();
        if (mfaErr) {
          return {
            error: resultErr(mfaErr, "Could not send verification code"),
            needsSecondFactor: true,
          };
        }
        setPendingLoginEmail(trimmed);
        return { error: null, needsSecondFactor: true };
      }
      return { error: "Sign-in could not be completed.", needsSecondFactor: false };
    } catch (err) {
      return { error: clerkErr(err, "Sign-in failed"), needsSecondFactor: false };
    }
  };

  const verifySecondFactorCode = async (code: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      const { error } = await signIn.mfa.verifyEmailCode({ code: trimmed });
      if (error) return resultErr(error, "Invalid or expired code");
      if (signIn.status === "complete") {
        await signIn.finalize();
        return null;
      }
      return "Could not complete sign-in. Please try again.";
    } catch (err) {
      return clerkErr(err, "Invalid or expired code");
    }
  };

  // ─── Email-code login ─────────────────────────────────────────────────────
  // signIn.emailCode.sendCode dispatches a 6-digit code; verifyCode redeems
  // it and signIn.finalize() activates the session. Used as a fallback when
  // the user clicks "Sign in with a code instead".

  const sendLoginCode = async (email: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = email.trim();
      if (!trimmed) return "Please enter your email address.";
      const { error } = await signIn.emailCode.sendCode({ emailAddress: trimmed });
      if (error) return resultErr(error, "Could not send code");
      setPendingLoginEmail(trimmed);
      return null;
    } catch (err) {
      return clerkErr(err, "Could not send code");
    }
  };

  const resendLoginCode = async (): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    if (!pendingLoginEmail) return "Please enter your email and try again.";
    try {
      const { error } = await signIn.emailCode.sendCode({ emailAddress: pendingLoginEmail });
      if (error) return resultErr(error, "Could not resend code");
      return null;
    } catch (err) {
      return clerkErr(err, "Could not resend code");
    }
  };

  const verifyLoginCode = async (code: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      const { error } = await signIn.emailCode.verifyCode({ code: trimmed });
      if (error) return resultErr(error, "Invalid or expired code");
      if (signIn.status === "complete") {
        await signIn.finalize();
        return null;
      }
      return signIn.status === "needs_second_factor"
        ? "Two-factor authentication is required for this account."
        : "Could not complete sign-in. Please request a new code.";
    } catch (err) {
      return clerkErr(err, "Invalid or expired code");
    }
  };

  // ─── Registration ─────────────────────────────────────────────────────────
  // If the caller passes a password, use the password-aware signUp path so
  // the user gets a real password on file. Otherwise fall back to the Phase
  // A email-code-only registration. Both branches end with email-code
  // verification because the Clerk instance requires verified email.

  const sendRegisterCode = async (
    email: string,
    displayName: string,
    password?: string,
  ): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    try {
      const trimmedEmail = email.trim();
      const trimmedName = displayName.trim();
      const trimmedPassword = (password ?? "").trim();
      if (!trimmedEmail) return "Please enter your email address.";

      if (trimmedPassword) {
        // Password-aware registration. signUp.password() creates the
        // sign-up with the supplied credentials in one call.
        const passwordParams = {
          emailAddress: trimmedEmail,
          password: trimmedPassword,
          ...(trimmedName ? { firstName: trimmedName } : {}),
        };
        const { error } = await signUp.password(passwordParams);
        if (error) return resultErr(error, "Registration failed");
      } else {
        const createParams = {
          emailAddress: trimmedEmail,
          ...(trimmedName ? { firstName: trimmedName } : {}),
        };
        const { error } = await signUp.create(createParams);
        if (error) return resultErr(error, "Registration failed");
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) return resultErr(sendError, "Could not send code");
      setPendingRegisterEmail(trimmedEmail);
      return null;
    } catch (err) {
      return clerkErr(err, "Registration failed");
    }
  };

  const resendRegisterCode = async (): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    if (!pendingRegisterEmail) return "Please enter your details and try again.";
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) return resultErr(error, "Could not resend code");
      return null;
    } catch (err) {
      return clerkErr(err, "Could not resend code");
    }
  };

  const verifyRegisterCode = async (code: string): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    try {
      const trimmed = code.trim();
      if (!trimmed) return "Please enter the code from your email.";
      const { error } = await signUp.verifications.verifyEmailCode({ code: trimmed });
      if (error) return resultErr(error, "Invalid or expired code");
      if (signUp.status === "complete") {
        await signUp.finalize();
        return null;
      }
      return "Could not complete sign-up. Please request a new code.";
    } catch (err) {
      return clerkErr(err, "Invalid or expired code");
    }
  };

  // ─── Forgot / reset password ──────────────────────────────────────────────
  // Step 1 sets the identifier on the SignIn resource. Step 2 dispatches the
  // reset email. Step 3 (verify + new password) is handled in a second call
  // that submits both code and the replacement password via the future API
  // namespace `signIn.resetPasswordEmailCode`.

  const sendResetPasswordCode = async (email: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = email.trim();
      if (!trimmed) return "Please enter your email address.";
      const { error: createError } = await signIn.create({ identifier: trimmed });
      if (createError) return resultErr(createError, "Could not start password reset");
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) return resultErr(error, "Could not send reset code");
      setPendingLoginEmail(trimmed);
      return null;
    } catch (err) {
      return clerkErr(err, "Could not send reset code");
    }
  };

  const verifyResetPasswordCode = async (
    code: string,
    newPassword: string,
  ): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmedCode = code.trim();
      if (!trimmedCode) return "Please enter the code from your email.";
      if (!newPassword || newPassword.length < 8) {
        return "Choose a password with at least 8 characters.";
      }
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code: trimmedCode,
      });
      if (verifyError) return resultErr(verifyError, "Invalid or expired code");
      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      if (submitError) return resultErr(submitError, "Could not set new password");
      if (signIn.status === "complete") {
        await signIn.finalize();
        return null;
      }
      return "Password reset, but sign-in could not be completed. Please sign in again.";
    } catch (err) {
      return clerkErr(err, "Could not reset password");
    }
  };

  const logout = async () => {
    await signOut();
    setProfile(null);
    setProfileLang?.(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!clerkUser) return;
    const newProfile = profile ? { ...profile, ...updates } : null;
    if (newProfile) setProfile(newProfile);
    setProfileLang?.(updates.learningFrom || profile?.learningFrom || null);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.displayName = updates.displayName;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.learningFrom !== undefined) dbUpdates.learningFrom = updates.learningFrom;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboardingCompleted = updates.onboardingCompleted;
    if (updates.placementTestCompleted !== undefined) dbUpdates.placementTestCompleted = updates.placementTestCompleted;

    await api.profile.upsert(dbUpdates);
  };

  const signInWithOAuth = async (strategy: OAuthStrategy) => {
    if (!signIn) return;
    try {
      await signIn.sso({
        strategy: strategy as Parameters<typeof signIn.sso>[0]["strategy"],
        redirectUrl: window.location.origin + "/sso-callback",
        redirectCallbackUrl: window.location.origin + "/dashboard",
      });
    } catch (err) {
      console.error(`OAuth sign-in error (${strategy}):`, err);
    }
  };

  const signInWithGoogle = () => signInWithOAuth("oauth_google");
  const signInWithApple = () => signInWithOAuth("oauth_apple");

  const isLoggedIn = isLoaded && !!clerkUser && !!profile;
  const loading = !isLoaded || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        user: profile,
        session,
        loading,
        loginWithPassword,
        verifySecondFactorCode,
        sendLoginCode,
        resendLoginCode,
        verifyLoginCode,
        sendRegisterCode,
        resendRegisterCode,
        verifyRegisterCode,
        sendResetPasswordCode,
        verifyResetPasswordCode,
        logout,
        updateProfile,
        signInWithGoogle,
        signInWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
