/**
 * Stripe client + helpers.
 *
 * Stripe credentials are intentionally optional in development so the API
 * server can boot without them. Any code path that *needs* Stripe should
 * call `getStripe()` (which throws a clean 503-shaped error) rather than
 * reading the env directly.
 */

import Stripe from "stripe";
import { logger } from "./logger";

// Pin a known stable API version. We cast to the SDK's expected literal
// union to avoid coupling to whichever SDK minor we're on.
type StripeApiVersion = ConstructorParameters<typeof Stripe>[1] extends
  | { apiVersion?: infer V }
  | undefined
  ? V
  : string;
const STRIPE_API_VERSION = "2025-09-30.clover" as StripeApiVersion;

let cachedClient: Stripe | null = null;
let warned = false;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new StripeNotConfiguredError();
  }
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
  }
  return cachedClient;
}

export class StripeNotConfiguredError extends Error {
  constructor() {
    super(
      "Stripe is not configured. Set STRIPE_SECRET_KEY (and related price/webhook secrets) to enable web subscriptions.",
    );
    this.name = "StripeNotConfiguredError";
  }
}

export function warnIfStripeMissing(): void {
  if (warned) return;
  warned = true;
  const missing: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!process.env.STRIPE_PRICE_PREMIUM_MONTHLY)
    missing.push("STRIPE_PRICE_PREMIUM_MONTHLY");
  if (!process.env.STRIPE_PRICE_PREMIUM_YEARLY)
    missing.push("STRIPE_PRICE_PREMIUM_YEARLY");
  if (missing.length > 0) {
    logger.warn(
      { missing },
      "Stripe env vars missing — web subscriptions will be disabled until configured.",
    );
  }
}

export interface StripePriceConfig {
  monthly: string | null;
  yearly: string | null;
  publishableKey: string | null;
}

export function getStripePriceConfig(): StripePriceConfig {
  return {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null,
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? null,
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? null,
  };
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new StripeNotConfiguredError();
  }
  return secret;
}
