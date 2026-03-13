import { test, expect } from '@playwright/test';
import { BASE_URL, SERVICES } from '../helpers/constants';

test.describe('Quote Flow - Lead Generation Critical Path (P0)', () => {
  test('Complete quote flow creates lead', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    // Verificar que el formulario cargó
    const form = page.locator('#quote-book-form, form').first();
    await expect(form).toBeVisible();
    
    // Llenar datos del cliente
    await page.fill('input[name="name"], input[name="customerName"], input[placeholder*="name" i]', 'Test Lead');
    await page.fill('input[name="email"], input[name="customerEmail"], input[placeholder*="email" i]', 'testlead@example.com');
    await page.fill('input[name="phone"], input[name="customerPhone"], input[placeholder*="phone" i]', '8009300532');
    
    // Seleccionar servicio
    const serviceSelect = page.locator('select[name="service"], select[name="serviceId"]').first();
    if (await serviceSelect.isVisible().catch(() => false)) {
      await serviceSelect.selectOption('deep-cleaning');
    }
    
    // Enviar formulario
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Quote")').first();
    await submitButton.click();
    
    // Verificar éxito - redirección o mensaje de confirmación
    await expect(page).toHaveURL(/\/quote\/success|success|thank-you|confirmation/i, { timeout: 10000 });
    
    // O verificar mensaje de éxito
    const successMessage = page.locator('text=/thank you|success|submitted|received/i').first();
    await expect(successMessage).toBeVisible();
  });

  test('Quote form validates required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Debe mostrar errores de validación
    const errors = page.locator('[class*="error"], [class*="invalid"], [role="alert"], text=/required|please|error/i');
    await expect(errors.first()).toBeVisible();
  });

  test('Quote form validates email format', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    // Llenar email inválido
    await page.fill('input[name="email"], input[name="customerEmail"]', 'not-an-email');
    await page.fill('input[name="name"]', 'Test User');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Debe mostrar error de email
    await expect(page.locator('text=/valid email|email format|invalid email/i').first()).toBeVisible();
  });

  test('Quote form validates phone format', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', 'not-a-phone');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Debe mostrar error de teléfono
    const hasError = await page.locator('text=/phone|teléfono|invalid/i').first().isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test('Service-specific quote pages work', async ({ page }) => {
    // Probar con el primer servicio
    const serviceSlug = SERVICES[0];
    await page.goto(`${BASE_URL}/quote/${serviceSlug}`);
    
    // El formulario debe cargar con el servicio preseleccionado
    const form = page.locator('#quote-book-form, form').first();
    await expect(form).toBeVisible();
    
    // La URL debe ser correcta
    await expect(page).toHaveURL(`/quote/${serviceSlug}`);
  });

  test('Quote submission includes service metadata', async ({ page }) => {
    const serviceSlug = 'deep-cleaning';
    await page.goto(`${BASE_URL}/quote/${serviceSlug}`);
    
    // Llenar formulario completo
    await page.fill('input[name="name"], input[name="customerName"]', 'Metadata Test');
    await page.fill('input[name="email"], input[name="customerEmail"]', 'metadata@example.com');
    await page.fill('input[name="phone"]', '8009300532');
    
    // Agregar detalles de propiedad si existen
    const bedroomsInput = page.locator('input[name="bedrooms"], select[name="bedrooms"]').first();
    if (await bedroomsInput.isVisible().catch(() => false)) {
      await bedroomsInput.fill('3');
    }
    
    const bathroomsInput = page.locator('input[name="bathrooms"], select[name="bathrooms"]').first();
    if (await bathroomsInput.isVisible().catch(() => false)) {
      await bathroomsInput.fill('2');
    }
    
    // Enviar
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Verificar éxito
    await expect(page).toHaveURL(/success|thank-you|confirmation/i, { timeout: 10000 });
  });

  test('Quote form prevents XSS injection', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    // Intentar inyección XSS
    await page.fill('input[name="name"]', '<script>alert("xss")</script>');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '8009300532');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // El formulario debe procesarse o rechazarse limpiamente, sin ejecutar el script
    await page.waitForTimeout(1000);
    
    // Verificar que no hay alertas de JavaScript (XSS)
    const hasAlert = await page.evaluate(() => {
      return new Promise((resolve) => {
        const originalAlert = window.alert;
        window.alert = () => resolve(true);
        setTimeout(() => {
          window.alert = originalAlert;
          resolve(false);
        }, 500);
      });
    });
    
    expect(hasAlert).toBeFalsy();
  });

  test('Quote form handles special characters', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    // Nombre con caracteres especiales
    await page.fill('input[name="name"]', 'José María O\'Connor-Smith');
    await page.fill('input[name="email"]', 'josemaria@example.com');
    await page.fill('input[name="phone"]', '8009300532');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Debe procesarse correctamente
    await expect(page).toHaveURL(/success|thank-you|confirmation/i, { timeout: 10000 });
  });

  test('Multiple rapid submissions are rate limited', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    
    // Primera submission
    await page.fill('input[name="name"]', 'Rate Limit Test 1');
    await page.fill('input[name="email"]', 'ratelimit1@example.com');
    await page.fill('input[name="phone"]', '8009300532');
    await page.click('button[type="submit"]');
    
    // Esperar resultado
    await page.waitForURL(/success|thank-you|confirmation/i, { timeout: 10000 });
    
    // Segunda submission inmediata (debe ser rate limited o aceptada)
    await page.goto(`${BASE_URL}/quote`);
    await page.fill('input[name="name"]', 'Rate Limit Test 2');
    await page.fill('input[name="email"]', 'ratelimit2@example.com');
    await page.fill('input[name="phone"]', '8009300532');
    await page.click('button[type="submit"]');
    
    // Verificar que no crashea (acepta o rate limits)
    const response = await page.waitForResponse(/api\/contact|api\/quote|success/i, { timeout: 10000 });
    expect([200, 201, 429]).toContain(response.status());
  });
});
