import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser, useClerk, useSignIn, useSignUp } from "@clerk/react";
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
  updatePassword: (password: string) => Promise<string | null>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  updatePassword: async () => null,
  updateProfile: async () => {},
  signInWithGoogle: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();
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

      // Try to fetch profile from DB
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
        // Create a new profile
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
        // Persist the new profile
        await api.profile.upsert({
          displayName: defaultName,
          email,
          level: "A1",
          learningFrom: "sv",
          onboardingCompleted: false,
          placementTestCompleted: false,
        }).catch(() => {});
      }
      setIsAdmin(!!result.isAdmin);
    } catch (err) {
      // fail silently — show defaults
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
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") return null;
      return "Login failed";
    } catch (err: any) {
      return err?.errors?.[0]?.longMessage || err?.message || "Login failed";
    }
  };

  const register = async (email: string, password: string): Promise<string | null> => {
    if (!signUp) return "Sign-up not available";
    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete" || result.status === "missing_requirements") return null;
      return "Registration failed";
    } catch (err: any) {
      return err?.errors?.[0]?.longMessage || err?.message || "Registration failed";
    }
  };

  const logout = async () => {
    await signOut();
    setProfile(null);
    setProfileLang?.(null);
  };

  const resetPassword = async (_email: string): Promise<string | null> => {
    // Clerk handles password reset via its built-in flow
    openSignIn();
    return null;
  };

  const updatePassword = async (_password: string): Promise<string | null> => {
    try {
      await clerkUser?.updatePassword({ newPassword: _password });
      return null;
    } catch (err: any) {
      return err?.errors?.[0]?.longMessage || err?.message || "Update failed";
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!clerkUser) return;
    const newProfile = profile ? { ...profile, ...updates } : null;
    if (newProfile) setProfile(newProfile);
    setProfileLang?.(updates.learningFrom || profile?.learningFrom || null);

    // Persist to DB
    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.displayName = updates.displayName;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.learningFrom !== undefined) dbUpdates.learningFrom = updates.learningFrom;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboardingCompleted = updates.onboardingCompleted;
    if (updates.placementTestCompleted !== undefined) dbUpdates.placementTestCompleted = updates.placementTestCompleted;

    await api.profile.upsert(dbUpdates).catch(() => {});
  };

  const signInWithGoogle = async () => {
    if (!signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin + "/sso-callback",
        redirectUrlComplete: window.location.origin + "/dashboard",
      });
    } catch (err) {
      console.error("Google sign-in error", err);
    }
  };

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
        updatePassword,
        updateProfile,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
