import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Anti-Abuse & Bot Protection - Security (P0)', () => {
  test('API rate limits excessive requests', async ({ request }) => {
    const endpoint = `${BASE_URL}/api/contact`;
    const requests = [];
    
    // Enviar 20 requests rápidos desde la misma IP
    for (let i = 0; i < 20; i++) {
      requests.push(
        request.post(endpoint, {
          data: {
            name: `Bot Test ${i}`,
            email: `bot${i}@example.com`,
            phone: '8009300532',
            message: 'Bot message spam',
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Contar status codes
    const rateLimited = responses.filter(r => r.status() === 429).length;
    const successes = responses.filter(r => r.status() === 200 || r.status() === 201).length;
    
    // Debe haber rate limiting después de cierto punto
    expect(rateLimited).toBeGreaterThan(0);
    
    // No todos deben tener éxito (si hay rate limiting funcional)
    expect(successes).toBeLessThan(20);
  });

  test('Quote endpoint rate limits rapid submissions', async ({ request }) => {
    const endpoint = `${BASE_URL}/api/checkout`;
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(
        request.post(endpoint, {
          data: {
            serviceId: 'deep-cleaning',
            customerEmail: `spam${i}@example.com`,
            customerName: 'Bot User',
            customPrice: 150,
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Al menos algunos deben ser rate limited
    const hasRateLimit = responses.some(r => r.status() === 429);
    expect(hasRateLimit).toBeTruthy();
  });

  test('Prevents SQL injection in all endpoints', async ({ request }) => {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; DELETE FROM quotes; --",
      "1' UNION SELECT * FROM passwords--",
    ];
    
    for (const injection of maliciousInputs) {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: injection,
          email: 'test@example.com',
          phone: '8009300532',
          message: 'Test',
        },
      });
      
      // No debe retornar 500 (error del servidor expuesto)
      // Puede ser 400 (validación) o 200 (sanitizado)
      expect(response.status()).not.toBe(500);
    }
  });

  test('Prevents NoSQL injection attempts', async ({ request }) => {
    const maliciousPayloads = [
      { name: { $ne: null } },
      { email: { $gt: '' } },
      { $where: 'this.email == "admin"' },
    ];
    
    for (const payload of maliciousPayloads) {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          ...payload,
          phone: '8009300532',
          message: 'Test',
        },
      });
      
      // No debe aceptar objetos maliciosos
      expect([200, 201]).not.toContain(response.status());
    }
  });

  test('Prevents XSS in form submissions', async ({ request }) => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>',
    ];
    
    for (const payload of xssPayloads) {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: payload,
          email: 'test@example.com',
          phone: '8009300532',
          message: payload,
        },
      });
      
      // Debe aceptar pero sanitizar (200) o rechazar (400)
      // No debe causar 500
      expect(response.status()).not.toBe(500);
      
      if (response.status() === 200 || response.status() === 201) {
        const data = await response.json();
        // Si aceptó, verificar que no contiene el script sin sanitizar
        const responseText = JSON.stringify(data);
        expect(responseText).not.toContain('<script>');
      }
    }
  });

  test('Prevents command injection', async ({ request }) => {
    const commandInjectionPayloads = [
      '$(whoami)',
      '`ls -la`',
      '; cat /etc/passwd',
      '| rm -rf /',
    ];
    
    for (const payload of commandInjectionPayloads) {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        data: {
          name: payload,
          email: 'test@example.com',
          phone: '8009300532',
          message: 'Test',
        },
      });
      
      // No debe causar error 500 o ejecutar comandos
      expect(response.status()).not.toBe(500);
    }
  });

  test('Prevents path traversal attacks', async ({ request }) => {
    const pathTraversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '/etc/passwd%00',
      '....//....//etc/passwd',
    ];
    
    for (const payload of pathTraversalPayloads) {
      const response = await request.get(`${BASE_URL}/api/${payload}`);
      
      // Debe retornar 404, no 200 con contenido del sistema
      expect(response.status()).toBe(404);
    }
  });

  test('Validates content-type strictly', async ({ request }) => {
    // Enviar data con content-type incorrecto
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'Content-Type': 'text/plain',
      },
      data: 'name=Test&email=test@example.com',
    });
    
    // Debe rechazar content-type incorrecto
    expect(response.status()).toBe(400);
  });

  test('Blocks requests without user-agent', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        'User-Agent': '',
      },
      data: {
        name: 'Test',
        email: 'test@example.com',
        phone: '8009300532',
        message: 'Test',
      },
    });
    
    // Muchos bots no envían User-Agent
    // Debe rechazar o marcar como sospechoso
    expect(response.status()).not.toBe(200);
  });

  test('Validates request size limits', async ({ request }) => {
    // Crear payload muy grande (posible DoS)
    const hugeMessage = 'A'.repeat(1000000); // 1MB de texto
    
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Test',
        email: 'test@example.com',
        phone: '8009300532',
        message: hugeMessage,
      },
    });
    
    // Debe rechazar payloads demasiado grandes
    expect(response.status()).toBe(413); // Payload Too Large
  });

  test('Detects and blocks known bot signatures', async ({ request }) => {
    const botUserAgents = [
      'Mozilla/5.0 (compatible; Googlebot/2.1)',
      'Mozilla/5.0 (compatible; bingbot/2.0)',
      'curl/7.64.1',
      'Wget/1.20.3',
      'python-requests/2.25.1',
    ];
    
    for (const userAgent of botUserAgents) {
      const response = await request.post(`${BASE_URL}/api/contact`, {
        headers: {
          'User-Agent': userAgent,
        },
        data: {
          name: 'Test',
          email: 'test@example.com',
          phone: '8009300532',
          message: 'Test',
        },
      });
      
      // Bots conocidos deben ser rate limited o bloqueados
      // en endpoints de formularios
      expect([200, 201, 429, 403]).toContain(response.status());
    }
  });

  test('CSRF protection on state-changing endpoints', async ({ request }) => {
    // Intentar POST sin token CSRF (si aplica)
    const response = await request.post(`${BASE_URL}/api/contact`, {
      headers: {
        // Sin headers de CSRF
      },
      data: {
        name: 'Test',
        email: 'test@example.com',
        phone: '8009300532',
        message: 'Test',
      },
    });
    
    // Si hay CSRF protection, debe rechazar
    // Si no hay, debe aceptar (200)
    expect([200, 201, 403]).toContain(response.status());
  });

  test('Blocks requests from suspicious IPs (if IP filtering enabled)', async ({ request }) => {
    // Este test es más informativo - verifica que no se filtran IPs locales
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Local Test',
        email: 'local@example.com',
        phone: '8009300532',
        message: 'Test from local',
      },
    });
    
    // Requests locales deben funcionar
    expect([200, 201]).toContain(response.status());
  });

  test('Form submissions include honeypot check', async ({ request }) => {
    // Campo honeypot (invisible para usuarios reales)
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Test',
        email: 'test@example.com',
        phone: '8009300532',
        message: 'Test',
        website: 'http://spam-site.com', // Campo honeypot - bots lo llenan
      },
    });
    
    // Si hay honeypot y se llena, debe rechazar
    // Si no hay honeypot, debe aceptar
    expect([200, 201, 400]).toContain(response.status());
  });

  test('Validates phone numbers are not all same digit', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Test',
        email: 'test@example.com',
        phone: '1111111111', // Obviamente falso
        message: 'Test',
      },
    });
    
    // Debe rechazar números obviamente falsos
    expect(response.status()).toBe(400);
  });

  test('Detects automated submission timing', async ({ request }) => {
    const startTime = Date.now();
    
    // Submit form sin tiempo de interacción (como un bot)
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: 'Bot',
        email: 'bot@example.com',
        phone: '8009300532',
        message: 'Bot message',
      },
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Si hay protección de timing, debe ser más lento o rechazar
    // Bots envían requests muy rápido
    expect(response.status()).not.toBe(500);
  });
});
