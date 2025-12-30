# 📋 INVENTARIO ENTERPRISE DE FORMULARIOS - 2025/2026
**Fecha:** 2025-12-29
**Proyecto:** Integrity Clean Solutions
**Objetivo:** Mapear y evaluar todos los formularios contra estándares enterprise 2025-2027

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total Formularios** | 11 |
| **Formularios Enterprise-Ready** | 0 |
| **Formularios Necesitan Revisión** | 8 |
| **Formularios Críticos** | 3 |
| **Validación con Zod** | ❌ 0% (0/11) |
| **Server Actions** | ❌ 0% (0/11) |
| **Rate Limiting** | ❌ 0% (0/11) |
| **CSRF Protection** | ❌ 0% (0/11) |
| **Accesibilidad Completa** | ⚠️ 27% (3/11) |

---

## 🔍 INVENTARIO DETALLADO

### 1. **Hero Form (FormComponent)**
**Ruta:** `src/components/Home/Hero/index.tsx` + `FormComponent.tsx`
**Componente:** `HeroSection` + `FormComponent`

#### Campos Capturados
- `name` (text) - Full name
- `number` (tel) - Phone number
- `email` (email) - Email address
- `services` (checkbox[]) - Service options
- `zip` (text) - ZIP code

#### Validación
- **Tipo:** Manual con regex
- **Regex usados:**
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Phone: `/^\d{10,15}$/`
  - ZIP: `/^\d{4,10}$/`
  - Name: `/^[a-zA-Z\s]+$/`
- **Problema:** Validación duplicada, no centralizada

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo de cada campo
- ⚠️ Server: No hay manejo de errores del servidor (HubSpot puede fallar silenciosamente)
- ⚠️ Timeout: 2 segundos para HubSpot, pero no se muestra error al usuario si falla

#### Integraciones
- ✅ HubSpot: `sendContactToHubSpot()` (con timeout)
- ❌ Stripe: No
- ❌ Supabase: No
- ❌ Resend: No
- ✅ Meta Pixel: No (pero debería trackear "Lead")
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ⚠️ Server-side checks: HubSpot se llama desde cliente (exponer API key en bundle si no está protegido)
- ⚠️ Datos sensibles: Email/teléfono se envían en URL params (redirección a `/quote`)

#### Accesibilidad
- ❌ Labels: Solo placeholders, no hay `<label>` asociados
- ❌ Roles: No hay `role="form"` o `aria-describedby`
- ⚠️ Focus states: Depende de CSS, no verificado
- ✅ Loading state: Sí (`isLoading` con spinner)

#### Estado Actual
**🔴 CRÍTICO** - Necesita refactorización enterprise

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [ ] Protección de datos sensibles (no en URL params)
- [ ] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles
- [ ] Tracking limpio (Meta Pixel para Lead)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks

---

### 2. **Quote Page Form**
**Ruta:** `src/app/(standalone)/quote/page.tsx`
**Componente:** `QuotePageContent`

#### Campos Capturados
- `zipCode` (text) - ZIP Code
- `serviceType` (select) - Service Type
- `frequency` (button group) - Frequency
- `bedrooms` (select) - Bedrooms
- `bathrooms` (select) - Bathrooms
- `propertySize` (select) - Sq Ft
- `extras` (object) - Extras con cantidades
- `preferredDate` (date) - Preferred Date
- `serviceDate` (date) - Service Date
- `timeSlot` (select) - Time Slot
- `tipPercentage` (button group) - Tip %
- `customTip` (number) - Custom Tip
- `name` (text) - Full name
- `email` (email) - Email address
- `phone` (tel) - Phone number
- `address` (text) - Full address
- `comments` (textarea) - Comments

#### Validación
- **Tipo:** Manual con regex
- **Regex usados:**
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Phone: `/^\d{10}$/` (solo 10 dígitos)
  - ZIP: `/^\d{5}$/` (solo 5 dígitos)
- **Problema:** Validación muy básica, no valida formato internacional de teléfono

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo de cada campo
- ✅ Scroll a primer error: Implementado
- ⚠️ Server: Manejo básico con `setErrors({ submit: ... })`
- ❌ Error codes: No hay códigos HTTP estructurados

#### Integraciones
- ✅ Stripe: `/api/checkout` → crea checkout session
- ✅ Meta Pixel: Trackea "InitiateCheckout" event
- ❌ HubSpot: No (debería crear contacto antes de checkout)
- ❌ Supabase: No
- ❌ Resend: No
- ✅ Webhooks: Stripe webhook procesa después del pago

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ⚠️ Server-side checks: Validación solo en cliente
- ⚠️ Datos sensibles: Email/teléfono en request body (OK, pero debería hashearse para Meta Pixel)

#### Accesibilidad
- ⚠️ Labels: Algunos campos tienen `<label>`, otros solo placeholders
- ❌ Roles: No hay `role="form"` o `aria-describedby`
- ⚠️ Focus states: Depende de CSS
- ✅ Loading state: Sí (`loading` con spinner)
- ✅ Disabled state: Botón deshabilitado durante submit

#### Estado Actual
**🟡 NECESITA REVISIÓN** - Funcional pero no enterprise-ready

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [x] Protección de datos sensibles (en body, no en URL)
- [ ] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles
- [x] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [x] Compatible con Stripe + webhooks

---

### 3. **Contact Form**
**Ruta:** `src/components/Contactus/ContactBanner/ContactForm.tsx`
**Componente:** `ContactForm`

#### Campos Capturados
- `name` (text) - Full name
- `number` (tel) - Phone number
- `email` (email) - Email address
- `message` (textarea) - Message

#### Validación
- **Tipo:** Manual con regex
- **Regex usados:**
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Phone: `/^[0-9]{10,15}$/`
- **Problema:** Validación básica, no valida formato internacional

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo de cada campo
- ⚠️ Server: No hay manejo de errores del servidor
- ❌ Error codes: No hay códigos HTTP estructurados

#### Integraciones
- ✅ HubSpot: `sendContactToHubSpot()` (no bloquea si falla)
- ✅ Meta Pixel: Trackea "Contact" event
- ❌ Stripe: No
- ❌ Supabase: No
- ❌ Resend: No
- ⚠️ FormSubmit.co: Envía a `https://formsubmit.co/ajax/niravjoshi87@gmail.com` (hardcoded email, inseguro)

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ⚠️ Server-side checks: FormSubmit.co es servicio externo, no validación propia
- 🔴 **CRÍTICO:** Email hardcoded en código (`niravjoshi87@gmail.com`)
- ⚠️ Datos sensibles: Email/teléfono en request body (OK)

#### Accesibilidad
- ❌ Labels: Solo placeholders, no hay `<label>` asociados
- ❌ Roles: No hay `role="form"` o `aria-describedby`
- ⚠️ Focus states: Depende de CSS
- ❌ Loading state: No hay indicador de carga

#### Estado Actual
**🔴 CRÍTICO** - Email hardcoded, falta seguridad y accesibilidad

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [x] Protección de datos sensibles (en body)
- [ ] No exponer llaves públicas/privadas (email hardcoded)
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [ ] Loading states visibles
- [x] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks

---

### 4. **Newsletter Form**
**Ruta:** `src/components/Layout/Footer/Newsletter.tsx`
**Componente:** `Newsletter`

#### Campos Capturados
- `email` (email) - Email address

#### Validación
- **Tipo:** HTML5 `required` + validación básica en servidor
- **Regex en servidor:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Problema:** Validación duplicada (cliente + servidor con diferentes métodos)

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo del campo
- ✅ Server: Manejo de errores con códigos HTTP (400/500)
- ✅ Error messages: Mensajes claros al usuario

#### Integraciones
- ✅ Resend: Envía email de bienvenida
- ✅ HubSpot: Crea contacto en HubSpot (no bloquea si falla)
- ❌ Stripe: No
- ❌ Supabase: No
- ❌ Meta Pixel: No (debería trackear "Subscribe")
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado (vulnerable a spam)
- ✅ Server-side checks: Validación en `/api/newsletter`
- ✅ Datos sensibles: Email en body (OK)

#### Accesibilidad
- ✅ Labels: Tiene `id="email"` pero no `<label htmlFor="email">`
- ❌ Roles: No hay `role="form"` o `aria-describedby`
- ⚠️ Focus states: Depende de CSS
- ✅ Loading state: Sí (`status === "loading"` con "Subscribing...")
- ✅ Success state: Toast notification con `aria-live="assertive"`

#### Estado Actual
**🟡 NECESITA REVISIÓN** - Funcional pero falta rate limiting y CSRF

#### Checklist Enterprise
- [ ] Validación con Zod
- [x] Server Actions o API route segura
- [x] Protección de datos sensibles (en body)
- [x] No exponer llaves públicas/privadas
- [x] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles
- [ ] Tracking limpio (Meta Pixel para Subscribe)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

### 5. **Book Services Modal**
**Ruta:** `src/components/Layout/Header/BookServicesModal.tsx`
**Componente:** `BookServicesModal`

#### Campos Capturados
- `name` (text) - Full name
- `number` (tel) - Phone number
- `email` (email) - Email address
- `services` (checkbox[]) - Service options
- `zip` (text) - ZIP code

#### Validación
- **Tipo:** Reutiliza `FormComponent` (misma validación manual)
- **Problema:** Misma validación duplicada que Hero Form

#### Manejo de Errores
- ✅ Visual: Hereda de `FormComponent`
- ❌ Server: No hay manejo de errores del servidor
- ❌ No envía datos a servidor: Solo redirige a `/quote` con params

#### Integraciones
- ❌ HubSpot: No (debería crear contacto)
- ❌ Stripe: No
- ❌ Supabase: No
- ❌ Resend: No
- ❌ Meta Pixel: No
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ⚠️ Datos sensibles: Email/teléfono en URL params (redirección)

#### Accesibilidad
- ✅ Labels: Hereda de `FormComponent` (checkboxes tienen labels)
- ✅ Modal: Tiene `role="dialog"` y `aria-modal="true"`
- ✅ Close button: Tiene `aria-label="Close booking modal"`
- ⚠️ Focus trap: No verificado

#### Estado Actual
**🟡 NECESITA REVISIÓN** - Reutiliza componente pero no envía datos

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [ ] Protección de datos sensibles (no en URL params)
- [ ] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles (heredado)
- [ ] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks

---

### 6. **User Profile Form**
**Ruta:** `src/components/Auth/UserProfile/index.tsx`
**Componente:** `UserProfile`

#### Campos Capturados
- `username` (text) - Username (full_name)

#### Validación
- **Tipo:** Ninguna (solo HTML5)
- **Problema:** No valida longitud, caracteres especiales, etc.

#### Manejo de Errores
- ⚠️ Visual: Usa `alert()` (no enterprise)
- ❌ Server: Manejo básico con `alert()`
- ❌ Error codes: No hay códigos HTTP estructurados

#### Integraciones
- ✅ Supabase: `supabase.auth.updateUser()`
- ❌ HubSpot: No
- ❌ Stripe: No
- ❌ Resend: No
- ❌ Meta Pixel: No
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ✅ Server-side checks: Supabase maneja autenticación
- ⚠️ Session refresh: Hace `refreshSession()` antes de actualizar

#### Accesibilidad
- ❌ Labels: Solo placeholder, no hay `<label>`
- ❌ Roles: No hay `role="form"`
- ⚠️ Focus states: Depende de CSS
- ❌ Loading state: No hay indicador de carga

#### Estado Actual
**🟡 NECESITA REVISIÓN** - Funcional pero no enterprise-ready

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [x] Protección de datos sensibles (Supabase)
- [x] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [ ] Loading states visibles
- [ ] Tracking limpio (N/A)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

### 7. **Sign Up Form**
**Ruta:** `src/components/Auth/SignUp/index.tsx`
**Componente:** `SignUp`

#### Campos Capturados
- `username` (text) - Name
- `email` (email) - Email
- `password` (password) - Password

#### Validación
- **Tipo:** Ninguna en cliente (solo HTML5)
- **Problema:** No valida fortaleza de contraseña, formato de email, etc.

#### Manejo de Errores
- ⚠️ Visual: Muestra error genérico (`error.message`)
- ✅ Server: Supabase maneja errores
- ❌ Error codes: No hay códigos HTTP estructurados

#### Integraciones
- ✅ Supabase: `supabase.auth.signUp()`
- ✅ Social Sign In: Componente `SocialSignIn`
- ❌ HubSpot: No (debería crear contacto)
- ❌ Stripe: No
- ❌ Resend: No
- ❌ Meta Pixel: No (debería trackear "CompleteRegistration")
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado (vulnerable a brute force)
- ✅ Server-side checks: Supabase maneja autenticación
- ⚠️ Password: No hay validación de fortaleza en cliente

#### Accesibilidad
- ❌ Labels: Solo placeholders, no hay `<label>`
- ❌ Roles: No hay `role="form"`
- ⚠️ Focus states: Depende de CSS
- ✅ Loading state: Sí (`<Loader />`)

#### Estado Actual
**🟡 NECESITA REVISIÓN** - Funcional pero falta validación y rate limiting

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [x] Protección de datos sensibles (Supabase)
- [x] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles
- [ ] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

### 8. **Sign In Form**
**Ruta:** `src/components/Auth/SignIn/index.tsx`
**Componente:** `Signin`

#### Campos Capturados
- `email` (email) - Email
- `password` (password) - Password

#### Validación
- **Tipo:** Manual con regex
- **Regex usados:**
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Password: Longitud mínima 6 caracteres
- **Problema:** Validación básica, no valida fortaleza

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo de cada campo
- ✅ Server: Supabase maneja errores
- ❌ Error codes: No hay códigos HTTP estructurados

#### Integraciones
- ✅ Supabase: `supabase.auth.signInWithPassword()`
- ✅ Social Sign In: Componente `SocialSignIn`
- ❌ HubSpot: No
- ❌ Stripe: No
- ❌ Resend: No
- ❌ Meta Pixel: No (debería trackear "Login")
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado (vulnerable a brute force)
- ✅ Server-side checks: Supabase maneja autenticación
- ⚠️ Session check: Verifica sesión existente en `useEffect`

#### Accesibilidad
- ❌ Labels: Solo placeholders, no hay `<label>`
- ❌ Roles: No hay `role="form"`
- ⚠️ Focus states: Depende de CSS
- ✅ Loading state: Sí (`<Loader />`)

#### Estado Actual
**🟡 NECESITA REVISIÓN** - Funcional pero falta rate limiting y CSRF

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [x] Protección de datos sensibles (Supabase)
- [x] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles
- [ ] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

### 9. **Forgot Password Form**
**Ruta:** `src/components/Auth/ForgotPassword/index.tsx`
**Componente:** `ForgotPassword`

#### Campos Capturados
- `email` (email) - Email

#### Validación
- **Tipo:** Manual con regex
- **Regex usado:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Problema:** No valida dominio, solo formato básico

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo del campo
- ❌ Server: No hay integración con Supabase (solo `setTimeout` simulado)
- 🔴 **CRÍTICO:** No envía email real, solo simula con `setTimeout`

#### Integraciones
- ❌ Supabase: No (debería usar `supabase.auth.resetPasswordForEmail()`)
- ❌ HubSpot: No
- ❌ Stripe: No
- ❌ Resend: No
- ❌ Meta Pixel: No
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado (vulnerable a spam)
- ❌ Server-side checks: No hay validación en servidor
- 🔴 **CRÍTICO:** No funciona realmente, solo simula

#### Accesibilidad
- ❌ Labels: Solo placeholder, no hay `<label>`
- ❌ Roles: No hay `role="form"`
- ⚠️ Focus states: Depende de CSS
- ✅ Loading state: Sí (`<Loader />`)

#### Estado Actual
**🔴 CRÍTICO** - No funciona, solo simula el envío de email

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [ ] Protección de datos sensibles
- [ ] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [x] Loading states visibles
- [ ] Tracking limpio (N/A)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

### 10. **Help Form (StandaloneHeader)**
**Ruta:** `src/components/Layout/Header/StandaloneHeader.tsx`
**Componente:** `StandaloneHeader` (form inline)

#### Campos Capturados
- `name` (text) - Full name
- `phone` (tel) - Phone number
- `notes` (textarea) - Additional details

#### Validación
- **Tipo:** Manual básica
- **Validaciones:**
  - Name: No vacío
  - Phone: Mínimo 7 dígitos
- **Problema:** Validación muy básica, no valida formato internacional

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo de cada campo
- ❌ Server: Solo `console.info()`, no envía datos
- 🔴 **CRÍTICO:** No funciona realmente, solo loguea en consola

#### Integraciones
- ❌ HubSpot: No (debería crear contacto)
- ❌ Stripe: No
- ❌ Supabase: No
- ❌ Resend: No (debería enviar email al equipo)
- ❌ Meta Pixel: No
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ❌ Server-side checks: No hay validación en servidor

#### Accesibilidad
- ✅ Labels: Tiene `<label htmlFor="...">` para todos los campos
- ✅ Modal: Tiene `role="dialog"` y `aria-modal="true"`
- ✅ Close button: Tiene `aria-label="Close help form"`
- ⚠️ Focus trap: No verificado

#### Estado Actual
**🔴 CRÍTICO** - No funciona realmente, solo loguea en consola

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [ ] Protección de datos sensibles
- [ ] No exponer llaves públicas/privadas
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [ ] Loading states visibles
- [ ] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

### 11. **Contact Modal**
**Ruta:** `src/components/Layout/Header/ContactModal.tsx`
**Componente:** `ContactModal`

#### Campos Capturados
- `name` (text) - Full name
- `email` (email) - Email
- `phone` (tel) - Phone
- `message` (textarea) - Message

#### Validación
- **Tipo:** Manual con regex
- **Regex usado:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (solo email)
- **Problema:** Validación básica, no valida formato internacional de teléfono

#### Manejo de Errores
- ✅ Visual: Muestra errores debajo de cada campo
- ⚠️ Server: Envía a FormSubmit.co, pero no maneja errores del servidor
- ❌ Error codes: No hay códigos HTTP estructurados

#### Integraciones
- ⚠️ FormSubmit.co: Envía a `https://formsubmit.co/ajax/niravjoshi87@gmail.com` (hardcoded email, inseguro)
- ❌ HubSpot: No (debería crear contacto)
- ❌ Stripe: No
- ❌ Supabase: No
- ❌ Resend: No
- ❌ Meta Pixel: No
- ❌ Webhooks: No

#### Seguridad
- ❌ CSRF: No hay protección
- ❌ Rate Limiting: No implementado
- ⚠️ Server-side checks: FormSubmit.co es servicio externo
- 🔴 **CRÍTICO:** Email hardcoded en código (`niravjoshi87@gmail.com`)

#### Accesibilidad
- ❌ Labels: Solo placeholders, no hay `<label>`
- ✅ Modal: Tiene `role="dialog"` implícito
- ✅ Close button: Tiene `aria-label="Close contact modal"`
- ⚠️ Focus trap: No verificado

#### Estado Actual
**🔴 CRÍTICO** - Email hardcoded, falta seguridad y funcionalidad real

#### Checklist Enterprise
- [ ] Validación con Zod
- [ ] Server Actions o API route segura
- [x] Protección de datos sensibles (en body)
- [ ] No exponer llaves públicas/privadas (email hardcoded)
- [ ] Manejo de error estructurado (200/400/500)
- [ ] Prevención de duplicados (doble submit)
- [ ] Loading states visibles
- [ ] Tracking limpio (Meta Pixel)
- [ ] Preparado para Vercel Edge
- [ ] Compatible con Stripe + webhooks (N/A)

---

## 🔒 RUTAS API ANALIZADAS

### `/api/newsletter` (POST)
- ✅ Validación en servidor
- ✅ Manejo de errores estructurado (400/500)
- ✅ Integración con Resend
- ✅ Integración con HubSpot (no bloquea)
- ❌ Rate limiting
- ❌ CSRF protection

### `/api/hubspot/contacts` (POST)
- ✅ Validación básica (email requerido)
- ⚠️ Manejo de errores: Retorna 500 pero no bloquea flujo
- ✅ Integración con HubSpot
- ❌ Rate limiting
- ❌ CSRF protection
- ❌ Validación con Zod

### `/api/checkout` (POST)
- ⚠️ Validación básica (serviceId requerido)
- ⚠️ Manejo de errores: Retorna 400/500 pero mensajes genéricos
- ✅ Integración con Stripe
- ❌ Rate limiting
- ❌ CSRF protection
- ❌ Validación con Zod

### `/api/meta/pixel` (POST)
- ✅ Validación básica (event_name requerido)
- ✅ Manejo de errores estructurado (400/500)
- ✅ Hash de PII (email, phone, nombres)
- ❌ Rate limiting
- ❌ CSRF protection
- ❌ Validación con Zod

### `/api/webhooks/stripe` (POST)
- ✅ Validación de firma Stripe
- ✅ Manejo de errores estructurado
- ✅ Integración con Stripe, HubSpot, Resend
- ❌ Rate limiting (vulnerable a ataques)
- ✅ CSRF protection (firma Stripe)

---

## 📈 DIAGNÓSTICO POR PRIORIDAD

### 🔴 **CRÍTICO** (3 formularios)
1. **Hero Form** - Datos sensibles en URL params, falta validación enterprise
2. **Forgot Password** - No funciona realmente, solo simula
3. **Help Form** - No funciona realmente, solo loguea
4. **Contact Form + Contact Modal** - Email hardcoded en código

### 🟡 **NECESITA REVISIÓN** (8 formularios)
1. **Quote Page** - Funcional pero falta validación enterprise
2. **Newsletter** - Funcional pero falta rate limiting
3. **Book Services Modal** - Reutiliza componente pero no envía datos
4. **User Profile** - Funcional pero usa `alert()`
5. **Sign Up** - Funcional pero falta validación y rate limiting
6. **Sign In** - Funcional pero falta rate limiting y CSRF

---

## 🎯 RECOMENDACIONES POR PRIORIDAD

### **ALTA PRIORIDAD** (Quick Wins)

1. **Implementar Zod para validación centralizada**
   - Crear schemas compartidos en `src/lib/validations/`
   - Reemplazar todas las validaciones manuales
   - Beneficio: Validación consistente, type-safe, menos bugs

2. **Eliminar emails hardcoded**
   - Mover `niravjoshi87@gmail.com` a variable de entorno
   - Crear `/api/contact` route segura
   - Beneficio: Seguridad, configurabilidad

3. **Implementar rate limiting**
   - Usar `@upstash/ratelimit` o similar
   - Aplicar a todos los endpoints de formularios
   - Beneficio: Prevención de spam y ataques

4. **Arreglar formularios que no funcionan**
   - Forgot Password: Integrar con Supabase
   - Help Form: Crear API route y enviar email
   - Beneficio: Funcionalidad real

5. **Agregar labels y accesibilidad**
   - Agregar `<label htmlFor="...">` a todos los inputs
   - Agregar `aria-describedby` para errores
   - Beneficio: Accesibilidad, SEO, UX

### **MEDIA PRIORIDAD**

6. **Implementar Server Actions o API routes seguras**
   - Migrar formularios a Server Actions (Next.js 15+)
   - O crear API routes con validación Zod
   - Beneficio: Seguridad, mejor UX

7. **Protección CSRF**
   - Implementar tokens CSRF para formularios críticos
   - Usar `@edge-runtime/csrf` o similar
   - Beneficio: Seguridad contra CSRF attacks

8. **Prevención de doble submit**
   - Deshabilitar botón durante submit
   - Usar `useTransition` o estado de loading
   - Beneficio: Prevención de duplicados

9. **Tracking limpio con Meta Pixel**
   - Agregar eventos faltantes (Lead, Login, Subscribe, etc.)
   - Centralizar tracking en hook o utilidad
   - Beneficio: Mejor tracking, menos código duplicado

### **BAJA PRIORIDAD**

10. **Preparar para Vercel Edge**
    - Verificar compatibilidad con Edge Runtime
    - Optimizar para serverless
    - Beneficio: Mejor performance, escalabilidad

11. **Mejorar manejo de errores**
    - Estructurar códigos HTTP (200/400/500)
    - Mensajes de error consistentes
    - Beneficio: Mejor debugging, UX

12. **Optimizar bundle size**
    - Lazy load formularios modales
    - Code splitting para validaciones
    - Beneficio: Mejor performance

---

## 📋 QUICK WINS LIST

### **Semana 1-2: Seguridad Crítica**
- [ ] Eliminar emails hardcoded → Variables de entorno
- [ ] Implementar rate limiting básico
- [ ] Arreglar Forgot Password (integrar Supabase)
- [ ] Arreglar Help Form (crear API route)

### **Semana 3-4: Validación y Accesibilidad**
- [ ] Implementar Zod schemas centralizados
- [ ] Migrar validaciones manuales a Zod
- [ ] Agregar labels a todos los inputs
- [ ] Agregar `aria-describedby` para errores

### **Semana 5-6: Mejoras Enterprise**
- [ ] Implementar Server Actions o API routes seguras
- [ ] Agregar protección CSRF
- [ ] Prevención de doble submit
- [ ] Tracking limpio con Meta Pixel

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Actual | Objetivo 2026 |
|---------|--------|----------------|
| Formularios Enterprise-Ready | 0% | 100% |
| Validación con Zod | 0% | 100% |
| Rate Limiting | 0% | 100% |
| CSRF Protection | 0% | 100% |
| Accesibilidad Completa | 27% | 100% |
| Server Actions/API Routes | 0% | 100% |
| Tracking Meta Pixel | 36% | 100% |

---

## 🔗 DEPENDENCIAS NECESARIAS

```json
{
  "zod": "^3.23.8",  // Ya instalado (v4.2.1)
  "@upstash/ratelimit": "^1.0.0",  // Para rate limiting
  "@edge-runtime/csrf": "^1.0.0",  // Para CSRF protection
  "react-hook-form": "^7.49.0",  // Opcional: mejor DX
  "@hookform/resolvers": "^3.3.0"  // Para integrar Zod con react-hook-form
}
```

---

## 📝 NOTAS FINALES

- **Ningún formulario cumple 100% con estándares enterprise 2025-2027**
- **3 formularios críticos no funcionan realmente** (Forgot Password, Help Form, Contact Modal con email hardcoded)
- **Validación duplicada** en múltiples lugares (debe centralizarse con Zod)
- **Falta rate limiting** en todos los endpoints (vulnerable a spam/ataques)
- **Falta CSRF protection** en formularios críticos
- **Accesibilidad incompleta** (falta labels, roles, aria-describedby)

**Recomendación:** Priorizar seguridad crítica (emails hardcoded, rate limiting) antes de mejoras de UX/accesibilidad.

---

**Generado:** 2025-12-29
**Versión:** 1.0
**Estado:** ✅ Completo - Listo para revisión
