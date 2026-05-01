import React, { useState } from "react";
import { Mic, Pencil, Send, RotateCcw, Loader2, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface SpeechReviewPanelProps {
  transcript: string;
  coaching: string | null;
  isCoachingLoading: boolean;
  onSend: (text: string) => void;
  onRetry: () => void;
  onDismiss: () => void;
}

const SpeechReviewPanel: React.FC<SpeechReviewPanelProps> = ({
  transcript,
  coaching,
  isCoachingLoading,
  onSend,
  onRetry,
  onDismiss,
}) => {
  const { language } = useLanguage();
  const [editedText, setEditedText] = useState(transcript);
  const [isEditing, setIsEditing] = useState(false);

  const currentText = isEditing ? editedText : transcript;

  return (
    <div className="mb-3 rounded-xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Mic className="h-4 w-4 text-primary shrink-0" />
          <span>{language === "sv" ? "Granska din inspelning" : "Review your recording"}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Transcript display / edit */}
      {isEditing ? (
        <Input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="mb-2 text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <div className="mb-2 rounded-lg bg-background border px-3 py-2 text-sm leading-relaxed">
          {currentText || (
            <span className="text-muted-foreground italic">
              {language === "sv" ? "Ingen text uppfattad" : "No speech detected"}
            </span>
          )}
        </div>
      )}

      {/* Coaching feedback */}
      {(isCoachingLoading || coaching) && (
        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {language === "sv" ? "Tips" : "Tip"}
            </span>
          </div>
          {isCoachingLoading && !coaching ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {language === "sv" ? "Analyserar..." : "Analyzing..."}
            </div>
          ) : (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{coaching}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={() => onSend(currentText)} disabled={!currentText.trim()}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {language === "sv" ? "Skicka" : "Send"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
            } else {
              setEditedText(currentText);
              setIsEditing(true);
            }
          }}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          {isEditing
            ? language === "sv" ? "Klar" : "Done"
            : language === "sv" ? "Redigera" : "Edit"}
        </Button>
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          {language === "sv" ? "Spela in igen" : "Re-record"}
        </Button>
      </div>
    </div>
  );
};

export default SpeechReviewPanel;
