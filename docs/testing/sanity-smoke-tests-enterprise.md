# 🎯 Sanity CMS Enterprise Smoke Tests

**Versión:** 2026-2028 Enterprise Patterns  
**Framework:** Playwright + Next.js 16 + Sanity  
**Basado en:** Vercel Enterprise, Sanity Enterprise, Next.js Production Best Practices

---

## 📋 Resumen

Estos smoke tests validan la integración completa entre **Sanity CMS** y **Next.js** en producción, asegurando que:

1. **Content Delivery** funciona end-to-end
2. **Cache invalidation** opera correctamente
3. **Schema contracts** se respetan
4. **Security** está hardenizada
5. **Performance** cumple SLAs
6. **Resilience** maneja fallos gracefulmente

---

## 🏗️ Arquitectura de Tests

### 8 Suites de Tests

| Suite | Prioridad | Descripción |
|-------|-----------|-------------|
| **Health Checks** | P0 | Verifica conectividad API, CDN, endpoints |
| **Contract Testing** | P0 | Valida schema y estructura de datos |
| **Data Flow** | P0 | Tests end-to-end Sanity → Next.js → Browser |
| **Webhook & Cache** | P1 | Valida revalidación automática |
| **Performance** | P1 | Monitorea tiempos de respuesta y CDN |
| **Security** | P0 | Hardering y protección de tokens |
| **Resilience** | P1 | Fallbacks y graceful degradation |
| **Observability** | P2 | Error tracking y monitoring |

---

## 🚀 Ejecución

```bash
# Todos los tests
echo "BASE_URL=https://integritycleansolutions.com" > .env.test
pnpm exec playwright test tests/smoke/sanity-cms-enterprise.spec.ts --project=chromium

# Solo tests P0 críticos
pnpm exec playwright test tests/smoke/sanity-cms-enterprise.spec.ts --grep "P0"

# Modo debug
pnpm exec playwright test tests/smoke/sanity-cms-enterprise.spec.ts --debug
```

---

## 🎯 Tests Destacados

### 1. Schema Contract Validation

```typescript
// Valida que todos los posts cumplen el schema
test('All posts conform to schema specification', async ({ request }) => {
  const posts = await request.get(`${BASE_URL}/api/sanity/posts`);
  
  for (const post of posts) {
    // Validación estricta según schema
    expect(post.title.length).toBeInRange(10, 90);
    expect(post.description.length).toBeInRange(50, 180);
    expect(Array.isArray(post.body)).toBeTruthy();
    expect(post.body.every(block => block._type)).toBeTruthy();
  }
});
```

**Por qué importa:** Previene que cambios en Sanity Studio rompan el frontend.

### 2. Webhook Security

```typescript
// Valida que webhooks rechazan requests inválidos
test('Webhook endpoint validates signatures', async ({ request }) => {
  // Sin firma → 401
  const noSig = await request.post('/api/webhook/sanity', { data: {} });
  expect(noSig.status()).toBe(401);
  
  // Firma inválida → 401
  const invalidSig = await request.post('/api/webhook/sanity', {
    headers: { 'Authorization': 'Bearer invalid' },
    data: {}
  });
  expect(invalidSig.status()).toBe(401);
});
```

**Por qué importa:** Previene que cualquiera invalide el cache.

### 3. Cache Revalidation Flow

```typescript
// Verifica que el cache se invalida correctamente
test('Content renders with fresh data after revalidation', async ({ page }) => {
  // 1. Crear post en Sanity
  // 2. Trigger webhook
  // 3. Verificar que aparece en frontend (sin redeploy)
});
```

**Por qué importa:** Asegura que publicar en Sanity actualiza el sitio inmediatamente.

### 4. CDN Performance

```typescript
// Verifica que imágenes de Sanity tienen cache agresivo
test('Sanity CDN images have aggressive caching', async ({ request }) => {
  const imageUrl = 'https://cdn.sanity.io/...';
  const response = await request.get(imageUrl);
  
  const cacheControl = response.headers()['cache-control'];
  expect(cacheControl).toMatch(/max-age=\d+/);
  
  const maxAge = parseInt(cacheControl.match(/max-age=(\d+)/)[1]);
  expect(maxAge).toBeGreaterThan(86400); // > 1 día
});
```

**Por qué importa:** Asegura que imágenes se sirven rápido desde edge.

---

## 🔒 Seguridad

### Tokens & Secrets

- ✅ `SANITY_API_WRITE_TOKEN` nunca expuesto en cliente
- ✅ `SANITY_API_READ_TOKEN` solo en server
- ✅ `SANITY_WEBHOOK_SECRET` valida todas las revalidaciones
- ✅ Project ID público (`NEXT_PUBLIC_SANITY_PROJECT_ID`)

### Endpoints Protegidos

| Endpoint | Acceso | Protección |
|----------|--------|------------|
| `/api/webhook/sanity` | Sanity | Signature validation |
| `/api/revalidate` | Admin | Bearer token |
| `/api/draft` | Autenticado | 401/404 |
| `/studio/api/*` | Denegado | 401/403/404 |

---

## 🛡️ Resilience Patterns

### 1. Retry con Exponential Backoff

```typescript
const retry = async (fn, { retries = 3, delay = 1000 }) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
};
```

### 2. Delivery Chain

```
Sanity API → Validated Contract API → Next.js Blog
     ↓                 ↓                  ↓
  Primary         Operational         Published
```

### 3. Graceful Degradation

```typescript
// Si imágenes fallan, el sitio sigue funcionando
await page.route('**/cdn.sanity.io/**', route => route.abort());
await page.reload();

// La página debe seguir visible
await expect(page.locator('h1')).toBeVisible();
```

---

## 📊 Monitoring & Alerting

### Métricas Clave

| Métrica | Target | Alerta |
|---------|--------|--------|
| API Response Time | < 2s | > 3s |
| CDN Hit Rate | > 95% | < 90% |
| Webhook Success | 100% | < 100% |
| Schema Validation | 100% | < 100% |
| Error Rate | < 0.1% | > 1% |

### Dashboards Recomendados

1. **Sanity Dashboard:** https://www.sanity.io/manage
2. **Vercel Analytics:** https://vercel.com/analytics
3. **Custom:** Sentry, Datadog, o LogRocket

---

## 🔄 CI/CD Integration

```yaml
# .github/workflows/smoke-tests.yml
name: Smoke Tests

on:
  deployment_status:
    types: [success]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Sanity Smoke Tests
        run: |
          echo "BASE_URL=${{ github.event.deployment_status.target_url }}" > .env.test
          pnpm exec playwright test tests/smoke/sanity-cms-enterprise.spec.ts --grep "P0"
        env:
          PLAYWRIGHT_BROWSERS_PATH: 0
```

---

## 🎓 Best Practices

### 1. Tests Determinísticos
- No dependen de estado específico
- Usan retries para flaky integrations
- Validan contratos, no contenido específico

### 2. Aislamiento
- Cada test es independiente
- No modifican datos de producción
- Usan slugs únicos cuando crean contenido

### 3. Performance
- Tests paralelizables
- Timeouts razonables
- No bloquean CI/CD

### 4. Mantenibilidad
- Helpers reutilizables
- Documentación inline
- Priorización clara (P0/P1/P2)

---

## 🚨 Troubleshooting

### Tests Fallan en CI pero Pasan Local

**Causa probable:** Cache de Next.js en producción

**Solución:**
```bash
# Invalidar cache manualmente
curl -X POST https://integritycleansolutions.com/api/revalidate \
  -H "Authorization: Bearer $REVALIDATE_SECRET" \
  -d '{"path": "/blog"}'
```

### Schema Validation Errors

**Causa probable:** Cambio en Sanity Studio sin migración

**Solución:**
1. Verificar schema en `src/sanity/schema/post.ts`
2. Correr migración si es necesario
3. Actualizar tests si el schema cambió intencionalmente

### Webhook 401 Errors

**Causa probable:** Secret no configurado en Vercel

**Solución:**
```bash
vercel env add SANITY_WEBHOOK_SECRET production
# Valor: mismo que REVALIDATE_SECRET
```

---

## 📚 Recursos

- [Sanity Webhooks](https://www.sanity.io/docs/webhooks)
- [Next.js ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Vercel Edge Config](https://vercel.com/docs/storage/edge-config)

---

## 📝 Changelog

### v2026.03 - Initial Release
- 8 test suites, 30+ test cases
- Contract testing implementation
- Webhook validation
- Performance monitoring
- Security hardening

---

**Maintained by:** Integrity Clean Solutions Engineering Team  
**Last Updated:** 2026-03-13  
**Next Review:** 2026-06-13
