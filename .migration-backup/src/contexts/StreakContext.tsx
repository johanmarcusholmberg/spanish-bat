import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activityLog: Record<string, number>;
}

interface StreakContextType {
  streak: StreakData;
  logActivity: () => void;
  getWeekActivity: () => { date: string; count: number; dayLabel: string; isToday: boolean; isFuture: boolean }[];
  getWeekNumber: () => number;
  getTotalExercises: () => number;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const getToday = () => new Date().toISOString().split("T")[0];

const daysBetween = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
};

/** Get ISO week number */
const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

/** Get Monday of the current ISO week */
const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    activityLog: {},
  });

  useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    const load = async () => {
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      const { data: activityData } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", userId);

      const activityLog: Record<string, number> = {};
      if (activityData) {
        for (const row of activityData) {
          activityLog[row.activity_date] = row.count;
        }
      }

      const today = getToday();
      let currentStreak = streakData?.current_streak || 0;
      const longestStreak = streakData?.longest_streak || 0;
      const lastActiveDate = streakData?.last_active_date || "";

      if (lastActiveDate && daysBetween(lastActiveDate, today) > 1) {
        currentStreak = 0;
        await supabase
          .from("user_streaks")
          .upsert({ user_id: userId, current_streak: 0, longest_streak: longestStreak, last_active_date: lastActiveDate }, { onConflict: "user_id" });
      }

      setStreak({ currentStreak, longestStreak, lastActiveDate, activityLog });
    };

    load();
  }, [session?.user?.id]);

  const logActivity = useCallback(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    setStreak((prev) => {
      const today = getToday();
      const newLog = { ...prev.activityLog };
      newLog[today] = (newLog[today] || 0) + 1;

      let newStreak = prev.currentStreak;
      if (prev.lastActiveDate !== today) {
        const diff = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : 0;
        newStreak = (diff === 1 || diff === 0) ? prev.currentStreak + 1 : 1;
      }

      const longest = Math.max(prev.longestStreak, newStreak);
      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: longest,
        lastActiveDate: today,
        activityLog: newLog,
      };

      supabase
        .from("user_streaks")
        .upsert(
          { user_id: userId, current_streak: newStreak, longest_streak: longest, last_active_date: today },
          { onConflict: "user_id" }
        )
        .then();

      supabase
        .from("activity_log")
        .upsert(
          { user_id: userId, activity_date: today, count: newLog[today] },
          { onConflict: "user_id,activity_date" }
        )
        .then();

      return updated;
    });
  }, [session?.user?.id]);

  /** Returns Mon–Sun of the current week with activity data */
  const getWeekActivity = useCallback(() => {
    const today = new Date();
    const todayStr = getToday();
    const monday = getMondayOfWeek(today);
    const dayLabels = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

    const days: { date: string; count: number; dayLabel: string; isToday: boolean; isFuture: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        count: streak.activityLog[dateStr] || 0,
        dayLabel: dayLabels[i],
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
      });
    }
    return days;
  }, [streak.activityLog]);

  const getWeekNumber = useCallback(() => {
    return getISOWeekNumber(new Date());
  }, []);

  const getTotalExercises = useCallback(() => {
    return Object.values(streak.activityLog).reduce((sum, n) => sum + n, 0);
  }, [streak.activityLog]);

  return (
    <StreakContext.Provider value={{ streak, logActivity, getWeekActivity, getWeekNumber, getTotalExercises }}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) throw new Error("useStreak must be used within a StreakProvider");
  return context;
};
