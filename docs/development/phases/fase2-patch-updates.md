# 📋 PLAN DETALLADO - FASE 2: Actualizaciones Seguras (Patch/Minor)

**Estado:** ⏸️ PENDIENTE - Solo después de aprobación de FASE 1
**Tipo:** Patch y Minor updates (seguros)

---

## 🎯 OBJETIVO

Actualizar dependencias a versiones estables más recientes mediante patch y minor updates que no introducen breaking changes.

---

## 📊 DEPENDENCIAS A ACTUALIZAR

### **Core Framework:**
| Dependencia | Actual | Objetivo | Tipo | Riesgo |
|-------------|--------|----------|------|--------|
| `react` | 19.2.0 | **19.2.3** | Patch | 🟢 BAJO |
| `react-dom` | 19.2.0 | **19.2.3** | Patch | 🟢 BAJO |

### **Integraciones Críticas:**
| Dependencia | Actual | Objetivo | Tipo | Riesgo |
|-------------|--------|----------|------|--------|
| `@supabase/supabase-js` | 2.49.4 | **^2.89.0** | Minor | 🟢 BAJO |
| `resend` | 6.0.2 | **^6.6.0** | Minor | 🟢 BAJO |
| `@stripe/stripe-js` | 8.1.0 | **^8.6.0** | Minor | 🟢 BAJO |

### **UI Libraries:**
| Dependencia | Actual | Objetivo | Tipo | Riesgo |
|-------------|--------|----------|------|--------|
| `framer-motion` | 12.10.5 | **^12.23.26** | Minor | 🟢 BAJO |
| `lucide-react` | 0.503.0 | **^0.562.0** | Minor | 🟢 BAJO |

### **Dev Tools:**
| Dependencia | Actual | Objetivo | Tipo | Riesgo |
|-------------|--------|----------|------|--------|
| `tailwindcss` | ^4 | **^4.1.18** | Patch | 🟢 BAJO |
| `@tailwindcss/postcss` | ^4 | **^4.1.18** | Patch | 🟢 BAJO |
| `eslint` | ^9 | **^9.39.2** | Patch | 🟢 BAJO |
| `@eslint/eslintrc` | ^3 | **^3.3.3** | Patch | 🟢 BAJO |
| `@types/react` | ^19 | **^19.2.7** | Patch | 🟢 BAJO |
| `@types/react-dom` | ^19 | **^19.2.3** | Patch | 🟢 BAJO |

---

## 🔍 ANÁLISIS DE IMPACTO

### **Archivos que se Modificarán:**
- `package.json` (12 cambios)
- `pnpm-lock.yaml` (regeneración automática)

### **Archivos que NO se Modificarán:**
- ✅ Todo el código fuente (solo dependencias)
- ✅ Configuraciones (next.config.ts, tsconfig.json, etc.)

### **Impacto en Funcionalidades:**

#### **React 19.2.0 → 19.2.3:**
- ✅ Solo patch (bug fixes, security)
- ✅ Sin breaking changes
- ✅ Compatible con Next.js 16.1.1

#### **Supabase 2.49.4 → 2.89.0:**
- ✅ Minor updates (nuevas features, bug fixes)
- ✅ API compatible
- ✅ Sin cambios en código necesario

#### **Resend 6.0.2 → 6.6.0:**
- ✅ Minor updates
- ✅ API compatible
- ✅ Sin cambios en código necesario

#### **Stripe 8.1.0 → 8.6.0:**
- ✅ Minor updates (client-side)
- ✅ API compatible
- ✅ Sin cambios en código necesario

#### **UI Libraries:**
- ✅ Solo mejoras y bug fixes
- ✅ Sin cambios en API
- ✅ Sin cambios en código necesario

---

## ⚠️ RIESGOS POTENCIALES

### **Riesgo GENERAL: 🟢 MUY BAJO**

**Razón:**
- Todas son patch/minor updates
- No hay major updates
- APIs compatibles
- Sin breaking changes documentados

### **Riesgos Específicos:**

1. **Supabase 2.49.4 → 2.89.0** 🟢 BAJO
   - **Probabilidad:** Muy baja
   - **Impacto:** Bajo
   - **Mitigación:** API estable, solo mejoras

2. **React 19.2.0 → 19.2.3** 🟢 MUY BAJO
   - **Probabilidad:** Muy baja (solo patch)
   - **Impacto:** Muy bajo
   - **Mitigación:** Solo bug fixes

3. **Dependencias transitivas** 🟡 MEDIO
   - **Probabilidad:** Media
   - **Impacto:** Medio
   - **Mitigación:** `pnpm-lock.yaml` maneja automáticamente

---

## 📝 COMANDOS EXACTOS (SIN EJECUTAR)

### **Paso 1: Backup**
```bash
cp pnpm-lock.yaml pnpm-lock.yaml.backup-fase2
```

### **Paso 2: Actualización Core**
```bash
pnpm add react@19.2.3 react-dom@19.2.3
```

### **Paso 3: Actualización Integraciones**
```bash
pnpm add @supabase/supabase-js@^2.89.0 resend@^6.6.0 @stripe/stripe-js@^8.6.0
```

### **Paso 4: Actualización UI Libraries**
```bash
pnpm add framer-motion@^12.23.26 lucide-react@^0.562.0
```

### **Paso 5: Actualización Dev Tools**
```bash
pnpm add -D tailwindcss@^4.1.18 @tailwindcss/postcss@^4.1.18 eslint@^9.39.2 @eslint/eslintrc@^3.3.3 @types/react@^19.2.7 @types/react-dom@^19.2.3
```

### **Paso 6: Verificación**
```bash
pnpm run verify
pnpm run vercel:verify
pnpm dev  # Verificar que inicia
```

---

## ✅ PLAN DE VERIFICACIÓN

### **Checklist Post-Actualización:**

- [ ] **Versiones correctas:**
  ```bash
  pnpm list react react-dom @supabase/supabase-js resend
  ```

- [ ] **Type check:**
  ```bash
  pnpm run type-check
  ```

- [ ] **Lint:**
  ```bash
  pnpm run lint
  ```

- [ ] **Build:**
  ```bash
  pnpm run build
  ```

- [ ] **Vercel build:**
  ```bash
  pnpm run vercel:verify
  ```

- [ ] **Funcionalidades críticas:**
  - [ ] Supabase auth funciona
  - [ ] Resend emails funcionan
  - [ ] Stripe checkout funciona
  - [ ] UI components se renderizan correctamente

---

## 🔄 PLAN DE ROLLBACK

```bash
# Restaurar lockfile
cp pnpm-lock.yaml.backup-fase2 pnpm-lock.yaml
pnpm install --frozen-lockfile

# O revertir package.json
git checkout package.json
pnpm install
```

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Dependencias a actualizar** | 12 |
| **Tipo de updates** | Patch/Minor (seguros) |
| **Riesgo general** | 🟢 MUY BAJO |
| **Impacto en código** | ❌ Ninguno |
| **Breaking changes** | ❌ Ninguno |
| **Tiempo estimado** | 5-10 minutos |

---

## ⏸️ ESTADO

**⏸️ PENDIENTE DE APROBACIÓN DE FASE 1**

Solo se ejecutará después de que FASE 1 esté completada y verificada.
