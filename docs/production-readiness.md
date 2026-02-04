# Production Readiness Doc (Monolith Next.js)

Audience: Engineering + Operations
Scope: Frontend + Backend (Next.js), Neon, Stripe Checkout, Webhooks, Resend
Status date: 2026-02-03

---

## 1) System Summary (current state)

### Core flow
UI (Quote)  API  Stripe Checkout  Webhook  DB

- UI builds quote from DB-driven catalog (services, frequencies, pricing rules, addons).
- `POST /api/checkout` creates Stripe Checkout Session and persists `checkout_sessions` in DB.
- `POST /api/webhooks/stripe` persists Stripe events in `stripe_webhook_events`, updates `checkout_sessions` on payment completion.
- `GET /api/checkout-session/:id` reads from DB and falls back to Stripe.

### Source of truth
- **Neon DB** is the source of truth for services, pricing rules, frequencies, addons, and settings.
- **Stripe** is payment processor only; it does not own business logic.

### What works end-to-end
- Checkout session creation (API + DB persistence) is stable.
- Webhook idempotency + persistence is implemented.
- Quote pricing is dynamic using DB rules (frequency + sqft/rooms + extras + tax).

### Known fragilities
- Legacy UI fallbacks can still generate invalid slugs (e.g. `/quote/undefined`).
- `/api/catalog` is a critical dependency for UI; failures degrade UX.
- Some hardcoded lists remain (slugs, featured services, fallback images).

---

## 2) Production Risks (brutally honest)

### Deployment/runtime
- Cold starts can impact dynamic routes and API endpoints.
- Env config gaps break checkout (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

### Database
- Integrity depends on proper constraints and indexes.
- Cleanup policies not defined (sessions/logs will grow indefinitely).

### Stripe edge cases
- Refunds/disputes not fully handled.
- Expired sessions and delayed webhooks require revalidation logic.

### Observability
- Logs exist but not structured and no alerting thresholds defined.

### Email deliverability
- SPF/DKIM/DMARC not verified in repo.
- No email log table or retry path.

### Compliance
- Privacy/Terms exist but cancellation/refund policies may be incomplete.

---

## 3) Go/No-Go Checklist

### Go (must be true)
- [ ] `DATABASE_URL` set in production
- [ ] `STRIPE_SECRET_KEY` set in production
- [ ] `STRIPE_WEBHOOK_SECRET` set in production
- [ ] `RESEND_API_KEY` set in production
- [ ] Checkout session creation works in prod
- [ ] Webhook events persist and mark `checkout_sessions` as `paid`
- [ ] `/api/catalog` loads all active services
- [ ] Pricing rules exist for each active service
- [ ] Four frequencies exist for each active service
- [ ] Addons return correctly in `/api/addons`
- [ ] All service pages load without 404 images

### No-Go (blockers)
- [ ] Checkout fails with “Servicio no encontrado”
- [ ] Webhook does not update payment status
- [ ] `/quote/undefined` still appears
- [ ] Stripe session URL missing in `/api/checkout-session/:id`

---

## 4) SOPs (Incident Response)

### SOP: Stripe  Webhooks/Payments/Disputes
1. Check Stripe status page for incidents.
2. Verify webhook listener in logs (event received).
3. Query DB:
   - `select status, stripe_session_id from checkout_sessions order by created_at desc limit 5;`
   - `select event_id, type, processed from stripe_webhook_events order by received_at desc limit 5;`
4. If payment succeeded in Stripe but DB not updated:
   - manually re-fetch Stripe session by ID
   - replay webhook or mark checkout status manually
5. For disputes/refunds:
   - update `checkout_sessions.status` to `refunded` or `disputed`
   - log incident

### SOP: Neon  DB Down
1. Validate Neon status page.
2. If DB unreachable:
   - return friendly error page (no checkout)
   - disable checkout temporarily
3. Once recovered:
   - re-run `/api/catalog` sanity check
   - verify latest checkouts were recorded

### SOP: Resend  Emails Failed
1. Verify Resend API status.
2. Check logs for failed email responses.
3. If failures:
   - log to `email_log` (recommended)
   - retry manually after service is restored
4. Notify ops if repeated failures > 15 minutes

---

## 5) Production-Grade Minimal Hardening

### Database
- Add/validate constraints:
  - `services.slug` unique + not null
  - FKs for frequencies, rules, addons
  - indexes on slug, stripe_session_id, event_id

### Stripe
- Ensure `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created` are handled.
- Confirm `stripe_webhook_events` unique by event_id.

### Email
- Verify SPF/DKIM/DMARC in DNS.
- Add `email_log` table for delivery tracking.

### Security
- Rate limit `/api/checkout` and `/api/webhooks/stripe`.
- Validate payload size and schema.

---

## 6) Backlog (Prioritized)

### Quick Wins (1 days)
- Remove remaining slug fallbacks; enforce slug validity.
- Add `/api/catalog` error UI states.
- Add `email_log` + minimal retry logic.
- Add explicit Stripe `charge.refunded` handling.
- Add `checkout_sessions` cleanup for expired sessions.

### Medium (1 weeks)
- Centralize validation schema for checkout payloads.
- Formalize pricing settings and validation (no fallback defaults).
- Add admin minimal view for bookings.
- Add webhook replay tool (manual endpoint or script).

### Hard (3 weeks)
- Add multi-tenant structure: tenant_id in all core tables.
- Tenant-aware config for services, pricing, and branding.
- Admin ops panel for support and manual recovery.

---

## 7) Multi-Tenant Preparation (Minimal Scope)

- Add `tenant_id` columns to core tables.
- Resolve tenant by domain/subdomain.
- `app_settings` per tenant.
- Stripe keys per tenant (future step).

---

## 8) Current Verdict

- **Ready for controlled production** with guardrails and monitoring.
- **Not enterprise-ready** until resilience + lifecycle + admin + security hardening are defined.

