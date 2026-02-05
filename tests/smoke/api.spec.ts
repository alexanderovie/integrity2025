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
