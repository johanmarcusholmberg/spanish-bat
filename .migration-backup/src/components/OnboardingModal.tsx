import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import MurciMascot from "@/components/MurciMascot";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  BookOpen,
  BarChart3,
  User,
  Home,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Globe,
  Layout,
  TrendingUp,
  Info,
} from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (selectedLang: "sv" | "en") => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<"sv" | "en">(language as "sv" | "en");
  const totalSteps = 5;

  const isSv = selectedLang === "sv";

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(selectedLang);
  };
  const back = () => { if (step > 0) setStep(step - 1); };
  const skip = () => onComplete(selectedLang);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress bar */}
        <div className="flex gap-1 px-4 pt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="p-6 min-h-[400px] flex flex-col">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <MurciMascot size="lg" mood="celebrating" />
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  {isSv ? "Välkommen till Murciélingo!" : "Welcome to Murciélingo!"}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-sm">
                  {isSv
                    ? "Din personliga spanska-partner! Här lär du dig spanska genom övningar, flashcards, grammatik och konversation — i din egen takt."
                    : "Your personal Spanish learning partner! Learn Spanish through exercises, flashcards, grammar and conversation — at your own pace."}
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{isSv ? "Övningar" : "Exercises"}</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{isSv ? "Framsteg" : "Progress"}</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{isSv ? "AI-stöd" : "AI-powered"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Language selection */}
          {step === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
              <Globe className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {isSv ? "Välj appspråk" : "Choose app language"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isSv
                    ? "Vilket språk vill du att gränssnittet ska visas på?"
                    : "Which language should the app interface use?"}
                </p>
              </div>
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={() => setSelectedLang("sv")}
                  className={`flex-1 py-4 rounded-xl text-sm font-semibold transition border-2 ${
                    selectedLang === "sv"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  🇸🇪 Svenska
                </button>
                <button
                  onClick={() => setSelectedLang("en")}
                  className={`flex-1 py-4 rounded-xl text-sm font-semibold transition border-2 ${
                    selectedLang === "en"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Navigation explanation */}
          {step === 2 && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="text-center">
                <Layout className="h-10 w-10 text-primary mx-auto" />
                <h2 className="text-xl font-heading font-bold text-foreground mt-2">
                  {isSv ? "Navigera i appen" : "Navigate the app"}
                </h2>
              </div>
              <div className="space-y-3 mt-2">
                {[
                  { icon: Home, label: isSv ? "Startsida" : "Dashboard", desc: isSv ? "Översikt över dina framsteg och streaks" : "Overview of your progress and streaks" },
                  { icon: BookOpen, label: isSv ? "Övningar" : "Exercises", desc: isSv ? "Verb, substantiv, grammatik, flashcards, läsning, uttal m.m." : "Verbs, nouns, grammar, flashcards, reading, pronunciation and more" },
                  { icon: BarChart3, label: isSv ? "Statistik" : "Statistics", desc: isSv ? "Detaljerad statistik och aktivitetshistorik" : "Detailed stats and activity history" },
                  { icon: User, label: isSv ? "Profil" : "Profile", desc: isSv ? "Ändra nivå, språk och personliga inställningar" : "Change level, language and personal settings" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                    <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Dashboard & stats */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <TrendingUp className="h-12 w-12 text-primary" />
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {isSv ? "Följ dina framsteg" : "Track your progress"}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-sm">
                  {isSv
                    ? "Dashboarden visar din dagliga streak, övningsframsteg per kategori, och rekommendationer för vad du bör öva på härnäst."
                    : "The dashboard shows your daily streak, exercise progress per category, and recommendations for what to practice next."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-2">
                <div className="p-3 rounded-xl bg-muted/40 text-center">
                  <p className="text-2xl font-bold text-primary">🔥</p>
                  <p className="text-xs text-muted-foreground mt-1">{isSv ? "Daglig streak" : "Daily streak"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 text-center">
                  <p className="text-2xl font-bold text-primary">📊</p>
                  <p className="text-xs text-muted-foreground mt-1">{isSv ? "Framsteg" : "Progress"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 text-center">
                  <p className="text-2xl font-bold text-primary">🎯</p>
                  <p className="text-xs text-muted-foreground mt-1">{isSv ? "Mål" : "Goals"}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 text-center">
                  <p className="text-2xl font-bold text-primary">📚</p>
                  <p className="text-xs text-muted-foreground mt-1">{isSv ? "Ordbok" : "Dictionary"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Getting started */}
          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <MurciMascot size="md" mood="encouraging" />
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {isSv ? "Bra att veta" : "Good to know"}
                </h2>
              </div>
              <div className="space-y-3 w-full max-w-sm text-left">
                {[
                  isSv
                    ? "Du börjar på nivå A1 (nybörjare). Du kan ändra din nivå i profilen när som helst."
                    : "You start at level A1 (beginner). You can change your level in the profile anytime.",
                  isSv
                    ? "Nästa steg: ett kort placeringstest som hjälper oss hitta rätt nivå för dig. Du kan hoppa över det om du vill."
                    : "Next up: a short placement test to help find the right level for you. You can skip it if you want.",
                  isSv
                    ? "Allt sparas automatiskt — logga in på valfri enhet och fortsätt där du slutade."
                    : "Everything saves automatically — log in on any device and continue where you left off.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted/40">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div>
              {step > 0 ? (
                <button
                  onClick={back}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {isSv ? "Tillbaka" : "Back"}
                </button>
              ) : (
                <button
                  onClick={skip}
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  {isSv ? "Hoppa över" : "Skip"}
                </button>
              )}
            </div>
            <button
              onClick={next}
              className="flex items-center gap-1 px-5 py-2 rounded-lg gradient-peach text-primary-foreground font-semibold text-sm shadow-warm hover:opacity-90 transition"
            >
              {step === totalSteps - 1
                ? (isSv ? "Kom igång!" : "Get started!")
                : (isSv ? "Nästa" : "Next")}
              {step < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
