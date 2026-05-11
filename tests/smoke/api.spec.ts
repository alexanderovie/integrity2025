import { test, expect } from '@playwright/test';
import { BASE_URL, CRITICAL_APIS } from '../helpers/constants';

test.describe('Critical API Endpoints', () => {
  for (const endpoint of CRITICAL_APIS) {
    test(`${endpoint} responds with 200`, async ({ request }) => {
      const res = await request.get(`${BASE_URL}${endpoint}`);
      expect(res.status()).toBe(200);
    });

    test(`${endpoint} returns valid JSON`, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${endpoint}`);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
      
      const body = await response.json();
      expect(body).toBeDefined();
    });
  }

  test('Catalog API contains services', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/catalog`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.servicios).toBeDefined();
    expect(Array.isArray(data.servicios)).toBe(true);
    expect(data.servicios.length).toBeGreaterThan(0);
  });

  test('Addons API returns array', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/addons`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

test.describe('SEO & Performance', () => {
  test('Sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/xml');
  });

  test('Robots.txt is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);
  });

  test('Manifest.json is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/manifest.json`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/application\/(manifest\+)?json/);
  });
});

test.describe('HubSpot Integration Smoke', () => {
  test('HubSpot pipeline endpoint requires internal auth', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/hubspot/pipelines?object=deals`);
    expect([401, 503]).toContain(response.status());
  });

  test('HubSpot pipeline endpoint returns expected deal stages with internal auth when configured', async ({ request }) => {
    const internalSecret = process.env.INTERNAL_API_SECRET || process.env.REVALIDATE_SECRET;

    if (!internalSecret) {
      test.skip(true, 'INTERNAL_API_SECRET or REVALIDATE_SECRET is not configured.');
      return;
    }

    const response = await request.get(`${BASE_URL}/api/hubspot/pipelines?object=deals`, {
      headers: {
        authorization: `Bearer ${internalSecret}`,
      },
    });
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.object).toBe('deals');
    expect(Array.isArray(data.pipelines)).toBe(true);
    expect(data.pipelines.length).toBeGreaterThan(0);

    const defaultPipeline = data.pipelines.find((pipeline: { id: string }) => pipeline.id === 'default');
    expect(defaultPipeline).toBeDefined();

    const stageIds = (defaultPipeline?.stages || []).map((stage: { id: string }) => stage.id);
    expect(stageIds).toContain('appointmentscheduled');
    expect(stageIds).toContain('closedwon');
    expect(stageIds).toContain('closedlost');
  });

  test('HubSpot webhook endpoint rejects requests without signature headers', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/hubspot/webhooks`, {
      data: [{ subscriptionType: 'contact.creation', objectId: '123' }],
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Missing signature');
  });

  test('HubSpot webhook endpoint rejects stale timestamps', async ({ request }) => {
    const staleTimestamp = Date.now() - 10 * 60 * 1000;

    const response = await request.post(`${BASE_URL}/api/hubspot/webhooks`, {
      headers: {
        'x-hubspot-signature-v3': 'invalid-signature',
        'x-hubspot-request-timestamp': String(staleTimestamp),
      },
      data: [{ subscriptionType: 'contact.creation', objectId: '123' }],
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid timestamp');
  });
});

test.describe('Stripe Integration Smoke', () => {
  test('Checkout endpoint rejects requests missing customer identity', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      data: {
        serviceId: 'regular-cleaning',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Checkout endpoint returns field errors for invalid quote payload', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      data: {
        serviceId: 'regular-cleaning',
        customerEmail: 'alexanderovie@gmail.com',
        customerName: 'Smoke Test',
        customPrice: 120,
        quoteData: {
          serviceType: 'Regular Cleaning',
          zipCode: '32839',
          address: '4700 Millenia Blvd, Orlando, FL',
          phone: 'invalid-phone',
        },
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid quote details.');
    expect(data.fields).toBeDefined();
    expect(data.fields.phone?.[0]).toBeDefined();
  });

  test('Stripe webhook endpoint rejects unsigned requests', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      data: { id: 'evt_smoke_unsigned' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('No signature provided');
  });

  test('Stripe webhook endpoint rejects invalid signatures', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      headers: {
        'stripe-signature': 't=12345,v1=invalid',
      },
      data: { id: 'evt_smoke_invalid_sig' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid signature');
  });
});

test.describe('Lead Form Validation Smoke', () => {
  test('Contact endpoint validates required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Contact endpoint validates email format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Smoke Contact',
        email: 'bad-email',
        phone: '8009300532',
        message: 'hello',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  test('Newsletter endpoint validates missing email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/newsletter`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Email is required');
  });

  test('Newsletter endpoint validates invalid email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/newsletter`, {
      data: { email: 'invalid-email' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  test('Help endpoint validates required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/help`, {
      data: { name: 'Smoke User' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Help endpoint validates phone format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/help`, {
      data: {
        name: 'Smoke User',
        email: 'smoke@example.com',
        phone: 'invalid-phone',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('phone');
  });

  test('Join our team endpoint validates required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Smoke Applicant',
        email: 'alexanderovie@gmail.com',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Join our team endpoint validates email format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Smoke Applicant',
        email: 'bad-email',
        phone: '8009300532',
        city: 'Orlando',
        role: 'Cleaner',
        availability: 'Full-time',
        workAuthorization: 'Yes',
        transportation: 'Yes',
        summary: 'Experienced cleaner',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  test('Join our team endpoint validates phone format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Smoke Applicant',
        email: 'smoke@example.com',
        phone: 'invalid-phone',
        city: 'Orlando',
        role: 'Cleaner',
        availability: 'Full-time',
        workAuthorization: 'Yes',
        transportation: 'Yes',
        summary: 'Experienced cleaner',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('phone');
  });

  test('Join our team endpoint rejects header injection', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Smoke Applicant',
        email: 'smoke@example.com\r\nBcc: attacker@example.com',
        phone: '8009300532',
        city: 'Orlando',
        role: 'Cleaner',
        availability: 'Full-time',
        workAuthorization: 'Yes',
        transportation: 'Yes',
        summary: 'Experienced cleaner',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid input');
  });
});
