import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { User, Save, Check } from "lucide-react";

const levels: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [level, setLevel] = useState<Level>(user?.level || "A1");
  const [learningFrom, setLearningFrom] = useState<"sv" | "en">(user?.learningFrom || "sv");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ displayName, level, learningFrom });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
          <User className="h-6 w-6" />
          {t("profileTitle")}
        </h1>

        <div className="bg-card rounded-lg p-6 shadow-soft space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("displayName")}</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("email")}</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-md bg-muted border border-border text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t("currentLevel")}</label>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition ${
                    level === l
                      ? "gradient-peach text-primary-foreground shadow-warm"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {t(`level${l}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t("learningFrom")}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLearningFrom("sv")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  learningFrom === "sv"
                    ? "gradient-mint text-secondary-foreground"
                    : "bg-background border border-border text-foreground hover:bg-muted"
                }`}
              >
                {t("swedish")} 🇸🇪
              </button>
              <button
                onClick={() => setLearningFrom("en")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  learningFrom === "en"
                    ? "gradient-mint text-secondary-foreground"
                    : "bg-background border border-border text-foreground hover:bg-muted"
                }`}
              >
                {t("english")} 🇬🇧
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-md gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? t("profileSaved") : t("saveProfile")}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
