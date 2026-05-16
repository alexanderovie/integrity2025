import "server-only";

import { query, queryRaw } from "@/lib/db/neon";
import { stripe } from "@/lib/stripe";

type StripeObjectRef = string | { id?: string } | null;

export type CheckoutSessionReconciliationResult = {
  sessionId: string;
  stripeStatus: string | null;
  stripePaymentStatus: string | null;
  appStatus: "paid" | "expired" | "unchanged" | "not_found";
  updated: boolean;
};

export type StaleCheckoutSession = {
  stripe_session_id: string;
  status: string;
  created_at: string;
  amount_total: number | null;
  service_id: string | null;
};

const getStripeObjectId = (value: StripeObjectRef): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id || null;
};

export async function reconcileCheckoutSessionFromStripe(
  sessionId: string,
): Promise<CheckoutSessionReconciliationResult> {
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId = getStripeObjectId(stripeSession.payment_intent);

  if (stripeSession.payment_status === "paid") {
    const result = await queryRaw(
      `UPDATE public.checkout_sessions
       SET status = 'paid',
           stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, $2),
           paid_at = COALESCE(paid_at, NOW()),
           updated_at = NOW()
       WHERE stripe_session_id = $1
         AND status <> 'paid'
       RETURNING id`,
      [sessionId, paymentIntentId],
      {
        name: "stripe_checkout_session_reconcile_paid",
        context: "stripe_checkout_reconciliation",
      },
    );

    return {
      sessionId,
      stripeStatus: stripeSession.status,
      stripePaymentStatus: stripeSession.payment_status,
      appStatus: "paid",
      updated: (result.rowCount ?? 0) > 0,
    };
  }

  if (stripeSession.status === "expired") {
    const result = await queryRaw(
      `UPDATE public.checkout_sessions
       SET status = 'expired',
           updated_at = NOW()
       WHERE stripe_session_id = $1
         AND status IN ('created', 'redirected', 'unknown')
       RETURNING id`,
      [sessionId],
      {
        name: "stripe_checkout_session_reconcile_expired",
        context: "stripe_checkout_reconciliation",
      },
    );

    return {
      sessionId,
      stripeStatus: stripeSession.status,
      stripePaymentStatus: stripeSession.payment_status,
      appStatus: "expired",
      updated: (result.rowCount ?? 0) > 0,
    };
  }

  return {
    sessionId,
    stripeStatus: stripeSession.status,
    stripePaymentStatus: stripeSession.payment_status,
    appStatus: "unchanged",
    updated: false,
  };
}

export async function listStaleCheckoutSessions(limit: number): Promise<StaleCheckoutSession[]> {
  return query<StaleCheckoutSession>(
    `SELECT stripe_session_id, status, created_at, amount_total, service_id
     FROM public.checkout_sessions
     WHERE stripe_session_id IS NOT NULL
       AND status IN ('created', 'redirected', 'unknown')
       AND created_at < NOW() - INTERVAL '10 minutes'
     ORDER BY created_at ASC
     LIMIT $1`,
    [Math.max(1, Math.min(limit, 50))],
    {
      name: "stripe_checkout_sessions_stale_list",
      context: "stripe_checkout_reconciliation",
    },
  );
}

export async function reconcileStaleCheckoutSessions(input: {
  limit: number;
}): Promise<CheckoutSessionReconciliationResult[]> {
  const staleSessions = await listStaleCheckoutSessions(input.limit);
  const results: CheckoutSessionReconciliationResult[] = [];

  for (const session of staleSessions) {
    results.push(await reconcileCheckoutSessionFromStripe(session.stripe_session_id));
  }

  return results;
}
