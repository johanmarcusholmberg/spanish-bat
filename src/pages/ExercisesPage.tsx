import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import { BookOpen, Type, Palette, HelpCircle } from "lucide-react";

const ExercisesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const exercises = [
    { key: "verbs", icon: BookOpen, path: "/exercises/verbs", color: "gradient-peach" },
    { key: "nouns", icon: Type, path: "/exercises/nouns", color: "gradient-mint" },
    { key: "adjectives", icon: Palette, path: "/exercises/adjectives", color: "gradient-peach" },
    { key: "quiz", icon: HelpCircle, path: "/exercises/quiz", color: "gradient-mint" },
  ];

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{t("exercises")}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exercises.map((ex) => (
            <button
              key={ex.key}
              onClick={() => navigate(ex.path)}
              className="bg-card rounded-lg p-6 shadow-soft hover:shadow-warm transition-all hover:-translate-y-1 text-left"
            >
              <div className={`w-12 h-12 rounded-lg ${ex.color} flex items-center justify-center mb-3`}>
                <ex.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-bold text-foreground text-lg">{t(ex.key)}</h3>
              <p className="text-muted-foreground text-sm mt-1">{t(ex.key + "Desc")}</p>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExercisesPage;
