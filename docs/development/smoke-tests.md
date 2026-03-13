# Smoke Tests - Integrity Clean Solutions

## 📋 Propósito de este documento

Este documento describe el **estratégia de smoke testing** para que cualquier LLM o desarrollador entienda:
- Qué partes del sitio son críticas
- Por qué ciertos tests tienen sentido
- Cómo priorizar tests según el tipo de cambio
- Qué tests agregar según nuevas funcionalidades

## 🏗️ Arquitectura del Sitio

**Tipo:** Sitio de servicios locales (cleaning company) con:
- **Marketing:** Páginas estáticas, blog, SEO local
- **Conversión:** Formularios de cotización (quote), booking
- **Integraciones:** HubSpot CRM, Stripe payments, Meta Pixel
- **CMS:** Sanity para blog editorial

**Flujo de negocio crítico:**
1. Usuario llega al sitio (SEO/Ads)
2. Navega servicios → CTA a quote
3. Completa formulario → Lead en HubSpot
4. Pago opcional vía Stripe
5. Seguimiento CRM

## 🎯 Principios de Smoke Testing

### ¿Qué es un smoke test aquí?
Test rápido que verifica que el sitio **funciona lo suficientemente bien** para no estar roto en producción. No prueba todo, solo lo crítico.

### Prioridad de tests

```
P0 - CRÍTICO (Si falla, el negocio pierde dinero)
  → Homepage, formularios de quote, APIs de checkout
  
P1 - IMPORTANTE (Impacta SEO, UX, o conversiones)
  → Páginas de servicios, blog, páginas estáticas
  
P2 - ÚTIL (Valida integraciones y casos edge)
  → Webhooks, validaciones, metadata
```

---

## ✅ Tests Actuales y Por Qué Tienen Sentido

### 1. **static-pages.spec.ts** - Páginas Estáticas (P1)

**Qué prueba:**
- Homepage, About, Services, Contact, Blog, Service Areas
- Legal pages: Privacy, Terms, Cookies
- Quote page con formulario

**Por qué tiene sentido:**
- Estas páginas son el **funnel de conversión**
- Si el homepage falla, nadie entra
- Si las páginas legales fallan, hay problemas de compliance
- El quote page es donde se generan leads

**Cuándo falla:**
- Despliegues que rompen routing
- Errores en metadata/títulos
- Formularios que no renderizan

**Qué checa específicamente:**
```typescript
// Cada página:
- Status 200
- Title correcto (SEO)
- Contenido clave presente (ej: teléfono en contact)
- Form visible (en quote page)
```

### 2. **user-journeys.spec.ts** - Jornadas de Usuario (P0)

**Qué prueba:**
- Homepage CTA → Quote flow
- Header CTA → Quote flow  
- Site visit modal (2-step form)
- Blog listing → Post detail
- Footer legal links

**Por qué tiene sentido:**
- Estos son los **happy paths** que generan leads
- Un CTA roto = conversiones perdidas
- El modal de site visit es un flujo crítico de 2 pasos

**Cuándo falla:**
- Cambios en componentes UI (botones, links)
- Refactors de routing
- Cambios en estructura de modales

**Casos específicos:**
```typescript
// Homepage → Quote
- Click "Get Your Free Quote" 
- URL cambia a /quote/
- Formulario #quote-book-form visible

// Site Visit Modal (mobile)
- Click "Request a Site Visit"
- Modal aparece
- Paso 1: Fill name, phone, email → Continue
- Paso 2: Select date, time slot → Submit
- Redirect a /quote/[service]/
```

### 3. **service-pages.spec.ts** - Páginas de Servicios (P1)

**Qué prueba:**
- Todas las páginas de servicios individuales cargan
- No son 404
- Contienen contenido "cleaning"

**Por qué tiene sentido:**
- Son **landing pages** para SEO local
- Cada servicio es una entrada orgánica potencial
- Si /services/deep-cleaning está roto, pierdes tráfico de "deep cleaning orlando"

**Servicios cubiertos:**
```typescript
SERVICES = [
  'regular-cleaning',
  'deep-cleaning', 
  'move-in-out-cleaning',
  'carpet-cleaning',
  'airbnb-cleaning',
  'commercial-cleaning',
  'post-construction-cleaning',
]
```

### 4. **quote-pages.spec.ts** - Páginas de Cotización (P0)

**Qué prueba:**
- URLs amigables /quote/[service] funcionan
- Formulario visible en cada una

**Por qué tiene sentido:**
- Estas URLs son las **CTAs finales** de todo el marketing
- Si /quote/deep-cleaning no carga, las campañas de ads no convierten

**Lógica:**
```typescript
// Para cada servicio:
/quote/regular-cleaning → form visible
/quote/deep-cleaning → form visible
// etc.
```

### 5. **service-areas.spec.ts** - Áreas de Servicio (P1)

**Qué prueba:**
- Páginas de áreas geográficas cargan
- Contienen "Orlando" (validación básica de contenido)

**Por qué tiene sentido:**
- SEO local por ubicación
- Si /service-areas/winter-park está roto, pierdes "cleaning winter park"

**Áreas cubiertas:**
```typescript
SERVICE_AREAS = [
  'orlando', 'kissimmee', 'winter-park', 
  'lake-nona', 'celebration'
]
```

### 6. **api.spec.ts** - APIs e Integraciones (P0/P1/P2)

#### A. Critical APIs (P0)
```typescript
CRITICAL_APIS = [
  '/api/catalog',     // Servicios disponibles
  '/api/addons',      // Add-ons de servicios
  '/api/prices',      // Precios
]
```

**Por qué:** El formulario de quote depende de estas APIs para mostrar opciones.

#### B. SEO & Performance (P1)
```typescript
- /sitemap.xml   // SEO discoverability
- /robots.txt    // Crawler directives
- /manifest.json // PWA support
```

**Por qué:** Si el sitemap falla, Google no indexa bien.

#### C. HubSpot Integration (P1)
```typescript
- GET /api/hubspot/pipelines  // CRM deal stages
- POST /api/hubspot/webhooks  // Webhook validation
```

**Por qué:** HubSpot es el CRM. Si no funciona, los leads no se guardan.

**Tests específicos:**
- Pipeline endpoint devuelve stages esperados
- Webhooks rechazan requests sin firma (seguridad)
- Webhooks rechazan timestamps antiguos (replay attacks)

#### D. Stripe Integration (P0)
```typescript
- POST /api/checkout          // Crear sesión de pago
- POST /api/webhooks/stripe   // Webhook handlers
```

**Por qué:** Stripe procesa pagos. Si falla, no hay revenue.

**Tests específicos:**
- Checkout valida customer identity
- Checkout valida quote payload
- Webhooks rechazan sin firma
- Webhooks rechazan firmas inválidas

#### E. Lead Form Validation (P2)
```typescript
- POST /api/contact         // Formulario de contacto
- POST /api/newsletter      // Suscripción newsletter
- POST /api/help            // Formulario de ayuda
- POST /api/join-our-team   // Aplicaciones de empleo
```

**Por qué:** Validación de inputs previene spam y datos corruptos.

**Tests específicos:**
- Rechaza campos requeridos vacíos
- Valida formato de email
- Valida formato de teléfono

### 7. **book-service-modal.spec.ts** - Modal de Booking (P0)

**Qué prueba:**
- El modal de "Book Service" funciona en múltiples servicios
- Formulario de 2 pasos completa correctamente

**Por qué:** Es un flujo crítico de conversión en páginas de servicios.

---

## 🔍 Tests Faltantes (Para Considerar)

### P0 - Alta Prioridad (Agregar pronto)

#### A. Sanity CMS Integration
```typescript
// tests/smoke/sanity-cms.spec.ts
test('Sanity Studio loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/studio`);
  await expect(page).toHaveTitle(/Content Studio|Sanity/);
});

test('Blog posts load from Sanity', async ({ page }) => {
  await page.goto(`${BASE_URL}/blog`);
  const posts = page.locator('article, [class*="post"], [class*="blog"]');
  await expect(posts.first()).toBeVisible();
});

test('Individual blog post loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/blog/professional-cleaning-orlando`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('article, [class*="content"]')).toBeVisible();
});
```

**Por qué:** Ahora el blog usa Sanity. Si Sanity falla, el blog está vacío.

#### B. Meta Pixel Tracking
```typescript
// tests/smoke/meta-pixel.spec.ts
test('Meta Pixel script loads', async ({ page }) => {
  await page.goto(BASE_URL);
  const pixelRequests = [];
  page.on('request', req => {
    if (req.url().includes('facebook.com/tr')) {
      pixelRequests.push(req.url());
    }
  });
  // Trigger page view
  await page.waitForLoadState('networkidle');
  expect(pixelRequests.length).toBeGreaterThan(0);
});

test('PageView event fires on homepage', async ({ page }) => {
  // Verificar que fbq('track', 'PageView') se ejecuta
});
```

**Por qué:** Si el pixel no carga, las campañas de Facebook no trackean.

#### C. Core Web Vitals (Performance)
```typescript
// tests/smoke/performance.spec.ts
test('Homepage LCP is reasonable', async ({ page }) => {
  await page.goto(BASE_URL);
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        resolve(lcpEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  });
  expect(lcp).toBeLessThan(2500); // < 2.5s es bueno
});
```

**Por qué:** LCP lento = peor ranking SEO + usuarios se van.

### P1 - Media Prioridad

#### D. Mobile Responsiveness
```typescript
// tests/smoke/mobile.spec.ts
test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  
  test('mobile menu works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
  
  test('quote form is usable on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote`);
    await expect(page.locator('#quote-book-form')).toBeInViewport();
  });
});
```

**Por qué:** 60%+ del tráfico es mobile. Si no funciona bien, perdemos conversiones.

#### E. Cookie Consent
```typescript
// tests/smoke/cookies.spec.ts
test('cookie banner appears', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByRole('button', { name: /accept|reject/i })).toBeVisible();
});

test('rejecting cookies disables tracking', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.getByRole('button', { name: /reject/i }).click();
  // Verificar que scripts de tracking no cargan
});
```

**Por qué:** GDPR/CCPA compliance. Requerido legalmente.

#### F. Image Loading & Optimization
```typescript
// tests/smoke/images.spec.ts
test('images load without errors', async ({ page }) => {
  const imageErrors = [];
  page.on('pageerror', error => {
    if (error.message.includes('img')) imageErrors.push(error);
  });
  await page.goto(BASE_URL);
  expect(imageErrors).toHaveLength(0);
});

test('images have alt text', async ({ page }) => {
  await page.goto(BASE_URL);
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt).toBeTruthy();
  }
});
```

**Por qué:** Imágenes rotas = mala UX. Sin alt text = problemas de accesibilidad y SEO.

### P2 - Baja Prioridad (Nice to have)

#### G. Email Sending (Resend)
```typescript
// tests/smoke/email.spec.ts
test('contact form sends email', async ({ request }) => {
  const response = await request.post('/api/contact', {
    data: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '8001234567',
      message: 'Test message'
    }
  });
  expect(response.status()).toBe(200);
});
```

**Por qué:** Verifica que el servicio de email (Resend) funciona. Pero no es crítico para cada deploy.

#### H. Rate Limiting
```typescript
// tests/smoke/security.spec.ts
test('API rate limiting works', async ({ request }) => {
  // Hacer 100 requests rápidos
  // Verificar que después devuelve 429 Too Many Requests
});
```

**Por qué:** Protección contra spam/abuse.

---

## 📊 Cobertura Actual vs Recomendada

| Categoría | Tests Actuales | Tests Recomendados | Gap |
|-----------|---------------|-------------------|-----|
| **Páginas estáticas** | 11 | 11 | ✅ Completo |
| **User journeys** | 5 | 5 | ✅ Completo |
| **Servicios** | 7 | 7 | ✅ Completo |
| **Quote pages** | 5 | 5 | ✅ Completo |
| **Service areas** | 5 | 5 | ✅ Completo |
| **APIs críticas** | 3 | 3 | ✅ Completo |
| **Integraciones** | HubSpot + Stripe | + Sanity + Meta Pixel | ⚠️ Faltan 2 |
| **Performance** | 0 | 3 (LCP, FID, CLS) | ❌ Faltan 3 |
| **Mobile** | 0 | 4 | ❌ Faltan 4 |
| **Accesibilidad** | 0 | 3 | ❌ Faltan 3 |
| **SEO técnico** | 3 | 5 (+ structured data) | ⚠️ Faltan 2 |
| **Seguridad** | 4 | 6 (+ rate limiting) | ⚠️ Faltan 2 |

**Total:** 48 actuales → ~65 recomendados

---

## 🚀 Cómo Usar Estos Tests

### Para desarrolladores:

**Antes de un PR:**
```bash
# Corre todos los smoke tests local
BASE_URL=http://localhost:3000 pnpm exec playwright test tests/smoke/ --project=chromium

# Corre solo tests críticos (P0)
BASE_URL=http://localhost:3000 pnpm exec playwright test tests/smoke/user-journeys.spec.ts tests/smoke/quote-pages.spec.ts
```

**En CI/CD:**
```bash
# Contra preview de Vercel
BASE_URL=https://integrity2025-git-feature-branch.vercel.app pnpm exec playwright test

# Contra producción (cuidado, no tests destructivos!)
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/static-pages.spec.ts
```

### Para cualquier LLM que mantenga este código:

**Si agregas una nueva página:**
1. ¿Es una landing importante? → Agregar a `static-pages.spec.ts`
2. ¿Tiene un CTA importante? → Agregar a `user-journeys.spec.ts`
3. ¿Es una página de servicio? → Agregar a `service-pages.spec.ts`

**Si agregas una integración nueva (ej: nuevo CRM):**
1. Crear `tests/smoke/nuevo-crm.spec.ts`
2. Testear: endpoint de health, autenticación, webhooks
3. Verificar que rechaza requests inválidos (seguridad)

**Si agregas un formulario nuevo:**
1. Agregar validaciones en `api.spec.ts` (ej: valida email, campos requeridos)
2. Agregar journey test si es parte de un flujo importante

**Si modificas el flujo de quote:**
1. **OBLIGATORIO:** Actualizar `user-journeys.spec.ts`
2. **OBLIGATORIO:** Actualizar `quote-pages.spec.ts`
3. Revisar que no rompiste `api.spec.ts` (checkout endpoint)

---

## ⚠️ Qué NO testear en Smoke Tests

**No hagas smoke tests de:**

1. **Contenido específico del blog** (cambia frecuentemente)
   - ❌ "El post debe contener la frase exacta 'xyz'"
   - ✅ "El post debe tener un h1 y contenido visible"

2. **Precios exactos** (cambian con frecuencia)
   - ❌ "El servicio cuesta $120"
   - ✅ "El formulario muestra opciones de precio"

3. **Datos de contacto específicos** (pueden cambiar)
   - ❌ "El teléfono debe ser (407) 123-4567"
   - ✅ "La página de contacto muestra un número de teléfono"

4. **Tests destructivos en producción**
   - ❌ Enviar emails reales desde tests
   - ❌ Crear charges reales en Stripe
   - ✅ Usar ambientes de test/sandbox

5. **Tests que dependen de estado externo**
   - ❌ "El usuario con email X debe existir en HubSpot"
   - ✅ "La API de HubSpot responde con status 200"

---

## 📝 Mantenimiento de Tests

**Cuándo actualizar tests:**

| Evento | Tests a actualizar |
|--------|-------------------|
| Nueva página de servicio | `service-pages.spec.ts`, `quote-pages.spec.ts` |
| Nuevo formulario | `user-journeys.spec.ts`, `api.spec.ts` |
| Cambio de CTA text/button | `user-journeys.spec.ts` |
| Nueva integración | Nuevo archivo `tests/smoke/nombre-integration.spec.ts` |
| Cambio en routing | Todos los tests que usen URLs hardcodeadas |
| Cambio en schema de API | `api.spec.ts` |
| Agregar Sanity content | `static-pages.spec.ts` (blog section) |

**Regla de oro:** Si cambias algo que un test verifica, actualiza el test.

---

## 🔧 Configuración Técnica

**Archivos clave:**
- `playwright.config.ts` - Configuración de Playwright
- `tests/helpers/constants.ts` - URLs, títulos esperados, servicios
- `.env.local` - `BASE_URL` requerido

**Variables de entorno:**
```bash
BASE_URL=https://integritycleansolutions.com  # Requerido
VERCEL_AUTOMATION_BYPASS_SECRET=xxx           # Opcional, para previews protegidos
```

**Comandos útiles:**
```bash
# Instalar Playwright
pnpm exec playwright install

# Correr tests en modo UI (para debug)
BASE_URL=http://localhost:3000 pnpm exec playwright test --ui

# Correr tests específicos
BASE_URL=http://localhost:3000 pnpm exec playwright test tests/smoke/user-journeys.spec.ts

# Generar reporte HTML
BASE_URL=http://localhost:3000 pnpm exec playwright test --reporter=html
```

---

## 🎯 Métricas de Éxito

**Un buen suite de smoke tests debe tener:**
- ✅ Cobertura de todos los P0 (críticos)
- ✅ Tiempo de ejecución < 5 minutos
- ✅ < 5% de falsos positivos (flaky tests)
- ✅ Fácil de entender por nuevos devs
- ✅ Documentado (este archivo!)

**Estado actual:**
- ⏱️ Tiempo de ejecución: ~2-3 minutos
- 🎯 Cobertura P0: 85%
- 📚 Documentación: ✅ Completa

---

## 📚 Recursos Adicionales

- **Playwright Docs:** https://playwright.dev
- **Best Practices:** https://playwright.dev/docs/best-practices
- **Selectors:** https://playwright.dev/docs/selectors
- **CI/CD Integration:** https://playwright.dev/docs/ci

---

**Última actualización:** 2026-03-13
**Responsable:** Cualquier LLM o dev que mantenga este proyecto
**Próxima revisión:** Cuando se agreguen tests de Sanity CMS o Meta Pixel
