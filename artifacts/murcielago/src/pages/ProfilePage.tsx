import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Save, Check, BookOpen, ChevronRight, Mail, Shield, ClipboardList, Globe } from "lucide-react";
import { getEnabledLanguages, LanguageCode } from "@/i18n/languages";

const levels: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const appLanguages = getEnabledLanguages();

const ProfilePage = () => {
  const { t, setProfileLang } = useLanguage();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [level, setLevel] = useState<Level>(user?.level || "A1");
  const [learningFrom, setLearningFrom] = useState<LanguageCode>(user?.learningFrom || "sv");

  const handleLearningFromChange = (code: LanguageCode) => {
    setLearningFrom(code);
    // Reflect immediately in the global selector so the UI does not feel out of sync.
    setProfileLang?.(code);
  };
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await updateProfile({ displayName, level, learningFrom });
      setProfileLang?.(learningFrom);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Optimistic UI already applied in updateProfile; silently ignore
      // network failure here to preserve existing UX.
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-lg mx-auto space-y-5">
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6" />
          {t("profileTitle")}
        </h1>

        {/* Section 1: Profile Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{t("profileInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">{t("displayName")}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t("email")}</Label>
              <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-md bg-muted border border-border text-muted-foreground text-sm min-h-[40px]">
                <Mail className="h-4 w-4 shrink-0 opacity-60" />
                <span className="truncate">{user?.email || ""}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Learning Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{t("learningSettings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">{t("currentLevel")}</Label>
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
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {t("appLanguage")}
              </Label>
              <div
                role="radiogroup"
                aria-label={t("chooseLanguage")}
                className={`grid gap-2`}
                style={{ gridTemplateColumns: `repeat(${Math.min(appLanguages.length, 3)}, minmax(0, 1fr))` }}
              >
                {appLanguages.map((opt) => {
                  const active = learningFrom === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleLearningFromChange(opt.code)}
                      className={`py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                        active
                          ? "gradient-mint text-secondary-foreground"
                          : "bg-background border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.flag ? <span aria-hidden>{opt.flag}</span> : null}
                      <span>{opt.nativeLabel}</span>
                      {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full gradient-peach text-primary-foreground font-semibold shadow-warm hover:opacity-90"
          size="lg"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? t("profileSaved") : t("saveProfile")}
        </Button>

        <Separator />

        {/* Section 3: Account */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{t("accountSection")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between min-h-[40px]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0 opacity-60" />
                {t("accountStatus")}
              </div>
              <Badge variant="secondary" className="font-normal">{t("freeUser")}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{t("quickLinks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button
              onClick={() => navigate("/learn/vocabulary")}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-md gradient-mint flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-foreground">{t("myDictionary")}</p>
                  <p className="text-xs text-muted-foreground truncate">{t("myDictionaryDesc")}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/placement-test")}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-md gradient-peach flex items-center justify-center shrink-0">
                  <ClipboardList className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {t("placementTestTitle")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t("placementTestDesc")}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
