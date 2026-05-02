import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import AppLayout from "@/components/AppLayout";
import {
  GraduationCap,
  FileText,
  BookMarked,
  BookOpen,
  Type,
  Palette,
  Library as LibraryIcon,
} from "lucide-react";

/**
 * Library — a calm "resource area", not the main daily path.
 * Consolidates references the learner returns to: grammar lessons,
 * vocabulary they've saved, reading passages, and reference grids
 * for verbs / nouns / adjectives.
 *
 * Designed mobile-first: stacked cards on phones, two-column on
 * tablets and up, no hover-only affordances.
 */

interface Resource {
  key: string;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  icon: React.ElementType;
  to: string;
  tone: "peach" | "mint";
}

const RESOURCES: Resource[] = [
  {
    key: "grammar",
    title: { en: "Grammar lessons", sv: "Grammatiklektioner" },
    desc: {
      en: "Step-by-step lessons grouped by level.",
      sv: "Steg-för-steg-lektioner grupperade per nivå.",
    },
    icon: GraduationCap,
    to: "/learn/grammar",
    tone: "peach",
  },
  {
    key: "vocab",
    title: { en: "My dictionary", sv: "Min ordbok" },
    desc: {
      en: "Words and phrases you've saved.",
      sv: "Ord och fraser du har sparat.",
    },
    icon: BookMarked,
    to: "/learn/vocabulary",
    tone: "mint",
  },
  {
    key: "reading",
    title: { en: "Reading passages", sv: "Lästexter" },
    desc: {
      en: "Short level-adapted texts with comprehension prompts.",
      sv: "Korta nivåanpassade texter med förståelsefrågor.",
    },
    icon: FileText,
    to: "/learn/reading",
    tone: "peach",
  },
  {
    key: "verbs",
    title: { en: "Verb reference", sv: "Verbreferens" },
    desc: { en: "Conjugation tables and patterns.", sv: "Böjningstabeller och mönster." },
    icon: BookOpen,
    to: "/exercises/verbs",
    tone: "mint",
  },
  {
    key: "nouns",
    title: { en: "Noun reference", sv: "Substantivreferens" },
    desc: { en: "Gender, plurals, and articles.", sv: "Genus, plural och artiklar." },
    icon: Type,
    to: "/exercises/nouns",
    tone: "peach",
  },
  {
    key: "adjectives",
    title: { en: "Adjective reference", sv: "Adjektivreferens" },
    desc: { en: "Agreement and shades of meaning.", sv: "Kongruens och betydelsenyanser." },
    icon: Palette,
    to: "/exercises/adjectives",
    tone: "mint",
  },
];

const LibraryPage = () => {
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <LibraryIcon className="h-6 w-6 text-primary" />
            {lang === "sv" ? "Bibliotek" : "Library"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === "sv"
              ? "Lugna referenser att återvända till — inte huvudvägen."
              : "Calm references to return to — not the main daily path."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RESOURCES.map((r) => (
            <button
              key={r.key}
              onClick={() => navigate(r.to)}
              className="text-left bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    r.tone === "peach" ? "gradient-peach" : "gradient-mint"
                  }`}
                >
                  <r.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-base leading-snug">
                    {r.title[lang]}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {r.desc[lang]}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default LibraryPage;
