# Google Ads / Retell / Call Tracking Audit

Date: 2026-06-08

Scope: read-only audit of the Integrity Clean Solutions repository and public
site for call tracking, Retell-style voice automation, and Google Ads call
measurement readiness.

Update: 2026-06-09

Retell is a repo-specific candidate for Integrity Clean Solutions only. This is
not a workstation-wide or company-wide default for Alexander's other products,
where Twilio may remain the primary telephony provider. Reusable lessons from
this audit should be documented as provider-neutral call attribution patterns,
not as "Retell by default".

## Account Context Observed

- Google Ads customer visible in UI: `463-253-2437`
- Business: `Integrity Clean Solutions - Residential & Commercial Cleaning in
  Orlando, FL`
- Google Ads account settings observed by Alexander:
  - Auto-tagging: enabled
  - Call reporting: enabled
  - Default call conversion action: `Calls from ads`
  - Google tag for Ads: `AW-18004402142`, `GT-TQSSQ345`
  - Google tag quality: no recent data

## Repository Evidence

- Public phone number used across the site: `+1-800-930-0532`
- Landing header uses `tel:+18009300532`.
- Commercial landing JSON-LD publishes `telephone: "+1-800-930-0532"`.
- Global organization/business JSON-LD publishes `telephone:
  "+1-800-930-0532"`.
- HubSpot private app metadata lists support phone `+18009300532`.
- Email templates link to `tel:+18009300532`.
- No Retell, Twilio, Vapi, voice-agent, phone-webhook, or call-webhook
  integration was found in the Integrity repo.
- API routes include contact, help, HubSpot, Meta, Resend, Stripe, Sanity, and
  ops routes. No call provider webhook route exists.
- `lead_submissions` stores phone and UTM attribution fields. As of
  2026-06-09, Google Ads click identifiers (`gclid`, `gbraid`, `wbraid`) are
  captured client-side after marketing consent and included in contact lead
  payloads under `raw_payload.googleAdsAttribution`. They are not yet promoted
  to first-class `lead_submissions` columns.
- Google Tag Manager code exists, but uses
  `NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-5TF5L8PQ'`. This GTM container remains
  unverified for Integrity.
- As of 2026-06-09, direct Google Ads tag support was added with public
  defaults:
  - tag ID: `AW-18004402142`
  - quote form conversion: `AW-18004402142/Tx05CKP7-bscEN6_lYlD`
  - env overrides:
    `NEXT_PUBLIC_GOOGLE_ADS_TAG_ID` and
    `NEXT_PUBLIC_GOOGLE_ADS_QUOTE_FORM_CONVERSION_SEND_TO`

## Public Site Evidence

- `https://integritycleansolutions.com/commercial-cleaning-orlando` renders
  visible and linked phone CTAs for `(800) 930-0532`.
- Public HTML did not show Retell, Twilio, Vapi, `AW-18004402142`,
  `GT-TQSSQ345`, or `GTM-5TF5L8PQ` in the initial server-rendered HTML.
- The site currently presents the number as a static business phone number. The
  public site alone does not prove whether the number is owned by Retell,
  forwarded through Retell, or hosted by another phone provider.

## Google Ads Website Conversion Implementation

Date: 2026-06-09

Scope: code-only implementation after the Google Ads UI conversion action
`Quote form submitted` was created manually. Google Ads API was not used.

Implemented:

- `src/components/analytics/GoogleAdsTag.tsx`
  - Loads `gtag.js` for `AW-18004402142`.
  - Reuses the existing marketing-consent gate used by GTM, Meta, and HubSpot.
  - Captures `gclid`, `gbraid`, and `wbraid` into local storage only after
    marketing consent, or in development.
- `src/lib/analytics/google-ads.ts`
  - Stores/retrieves Google click attribution.
  - Sends the Google Ads event snippet equivalent:
    `gtag('event', 'conversion', { send_to: 'AW-18004402142/Tx05CKP7-bscEN6_lYlD', value: 1, currency: 'USD' })`.
- Contact-style lead forms that POST to `/api/contact` now include
  `googleAdsAttribution` in the JSON payload and fire the Google Ads conversion
  after the API returns success:
  - `/quote/[service]` quote-only branch
  - contact page form
  - header contact modal

Classification:

- `estandar oficial confirmado`: Google tag + event snippet for a website
  conversion action.
- `decision local pragmatica`: using the existing consent gate and storing
  click IDs in `raw_payload` rather than adding first-class DB columns in this
  change.

Known gaps:

- The Google Ads tag will not load for users who reject marketing cookies.
- `gclid`, `gbraid`, and `wbraid` are not yet queryable as first-class
  `lead_submissions` columns. Add a schema migration before offline conversion
  import/reporting depends on those fields.
- Google website call conversion tracking was not implemented yet because the
  phone snippet and exact replacement behavior should be copied from Google Ads
  UI and tested against the visible number.
- Enhanced conversions remain disabled pending owner/compliance approval.

### Preview Verification

Date: 2026-06-09

Verified in isolated Vercel Preview deployment, created from a clean temporary
worktree so unrelated Retell/SEO/speculation-rules changes in the local repo did
not enter the deployment.

Preview URL:

- `https://integrity2025-cxeeoyzhy-alexanderoviedo.vercel.app`

Checks:

- `pnpm run type-check`: passed
- `pnpm run lint`: passed
- `pnpm run build`: passed
- Vercel Preview build: passed
- Browser smoke:
  - `/contact-us?gclid=test-gclid-preview` returns 200.
  - Accepting marketing cookies persists consent as `1` after reload.
  - Google Ads script `gtag/js?id=AW-18004402142` loads.
  - `integrity_google_ads_attribution` stores the test `gclid`.
  - Intercepted contact-form submit includes `googleAdsAttribution.gclid`.
  - `dataLayer` receives the conversion event with
    `send_to: AW-18004402142/Tx05CKP7-bscEN6_lYlD`.
  - The smoke blocked the outbound `pagead/conversion` request to avoid sending
    a test conversion to Google Ads.

Consent bug fixed during verification:

- Before this verification, the background `GET /api/consent` could overwrite a
  freshly accepted local consent value back to `0`.
- `GET /api/consent` now reads the `ics_consent_marketing` cookie.
- The client-side background consent fetch no longer overwrites localStorage
  when the browser already has an explicit `0` or `1`.

Vercel Preview env gap:

- A first Vercel preview deployment failed before Google Ads verification with:
  `projectId can only contain only a-z, 0-9 and dashes`.
- The failure came from Sanity page-data collection for `/api/sanity/posts`.
- `vercel env ls` showed global Preview Sanity env vars plus several
  branch-specific Preview Sanity env vars.
- The isolated CLI preview did not come from one of those Git branches, so it
  used the global Preview Sanity env configuration.
- For this verification only, the preview deploy used deployment-scoped public
  overrides:
  `NEXT_PUBLIC_SANITY_PROJECT_ID=l4t851dy` and
  `NEXT_PUBLIC_SANITY_DATASET=production`.
- Durable follow-up: fix the global Preview Sanity env value in Vercel, or use a
  Git branch with correct branch-scoped Preview env vars before treating Preview
  as the release gate.

## Official Evidence

- Google Ads supports separate call conversion types: calls from ads, calls to a
  phone number on the website, mobile phone-number clicks, clicks on call ads
  and assets, and imported call conversions.
  Source: https://support.google.com/google-ads/answer/6100664
- Google Ads website phone-call conversion tracking requires the global tag and
  a phone snippet that can replace the website number with a Google forwarding
  number.
  Source: https://support.google.com/google-ads/answer/6095883
- Google forwarding numbers are intermediaries that route to the actual
  business number while enabling call reporting. Google warns not to promote a
  Google forwarding number outside Ads call reporting / website call conversion
  tracking because it can change or be reassigned.
  Source: https://support.google.com/google-ads/answer/2382961
- Google Ads offline conversion imports can track offline sales or valuable
  events, including over-the-phone outcomes. The API flow depends on Google Ads
  API setup, conversion actions, and identifiers such as `gclid`, `gbraid`, or
  `wbraid`, or enhanced conversions for leads with hashed first-party data.
  Source: https://developers.google.com/google-ads/api/docs/conversions/upload-offline
- Retell API access uses API keys with `Authorization: Bearer YOUR_API_KEY` for
  REST API requests, SDK integrations, and webhook endpoints. Retell states
  workspace API keys share the same permission level, so the key should not be
  treated as read-only unless Retell workspace permissions prove otherwise.
  Source: https://docs.retellai.com/accounts/api-keys-overview
- Retell's MCP server is a remote MCP endpoint at `https://mcp.retellai.com` and
  can be configured with a bearer token environment variable such as
  `RETELL_API_KEY`. Retell recommends least privilege, read-first workflows,
  review of destructive actions, and care with PII in call transcripts.
  Source: https://docs.retellai.com/get-started/mcp-server
- Retell webhooks must be verified with the `x-retell-signature` header and the
  Retell API key. Current Retell docs explicitly require the raw request body,
  not parsed and re-serialized JSON, because whitespace/key ordering changes can
  break verification.
  Source: https://docs.retellai.com/features/secure-webhook
- Next.js App Router Route Handlers can receive third-party webhooks and read
  the raw body with `await request.text()` without Pages Router `bodyParser`
  configuration.
  Source: https://nextjs.org/docs/app/api-reference/file-conventions/route#webhooks

## Serious Repo / Pattern Evidence

- Vendor-maintained Retell custom LLM Node demo handles `call_started`,
  `call_ended`, and `call_analyzed` webhooks and calls `Retell.verify`.
  The demo is useful for event naming, but it uses an Express JSON body pattern,
  so the current Retell raw-body guidance above should supersede it for a
  Next.js App Router webhook.
  Source: https://raw.githubusercontent.com/RetellAI/retell-custom-llm-node-demo/5ac3c6540cb8e39aeeef72c3719aa2e76a7d9085/src/server.ts
- A Next.js App Router example in `voice-ai-analytics` validates
  `x-retell-signature` against `await request.text()`, parses/validates the
  payload after verification, and stores call data in a database.
  Source: https://raw.githubusercontent.com/Isiah-Odhiambo/voice-ai-analytics/7b7606b013020aae8e75f420179cbd880abe0319/src/app/api/webhooks/retell/route.ts
- A Next.js starter example also uses `await request.text()` with
  `Retell.verify(rawBody, apiKey, signature)` and then upserts call lifecycle
  state by `call_id`.
  Source: https://raw.githubusercontent.com/Hoanganhvu123/nextjs-retell-ai-voice-starter-site/a61fdaf0213675c5146750a6ff90ece7152f243a/app/api/retell/webhook/route.ts

The repo pattern to follow for Integrity is therefore not "copy the OSS app".
It is:

1. Use official Retell raw-body signature verification.
2. Keep a thin Next.js Route Handler.
3. Persist inbound provider events in Neon first.
4. Map provider events into Integrity's existing `integration_events` /
   `lead_submissions` / HubSpot mirror model.
5. Keep Google Ads attribution separate from Retell call handling until
   identifiers and conversion definitions are confirmed.

## Retell Webhook Routing Decision

Date: 2026-06-09

Retell official docs expose a single `webhook_url` field on a voice agent. It is
not documented as an array of URLs. Retell also supports account-level webhooks,
but an agent-level `webhook_url`, when set, receives that agent's events and the
account-level webhook is not triggered for that agent.

Retell inbound call/SMS webhooks are a separate number-level feature for routing
or enriching an inbound call before/while it starts. They should not be confused
with the agent post-call event webhook that sends `call_started`, `call_ended`,
and `call_analyzed`.

Classification: `estandar oficial confirmado`

Decision for this repo:

- Do not overwrite the existing Retell agent webhook just to add this repo.
- Keep polling sync as the safe bridge while ownership of the existing webhook
  is unclear.
- If this repo becomes the durable Retell receiver, use one Retell agent webhook
  URL pointing to a verified Next.js Route Handler or provider-neutral webhook
  gateway.
- If multiple systems need the same Retell event, implement fan-out in our
  receiver after signature verification and durable persistence, not by trying
  to register multiple Retell agent webhooks.

## Classification

Primary label: `gap de medicion confirmado`

The current setup may measure calls from Google Ads through Google's call
reporting, but the repo/site does not currently leverage a Retell-style call
provider integration. If the number is actually a Retell number, the website is
not yet using Retell webhooks, call analysis, transcripts, lead qualification,
or offline conversion import.

Secondary label: `decision local pragmatica`

Retell, if adopted, should be a local provider decision for this repo. Do not
promote Retell into global workstation docs or other product repos unless a
separate Twilio-vs-Retell provider decision is benchmarked and approved.

## Retell API Read-Only Audit

Date: 2026-06-09

Scope: Retell API key supplied locally through `RETELL_API_KEY` for this client
workspace only. The token value was not printed, saved, committed, or passed in
command arguments. API calls were read-only and sanitized in memory before
printing.

Official endpoints used:

- `GET https://api.retellai.com/list-agents`
- `GET https://api.retellai.com/v2/list-phone-numbers?limit=100`
- `POST https://api.retellai.com/v3/list-calls`

All three returned HTTP 200.

### Sanitized Findings

- Retell workspace shape:
  - 73 agent versions observed.
  - 55 Integrity-related agent versions observed.
  - 23 Integrity-related unique agents observed.
  - 2 phone numbers observed in the workspace.
  - 1 phone number appears relevant to Integrity.
- The public website phone number `+1-800-930-0532` is not currently listed as a
  Retell-owned/imported phone number.
- Recent Retell call records do show `+1-800-930-0532` as the source number in
  multiple Integrity-related calls to a Retell number ending in `8053`.
- The relevant Retell number ending in `8053` is `retell-twilio` and is bound to
  inbound agent `agent_d9...3170`, version `0`, weight `1`.
- The relevant phone number does not have an inbound number-level webhook
  configured.
- The relevant Integrity agents do have agent-level webhooks configured, mostly
  targeting `ai.primeplanbuild.com` or `ai.primeplanbuild.com:5678`.
- Recent relevant calls returned from the API:
  - 6 Integrity-relevant calls in the sampled window.
  - 4 `phone_call` and 2 `web_call`.
  - 2 marked `call_successful=true`; 4 marked `call_successful=false`.
  - 4 had `+1-800-930-0532` as the source number.
  - Newest sampled relevant call: `2026-06-08T14:08:18.919Z`.
  - Oldest sampled relevant call: `2026-05-28T22:38:21.930Z`.
- Relevant agent analysis fields exist and are rich enough for lead routing:
  examples include service type, property type, zip code, preferred day/time,
  intent, SMS/email consent, quoted price, and follow-up actions.

### Interpretation

The current Retell workspace is not empty. There is already an Integrity call
automation setup, and the Retell number ending in `8053` is actively associated
with Integrity-related calls.

However, this does not prove that Google Ads calls or website phone clicks are
currently routed through Retell with attribution:

- The site's public `+1-800-930-0532` number is not the Retell number in the
  phone-number inventory.
- Seeing `+1-800-930-0532` as `from_number` in Retell calls suggests forwarding,
  test calls, or caller-ID behavior, but it is not enough to prove the Ads ->
  Retell -> lead attribution path.
- Agent-level webhooks currently point outside this repo/app. The Integrity
  Next.js app has no `/api/webhooks/retell` route, so Retell events are not
  entering this repo's Neon/HubSpot/Ads attribution pipeline.

### Data And Compliance Gaps

Retell official docs state that:

- `data_storage_setting = everything` stores sensitive call data such as call
  logs, transcripts, recordings, caller/callee IDs, knowledge-base retrieval
  logs, dynamic variables, and metadata.
  Source: https://docs.retellai.com/accounts/privacy-disable
- `data_storage_retention_days = null` means data is kept indefinitely by
  default.
  Source: https://docs.retellai.com/accounts/data-retention
- Secure URLs make recording/log URLs expire after 24 hours; when not enabled,
  Retell-generated recording/log links do not expire by default.
  Source: https://docs.retellai.com/accounts/signed-secure-url

Observed Integrity-related Retell agent settings:

- `data_storage_setting = everything`
- `data_storage_retention_days = null`
- `opt_in_signed_url = false`
- `language = multi`
- `timezone = null`

Classification: `gap de compliance/datos`

This is not a reason to stop using Retell, but it should be resolved before
feeding Retell output into Ads optimization or HubSpot automation at scale. At
minimum, the owner should decide:

1. Whether recordings and full transcripts should be retained.
2. How many days Retell should retain call/chat data.
3. Whether secure signed URLs should be enabled.
4. Whether PII scrubbing should remove email, address, phone, and names before
   downstream sync.
5. Whether the agent should include an explicit AI/recording/transcription
   disclosure.

### HubSpot Write Idempotency Gap

The polling script stores `hubspot_contact_id`, `hubspot_call_id`, and
`hubspot_deal_id` to avoid duplicating HubSpot records on normal reruns.
However, any provider write can still succeed in HubSpot and fail before Neon
stores the returned ID. In that failure window, a later rerun could create a
duplicate HubSpot call or deal.

Classification: `gap de idempotencia provider`

This does not block a controlled manual test, but it means production automation
should add a stronger idempotency strategy before running unattended. Options:

1. Search HubSpot for a prior Retell call marker before creating a call.
2. Use a HubSpot-supported external ID/custom unique property if approved for
   the CRM schema.
3. Move to a webhook/job model with explicit retry state and manual dead-letter
   review for uncertain provider writes.

### Caller Identity Gap

The 2026-06-09 manual test call proved that Retell can classify a phone call as
a qualified quote lead without email. It also revealed a caller identity risk:
the latest test call's Retell `from_number` ended in `0532`, matching the known
business/public number. A read-only HubSpot search found multiple exact contact
matches for that number. Treating that value as the customer identity would
associate the lead to the wrong CRM record.

Classification: `gap de identidad telefonica`

Script guardrail added on 2026-06-09:

- `RETELL_BUSINESS_PHONE_NUMBERS` can list business-owned numbers that must not
  be used as customer identity.
- Default excluded numbers include the Retell target number ending in `8053` and
  the known public business number ending in `0532`.
- If a qualified call has no email and only a business-owned phone number, the
  script stores the call in Neon but marks HubSpot as
  `skipped_missing_contact_identity`.

This keeps Retell/Neon analytics intact while preventing false HubSpot contact
associations. To fully sync a phone-only call to HubSpot, Retell must receive a
real caller phone number or the caller must provide a phone/email during the
call.

### Production Ownership Gap

There are many historical Integrity agent versions and several similarly named
agents. The phone number ending in `8053` points to agent `agent_d9...3170`,
version `0`, while newer versions of the same agent name exist.

Classification: `source-of-truth gap`

This may be intentional version pinning, but the owner should confirm the single
production agent for inbound Ads/site calls before any app integration:

- production inbound agent ID/version,
- production outbound agent ID/version,
- whether the currently configured webhooks are still wanted,
- whether this repo should become the durable receiver for Retell events.

## Polling Sync Preparation

Date: 2026-06-09

Implementation status: repo prepared; not activated against production Retell
webhooks.

Files added:

- `db/migrations/019_create_retell_call_leads.sql`
- `db/migrations/019_create_retell_call_leads.down.sql`
- `scripts/ops/sync-retell-call-leads.ts`
- `scripts/ops/retell-call-leads-report.sql`

Package script:

```bash
pnpm retell:sync-calls
```

### Safety Model

The sync path is intentionally polling-based first:

```text
Retell existing setup remains unchanged
  -> script reads recent calls with Retell API
  -> dry-run prints sanitized summary by default
  -> --apply stores idempotent call records in Neon
  -> --sync-hubspot optionally mirrors qualified calls to HubSpot
```

This does not change:

- Retell `webhook_url`
- Retell phone number assignment
- Retell agent version
- `ai.primeplanbuild.com`
- Google Ads call assets
- public website phone number

### Data Model

`retell_call_leads` is the business table for calls. It stores:

- Retell `call_id` as a unique idempotency key.
- call lifecycle fields: status, type, started/ended timestamps, duration,
  disconnection reason.
- agent fields: ID and name.
- phone fields: E.164 values plus SHA-256 and last4 indexes. Do not print full
  values in logs or chat.
- post-call analysis fields needed for operations: language, segment, intent,
  outcome, service type, property type, frequency, zip, preferred day/time,
  consent flags, quoted price, sanitized summary.
- HubSpot mirror status and provider IDs.
- future Google Ads conversion status.

`integration_events` gets one `retell` inbound row per call sync:

- `provider = 'retell'`
- `operation = 'call_sync_poll'`
- `direction = 'inbound'`
- `idempotency_key = retell:call:{call_id}`

### Commands

Read-only dry run:

```bash
pnpm retell:sync-calls -- --limit=10 --since-hours=24
```

Persist to Neon after confirming the `DATABASE_URL` target:

```bash
pnpm retell:sync-calls -- --limit=10 --since-hours=24 --apply
```

Persist and mirror qualified calls to HubSpot:

```bash
pnpm retell:sync-calls -- --limit=10 --since-hours=24 --apply --sync-hubspot
```

Verify saved rows without printing full phone numbers:

```bash
psql "$DATABASE_URL" -f scripts/ops/retell-call-leads-report.sql
```

HubSpot sync is intentionally conservative, but not email-only:

- It only syncs qualified calls by default.
- It first upserts contacts by `email` when Retell captures one.
- If there is no email, it searches HubSpot contacts by exact `phone` and
  `mobilephone`.
- If exactly one phone match exists, it uses that contact.
- If no phone match exists, it creates a contact with the caller phone and a
  Retell phone-lead fallback name, because HubSpot Contacts requires at least
  one of `email`, `firstname`, or `lastname` on create. Email is recommended by
  HubSpot for dedupe, not required for all contacts.
- If multiple phone matches exist, it skips as `skipped_ambiguous_phone_match`
  for manual review instead of guessing.
- It creates a HubSpot call activity associated to the contact. Deal creation is
  reserved for qualified calls.
- It does not mirror Retell recording URLs or public log URLs into HubSpot until
  Retell signed URLs, retention, and consent posture are explicitly approved.
- It skips calls without a usable email or phone as
  `skipped_missing_contact_identity`.
- It skips unqualified calls as `skipped_unqualified`.

For a real HubSpot test call, an email is useful for dedupe but not required.
The important criteria are: a real caller phone is present, the call reaches the
Retell number, and the caller expresses quote/booking/estimate intent so Retell
can classify the call. If the caller gives no email, the expected clean result
is still Neon row + HubSpot contact/call activity by phone; deal only if the
call qualifies.

HubSpot local read-only probes on 2026-06-09 confirmed the token can read
contact properties, call properties, and the calls object without printing CRM
records. The token's `calls.write` capability is not proven by read-only probes;
verify it with a controlled `--apply --sync-hubspot` call after confirming the
DB target and CRM scope.

### Current Dry-Run Evidence

Command:

```bash
pnpm retell:sync-calls -- --limit=10 --since-hours=24
```

Result:

- Retell API was reachable.
- 10 recent calls checked.
- 2 calls matched the target number ending in `8053`.
- Both matched calls were not qualified for HubSpot by default.
- No raw phone numbers, transcripts, recording URLs, or public log URLs were
  printed.

Verification:

```bash
pnpm type-check
pnpm lint
```

Both passed on 2026-06-09.

### Applied Sync Evidence

Date: 2026-06-09

Actions completed:

- Applied migration `019_create_retell_call_leads.sql` to the configured Neon
  `DATABASE_URL` target.
- Verified `public.retell_call_leads` exists.
- Ran:

```bash
pnpm retell:sync-calls -- --limit=10 --since-hours=24 --apply --sync-hubspot
```

Sanitized result:

- 2 Retell calls matched the target number ending in `8053`.
- 2 rows were persisted in `public.retell_call_leads`.
- 2 calls had caller phone available.
- 0 calls had email.
- 0 HubSpot contacts/calls/deals were created because both calls were
  classified as unqualified.
- Both rows were marked `hubspot_status = skipped_unqualified`.

Follow-up manual test call on 2026-06-09:

- A new call started at `2026-06-09T22:05:17.712Z`.
- Retell classified it as `call_successful = true`, `outcome = quote_sent`,
  `intent = price_quote`, and `service_type = recurring`.
- The call had a captured name but no captured email.
- The apparent caller phone ended in `0532`, which is a known business/public
  number and matched multiple HubSpot contacts in read-only search.
- The script persisted the call in Neon and marked HubSpot as
  `skipped_missing_contact_identity` rather than associating it to the wrong
  contact.

Spanish manual test call on 2026-06-09:

- A new Spanish-language call started at `2026-06-09T22:13:09.510Z`.
- Retell captured a name and a callback phone, but no email.
- Retell produced a conflicting analysis: `call_successful = false` and
  `outcome = not_interested`, while also setting `intent = price_quote` and
  `service_type = recurring`.
- The local qualification rule was updated to treat `intent = price_quote` and
  `outcome = quote_sent` as qualified lead signals.
- After rerunning the sync, the call was persisted in Neon and synced to
  HubSpot with a phone-created contact, call activity, and deal.
- Read-only HubSpot verification confirmed the contact, call, and deal IDs are
  present and not archived.

## Preparation Checklist Before Retell API Key

No secret is required to prepare these items.

### Retell / Phone Provider Inventory

- Exact phone number in E.164 format.
- Whether the number was purchased in Retell, imported to Retell, forwarded to
  Retell, or only shown in Google Ads.
- Agent name and ID, if already assigned.
- Whether the agent is inbound only, outbound capable, or both.
- Whether call recording, transcription, and post-call analysis are enabled.
- Webhook scope: account-level webhook, agent-level webhook, or none.
- Events expected: `call_started`, `call_ended`, `call_analyzed`.
- Post-call analysis fields needed by the business:
  - service requested,
  - city/service area,
  - urgency,
  - residential vs commercial,
  - recurring vs one-time,
  - appointment requested,
  - quoted budget if volunteered,
  - lead quality/disposition,
  - summary safe for HubSpot.
- Escalation behavior: transfer to owner, voicemail, SMS follow-up, or form link.
- Business hours and timezone.
- Consent/disclosure script for recording/transcription.

### Google Ads Inventory

- Which surface will use the Retell number:
  - call asset,
  - call ad,
  - website phone number,
  - dedicated Ads landing page,
  - or Retell only behind a Google forwarding number.
- Whether call reporting remains enabled.
- Whether website call conversion tracking should replace the visible site
  number with a Google forwarding number on ad-click visits.
- Conversion definition:
  - raw call,
  - call duration threshold,
  - qualified call from Retell analysis,
  - appointment request,
  - booked estimate,
  - closed sale.
- Whether `gclid`, `gbraid`, and `wbraid` need to be captured and retained for
  later offline conversion import.
- Whether enhanced conversions for leads are approved and terms accepted.
- Google Ads API access status. Current known gap: the available developer token
  is not approved for production API access, so full CLI/API conversion import
  remains blocked until Basic Access or the new Google Ads Data Manager path is
  confirmed.

### Repo / Data Contract Inventory

- Keep Neon as the source of truth, matching
  `docs/operations/observability-traceability-guide.md`.
- Use `integration_events` for Retell inbound webhook ledger rows:
  - `provider = 'retell'`
  - `direction = 'inbound'`
  - `operation = call_started | call_ended | call_analyzed`
  - `provider_event_id` when Retell supplies one
  - `provider_object_id = call.call_id`
  - `idempotency_key = retell:{event}:{call.call_id}`
  - `payload_hash` rather than raw transcript by default
- Add a separate call business table before storing transcripts or analysis as
  lead data. Candidate name: `call_leads` or `phone_call_leads`.
- Do not store full transcripts in logs. Store summaries/structured fields only
  unless a retention decision explicitly allows transcript storage.
- Do not create HubSpot custom properties automatically. Mirror calls into
  HubSpot using existing properties, notes, tasks, or deal description, matching
  the current HubSpot integration decision.

## Target Architecture For This Repo

```text
Google Ads click or call
  -> Google call reporting / forwarding number OR Retell-owned campaign number
  -> Retell inbound agent
  -> POST /api/webhooks/retell
  -> verify x-retell-signature against raw request body
  -> persist integration_events row
  -> upsert call business record by call_id
  -> classify qualified lead after call_analyzed
  -> optionally create/update HubSpot contact, note, task, or deal
  -> optionally queue Google Ads qualified-call conversion import
```

The first implementation should be read-first and provider-confirmed:

1. List Retell phone numbers, agents, and recent calls with the API key.
2. Confirm the target number/agent/webhook state.
3. Add the webhook route and DB table in preview/local.
4. Configure Retell webhook to preview or a controlled production endpoint only
   after the route verifies signatures and stores events.
5. Run one controlled test call.
6. Only then decide whether to update Google Ads assets or the visible site
   number.

## Ads-Specific Number Strategy

Do not replace the sitewide business phone number just because a Retell number
exists.

Minimum viable path:

- Use Retell as the call handling provider only after confirming the number is
  assigned to the inbound agent.
- Keep Google Ads `Calls from ads` active.
- Keep NAP/SEO consistency for the public site until the tracking-number plan is
  approved.

Better Ads path:

- For calls directly from ads, use Google call reporting / forwarding number
  where available so Google can attribute calls to campaign/ad group/keyword.
- For calls from the website after an ad click, evaluate Google website call
  conversion tracking before replacing the static number. Google's phone snippet
  expects the exact digits as displayed on the page.
- Use Retell post-call analysis as the business-quality layer and import only
  qualified outcomes into Ads when the API/access path is ready.

Rejected path:

- Replacing every visible phone CTA with a Retell number and treating Retell
  call count as the Ads conversion source. That is an attribution gap because it
  may answer calls, but it does not by itself prove campaign source, click ID,
  lead quality, HubSpot state, or offline conversion readiness.

## Recommended Next Steps

1. Confirm phone-number ownership/routing in the phone provider dashboard:
   Retell, Twilio, Google forwarding, carrier, or another provider.
2. If the number is in Retell, confirm that an inbound agent is assigned and
   whether account-level or agent-level webhooks are configured.
3. Add a call intake design only after provider ownership is confirmed:
   `call_started`, `call_ended`, `call_analyzed`, signature verification,
   durable call event storage, HubSpot sync, and Google Ads offline conversion
   import where eligible.
4. Keep Google Ads `Calls from ads` active, but do not treat it as a full CRM
   truth source. It does not replace call transcript/qualification data.
5. Verify the direct Integrity Google Ads tag `AW-18004402142` and conversion
   event `AW-18004402142/Tx05CKP7-bscEN6_lYlD` with Tag Assistant after
   accepting marketing cookies.
6. Promote Google click IDs (`gclid`, `gbraid`, `wbraid`) from raw payload to
   first-class DB columns before using them for offline conversion import or
   campaign reporting.

## What Is Needed When The Owner Provides The API Key

Do not paste the Retell API key in chat.

Preferred local setup:

```bash
export RETELL_API_KEY="..."
```

For Codex MCP, Retell documents this shape:

```toml
[mcp_servers.retell]
url = "https://mcp.retellai.com"
bearer_token_env_var = "RETELL_API_KEY"
```

First API/MCP actions should be read-only:

- list agents,
- list phone numbers,
- fetch target phone number details,
- list recent calls,
- inspect webhook configuration if the API exposes it,
- confirm whether the target number is assigned to the target inbound agent.

Mutating actions that require explicit approval:

- creating or importing phone numbers,
- assigning a number to an agent,
- publishing/updating an agent,
- creating/changing webhooks,
- launching outbound calls,
- deleting call data,
- changing Google Ads phone/call assets,
- importing conversions into Google Ads.

## Non-Goals

- Do not create a new Google Tag Manager container unless the existing tag
  ownership and installation path are confirmed.
- Do not replace the business phone number with a new tracking number without
  owner approval and rollback plan.
- Do not import call conversions into Google Ads until call source, consent,
  conversion definition, and provider identifiers are confirmed.

## Verification Needed

- Provider dashboard evidence for `+1-800-930-0532`.
- Tag Assistant evidence for `AW-18004402142` / `GT-TQSSQ345`.
- A real or sandbox call event from the phone provider webhook.
- A test lead submission carrying `gclid` or another Google click identifier.
- A successful test submit proving the `Quote form submitted` conversion fires
  only after `/api/contact` success, not on page load.
