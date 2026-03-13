import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Sanity CMS Integration (P0)', () => {
  test('Sanity Studio loads and is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/studio`);
    
    // El Studio debe cargar (título contiene "Studio" o similar)
    await expect(page).toHaveTitle(/Studio|Sanity|Content/i, { timeout: 10000 });
    
    // Verificar que el contenido del Studio está presente
    // Sanity renderiza su propia UI, buscamos elementos característicos
    const studioContent = page.locator('[data-testid="studio-layout"], [class*="studio"], #root');
    await expect(studioContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('Blog listing page loads posts from Sanity', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // La página debe cargar sin errores
    await expect(page).toHaveTitle(/Blog/i);
    
    // Debe haber al menos un post visible o un mensaje de que no hay posts
    const posts = page.locator('article, [class*="post"], [class*="blog"], a[href^="/blog/"]');
    const noPostsMessage = page.locator('text=/no posts|empty|sin artículos/i');
    
    // O hay posts, o hay un mensaje de vacío
    await expect(posts.first().or(noPostsMessage)).toBeVisible({ timeout: 5000 });
  });

  test('Individual blog post loads with content', async ({ page }) => {
    // Primero ir al blog listing para obtener un slug
    await page.goto(`${BASE_URL}/blog`);
    
    // Buscar el primer link a un post
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    
    // Si no hay posts, skip este test usando el patrón moderno
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    test.skip(!hasPosts, 'No blog posts available to test');
    
    // Click en el primer post
    await firstPostLink.click();
    
    // Verificar que cargó correctamente
    await expect(page.locator('h1')).toBeVisible();
    
    // Verificar que hay contenido
    const content = page.locator('article, [class*="content"], main');
    await expect(content.first()).toBeVisible();
    
    // Verificar URL correcta
    await expect(page).toHaveURL(/\/blog\/.+/);
  });

  test('Blog post contains essential elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    test.skip(!hasPosts, 'No blog posts available to test');
    
    await firstPostLink.click();
    
    // Elementos esenciales de un post
    await expect(page.locator('h1')).toBeVisible(); // Título
    
    // Al menos uno de estos debe existir
    const hasDate = await page.locator('time, [class*="date"], [class*="published"]').first().isVisible().catch(() => false);
    const hasContent = await page.locator('article p, [class*="content"] p, main p').first().isVisible().catch(() => false);
    
    expect(hasDate || hasContent).toBeTruthy();
  });

  test('Sanity images load correctly via CDN', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    
    // Buscar imágenes de Sanity (cdn.sanity.io)
    const sanityImages = page.locator('img[src*="cdn.sanity.io"]');
    const count = await sanityImages.count();
    
    test.skip(count === 0, 'No Sanity images found on blog page');
    
    // Verificar que al menos una imagen carga
    for (let i = 0; i < Math.min(count, 3); i++) {
      const img = sanityImages.nth(i);
      await expect(img).toBeVisible();
      
      // Verificar que la imagen tiene src válido
      const src = await img.getAttribute('src');
      expect(src).toContain('cdn.sanity.io');
    }
  });

  test('Non-existent blog post returns 404', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/blog/this-post-does-not-exist-12345`);
    
    // Debe retornar 404 o mostrar página de not found
    expect(response?.status()).toBe(404);
    
    // O debe mostrar contenido de 404
    const notFoundContent = await page.locator('text=/404|not found|no encontrado/i').first().isVisible().catch(() => false);
    expect(notFoundContent).toBeTruthy();
  });
});
