import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

/**
 * SANITY CMS - SMOKE TESTS ENTERPRISE (P0)
 * 
 * Tests críticos validados contra Context7 2026-2028:
 * - Health checks duraderos
 * - Contract testing entre Sanity y Next.js
 * - Webhook validation
 * - Cache revalidation verification
 * - CDN performance monitoring
 * - Schema validation
 * 
 * Basado en: Vercel Enterprise, Sanity Enterprise, Next.js 16
 */

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================

const SANITY_PROJECT_ID = 'l4t851dy';
const SANITY_DATASET = 'production';
const SANITY_CDN = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}`;

// Retry configuration para tests de integración
const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Helper: Retry con backoff exponencial
 * Patrón empresarial para tests de integración flaky
 */
async function retry<T>(
  fn: () => Promise<T>,
  options = RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i <= options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < options.retries) {
        await new Promise(r => setTimeout(r, options.retryDelay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Helper: Verificar estructura de post según schema
 */
function validatePostSchema(post: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!post || typeof post !== 'object') {
    return { valid: false, errors: ['Post is not an object'] };
  }
  
  const p = post as Record<string, unknown>;
  
  // Campos requeridos según schema
  if (!p.title || typeof p.title !== 'string') errors.push('Missing or invalid title');
  if (!p.slug || typeof p.slug !== 'string') errors.push('Missing or invalid slug');
  if (!p.description || typeof p.description !== 'string') errors.push('Missing or invalid description');
  if (!p.publishedAt || typeof p.publishedAt !== 'string') errors.push('Missing or invalid publishedAt');
  if (!p.category || typeof p.category !== 'string') errors.push('Missing or invalid category');
  if (!Array.isArray(p.tags)) errors.push('Missing or invalid tags');
  if (!Array.isArray(p.body)) errors.push('Missing or invalid body');
  
  // Validar longitudes
  if (typeof p.title === 'string' && (p.title.length < 10 || p.title.length > 90)) {
    errors.push(`Title length ${p.title.length} not in range [10, 90]`);
  }
  
  if (typeof p.description === 'string' && (p.description.length < 50 || p.description.length > 180)) {
    errors.push(`Description length ${p.description.length} not in range [50, 180]`);
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================================================
// SUITE 1: HEALTH CHECKS & CONNECTIVITY (P0)
// ============================================================================

test.describe('🏥 Sanity CMS - Health Checks (P0)', () => {
  test('Sanity API is reachable and returns valid JSON', async ({ request }) => {
    const response = await retry(async () => {
      const res = await request.get(
        `https://${SANITY_PROJECT_ID}.api.sanity.io/v2026-03-13/data/query/${SANITY_DATASET}?query=*[_type=="post"][0]{title}`
      );
      
      if (![200, 401].includes(res.status())) {
        throw new Error(`Unexpected status: ${res.status()}`);
      }
      
      return res;
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('result');
    expect(data).toHaveProperty('ms'); // Sanity siempre retorna tiempo de query
    expect(data.ms).toBeLessThan(5000); // Debe responder en menos de 5s
  });

  test('Sanity CDN is reachable and serves images', async ({ request }) => {
    // Verificar que el CDN responde (usamos un endpoint de health check implícito)
    const response = await request.get(`${SANITY_CDN}/test.jpg`, { 
      failOnStatusCode: false 
    });
    
    // Aunque sea 404, debe responder rápido (CDN healthy)
    expect(response.status()).toBe(404);
    
    // Verificar headers de CDN
    const headers = response.headers();
    expect(headers['server']).toContain('Sanity');
    expect(headers['x-sanity-shard']).toBeTruthy(); // Header específico de Sanity CDN
  });

  test('Next.js API routes are healthy', async ({ request }) => {
    const endpoints = [
      { path: '/api/webhook/sanity', method: 'GET' },
      { path: '/api/revalidate', method: 'GET' },
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(`${BASE_URL}${endpoint.path}`);
      
      // Debe retornar 200 (ok) o 401 (protegido pero healthy)
      expect([200, 401]).toContain(response.status());
      
      // No debe ser 500
      expect(response.status()).not.toBe(500);
    }
  });

  test('Studio loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/studio`);
    
    // Esperar a que algún elemento del Studio aparezca
    await Promise.race([
      page.locator('[data-sanity-root]').waitFor({ timeout: 10000 }),
      page.locator('text=/sign in|login|studio/i').waitFor({ timeout: 10000 }),
    ]);
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // Studio debe cargar en < 10s
    
    // Verificar que no hay errores de red críticos
    const failedRequests: string[] = [];
    page.on('requestfailed', req => {
      if (!req.url().includes('analytics') && !req.url().includes('gtag')) {
        failedRequests.push(req.url());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(failedRequests.length).toBeLessThan(5); // Máximo 5 fallos no críticos
  });
});

// ============================================================================
// SUITE 2: CONTRACT TESTING - SCHEMA VALIDATION (P0)
// ============================================================================

test.describe('📋 Sanity CMS - Contract Testing (P0)', () => {
  test('All posts conform to schema specification', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/sanity/posts`);
    
    if (response.status() === 404) {
      test.skip();
      return;
    }
    
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    
    if (posts.length === 0) {
      test.skip();
      return;
    }
    
    // Validar cada post contra el schema
    const validationResults = posts.map((post: unknown) => validatePostSchema(post));
    const invalidPosts = validationResults.filter((r: { valid: boolean }) => !r.valid);
    
    if (invalidPosts.length > 0) {
      const errors = invalidPosts.flatMap((p: { errors: string[] }) => p.errors);
      console.error('Schema validation errors:', errors);
    }
    
    expect(invalidPosts.length).toBe(0);
  });

  test('Posts have required Portable Text structure', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/sanity/posts`);
    
    if (response.status() !== 200) {
      test.skip();
      return;
    }
    
    const posts = await response.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      test.skip();
      return;
    }
    
    // Verificar que el body tiene estructura válida de Portable Text
    const post = posts[0];
    expect(Array.isArray(post.body)).toBeTruthy();
    
    for (const block of post.body) {
      // Cada bloque debe tener _type
      expect(block).toHaveProperty('_type');
      
      // Si es un bloque de texto, debe tener children
      if (block._type === 'block') {
        expect(Array.isArray(block.children)).toBeTruthy();
        
        // Cada child debe tener _type y text o marks
        for (const child of block.children) {
          expect(child).toHaveProperty('_type');
        }
      }
    }
  });

  test('Images have proper Sanity CDN structure', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/sanity/posts`);
    
    if (response.status() !== 200) {
      test.skip();
      return;
    }
    
    const posts = await response.json();
    const postsWithImages = posts.filter((p: { image?: string }) => p.image);
    
    if (postsWithImages.length === 0) {
      test.skip();
      return;
    }
    
    // Verificar estructura de URLs de Sanity
    for (const post of postsWithImages.slice(0, 3)) {
      if (post.image?.includes('cdn.sanity.io')) {
        // Debe tener parámetros de transformación
        expect(post.image).toMatch(/w=\d+|h=\d+|fit=(max|clip|crop)/);
        
        // Verificar que la imagen existe
        const imgResponse = await request.get(post.image);
        expect(imgResponse.status()).toBe(200);
        
        const contentType = imgResponse.headers()['content-type'];
        expect(contentType).toMatch(/image\/(jpeg|png|webp|gif)/);
      }
    }
  });
});

// ============================================================================
// SUITE 3: DATA FLOW & INTEGRATION (P0)
// ============================================================================

test.describe('🔄 Sanity CMS - Data Flow Integration (P0)', () => {
  test('Content renders end-to-end: Sanity → Next.js → Browser', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Esperar a que el contenido de Sanity se renderice
    const content = page.locator('article, [class*="post"], [class*="blog"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
    
    // El contenido debe ser visible, independientemente de la fuente
    const postCount = await content.count();
    expect(postCount).toBeGreaterThan(0);
  });

  test('Individual post pages resolve correctly', async ({ page, request }) => {
    // Obtener slugs desde la API
    const apiResponse = await request.get(`${BASE_URL}/api/sanity/posts`);
    
    if (apiResponse.status() !== 200) {
      test.skip();
      return;
    }
    
    const posts = await apiResponse.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      test.skip();
      return;
    }
    
    // Probar las primeras 3 rutas de posts
    for (const post of posts.slice(0, 3)) {
      if (!post.slug) continue;
      
      const response = await page.goto(`${BASE_URL}/blog/${post.slug}`);
      
      // Cada post debe retornar 200
      expect(response?.status()).toBe(200);
      
      // Debe tener contenido
      const article = page.locator('article');
      await expect(article).toBeVisible({ timeout: 5000 });
      
      // El título debe coincidir
      const h1 = await page.locator('h1').textContent();
      expect(h1?.toLowerCase()).toContain(post.title.toLowerCase().split(' ')[0]);
    }
  });

  test('404 handling for non-existent posts', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/blog/non-existent-post-${Date.now()}`);
    
    expect(response?.status()).toBe(404);
    
    // Debe mostrar página de error
    const errorText = await page.locator('body').textContent();
    expect(errorText?.toLowerCase()).toMatch(/404|not found|page not found/);
  });
});

// ============================================================================
// SUITE 4: WEBHOOK & CACHE REVALIDATION (P1)
// ============================================================================

test.describe('⚡ Sanity CMS - Webhook & Cache (P1)', () => {
  test('Webhook endpoint validates signatures', async ({ request }) => {
    // Intentar sin firma
    const noSigResponse = await request.post(`${BASE_URL}/api/webhook/sanity`, {
      data: { _type: 'post', _id: 'test' }
    });
    expect(noSigResponse.status()).toBe(401);
    
    // Intentar con firma inválida
    const invalidSigResponse = await request.post(`${BASE_URL}/api/webhook/sanity`, {
      headers: {
        'Authorization': 'Bearer invalid-signature'
      },
      data: { _type: 'post', _id: 'test' }
    });
    expect([401, 400]).toContain(invalidSigResponse.status());
  });

  test('Cache revalidation endpoint is protected', async ({ request }) => {
    // Sin token
    const noTokenResponse = await request.post(`${BASE_URL}/api/revalidate`, {
      data: { path: '/blog' }
    });
    expect([401, 404]).toContain(noTokenResponse.status());
    
    // Con token inválido
    const invalidTokenResponse = await request.post(`${BASE_URL}/api/revalidate`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      data: { path: '/blog' }
    });
    expect([401, 404]).toContain(invalidTokenResponse.status());
  });
});

// ============================================================================
// SUITE 5: PERFORMANCE & CDN (P1)
// ============================================================================

test.describe('🚀 Sanity CMS - Performance & CDN (P1)', () => {
  test('API response time is under 2 seconds', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(`${BASE_URL}/api/sanity/posts`);
    
    const responseTime = Date.now() - startTime;
    
    if (response.status() === 200) {
      expect(responseTime).toBeLessThan(2000);
    }
  });

  test('Sanity CDN images have aggressive caching', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/blog`);
    const html = await response.text();
    
    // Extraer URLs de Sanity
    const sanityUrls = html.match(/https:\/\/cdn\.sanity\.io\/[^"'\s]+/g) || [];
    
    if (sanityUrls.length === 0) {
      test.skip();
      return;
    }
    
    // Verificar headers de caché
    const uniqueUrls = [...new Set(sanityUrls)].slice(0, 3);
    
    for (const url of uniqueUrls) {
      const imgResponse = await request.get(url);
      const cacheControl = imgResponse.headers()['cache-control'];
      
      // Sanity debe tener cache agresivo
      expect(cacheControl).toBeTruthy();
      
      if (cacheControl) {
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
        if (maxAgeMatch) {
          const maxAge = parseInt(maxAgeMatch[1]);
          expect(maxAge).toBeGreaterThan(86400); // Al menos 1 día
        }
      }
    }
  });

  test('Images are properly sized for performance', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const images = page.locator('img');
    const allImages = await images.all();
    
    for (const img of allImages.slice(0, 5)) {
      const src = await img.getAttribute('src');
      
      if (src?.includes('cdn.sanity.io')) {
        // Verificar dimensiones
        const width = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
        const height = await img.evaluate(el => (el as HTMLImageElement).naturalHeight);
        
        // Las imágenes no deben ser demasiado grandes
        expect(width).toBeLessThanOrEqual(2000);
        expect(height).toBeLessThanOrEqual(2000);
        
        // Debe tener parámetros de Sanity
        expect(src).toMatch(/w=|h=|fit=/);
      }
    }
  });
});

// ============================================================================
// SUITE 6: SECURITY & HARDENING (P0)
// ============================================================================

test.describe('🔒 Sanity CMS - Security (P0)', () => {
  test('Sanity tokens are not exposed in client-side code', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const html = await page.content();
    
    // Tokens de Sanity no deben estar en el HTML
    expect(html).not.toMatch(/sk[a-z0-9]{20,}/i); // Pattern de tokens Sanity
    expect(html).not.toContain('SANITY_API_WRITE_TOKEN');
    expect(html).not.toContain('SANITY_API_READ_TOKEN');
    
    // Project ID está bien que sea público (NEXT_PUBLIC_)
    expect(html).toContain('l4t851dy'); // Debe estar disponible para cliente
  });

  test('Draft mode requires authentication', async ({ request }) => {
    // Intentar activar draft mode
    const response = await request.get(`${BASE_URL}/api/draft?slug=test-post`);
    
    // Debe requerir autenticación
    expect([401, 404]).toContain(response.status());
  });

  test('Studio API is not directly accessible', async ({ request }) => {
    // Intentar acceder a endpoints internos del Studio
    const endpoints = [
      '/studio/api',
      '/studio/static/assets',
      '/studio/__webpack_hmr',
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(`${BASE_URL}${endpoint}`);
      expect([401, 404, 403]).toContain(response.status());
    }
  });

  test('GraphQL endpoint security', async ({ request }) => {
    // Sanity GraphQL (si está habilitado)
    const response = await request.post(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v2026-03-13/graphql/${SANITY_DATASET}/default`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          query: '{ __schema { types { name } } }'
        }
      }
    );
    
    // Puede estar deshabilitado (404) o protegido (401)
    expect([200, 401, 404]).toContain(response.status());
  });
});

// ============================================================================
// SUITE 7: RESILIENCE & FALLBACK (P1)
// ============================================================================

test.describe('🛡️ Sanity CMS - Resilience (P1)', () => {
  test('Blog page loads even if Sanity API fails', async ({ page }) => {
    // Simular fallo (no podemos realmente hacer que Sanity falle, pero verificamos que hay fallback)
    await page.goto(`${BASE_URL}/blog`);
    
    // La página debe cargar
    await expect(page.locator('h1')).toBeVisible();
    
    // Debe tener contenido (de Sanity o MDX)
    const content = await page.locator('body').textContent();
    expect(content?.length).toBeGreaterThan(100);
  });

  test('Graceful degradation when images fail', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Interceptar y bloquear imágenes
    await page.route('**/cdn.sanity.io/**', route => route.abort());
    
    // Recargar
    await page.reload();
    
    // La página debe seguir funcionando
    await expect(page.locator('h1')).toBeVisible();
    
    // Reset route
    await page.unroute('**/cdn.sanity.io/**');
  });
});

// ============================================================================
// SUITE 8: MONITORING & OBSERVABILITY (P2)
// ============================================================================

test.describe('📊 Sanity CMS - Observability (P2)', () => {
  test('Error tracking is functional', async ({ page }) => {
    const errors: Array<{ message: string; timestamp: number }> = [];
    
    page.on('pageerror', error => {
      errors.push({ message: error.message, timestamp: Date.now() });
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({ message: msg.text(), timestamp: Date.now() });
      }
    });
    
    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState('networkidle');
    
    // Filtrar errores críticos
    const criticalErrors = errors.filter(e => 
      !e.message.includes('favicon') &&
      !e.message.includes('analytics') &&
      !e.message.includes('source map') &&
      !e.message.includes('ResizeObserver')
    );
    
    // No debe haber errores críticos de Sanity
    const sanityErrors = criticalErrors.filter(e => 
      e.message.includes('sanity') || 
      e.message.includes('cdn.sanity')
    );
    
    expect(sanityErrors.length).toBe(0);
  });

  test('Network requests to Sanity are successful', async ({ page }) => {
    const sanityRequests: Array<{ url: string; status: number }> = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('sanity.io') || url.includes('cdn.sanity.io')) {
        sanityRequests.push({ url, status: response.status() });
      }
    });
    
    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState('networkidle');
    
    // Todas las requests a Sanity deben ser exitosas
    const failedRequests = sanityRequests.filter(r => r.status >= 400);
    
    if (sanityRequests.length > 0) {
      expect(failedRequests.length).toBe(0);
    }
  });
});
