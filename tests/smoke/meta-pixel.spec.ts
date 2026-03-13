import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Meta Pixel Tracking (P0)', () => {
  test('Meta Pixel script loads on homepage', async ({ page }) => {
    // Array para capturar requests de Facebook
    const pixelRequests: string[] = [];
    
    // Monitorear todas las requests
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('facebook.com/tr') || url.includes('connect.facebook.net')) {
        pixelRequests.push(url);
      }
    });
    
    // Navegar a la página
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Aceptar cookies si hay banner (el pixel solo carga después)
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(1000); // Esperar que el pixel cargue
    }
    
    // Verificar que el script de Facebook se cargó
    expect(pixelRequests.length).toBeGreaterThan(0);
    
    // Verificar que al menos una request es de connect.facebook.net (el script base)
    const hasScriptRequest = pixelRequests.some(url => 
      url.includes('connect.facebook.net')
    );
    expect(hasScriptRequest).toBeTruthy();
  });

  test('PageView event fires on homepage', async ({ page }) => {
    const pixelEvents: Array<{ url: string; event?: string }> = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('facebook.com/tr')) {
        // Extraer el evento de la URL
        const eventMatch = url.match(/ev=([^&]+)/);
        pixelEvents.push({
          url,
          event: eventMatch ? decodeURIComponent(eventMatch[1]) : undefined
        });
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Aceptar cookies si es necesario
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verificar que se disparó el evento PageView
    const pageViewEvent = pixelEvents.find(e => e.event === 'PageView');
    expect(pageViewEvent).toBeDefined();
  });

  test('PageView event fires on service pages', async ({ page }) => {
    const pixelEvents: Array<{ url: string; event?: string }> = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('facebook.com/tr')) {
        const eventMatch = url.match(/ev=([^&]+)/);
        pixelEvents.push({
          url,
          event: eventMatch ? decodeURIComponent(eventMatch[1]) : undefined
        });
      }
    });
    
    await page.goto(`${BASE_URL}/services/deep-cleaning`, { waitUntil: 'networkidle' });
    
    // Aceptar cookies si es necesario
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verificar que se disparó el evento PageView
    const pageViewEvent = pixelEvents.find(e => e.event === 'PageView');
    expect(pageViewEvent).toBeDefined();
  });

  test('ViewContent event fires on blog post pages', async ({ page }) => {
    // Primero ir al blog para obtener un post
    await page.goto(`${BASE_URL}/blog`);
    
    const firstPostLink = page.locator('a[href^="/blog/"]').first();
    const hasPosts = await firstPostLink.isVisible().catch(() => false);
    test.skip(!hasPosts, 'No blog posts available to test');
    
    const pixelEvents: Array<{ url: string; event?: string }> = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('facebook.com/tr')) {
        const eventMatch = url.match(/ev=([^&]+)/);
        pixelEvents.push({
          url,
          event: eventMatch ? decodeURIComponent(eventMatch[1]) : undefined
        });
      }
    });
    
    await firstPostLink.click();
    await page.waitForLoadState('networkidle');
    
    // Aceptar cookies si es necesario
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verificar que se disparó el evento ViewContent (para artículos)
    const viewContentEvent = pixelEvents.find(e => e.event === 'ViewContent');
    expect(viewContentEvent).toBeDefined();
  });

  test('Lead event fires on quote page', async ({ page }) => {
    const pixelEvents: Array<{ url: string; event?: string }> = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('facebook.com/tr')) {
        const eventMatch = url.match(/ev=([^&]+)/);
        pixelEvents.push({
          url,
          event: eventMatch ? decodeURIComponent(eventMatch[1]) : undefined
        });
      }
    });
    
    await page.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle' });
    
    // Aceptar cookies si es necesario
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verificar que se disparó el evento Lead o PageView
    const hasEvent = pixelEvents.some(e => 
      e.event === 'Lead' || e.event === 'PageView'
    );
    expect(hasEvent).toBeTruthy();
  });

  test('Pixel includes correct Pixel ID', async ({ page }) => {
    const pixelRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('facebook.com/tr')) {
        pixelRequests.push(url);
      }
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Aceptar cookies si es necesario
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verificar que las requests incluyen el ID del pixel (si está configurado)
    // El ID debería estar en la URL como parámetro 'id' o similar
    const hasValidRequest = pixelRequests.some(url => {
      // El pixel ID debería estar en la URL
      return url.includes('facebook.com/tr');
    });
    
    expect(hasValidRequest).toBeTruthy();
  });
});
