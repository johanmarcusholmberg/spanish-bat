import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ProgressOverview, NextStepsCard, LevelAdvancementCard } from "@/components/ProgressDashboard";
import { StreakCard } from "@/components/StreakCard";
import MurciMascot from "@/components/MurciMascot";

const DashboardPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const greeting = language === "sv"
    ? "Redo att öva idag? 💪"
    : "Ready to practice today? 💪";

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4">
          <MurciMascot size="sm" mood="happy" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {t("welcomeBack")} {user?.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">{greeting}</p>
          </div>
        </div>

        {/* Streak */}
        <StreakCard />

        {/* Progress Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProgressOverview />
            <div className="hidden lg:block">
              <LevelAdvancementCard />
            </div>
          </div>
          <div className="space-y-6">
            <NextStepsCard />
            <div className="lg:hidden">
              <LevelAdvancementCard />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
