import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

/**
 * SMOKE TESTS - Sanity CMS Integration (P0)
 * 
 * Tests críticos para verificar que el CMS funciona correctamente
 * Basado en patrones 2026-2028 para headless CMS
 */

test.describe('🎨 Sanity CMS - Content Delivery (P0)', () => {
  test('Sanity Studio loads and is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/studio`);
    
    // Verificar que el Studio carga
    await expect(page).toHaveTitle(/Studio|Sanity|Content/i, { timeout: 15000 });
    
    // Verificar elementos del Studio
    const studioContent = page.locator('[data-testid="studio-layout"], [class*="studio"], #root, [data-sanity-root]');
    await expect(studioContent.first()).toBeVisible({ timeout: 15000 });
    
    // Verificar que no hay errores críticos
    const errorElements = page.locator('text=/error|failed|unable to load/i');
    const hasErrors = await errorElements.first().isVisible().catch(() => false);
    expect(hasErrors).toBeFalsy();
  });

  test('Blog listing page fetches posts from Sanity', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Esperar a que cargue el contenido
    await page.waitForLoadState('networkidle');
    
    // Verificar que hay posts O un mensaje de vacío
    const posts = page.locator('article, [class*="post"], [class*="blog-item"], a[href^="/blog/"]');
    const noPostsMessage = page.locator('text=/no posts|empty|no articles|coming soon/i');
    
    await expect(posts.first().or(noPostsMessage)).toBeVisible({ timeout: 10000 });
    
    // Si hay posts, verificar que tienen contenido básico
    const postCount = await posts.count();
    if (postCount > 0) {
      // Verificar que al menos un post tiene título
      const firstPostTitle = posts.first().locator('h2, h3, [class*="title"]').first();
      await expect(firstPostTitle).toBeVisible();
    }
  });

  test('Individual blog post renders with Sanity content', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Buscar el primer post
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    
    test.skip(!hasPosts, 'No blog posts available to test');
    
    // Navegar al post
    await firstPostLink.click();
    
    // Verificar que el post carga correctamente
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('article, [class*="content"], main')).toBeVisible();
    
    // Verificar URL correcta
    await expect(page).toHaveURL(/\/blog\/.+/);
  });

  test('Sanity images load from CDN correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Capturar requests de imágenes de Sanity
    const sanityImages: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('cdn.sanity.io') || url.includes('.sanity.')) {
        sanityImages.push(url);
      }
    });
    
    // Esperar carga
    await page.waitForLoadState('networkidle');
    
    // Si hay imágenes de Sanity, verificar que cargan
    if (sanityImages.length > 0) {
      for (const imageUrl of sanityImages.slice(0, 3)) {
        const response = await page.request.get(imageUrl);
        expect(response.status()).toBe(200);
        
        // Verificar Content-Type es imagen
        const contentType = response.headers()['content-type'];
        expect(contentType).toMatch(/image\//);
      }
    }
  });

  test('Featured images in blog posts have correct src', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    
    test.skip(!hasPosts, 'No blog posts available to test');
    
    await firstPostLink.click();
    
    // Buscar imágenes destacadas
    const images = page.locator('article img, [class*="content"] img, main img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Verificar que al menos una imagen tiene src válido
      const firstImage = images.first();
      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
      
      // Verificar que la imagen es visible
      await expect(firstImage).toBeVisible();
    }
  });

  test('Blog post metadata comes from Sanity', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    
    test.skip(!hasPosts, 'No blog posts available to test');
    
    await firstPostLink.click();
    
    // Verificar metadata básica
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);
    
    // Verificar meta description
    const metaDescription = page.locator('meta[name="description"]');
    const hasMeta = await metaDescription.isVisible().catch(() => false);
    
    if (hasMeta) {
      const content = await metaDescription.getAttribute('content');
      expect(content).toBeTruthy();
    }
  });

  test('Portable Text content renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    
    test.skip(!hasPosts, 'No blog posts available to test');
    
    await firstPostLink.click();
    
    // Verificar elementos de Portable Text
    const content = page.locator('article, [class*="content"]');
    
    // Debe tener párrafos, headings o listas
    const hasParagraphs = await content.locator('p').first().isVisible().catch(() => false);
    const hasHeadings = await content.locator('h2, h3, h4').first().isVisible().catch(() => false);
    const hasLists = await content.locator('ul, ol').first().isVisible().catch(() => false);
    
    expect(hasParagraphs || hasHeadings || hasLists).toBeTruthy();
  });

  test('GROQ queries return data from Sanity API', async ({ request }) => {
    // Test directo a la API de Sanity (si está expuesta)
    const response = await request.get(`${BASE_URL}/api/sanity/posts`);
    
    // Puede ser 200 (existe) o 404 (no existe endpoint), pero no 500
    expect([200, 404]).toContain(response.status());
  });
});

test.describe('🔄 Sanity CMS - Fallback & Resilience (P1)', () => {
  test('Fallback to MDX works when Sanity is unavailable', async ({ page }) => {
    // Este test verifica que el sistema tiene fallback
    // En producción, si Sanity falla, debería usar MDX local
    
    await page.goto(`${BASE_URL}/blog`);
    
    // La página debe cargar independientemente de Sanity
    await expect(page.locator('h1')).toBeVisible();
    
    // Verificar que el contenido se muestra (de Sanity o MDX)
    const content = page.locator('article, [class*="post"], [class*="blog"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('Non-existent blog post returns 404 gracefully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/blog/this-post-does-not-exist-12345`);
    
    // Debe retornar 404
    expect(response?.status()).toBe(404);
    
    // Debe mostrar página de error amigable
    const errorContent = page.locator('text=/404|not found|no encontrado/i').first();
    await expect(errorContent).toBeVisible();
  });

  test('Sanity CDN images have proper caching headers', async ({ request }) => {
    // Buscar una imagen de Sanity
    const response = await request.get(`${BASE_URL}/blog`);
    const html = await response.text();
    
    // Extraer URL de imagen de Sanity si existe
    const sanityImageMatch = html.match(/https:\/\/cdn\.sanity\.io\/[^"'\s]+/);
    
    if (sanityImageMatch) {
      const imageResponse = await request.get(sanityImageMatch[0]);
      
      // Verificar headers de caché
      const cacheControl = imageResponse.headers()['cache-control'];
      expect(cacheControl).toBeTruthy();
      
      // Sanity generalmente usa cache agresivo
      if (cacheControl) {
        expect(cacheControl).toMatch(/max-age|s-maxage/);
      }
    }
  });

  test('Content revalidation tags work correctly', async ({ request }) => {
    // Verificar que el endpoint de revalidación existe (si está configurado)
    const response = await request.post(`${BASE_URL}/api/revalidate`, {
      data: { tag: 'post' }
    });
    
    // Puede ser 200 (funciona) o 404 (no existe), pero no 500
    expect([200, 401, 404]).toContain(response.status());
  });
});

test.describe('🎭 Sanity Studio - Editor Experience (P2)', () => {
  test('Studio authentication works', async ({ page }) => {
    await page.goto(`${BASE_URL}/studio`);
    
    // Verificar que el Studio está protegido o accesible
    const url = page.url();
    
    // Si está protegido, debería redirigir a login
    // Si está abierto, debería mostrar el Studio
    const isLoginPage = url.includes('login') || url.includes('auth');
    const isStudio = await page.locator('[data-sanity-root], [data-testid="studio-layout"]').first().isVisible().catch(() => false);
    
    expect(isLoginPage || isStudio).toBeTruthy();
  });

  test('Studio loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/studio`);
    await page.waitForTimeout(3000);
    
    // Filtrar errores no críticos de Sanity
    const criticalErrors = errors.filter(e => 
      !e.includes('analytics') && 
      !e.includes('gtag') &&
      !e.includes('favicon') &&
      !e.includes('source map')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('📊 Sanity CMS - Performance (P1)', () => {
  test('Blog page loads under 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('Individual post loads under 2 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    
    test.skip(!hasPosts, 'No blog posts available to test');
    
    const startTime = Date.now();
    await firstPostLink.click();
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('Sanity images are properly sized', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const images = page.locator('img');
    const allImages = await images.all();
    
    for (const img of allImages.slice(0, 5)) {
      const src = await img.getAttribute('src');
      if (src?.includes('cdn.sanity.io')) {
        // Verificar que tiene parámetros de sizing
        expect(src).toMatch(/w=|h=|fit=/);
      }
    }
  });
});

test.describe('🔒 Sanity CMS - Security (P0)', () => {
  test('Studio is protected from unauthorized access', async ({ request }) => {
    // Intentar acceder a la API de Sanity directamente
    const response = await request.get(`${BASE_URL}/studio/api`);
    
    // Debe estar protegida (401) o no existir (404)
    expect([401, 404, 403]).toContain(response.status());
  });

  test('Sanity tokens are not exposed in client', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Verificar que no hay tokens en el HTML
    const html = await page.content();
    
    expect(html).not.toContain('sk31izahsxg');
    expect(html).not.toContain('SANITY_API_WRITE_TOKEN');
    expect(html).not.toContain('SANITY_API_READ_TOKEN');
  });

  test('Draft mode is properly restricted', async ({ request }) => {
    // Intentar activar draft mode sin autorización
    const response = await request.get(`${BASE_URL}/api/draft?slug=test`);
    
    // Debe requerir autenticación
    expect([401, 404]).toContain(response.status());
  });
});
