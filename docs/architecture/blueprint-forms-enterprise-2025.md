# 🏗️ BLUEPRINT ENTERPRISE: ESTANDARIZACIÓN DE FORMULARIOS 2025-2027
**Fecha:** 2025-12-29
**Proyecto:** Integrity Clean Solutions
**Estado:** 📋 PLANIFICACIÓN - Sin ejecución de código

---

## 🛑 PROTOCOLO ESTABLECIDO

### ✅ COMPROMISOS
- ❌ **NO** modificar código existente
- ❌ **NO** mover archivos
- ❌ **NO** instalar dependencias
- ❌ **NO** optimizar prematuramente
- ✅ **SÍ** diseñar arquitectura portable
- ✅ **SÍ** preparar para 2027
- ✅ **SÍ** evitar vendor lock-in

---

## 🎯 OBJETIVOS ESTRATÉGICOS

### 1. **Estandarización Enterprise**
- Validación centralizada con Zod
- Server Actions o API Routes según caso
- Seguridad: CSRF + Rate Limiting + Anti-spam
- DX moderna: componentes reutilizables
- Accesibilidad AA (WCAG 2.1)
- Preparado para Edge Functions / Serverless

### 2. **Portabilidad Mandatoria**
- **Hoy:** Supabase (PostgreSQL)
- **Mañana:** Neon Postgres (sin cambiar lógica core)
- **Futuro:** Backend Fastify propio
- **Escala:** Vercel Edge / Cloud Run / Cloudflare Workers

### 3. **Arquitectura Flexible**
- Contracts/interfaces neutrales de proveedor
- Abstracción de base de datos
- Separación de concerns (auth, storage, payments)
- Webhooks desacoplados

---

## 🗺️ MAPA DE DECISIÓN: Server Action vs API Route

### **Usar Server Actions cuando:**
✅ Formularios simples (contacto, newsletter, perfil)
✅ No requiere webhooks externos
✅ No requiere rate limiting complejo
✅ Integración directa con Next.js
✅ Mejor DX (menos boilerplate)
✅ Progressive Enhancement (funciona sin JS)

**Ejemplos:**
- Newsletter Form
- Contact Form
- User Profile Update
- Help Form

### **Usar API Routes cuando:**
✅ Integración con webhooks (Stripe, HubSpot)
✅ Rate limiting complejo por IP/email
✅ Requiere middleware personalizado
✅ Compatibilidad con Edge Runtime
✅ Lógica compartida entre múltiples clientes
✅ Webhooks externos que llaman directamente

**Ejemplos:**
- Quote/Checkout Form (Stripe webhook)
- Sign Up/Sign In (puede requerir rate limiting avanzado)
- Forgot Password (rate limiting crítico)

### **Híbrido (Recomendado):**
```
Server Action → API Route interna → DB Contract → Provider (Supabase/Neon/Fastify)
```

**Ventajas:**
- DX mejorada (Server Actions)
- Flexibilidad (API Routes para casos complejos)
- Portabilidad (Contracts abstractos)

---

## 📊 TABLA DE PRIORIZACIÓN POR IMPACTO

| # | Formulario | Impacto | Complejidad | Prioridad | Estrategia |
|---|------------|---------|-------------|-----------|------------|
| 1 | **Newsletter** | 🔥 Alto | 🟢 Baja | **P0** | Server Action + Zod |
| 2 | **Contact Form** | 🔥 Alto | 🟢 Baja | **P0** | Server Action + Zod |
| 3 | **Forgot Password** | 🔥 Alto | 🟡 Media | **P0** | API Route + Rate Limit |
| 4 | **Help Form** | 🔥 Alto | 🟢 Baja | **P0** | Server Action + Email |
| 5 | **Hero Form** | 🔥 Alto | 🟡 Media | **P1** | Server Action + Tracking |
| 6 | **Quote/Checkout** | 🔥 Alto | 🔴 Alta | **P1** | API Route + Stripe |
| 7 | **Sign In** | 🟡 Medio | 🟡 Media | **P2** | API Route + Auth Contract |
| 8 | **Sign Up** | 🟡 Medio | 🟡 Media | **P2** | API Route + Auth Contract |
| 9 | **User Profile** | 🟡 Medio | 🟢 Baja | **P2** | Server Action + Auth |
| 10 | **Book Services Modal** | 🟡 Medio | 🟢 Baja | **P3** | Reutilizar Hero Form |
| 11 | **Contact Modal** | 🟡 Medio | 🟢 Baja | **P3** | Reutilizar Contact Form |

**Criterios de Impacto:**
- 🔥 **Alto:** Conversión directa, datos críticos, seguridad
- 🟡 **Medio:** UX importante, pero no crítico
- 🟢 **Bajo:** Mejora incremental

**Criterios de Complejidad:**
- 🟢 **Baja:** Validación simple, 1-2 integraciones
- 🟡 **Media:** Múltiples validaciones, 2-3 integraciones
- 🔴 **Alta:** Lógica compleja, múltiples integraciones, webhooks

---

## 🏗️ ARQUITECTURA PROPUESTA

### **Estructura de Carpetas (Futura)**

```
src/
├── lib/
│   ├── validations/          # Zod schemas centralizados
│   │   ├── contact.ts
│   │   ├── newsletter.ts
│   │   ├── auth.ts
│   │   ├── quote.ts
│   │   └── index.ts
│   │
│   ├── contracts/            # Interfaces portables (MANDATORIO)
│   │   ├── database.ts      # DB contract (Supabase/Neon/Fastify)
│   │   ├── auth.ts          # Auth contract (Supabase/NextAuth/Custom)
│   │   ├── email.ts         # Email contract (Resend/SendGrid/SES)
│   │   └── storage.ts       # Storage contract (Supabase/Cloudflare/S3)
│   │
│   ├── providers/            # Implementaciones de contracts
│   │   ├── database/
│   │   │   ├── supabase.ts  # Implementación Supabase
│   │   │   ├── neon.ts      # Implementación Neon (futuro)
│   │   │   └── fastify.ts   # Implementación Fastify (futuro)
│   │   ├── auth/
│   │   │   ├── supabase.ts
│   │   │   └── custom.ts    # Futuro
│   │   └── email/
│   │       └── resend.ts
│   │
│   ├── security/             # Seguridad centralizada
│   │   ├── csrf.ts
│   │   ├── rate-limit.ts
│   │   └── anti-spam.ts
│   │
│   └── forms/                # Utilidades de formularios
│       ├── hooks/
│       │   ├── useFormValidation.ts
│       │   └── useFormSubmit.ts
│       └── components/
│           ├── FormField.tsx
│           ├── FormError.tsx
│           └── FormSubmit.tsx
│
├── app/
│   ├── actions/              # Server Actions
│   │   ├── contact.ts
│   │   ├── newsletter.ts
│   │   ├── help.ts
│   │   └── profile.ts
│   │
│   └── api/
│       ├── forms/            # API Routes (cuando necesario)
│       │   ├── contact/
│       │   ├── newsletter/
│       │   └── quote/
│       └── auth/             # Auth API Routes
│           ├── sign-in/
│           ├── sign-up/
│           └── forgot-password/
│
└── components/
    └── forms/                # Componentes de formularios
        ├── ContactForm.tsx
        ├── NewsletterForm.tsx
        └── QuoteForm.tsx
```

---

## 🔌 CONTRACTS PORTABLES (No Vendor Lock-in)

### **1. Database Contract**

```typescript
// src/lib/contracts/database.ts

/**
 * Contract portable para operaciones de base de datos
 * Implementaciones: Supabase, Neon, Fastify
 */
export interface DatabaseContract {
  // Auth operations
  auth: {
    signUp(email: string, password: string, metadata?: Record<string, any>): Promise<AuthResult>;
    signIn(email: string, password: string): Promise<AuthResult>;
    signOut(): Promise<void>;
    getSession(): Promise<Session | null>;
    updateUser(metadata: Record<string, any>): Promise<AuthResult>;
    resetPassword(email: string): Promise<void>;
  };

  // User operations
  users: {
    getById(id: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
  };

  // Form submissions (opcional, si guardamos en DB)
  submissions: {
    create(data: FormSubmission): Promise<FormSubmission>;
    getByEmail(email: string): Promise<FormSubmission[]>;
  };
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

export interface User {
  id: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface Session {
  user: User;
  expiresAt: number;
}
```

### **2. Auth Contract**

```typescript
// src/lib/contracts/auth.ts

/**
 * Contract portable para autenticación
 * Implementaciones: Supabase Auth, NextAuth, Custom JWT
 */
export interface AuthContract {
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(userId: string, data: ProfileUpdate): Promise<User>;
  resetPassword(email: string): Promise<void>;
  verifyToken(token: string): Promise<User | null>;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  metadata?: Record<string, any>;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdate {
  fullName?: string;
  [key: string]: any;
}
```

### **3. Email Contract**

```typescript
// src/lib/contracts/email.ts

/**
 * Contract portable para envío de emails
 * Implementaciones: Resend, SendGrid, AWS SES
 */
export interface EmailContract {
  sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<EmailResult>;
  sendContactNotification(to: string, data: ContactData): Promise<EmailResult>;
  sendPasswordReset(to: string, resetLink: string): Promise<EmailResult>;
  sendHelpRequest(to: string, data: HelpRequestData): Promise<EmailResult>;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}
```

### **4. Provider Factory Pattern**

```typescript
// src/lib/providers/factory.ts

import { DatabaseContract } from '../contracts/database';
import { AuthContract } from '../contracts/auth';
import { EmailContract } from '../contracts/email';

// Implementaciones
import { SupabaseDatabase } from './database/supabase';
import { SupabaseAuth } from './auth/supabase';
import { ResendEmail } from './email/resend';

// Factory para cambiar proveedores fácilmente
export class ProviderFactory {
  private static dbProvider: DatabaseContract;
  private static authProvider: AuthContract;
  private static emailProvider: EmailContract;

  static getDatabase(): DatabaseContract {
    if (!this.dbProvider) {
      const provider = process.env.DB_PROVIDER || 'supabase';

      switch (provider) {
        case 'supabase':
          this.dbProvider = new SupabaseDatabase();
          break;
        case 'neon':
          // this.dbProvider = new NeonDatabase();
          break;
        case 'fastify':
          // this.dbProvider = new FastifyDatabase();
          break;
        default:
          throw new Error(`Unknown DB provider: ${provider}`);
      }
    }
    return this.dbProvider;
  }

  static getAuth(): AuthContract {
    if (!this.authProvider) {
      const provider = process.env.AUTH_PROVIDER || 'supabase';

      switch (provider) {
        case 'supabase':
          this.authProvider = new SupabaseAuth();
          break;
        case 'custom':
          // this.authProvider = new CustomAuth();
          break;
        default:
          throw new Error(`Unknown auth provider: ${provider}`);
      }
    }
    return this.authProvider;
  }

  static getEmail(): EmailContract {
    if (!this.emailProvider) {
      const provider = process.env.EMAIL_PROVIDER || 'resend';

      switch (provider) {
        case 'resend':
          this.emailProvider = new ResendEmail();
          break;
        case 'sendgrid':
          // this.emailProvider = new SendGridEmail();
          break;
        default:
          throw new Error(`Unknown email provider: ${provider}`);
      }
    }
    return this.emailProvider;
  }
}
```

---

## 📋 PLAN DE 3 NIVELES

### **NIVEL 1: QUICK WINS** (Semana 1-2)
**Objetivo:** Arreglar problemas críticos sin refactorizar

#### 1.1 Eliminar Emails Hardcoded
- **Archivos afectados:**
  - `src/components/Contactus/ContactBanner/ContactForm.tsx`
  - `src/components/Layout/Header/ContactModal.tsx`
- **Acción:** Mover a `process.env.CONTACT_EMAIL`
- **Impacto:** 🔥 Crítico (seguridad)
- **Esfuerzo:** 🟢 30 min

#### 1.2 Arreglar Forgot Password
- **Archivo:** `src/components/Auth/ForgotPassword/index.tsx`
- **Acción:** Integrar con Supabase `resetPasswordForEmail()`
- **Impacto:** 🔥 Crítico (funcionalidad)
- **Esfuerzo:** 🟡 2 horas

#### 1.3 Arreglar Help Form
- **Archivo:** `src/components/Layout/Header/StandaloneHeader.tsx`
- **Acción:** Crear API route `/api/help` y enviar email
- **Impacto:** 🔥 Crítico (funcionalidad)
- **Esfuerzo:** 🟡 2 horas

#### 1.4 Rate Limiting Básico
- **Archivos:** Todas las API routes
- **Acción:** Implementar `@upstash/ratelimit` básico
- **Impacto:** 🔥 Crítico (seguridad)
- **Esfuerzo:** 🟡 4 horas

**Total Quick Wins:** ~8 horas

---

### **NIVEL 2: REFACTOR** (Semana 3-5)
**Objetivo:** Estandarizar con Zod y Server Actions

#### 2.1 Crear Zod Schemas Centralizados
- **Archivos nuevos:**
  - `src/lib/validations/contact.ts`
  - `src/lib/validations/newsletter.ts`
  - `src/lib/validations/auth.ts`
  - `src/lib/validations/quote.ts`
- **Acción:** Migrar todas las validaciones manuales
- **Impacto:** 🔥 Alto (mantenibilidad)
- **Esfuerzo:** 🟡 8 horas

#### 2.2 Migrar a Server Actions (Formularios Simples)
- **Formularios:**
  - Newsletter
  - Contact
  - Help
  - User Profile
- **Acción:** Crear Server Actions en `app/actions/`
- **Impacto:** 🔥 Alto (DX, seguridad)
- **Esfuerzo:** 🟡 12 horas

#### 2.3 Mejorar API Routes (Formularios Complejos)
- **Formularios:**
  - Quote/Checkout (Stripe)
  - Sign In/Up (Auth)
  - Forgot Password (Rate limiting)
- **Acción:** Refactorizar con Zod + Rate Limiting
- **Impacto:** 🔥 Alto (seguridad, escalabilidad)
- **Esfuerzo:** 🟡 10 horas

#### 2.4 Accesibilidad Completa
- **Acción:** Agregar labels, aria-describedby, roles
- **Impacto:** 🟡 Medio (compliance, SEO)
- **Esfuerzo:** 🟡 6 horas

**Total Refactor:** ~36 horas

---

### **NIVEL 3: ENTERPRISE-READY** (Semana 6-8)
**Objetivo:** Portabilidad y escalabilidad

#### 3.1 Implementar Contracts
- **Archivos nuevos:**
  - `src/lib/contracts/database.ts`
  - `src/lib/contracts/auth.ts`
  - `src/lib/contracts/email.ts`
- **Acción:** Crear interfaces portables
- **Impacto:** 🔥 Alto (portabilidad)
- **Esfuerzo:** 🟡 8 horas

#### 3.2 Implementar Provider Factory
- **Archivos nuevos:**
  - `src/lib/providers/factory.ts`
  - `src/lib/providers/database/supabase.ts`
  - `src/lib/providers/auth/supabase.ts`
- **Acción:** Abstraer proveedores actuales
- **Impacto:** 🔥 Alto (portabilidad)
- **Esfuerzo:** 🟡 12 horas

#### 3.3 Migrar Código a Contracts
- **Acción:** Refactorizar formularios para usar contracts
- **Impacto:** 🔥 Alto (portabilidad)
- **Esfuerzo:** 🔴 16 horas

#### 3.4 CSRF Protection
- **Acción:** Implementar tokens CSRF
- **Impacto:** 🟡 Medio (seguridad adicional)
- **Esfuerzo:** 🟡 4 horas

#### 3.5 Edge Runtime Optimization
- **Acción:** Verificar compatibilidad Edge, optimizar
- **Impacto:** 🟡 Medio (performance)
- **Esfuerzo:** 🟡 6 horas

**Total Enterprise-Ready:** ~46 horas

---

## 📊 RESUMEN DE ESFUERZO

| Nivel | Horas | Prioridad | ROI |
|-------|-------|-----------|-----|
| **Quick Wins** | 8h | P0 | 🔥🔥🔥 |
| **Refactor** | 36h | P1 | 🔥🔥 |
| **Enterprise-Ready** | 46h | P2 | 🔥 |
| **TOTAL** | **90h** | - | - |

**Estimación:** 2-3 meses (part-time) o 2-3 semanas (full-time)

---

## 🎯 ROADMAP DE EJECUCIÓN

### **Fase 1: Quick Wins** (Semana 1-2)
```
✅ Eliminar emails hardcoded
✅ Arreglar Forgot Password
✅ Arreglar Help Form
✅ Rate limiting básico
```

### **Fase 2: Refactor** (Semana 3-5)
```
✅ Zod schemas centralizados
✅ Server Actions (formularios simples)
✅ API Routes mejoradas (formularios complejos)
✅ Accesibilidad completa
```

### **Fase 3: Enterprise-Ready** (Semana 6-8)
```
✅ Contracts portables
✅ Provider Factory
✅ Migración a contracts
✅ CSRF Protection
✅ Edge Runtime optimization
```

---

## 🔄 MIGRACIÓN FUTURA: Supabase → Neon

### **Preparación (Ya incluida en Nivel 3)**
1. ✅ Contracts implementados
2. ✅ Provider Factory funcionando
3. ✅ Código usando contracts (no Supabase directo)

### **Migración (Cuando se decida)**
1. Crear `src/lib/providers/database/neon.ts`
2. Implementar `DatabaseContract` para Neon
3. Cambiar `DB_PROVIDER=neon` en `.env`
4. **Sin cambiar código de formularios** ✅

**Tiempo estimado:** 4-8 horas (solo implementar contract)

---

## 🚀 MIGRACIÓN FUTURA: Supabase → Fastify Backend

### **Preparación (Ya incluida en Nivel 3)**
1. ✅ Contracts implementados
2. ✅ Provider Factory funcionando
3. ✅ API Routes desacopladas

### **Migración (Cuando se decida)**
1. Crear `src/lib/providers/database/fastify.ts`
2. Implementar `DatabaseContract` para Fastify
3. Cambiar `DB_PROVIDER=fastify` en `.env`
4. **Sin cambiar código de formularios** ✅

**Tiempo estimado:** 8-16 horas (implementar contract + conectar Fastify)

---

## 📦 DEPENDENCIAS NECESARIAS

### **Fase 1 (Quick Wins)**
```json
{
  "@upstash/ratelimit": "^1.0.0",
  "@upstash/redis": "^1.0.0"  // Opcional: para rate limiting distribuido
}
```

### **Fase 2 (Refactor)**
```json
{
  "zod": "^3.23.8",  // Ya instalado (v4.2.1)
  "react-hook-form": "^7.49.0",  // Opcional: mejor DX
  "@hookform/resolvers": "^3.3.0"  // Para integrar Zod con react-hook-form
}
```

### **Fase 3 (Enterprise-Ready)**
```json
{
  "@edge-runtime/csrf": "^1.0.0",  // Para CSRF protection
  "@neondatabase/serverless": "^0.0.0"  // Futuro: cuando migremos a Neon
}
```

---

## ✅ CHECKLIST DE APROBACIÓN

Antes de ejecutar código, verificar:

- [ ] ✅ Blueprint revisado y aprobado
- [ ] ✅ Contracts diseñados y documentados
- [ ] ✅ Provider Factory pattern entendido
- [ ] ✅ Prioridades definidas (P0/P1/P2)
- [ ] ✅ Roadmap de 3 niveles claro
- [ ] ✅ Dependencias identificadas
- [ ] ✅ Estimación de esfuerzo aceptable
- [ ] ✅ Portabilidad garantizada (Supabase → Neon → Fastify)

---

## 🎬 PRÓXIMOS PASOS

### **Cuando estés listo para ejecutar:**

1. **Aprobar este blueprint**
2. **Decir:** "Socio, aprobamos el blueprint. Ahora ejecuta Fase 1."
3. **Ejecutar Quick Wins** (8 horas)
4. **Revisar resultados**
5. **Continuar con Fase 2** (si todo OK)

---

## 📝 NOTAS FINALES

### **Ventajas de esta Arquitectura:**
- ✅ **Portabilidad:** Cambiar de Supabase a Neon en 4-8 horas
- ✅ **Escalabilidad:** Preparado para Edge Runtime
- ✅ **Mantenibilidad:** Código centralizado, menos duplicación
- ✅ **Seguridad:** Rate limiting, CSRF, validación robusta
- ✅ **DX:** Server Actions, Zod, componentes reutilizables
- ✅ **Futuro-proof:** Preparado para 2027+

### **Riesgos Mitigados:**
- ✅ Vendor lock-in eliminado (contracts)
- ✅ Refactor incremental (no big bang)
- ✅ Backward compatible (no rompe código existente)
- ✅ Testing facilitado (contracts mockeables)

---

**Generado:** 2025-12-29
**Versión:** 1.0
**Estado:** ✅ Blueprint Completo - Listo para Aprobación

**Próximo paso:** Esperar aprobación para ejecutar Fase 1 (Quick Wins)
