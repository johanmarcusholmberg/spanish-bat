import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import batAvatar from "@/assets/bat-avatar.png";
import { ProgressOverview, NextStepsCard, LevelAdvancementCard } from "@/components/ProgressDashboard";
import { GraduationCap } from "lucide-react";

const DashboardPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const learnItems = [
    { key: "grammarLessons", icon: GraduationCap, path: "/learn/grammar", color: "gradient-peach" },
    { key: "flashcards", icon: Layers, path: "/learn/flashcards", color: "gradient-mint" },
    { key: "reading", icon: FileText, path: "/learn/reading", color: "gradient-peach" },
    { key: "sentenceBuilder", icon: Puzzle, path: "/learn/sentences", color: "gradient-mint" },
  ];


  const renderGrid = (items: typeof learnItems) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((ex) => (
        <button
          key={ex.key}
          onClick={() => navigate(ex.path)}
          className="bg-card rounded-lg p-6 shadow-soft hover:shadow-warm transition-all hover:-translate-y-1 text-left group"
        >
          <div className={`w-12 h-12 rounded-lg ${ex.color} flex items-center justify-center mb-3`}>
            <ex.icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-heading font-bold text-foreground text-lg">{t(ex.key)}</h3>
          <p className="text-muted-foreground text-sm mt-1">{t(ex.key + "Desc")}</p>
        </button>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4">
          <img src={batAvatar} alt="MurciélagoLingo" className="w-16 h-16 animate-float" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {t("welcomeBack")} {user?.displayName}
            </h1>
            <p className="text-muted-foreground">
              {t("chooseExercise")}
            </p>
          </div>
        </div>

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

        <h2 className="font-heading font-bold text-foreground text-lg flex items-center gap-2">
          <GraduationCap className="h-5 w-5" /> {t("learn")}
        </h2>
        {renderGrid(learnItems)}

        <h2 className="font-heading font-bold text-foreground text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> {t("practice")}
        </h2>
        {renderGrid(exercises)}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
