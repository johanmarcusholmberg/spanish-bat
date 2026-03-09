import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface UserProfile {
  displayName: string;
  email: string;
  level: Level;
  learningFrom: "sv" | "en";
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    if (data) {
      setUser({
        displayName: data.display_name || authUser.email?.split("@")[0] || "",
        email: authUser.email || "",
        level: (data.level as Level) || "A1",
        learningFrom: (data.learning_from as "sv" | "en") || "sv",
      });
    } else {
      setUser({
        displayName: authUser.email?.split("@")[0] || "",
        email: authUser.email || "",
        level: "A1",
        learningFrom: "sv",
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(() => fetchProfile(session.user), 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const register = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? error.message : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? error.message : null;
  };

  const updatePassword = async (password: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password });
    return error ? error.message : null;
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!session?.user) return;

    const updates: Record<string, string> = {};
    if (profile.displayName !== undefined) updates.display_name = profile.displayName;
    if (profile.level !== undefined) updates.level = profile.level;
    if (profile.learningFrom !== undefined) updates.learning_from = profile.learningFrom;

    await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", session.user.id);

    setUser((prev) => prev ? { ...prev, ...profile } : prev);
  };

  const signInWithGoogle = async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  const isLoggedIn = !!session && !!user;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
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
