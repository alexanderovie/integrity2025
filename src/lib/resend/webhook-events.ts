import "server-only";

import type { WebhookEventPayload } from "resend";
import { query, queryOne, queryRaw } from "@/lib/db/neon";
import { suppressMarketingSubscriptionByEmail } from "@/lib/marketing/subscriptions";

type EmailWebhookData = {
  email_id?: string;
  created_at?: string;
  from?: string;
  to?: string[];
  subject?: string;
  bounce?: {
    type?: string;
    subType?: string;
    message?: string;
  };
  failed?: {
    reason?: string;
  };
  suppressed?: {
    type?: string;
    message?: string;
  };
  click?: {
    link?: string;
  };
};

type PersistResendWebhookInput = {
  svixId: string;
  svixTimestamp: string;
  payload: WebhookEventPayload;
  rawPayload: string;
};

type PersistedResendWebhookEvent = {
  id: string;
  duplicate: boolean;
  integration_event_id: string | null;
  email_id: string | null;
};

type IntegrationEventLookup = {
  id: string;
};

function getEmailData(payload: WebhookEventPayload): EmailWebhookData | null {
  if (!payload.type.startsWith("email.")) return null;
  return payload.data as EmailWebhookData;
}

function getEventTimestamp(payload: WebhookEventPayload, emailData: EmailWebhookData | null): string | null {
  return emailData?.created_at || payload.created_at || null;
}

function toJson(rawPayload: string): string {
  JSON.parse(rawPayload);
  return rawPayload;
}

async function findResendIntegrationEvent(emailId: string | null): Promise<string | null> {
  if (!emailId) return null;

  const row = await queryOne<IntegrationEventLookup>(
    `
      SELECT id
      FROM public.integration_events
      WHERE provider = 'resend'
        AND provider_object_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [emailId],
    {
      name: "resend_webhook_find_integration_event",
      context: "resend_webhook",
    },
  );

  return row?.id ?? null;
}

export async function persistResendWebhookEvent(
  input: PersistResendWebhookInput,
): Promise<PersistedResendWebhookEvent> {
  const emailData = getEmailData(input.payload);
  const emailId = emailData?.email_id ?? null;
  const integrationEventId = await findResendIntegrationEvent(emailId);
  const eventCreatedAt = getEventTimestamp(input.payload, emailData);

  const result = await queryRaw<PersistedResendWebhookEvent>(
    `
      WITH inserted AS (
        INSERT INTO public.resend_webhook_events (
          svix_id,
          svix_timestamp,
          event_type,
          event_created_at,
          email_id,
          integration_event_id,
          from_email,
          to_emails,
          subject,
          payload
        )
        VALUES ($1, $2, $3, $4::timestamptz, $5, $6::uuid, $7, $8::text[], $9, $10::jsonb)
        ON CONFLICT (svix_id) DO NOTHING
        RETURNING id, false AS duplicate, integration_event_id, email_id
      )
      SELECT id, duplicate, integration_event_id, email_id FROM inserted
      UNION ALL
      SELECT id, true AS duplicate, integration_event_id, email_id
      FROM public.resend_webhook_events
      WHERE svix_id = $1
        AND NOT EXISTS (SELECT 1 FROM inserted)
      LIMIT 1
    `,
    [
      input.svixId,
      input.svixTimestamp,
      input.payload.type,
      eventCreatedAt,
      emailId,
      integrationEventId,
      emailData?.from ?? null,
      emailData?.to ?? [],
      emailData?.subject ?? null,
      toJson(input.rawPayload),
    ],
    {
      name: "resend_webhook_event_persist",
      context: "resend_webhook",
    },
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`Resend webhook event ${input.svixId} was not persisted.`);
  }

  if (!row.duplicate && emailId && emailData) {
    await upsertResendEmailDelivery({
      payload: input.payload,
      emailData,
      emailId,
      integrationEventId,
      eventCreatedAt,
      rawPayload: input.rawPayload,
    });
  }

  return row;
}

async function upsertResendEmailDelivery(input: {
  payload: WebhookEventPayload;
  emailData: EmailWebhookData;
  emailId: string;
  integrationEventId: string | null;
  eventCreatedAt: string | null;
  rawPayload: string;
}): Promise<void> {
  const eventType = input.payload.type;
  const happenedAt = input.eventCreatedAt;

  await query(
    `
      INSERT INTO public.resend_email_deliveries (
        email_id,
        integration_event_id,
        latest_event_type,
        latest_event_at,
        from_email,
        to_emails,
        subject,
        sent_at,
        delivered_at,
        delivery_delayed_at,
        bounced_at,
        complained_at,
        failed_at,
        suppressed_at,
        opened_at,
        clicked_at,
        bounce_type,
        bounce_subtype,
        bounce_message,
        failed_reason,
        suppressed_type,
        suppressed_message,
        last_click_url,
        payload
      )
      VALUES (
        $1,
        $2::uuid,
        $3,
        $4::timestamptz,
        $5,
        $6::text[],
        $7,
        CASE WHEN $3 = 'email.sent' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.delivered' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.delivery_delayed' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.bounced' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.complained' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.failed' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.suppressed' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.opened' THEN $4::timestamptz END,
        CASE WHEN $3 = 'email.clicked' THEN $4::timestamptz END,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15::jsonb
      )
      ON CONFLICT (email_id) DO UPDATE
      SET
        integration_event_id = COALESCE(resend_email_deliveries.integration_event_id, EXCLUDED.integration_event_id),
        latest_event_type = CASE
          WHEN resend_email_deliveries.latest_event_at IS NULL
            OR EXCLUDED.latest_event_at >= resend_email_deliveries.latest_event_at
            THEN EXCLUDED.latest_event_type
          ELSE resend_email_deliveries.latest_event_type
        END,
        latest_event_at = GREATEST(
          COALESCE(resend_email_deliveries.latest_event_at, EXCLUDED.latest_event_at),
          COALESCE(EXCLUDED.latest_event_at, resend_email_deliveries.latest_event_at)
        ),
        from_email = COALESCE(EXCLUDED.from_email, resend_email_deliveries.from_email),
        to_emails = CASE WHEN cardinality(EXCLUDED.to_emails) > 0 THEN EXCLUDED.to_emails ELSE resend_email_deliveries.to_emails END,
        subject = COALESCE(EXCLUDED.subject, resend_email_deliveries.subject),
        sent_at = COALESCE(resend_email_deliveries.sent_at, EXCLUDED.sent_at),
        delivered_at = COALESCE(resend_email_deliveries.delivered_at, EXCLUDED.delivered_at),
        delivery_delayed_at = COALESCE(resend_email_deliveries.delivery_delayed_at, EXCLUDED.delivery_delayed_at),
        bounced_at = COALESCE(resend_email_deliveries.bounced_at, EXCLUDED.bounced_at),
        complained_at = COALESCE(resend_email_deliveries.complained_at, EXCLUDED.complained_at),
        failed_at = COALESCE(resend_email_deliveries.failed_at, EXCLUDED.failed_at),
        suppressed_at = COALESCE(resend_email_deliveries.suppressed_at, EXCLUDED.suppressed_at),
        opened_at = COALESCE(resend_email_deliveries.opened_at, EXCLUDED.opened_at),
        clicked_at = COALESCE(resend_email_deliveries.clicked_at, EXCLUDED.clicked_at),
        bounce_type = COALESCE(EXCLUDED.bounce_type, resend_email_deliveries.bounce_type),
        bounce_subtype = COALESCE(EXCLUDED.bounce_subtype, resend_email_deliveries.bounce_subtype),
        bounce_message = COALESCE(EXCLUDED.bounce_message, resend_email_deliveries.bounce_message),
        failed_reason = COALESCE(EXCLUDED.failed_reason, resend_email_deliveries.failed_reason),
        suppressed_type = COALESCE(EXCLUDED.suppressed_type, resend_email_deliveries.suppressed_type),
        suppressed_message = COALESCE(EXCLUDED.suppressed_message, resend_email_deliveries.suppressed_message),
        last_click_url = COALESCE(EXCLUDED.last_click_url, resend_email_deliveries.last_click_url),
        payload = EXCLUDED.payload
    `,
    [
      input.emailId,
      input.integrationEventId,
      eventType,
      happenedAt,
      input.emailData.from ?? null,
      input.emailData.to ?? [],
      input.emailData.subject ?? null,
      input.emailData.bounce?.type ?? null,
      input.emailData.bounce?.subType ?? null,
      input.emailData.bounce?.message ?? null,
      input.emailData.failed?.reason ?? null,
      input.emailData.suppressed?.type ?? null,
      input.emailData.suppressed?.message ?? null,
      input.emailData.click?.link ?? null,
      toJson(input.rawPayload),
    ],
    {
      name: "resend_email_delivery_upsert",
      context: "resend_webhook",
    },
  );

  if (
    eventType === "email.bounced" ||
    eventType === "email.complained" ||
    eventType === "email.suppressed"
  ) {
    await Promise.all(
      (input.emailData.to ?? []).map((email) =>
        suppressMarketingSubscriptionByEmail({
          email,
          reason: eventType,
        }),
      ),
    );
  }
}

export async function markResendWebhookEventProcessed(id: string): Promise<void> {
  await query(
    `
      UPDATE public.resend_webhook_events
      SET
        processed_at = now(),
        processing_error = NULL
      WHERE id = $1
    `,
    [id],
    {
      name: "resend_webhook_event_processed",
      context: "resend_webhook",
    },
  );
}

export async function markResendWebhookEventFailed(id: string, error: string): Promise<void> {
  await query(
    `
      UPDATE public.resend_webhook_events
      SET processing_error = $2
      WHERE id = $1
    `,
    [id, error],
    {
      name: "resend_webhook_event_failed",
      context: "resend_webhook",
    },
  );
}
