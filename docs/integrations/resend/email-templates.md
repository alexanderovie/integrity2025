# Resend Email Templates

Confirmed on 2026-05-11 against React Email 6.1.1, Resend 6.9.2, and current official docs.

## Decision

Emails are rendered from versioned React Email templates in `src/emails/`.

Runtime API routes must not build customer-facing HTML strings inline. They render a template to both:

- `html`
- `text`

and send both through Resend.

## Why

For a local services business, email is part of the sales and operations flow:

- Lead notifications need to be readable by the team.
- Customer confirmations need to build trust.
- Payment emails need to make the next step clear.
- Marketing emails need unsubscribe and business identity controls.

## Templates

- `contact.team_notification`
- `contact.confirmation`
- `help.team_notification`
- `job_application.team_notification`
- `job_application.confirmation`
- `newsletter.welcome`
- `newsletter.team_notification`
- `payment.confirmation`
- `payment.team_notification`

Current template version:

```text
2026-05-11.4
```

## Local Preview

```bash
pnpm email:dev
```

Open:

```text
http://localhost:3001
```

React Email scans `src/emails`.

## Render Static HTML

```bash
pnpm email:render payment.confirmation
```

Default output:

```text
tmp/email-previews/payment.confirmation.html
```

## Send A Test Email

Test sends are allowlisted. Add test recipients to:

```text
EMAIL_TEST_ALLOWLIST
```

Then run:

```bash
pnpm email:test payment.confirmation --to owner@example.com --dry-run
pnpm email:test payment.confirmation --to owner@example.com
```

The script also allows `TO_EMAIL`, `CONTACT_EMAIL`, and `HELP_EMAIL` because those are operator/team addresses.

## Required Runtime Envs

- `RESEND_API_KEY`
- `FROM_EMAIL`
- `TO_EMAIL`
- `CONTACT_EMAIL` optional override
- `HELP_EMAIL` optional override
- `EMAIL_FOOTER_ADDRESS` strongly recommended for commercial/marketing email compliance
- Newsletter unsubscribe URLs are generated per subscriber by `marketing_subscriptions`; do not use a shared fake unsubscribe URL.
- `EMAIL_TEST_ALLOWLIST` for manual test sends

## Serious Rules

- Never send test emails to real customers.
- Every template must render `html` and `text`.
- Every provider send should use a Resend idempotency key.
- Every provider send should write `templateName` and `templateVersion` into `integration_events.metadata`.
- Marketing emails must not point to a fake unsubscribe route. Newsletter emails use tokenized `/api/marketing/unsubscribe` links backed by `marketing_subscriptions`.
- Newsletter sends must include both the visible unsubscribe link and the `List-Unsubscribe` / `List-Unsubscribe-Post` headers for one-click unsubscribe support.
- Transactional contact confirmations should not send the customer back to the same form as the primary CTA. Use a clear next step: reply with details or call the business.

## Official Sources

- React Email render utility: https://react.email/docs/utilities/render
- React Email CLI: https://react.email/docs/cli
- React Email 6 update guidance: https://react.email/docs/getting-started/updating-react-email
- Resend email API: https://resend.com/docs/api-reference/emails
- Resend idempotency keys: https://resend.com/docs/dashboard/emails/idempotency-keys
- Resend unsubscribe guidance: https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails
- Resend custom headers: https://resend.com/docs/dashboard/emails/custom-headers
- FTC CAN-SPAM compliance guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
