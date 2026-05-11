import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Resend Email Notifications - Communication (P1)', () => {
  test('Contact form sends email notification', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Email Test User',
        email: 'emailtest@example.com',
        phone: '8009300532',
        message: 'This is a test message from smoke tests',
        service: 'Deep Cleaning',
      },
    });

    // Debe aceptar el request (el envío de email es async)
    expect([200, 201, 202]).toContain(response.status());
    
    const data = await response.json();
    expect(data.success || data.message || data.id).toBeDefined();
  });

  test('Contact form validates required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Contact form validates email format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Test User',
        email: 'not-an-email',
        phone: '8009300532',
        message: 'Test message',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  test('Newsletter subscription works', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post(`${BASE_URL}/api/newsletter`, {
      data: {
        email: `newsletter-test-${timestamp}@example.com`,
      },
    });

    expect([200, 201]).toContain(response.status());
    
    const data = await response.json();
    expect(data.success || data.message || data.subscribed).toBeDefined();
  });

  test('Newsletter validates missing email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/newsletter`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Email is required');
  });

  test('Newsletter validates invalid email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/newsletter`, {
      data: { email: 'invalid-email' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('valid email');
  });

  test('Help request form sends notification', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/help`, {
      data: {
        name: 'Help Test User',
        phone: '8009300532',
        email: 'helptest@example.com',
        notes: 'Test help request',
      },
    });

    expect([200, 201]).toContain(response.status());
  });

  test('Help form validates required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/help`, {
      data: { name: 'Test User' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Help form validates phone format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/help`, {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        phone: 'not-a-phone',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('phone');
  });

  test('Join our team application sends email', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Job Applicant',
        email: `applicant-${timestamp}@example.com`,
        phone: '8009300532',
        city: 'Orlando',
        role: 'Cleaner',
        availability: 'Full-time',
        workAuthorization: 'Yes',
        transportation: 'Yes',
        summary: 'Experienced cleaner looking for work',
      },
    });

    expect([200, 201]).toContain(response.status());
  });

  test('Job application validates email format', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Job Applicant',
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

  test('Job application validates required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/join-our-team`, {
      data: {
        name: 'Job Applicant',
        email: 'test@example.com',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('Email forms prevent header injection', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Test',
        email: 'test@example.com\r\nBcc: attacker@evil.com',
        phone: '8009300532',
        message: 'Test',
      },
    });

    // Debe rechazar o sanitizar el email con headers
    expect(response.status()).not.toBe(200);
  });

  test('Contact form rate limits rapid submissions', async ({ request }) => {
    const requests = [];
    
    // Enviar 5 requests rápidos
    for (let i = 0; i < 5; i++) {
      requests.push(
        request.post(`${BASE_URL}/api/contact`, {
          data: {
            name: `Spam Test ${i}`,
            email: `spam${i}@example.com`,
            phone: '8009300532',
            message: 'Spam message',
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Algunos deben ser rate limited (429)
    const hasRateLimit = responses.some(r => r.status() === 429);
    
    // Debe haber rate limiting o al menos no aceptar todos
    expect(hasRateLimit || !responses.every(r => r.status() === 200)).toBeTruthy();
  });
});
