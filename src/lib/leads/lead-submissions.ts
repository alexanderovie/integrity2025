import "server-only";

import { createHash } from "crypto";
import { query, queryOne } from "@/lib/db/neon";

export type LeadSubmissionInput = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  propertyType?: string | null;
  zip?: string | null;
  frequency?: string | null;
  preferredDate?: string | null;
  message?: string | null;
  source?: string | null;
  pagePath?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  smsConsent?: boolean;
  smsConsentText?: string | null;
  smsConsentTimestamp?: string | null;
  idempotencyKey?: string | null;
  rawPayload?: Record<string, unknown> | null;
};

export type LeadSubmissionStatusUpdate = {
  status: string;
  resendStatus?: string | null;
  hubspotStatus?: string | null;
  stripeStatus?: string | null;
  metaStatus?: string | null;
  resendEmailId?: string | null;
  resendConfirmationEmailId?: string | null;
  hubspotContactId?: string | null;
  hubspotDealId?: string | null;
  stripeSessionId?: string | null;
  metaEventId?: string | null;
  errorLog?: Record<string, unknown> | null;
};

type LeadSubmissionRow = {
  id: string;
};

const optionalText = (value?: string | null): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const optionalTimestamp = (value?: string | null): string | null => {
  if (!value) return null;

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  return new Date(timestamp).toISOString();
};

export function makeLeadIdempotencyKey(scope: string, values: Array<string | null | undefined>): string {
  const normalized = values.map((value) => value?.trim().toLowerCase() || "").join("|");
  return `${scope}:${createHash("sha256").update(normalized).digest("hex")}`;
}

export async function createLeadSubmission(input: LeadSubmissionInput): Promise<string> {
  const rawPayload = input.rawPayload ? JSON.stringify(input.rawPayload) : null;

  const row = await queryOne<LeadSubmissionRow>(
    `
      INSERT INTO lead_submissions (
        name,
        email,
        phone,
        service,
        property_type,
        zip,
        frequency,
        preferred_date,
        message,
        source,
        page_path,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        sms_consent,
        sms_consent_text,
        sms_consent_timestamp,
        status,
        idempotency_key,
        raw_payload
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, 'received', $21, $22::jsonb
      )
      ON CONFLICT (idempotency_key) DO UPDATE
      SET
        updated_at = now(),
        raw_payload = EXCLUDED.raw_payload
      RETURNING id
    `,
    [
      optionalText(input.name),
      optionalText(input.email),
      optionalText(input.phone),
      optionalText(input.service),
      optionalText(input.propertyType),
      optionalText(input.zip),
      optionalText(input.frequency),
      optionalText(input.preferredDate),
      optionalText(input.message),
      optionalText(input.source),
      optionalText(input.pagePath),
      optionalText(input.referrer),
      optionalText(input.utmSource),
      optionalText(input.utmMedium),
      optionalText(input.utmCampaign),
      optionalText(input.utmContent),
      optionalText(input.utmTerm),
      Boolean(input.smsConsent),
      optionalText(input.smsConsentText),
      optionalTimestamp(input.smsConsentTimestamp),
      input.idempotencyKey || null,
      rawPayload,
    ],
    {
      name: "lead_submission_create",
      context: "lead_intake",
    },
  );

  if (!row?.id) {
    throw new Error("Lead submission was not persisted.");
  }

  return row.id;
}

export async function updateLeadSubmissionStatus(
  id: string,
  update: LeadSubmissionStatusUpdate,
): Promise<void> {
  const errorLog = update.errorLog ? JSON.stringify(update.errorLog) : null;

  await query(
    `
      UPDATE lead_submissions
      SET
        status = $2,
        resend_status = COALESCE($3, resend_status),
        hubspot_status = COALESCE($4, hubspot_status),
        stripe_status = COALESCE($5, stripe_status),
        meta_status = COALESCE($6, meta_status),
        resend_email_id = COALESCE($7, resend_email_id),
        resend_confirmation_email_id = COALESCE($8, resend_confirmation_email_id),
        hubspot_contact_id = COALESCE($9, hubspot_contact_id),
        hubspot_deal_id = COALESCE($10, hubspot_deal_id),
        stripe_session_id = COALESCE($11, stripe_session_id),
        meta_event_id = COALESCE($12, meta_event_id),
        error_log = COALESCE($13::jsonb, error_log),
        updated_at = now()
      WHERE id = $1
    `,
    [
      id,
      update.status,
      update.resendStatus ?? null,
      update.hubspotStatus ?? null,
      update.stripeStatus ?? null,
      update.metaStatus ?? null,
      update.resendEmailId ?? null,
      update.resendConfirmationEmailId ?? null,
      update.hubspotContactId ?? null,
      update.hubspotDealId ?? null,
      update.stripeSessionId ?? null,
      update.metaEventId ?? null,
      errorLog,
    ],
    {
      name: "lead_submission_status_update",
      context: "lead_intake",
    },
  );
}
