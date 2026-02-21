# 🔐 Secrets Management - Enterprise-Grade

> **Sistema de gestión de secrets basado en prácticas de Stripe, Vercel, Linear**

---

## 🎯 Principios

### 1. **Nunca en el Código**
- ❌ Nunca hardcodear secrets en código
- ❌ Nunca commitear `.env.local` o archivos con secrets
- ✅ Usar variables de entorno siempre

### 2. **Separación por Entorno**
- **Local:** `.env.local` (no versionado)
- **Vercel:** Secrets en Vercel Dashboard
- **GitHub Actions:** Secrets en GitHub Settings
- **CI/CD:** Secrets en variables de entorno del runner

### 3. **Validación en Runtime**
- Validar que secrets requeridos existan
- Fallar rápido si faltan secrets críticos
- Mensajes de error claros

---

## 📁 Estructura de Archivos

```
/
├── .env.local              # Local development (gitignored)
├── .env.example            # Template sin valores reales (versionado)
├── .vercel/                # Vercel config (gitignored)
│   └── .env.local          # Vercel local env (gitignored)
└── docs/development/
    └── secrets-management.md  # Esta documentación
```

---

## 🔧 Configuración por Plataforma

### Vercel

**Dashboard → Project → Settings → Environment Variables**

```env
# Production
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
NEXT_PUBLIC_APP_URL=https://integritycleansolutions.com

# Preview
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
NEXT_PUBLIC_APP_URL=https://integritycleansolutions.vercel.app

# Development
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Comando local:**
```bash
vercel env pull .env.local
```

### GitHub Actions

**Repository → Settings → Secrets and variables → Actions**

```yaml
# Secrets (encrypted)
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
HUBSPOT_ACCESS_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

**Uso en workflow:**
```yaml
env:
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

---

## 🛡️ Validación de Secrets

### Runtime Validation

```typescript
// lib/env/validate.ts
export function validateEnv() {
  const required = [
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

### Type-Safe Access

```typescript
// lib/env/index.ts
export const env = {
  resendApiKey: process.env.RESEND_API_KEY!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  hubspotAccessToken: process.env.HUBSPOT_ACCESS_TOKEN,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;
```

---

## 📋 Checklist de Secrets

### Secrets Requeridos

- [ ] `RESEND_API_KEY` - Email sending
- [ ] `STRIPE_SECRET_KEY` - Payment processing
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook verification
- [ ] `HUBSPOT_ACCESS_TOKEN` - CRM integration
- [ ] `NEXT_PUBLIC_APP_URL` - Public app URL

### Secrets Opcionales

- [ ] `DATABASE_URL` - Si se usa Prisma
- [ ] `REDIS_URL` - Si se usa Redis
- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics

---

## 🚨 Seguridad

### ✅ Hacer

- Usar diferentes secrets por entorno (dev/staging/prod)
- Rotar secrets periódicamente
- Usar secrets managers (Vercel, GitHub Secrets)
- Validar secrets en runtime
- Documentar qué secrets se necesitan

### ❌ No Hacer

- Commitear `.env.local` o archivos con secrets
- Hardcodear secrets en código
- Compartir secrets por email/Slack
- Usar el mismo secret en dev y prod
- Loggear secrets en consola

---

## 🔄 Rotación de Secrets

### Proceso

1. **Generar nuevo secret** en plataforma (Stripe, Resend, etc.)
2. **Actualizar en Vercel** (Dashboard → Environment Variables)
3. **Actualizar en GitHub** (Settings → Secrets)
4. **Actualizar localmente** (`.env.local`)
5. **Verificar** que todo funciona
6. **Revocar** secret antiguo después de verificar

---

## 📚 Referencias

- **Vercel:** https://vercel.com/docs/concepts/projects/environment-variables
- **GitHub:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Stripe:** https://stripe.com/docs/keys
- **Next.js:** https://nextjs.org/docs/basic-features/environment-variables

---

**Última actualización:** 2025-12-29
