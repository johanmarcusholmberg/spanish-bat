import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activityLog: Record<string, number>; // date -> exercises completed that day
}

interface StreakContextType {
  streak: StreakData;
  logActivity: () => void;
  getActivityForWeek: () => { date: string; count: number; dayLabel: string }[];
  getTotalExercises: () => number;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const getToday = () => new Date().toISOString().split("T")[0];

const loadStreak = (email: string): StreakData => {
  try {
    const saved = localStorage.getItem(`streak_${email}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: "", activityLog: {} };
};

const saveStreak = (email: string, data: StreakData) => {
  try {
    localStorage.setItem(`streak_${email}`, JSON.stringify(data));
  } catch {}
};

const daysBetween = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
};

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    activityLog: {},
  });

  useEffect(() => {
    const email = user?.email || "guest";
    const data = loadStreak(email);
    // Check if streak is broken (missed a day)
    const today = getToday();
    if (data.lastActiveDate && daysBetween(data.lastActiveDate, today) > 1) {
      data.currentStreak = 0;
    }
    setStreak(data);
  }, [user?.email]);

  const logActivity = useCallback(() => {
    const email = user?.email || "guest";
    setStreak((prev) => {
      const today = getToday();
      const newLog = { ...prev.activityLog };
      newLog[today] = (newLog[today] || 0) + 1;

      let newStreak = prev.currentStreak;
      if (prev.lastActiveDate !== today) {
        const diff = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : 0;
        if (diff === 1 || diff === 0) {
          newStreak = prev.lastActiveDate === today ? prev.currentStreak : prev.currentStreak + 1;
        } else {
          newStreak = 1;
        }
      }

      const longest = Math.max(prev.longestStreak, newStreak);
      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: longest,
        lastActiveDate: today,
        activityLog: newLog,
      };

      saveStreak(email, updated);
      return updated;
    });
  }, [user?.email]);

  const getActivityForWeek = useCallback(() => {
    const days: { date: string; count: number; dayLabel: string }[] = [];
    const dayNames = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        count: streak.activityLog[dateStr] || 0,
        dayLabel: dayNames[d.getDay()],
      });
    }
    return days;
  }, [streak.activityLog]);

  const getTotalExercises = useCallback(() => {
    return Object.values(streak.activityLog).reduce((sum, n) => sum + n, 0);
  }, [streak.activityLog]);

  return (
    <StreakContext.Provider value={{ streak, logActivity, getActivityForWeek, getTotalExercises }}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) throw new Error("useStreak must be used within a StreakProvider");
  return context;
};
