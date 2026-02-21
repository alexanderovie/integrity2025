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
    expect(response.headers()['content-type']).toContain('application/manifest+json');
  });
});

test.describe('HubSpot Integration Smoke', () => {
  test('HubSpot pipeline endpoint is reachable and returns expected deal stages', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/hubspot/pipelines?object=deals`);
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
