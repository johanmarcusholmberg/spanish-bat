import React from "react";
import {
  friendlyLabel,
  friendlySkillName,
  friendlySubskillName,
  type WeakSpot,
  type WeakSpotLabel,
} from "@workspace/practice";
import { Target, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface Props {
  weakSpots: WeakSpot[];
  todaysFocus: { en: string; sv: string };
  /** Show at most this many subskill chips. Default 4. */
  max?: number;
  /** Hide entirely when there are no weak spots. Default false. */
  hideWhenEmpty?: boolean;
  className?: string;
}

const LABEL_STYLES: Record<WeakSpotLabel, string> = {
  focus_area: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  needs_practice: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  good_to_review: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  getting_stronger: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
};

const WeakSpotsCard: React.FC<Props> = ({
  weakSpots,
  todaysFocus,
  max = 4,
  hideWhenEmpty = false,
  className = "",
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lang = language === "sv" ? "sv" : "en";

  if (weakSpots.length === 0 && hideWhenEmpty) return null;

  const top = weakSpots.slice(0, max);
  const Icon = weakSpots.length === 0 ? Sparkles : Target;

  return (
    <div
      className={`bg-card rounded-lg p-5 shadow-soft border border-border ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg gradient-peach flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-base">
            {lang === "sv" ? "Dagens fokus" : "Today's focus"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {todaysFocus[lang]}
          </p>
          {top.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {top.map((w) => (
                <span
                  key={w.key}
                  className={`text-xs px-2 py-1 rounded-full border ${LABEL_STYLES[w.label]}`}
                  title={`${friendlySkillName(w.skill, lang)} · ${Math.round(w.recentAccuracy * 100)}%`}
                >
                  <span className="font-medium">
                    {friendlyLabel(w.label, lang)}
                  </span>
                  <span className="opacity-80">
                    {" · "}
                    {friendlySubskillName(w.subskill, lang)}
                  </span>
                </span>
              ))}
            </div>
          )}
          {weakSpots.length > 0 && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => navigate("/practice/session?mode=weak_spots")}
            >
              {lang === "sv" ? "Öva fokusområden" : "Practice focus areas"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeakSpotsCard;
