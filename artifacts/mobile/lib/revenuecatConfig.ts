/**
 * RevenueCat configuration sourced from EXPO_PUBLIC_* env vars.
 *
 * All values are placeholders by default. Real values are wired in by
 * setting the env vars in the Replit Secrets pane (or .env for local
 * dev) and rebuilding the app. The mobile UI degrades gracefully when
 * RevenueCat is not configured — see `lib/revenuecat.ts`.
 *
 * Required for production:
 *   EXPO_PUBLIC_RC_IOS_API_KEY     — public Apple SDK key from RC dashboard
 *   EXPO_PUBLIC_RC_ANDROID_API_KEY — public Android SDK key from RC dashboard
 *   EXPO_PUBLIC_RC_ENTITLEMENT_ID  — entitlement identifier (e.g. "premium")
 *   EXPO_PUBLIC_RC_PRODUCT_MONTHLY — Apple/Google product id, monthly
 *   EXPO_PUBLIC_RC_PRODUCT_YEARLY  — Apple/Google product id, yearly
 *
 * The product ids are placeholders ("murcielingo_premium_monthly_v1" /
 * "_yearly_v1") until real Apple/Google products exist; the SDK will
 * happily fall back to whatever offerings the RevenueCat dashboard
 * actually returns.
 */

export const RC_CONFIG = {
  iosApiKey: process.env.EXPO_PUBLIC_RC_IOS_API_KEY ?? "",
  androidApiKey: process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY ?? "",
  entitlementId: process.env.EXPO_PUBLIC_RC_ENTITLEMENT_ID ?? "premium",
  productIds: {
    monthly:
      process.env.EXPO_PUBLIC_RC_PRODUCT_MONTHLY ??
      "murcielingo_premium_monthly_v1",
    yearly:
      process.env.EXPO_PUBLIC_RC_PRODUCT_YEARLY ??
      "murcielingo_premium_yearly_v1",
  },
} as const;

export function isRevenueCatConfigured(): boolean {
  return Boolean(RC_CONFIG.iosApiKey || RC_CONFIG.androidApiKey);
}
