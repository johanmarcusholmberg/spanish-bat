import { useCallback, useEffect, useState } from "react";
import {
  audioPermissionService,
  type PermissionStatus,
} from "@/lib/audioPermissionService";

/**
 * useMicrophonePermission
 * -----------------------
 * Drives the permission state machine for any Echo/speaking UI.
 *
 * Usage:
 *   const { status, request, canRecord } = useMicrophonePermission();
 *
 * The hook does NOT auto-request on mount — Echo asks the user for the
 * permission *contextually* when they enter a speaking step.
 */
export function useMicrophonePermission() {
  const [status, setStatus] = useState<PermissionStatus>("unrequested");

  useEffect(() => {
    let active = true;
    audioPermissionService
      .getCurrentPermissionStatus()
      .then((s) => active && setStatus(s))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const request = useCallback(async () => {
    setStatus("requesting");
    const next = await audioPermissionService.requestMicrophonePermission();
    setStatus(next);
    return next;
  }, []);

  return {
    status,
    canRecord: audioPermissionService.canRecordAudio(),
    granted: status === "granted",
    denied: status === "denied",
    unavailable: status === "unavailable",
    request,
  } as const;
}
