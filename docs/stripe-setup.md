# Stripe Setup (Web Subscriptions)

The web app (`artifacts/murcielago`) uses **Stripe Checkout + Stripe Billing
+ Stripe Customer Portal** for subscriptions. The mobile app continues to
use the App Store / Play Store via RevenueCat — **never put Stripe
Checkout inside the iOS / Android binaries**, it violates store policy.

This guide walks through configuring Stripe in **test mode** (sandbox)
first, then promoting to live keys.

---

## 1. Create products & prices in Stripe

In the Stripe Dashboard (top-right toggle on **Test mode**):

1. **Products → Add product** → "Murciélingo Premium".
2. Add **two recurring prices**:
   - Monthly (e.g. $9.99 / month)
   - Yearly (e.g. $79.99 / year)
3. Copy the **price IDs** (`price_…`) — you'll need them for env vars.

## 2. Configure the Customer Portal

Stripe Dashboard → **Settings → Billing → Customer portal**

- Enable "Customers can cancel subscriptions" → end of billing period.
- Enable "Customers can update payment methods".
- Enable "Customers can view invoice history".
- Save.

## 3. Create a webhook endpoint

Stripe Dashboard → **Developers → Webhooks → Add endpoint**

- **Endpoint URL:**
  `https://<your-replit-domain>/api/stripe/webhook`
  (For local Replit dev, use the public preview URL.)
- **Events to send** (subscribe to all of these):
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- After creation, click **Reveal signing secret** — this is your
  `STRIPE_WEBHOOK_SECRET` (`whsec_…`).

## 4. Set environment variables / secrets

Use the Replit Secrets panel (or the agent's secret request flow) to set:

| Key                              | Where it comes from                         |
| -------------------------------- | ------------------------------------------- |
| `STRIPE_SECRET_KEY`              | Developers → API keys → Secret key (`sk_…`) |
| `STRIPE_WEBHOOK_SECRET`          | The webhook endpoint's signing secret       |
| `STRIPE_PRICE_PREMIUM_MONTHLY`   | The monthly price ID (`price_…`)            |
| `STRIPE_PRICE_PREMIUM_YEARLY`    | The yearly price ID (`price_…`)             |
| `VITE_STRIPE_PUBLISHABLE_KEY`    | Developers → API keys → Publishable (`pk_…`)|

The app **boots without these vars** in development; the API server logs
a single warning at startup, the `/api/stripe/config` endpoint returns
`{ enabled: false }`, and the Pricing page shows a banner saying
"Stripe is not enabled yet". Checkout is the only thing blocked.

## 5. Verify the flow (test mode)

1. Restart the API server workflow so it picks up the new envs.
2. Open the web app → `/pricing`. The "Upgrade" button should be
   enabled and the warning banner gone.
3. Click **Upgrade** → you'll be redirected to Stripe Checkout.
   Use card **`4242 4242 4242 4242`**, any future expiry, any CVC.
4. After payment, Stripe redirects to `/billing/success?session_id=…`.
   The page polls `/api/subscription` until entitlements flip — usually
   a couple of seconds after the webhook lands.
5. Visit `/billing/manage` → click **Open Stripe customer portal** to
   confirm cancellation / payment method changes work.

## 6. Promote to live mode

1. Re-create the product, prices, and webhook in **Live mode**.
2. Replace all five env vars with the live versions (`sk_live_…`,
   `pk_live_…`, live `price_…`, live `whsec_…`).
3. Restart the API server.

---

## How it maps to the database

All subscription state lands in the existing provider-agnostic tables
(`lib/db/src/schema/subscriptions.ts`):

- `customer_mapping` — links a Clerk `userId` to a Stripe `cus_…`.
- `user_subscriptions` — one row per Stripe subscription, with the
  resolved internal `planId` (`premium`), status, and period end.
- `user_entitlements` — denormalized per-user entitlement keys
  (`lessons.unlimited`, `grammar.full`, …) sourced from the active
  Stripe plan.
- `subscription_events` — append-only audit log of every webhook event
  (raw payload preserved). Unique on `(provider, provider_event_id)`
  so duplicate Stripe deliveries are no-ops.

The same tables also receive RevenueCat writes from the mobile flow.
The frontend always reads `/api/subscription` — it never knows or cares
which provider granted the entitlement.

## Architecture notes

- The webhook route is mounted **before** `express.json()` with
  `express.raw({ type: "application/json" })` so the signature can be
  verified against the raw body.
- Checkout passes `metadata.userId` (Clerk user id) on both the session
  and the subscription, so we can resolve the user even before the
  customer mapping is written.
- `findOrCreateCustomer` re-uses an existing Stripe customer by
  `customer_mapping`, so a user who cancels and resubscribes keeps the
  same `cus_…` and their billing history.
- Entitlements are written with `source = "plan:premium"`, so manual
  / promo grants written with a different `source` prefix are not
  wiped when a Stripe sub flips state.
