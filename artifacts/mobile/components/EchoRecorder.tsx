import React, { useEffect, useRef, useState } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Typography } from "./Typography";
import { useColors } from "@/hooks/useColors";
import { useMicrophonePermission } from "@/hooks/useMicrophonePermission";
import {
  audioPermissionService,
  type RecordingHandle,
} from "@/lib/audioPermissionService";
import { learningFeedbackService } from "@/lib/learningFeedbackService";

interface Props {
  /** Spanish phrase the user is being asked to echo. */
  phrase: string;
  /** Optional translation shown beneath the phrase. */
  translation?: string;
  /** Called when the user self-marks confidence (used when recording is unavailable). */
  onConfidence?: (level: "again" | "ok" | "great") => void;
}

/**
 * EchoRecorder
 * ------------
 * Reusable Echo step UI: shows the phrase, requests mic permission contextually,
 * lets the user record (where supported) or self-mark confidence, and always
 * stays usable when recording is unavailable.
 *
 * The component never throws on permission errors — copy adapts to the
 * permission state so users on web/devices without mic access still see a
 * friendly fallback ("Try saying it out loud, then tell us how it felt").
 */
export const EchoRecorder: React.FC<Props> = ({ phrase, translation, onConfidence }) => {
  const colors = useColors();
  const mic = useMicrophonePermission();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<RecordingHandle | null>(null);

  useEffect(() => {
    return () => {
      // best-effort: stop any in-flight recording when the component unmounts
      if (handleRef.current) {
        handleRef.current.stop().catch(() => {});
        handleRef.current = null;
      }
    };
  }, []);

  const startTap = async () => {
    setError(null);
    if (mic.status === "unrequested") {
      const next = await mic.request();
      if (next !== "granted") {
        setError(
          next === "denied"
            ? "Mic access was blocked. You can still echo and self-mark below."
            : "Recording isn't available here. Try echoing out loud and self-mark below.",
        );
        return;
      }
    }
    if (mic.status === "denied" || mic.status === "unavailable") {
      setError("Recording isn't available — try echoing out loud and self-mark below.");
      return;
    }
    try {
      const handle = await audioPermissionService.startRecording();
      handleRef.current = handle;
      setRecording(true);
    } catch {
      setError("Couldn't start recording. Self-mark below if you tried it out loud.");
    }
  };

  const stopTap = async () => {
    if (!handleRef.current) {
      setRecording(false);
      return;
    }
    try {
      await handleRef.current.stop();
    } catch {
      /* swallow */
    }
    handleRef.current = null;
    setRecording(false);
    learningFeedbackService.feedbackWordStrengthened();
  };

  const mark = (level: "again" | "ok" | "great") => {
    if (level === "great") learningFeedbackService.feedbackWordStrengthened();
    onConfidence?.(level);
  };

  const canRecordHere = mic.canRecord && mic.status !== "denied" && mic.status !== "unavailable";

  return (
    <View>
      <Typography variant="caption" muted style={styles.eyebrow}>
        ECHO THIS PHRASE
      </Typography>
      <Typography variant="h3" style={{ marginTop: 4 }}>
        {phrase}
      </Typography>
      {translation && (
        <Typography variant="caption" muted style={{ marginTop: 4, fontStyle: "italic" }}>
          {translation}
        </Typography>
      )}

      <Pressable
        onPress={recording ? stopTap : startTap}
        accessibilityRole="button"
        accessibilityLabel={
          recording
            ? "Stop recording"
            : canRecordHere
              ? `Echo the phrase: ${phrase}`
              : `Practice saying out loud: ${phrase}`
        }
        accessibilityState={{ busy: recording }}
        style={[
          styles.micBtn,
          {
            backgroundColor: recording ? colors.destructive : colors.primary,
            borderColor: recording ? colors.destructive : colors.primary,
          },
        ]}
      >
        <Feather
          name={recording ? "square" : "mic"}
          size={20}
          color={colors.primaryForeground}
        />
        <Typography variant="label" color={colors.primaryForeground} style={{ marginLeft: 8 }}>
          {recording
            ? "Stop"
            : canRecordHere
              ? mic.status === "granted"
                ? "Echo it"
                : "Tap to enable mic & echo"
              : "Try saying it out loud"}
        </Typography>
      </Pressable>

      {!canRecordHere && (
        <Typography variant="caption" muted style={{ marginTop: 8 }}>
          Murcielingo uses your microphone so you can echo phrases. You can also keep
          practicing without recording — just self-mark how it felt.
        </Typography>
      )}

      {error && (
        <Typography variant="caption" style={{ marginTop: 8, color: colors.destructive }}>
          {error}
        </Typography>
      )}

      {/* Always-available manual confidence — works with or without recording. */}
      {onConfidence && (
        <View style={styles.confidenceRow}>
          {(
            [
              { key: "again" as const, label: "Try again", icon: "refresh-cw" as const },
              { key: "ok" as const, label: "OK", icon: "thumbs-up" as const },
              { key: "great" as const, label: "Great", icon: "award" as const },
            ]
          ).map((c) => (
            <Pressable
              key={c.key}
              onPress={() => mark(c.key)}
              accessibilityRole="button"
              accessibilityLabel={`Mark this echo as: ${c.label}`}
              style={[styles.confidenceBtn, { borderColor: colors.border }]}
            >
              <Feather name={c.icon} size={14} color={colors.foreground} />
              <Typography variant="caption" style={{ marginLeft: 6 }}>
                {c.label}
              </Typography>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default EchoRecorder;

const styles = StyleSheet.create({
  eyebrow: { letterSpacing: 1, fontSize: 10 },
  micBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  confidenceBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
