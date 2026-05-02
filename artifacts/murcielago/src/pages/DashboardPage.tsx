import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { ContinueCard } from "@/components/ProgressDashboard";
import { StreakCard } from "@/components/StreakCard";
import MurciMascot from "@/components/MurciMascot";
import OnboardingModal from "@/components/OnboardingModal";
import TodaysPracticeCard from "@/components/TodaysPracticeCard";
import LevelReadinessCard from "@/components/LevelReadinessCard";
import EchoSteps from "@/components/EchoSteps";

/**
 * Today screen — the primary post-login destination.
 *
 * Goals (Phase 22 refactor):
 *   - Lead with the recommended practice CTA, not a stats wall.
 *   - Show "continue where you left off" only when relevant.
 *   - Surface today's focus / weak items via TodaysPracticeCard.
 *   - Keep streak visible but not dominant.
 *   - Offer a Level Readiness card with both "take check" and
 *     "keep practicing" — never forces a test.
 *
 * Manual modules now live on /practice and /library; this page
 * intentionally avoids the old grid of modules.
 */
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
      // optimistic update applied; placement test handles its own errors.
    }
    setProfileLang?.(selectedLang);

    if (!user?.placementTestCompleted) {
      navigate("/placement-test");
    }
  };

  const lang = language === "sv" ? "sv" : "en";

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <MurciMascot size="sm" mood="happy" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
              {t("welcomeBack")} {user?.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("todayGreeting")} <span className="opacity-60">· {t("echoTagline")}</span>
            </p>
          </div>
        </div>

        <EchoSteps className="px-1" />

        <TodaysPracticeCard />

        <ContinueCard />

        <LevelReadinessCard />

        <StreakCard />

        <p className="text-center text-xs text-muted-foreground pt-2">
          {lang === "sv"
            ? "Vill du utforska? Öppna Öva eller Bibliotek."
            : "Want to browse? Open Practice or Library."}
        </p>
      </div>

      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </AppLayout>
  );
};

export default DashboardPage;
