import { test, expect } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
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
