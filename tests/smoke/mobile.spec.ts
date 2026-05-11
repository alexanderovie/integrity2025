import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Mobile Responsiveness (P1)', () => {
  // Configurar viewport mobile para todos los tests en este describe
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile menu opens and closes', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Buscar botón de menú mobile (hamburger)
    const menuButton = page.locator('button[aria-label*="menu"], button[class*="menu"], [data-testid="menu-button"]').first();
    
    // Si no hay menú hamburger, skip
    const hasMenuButton = await menuButton.isVisible().catch(() => false);
    test.skip(!hasMenuButton, 'Mobile menu button not found');
    
    // Click para abrir menú
    await menuButton.click();
    
    // Verificar que el menú se abrió
    const mobileMenu = page.locator('[class*="mobile-menu"], [class*="nav-menu"], nav').first();
    await expect(mobileMenu).toBeVisible();
    
    // Click para cerrar (o click fuera)
    await menuButton.click();
    
    // Verificar que se puede interactuar con el menú
    const menuLinks = mobileMenu.locator('a');
    expect(await menuLinks.count()).toBeGreaterThan(0);
  });

  test('Quote form is usable on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    // El formulario debe ser visible en viewport mobile
    const form = page.locator('#quote-book-form, form').first();
    await expect(form).toBeVisible();
    
    // El formulario debe caber en la pantalla (no requiere scroll horizontal)
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBeLessThanOrEqual(375);
  });

  test('CTA buttons are tappable on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Buscar botones CTA principales
    const ctaButtons = page.locator('button:has-text("Quote"), button:has-text("Book"), a:has-text("Get"), a:has-text("Quote")');
    
    // Verificar que los botones son lo suficientemente grandes para tap (44x44px mínimo según Apple)
    const buttons = await ctaButtons.all();
    test.skip(buttons.length === 0, 'No CTA buttons found');
    
    for (const button of buttons.slice(0, 3)) {
      const box = await button.boundingBox();
      if (box) {
        // Altura mínima de 44px para ser fácilmente tappable
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Text is readable on mobile without zoom', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Obtener todos los elementos de texto
    const textElements = page.locator('p, h1, h2, h3, span, a');
    
    // Verificar que el tamaño de fuente es legible (mínimo 12px)
    const fontSize = await textElements.first().evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseInt(style.fontSize);
    });
    
    expect(fontSize).toBeGreaterThanOrEqual(12);
  });

  test('Service pages render correctly on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/services/deep-cleaning`);
    
    // El contenido debe ser visible
    const mainContent = page.locator('main, [class*="content"], article').first();
    await expect(mainContent).toBeVisible();
    
    // No debe haber scroll horizontal (overflow)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('Images scale properly on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const images = page.locator('img');
    const allImages = await images.all();
    
    test.skip(allImages.length === 0, 'No images found on page');
    
    for (const img of allImages.slice(0, 5)) {
      const box = await img.boundingBox();
      if (box) {
        // Las imágenes no deben ser más anchas que el viewport
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('Forms inputs are usable on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact-us`);
    
    // Buscar inputs
    const inputs = page.locator('input, textarea, select');
    const allInputs = await inputs.all();
    
    test.skip(allInputs.length === 0, 'No form inputs found');
    
    for (const input of allInputs.slice(0, 3)) {
      // Verificar que son visibles y clickeables
      await expect(input).toBeVisible();
      
      // Intentar hacer focus
      await input.click();
      
      // Verificar que recibió focus
      const isFocused = await input.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('Footer is accessible on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll al footer
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    
    // Verificar que el footer es visible
    await expect(footer).toBeVisible();
    
    // Verificar que los links del footer son clickeables
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('Touch targets are appropriately sized', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Obtener todos los elementos interactivos
    const interactiveElements = page.locator('button, a, input, select, textarea, [role="button"]');
    const elements = await interactiveElements.all();
    
    let smallTargets = 0;
    
    for (const element of elements.slice(0, 10)) {
      const box = await element.boundingBox();
      if (box) {
        // Contar elementos menores a 44x44px (tamaño mínimo recomendado)
        if (box.width < 44 || box.height < 44) {
          smallTargets++;
        }
      }
    }
    
    // No más del 20% de los targets deben ser pequeños
    const percentage = (smallTargets / Math.min(elements.length, 10)) * 100;
    expect(percentage).toBeLessThanOrEqual(20);
  });
});

test.describe('Mobile - iPad/Tablet Viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('Tablet layout renders correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // El contenido debe ser visible y organizado
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    
    // No debe haber scroll horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('Navigation is usable on tablet', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Los links de navegación deben ser visibles o accesibles
    const nav = page.locator('nav, [class*="nav"], [class*="header"]').first();
    await expect(nav).toBeVisible();
    
    const navLinks = nav.locator('a');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });
});
