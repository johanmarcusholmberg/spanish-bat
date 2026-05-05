import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import SoftPaywall from "@/components/SoftPaywall";
import PremiumBadge from "@/components/PremiumBadge";
import type { PracticeMixKey } from "@workspace/subscription";
import {
  Sparkles,
  Target,
  GraduationCap,
  History,
  ClipboardCheck,
  Flame,
  CalendarCheck,
  MessageCircle,
  Mic,
  Waves,
  Clock,
  Lock,
} from "lucide-react";

/**
 * Purpose-based "Practice Mixes" — these are short, named sessions that
 * map to existing PracticeSession modes plus a couple of mode-flavoured
 * shortcuts to existing pages (conversation, pronunciation, echo).
 *
 * Free vs Premium:
 *   - Every mix stays visible so users understand what Premium unlocks.
 *   - Free-only mixes ("warmup", "daily", "echo") tap straight through.
 *   - "preview" mixes get a soft paywall on tap.
 *   - "locked" mixes get a Premium badge + soft paywall on tap.
 */

interface Mix {
  key: PracticeMixKey;
  title: { en: string; sv: string };
  desc: { en: string; sv: string };
  minutes: number;
  icon: React.ElementType;
  to: string;
  tone: "peach" | "mint";
}

const MIXES: Mix[] = [
  { key: "warmup", title: { en: "5-minute warm-up", sv: "5 minuters uppvärmning" }, desc: { en: "A short, gentle mix to ease into Spanish today.", sv: "En kort, mjuk mix för att komma in i spanskan idag." }, minutes: 5, icon: Sparkles, to: "/practice/session?mode=quick", tone: "peach" },
  { key: "daily", title: { en: "Daily review", sv: "Daglig repetition" }, desc: { en: "Refresh items your brain is ready to revisit.", sv: "Fräscha upp det din hjärna är redo att repetera." }, minutes: 8, icon: CalendarCheck, to: "/practice/session?mode=due_review", tone: "mint" },
  { key: "weak", title: { en: "Weak words & spots", sv: "Svaga ord & områden" }, desc: { en: "Focused practice on what you're still building.", sv: "Fokuserad övning på det du fortfarande bygger upp." }, minutes: 10, icon: Target, to: "/practice/session?mode=weak_spots", tone: "peach" },
  { key: "speaking", title: { en: "Speaking confidence", sv: "Tala med självförtroende" }, desc: { en: "Listen, echo, and say it out loud.", sv: "Lyssna, eka och säg det högt." }, minutes: 10, icon: Mic, to: "/learn/pronunciation", tone: "mint" },
  { key: "echo", title: { en: "Listen and echo", sv: "Lyssna och eka" }, desc: { en: "See it, hear it, echo it, build it, use it.", sv: "Se, hör, eka, bygg, använd." }, minutes: 10, icon: Waves, to: "/learn/echo", tone: "peach" },
  { key: "grammar", title: { en: "Grammar rescue", sv: "Grammatikräddning" }, desc: { en: "A short set focused on grammar shapes.", sv: "En kort omgång fokuserad på grammatiska mönster." }, minutes: 10, icon: GraduationCap, to: "/practice/session?mode=level", tone: "mint" },
  { key: "conversation", title: { en: "Conversation practice", sv: "Konversationsövning" }, desc: { en: "Hold a short Spanish chat with Murci.", sv: "För en kort spansk konversation med Murci." }, minutes: 12, icon: MessageCircle, to: "/learn/conversation", tone: "peach" },
  { key: "review_previous", title: { en: "Travel Spanish refresh", sv: "Reseuppfräschning" }, desc: { en: "Revisit travel-friendly basics from earlier levels.", sv: "Repetera resvänliga grunder från tidigare nivåer." }, minutes: 10, icon: History, to: "/practice/session?mode=review_previous", tone: "mint" },
  { key: "test_prep", title: { en: "Test readiness", sv: "Inför nivåkollen" }, desc: { en: "A balanced set that feels like the level check.", sv: "En balanserad mix som liknar nivåkollen." }, minutes: 12, icon: ClipboardCheck, to: "/practice/session?mode=test_prep", tone: "peach" },
  { key: "challenge", title: { en: "Stretch me", sv: "Tänj på mig" }, desc: { en: "A tougher mix with a peek at the next level.", sv: "En tuffare mix med en titt på nästa nivå." }, minutes: 12, icon: Flame, to: "/practice/session?mode=challenge", tone: "mint" },
];

const PracticeMixesGrid: React.FC = () => {
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : "en";
  const navigate = useNavigate();
  const { mixAccess, isPremium } = useFeatureAccess();
  const [paywallMix, setPaywallMix] = useState<Mix | null>(null);

  const handleClick = (m: Mix) => {
    const access = mixAccess(m.key);
    if (access === "full" || isPremium) {
      navigate(m.to);
      return;
    }
    // "preview" and "locked" both surface the soft paywall. We show
    // locked content visibility so the user understands what they
    // unlock, but tapping always opens the contextual paywall.
    setPaywallMix(m);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MIXES.map((m) => {
          const access = mixAccess(m.key);
          const isLocked = !isPremium && access !== "full";
          return (
            <button
              key={m.key}
              onClick={() => handleClick(m)}
              className={`relative text-left bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.99] ${
                isLocked ? "opacity-95" : ""
              }`}
              aria-label={`${m.title[lang]}${isLocked ? " — Premium" : ""}`}
            >
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <PremiumBadge label={access === "preview" ? "Preview" : "Premium"} />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    m.tone === "peach" ? "gradient-peach" : "gradient-mint"
                  }`}
                >
                  {isLocked ? (
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <m.icon className="h-5 w-5 text-primary-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-base leading-snug">
                    {m.title[lang]}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {m.desc[lang]}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>~{m.minutes} min</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {paywallMix && (
        <SoftPaywall
          context="locked_mix"
          variant="sheet"
          onDismiss={() => setPaywallMix(null)}
          onSecondary={() => {
            setPaywallMix(null);
            navigate("/practice/session?mode=quick");
          }}
        />
      )}
    </>
  );
};

export default PracticeMixesGrid;
