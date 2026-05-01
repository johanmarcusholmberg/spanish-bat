import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ProgressOverview, ContinueCard, NextStepsCard, LevelAdvancementCard } from "@/components/ProgressDashboard";
import { StreakCard } from "@/components/StreakCard";
import MurciMascot from "@/components/MurciMascot";
import DailyReviewCard from "@/components/DailyReview";
import LearningStats from "@/components/LearningStats";
import OnboardingModal from "@/components/OnboardingModal";
import PlacementTest from "@/components/PlacementTest";

const DashboardPage = () => {
  const { t, language, setProfileLang } = useLanguage() as any;
  const { user, updateProfile } = useAuth();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [onboardingLang, setOnboardingLang] = useState<"sv" | "en">("sv");

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user?.onboardingCompleted]);

  const handleOnboardingComplete = async (selectedLang: "sv" | "en") => {
    setOnboardingLang(selectedLang);
    setShowOnboarding(false);

    await updateProfile({ learningFrom: selectedLang, onboardingCompleted: true });
    setProfileLang?.(selectedLang);

    if (!user?.placementTestCompleted) {
      setShowPlacement(true);
    }
  };

  const handlePlacementComplete = async (level: Level, _scores: Record<string, number>) => {
    setShowPlacement(false);
    await updateProfile({ level, placementTestCompleted: true });
  };

  const handlePlacementSkip = async () => {
    setShowPlacement(false);
    await updateProfile({ placementTestCompleted: true });
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
      <PlacementTest
        open={showPlacement}
        lang={onboardingLang}
        onComplete={handlePlacementComplete}
        onSkip={handlePlacementSkip}
      />
    </AppLayout>
  );
};

export default DashboardPage;
