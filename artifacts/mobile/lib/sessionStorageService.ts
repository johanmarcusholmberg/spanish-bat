/**
 * Mobile shim around the shared `@workspace/learning-coach` session storage.
 * Binds AsyncStorage and re-exports the same surface mobile callers used
 * before the extraction so existing imports keep working.
 */
import {
  createSessionStorageService,
  isResumable as sharedIsResumable,
  type ActiveSessionState,
  type SessionItemResult,
} from "@workspace/learning-coach";

import { asyncStorageKv } from "./asyncStorageKv";

export type { ActiveSessionState, SessionItemResult };

export const sessionStorageService = createSessionStorageService(asyncStorageKv);

export const isResumable = sharedIsResumable;
