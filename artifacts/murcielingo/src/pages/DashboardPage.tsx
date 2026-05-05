import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import { useAccess } from "@/hooks/useAccess";
import AppLayout from "@/components/AppLayout";
import { StreakCard } from "@/components/StreakCard";
import MurciMascot from "@/components/MurciMascot";
import OnboardingModal from "@/components/OnboardingModal";
import TodaysEchoHero from "@/components/TodaysEchoHero";
import PracticeAreasStrip from "@/components/PracticeAreasStrip";
import LevelReadinessCard from "@/components/LevelReadinessCard";
import EchoMemoryPreview from "@/components/EchoMemoryPreview";

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
  const access = useAccess();
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
      <div className="animate-fade-in space-y-7 max-w-3xl mx-auto">
        {/* Friendly greeting — kept compact so Today's Echo leads. */}
        <div className="flex items-center gap-3">
          <MurciMascot size="sm" mood="happy" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("welcomeBack")} {user?.displayName}
            </p>
            <p className="font-heading text-[15px] text-foreground/85 leading-tight mt-0.5">
              {lang === "sv"
                ? "Låt oss eka dagens spanska."
                : "Let's echo today's Spanish."}
            </p>
          </div>
        </div>

        {/* PRIMARY: Today's Echo hero. */}
        <TodaysEchoHero />

        {/* SECONDARY: a small set of focused practice areas. */}
        <PracticeAreasStrip />

        {/* TERTIARY: progress summary — level readiness + streak. */}
        <div className="space-y-4">
          <LevelReadinessCard />
          <StreakCard />
          <EchoMemoryPreview />
        </div>

        {/* Upgrade messaging is intentionally NOT a top-level block;
            it surfaces inside Today's Echo when free users hit their
            daily cap, and inside EchoMemoryPreview as a soft teaser. */}
        {access.isFreeUser && !access.canUseTodayEcho && (
          <p className="text-center text-xs text-muted-foreground">
            {lang === "sv"
              ? "Vill du fortsätta i dag? Lås upp full adaptiv träning."
              : "Want to keep going today? Unlock full adaptive practice."}
          </p>
        )}
      </div>

      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </AppLayout>
  );
};

export default DashboardPage;
