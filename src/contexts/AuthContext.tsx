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

  const login = (email: string, password: string): boolean => {
    // Mock login - will be replaced with real auth via Lovable Cloud
    // Admin account for testing
    if (email === "admin" && password === "Jagtestar2026!!") {
      setIsLoggedIn(true);
      setUser({
        displayName: "Admin",
        email: "admin@murcielagolingo.app",
        level: "C2",
        learningFrom: "sv",
      });
      return true;
    }

    // Allow any email/password for demo purposes
    if (email && password) {
      setIsLoggedIn(true);
      setUser({
        displayName: email.split("@")[0],
        email,
        level: "A1",
        learningFrom: "sv",
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...profile });
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
