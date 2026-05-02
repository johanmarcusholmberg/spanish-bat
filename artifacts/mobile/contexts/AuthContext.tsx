import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSignIn, useSession, useUser, useClerk } from "@clerk/clerk-expo";
import { setAuthTokenGetter, api } from "@/lib/api";

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
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { session, isLoaded: sessionLoaded } = useSession();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const isLoaded = signInLoaded && sessionLoaded && userLoaded;

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
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
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
    if (!signIn || !setActive) return "Sign-in not available";
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        return null;
      }
      return "Login failed. Please check your credentials.";
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkErr = err as { errors: { longMessage?: string; message?: string }[] };
        return clerkErr.errors?.[0]?.longMessage ?? clerkErr.errors?.[0]?.message ?? "Login failed";
      }
      return err instanceof Error ? err.message : "Login failed";
    }
  }

  async function logout(): Promise<void> {
    await signOut();
    setProfile(null);
    setIsAdmin(false);
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
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, user: profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
