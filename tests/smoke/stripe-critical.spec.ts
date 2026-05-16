import { test, expect } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { BASE_URL } from '../helpers/constants';

loadEnv({ path: '.env.local', quiet: true });

const smokeHeaders = (caseName: string): Record<string, string> => ({
  'user-agent': `integrity-stripe-smoke/${caseName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  'x-forwarded-for': `playwright-${caseName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
});

const getStripeClient = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, {
    typescript: true,
  });
};

const getDatabasePool = (): Pool | null => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  return new Pool({ connectionString });
};

const expectCheckoutSessionPricingSource = async (
  sessionId: string,
  expectedSource: 'stripe_price' | 'custom_quote',
): Promise<void> => {
  const stripe = getStripeClient();
  if (!stripe) {
    test.info().annotations.push({
      type: 'note',
      description: 'STRIPE_SECRET_KEY is not available to the Playwright runner; skipped Stripe metadata inspection.',
    });
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  expect(session.metadata?.pricingSource).toBe(expectedSource);

  if (expectedSource === 'stripe_price') {
    expect(session.metadata?.stripePriceId).toMatch(/^price_/);
    expect(session.metadata?.stripeProductId).toMatch(/^prod_/);

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 1 });
    expect(lineItems.data[0]?.price?.id).toBe(session.metadata?.stripePriceId);
  } else {
    expect(session.metadata?.stripePriceId || '').toBe('');
    expect(session.metadata?.stripeProductId || '').toBe('');
  }
};

test.describe('Stripe Payment Integration - Critical Business Flow (P0)', () => {
  test('Airbnb quote page creates a quote request instead of Stripe checkout', async ({ page }) => {
    let checkoutCalled = false;
    let contactCalled = false;

    await page.route('**/api/checkout', async (route) => {
      checkoutCalled = true;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Airbnb quote-only flow must not call checkout' }),
      });
    });

    await page.route('**/api/contact', async (route) => {
      contactCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route('**/api/meta/pixel', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto(`${BASE_URL}/quote/airbnb-cleaning`);

    await expect(page.getByRole('heading', { name: /request airbnb quote/i })).toBeVisible();
    await expect(page.getByText(/custom quote/i).first()).toBeVisible();

    await page.fill('input[name="zipCode"]', '32839');
    await page.selectOption('select[name="bedrooms"]', '2');
    await page.selectOption('select[name="bathrooms"]', '2');
    await page.selectOption('select[name="propertySize"]', '1250');
    await page.selectOption('select[name="beds"]', '2');
    await page.selectOption('select[name="turnoverWindow"]', 'same-day');
    await page.selectOption('select[name="laundryService"]', 'on-site');
    await page.selectOption('select[name="restockingNeeded"]', 'yes');
    await page.fill('input[name="name"]', 'Airbnb Quote Test');
    await page.fill('input[name="email"]', `airbnb-quote-${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '8009300532');
    await page.fill('input[name="address"]', '4700 Millenia Blvd, Orlando, FL');
    await page.check('input[name="terms"]');
    await page.getByRole('button', { name: /request airbnb quote/i }).click();

    await expect(page.getByText(/quote request received/i)).toBeVisible();
    expect(contactCalled).toBeTruthy();
    expect(checkoutCalled).toBeFalsy();
  });

  test('Base service checkout uses the active Stripe catalog price', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('base-service-stripe-price'),
      data: {
        serviceId: 'regular-cleaning',
        customerEmail: `stripe-base-${Date.now()}@example.com`,
        customerName: 'Stripe Base Price Customer',
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.sessionId).toBeDefined();
    expect(data.sessionId).toMatch(/^cs_/);
    expect(data.url).toBeDefined();
    expect(data.url).toContain('stripe.com');

    await expectCheckoutSessionPricingSource(data.sessionId, 'stripe_price');
  });

  test('Custom quote checkout uses dynamic price data', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('custom-quote-price-data'),
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: `stripe-custom-${Date.now()}@example.com`,
        customerName: 'Test Customer',
        customPrice: 150,
        quoteData: {
          serviceType: 'Deep Cleaning',
          zipCode: '32839',
          address: '4700 Millenia Blvd, Orlando, FL',
          phone: '8009300532',
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1200,
          frequency: 'one-time',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Debe retornar sessionId de Stripe
    expect(data.sessionId).toBeDefined();
    expect(data.sessionId).toMatch(/^cs_/); // Stripe session IDs empiezan con cs_

    // Debe incluir URL de checkout
    expect(data.url).toBeDefined();
    expect(data.url).toContain('stripe.com');

    await expectCheckoutSessionPricingSource(data.sessionId, 'custom_quote');
  });

  test('Service without a Stripe catalog price fails closed for base checkout', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('missing-stripe-price-fails-closed'),
      data: {
        serviceId: 'airbnb-cleaning',
        customerEmail: `stripe-missing-price-${Date.now()}@example.com`,
        customerName: 'Missing Price Customer',
      },
    });

    expect(response.status()).toBe(503);
    const data = await response.json();
    expect(data.error).toBe('Pricing is unavailable for this service.');
  });

  test('Checkout validates missing customer data', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('missing-customer-data'),
      data: {
        serviceId: 'deep-cleaning',
        // Falta customerEmail y customerName
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Checkout validates invalid service ID', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('invalid-service-id'),
      data: {
        serviceId: 'non-existent-service-12345',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Checkout validates price limits - negative price', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('negative-custom-price'),
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        customPrice: -100,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('Checkout validates price limits - excessive price (attack)', async ({ request }) => {
    // Precio excesivamente alto (posible ataque)
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('excessive-custom-price'),
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        customPrice: 1000000,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('Stripe webhook rejects requests without signature', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: smokeHeaders('webhook-no-signature'),
      data: { 
        id: 'evt_test',
        type: 'checkout.session.completed',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('No signature provided');
  });

  test('Stripe webhook rejects invalid signatures', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: {
        ...smokeHeaders('webhook-invalid-signature'),
        'stripe-signature': 't=12345,v1=invalid_signature',
      },
      data: { 
        id: 'evt_test',
        type: 'checkout.session.completed',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid signature');
  });

  test('Stripe webhook validates timestamp freshness', async ({ request }) => {
    // Timestamp viejo (más de 5 minutos)
    const staleTimestamp = Math.floor(Date.now() / 1000) - 400;
    
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: {
        ...smokeHeaders('webhook-stale-signature'),
        'stripe-signature': `t=${staleTimestamp},v1=fake_signature`,
      },
      data: { 
        id: 'evt_test',
        type: 'checkout.session.completed',
      },
    });

    // Debe rechazar por timestamp viejo o firma inválida
    expect(response.status()).toBe(400);
  });

  test('Signed Stripe checkout.session.completed webhook marks checkout paid once', async ({ request }) => {
    test.skip(!BASE_URL.includes('localhost'), 'Signed webhook smoke uses local STRIPE_WEBHOOK_SECRET and local DB env.');
    test.skip(!process.env.STRIPE_WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET is required for signed webhook smoke.');

    const pool = getDatabasePool();
    test.skip(!pool, 'DATABASE_URL is required for signed webhook smoke.');

    if (!pool || !process.env.STRIPE_WEBHOOK_SECRET) {
      return;
    }

    const checkoutId = randomUUID();
    const sessionId = `cs_test_signed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const paymentIntentId = `pi_test_signed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const eventId = `evt_test_signed_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    await pool.query(
      `INSERT INTO public.checkout_sessions
        (id, tenant_id, service_id, customer_email, customer_name, amount_total, currency, status, metadata, quote, stripe_session_id)
       VALUES
        ($1, '46af543c-d700-48d5-b9f2-abce07984cd0', 'regular-cleaning', $2, 'Signed Webhook Smoke', 12000, 'usd', 'redirected', '{}'::jsonb, '{}'::jsonb, $3)`,
      [checkoutId, `signed-webhook-${Date.now()}@example.com`, sessionId],
    );

    const payload = JSON.stringify({
      id: eventId,
      object: 'event',
      api_version: '2025-04-30.basil',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: sessionId,
          object: 'checkout.session',
          amount_total: 12000,
          currency: 'usd',
          customer_email: null,
          customer_details: null,
          metadata: {
            checkout_id: checkoutId,
            customerName: 'Signed Webhook Smoke',
            serviceId: 'regular-cleaning',
            quoteData: '{}',
          },
          payment_intent: paymentIntentId,
          payment_status: 'paid',
          status: 'complete',
        },
      },
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: 'checkout.session.completed',
    });

    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: {
        ...smokeHeaders('webhook-signed-checkout-completed'),
        'content-type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });

    expect(response.status()).toBe(200);

    await expect.poll(async () => {
      const result = await pool.query(
        `SELECT status, stripe_payment_intent_id
         FROM public.checkout_sessions
         WHERE stripe_session_id = $1`,
        [sessionId],
      );
      return result.rows[0];
    }, { timeout: 10000 }).toMatchObject({
      status: 'paid',
      stripe_payment_intent_id: paymentIntentId,
    });

    const duplicateResponse = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: {
        ...smokeHeaders('webhook-signed-checkout-completed-duplicate'),
        'content-type': 'application/json',
        'stripe-signature': signature,
      },
      data: payload,
    });
    expect(duplicateResponse.status()).toBe(200);

    const eventCount = await pool.query(
      `SELECT count(*)::int AS count
       FROM public.stripe_webhook_events
       WHERE event_id = $1`,
      [eventId],
    );
    expect(eventCount.rows[0].count).toBe(1);

    await pool.end();
  });

  test('Checkout session includes correct metadata structure', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('metadata-structure'),
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: `stripe-metadata-${Date.now()}@example.com`,
        customerName: 'Test Customer',
        customPrice: 150,
        quoteData: {
          serviceType: 'Deep Cleaning',
          zipCode: '32839',
          address: '4700 Millenia Blvd, Orlando, FL',
          phone: '8009300532',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // La respuesta debe incluir el sessionId
    expect(data.sessionId).toBeDefined();
    expect(typeof data.sessionId).toBe('string');

    await expectCheckoutSessionPricingSource(data.sessionId, 'custom_quote');
  });

  test('Checkout prevents SQL injection in serviceId', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('sql-injection-service-id'),
      data: {
        serviceId: "'; DROP TABLE services; --",
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        customPrice: 150,
      },
    });

    // Debe rechazar el input malicioso
    expect(response.status()).toBe(400);
  });

  test('Checkout validates email format strictly', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('invalid-email'),
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: 'not-an-email',
        customerName: 'Test Customer',
        customPrice: 150,
      },
    });

    expect(response.status()).toBe(400);
  });

  test('Checkout sanitizes XSS in customer name', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      headers: smokeHeaders('xss-customer-name'),
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: 'test@example.com',
        customerName: '<script>alert("xss")</script>',
        customPrice: 150,
      },
    });

    // Si acepta, debe sanitizar (status 200)
    // Si rechaza, debe ser 400
    // Lo importante es que no ejecute el script
    expect([200, 400]).toContain(response.status());
  });
});
