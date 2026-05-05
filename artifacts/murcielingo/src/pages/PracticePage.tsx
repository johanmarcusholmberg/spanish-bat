import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, Level } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import PracticeMixesGrid from "@/components/PracticeMixesGrid";
import LevelPracticeSelector from "@/components/LevelPracticeSelector";
import EchoSteps from "@/components/EchoSteps";
import {
  BookOpen,
  Type,
  Palette,
  HelpCircle,
  Layers,
  MessageCircle,
  Mic,
  Zap,
  Waves,
  Puzzle,
  Sparkles,
} from "lucide-react";

/**
 * Practice (formerly Exercises) — the manual exploration area.
 *
 * Layout:
 *   1. Practice Mixes (purpose-based, recommended path).
 *   2. "Choose a mode yourself" grid for users who want a specific mode.
 *
 * Today's Practice on the Today screen remains the primary CTA — this
 * page is for users who have chosen to browse practice modes.
 */

interface ManualMode {
  key: string;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  icon: React.ElementType;
  to: string;
}

const MANUAL_MODES: ManualMode[] = [
  {
    key: "echo",
    title: { en: "Echo", sv: "Eka" },
    desc: {
      en: "See, hear, echo, build, use.",
      sv: "Se, hör, eka, bygg, använd.",
    },
    icon: Waves,
    to: "/learn/echo",
  },
  {
    key: "flashcards",
    title: { en: "Flashcards", sv: "Flashcards" },
    desc: {
      en: "Classic, write, and speak modes with spaced repetition.",
      sv: "Klassiskt, skriv och tala — med spaced repetition.",
    },
    icon: Layers,
    to: "/practice/flashcards",
  },
  {
    key: "conversation",
    title: { en: "Conversation", sv: "Konversation" },
    desc: {
      en: "Chat with Murci in real Spanish scenarios.",
      sv: "Chatta med Murci i riktiga spanska scenarier.",
    },
    icon: MessageCircle,
    to: "/learn/conversation",
  },
  {
    key: "pronunciation",
    title: { en: "Pronunciation", sv: "Uttal" },
    desc: {
      en: "Practice sounds and rhythm out loud.",
      sv: "Öva ljud och rytm högt.",
    },
    icon: Mic,
    to: "/learn/pronunciation",
  },
  {
    key: "freestyle",
    title: { en: "Freestyle", sv: "Fri övning" },
    desc: {
      en: "Open practice — your prompts, your pace.",
      sv: "Öppen övning — dina prompter, ditt tempo.",
    },
    icon: Zap,
    to: "/exercises/freestyle",
  },
  {
    key: "quiz",
    title: { en: "Quick quiz", sv: "Snabbquiz" },
    desc: {
      en: "Mixed multiple-choice questions.",
      sv: "Blandade flervalsfrågor.",
    },
    icon: HelpCircle,
    to: "/exercises/quiz",
  },
  {
    key: "sentences",
    title: { en: "Sentence builder", sv: "Meningsbyggare" },
    desc: {
      en: "Drag or speak sentences into the right order.",
      sv: "Dra eller tala meningar i rätt ordning.",
    },
    icon: Puzzle,
    to: "/learn/sentences",
  },
  {
    key: "verbs",
    title: { en: "Verbs", sv: "Verb" },
    desc: {
      en: "Conjugation drills across tenses.",
      sv: "Böjningsövningar över tempus.",
    },
    icon: BookOpen,
    to: "/exercises/verbs",
  },
  {
    key: "nouns",
    title: { en: "Nouns", sv: "Substantiv" },
    desc: { en: "Gender, articles, and meaning.", sv: "Genus, artiklar och betydelse." },
    icon: Type,
    to: "/exercises/nouns",
  },
  {
    key: "adjectives",
    title: { en: "Adjectives", sv: "Adjektiv" },
    desc: { en: "Agreement and shades of meaning.", sv: "Kongruens och betydelsenyanser." },
    icon: Palette,
    to: "/exercises/adjectives",
  },
];

const PracticePage = () => {
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : "en";
  const { user } = useAuth();
  const navigate = useNavigate();
  const [practiceLevel, setPracticeLevel] = useState<Level>(
    (user?.level || "A1") as Level,
  );

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {lang === "sv" ? "Öva" : "Practice"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lang === "sv"
                ? "Välj en kort, fokuserad mix — eller välj ett läge själv."
                : "Pick a short, focused mix — or choose a mode yourself."}
            </p>
          </div>
          <LevelPracticeSelector
            practiceLevel={practiceLevel}
            onLevelChange={setPracticeLevel}
          />
        </div>

        <EchoSteps />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {lang === "sv" ? "Övningsmixar" : "Practice mixes"}
            </h2>
          </div>
          <PracticeMixesGrid />
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {lang === "sv" ? "Välj ett läge själv" : "Choose a mode yourself"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MANUAL_MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => navigate(m.to)}
                className="text-left bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-mint flex items-center justify-center shrink-0">
                    <m.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-heading font-bold text-base leading-snug">
                      {m.title[lang]}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {m.desc[lang]}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default PracticePage;
