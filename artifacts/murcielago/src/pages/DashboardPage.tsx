import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ProgressOverview, ContinueCard, NextStepsCard, LevelAdvancementCard } from "@/components/ProgressDashboard";
import { StreakCard } from "@/components/StreakCard";
import MurciMascot from "@/components/MurciMascot";
import DailyReviewCard from "@/components/DailyReview";
import LearningStats from "@/components/LearningStats";
import OnboardingModal from "@/components/OnboardingModal";
import TodaysPracticeCard from "@/components/TodaysPracticeCard";

const DashboardPage = () => {
  const { t, language, setProfileLang } = useLanguage();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user?.onboardingCompleted]);

  const handleOnboardingComplete = async (selectedLang: "sv" | "en", selectedLevel: Level) => {
    setShowOnboarding(false);

    try {
      await updateProfile({ learningFrom: selectedLang, level: selectedLevel, onboardingCompleted: true });
    } catch {
      // Optimistic UI already applied; surface no toast here as onboarding
      // continues to placement test which has its own error handling.
    }
    setProfileLang?.(selectedLang);

    // Route new users to the standalone placement test page so they get the
    // single, adaptive placement experience.
    if (!user?.placementTestCompleted) {
      navigate("/placement-test");
    }
  };

  const greeting = language === "sv"
    ? "Redo att öva idag? 💪"
    : "Ready to practice today? 💪";

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-5">
        <div className="flex items-center gap-3">
          <MurciMascot size="sm" mood="happy" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
              {t("welcomeBack")} {user?.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">{greeting}</p>
          </div>
        </div>

        <TodaysPracticeCard />
        <ContinueCard />
        <DailyReviewCard />
        <StreakCard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <ProgressOverview />
            <LearningStats />
          </div>
          <div className="space-y-5">
            <NextStepsCard />
            <LevelAdvancementCard />
          </div>
        </div>
      </div>

      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </AppLayout>
  );
};

export default DashboardPage;
