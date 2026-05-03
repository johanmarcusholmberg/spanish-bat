import React from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Headphones, BookOpen, Blocks } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Area {
  key: "pronunciation" | "vocabulary" | "sentences" | "listening";
  href: string;
  Icon: React.ElementType;
  label: { en: string; sv: string };
}

const AREAS: Area[] = [
  {
    key: "pronunciation",
    href: "/learn/pronunciation",
    Icon: Mic,
    label: { en: "Pronunciation", sv: "Uttal" },
  },
  {
    key: "vocabulary",
    href: "/learn/vocabulary",
    Icon: BookOpen,
    label: { en: "Vocabulary", sv: "Ordförråd" },
  },
  {
    key: "sentences",
    href: "/learn/sentences",
    Icon: Blocks,
    label: { en: "Sentence Builder", sv: "Meningsbyggare" },
  },
  {
    key: "listening",
    href: "/learn/conversation",
    Icon: Headphones,
    label: { en: "Listening", sv: "Lyssna" },
  },
];

/**
 * Compact "Continue learning" strip — only four focused practice
 * areas, kept secondary to Today's Echo so the dashboard doesn't read
 * as a generic grid of modules.
 */
const PracticeAreasStrip: React.FC = () => {
  const { language, t } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();

  return (
    <section aria-labelledby="practice-areas-title" className="space-y-2.5">
      <h3
        id="practice-areas-title"
        className="text-sm font-semibold text-foreground/80 px-1"
      >
        {t("practiceAreasTitle")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {AREAS.map(({ key, href, Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(href)}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-3.5 text-left transition hover:border-primary/40 hover:shadow-soft active:scale-[0.99]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-foreground leading-tight">
              {label[lang]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default PracticeAreasStrip;
