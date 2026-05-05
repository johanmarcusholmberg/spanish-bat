import { useCallback, useEffect, useRef, useState } from "react";
import { useSpanishSTT } from "./useSpanishSTT";

/**
 * useAudioRecorder
 *
 * High-level state machine for the pronunciation "Echo" flow.
 * Wraps browser-specific microphone + speech-recognition APIs behind a
 * stable interface so the same UI code can later be powered by a native
 * adapter (e.g. expo-av + a server-side STT call) without changes to the
 * pronunciation page.
 *
 * NATIVE ADAPTER NOTES (Expo / React Native):
 *  - Replace `useSpanishSTT` with an adapter that uses `expo-av` for
 *    recording and posts the audio blob to a server-side STT endpoint
 *    (or to expo-speech-recognition once it stabilizes).
 *  - Replace `navigator.permissions.query({ name: "microphone" })` with
 *    `Audio.requestPermissionsAsync()` from expo-av.
 *  - Keep the public API of this hook identical so PronunciationPage does
 *    not need to change.
 */

export type RecorderState =
  | "idle"
  | "requesting_permission"
  | "ready"
  | "recording"
  | "processing"
  | "feedback_ready"
  | "error";

export type RecorderErrorKind =
  | "unsupported"
  | "permission_denied"
  | "no_microphone"
  | "max_duration"
  | "unknown";

export interface RecorderError {
  kind: RecorderErrorKind;
  message?: string;
}

export interface UseAudioRecorderOptions {
  /** Hard cap on recording length in milliseconds. Default 15 s. */
  maxDurationMs?: number;
  /** Called with the final transcript whenever a recording completes. */
  onTranscript?: (transcript: string) => void;
}

export interface AudioRecorder {
  state: RecorderState;
  error: RecorderError | null;
  isSupported: boolean;
  /** Latest finalized transcript (Spanish). */
  transcript: string;
  /** Live partial transcript shown while user is speaking. */
  interimTranscript: string;
  /** Did we observe permission? Useful for showing a contextual prompt. */
  permission: "unknown" | "prompt" | "granted" | "denied";

  /** Ask the user for mic access. Safe to call multiple times. */
  requestPermission: () => Promise<boolean>;
  /** Start recording. Will request permission first if needed. */
  start: () => Promise<void>;
  /** Stop and finalize. Triggers onTranscript shortly after. */
  stop: () => void;
  /** Reset to "ready" / clear transcript. */
  reset: () => void;
  /** Mark feedback as displayed (move state out of `processing`). */
  markFeedbackReady: () => void;
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {},
): AudioRecorder {
  const { maxDurationMs = 15_000, onTranscript } = options;

  const stt = useSpanishSTT();
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [permission, setPermission] = useState<AudioRecorder["permission"]>(
    "unknown",
  );

  const stopTimerRef = useRef<number | null>(null);
  const stoppedManuallyRef = useRef(false);
  const finalizedRef = useRef(false);

  const isSupported = stt.isSupported;

  // Probe initial permission state without prompting (where supported).
  useEffect(() => {
    let cancelled = false;
    if (!isSupported) {
      setState("error");
      setError({ kind: "unsupported" });
      return;
    }
    const nav = typeof navigator !== "undefined" ? navigator : null;
    const perms = nav && (nav as Navigator).permissions;
    if (!perms || typeof perms.query !== "function") {
      // We can't probe — assume "prompt" so UI can show a friendly explainer.
      setPermission("prompt");
      setState("ready");
      return;
    }
    perms
      // The microphone permission name is not in older lib.dom typings.
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        const map = (s: PermissionState): AudioRecorder["permission"] =>
          s === "granted" ? "granted" : s === "denied" ? "denied" : "prompt";
        setPermission(map(status.state));
        setState(status.state === "denied" ? "error" : "ready");
        if (status.state === "denied") {
          setError({ kind: "permission_denied" });
        }
        status.onchange = () => {
          setPermission(map(status.state));
        };
      })
      .catch(() => {
        if (cancelled) return;
        setPermission("prompt");
        setState("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [isSupported]);

  const clearStopTimer = () => {
    if (stopTimerRef.current != null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  /** Trigger the browser's permission prompt by briefly opening the mic. */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setState("error");
      setError({ kind: "unsupported" });
      return false;
    }
    const md = navigator.mediaDevices;
    if (!md || typeof md.getUserMedia !== "function") {
      // Browsers without getUserMedia but with webkitSpeechRecognition will
      // still prompt on `recognition.start()`. Treat as "prompt" and let
      // start() drive the prompt.
      setPermission("prompt");
      setState("ready");
      return true;
    }
    setState("requesting_permission");
    try {
      const stream = await md.getUserMedia({ audio: true });
      // Immediately release — we only needed the permission grant.
      stream.getTracks().forEach((t) => t.stop());
      setPermission("granted");
      setError(null);
      setState("ready");
      return true;
    } catch (e: unknown) {
      const name = (e as { name?: string })?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setPermission("denied");
        setError({ kind: "permission_denied" });
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError({ kind: "no_microphone" });
      } else {
        setError({ kind: "unknown", message: (e as Error)?.message });
      }
      setState("error");
      return false;
    }
  }, [isSupported]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setState("error");
      setError({ kind: "unsupported" });
      return;
    }
    if (state === "recording" || state === "requesting_permission") return;

    if (permission !== "granted") {
      const ok = await requestPermission();
      if (!ok) return;
    }

    setError(null);
    finalizedRef.current = false;
    stoppedManuallyRef.current = false;
    stt.resetTranscript();
    setState("recording");
    stt.startListening();

    clearStopTimer();
    stopTimerRef.current = window.setTimeout(() => {
      // Auto-stop on max duration. Treat as a normal stop, not an error.
      stoppedManuallyRef.current = true;
      setError({ kind: "max_duration" });
      setState("processing");
      stt.stopListening();
    }, maxDurationMs);
  }, [
    isSupported,
    state,
    permission,
    requestPermission,
    stt,
    maxDurationMs,
  ]);

  const stop = useCallback(() => {
    if (state !== "recording") return;
    clearStopTimer();
    stoppedManuallyRef.current = true;
    setState("processing");
    stt.stopListening();
  }, [state, stt]);

  const reset = useCallback(() => {
    clearStopTimer();
    stoppedManuallyRef.current = false;
    finalizedRef.current = false;
    // If a recording is somehow still live, abort it so we don't get a
    // late `onTranscript` after we've already moved on.
    if (stt.isListening) stt.stopListening();
    stt.resetTranscript();
    setError(null);
    setState(permission === "denied" ? "error" : "ready");
  }, [stt, permission]);

  const markFeedbackReady = useCallback(() => {
    setState("feedback_ready");
  }, []);

  // When STT stops after a manual/auto stop, deliver the transcript exactly once.
  useEffect(() => {
    if (!stoppedManuallyRef.current) return;
    if (finalizedRef.current) return;
    if (stt.isListening) return;
    finalizedRef.current = true;
    const final = stt.transcript.trim();
    // Caller (markFeedbackReady) decides when to leave `processing`.
    onTranscript?.(final);
  }, [stt.isListening, stt.transcript, onTranscript]);

  // Cleanup on unmount.
  useEffect(() => () => clearStopTimer(), []);

  return {
    state,
    error,
    isSupported,
    transcript: stt.transcript,
    interimTranscript: stt.interimTranscript,
    permission,
    requestPermission,
    start,
    stop,
    reset,
    markFeedbackReady,
  };
}
