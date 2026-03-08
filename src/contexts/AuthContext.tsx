import React, { createContext, useContext, useState, ReactNode } from "react";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface UserProfile {
  displayName: string;
  email: string;
  level: Level;
  learningFrom: "sv" | "en";
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => false,
  logout: () => {},
  updateProfile: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const loadProfile = (email: string): Partial<UserProfile> => {
    try {
      const saved = localStorage.getItem(`profile_${email}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const saveProfile = (profile: UserProfile) => {
    try {
      localStorage.setItem(`profile_${profile.email}`, JSON.stringify({
        displayName: profile.displayName,
        level: profile.level,
        learningFrom: profile.learningFrom,
      }));
    } catch {}
  };

  const login = (email: string, password: string): boolean => {
    if (email === "admin" && password === "Jagtestar2026!!") {
      const saved = loadProfile("admin@murcielagolingo.app");
      const profile: UserProfile = {
        displayName: saved.displayName || "Admin",
        email: "admin@murcielagolingo.app",
        level: (saved.level as Level) || "C2",
        learningFrom: saved.learningFrom || "sv",
      };
      setIsLoggedIn(true);
      setUser(profile);
      return profile;
    }

    if (email && password) {
      const saved = loadProfile(email);
      const profile: UserProfile = {
        displayName: saved.displayName || email.split("@")[0],
        email,
        level: (saved.level as Level) || "A1",
        learningFrom: saved.learningFrom || "sv",
      };
      setIsLoggedIn(true);
      setUser(profile);
      return profile;
    }

    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...profile };
      setUser(updated);
      saveProfile(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
