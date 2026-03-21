import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { ProgressOverview, NextStepsCard, LevelAdvancementCard } from "@/components/ProgressDashboard";
import { StreakCard } from "@/components/StreakCard";
import MurciMascot from "@/components/MurciMascot";
import OnboardingModal from "@/components/OnboardingModal";
import PlacementTest from "@/components/PlacementTest";

const DashboardPage = () => {
  const { t, language, setLanguage, setProfileLang } = useLanguage() as any;
  const { user, session, updateProfile } = useAuth();

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

    // Save language + onboarding status
    await updateProfile({ learningFrom: selectedLang });
    setProfileLang?.(selectedLang);

    if (session?.user) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true, learning_from: selectedLang } as any)
        .eq("user_id", session.user.id);
    }

    // Show placement test if not completed
    if (!user?.placementTestCompleted) {
      setShowPlacement(true);
    }
  };

  const handlePlacementComplete = async (level: Level, scores: Record<string, number>) => {
    setShowPlacement(false);
    await updateProfile({ level });

    if (session?.user) {
      await supabase
        .from("profiles")
        .update({
          placement_test_completed: true,
          placement_test_score: scores,
          level,
        } as any)
        .eq("user_id", session.user.id);
    }
  };

  const handlePlacementSkip = async () => {
    setShowPlacement(false);

    if (session?.user) {
      await supabase
        .from("profiles")
        .update({
          placement_test_completed: true,
          placement_test_score: { skipped: true },
        } as any)
        .eq("user_id", session.user.id);
    }
  };

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

        <StreakCard />

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
