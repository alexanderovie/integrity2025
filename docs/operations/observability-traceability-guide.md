# Observability and Traceability Guide

Status: accepted baseline
Project: Integrity Clean Solutions
Confirmation date: 2026-05-10
Scope: Next.js app, Neon, HubSpot, Resend, Stripe, Meta CAPI, Vercel, Sentry/OpenTelemetry

## Decision

Neon is the source of truth for business events. External platforms are operational views or delivery systems, not owners of business state.

- Neon owns leads, payment state, provider sync status, retries, dead letters, and audit history.
- HubSpot is the CRM mirror used to operate contacts/deals after the lead is already persisted.
- Resend is the email delivery provider; delivery lifecycle must be reflected back into Neon.
- Stripe is the payment processor; Stripe webhook events must be persisted and processed idempotently.
- Meta CAPI is the conversion delivery provider; event IDs and delivery responses must be traceable from Neon.
- Sentry is the technical observability provider for errors, releases, performance, and alerts. It is not the source of truth for business state.
- OpenTelemetry is the instrumentation standard we can use to keep traces portable across providers.

If HubSpot, Resend, Meta, Stripe webhook processing, Sentry, or an observability exporter fails, the business record must remain in Neon with a status that can be retried or reviewed.

## Current Baseline

The repo already has useful pieces, but they are not yet unified:

- `lead_submissions` persists contact form submissions before provider sync.
- `stripe_webhook_events` persists Stripe webhook events with idempotency fields.
- DB query wrapper logs slow and failed queries as JSON.
- `src/lib/observability/fallback-log.ts` logs fallback activation events.
- Several API routes still log directly with `console.*`.
- No `instrumentation.ts` or OpenTelemetry/Sentry runtime configuration exists in source.
- No durable webhook/event ledger exists yet for HubSpot, Resend, or Meta CAPI.
- No alert thresholds or dashboards are defined in code/docs.

## Core Pattern

Every inbound business event follows this order:

```text
Inbound request or webhook
  -> validate and rate limit
  -> create or load Neon business record
  -> create provider operation record
  -> call provider
  -> update Neon status and provider IDs
  -> emit structured log/span with correlation IDs
  -> retry/dead-letter if provider failed
```

The rule is simple: save first, sync second.

## Required IDs

All logs, DB events, provider metadata, and Sentry/OpenTelemetry contexts should use these IDs where available:

| Field | Owner | Purpose |
| --- | --- | --- |
| `request_id` | App | Correlates one HTTP request across logs/traces. |
| `trace_id` | OpenTelemetry/Sentry | Correlates spans across app/provider calls. |
| `lead_submission_id` | Neon | Correlates one lead lifecycle. |
| `integration_event_id` | Neon | Correlates one provider operation attempt. |
| `provider` | App | `hubspot`, `resend`, `stripe`, `meta`, etc. |
| `provider_event_id` | Provider | Stripe event ID, Resend webhook ID, HubSpot object/event ID, Meta event ID. |
| `provider_object_id` | Provider | HubSpot contact/deal ID, Resend email ID, Stripe session/payment ID. |
| `idempotency_key` | App/Provider | Prevents duplicate processing. |

Do not use email, phone, full name, address, or message body as primary correlation fields in logs.

## Target Data Model

Keep the existing provider-specific tables when they are already useful, but add a generic provider operation ledger for cross-provider tracing.

Recommended table: `integration_events`

Minimum fields:

```text
id uuid primary key
created_at timestamptz
updated_at timestamptz
request_id text
trace_id text
lead_submission_id uuid null references lead_submissions(id)
provider text not null
operation text not null
direction text not null -- outbound, inbound
status text not null -- pending, processing, succeeded, failed, retry_scheduled, dead_letter
attempt_count int not null default 0
next_retry_at timestamptz
processed_at timestamptz
provider_event_id text
provider_object_id text
idempotency_key text
payload_hash text
error_code text
last_error text
metadata jsonb
```

Provider payloads should be minimized. Store hashes and safe metadata by default. Store raw payloads only when operationally necessary, with retention rules.

## Logging Standard

Use one server logger wrapper instead of raw `console.*` in app routes.

Required fields:

```text
timestamp
level
event
request_id
trace_id
route
method
status_code
duration_ms
lead_submission_id
integration_event_id
provider
operation
provider_event_id
provider_object_id
error_code
error_name
```

Redaction rules:

- Never log secrets, tokens, connection strings, API keys, cookies, or authorization headers.
- Do not log raw request bodies by default.
- Do not log full PII in runtime logs. Prefer record IDs and provider IDs.
- If an error object may contain provider request data, normalize it before logging.

## Sentry and OpenTelemetry

Use Sentry pragmatically for operational visibility, but do not make Sentry the business ledger.

Recommended staged approach:

1. Add `@sentry/nextjs` for exceptions, releases, performance, and alerts.
2. Configure `beforeSend`/scrubbing so PII and secrets are not sent.
3. Tag events with `request_id`, `lead_submission_id`, `provider`, `operation`, and release.
4. Add `src/instrumentation.ts` following Next.js instrumentation conventions.
5. Add OpenTelemetry-compatible spans for DB, HubSpot, Resend, Stripe, and Meta provider calls.

Sentry is acceptable because it is replaceable. Neon keeps the durable business state; OpenTelemetry keeps instrumentation portable.

## Provider Rules

### HubSpot

- Persist lead in Neon before calling HubSpot.
- Store HubSpot contact/deal IDs in Neon.
- Persist every outbound HubSpot operation in `integration_events`.
- Persist inbound HubSpot webhook events before processing.
- Verify `X-HubSpot-Signature-v3` and reject stale timestamps.
- Do not let HubSpot become the only place where lead state exists.
- Runtime HubSpot CRM calls use date-versioned API paths under `2026-03`.
- Operational HubSpot endpoints, such as `/api/hubspot/pipelines`, require `INTERNAL_API_SECRET` or `REVALIDATE_SECRET`.

### Resend

- Persist intended email send before sending when email matters to the workflow.
- Store Resend email IDs in Neon.
- Ingest Resend webhooks through `/api/webhooks/resend`.
- Verify Svix headers with `RESEND_WEBHOOK_SECRET`.
- Use `svix-id` as the idempotency key for webhook delivery.
- Persist raw webhook payloads in `resend_webhook_events`.
- Track latest email lifecycle by Resend `email_id` in `resend_email_deliveries`.
- Track lifecycle states such as sent, delivered, bounced, complained, delivery_delayed, failed, suppressed, opened, and clicked.
- Do not automatically retry email sends from delivery webhooks. Bounces, complaints, and suppressions require review or suppression logic first.

### Stripe

- Keep `stripe_webhook_events` as a provider-specific ledger.
- Persist the webhook event before processing business effects.
- If event persistence fails, do not mark the event as safely processed.
- Use idempotent processing: ignore already processed events and return success for duplicates.
- Add replay/backfill tooling for undelivered or unprocessed events.
- Fix schema drift between webhook code and migrations before relying on production deploys.

### Meta CAPI

- Generate and persist stable `event_id` values.
- Use the same event ID for browser/server deduplication where applicable.
- Store Meta delivery result fields that are safe and useful, including `fbtrace_id`.
- Tie CAPI events back to `lead_submission_id` or checkout/session IDs.

## Retry and Dead-Letter Rules

Retries should be automated and reviewable.

- Retry transient provider failures: network errors, 429, 5xx, temporary provider outages.
- Do not retry permanent validation/auth errors indefinitely.
- Use exponential backoff with max attempts.
- Move exhausted records to `dead_letter` with `last_error`, `attempt_count`, and owner action.
- Run retries through Vercel Cron or a controlled operations script.
- Every retry must be idempotent.

Current implementation:

- `scripts/ops/integration-events-retry-report.sql` is the read-only review report.
- `scripts/ops/schedule-integration-event-retries.sql` classifies failed rows as `retry_scheduled` or `dead_letter` without calling providers.
- `POST /api/ops/integration-retries` is protected by `INTERNAL_API_SECRET` or `REVALIDATE_SECRET`.
- The first automatic retry path is intentionally narrow: HubSpot `payment_completed_sync` from Stripe sessions.
- The runner claims rows with database locks, calls Stripe to retrieve the Checkout Session, then uses the same HubSpot sync path as the Stripe webhook.
- Resend and Meta retries are not automatic yet, because blind retries can duplicate emails or conversion events.

Manual dry run:

```bash
curl -sS -X POST "$APP_URL/api/ops/integration-retries" \
  -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"dryRun":true,"limit":10}'
```

Manual execution:

```bash
curl -sS -X POST "$APP_URL/api/ops/integration-retries" \
  -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"maxAttempts":5}'
```

## Alerts and Dashboards

Minimum alerts:

- Any spike in 5xx for `/api/contact`, `/api/checkout`, or webhooks.
- `lead_submissions.status = 'partial_failure'` above threshold.
- `hubspot_status = 'hubspot_failed'` above threshold.
- `resend_status = 'email_failed'` above threshold.
- Stripe webhook events unprocessed for more than the accepted SLA.
- Resend bounce/complaint increase.
- Meta CAPI failures or missing `fbtrace_id`.
- No leads received during expected business window.

Minimum dashboards:

- Lead intake volume by source/page/UTM.
- Lead provider sync status.
- Email delivery status.
- Stripe webhook processing status.
- Provider latency and error rates.
- Retry/dead-letter queue.

Initial read-only SQL checks live in `scripts/ops/observability-checks.sql`.

## Implementation Order

1. Fix schema drift in migrations for fields used by Stripe webhook code.
2. Add `integration_events` migration.
3. Extend `lead_submissions` pattern to newsletter, help, join-our-team, and quote/checkout flow.
4. Add central server logger with redaction and correlation fields.
5. Add Sentry for errors, performance, releases, and alerts.
6. Add Resend webhooks and email lifecycle tracking.
7. Add automated retry workers for `integration_events.status = 'retry_scheduled'`.
8. Add retry/dead-letter cron or operations script.
9. Add `src/instrumentation.ts` and OpenTelemetry-compatible spans.
10. Add dashboards/queries/runbooks for common incidents.

## No-Drift Rules

- Any new provider integration must write a durable Neon event before or during the provider call.
- Any new webhook must have signature validation, idempotency, persistence, and replay/retry guidance.
- Any new business flow must define its source-of-truth table and provider mirror behavior.
- Any new alert must document threshold, owner action, and verification query.
- Any schema field used in code must exist in migrations.
- Any external behavior decision must cite official docs and include confirmation date.
- Do not store project-specific operational decisions only in chat.

## Verification Commands

Use these after implementation changes:

```bash
pnpm run type-check
pnpm run build
BASE_URL="http://localhost:3000" pnpm exec playwright test tests/smoke/api.spec.ts --project=chromium --reporter=list
```

For migration-related changes, also verify against the target database before deploy and document the exact command used.

## Official Sources

Confirmed on 2026-05-10:

- Next.js instrumentation: https://nextjs.org/docs/app/guides/instrumentation
- Vercel logs: https://vercel.com/docs/logs
- Vercel drains: https://vercel.com/docs/drains
- Vercel cron jobs: https://vercel.com/docs/cron-jobs/manage-cron-jobs
- Sentry OpenTelemetry support for Node.js: https://docs.sentry.io/platforms/node/performance/instrumentation/opentelemetry
- Stripe undelivered webhook processing: https://docs.stripe.com/webhooks/process-undelivered-events
- HubSpot request validation: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation
- Resend webhooks: https://resend.com/docs/webhooks/introduction
- OpenTelemetry logs data model and correlation concepts: https://opentelemetry.io/docs/specs/otel/logs/data-model/

Confirmed on 2026-05-11 for Resend lifecycle:

- Resend webhook management: https://resend.com/docs/dashboard/webhooks/body-parameters
- Resend webhook storage guidance: https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data
- Resend webhook verification: https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
