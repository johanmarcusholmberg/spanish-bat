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
  getActivityForWeek: () => { date: string; count: number; dayLabel: string }[];
  getTotalExercises: () => number;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const getToday = () => new Date().toISOString().split("T")[0];

const daysBetween = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
};

export const StreakProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    activityLog: {},
  });

  // Load from DB
  useEffect(() => {
    if (!session?.user) return;
    const userId = session.user.id;

    const load = async () => {
      // Load streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Load activity log
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

      // Check if streak is broken
      if (lastActiveDate && daysBetween(lastActiveDate, today) > 1) {
        currentStreak = 0;
        // Update DB
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

      // Persist streak to DB
      supabase
        .from("user_streaks")
        .upsert(
          { user_id: userId, current_streak: newStreak, longest_streak: longest, last_active_date: today },
          { onConflict: "user_id" }
        )
        .then();

      // Persist activity log to DB
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
