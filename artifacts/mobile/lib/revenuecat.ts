/**
 * Mobile RevenueCat service.
 *
 * Wraps `react-native-purchases` so the rest of the app interacts with
 * a small, typed surface. Every entry point is safe to call when
 * RevenueCat is not configured — they no-op or return null and never
 * crash the app. Free access keeps working in that case.
 *
 * Identity model: we identify the RevenueCat customer with the Clerk
 * user id. The same id is sent to the API server's RevenueCat webhook
 * sync, so entitlements granted on-device can be reconciled into our
 * `user_entitlements` table without any extra mapping table lookup.
 */

import { Platform } from "react-native";
import { RC_CONFIG, isRevenueCatConfigured } from "./revenuecatConfig";

type PurchasesModule = typeof import("react-native-purchases").default;
type PurchasesPackage = import("react-native-purchases").PurchasesPackage;
type PurchasesOffering = import("react-native-purchases").PurchasesOffering;
type CustomerInfo = import("react-native-purchases").CustomerInfo;

let Purchases: PurchasesModule | null = null;
let initialised = false;
let initPromise: Promise<void> | null = null;
let currentUserId: string | null = null;

function loadSdk(): PurchasesModule | null {
  if (Purchases) return Purchases;
  try {
    // Lazy require so the dev preview doesn't blow up if the native
    // module isn't linked. In Expo Go the SDK auto-runs in Preview API
    // Mode and returns mock data instead of crashing.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Purchases = require("react-native-purchases").default as PurchasesModule;
    return Purchases;
  } catch (err) {
    console.warn("[RevenueCat] SDK not available:", err);
    return null;
  }
}

export async function initRevenueCat(userId?: string | null): Promise<void> {
  if (initialised) {
    if (userId && userId !== currentUserId) await identifyUser(userId);
    return;
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const sdk = loadSdk();
    if (!sdk) return;

    const apiKey =
      Platform.OS === "ios" ? RC_CONFIG.iosApiKey : RC_CONFIG.androidApiKey;

    if (!apiKey) {
      console.info(
        "[RevenueCat] No API key configured for",
        Platform.OS,
        "— running in unconfigured mode (free access only).",
      );
      return;
    }

    try {
      sdk.setLogLevel?.("warn" as never);
      await sdk.configure({ apiKey, appUserID: userId ?? null });
      initialised = true;
      currentUserId = userId ?? null;
    } catch (err) {
      console.warn("[RevenueCat] configure() failed:", err);
    }
  })();

  return initPromise;
}

export async function identifyUser(userId: string): Promise<void> {
  const sdk = loadSdk();
  if (!sdk || !initialised) {
    await initRevenueCat(userId);
    return;
  }
  if (userId === currentUserId) return;
  try {
    await sdk.logIn(userId);
    currentUserId = userId;
  } catch (err) {
    console.warn("[RevenueCat] logIn failed:", err);
  }
}

export async function logoutUser(): Promise<void> {
  const sdk = loadSdk();
  if (!sdk || !initialised) return;
  try {
    await sdk.logOut();
    currentUserId = null;
  } catch (err) {
    // logOut throws if the user is anonymous — not actionable.
    console.info("[RevenueCat] logOut skipped:", err);
  }
}

export interface OfferingPackage {
  identifier: string;
  productIdentifier: string;
  priceString: string;
  period: "monthly" | "yearly" | "other";
  raw: PurchasesPackage;
}

export interface Offering {
  identifier: string;
  monthly: OfferingPackage | null;
  yearly: OfferingPackage | null;
  all: OfferingPackage[];
}

function packageType(pkg: PurchasesPackage): "monthly" | "yearly" | "other" {
  // RC normalises common subscription periods on `packageType`.
  const t = (pkg.packageType ?? "").toString().toUpperCase();
  if (t.includes("MONTH")) return "monthly";
  if (t.includes("YEAR") || t.includes("ANNUAL")) return "yearly";
  return "other";
}

function mapPackage(pkg: PurchasesPackage): OfferingPackage {
  const period = packageType(pkg);
  const product = pkg.product;
  return {
    identifier: pkg.identifier,
    productIdentifier: product?.identifier ?? "",
    priceString: product?.priceString ?? "",
    period,
    raw: pkg,
  };
}

export async function getCurrentOffering(): Promise<Offering | null> {
  const sdk = loadSdk();
  if (!sdk || !initialised) return null;
  try {
    const offerings = await sdk.getOfferings();
    const current: PurchasesOffering | null = offerings.current ?? null;
    if (!current) return null;
    const all = current.availablePackages.map(mapPackage);
    return {
      identifier: current.identifier,
      monthly: all.find((p) => p.period === "monthly") ?? null,
      yearly: all.find((p) => p.period === "yearly") ?? null,
      all,
    };
  } catch (err) {
    console.warn("[RevenueCat] getOfferings failed:", err);
    return null;
  }
}

export interface PurchaseResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
  customerInfo?: CustomerInfo;
}

export async function purchasePackage(
  pkg: OfferingPackage,
): Promise<PurchaseResult> {
  const sdk = loadSdk();
  if (!sdk || !initialised) {
    return { ok: false, error: "RevenueCat is not available." };
  }
  try {
    const result = await sdk.purchasePackage(pkg.raw);
    return { ok: true, customerInfo: result.customerInfo };
  } catch (err: unknown) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, error: e?.message ?? "Purchase failed." };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  const sdk = loadSdk();
  if (!sdk || !initialised) {
    return { ok: false, error: "RevenueCat is not available." };
  }
  try {
    const customerInfo = await sdk.restorePurchases();
    return { ok: true, customerInfo };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return { ok: false, error: e?.message ?? "Restore failed." };
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const sdk = loadSdk();
  if (!sdk || !initialised) return null;
  try {
    return await sdk.getCustomerInfo();
  } catch (err) {
    console.warn("[RevenueCat] getCustomerInfo failed:", err);
    return null;
  }
}

export function hasActiveEntitlement(
  info: CustomerInfo | null,
  entitlementId: string = RC_CONFIG.entitlementId,
): boolean {
  if (!info) return false;
  const ent = info.entitlements?.active?.[entitlementId];
  return Boolean(ent);
}

export { isRevenueCatConfigured, RC_CONFIG };
