# 🎯 BYLINES - Filosofía de Código

> **Principios técnicos y filosóficos del proyecto**
> La voz y el espíritu detrás de cada decisión técnica

---

## 🧠 FILOSOFÍA CORE

### 1. **Claridad > Velocidad**

> "El código se lee más veces de las que se escribe"

- ✅ Nombres descriptivos y autodocumentados
- ✅ Comentarios solo cuando explican el "por qué", no el "qué"
- ✅ Estructura que se explica sola
- ❌ Optimizaciones prematuras sin medir
- ❌ Código "inteligente" que requiere explicación

### 2. **Type Safety es No Negociable**

> "Si TypeScript puede ayudarte, déjalo ayudarte"

- ✅ Tipos explícitos en funciones públicas
- ✅ `unknown` en lugar de `any`
- ✅ Validación con Zod para datos externos
- ❌ `any` como escape hatch
- ❌ Type assertions sin validación

### 3. **Server-First, Client Cuando Necesario**

> "El servidor es más rápido, más seguro, más barato"

- ✅ Server Components por defecto
- ✅ "use client" solo para interacción directa
- ✅ Fetch en Server Components, no en useEffect
- ❌ Client Components innecesarios
- ❌ Data fetching en el cliente cuando puede ser server-side

### 4. **Escalabilidad desde el Día 1**

> "Construye para 10x, no para 1x"

- ✅ Patrones que escalan (Record<string, string> para errores)
- ✅ Utilities reutilizables
- ✅ Tipos compartidos
- ❌ Soluciones "quick fix" que se vuelven permanentes
- ❌ Código duplicado sin justificación

### 5. **Validación Antes de Afirmación**

> "Verifica, luego confirma"

- ✅ Ejecutar comandos antes de decir que funcionan
- ✅ Ver logs reales antes de confirmar
- ✅ Probar localmente antes de commit
- ❌ Asumir que algo funciona
- ❌ Decir "está bien" sin verificar

---

## 🏗️ PRINCIPIOS DE ARQUITECTURA

### Modularidad

```
Cada módulo debe:
- Tener una responsabilidad clara
- Ser testeable de forma aislada
- Exponer una API simple y predecible
```

### Consistencia

```
Mismo patrón en todo el proyecto:
- Formularios: Record<string, string> para errores
- Validación: Validators reutilizables
- Tipos: Tipos compartidos en @/lib/types
```

### Simplicidad

```
La solución más simple que funciona:
- No sobre-ingeniería
- No abstracciones prematuras
- No frameworks cuando vanilla resuelve
```

---

## 💎 VALORES TÉCNICOS

### 1. **Modernidad con Estabilidad**

- Usar tecnologías modernas (Next.js 16, React 19)
- Pero solo versiones estables (no beta/alpha sin justificación)
- Validar con documentación oficial antes de adoptar

### 2. **Performance por Defecto**

- Server Components (más rápido)
- Image optimization (next/image)
- Code splitting automático
- Lazy loading cuando aplica

### 3. **Seguridad por Diseño**

- Validación de inputs (Zod)
- Sanitización de datos
- Secrets en variables de entorno
- No exponer información sensible

### 4. **Developer Experience**

- TypeScript strict para mejor DX
- Path aliases para imports limpios
- Scripts consistentes en package.json
- Documentación clara y actualizada

---

## 🚫 ANTI-PATRONES

### ❌ "Funciona en mi máquina"

**Problema:** Asumir que algo funciona sin verificar

**Solución:** Siempre ejecutar `pnpm verify` antes de commit

### ❌ "Ya lo arreglaré después"

**Problema:** Dejar código roto o temporal

**Solución:** Arreglar ahora o crear issue con fecha límite

### ❌ "Es solo un parche rápido"

**Problema:** Parches que se vuelven permanentes

**Solución:** Si es temporal, documentar y planear migración

### ❌ "No necesito tipos aquí"

**Problema:** Usar `any` para "ahorrar tiempo"

**Solución:** Tipos correctos desde el inicio ahorran tiempo después

---

## 🎨 ESTILO DE CÓDIGO

### Nombres

```typescript
// ✅ Bueno: Descriptivo y claro
const validateEmail = (email: string) => { ... }
const userFormErrors: FormErrors = { ... }

// ❌ Malo: Vago o abreviado
const val = (e: string) => { ... }
const errs: any = { ... }
```

### Estructura

```typescript
// ✅ Bueno: Lógica clara y separada
const validateForm = () => {
  const errors: FormErrors = {};
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  return errors;
};

// ❌ Malo: Todo mezclado
const validate = () => {
  if (!email.includes('@')) return { email: 'invalid' };
  // ... más lógica mezclada
};
```

### Comentarios

```typescript
// ✅ Bueno: Explica el "por qué"
// Usamos Record<string, string> para escalabilidad
// (mismo patrón que Stripe, Linear, Vercel)
const errors: FormErrors = {};

// ❌ Malo: Explica el "qué" (obvio del código)
// Crea un objeto de errores vacío
const errors = {};
```

---

## 🔄 WORKFLOW DE DECISIONES

### Antes de Agregar Dependencia

1. ¿Next.js o React ya lo resuelven?
2. ¿Hay alternativa más ligera?
3. ¿Está mantenida activamente?
4. ¿Versión estable o beta?
5. ¿Documentación oficial actualizada?

### Antes de Cambiar Arquitectura

1. ¿Problema real o hipotético?
2. ¿Solución actual realmente no funciona?
3. ¿Beneficio justifica el costo?
4. ¿Patrón usado por empresas premium?
5. ¿Documentado y testeable?

---

## 📚 REFERENCIAS DE INSPIRACIÓN

### Empresas que Inspiran Nuestro Código

- **Stripe:** Type safety, escalabilidad, documentación clara
- **Linear:** UI/UX, performance, developer experience
- **Vercel:** Next.js best practices, modern tooling
- **Vercel (Next.js):** Server Components, App Router, optimizaciones

### Principios Adoptados

- **SOLID:** Especialmente Single Responsibility
- **DRY:** Don't Repeat Yourself (con validación)
- **YAGNI:** You Aren't Gonna Need It (no sobre-ingeniería)
- **KISS:** Keep It Simple, Stupid

---

## 🎯 MÉTRICAS DE ÉXITO

### Código de Calidad

- ✅ TypeScript strict sin errores
- ✅ ESLint sin warnings
- ✅ Build exitoso siempre
- ✅ Tests pasando (cuando aplica)

### Developer Experience

- ✅ Setup en < 5 minutos
- ✅ Scripts consistentes
- ✅ Documentación clara
- ✅ Errores descriptivos

### Performance

- ✅ Lighthouse score > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Bundle size optimizado

---

## 📝 ACTUALIZACIÓN

- **Última actualización:** 2025-12-29
- **Versión:** 1.0.0
- **Próxima revisión:** Enero 2026

---

> **Nota:** Estos bylines no son reglas rígidas, son principios que guían decisiones. Cuando hay conflicto, la claridad y escalabilidad ganan.
