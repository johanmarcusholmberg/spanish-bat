import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

// Minimal session type for backward compatibility
interface SessionLike {
  user: { id: string };
  access_token: string;
}

interface ClerkError {
  longMessage?: string;
  message?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
  session: SessionLike | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  completeResetPassword: (code: string, password: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
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
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  resetPassword: async () => null,
  completeResetPassword: async () => null,
  updatePassword: async () => null,
  updateProfile: async () => {},
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { setProfileLang } = useLanguage();

  // Create a session-like object for backward compatibility
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
  }, [isLoaded, clerkUser?.id]);

  const login = async (email: string, password: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const { error } = await signIn.create({ identifier: email, password } as Parameters<typeof signIn.create>[0]);
      if (error) {
        return (error as ClerkError).longMessage ?? (error as ClerkError).message ?? "Login failed";
      }
      // v6: status is on the resource, finalize activates the session
      if (signIn.status === "complete") {
        await signIn.finalize();
        return null;
      }
      return "Login failed";
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkErr = err as { errors: ClerkError[] };
        return clerkErr.errors?.[0]?.longMessage ?? "Login failed";
      }
      return err instanceof Error ? err.message : "Login failed";
    }
  };

  const register = async (email: string, password: string): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    try {
      const { error } = await signUp.create({ emailAddress: email, password } as Parameters<typeof signUp.create>[0]);
      if (error) {
        return (error as ClerkError).longMessage ?? (error as ClerkError).message ?? "Registration failed";
      }
      // v6: finalize if complete, or let email verification proceed
      if (signUp.status === "complete") {
        await signUp.finalize();
        return null;
      }
      // missing_requirements = email verification needed — not an error
      if (signUp.status === "missing_requirements") return null;
      return "Registration failed";
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkErr = err as { errors: ClerkError[] };
        return clerkErr.errors?.[0]?.longMessage ?? "Registration failed";
      }
      return err instanceof Error ? err.message : "Registration failed";
    }
  };

  const logout = async () => {
    await signOut();
    setProfile(null);
    setProfileLang?.(null);
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const { error } = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      } as unknown as Parameters<typeof signIn.create>[0]);
      if (error) {
        return (error as ClerkError).longMessage ?? (error as ClerkError).message ?? "Reset failed";
      }
      return null;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkErr = err as { errors: ClerkError[] };
        return clerkErr.errors?.[0]?.longMessage ?? "Reset failed";
      }
      return err instanceof Error ? err.message : "Reset failed";
    }
  };

  const completeResetPassword = async (code: string, password: string): Promise<string | null> => {
    if (!signIn) return "Sign-in not available";
    try {
      const { error } = await (signIn as unknown as {
        attemptFirstFactor: (params: { strategy: string; code: string; password: string }) => Promise<{ error?: unknown }>;
      }).attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (error) {
        return (error as ClerkError).longMessage ?? (error as ClerkError).message ?? "Reset failed";
      }
      if (signIn.status === "complete") {
        await signIn.finalize();
      }
      return null;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkErr = err as { errors: ClerkError[] };
        return clerkErr.errors?.[0]?.longMessage ?? "Reset failed";
      }
      return err instanceof Error ? err.message : "Reset failed";
    }
  };

  const updatePassword = async (_password: string): Promise<string | null> => {
    if (!clerkUser) return "Not authenticated";
    try {
      await clerkUser.updatePassword({ newPassword: _password });
      return null;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkErr = err as { errors: ClerkError[] };
        return clerkErr.errors?.[0]?.longMessage ?? "Update failed";
      }
      return err instanceof Error ? err.message : "Update failed";
    }
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

    // Let errors propagate so callers can show user-visible feedback when
    // persistence fails. Callers that don't care can wrap in try/catch.
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
        login,
        register,
        logout,
        resetPassword,
        completeResetPassword,
        updatePassword,
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
