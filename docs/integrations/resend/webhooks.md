# Resend Webhooks

Confirmed on 2026-05-11 against the Resend SDK/docs and the connected Resend account.

## Decision

Neon remains the durable source of truth. Resend is the delivery provider and its webhooks are used to mirror email lifecycle state back into Neon.

Implemented endpoint:

```text
POST /api/webhooks/resend
```

Production endpoint configured in Resend:

```text
https://integritycleansolutions.com/api/webhooks/resend
```

Tracked events:

- `email.sent`
- `email.delivered`
- `email.delivery_delayed`
- `email.bounced`
- `email.complained`
- `email.failed`
- `email.suppressed`
- `email.opened`
- `email.clicked`

## Security

- Resend signs webhook requests with Svix headers.
- The app verifies `svix-id`, `svix-timestamp`, and `svix-signature`.
- Runtime secret: `RESEND_WEBHOOK_SECRET`.
- `svix-id` is the idempotency key.
- Raw payloads are persisted only after signature verification.

## Current Provider State

- Resend webhook exists for the production endpoint.
- It is currently `enabled`.
- It was activated on 2026-05-11 after PR #41 was merged, production migrations were applied, the production deployment was ready, and a signed production smoke test passed.
- `RESEND_WEBHOOK_SECRET` is configured in Vercel Production, Preview, and Development.

## Activation

If the webhook is disabled or recreated, verify the production route exists and enable it:

```bash
set -a
source .env.local
set +a
node scripts/ops/resend-webhook-status.mjs status
node scripts/ops/resend-webhook-status.mjs enable
```

Rollback:

```bash
set -a
source .env.local
set +a
node scripts/ops/resend-webhook-status.mjs disable
```

## Verification

Local smoke with signed synthetic payload:

- Valid signature returns `200`.
- Replayed `svix-id` returns `200` with `duplicate: true`.
- Invalid signature returns `400`.
- `resend_webhook_events` stores the raw provider event.
- `resend_email_deliveries` stores the latest lifecycle state by `email_id`.
- Inbound webhook processing writes `integration_events.provider = 'resend'`.

Operational report:

```bash
psql "$DATABASE_URL" -f scripts/ops/observability-checks.sql
```

## Non-Goals

- Do not automatically resend failed emails from webhook events.
- Do not retry bounced, complained, failed, or suppressed addresses without explicit suppression/review rules.
- Do not store the signing secret in Git or docs.

## Official Sources

- https://resend.com/docs/dashboard/webhooks/introduction
- https://resend.com/docs/dashboard/webhooks/body-parameters
- https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data
- https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
