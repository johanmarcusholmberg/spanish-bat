import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import MurciMascot from "@/components/MurciMascot";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
  TrendingUp,
  Info,
} from "lucide-react";
import { Level } from "@/contexts/AuthContext";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (selectedLang: "sv" | "en", selectedLevel: Level) => void;
}

const LEVELS: { value: Level; labelSv: string; labelEn: string; descSv: string; descEn: string }[] = [
  { value: "A1", labelSv: "A1 — Nybörjare", labelEn: "A1 — Beginner", descSv: "Helt ny på spanska", descEn: "Brand new to Spanish" },
  { value: "A2", labelSv: "A2 — Grundläggande", labelEn: "A2 — Elementary", descSv: "Kan enkla fraser", descEn: "Know basic phrases" },
  { value: "B1", labelSv: "B1 — Mellannivå", labelEn: "B1 — Intermediate", descSv: "Klarar vardagssamtal", descEn: "Handle everyday conversations" },
  { value: "B2", labelSv: "B2 — Övre mellannivå", labelEn: "B2 — Upper Intermediate", descSv: "Talar flytande om bekanta ämnen", descEn: "Fluent on familiar topics" },
  { value: "C1", labelSv: "C1 — Avancerad", labelEn: "C1 — Advanced", descSv: "Uttrycker dig nyanserat", descEn: "Express yourself with nuance" },
  { value: "C2", labelSv: "C2 — Flytande", labelEn: "C2 — Fluent", descSv: "Behärskar spanska fullt ut", descEn: "Full mastery of Spanish" },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<"sv" | "en">(language as "sv" | "en");
  const [selectedLevel, setSelectedLevel] = useState<Level>("A1");
  const totalSteps = 4;

  const isSv = selectedLang === "sv";

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(selectedLang, selectedLevel);
  };
  const back = () => { if (step > 0) setStep(step - 1); };
  const skip = () => onComplete(selectedLang, selectedLevel);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{isSv ? "Välkommen — kom igång" : "Welcome — get started"}</DialogTitle>
        <DialogDescription className="sr-only">{isSv ? "Välj språk och nivå för att börja lära dig spanska." : "Choose your language and level to start learning Spanish."}</DialogDescription>

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

        <div className="p-6 min-h-[420px] flex flex-col">
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
                    ? "Din personliga spanska-partner! Lär dig spanska genom övningar, flashcards, grammatik och konversation — i din egen takt."
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
                    ? "Du lär dig spanska från vilket språk?"
                    : "You are learning Spanish from which language?"}
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

          {/* Step 2: Level selection */}
          {step === 2 && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-primary mx-auto" />
                <h2 className="text-xl font-heading font-bold text-foreground mt-2">
                  {isSv ? "Vad är din spanskanivå?" : "What is your Spanish level?"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isSv ? "Du kan ändra detta i profilen när som helst." : "You can change this in your profile anytime."}
                </p>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    onClick={() => setSelectedLevel(lvl.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                      selectedLevel === lvl.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-muted-foreground"
                    }`}
                  >
                    <span className={`text-sm font-bold w-8 shrink-0 ${selectedLevel === lvl.value ? "text-primary" : "text-muted-foreground"}`}>
                      {lvl.value}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {isSv ? lvl.labelSv : lvl.labelEn}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {isSv ? lvl.descSv : lvl.descEn}
                      </p>
                    </div>
                    {selectedLevel === lvl.value && (
                      <span className="ml-auto text-primary text-lg shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Getting started tips */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <MurciMascot size="md" mood="encouraging" />
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {isSv ? "Du är redo!" : "You are ready!"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isSv
                    ? `Språk: ${selectedLang === "sv" ? "Svenska" : "English"} · Nivå: ${selectedLevel}`
                    : `Language: ${selectedLang === "sv" ? "Svenska" : "English"} · Level: ${selectedLevel}`}
                </p>
              </div>
              <div className="space-y-3 w-full max-w-sm text-left">
                {[
                  {
                    icon: Home,
                    text: isSv ? "Dashboarden visar din streak, framsteg och nästa steg." : "The dashboard shows your streak, progress, and next steps.",
                  },
                  {
                    icon: BookOpen,
                    text: isSv ? "Övningar täcker verb, grammatik, flashcards, läsning och mer." : "Exercises cover verbs, grammar, flashcards, reading, and more.",
                  },
                  {
                    icon: User,
                    text: isSv ? "Ändra nivå och språk i profilen när du vill." : "Change your level and language in the profile anytime.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted/40">
                    <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {isSv
                      ? "Efter detta erbjuds ett kort placeringstest för att bekräfta din nivå. Du kan hoppa över det."
                      : "After this, a short placement test will help confirm your level. You can skip it."}
                  </p>
                </div>
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
