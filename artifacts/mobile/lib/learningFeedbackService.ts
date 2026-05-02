/**
 * learningFeedbackService
 * -----------------------
 * Centralized, semantic feedback events for guided practice.
 *
 * Why a service? Without one, haptic / sound / micro-animation calls scatter
 * across every UI component. By calling `feedbackCorrect()` etc. we keep the
 * UI declarative ("this is a correct moment") and let the service decide how
 * to express that on the current platform.
 *
 * Implementation today:
 *  - Native: thin wrapper around `expo-haptics` (already a project dependency).
 *  - Web: no-op haptics, with a hook left open for future audio cues.
 *  - All calls are best-effort — feedback should never throw or block flow.
 */
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

type FeedbackEvent =
  | "correct"
  | "incorrect"
  | "session_complete"
  | "streak_maintained"
  | "word_strengthened"
  | "level_ready";

let muted = false;

function safeHaptic(fn: () => Promise<unknown> | void): void {
  if (muted) return;
  if (Platform.OS === "web") return; // expo-haptics is a no-op on web, but skip the call anyway.
  try {
    const r = fn();
    if (r && typeof (r as Promise<unknown>).catch === "function") {
      (r as Promise<unknown>).catch(() => {});
    }
  } catch {
    /* never throw out of feedback */
  }
}

function dispatch(event: FeedbackEvent): void {
  switch (event) {
    case "correct":
      safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      break;
    case "incorrect":
      safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
      break;
    case "session_complete":
      safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      break;
    case "streak_maintained":
      safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      break;
    case "word_strengthened":
      safeHaptic(() => Haptics.selectionAsync());
      break;
    case "level_ready":
      safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      break;
  }
}

export const learningFeedbackService = {
  feedbackCorrect: () => dispatch("correct"),
  feedbackIncorrect: () => dispatch("incorrect"),
  feedbackSessionComplete: () => dispatch("session_complete"),
  feedbackStreakMaintained: () => dispatch("streak_maintained"),
  feedbackWordStrengthened: () => dispatch("word_strengthened"),
  feedbackLevelReady: () => dispatch("level_ready"),
  setMuted: (next: boolean) => {
    muted = next;
  },
  isMuted: () => muted,
};
