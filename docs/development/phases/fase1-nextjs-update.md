# 📋 PLAN DETALLADO - FASE 1: Actualización Next.js Ecosystem

**Fecha:** Diciembre 2025
**Estado:** ⏸️ PENDIENTE DE APROBACIÓN
**No se ejecutará hasta confirmación explícita**

---

## 🎯 OBJETIVO

Actualizar el ecosistema Next.js a versiones estables consistentes (16.1.1) para:
- ✅ Eliminar incompatibilidades (15.x vs 16.x)
- ✅ Aplicar parches de seguridad
- ✅ Garantizar soporte a largo plazo
- ✅ Mantener compatibilidad con código existente

---

## 📊 ESTADO ACTUAL vs OBJETIVO

| Dependencia | Actual | Objetivo | Tipo | Prioridad |
|-------------|--------|----------|------|-----------|
| `next` | 16.0.10 | **16.1.1** | Patch | 🔴 CRÍTICO |
| `@next/mdx` | 15.5.6 | **16.1.1** | Major | 🔴 CRÍTICO |
| `eslint-config-next` | 15.5.6 | **16.1.1** | Major | 🔴 CRÍTICO |
| `@next/third-parties` | 16.0.1 | **16.1.1** | Patch | 🟡 IMPORTANTE |

---

## 🔍 ANÁLISIS DE IMPACTO

### **Archivos que se Modificarán:**

1. **`package.json`** (4 cambios)
   - `next`: `16.0.10` → `16.1.1`
   - `@next/mdx`: `15.5.6` → `16.1.1` (devDependencies)
   - `eslint-config-next`: `15.5.6` → `16.1.1` (devDependencies)
   - `@next/third-parties`: `16.0.1` → `16.1.1`

2. **`pnpm-lock.yaml`** (actualización automática)
   - Se regenerará con nuevas versiones
   - Dependencias transitivas se actualizarán

### **Archivos que NO se Modificarán (pero se verificarán):**

1. **`next.config.ts`**
   - ✅ Compatible con Next.js 16.1.1
   - ✅ `createMDX` de `@next/mdx` sigue funcionando igual
   - ⚠️ Verificar que no haya warnings

2. **`src/mdx-components.tsx`**
   - ✅ Compatible con `@next/mdx` 16.1.1
   - ✅ Patrón `useMDXComponents` sigue siendo válido

3. **`src/app/(site)/blog/[slug]/page.tsx`**
   - ✅ Usa `next-mdx-remote/rsc` (no depende de `@next/mdx` directamente)
   - ✅ No se verá afectado

4. **Archivos `.mdx` en `content/blog/posts/`**
   - ✅ No se modifican
   - ✅ Compatibles con Next.js 16.1.1

---

## ⚠️ RIESGOS POTENCIALES

### **Riesgo BAJO (Probable):**

1. **Cambios en `@next/mdx` 15.x → 16.x**
   - **Probabilidad:** 🟡 MEDIA
   - **Impacto:** 🟡 MEDIO
   - **Mitigación:**
     - `createMDX` API no cambió entre 15.x y 16.x
     - Verificar que `next.config.ts` sigue funcionando
     - Si hay problemas, rollback inmediato

2. **Cambios en `eslint-config-next`**
   - **Probabilidad:** 🟢 BAJA
   - **Impacto:** 🟢 BAJO
   - **Mitigación:**
     - Solo afecta linting, no runtime
     - Si hay problemas, se detecta en `pnpm run lint`

3. **Dependencias transitivas**
   - **Probabilidad:** 🟡 MEDIA
   - **Impacto:** 🟡 MEDIO
   - **Mitigación:**
     - `pnpm-lock.yaml` maneja versiones automáticamente
     - Verificar build después de actualizar

### **Riesgo MUY BAJO (Improbable):**

4. **Breaking changes en Next.js 16.0.10 → 16.1.1**
   - **Probabilidad:** 🟢 MUY BAJA (solo patch update)
   - **Impacto:** 🟢 BAJO
   - **Mitigación:**
     - 16.0.10 → 16.1.1 es solo patch (bug fixes, security)
     - No hay breaking changes documentados

---

## 📝 COMANDOS EXACTOS A EJECUTAR

### **Paso 1: Backup (Antes de cualquier cambio)**

```bash
# Crear backup del lockfile
cp pnpm-lock.yaml pnpm-lock.yaml.backup

# Verificar estado de git
git status

# Crear commit de estado actual (si hay cambios)
git add -A
git commit -m "chore: backup before Next.js 16.1.1 update"
```

### **Paso 2: Actualización de Dependencias**

```bash
# Actualizar Next.js core
pnpm add next@16.1.1

# Actualizar @next/third-parties
pnpm add @next/third-parties@16.1.1

# Actualizar @next/mdx (dev dependency)
pnpm add -D @next/mdx@16.1.1

# Actualizar eslint-config-next (dev dependency)
pnpm add -D eslint-config-next@16.1.1
```

### **Paso 3: Verificación Inmediata**

```bash
# 1. Verificar que las versiones se actualizaron correctamente
pnpm list next @next/mdx @next/third-parties eslint-config-next

# 2. Type check
pnpm run type-check

# 3. Lint
pnpm run lint

# 4. Build
pnpm run build

# 5. Verificar build de Vercel
pnpm run vercel:verify
```

---

## ✅ PLAN DE VERIFICACIÓN

### **Checklist Post-Actualización:**

- [ ] **Versiones correctas:**
  ```bash
  pnpm list next @next/mdx @next/third-parties eslint-config-next
  ```
  Debe mostrar: `16.1.1` para todas

- [ ] **Type check pasa:**
  ```bash
  pnpm run type-check
  ```
  Debe completar sin errores

- [ ] **Lint pasa:**
  ```bash
  pnpm run lint
  ```
  Debe completar (puede tener warnings, pero no errores críticos)

- [ ] **Build exitoso:**
  ```bash
  pnpm run build
  ```
  Debe compilar sin errores

- [ ] **Vercel build exitoso:**
  ```bash
  pnpm run vercel:verify
  ```
  Debe completar exitosamente

- [ ] **Dev server funciona:**
  ```bash
  pnpm dev
  ```
  Debe iniciar sin errores

- [ ] **Blog funciona:**
  - Navegar a `/blog`
  - Abrir un post individual
  - Verificar que MDX se renderiza correctamente

- [ ] **Funcionalidades críticas:**
  - [ ] Homepage carga
  - [ ] Formularios funcionan
  - [ ] Rutas protegidas funcionan (middleware)

---

## 🔄 PLAN DE ROLLBACK

### **Si algo falla:**

```bash
# Opción 1: Restaurar lockfile
cp pnpm-lock.yaml.backup pnpm-lock.yaml
pnpm install --frozen-lockfile

# Opción 2: Revertir package.json y reinstalar
git checkout package.json
pnpm install

# Opción 3: Revertir todo el commit
git log --oneline -1  # Ver último commit
git revert HEAD  # Revertir si se hizo commit
```

### **Criterios para Rollback:**

- ❌ Build falla
- ❌ Type check falla con errores nuevos
- ❌ Dev server no inicia
- ❌ Blog posts no se renderizan
- ❌ Funcionalidades críticas rotas

---

## 📊 IMPACTO ESPERADO

### **Positivo:**
- ✅ Compatibilidad garantizada (todo en 16.1.1)
- ✅ Parches de seguridad aplicados
- ✅ Bug fixes incluidos
- ✅ Mejor estabilidad

### **Neutro:**
- ⚪ Sin cambios visibles para usuarios
- ⚪ Sin cambios en funcionalidad
- ⚪ Sin cambios en performance (marginal)

### **Negativo:**
- ❌ Ninguno esperado (solo patch updates)

---

## 🎯 CRITERIOS DE ÉXITO

La actualización se considera exitosa si:

1. ✅ Todas las versiones están en 16.1.1
2. ✅ `pnpm run verify` pasa completamente
3. ✅ `pnpm run vercel:verify` pasa completamente
4. ✅ Dev server inicia sin errores
5. ✅ Blog posts se renderizan correctamente
6. ✅ No hay regresiones en funcionalidades críticas

---

## ⏸️ ESTADO ACTUAL

**⏸️ PLAN LISTO - ESPERANDO APROBACIÓN**

No se ejecutará ningún comando hasta tu confirmación explícita.

**Próximo paso:** Revisar este plan y aprobar o solicitar ajustes.

---

## 📋 RESUMEN EJECUTIVO

| Aspecto | Detalle |
|---------|---------|
| **Dependencias a actualizar** | 4 (next, @next/mdx, eslint-config-next, @next/third-parties) |
| **Archivos a modificar** | 2 (package.json, pnpm-lock.yaml) |
| **Riesgo** | 🟢 BAJO (solo patch updates) |
| **Tiempo estimado** | 5-10 minutos |
| **Rollback** | ✅ Disponible (backup + git) |
| **Impacto en código** | ❌ Ninguno (solo dependencias) |
| **Impacto en funcionalidad** | ❌ Ninguno |
| **Breaking changes** | ❌ Ninguno esperado |
