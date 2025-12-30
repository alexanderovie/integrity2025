# 🧱 RULES.md - Integrity Clean Solutions

> **Reglas del proyecto - Diciembre 2025**
> Sistema de protección y consistencia para desarrollo escalable

---

## 📍 CONTEXTO Y FECHA BASE

- **Fecha base del proyecto:** Diciembre 2025 (casi 2026)
- **Versión mínima de documentación:** Octubre 2025 o posterior
- **Prohibido:** Patrones, comandos o dependencias viejas de 2023-2024 sin validación oficial

---

## 🚫 PROHIBIDO SIN VALIDACIÓN

### Tecnologías Legacy (NO usar sin aprobación explícita)

- ❌ Express.js (usar Fastify si se necesita backend)
- ❌ React Query sin caso de uso real (Next.js 16 tiene Server Components)
- ❌ Webpack plugins personalizados (Turbopack es el default)
- ❌ Librerías sin mantenimiento activo (última actualización > 6 meses)
- ❌ Paquetes en beta/alpha/RC sin justificación técnica
- ❌ Patrones de Pages Router cuando App Router resuelve el caso

### Comportamientos Prohibidos

- ❌ Instalar dependencias sin verificar versión en npm registry
- ❌ Hacer commit sin `pnpm build` exitoso
- ❌ Push sin `pnpm verify` (lint + type-check + build)
- ❌ Usar `any` en TypeScript (usar `unknown` o tipos específicos)
- ❌ Asumir que algo funciona sin verificar logs reales

---

## ✅ TECNOLOGÍAS AUTORIZADAS

### Stack Principal (2025-2026)

| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **Next.js** | 16.1.1+ | App Router, Server Components, Turbopack default |
| **React** | 19.0.0+ | Server Components, mejor rendimiento |
| **TypeScript** | 5.x | Strict mode obligatorio |
| **Tailwind CSS** | v4 | PostCSS moderno, mejor DX |
| **pnpm** | 9.x+ | Workspace support, mejor que npm/yarn |

### Backend (si se requiere)

| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **Fastify** | Estable (no beta) | Performance, TypeScript nativo |
| **Prisma** | Estable (no alpha/beta) | ORM type-safe |
| **PostgreSQL** | 14+ | Base de datos relacional |

### Infraestructura

| Servicio | Uso |
|----------|-----|
| **Vercel** | Deploy frontend (Next.js) |
| **Google Cloud Run** | Deploy backend (Fastify) |
| **Neon / Supabase** | PostgreSQL managed |
| **Upstash Redis** | Caching y colas (si se requiere) |

---

## 🔐 VERSIONES Y ENGINES

### Node.js

- **Mínimo:** Node.js 20.x LTS
- **Recomendado:** Node.js 22.x LTS
- **Validación:** `.nvmrc` y `package.json` engines

### pnpm

- **Mínimo:** pnpm 9.x
- **Recomendado:** pnpm 10.x
- **Validación:** Script `doctor` verifica versión

---

## 📦 GESTIÓN DE DEPENDENCIAS

### Política de Actualizaciones

| Tipo | Acción | Requisito |
|------|--------|-----------|
| **Major** (1.0.0 → 2.0.0) | ⚠️ Aprobación manual | Revisar breaking changes, testear |
| **Minor** (1.0.0 → 1.1.0) | ✅ Permitido | Verificar que no rompa types |
| **Patch** (1.0.0 → 1.0.1) | ✅ Automático | Solo si `pnpm verify` pasa |

### Proceso de Instalación

1. **Antes de instalar:**
   ```bash
   # Verificar versión en npm registry
   npm view <package> version
   ```

2. **Instalar:**
   ```bash
   pnpm add <package>@<version>
   ```

3. **Después de instalar:**
   ```bash
   pnpm install  # Actualiza lockfile
   pnpm verify  # Verifica que todo funciona
   ```

4. **Commit:**
   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "feat: add <package>@<version>"
   ```

---

## 🧪 VALIDACIÓN OBLIGATORIA

### Antes de Commit

```bash
# Script obligatorio antes de commit
pnpm verify
```

Esto ejecuta:
1. `pnpm lint` - ESLint
2. `pnpm type-check` - TypeScript strict
3. `pnpm build` - Build de producción

### Antes de Push

```bash
# Verificación completa
pnpm doctor
```

Esto verifica:
1. Versiones de Node.js y pnpm
2. Dependencias desactualizadas
3. Dependencias prohibidas
4. Lockfile sincronizado
5. Build exitoso

---

## 🏗️ ARQUITECTURA

### Estructura de Carpetas

```
/
├── apps/              # Aplicaciones (Next.js, Fastify)
│   ├── web/          # Next.js 16 App Router
│   └── api/          # Fastify backend (si aplica)
├── packages/          # Packages compartidos
│   ├── ui/           # Componentes UI
│   ├── config/       # Configuraciones
│   └── types/        # Tipos compartidos
├── src/              # Código fuente principal
├── docs/             # Documentación
├── scripts/          # Scripts de utilidad
└── config/           # Configuraciones del proyecto
```

### Convenciones de Código

- **Server-First:** Usar Server Components por defecto
- **"use client":** Solo cuando hay interacción directa
- **Type Safety:** No usar `any`, usar tipos específicos
- **Validación:** Zod para validación de datos
- **Imports:** Usar path aliases (`@/lib`, `@/components`)

---

## 🚨 REGLAS CRÍTICAS

### 1. Nunca Afirmar sin Verificar

❌ **INCORRECTO:**
```typescript
// "El build funciona" sin ejecutar
```

✅ **CORRECTO:**
```bash
pnpm build  # Ejecutar primero
# Luego confirmar
```

### 2. Lockfile Siempre Sincronizado

❌ **INCORRECTO:**
```bash
git add package.json
# Sin actualizar pnpm-lock.yaml
```

✅ **CORRECTO:**
```bash
pnpm install  # Actualiza lockfile
git add package.json pnpm-lock.yaml
```

### 3. Verificar Logs Reales

❌ **INCORRECTO:**
```typescript
// "El workflow pasará" sin ver logs
```

✅ **CORRECTO:**
```bash
# Ver logs reales de GitHub Actions
# Luego confirmar
```

---

## 📚 REFERENCIAS Y VALIDACIÓN

### Antes de Decidir

1. **Consultar documentación oficial:**
   - Next.js: https://nextjs.org/docs
   - React: https://react.dev
   - TypeScript: https://www.typescriptlang.org/docs

2. **Usar Context7 MCP** (si disponible):
   - Documentación actualizada
   - Ejemplos de código modernos

3. **Validar con ChatGPT 5.2:**
   - Arquitectura y decisiones técnicas
   - Patrones modernos 2025-2026

---

## 🔄 WORKFLOW DE DESARROLLO

### Flujo Estándar

1. **Crear branch:**
   ```bash
   git checkout -b feat/nueva-funcionalidad
   ```

2. **Desarrollar:**
   ```bash
   pnpm dev  # Desarrollo local
   ```

3. **Validar:**
   ```bash
   pnpm verify  # Antes de commit
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "feat: descripción clara"
   ```

5. **Push:**
   ```bash
   git push origin feat/nueva-funcionalidad
   ```

6. **CI/CD:**
   - GitHub Actions ejecuta `pnpm verify`
   - Si pasa → merge permitido
   - Si falla → corregir antes de merge

---

## 🎯 EXCEPCIONES

### Cuándo Romper las Reglas

Solo en casos excepcionales y con justificación:

1. **Dependencia legacy necesaria:**
   - Documentar por qué
   - Plan de migración futuro
   - Aprobación explícita

2. **Patrón temporal:**
   - Comentar en código
   - Issue de seguimiento
   - Fecha límite de migración

---

## 📝 ACTUALIZACIÓN

- **Última actualización:** 2025-12-29
- **Próxima revisión:** Enero 2026
- **Versión:** 1.0.0

---

> **Nota:** Estas reglas protegen el proyecto de decisiones que pueden romperlo en el futuro. No son restricciones arbitrarias, son guardrails basados en experiencia de empresas premium (Stripe, Linear, Vercel).
