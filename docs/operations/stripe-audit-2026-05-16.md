# Stripe audit and sandbox catalog cleanup

Status: completed sandbox cleanup; gaps remain
Confirmation date: 2026-05-16
Scope: Stripe test account, checkout flow, webhook flow, Neon payment state

## Environment verified

- Repo: `/home/alexander/repos/integrity2025`
- Branch: `main`
- Neon CLI account: `info@fascinantedigital.com`
- Neon project: `Cleaning` / `weathered-dust-25507627`
- Neon production branch: `production` / `br-plain-boat-ah4f0xxs` / host `ep-silent-smoke-ahlnixiw.c-3.us-east-1.aws.neon.tech`
- Neon preview branch: `preview` / `br-rough-smoke-ahvt50u2` / host `ep-bitter-wave-ahvs4pwe.c-3.us-east-1.aws.neon.tech`
- Local `.env.local` `DATABASE_URL`: points to Neon `preview`, not `production`
- Stripe account: `acct_1RKilKPOvJjRKFm4`
- Stripe mode: `test`
- Business profile: `Integrity Clean Solutions LLC sandbox`
- Charges enabled: true
- Payouts enabled: true
- Local envs present: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

No live Stripe key was used for this cleanup.

## Correction after Neon CLI verification

Initial Neon reads were made through `.env.local` `DATABASE_URL`, which points to the Neon `preview` branch. A follow-up Neon CLI verification confirmed the project and branch mapping:

- `neon projects list --org-id org-soft-frost-85325085`: project `Cleaning` uses proxy host `c-3.us-east-1.aws.neon.tech`.
- `neon branches list --project-id weathered-dust-25507627`: `production` and `preview` branches exist.
- `neon connection-string production ...`: resolves to `ep-silent-smoke-ahlnixiw.c-3.us-east-1.aws.neon.tech`.
- `neon connection-string preview ...`: resolves to `ep-bitter-wave-ahvs4pwe.c-3.us-east-1.aws.neon.tech`, matching `.env.local`.

The active services and base prices below were checked against both `production` and `preview`; they currently match. Checkout status counts differ between branches, so operational payment-state statements must specify branch.

## Stripe catalog after cleanup

Active products now match the serious service catalog subset used by the app:

| Product | service_slug | Active price |
| --- | --- | --- |
| Regular Cleaning | `regular-cleaning` | `price_1SuLMjPOvJjRKFm4t6tMhL4p` - USD 120.00 |
| Deep Cleaning | `deep-cleaning` | `price_1SuLMmPOvJjRKFm4NewL3Uym` - USD 150.00 |
| Move-In / Move-Out Cleaning | `move-in-out-cleaning` | `price_1SuLMnPOvJjRKFm40nZ13T8D` - USD 200.00 |
| Post-Construction Cleaning | `post-construction-cleaning` | `price_1SuLMpPOvJjRKFm4kMJsFuss` - USD 230.00 |
| Carpet Cleaning | `carpet-cleaning` | `price_1SuLMoPOvJjRKFm4DircBcke` - USD 90.00 |
| Commercial Cleaning | `commercial-cleaning` | `price_1SuLMoPOvJjRKFm4XhLcxU2X` - USD 160.00 |

Cleanup performed:

- Archived 18 active test products named `myproduct` with no `metadata.service_slug`.
- Archived their 18 active USD 15.00 prices.
- Archived one duplicate active price on each serious product, keeping the newest active price.

This follows Stripe's documented API pattern: archive products and prices by setting `active=false`. Stripe documents that prices cannot be deleted through the API and that synced product catalogs should keep exactly one active price per product when pricing is fixed.

## Rollback

To rollback the sandbox cleanup, set `active=true` again on the archived product IDs and price IDs.

Archived throwaway products:

- `prod_Tv8yz9ujHqYjqc` / `price_1SxIggPOvJjRKFm4binRtxnl`
- `prod_Tv8mSXpS48d57A` / `price_1SxIUYPOvJjRKFm4K0jZANwi`
- `prod_TuMP01sYDy0sUe` / `price_1SwXgSPOvJjRKFm4UNYc9QuF`
- `prod_TuMO0Z8h4mTUPw` / `price_1SwXgCPOvJjRKFm4zghPYjdn`
- `prod_TuLzIM8ABDhZog` / `price_1SwXHxPOvJjRKFm4XYgRcZOV`
- `prod_TuLw6yieGKnlX4` / `price_1SwXEhPOvJjRKFm46kQShRMv`
- `prod_TuLvgm2tcKjdyo` / `price_1SwXDtPOvJjRKFm46WxuvgmN`
- `prod_TuLukUByLmnByJ` / `price_1SwXCnPOvJjRKFm4bCUNgYil`
- `prod_TuLtugHkyd7Ahg` / `price_1SwXBePOvJjRKFm445rccG3U`
- `prod_TuLsVTbcgZop1m` / `price_1SwXAKPOvJjRKFm43PEytWbu`
- `prod_TuLrEfa5JeuxXC` / `price_1SwX9aPOvJjRKFm4ebKuBzPL`
- `prod_TuLqmTKEBZdRpl` / `price_1SwX8NPOvJjRKFm4QDYIYcMU`
- `prod_TuLl8Nj1T2yoQq` / `price_1SwX4MPOvJjRKFm44LLMDhxB`
- `prod_TuLi7kfsD9oFk9` / `price_1SwX19POvJjRKFm4ASbfzgeW`
- `prod_TuLhVylXLqz2ib` / `price_1SwX0GPOvJjRKFm4KogOMw4b`
- `prod_TuLeQItnhLdBiK` / `price_1SwWxWPOvJjRKFm4wY3usViM`
- `prod_TuLb04xBulDM4F` / `price_1SwWuBPOvJjRKFm423vX21gZ`
- `prod_TuLNk4Zz9X0kLM` / `price_1SwWgwPOvJjRKFm4fGZgNW1g`

Archived duplicate serious prices:

- `price_1StFQ1POvJjRKFm4U5XpHxu7`
- `price_1StFPuPOvJjRKFm4lRiI8cu0`
- `price_1StFPnPOvJjRKFm4nfozt7Tk`
- `price_1StFPfPOvJjRKFm4FNMZd1y2`
- `price_1StFPZPOvJjRKFm4K2gYFKuc`
- `price_1StFPRPOvJjRKFm4DGghCexk`

## Gaps found

### Resolved decision: Stripe owns base service prices

For base service checkout, Stripe Product/Price is the source of truth. The customer-facing operational flow is Stripe Dashboard -> Product catalog -> service product -> create a new one-time price -> archive the old price.

For calculated quotes and custom prices, Checkout uses inline `price_data`, which Stripe documents as the pattern for prices coming from an external database or calculation instead of stored Stripe Prices.

Confirmed via Neon CLI-generated connection strings for both `production` and `preview` on 2026-05-16.

Neon still has base price fields, but those are not the source of truth for base service checkout after this decision. Current Stripe-vs-Neon mismatches are expected until Neon fields are either repurposed as display fallbacks or synced from Stripe:

| Service | Neon base | Stripe active price |
| --- | ---: | ---: |
| `regular-cleaning` | USD 112.00 | USD 120.00 |
| `deep-cleaning` | USD 245.00 | USD 150.00 |
| `move-in-out-cleaning` | USD 300.00 | USD 200.00 |
| `post-construction-cleaning` | USD 250.00 | USD 230.00 |
| `carpet-cleaning` | USD 40.00 | USD 90.00 |
| `commercial-cleaning` | USD 160.00 | USD 160.00 |

Checkout now fails closed for a base service if Stripe does not expose exactly one active product for the service slug and exactly one active price for that product. This avoids silently charging stale Neon prices.

## Client price-change SOP

For base service prices, the client changes prices in Stripe only:

1. Open Stripe Dashboard.
2. Go to Product catalog.
3. Open the service product, for example `Deep Cleaning`.
4. Add a new one-time USD price with the new amount.
5. Archive the previous active price.
6. Confirm the product still has `metadata.service_slug` matching the app service slug.
7. Confirm the product has exactly one active price.

Do not edit code or Neon for base service price changes. Stripe does not let used Price amounts be edited in place; the documented pattern is to create a new price and archive the old one.

If the product has zero active prices or more than one active price, checkout should fail closed for that base service until the catalog is fixed.

## Implemented architecture: Stripe -> Neon -> Website

Base service price changes now follow this source-of-truth path:

```text
Client edits Stripe Product catalog
  -> Stripe sends product/price webhook
  -> /api/webhooks/stripe verifies signature and persists event
  -> webhook syncs the active Stripe Price into public.services
  -> services catalog cache and service paths are revalidated
  -> website reads updated precio_base from Neon
```

Runtime contract:

- Stripe Product must be active.
- Stripe Product must have `metadata.service_slug`.
- The `service_slug` must match `public.services.slug`.
- Product must have exactly one active one-time USD Price.
- `public.services.precio_base` is the website read model synced from Stripe.
- `public.service_pricing_rules.min_price_cents` is synced to the same amount so quote floor pricing follows the base price.
- Sync metadata is stored on `public.services`: `stripe_product_id`, `stripe_price_id`, `stripe_price_currency`, `stripe_price_synced_at`, `stripe_price_sync_status`, and `stripe_price_sync_error`.

Fail-closed behavior:

- If Stripe has no active price for a base service, checkout returns `503`.
- If Stripe has more than one active price for a base service, checkout returns `503`.
- If the Stripe Product is inactive or missing `service_slug`, the webhook does not invent a price.
- The last valid `precio_base` is kept in Neon, but the sync status records the problem.

Required migration before deploy:

```bash
psql "$DATABASE_URL" -f db/migrations/018_add_stripe_service_price_sync.sql
```

Rollback migration:

```bash
psql "$DATABASE_URL" -f db/migrations/018_add_stripe_service_price_sync.down.sql
```

Manual reconciliation:

```bash
pnpm run stripe:sync-prices
pnpm run stripe:sync-prices -- --apply
```

The first command is read-only and reports Stripe vs Neon differences. The second command applies Stripe active product/price state into Neon. Use this after adding a webhook late, recovering missed product/price events, or before live launch.

### P0: `airbnb-cleaning` exists in Neon but not in Stripe

Neon `production` and `preview` both have active service `airbnb-cleaning` at USD 180.00, but Stripe test has no active product with `service_slug=airbnb-cleaning`.

With Stripe as source of truth for base prices, base checkout for `airbnb-cleaning` must remain unavailable until the matching Stripe product and active price exist.

Follow-up decision: `airbnb-cleaning` is quote-only for now. The public UI must collect short-term-rental turnover details and create a lead/quote request instead of sending the customer directly to Stripe Checkout. This avoids charging a fixed price before laundry, restocking, same-day turnover timing, bed count, and property size are reviewed.

### Resolved: Checkout create response and smoke tests alignment

`POST /api/checkout` now returns `{ sessionId, url }`. Frontend callers use `url` directly when available and keep `GET /api/checkout-session/:sessionId` as a fallback.

This keeps smoke tests and runtime behavior aligned while preserving backward compatibility with the existing session lookup endpoint.

### P1: Webhook hardening improved, but old unprocessed events remain

The current route now persists events, locks unprocessed events, marks failures, verifies checkout update row counts, and handles refunds/disputes. However, the DB still contains 14 old unprocessed Stripe events from 2026-02-02 to 2026-02-03.

Those events should be manually classified as replay, ignore, or already handled before being marked processed.

### P1: Provider side-effect retry is incomplete

`integration_events` currently has no failed rows, and HubSpot payment retry support exists. Resend and Meta CAPI sends are recorded, but automatic retry is intentionally not implemented yet to avoid duplicate emails or duplicate conversion events.

### P2: Stripe event payload retention is still undefined

Raw Stripe payloads are stored in `stripe_webhook_events.payload`. There is no documented retention or redaction policy.

## Production and live Stripe readiness checklist

Do not switch production traffic to Stripe live until these are complete.

### 1. Confirm production ownership and scope

- Confirm target domain: `https://integritycleansolutions.com`.
- Confirm target Neon branch: `production` / `br-plain-boat-ah4f0xxs`.
- Confirm target Vercel environment: Production.
- Confirm target Stripe account is the real live business account, not `Integrity Clean Solutions LLC sandbox`.
- Confirm who owns manual rollback during launch.

### 2. Stripe live account setup

- Complete Stripe live account onboarding.
- Confirm live `charges_enabled=true`, `payouts_enabled=true`, and `details_submitted=true`.
- Configure business profile, statement descriptor, support email/phone, branding, and Checkout branding.
- Enable only the payment methods the business actually wants.
- Confirm Stripe tax behavior decision. Current app does not enable Stripe Tax in Checkout.

### 3. Live keys and Vercel environment variables

Set these only in Vercel Production after confirming the live account:

- `STRIPE_SECRET_KEY=sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` from the live webhook endpoint

Do not reuse test webhook secrets for live. Do not paste live secrets into local docs or chat.

### 4. Live webhook endpoint

Create a live Stripe webhook endpoint:

- URL: `https://integritycleansolutions.com/api/webhooks/stripe`
- Required events:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `charge.dispute.created`
  - `product.created`
  - `product.updated`
  - `product.deleted`
  - `price.created`
  - `price.updated`
  - `price.deleted`

Stripe recommends only listening to events required by the integration.

### 5. Pricing source of truth

Current decision after this audit: Stripe owns base service prices. Neon/the quote calculator owns custom calculated quote amounts.

Before live:

- Keep `airbnb-cleaning` quote-only unless the business defines fixed turnover packages and add-ons.
- Confirm every live base service product has `metadata.service_slug`.
- Confirm every live base service product has exactly one active one-time USD price.
- Archive old live prices instead of leaving multiple active prices.
- Confirm quote calculator produces expected final totals.
- Confirm whether deposits, tips, fees, taxes, and parking surcharges are included before payment or handled manually.

### 6. Production smoke path

Use preview first, then production:

```bash
pnpm run lint
pnpm run type-check
pnpm run build
BASE_URL="https://<vercel-preview-url>" pnpm exec playwright test tests/smoke/stripe-critical.spec.ts --project=chromium --reporter=list
```

For live production, run a controlled real low-value payment or owner-approved service payment, then verify:

- Stripe payment succeeded in live dashboard.
- `checkout_sessions.status = 'paid'` in Neon production.
- `stripe_webhook_events.processed = true` for the live event.
- Customer/team emails were sent or intentionally suppressed during test.
- HubSpot deal/contact sync succeeded or has retryable `integration_events` entries.
- Meta CAPI event is either disabled for the smoke or traceable with a safe event ID.

### 7. Rollback

Fast rollback options:

- Revert Vercel Production env vars to test keys only if production checkout is intentionally disabled from real users.
- Prefer disabling checkout UI or routing users to contact/manual quote while investigating.
- Keep Neon production records as source of truth; do not delete failed checkout rows.
- If a live payment succeeds but webhook fails, reconcile Stripe session/payment intent back into `checkout_sessions`.

### 8. Remaining hardening before full confidence

- Add a Stripe/Neon reconciliation script for live sessions.
- Keep the Stripe catalog reconciliation script in the release checklist.
- Add replay/backfill tooling for stale `stripe_webhook_events`.
- Define retention/redaction for raw Stripe payloads.
- Add alerting for webhook failures and high `redirected` stale checkout count.
- Add explicit live launch runbook with exact owner, date, envs changed, smoke result, and rollback decision.

## Verification commands used

```bash
node # Stripe account/catalog read via stripe-node using .env.local
node # Stripe sandbox archive operation using stripe-node using .env.local
node # Stripe catalog verification after cleanup
neon me --no-analytics --no-color -o json
neon projects list --org-id org-soft-frost-85325085 --no-analytics --no-color -o json
neon branches list --project-id weathered-dust-25507627 --no-analytics --no-color -o json
neon databases list --project-id weathered-dust-25507627 --no-analytics --no-color -o json
node # Neon read-only operational audit via pg using Neon CLI-generated connection strings for production and preview
git status --short --branch
```

## Official sources checked

- Stripe webhooks: https://docs.stripe.com/webhooks
- Stripe products and prices management: https://docs.stripe.com/products-prices/manage-prices
- Stripe Checkout lifecycle: https://docs.stripe.com/payments/checkout/how-checkout-works
- Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests
