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
  User,
  Home,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Globe,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Level } from "@/contexts/AuthContext";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (selectedLang: "sv" | "en", selectedLevel: Level) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<"sv" | "en">(language as "sv" | "en");
  // Level defaults to A1 here and is replaced by the placement test result
  // on the next screen (or kept as A1 if the user skips placement).
  const defaultLevel: Level = "A1";
  const totalSteps = 3;

  const isSv = selectedLang === "sv";

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(selectedLang, defaultLevel);
  };
  const back = () => { if (step > 0) setStep(step - 1); };
  const skip = () => onComplete(selectedLang, defaultLevel);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{isSv ? "Välkommen — kom igång" : "Welcome — get started"}</DialogTitle>
        <DialogDescription className="sr-only">{isSv ? "Välj språk för att börja lära dig spanska." : "Choose your language to start learning Spanish."}</DialogDescription>

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

          {/* Step 2: Getting started tips + placement test handoff */}
          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <MurciMascot size="md" mood="encouraging" />
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {isSv ? "Du är nästan redo!" : "You are almost ready!"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isSv
                    ? "Vi tar dig till ett kort placeringstest så vi kan rekommendera rätt nivå för dig."
                    : "We'll take you to a short placement test so we can recommend the right level for you."}
                </p>
              </div>
              <div className="space-y-3 w-full max-w-sm text-left">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40">
                  <ClipboardList className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {isSv
                      ? "Placeringstestet är adaptivt och tar 2–5 minuter. Du kan också hoppa över det."
                      : "The placement test is adaptive and takes 2–5 minutes. You can also skip it."}
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40">
                  <Home className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {isSv ? "Dashboarden visar din streak, framsteg och nästa steg." : "The dashboard shows your streak, progress, and next steps."}
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40">
                  <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {isSv ? "Du kan ändra nivå och språk i profilen när du vill." : "You can change your level and language in the profile anytime."}
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
                ? (isSv ? "Till placeringstestet" : "To placement test")
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
