# Stripe Webhook Hardening Roadmap

Status: partially implemented; validated gaps remain
Confirmation date: 2026-05-10
Scope: `POST /api/webhooks/stripe`, `checkout_sessions`, `stripe_webhook_events`, provider side effects

## Current Findings

The database and webhook route already have the foundation for idempotency, but the processing model is incomplete.

Validated local smoke on 2026-05-10:

- Stripe CLI `listen` must run against the same Stripe account as `STRIPE_SECRET_KEY`. The logged-in CLI account can differ from the local API key account; in that case payments complete in Stripe but local webhooks never arrive.
- Use `STRIPE_API_KEY="$STRIPE_SECRET_KEY" stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local smoke when validating the app key configured in `.env.local`.
- A real test-mode Checkout payment completed end-to-end after using the matching account listener.
- `checkout_sessions` reached `status = 'paid'`, `paid_at` was set, `stripe_payment_intent_id` was stored, and payment/team email timestamps were set.
- `checkout.session.completed` and `payment_intent.succeeded` were persisted and marked processed.
- Meta CAPI purchase side effect succeeded.
- Resend customer confirmation and team notification succeeded.
- HubSpot payment sync failed because this HubSpot portal is missing custom properties referenced by the payment enrichment path.
- Follow-up smoke after mapping HubSpot data to existing properties succeeded: `payment_completed_sync`, Meta CAPI, and Resend side effects all recorded `succeeded`.

Current DB state on 2026-05-10:

- `checkout_sessions`: 44 rows
- Status counts: `created` 3, `redirected` 33, `paid` 8
- `stripe_webhook_events`: 14 old events with `processed = false`
- Unprocessed old events include `checkout.session.completed`, `payment_intent.succeeded`, `charge.succeeded`, `charge.updated`, `product.created`, and `price.created`

## Critical Gaps

### P0: Duplicate retry can skip an unprocessed event

Current code inserts into `stripe_webhook_events`, then returns early on duplicate `event_id`.

If the first attempt persisted the event but failed before `processed = true`, a Stripe retry for the same event returns success as a duplicate and never processes the event.

Required behavior:

- If duplicate and `processed = true`, return `200`.
- If duplicate and `processed = false`, acquire a lock and process or schedule retry.

### P0: DB persistence failure still continues processing

Current code logs DB persistence failure and continues. That means Stripe can receive a success response even when the event was not durably recorded.

Required behavior:

- If the app cannot persist the webhook event, return non-2xx so Stripe retries.
- Only process an event after it has a durable DB record or a controlled recovery path.

### P0: Event status fields are not used as a real state machine

`stripe_webhook_events` has `processed`, `attempt_count`, `next_retry_at`, `locked_by`, `locked_at`, and `error`, but the route mostly only inserts and marks processed.

Required behavior:

- Mark event as processing with lock.
- Increment attempts.
- On failure, store `error` and `next_retry_at`.
- On success, set `processed = true`, `processed_at = now()`, clear lock.

### P0: Checkout payment update is not verified

`checkout.session.completed` updates `checkout_sessions` by `stripe_session_id`, but does not verify whether a row was actually updated.

Required behavior:

- Use `stripe_session_id` and/or `metadata.checkout_id`.
- If no checkout row is found, mark webhook event failed and alert.
- Set `paid_at = now()` when payment is completed.

### P1: Provider side effects are not tracked separately

The webhook sends Meta CAPI, HubSpot, and Resend inside the Stripe handler, but failures are caught and then the Stripe event can still be marked processed.

Required behavior:

- Keep Stripe payment state separate from provider side effects.
- Write `integration_events` rows for Meta, HubSpot, and Resend side effects.
- Do not block payment truth on HubSpot/Resend/Meta, but do make those failures retryable and visible.

Validated remaining gap:

- Resolved 2026-05-10: payment sync maps optional details to existing HubSpot fields instead of custom properties.
- Optional service details now go to `deal.description` and `contact.message`.
- The old endpoint that created custom HubSpot properties is disabled.

### P1: Stripe local smoke requires account alignment

Stripe CLI authentication is not the same source of truth as the app's `STRIPE_SECRET_KEY`.

Required behavior:

- Document the account ID used by each Stripe environment without storing secrets.
- Add a local smoke preflight that compares `stripe accounts.retrieve()` from `STRIPE_SECRET_KEY` with the account used by `stripe listen`.
- Prefer `STRIPE_API_KEY="$STRIPE_SECRET_KEY" stripe listen ...` for app-local webhook smoke.
- Add a reconciliation report for `checkout_sessions.status != 'paid'` where Stripe says the session is paid.

### P1: Refunds and disputes are not handled

The production readiness doc already calls out `charge.refunded` and `charge.dispute.created`, but the route does not handle them.

Required behavior:

- Handle `charge.refunded` and update checkout/payment state.
- Handle `charge.dispute.created` and update checkout/payment state.
- Add alert queries for refunds/disputes.

### P1: Old unprocessed events need a replay/backfill decision

There are old unprocessed events in `stripe_webhook_events`. They should not be manually flipped to processed without deciding whether their business effects already happened.

Required behavior:

- Add a read-only report script for stale unprocessed Stripe events.
- Add a replay/backfill script that processes events idempotently.
- For very old events, manually classify each event as replay, ignore, or already handled with an audit note.

### P2: Payload retention is not defined

Stripe payloads are stored as JSONB with no retention policy.

Required behavior:

- Decide retention period for raw payloads.
- Keep event ID, type, status, processed timestamps, and safe metadata long term.
- Optionally archive or redact old raw payloads.

## Implementation Roadmap

1. Refactor `POST /api/webhooks/stripe` into small functions:
   - `verifyStripeEvent`
   - `persistStripeEvent`
   - `acquireStripeEventLock`
   - `processStripeEvent`
   - `markStripeEventProcessed`
   - `markStripeEventFailed`
2. Fix duplicate behavior so unprocessed duplicate events can be processed.
3. Fail fast with non-2xx when event persistence fails.
4. Use `app_acquire_webhook_lock` or replace it with a clearer SQL helper.
5. Make `checkout.session.completed` verify row update and set `paid_at`.
6. Persist Meta/HubSpot/Resend side effects into `integration_events`.
7. Add handling for `charge.refunded` and `charge.dispute.created`.
8. Add Stripe replay/backfill script for unprocessed DB events.
9. Add smoke tests for:
   - signed valid Stripe event
   - duplicate processed event
   - duplicate unprocessed event
   - checkout row missing
   - refund/dispute handlers
10. Decide and document retention/redaction for `stripe_webhook_events.payload`.

## Verification Plan

Local/pipeline checks:

```bash
pnpm run type-check
pnpm run build
BASE_URL="http://localhost:3000" pnpm exec playwright test tests/smoke/api.spec.ts --project=chromium --reporter=list
```

Operational checks:

```bash
psql "$DATABASE_URL" -f scripts/ops/observability-checks.sql
```

Stripe-specific future checks:

- Use Stripe CLI to forward signed events to local webhook.
- Use signed synthetic events only for non-business side-effect handlers.
- Use Stripe test mode fixtures for payment lifecycle smoke.

## Official Sources

Confirmed on 2026-05-10:

- Stripe webhooks: https://docs.stripe.com/webhooks
- Process undelivered webhook events: https://docs.stripe.com/webhooks/process-undelivered-events
