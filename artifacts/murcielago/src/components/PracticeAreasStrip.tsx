import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  MicPulseMotif,
  PhraseBubbleMotif,
  SentenceFlowMotif,
  WaveformMotif,
} from "@/components/EchoMotifs";

type StatusTone = "recommend" | "due" | "continue" | "neutral";

interface Area {
  key: "pronunciation" | "vocabulary" | "sentences" | "listening";
  href: string;
  Motif: React.FC<{ className?: string; tone?: "primary" | "clay" | "ink" }>;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  status: { en: string; sv: string; tone: StatusTone };
}

const AREAS: Area[] = [
  {
    key: "pronunciation",
    href: "/learn/pronunciation",
    Motif: MicPulseMotif,
    title: { en: "Pronunciation", sv: "Uttal" },
    desc: {
      en: "Practice difficult sounds and improve clarity.",
      sv: "Öva svåra ljud och bli tydligare.",
    },
    status: { en: "Recommended today", sv: "Rekommenderas idag", tone: "recommend" },
  },
  {
    key: "vocabulary",
    href: "/learn/vocabulary",
    Motif: PhraseBubbleMotif,
    title: { en: "Vocabulary", sv: "Ordförråd" },
    desc: {
      en: "Review saved words and strengthen recall.",
      sv: "Repetera sparade ord och stärk minnet.",
    },
    status: { en: "Words due to review", sv: "Ord att repetera", tone: "due" },
  },
  {
    key: "sentences",
    href: "/learn/sentences",
    Motif: SentenceFlowMotif,
    title: { en: "Sentence Builder", sv: "Meningsbyggare" },
    desc: {
      en: "Train word order and sentence flow.",
      sv: "Träna ordföljd och meningsflöde.",
    },
    status: { en: "Continue where you left off", sv: "Fortsätt där du slutade", tone: "continue" },
  },
  {
    key: "listening",
    href: "/learn/conversation",
    Motif: WaveformMotif,
    title: { en: "Listening", sv: "Lyssna" },
    desc: {
      en: "Hear short Spanish clips and build recognition.",
      sv: "Lyssna på korta spanska klipp och känn igen mer.",
    },
    status: { en: "5 min session", sv: "5 min session", tone: "neutral" },
  },
];

const STATUS_STYLE: Record<StatusTone, string> = {
  recommend:
    "bg-primary/12 text-primary ring-1 ring-inset ring-primary/30",
  due:
    "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300/60 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700/50",
  continue:
    "bg-mint/30 text-mint-dark ring-1 ring-inset ring-mint-dark/25",
  neutral:
    "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
};

/**
 * Practice areas — replaces the old "icon-tile + label" grid with
 * richer, language-learning-specific cards. Each card carries its
 * own motif, a one-line description and a status pill so the strip
 * reads like a list of session entries instead of a generic
 * dashboard widget.
 */
const PracticeAreasStrip: React.FC = () => {
  const { language, t } = useLanguage();
  const lang: "en" | "sv" = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();

  return (
    <section aria-labelledby="practice-areas-title" className="space-y-3">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            {lang === "sv" ? "Övningsområden" : "Practice areas"}
          </p>
          <h3
            id="practice-areas-title"
            className="font-heading font-bold text-lg text-foreground leading-tight"
          >
            {t("practiceAreasTitle")}
          </h3>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {AREAS.map(({ key, href, Motif, title, desc, status }) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => navigate(href)}
              className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition hover:border-primary/40 hover:shadow-soft active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div className="flex items-start gap-3.5">
                <span
                  className="shrink-0 mt-0.5 inline-flex items-center justify-center"
                  aria-hidden
                >
                  <Motif className="h-7 w-7 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-semibold text-[15px] text-foreground leading-tight">
                      {title[lang]}
                    </h4>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition shrink-0" />
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-snug mt-1">
                    {desc[lang]}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 mt-2.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status.tone]}`}
                  >
                    {status[lang]}
                  </span>
                </div>
              </div>
              {/* faint motif watermark in the corner so each card has a
                  distinct visual cue without an extra icon tile */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -bottom-3 opacity-[0.06] group-hover:opacity-[0.10] transition"
              >
                <Motif className="h-20 w-20 text-primary" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PracticeAreasStrip;
