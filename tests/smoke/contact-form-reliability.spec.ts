import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Contact form reliability', () => {
  test('returns validation errors without creating a submission', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'User-Agent': `Mozilla/5.0 contact-validation-smoke-${Date.now()}`,
      },
      data: {},
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['x-ratelimit-limit']).toBe('5');
    await expect(response.json()).resolves.toEqual({
      error: 'Name, email, and message are required.',
    });
  });

  test('blocks obvious automation user agents before submission work', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'User-Agent': 'curl/8.0 contact-bot-smoke',
      },
      data: {
        name: 'Smoke Tester',
        email: 'smoke@example.com',
        phone: '8009300532',
        message: 'This request should be blocked before persistence.',
      },
    });

    expect(response.status()).toBe(403);
  });

  test('rate limits repeated contact attempts', async ({ request }) => {
    const userAgent = `Mozilla/5.0 contact-rate-smoke-${Date.now()}`;
    const responses = [];

    for (let i = 0; i < 6; i += 1) {
      responses.push(
        await request.post(`${BASE_URL}/api/contact`, {
          headers: {
            'User-Agent': userAgent,
          },
          data: {},
        }),
      );
    }

    expect(responses.slice(0, 5).map((response) => response.status())).toEqual([
      400,
      400,
      400,
      400,
      400,
    ]);
    expect(responses[5].status()).toBe(429);
  });
});
