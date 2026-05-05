/**
 * Re-export shim — the implementation now lives in the shared
 * `@workspace/learning-coach` package so the mobile app can use the
 * exact same model. Keep this file so existing relative imports inside
 * `artifacts/murcielago/src/...` continue to work unchanged.
 */
export * from "@workspace/learning-coach";
