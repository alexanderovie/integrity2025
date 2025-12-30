# 🔗 Friendly URLs - Enterprise Implementation

> **Implementación de URLs amigables siguiendo patrones modernos 2025-2027**
> Basado en prácticas de Stripe, Vercel, Linear y otras empresas premium

---

## ✅ Problema Resuelto

### Antes (URLs no amigables)
```
❌ /quote?service=regular-cleaning
❌ /quote?service=deep-cleaning
❌ /quote?service=movein-moveout
```

**Problemas:**
- Query parameters no son amigables para SEO
- URLs largas y difíciles de leer
- No siguen mejores prácticas modernas
- Google recomienda URLs semánticas y legibles

### Después (URLs amigables)
```
✅ /quote/regular-cleaning
✅ /quote/deep-cleaning
✅ /quote/movein-moveout
```

**Beneficios:**
- URLs semánticas y legibles
- Mejor SEO (Google prefiere URLs descriptivas)
- Más fáciles de compartir
- Siguen patrones de empresas premium

---

## 🏗️ Arquitectura Implementada

### 1. **Helper de URLs** (`src/lib/urls/quote.ts`)

**Funcionalidades:**
- ✅ Generación de URLs amigables
- ✅ Validación de slugs de servicios
- ✅ Resolución de slugs legacy
- ✅ Type-safe con TypeScript

**Ejemplo de uso:**
```typescript
import { getQuoteUrl, resolveServiceSlug } from "@/lib/urls/quote";

// Generar URL amigable
const url = getQuoteUrl("regular-cleaning", {
  name: "John Doe",
  email: "john@example.com",
  zipCode: "32839"
});
// Resultado: /quote/regular-cleaning?name=John+Doe&email=john%40example.com&zipCode=32839
```

---

### 2. **Ruta Dinámica** (`src/app/(standalone)/quote/[service]/page.tsx`)

**Características:**
- ✅ Ruta dinámica Next.js 16 App Router
- ✅ Validación de slugs
- ✅ 404 automático para slugs inválidos
- ✅ Soporte para parámetros adicionales (name, email, phone, zipCode)

**Estructura:**
```
/quote/[service]/page.tsx
  └── Valida slug
  └── Renderiza QuotePageContent
  └── Pasa parámetros adicionales
```

---

### 3. **Página Legacy** (`src/app/(standalone)/quote/page.tsx`)

**Funcionalidad:**
- ✅ Redirige automáticamente a URLs amigables
- ✅ Mantiene compatibilidad con URLs antiguas
- ✅ Extrae parámetros de query string
- ✅ Redirige a `/quote/[service]` con parámetros

**Flujo:**
```
/quote?service=regular-cleaning
  └── Extrae service de query params
  └── Resuelve slug
  └── Redirige a /quote/regular-cleaning
```

---

### 4. **Componente Compartido** (`src/app/(standalone)/quote/quote-content.tsx`)

**Características:**
- ✅ Lógica de formulario reutilizable
- ✅ Soporta servicio pre-seleccionado
- ✅ Soporta parámetros iniciales
- ✅ Type-safe

---

## 📋 Servicios Soportados

| Slug | URL Amigable | Descripción |
|------|--------------|-------------|
| `regular-cleaning` | `/quote/regular-cleaning` | Limpieza regular |
| `deep-cleaning` | `/quote/deep-cleaning` | Limpieza profunda |
| `movein-moveout` | `/quote/movein-moveout` | Limpieza de mudanza |
| `removal-storage` | `/quote/removal-storage` | Remoción y almacenamiento |
| `eco-friendly-cleaning` | `/quote/eco-friendly-cleaning` | Limpieza ecológica |
| `post-renovation-cleaning` | `/quote/post-renovation-cleaning` | Limpieza post-renovación |

---

## 🔄 Migración y Compatibilidad

### URLs Legacy → Amigables

**Redirecciones automáticas:**
- `/quote?service=regular-cleaning` → `/quote/regular-cleaning`
- `/quote?service=deep-cleaning` → `/quote/deep-cleaning`
- `/quote?service=movein-moveout` → `/quote/movein-moveout`

**Parámetros adicionales preservados:**
- `/quote?service=regular-cleaning&name=John&email=john@example.com`
- → `/quote/regular-cleaning?name=John&email=john%40example.com`

---

## 🎯 Componentes Actualizados

### 1. **Hero Component** (`src/components/Home/Hero/index.tsx`)
- ✅ Usa `getQuoteUrl()` para generar URLs amigables
- ✅ Resuelve slug de servicio automáticamente

### 2. **BookServicesModal** (`src/components/Layout/Header/BookServicesModal.tsx`)
- ✅ Usa `getQuoteUrl()` para generar URLs amigables
- ✅ Resuelve slug de servicio automáticamente

---

## 🗺️ Sitemap Actualizado

**Nuevas URLs en sitemap:**
```xml
<url>
  <loc>https://integritycleansolutions.com/quote/regular-cleaning</loc>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>
```

**Prioridad:**
- Quote pages: 0.9 (alta prioridad)
- Service pages: 0.8
- Blog posts: 0.7

---

## 📚 Patrones Implementados

### 1. **Stripe Pattern**
- URLs semánticas: `/pricing/[plan]`
- Redirecciones automáticas
- Type-safe helpers

### 2. **Vercel Pattern**
- Rutas dinámicas Next.js
- Validación de parámetros
- 404 automático para rutas inválidas

### 3. **Linear Pattern**
- Helpers centralizados
- Type-safe con TypeScript
- Consistencia en toda la aplicación

---

## ✅ Checklist de Implementación

- [x] Helper de URLs creado (`src/lib/urls/quote.ts`)
- [x] Ruta dinámica creada (`/quote/[service]/page.tsx`)
- [x] Página legacy con redirección (`/quote/page.tsx`)
- [x] Componente compartido (`quote-content.tsx`)
- [x] Hero component actualizado
- [x] BookServicesModal actualizado
- [x] Sitemap actualizado con nuevas URLs
- [x] Type-check pasa
- [x] Documentación completa

---

## 🚀 Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Metadata dinámica por servicio:**
   ```typescript
   export async function generateMetadata({ params }: { params: { service: string } }) {
     const service = getServiceBySlug(params.service);
     return {
       title: `Get Quote for ${service.title} | Integrity Clean Solutions`,
       description: service.description,
     };
   }
   ```

2. **Open Graph tags por servicio:**
   ```typescript
   openGraph: {
     title: `Get Quote for ${service.title}`,
     description: service.description,
     images: [service.image],
   }
   ```

3. **Breadcrumbs:**
   ```typescript
   <Breadcrumbs>
     <Link href="/">Home</Link>
     <Link href="/services">Services</Link>
     <Link href={`/services/${service.slug}`}>{service.title}</Link>
     <span>Get Quote</span>
   </Breadcrumbs>
   ```

---

## 📚 Referencias

- **Google URL Guidelines:** https://developers.google.com/search/docs/appearance/url-structure
- **Next.js Dynamic Routes:** https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- **Stripe Pricing Pages:** https://stripe.com/pricing
- **Vercel Pricing Pages:** https://vercel.com/pricing

---

**Última actualización:** 2025-12-29
**Versión:** 1.0.0
