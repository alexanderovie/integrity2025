import "server-only";

import { createHash, randomBytes } from "crypto";
import { query, queryOne } from "@/lib/db/neon";
import { absoluteUrl } from "@/lib/urls/site";

type MarketingSubscriptionRow = {
  id: string;
};

type CreateMarketingSubscriptionInput = {
  email: string;
  source: string;
  leadSubmissionId?: string | null;
  baseUrl?: string | null;
};

export type MarketingSubscription = {
  id: string;
  unsubscribeUrl: string;
};

function createUnsubscribeToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashUnsubscribeToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createOrRenewMarketingSubscription(
  input: CreateMarketingSubscriptionInput,
): Promise<MarketingSubscription> {
  const token = createUnsubscribeToken();
  const tokenHash = hashUnsubscribeToken(token);
  const email = input.email.trim().toLowerCase();

  const row = await queryOne<MarketingSubscriptionRow>(
    `
      INSERT INTO public.marketing_subscriptions (
        email,
        status,
        source,
        lead_submission_id,
        unsubscribe_token_hash,
        subscribed_at,
        unsubscribed_at
      )
      VALUES ($1, 'subscribed', $2, $3::uuid, $4, now(), NULL)
      ON CONFLICT (email) DO UPDATE
      SET
        status = 'subscribed',
        source = EXCLUDED.source,
        lead_submission_id = COALESCE(EXCLUDED.lead_submission_id, marketing_subscriptions.lead_submission_id),
        unsubscribe_token_hash = EXCLUDED.unsubscribe_token_hash,
        subscribed_at = now(),
        unsubscribed_at = NULL,
        suppressed_at = NULL,
        suppression_reason = NULL,
        updated_at = now()
      RETURNING id
    `,
    [
      email,
      input.source,
      input.leadSubmissionId ?? null,
      tokenHash,
    ],
    {
      name: "marketing_subscription_upsert",
      context: "marketing",
    },
  );

  if (!row?.id) {
    throw new Error("Marketing subscription was not persisted.");
  }

  return {
    id: row.id,
    unsubscribeUrl: input.baseUrl
      ? new URL(`/api/marketing/unsubscribe?token=${encodeURIComponent(token)}`, input.baseUrl).toString()
      : absoluteUrl(`/api/marketing/unsubscribe?token=${encodeURIComponent(token)}`),
  };
}

export async function unsubscribeMarketingSubscription(token: string): Promise<boolean> {
  const tokenHash = hashUnsubscribeToken(token.trim());
  const result = await query<MarketingSubscriptionRow>(
    `
      UPDATE public.marketing_subscriptions
      SET
        status = 'unsubscribed',
        unsubscribed_at = COALESCE(unsubscribed_at, now()),
        updated_at = now()
      WHERE unsubscribe_token_hash = $1
      RETURNING id
    `,
    [tokenHash],
    {
      name: "marketing_subscription_unsubscribe",
      context: "marketing",
    },
  );

  return result.length > 0;
}

export async function suppressMarketingSubscriptionByEmail(input: {
  email: string;
  reason: string;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (!email) return;

  await query(
    `
      UPDATE public.marketing_subscriptions
      SET
        status = 'suppressed',
        suppressed_at = COALESCE(suppressed_at, now()),
        suppression_reason = $2,
        updated_at = now()
      WHERE email = $1
    `,
    [email, input.reason],
    {
      name: "marketing_subscription_suppress_by_email",
      context: "marketing",
    },
  );
}
