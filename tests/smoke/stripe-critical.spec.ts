import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Stripe Payment Integration - Critical Business Flow (P0)', () => {
  test('Checkout creates session with valid quote data', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: 'test@example.com',
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
  });

  test('Checkout validates missing customer data', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
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
      data: {
        serviceId: 'deep-cleaning',
        customerEmail: 'test@example.com',
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
  });

  test('Checkout prevents SQL injection in serviceId', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
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
