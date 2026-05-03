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

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
  session: SessionLike | null;
  loading: boolean;
  sendLoginCode: (email: string) => Promise<string | null>;
  resendLoginCode: () => Promise<string | null>;
  verifyLoginCode: (code: string) => Promise<string | null>;
  sendRegisterCode: (email: string, displayName: string) => Promise<string | null>;
  resendRegisterCode: () => Promise<string | null>;
  verifyRegisterCode: (code: string) => Promise<string | null>;
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
  sendLoginCode: async () => null,
  resendLoginCode: async () => null,
  verifyLoginCode: async () => null,
  sendRegisterCode: async () => null,
  resendRegisterCode: async () => null,
  verifyRegisterCode: async () => null,
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

  // ─── Email-code login ─────────────────────────────────────────────────────
  // The Clerk instance is configured passwordless: the only first factor is
  // `email_code`. signIn.emailCode.sendCode dispatches a 6-digit code to the
  // address; verifyCode redeems it and signIn.finalize() activates the
  // session. Both calls return `{ error }` on a recoverable failure (bad
  // email, expired code, etc.) and throw on transport errors — handle both.

  const sendLoginCode = async (email: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const trimmed = email.trim();
      if (!trimmed) return "Please enter your email address.";
      const { error } = await signIn.emailCode.sendCode({ emailAddress: trimmed });
      if (error) return resultErr(error, "Could not send code");
      return null;
    } catch (err) {
      return clerkErr(err, "Could not send code");
    }
  };

  const resendLoginCode = async (): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      // The signIn resource is already initialised from the previous
      // sendCode call — re-invoking sendCode just dispatches a fresh code
      // for the same identifier.
      const { error } = await signIn.emailCode.sendCode({});
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

  // ─── Email-code registration ──────────────────────────────────────────────

  const sendRegisterCode = async (email: string, displayName: string): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    try {
      const trimmedEmail = email.trim();
      const trimmedName = displayName.trim();
      if (!trimmedEmail) return "Please enter your email address.";
      const createParams: Record<string, unknown> = { emailAddress: trimmedEmail };
      if (trimmedName) createParams.firstName = trimmedName;
      const { error } = await signUp.create(createParams as Parameters<typeof signUp.create>[0]);
      if (error) return resultErr(error, "Registration failed");
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) return resultErr(sendError, "Could not send code");
      return null;
    } catch (err) {
      return clerkErr(err, "Registration failed");
    }
  };

  const resendRegisterCode = async (): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    try {
      // Don't re-call signUp.create — Clerk rejects creating a second
      // sign-up while one is already in progress. Just dispatch a new
      // verification email for the existing in-progress sign-up.
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
        sendLoginCode,
        resendLoginCode,
        verifyLoginCode,
        sendRegisterCode,
        resendRegisterCode,
        verifyRegisterCode,
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
