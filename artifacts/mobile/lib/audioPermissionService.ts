/**
 * audioPermissionService
 * ----------------------
 * Permission-aware microphone abstraction so Echo / pronunciation steps can
 * be wired up consistently across web and native platforms.
 *
 * Today's status:
 *  - On web (react-native-web), we use the standard MediaDevices API to drive
 *    the permission prompt and surface a recorder placeholder.
 *  - On native, we keep a safe foundation and a TODO for wiring up
 *    `expo-av` / `expo-audio` once the team decides on the recording
 *    strategy. The hook + state machine here are designed so swapping the
 *    backing implementation is a one-file change.
 *
 * Crucially: every Echo UI must be able to fall back gracefully when
 * `canRecordAudio()` returns `false` — the user can still listen and self-mark.
 */

import { Platform } from "react-native";

export type PermissionStatus =
  | "unrequested"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

/** Returns true if the platform/runtime *can* record audio at all. */
export function canRecordAudio(): boolean {
  if (Platform.OS === "web") {
    if (typeof navigator === "undefined") return false;
    return !!navigator.mediaDevices?.getUserMedia;
  }
  // TODO(native): wire to expo-av / expo-audio capability check once we add
  // the dependency. For now, return true — the actual permission request
  // will resolve to "unavailable" until the native backend is wired.
  return true;
}

let cachedStatus: PermissionStatus = "unrequested";
let activeStream: MediaStream | null = null;

export async function getCurrentPermissionStatus(): Promise<PermissionStatus> {
  return cachedStatus;
}

export async function requestMicrophonePermission(): Promise<PermissionStatus> {
  if (!canRecordAudio()) {
    cachedStatus = "unavailable";
    return cachedStatus;
  }
  cachedStatus = "requesting";

  if (Platform.OS === "web") {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately — we only wanted the permission prompt.
      stream.getTracks().forEach((t) => t.stop());
      cachedStatus = "granted";
    } catch {
      cachedStatus = "denied";
    }
    return cachedStatus;
  }

  // TODO(native): replace with expo-av Audio.requestPermissionsAsync().
  cachedStatus = "unavailable";
  return cachedStatus;
}

// --- Recording surface (placeholder) ----------------------------------

export interface RecordingHandle {
  stop: () => Promise<RecordingResult>;
}

export interface RecordingResult {
  /** Local URI for playback, if available. */
  uri: string | null;
  /** Duration in ms (best effort). */
  durationMs: number;
}

/**
 * Start a recording. On web this just opens the mic stream; we don't actually
 * encode audio yet because Echo's first cut just needs "user spoke / didn't
 * speak". On native, this throws "unavailable" until wired.
 *
 * UI must always wrap this in a try/catch and fall back to manual confidence.
 */
export async function startRecording(): Promise<RecordingHandle> {
  if (cachedStatus !== "granted") {
    const next = await requestMicrophonePermission();
    if (next !== "granted") {
      throw new Error(`microphone-${next}`);
    }
  }
  if (Platform.OS === "web") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    activeStream = stream;
    const startedAt = Date.now();
    return {
      stop: async () => {
        stream.getTracks().forEach((t) => t.stop());
        activeStream = null;
        return { uri: null, durationMs: Date.now() - startedAt };
      },
    };
  }
  // TODO(native): implement with expo-av.
  throw new Error("microphone-unavailable");
}

export async function stopRecording(handle: RecordingHandle): Promise<RecordingResult> {
  return handle.stop();
}

export async function playbackRecording(_uri: string | null): Promise<void> {
  // TODO: wire to expo-av Sound.createAsync once recording is implemented.
}

export const audioPermissionService = {
  canRecordAudio,
  getCurrentPermissionStatus,
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  playbackRecording,
};
