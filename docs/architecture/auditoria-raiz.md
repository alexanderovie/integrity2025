# 🔍 AUDITORÍA COMPLETA DE RAÍZ - Enterprise 2025-2026

**Fecha:** Diciembre 2025
**Objetivo:** Verificar cumplimiento de estándares enterprise para estructura de raíz

---

## 📊 ANÁLISIS POR ARCHIVO/CARPETA

### **✅ DEBE QUEDARSE EN RAÍZ (Estándar Next.js 16)**

| Archivo/Carpeta | Razón | Estado |
|----------------|-------|--------|
| `package.json` | ✅ Estándar Node.js/Next.js | ✅ CORRECTO |
| `pnpm-lock.yaml` | ✅ Lockfile de pnpm (estándar) | ✅ CORRECTO |
| `pnpm-workspace.yaml` | ✅ Configuración de workspace | ✅ CORRECTO |
| `next.config.ts` | ✅ Configuración Next.js (requerido en raíz) | ✅ CORRECTO |
| `tsconfig.json` | ✅ Configuración TypeScript (requerido en raíz) | ✅ CORRECTO |
| `eslint.config.mjs` | ✅ Configuración ESLint (estándar) | ✅ CORRECTO |
| `postcss.config.mjs` | ✅ Configuración PostCSS (estándar) | ✅ CORRECTO |
| `middleware.ts` | ✅ Next.js middleware (debe estar en raíz) | ✅ CORRECTO |
| `next-env.d.ts` | ✅ Generado por Next.js (estándar) | ✅ CORRECTO |
| `README.md` | ✅ Estándar de la industria | ✅ CORRECTO |
| `.gitignore` | ✅ Estándar Git | ✅ CORRECTO |
| `.env.example` | ✅ Template de variables (estándar) | ✅ CORRECTO |
| `.github/` | ✅ Configuración GitHub (estándar) | ✅ CORRECTO |
| `src/` | ✅ Código fuente (estándar Next.js) | ✅ CORRECTO |
| `public/` | ✅ Assets públicos (estándar Next.js) | ✅ CORRECTO |
| `content/` | ✅ Contenido del blog (estándar) | ✅ CORRECTO |
| `node_modules/` | ✅ Dependencias (estándar) | ✅ CORRECTO |
| `.next/` | ✅ Build output (ignorado) | ✅ CORRECTO |
| `.vercel/` | ✅ Configuración Vercel (ignorado) | ✅ CORRECTO |

---

### **❌ DEBE ELIMINARSE**

| Archivo | Razón | Acción |
|---------|-------|--------|
| `pnpm-lock.yaml.backup` | ❌ Backup innecesario | 🗑️ ELIMINAR |
| `build.log` | ❌ Log de build (no debe versionarse) | 🗑️ ELIMINAR |
| `tsconfig.tsbuildinfo` | ❌ Cache de TypeScript (debe estar en .gitignore) | 🗑️ ELIMINAR |
| `AUDITORIA_SEGURIDAD.md` | ❌ Documentación temporal | 📁 MOVER a `docs/` |
| `PLAN_ORGANIZACION_DOCS.md` | ❌ Documentación temporal | 📁 MOVER a `docs/` |
| `PLAN_SEGURIDAD_ENTERPRISE.md` | ❌ Documentación temporal | 📁 MOVER a `docs/` |
| `RESUMEN_AUDITORIA_SEGURIDAD.md` | ❌ Documentación temporal | 📁 MOVER a `docs/` |
| `RESUMEN_ORGANIZACION_DOCS.md` | ❌ Documentación temporal | 📁 MOVER a `docs/` |

---

### **⚠️ DEBE MOVERSE A OTRA UBICACIÓN**

| Archivo/Carpeta | Ubicación Actual | Ubicación Recomendada | Razón |
|----------------|------------------|----------------------|-------|
| `components.json` | Raíz | `config/components.json` | ⚠️ Configuración, no debe estar en raíz |
| `.eslintignore` | Raíz | ❌ ELIMINAR (usar `eslint.config.mjs`) | ⚠️ Deprecated, usar ignores en config |
| `.npmrc` | Raíz | ✅ MANTENER (estándar) | ✅ OK si tiene configuración |
| `.vercelignore` | Raíz | ✅ MANTENER (estándar Vercel) | ✅ OK |
| `assets/` | Raíz | `public/assets/` o `src/assets/` | ⚠️ Assets deben estar en public/ o src/ |
| `hubspot-app/` | Raíz | `apps/hubspot-app/` o `integrations/hubspot-app/` | ⚠️ App separada, no debe estar en raíz |
| `scripts/` | Raíz | ✅ MANTENER (estándar) | ✅ OK para scripts de utilidad |

---

## 🎯 ESTRUCTURA RAÍZ IDEAL (Enterprise 2025-2026)

### **Archivos en Raíz (Mínimo Necesario):**

```
integrity2025/
├── .env.example              # ✅ Template de variables
├── .eslintignore             # ⚠️ ELIMINAR (deprecated)
├── .gitignore                # ✅ Estándar Git
├── .github/                  # ✅ Configuración GitHub
├── .npmrc                    # ✅ Configuración npm/pnpm
├── .vercelignore             # ✅ Configuración Vercel
├── components.json           # ⚠️ MOVER a config/
├── eslint.config.mjs         # ✅ Configuración ESLint
├── middleware.ts             # ✅ Next.js middleware
├── next-env.d.ts             # ✅ Generado por Next.js
├── next.config.ts            # ✅ Configuración Next.js
├── package.json              # ✅ Estándar Node.js
├── pnpm-lock.yaml            # ✅ Lockfile
├── pnpm-workspace.yaml       # ✅ Workspace config
├── postcss.config.mjs        # ✅ Configuración PostCSS
├── README.md                 # ✅ Estándar industria
├── tsconfig.json             # ✅ Configuración TypeScript
│
├── src/                      # ✅ Código fuente
├── public/                   # ✅ Assets públicos
├── content/                  # ✅ Contenido blog
├── scripts/                  # ✅ Scripts de utilidad
├── docs/                     # ✅ Documentación
│
├── assets/                   # ⚠️ MOVER a public/assets/
├── hubspot-app/              # ⚠️ MOVER a apps/ o integrations/
│
└── node_modules/             # ✅ Dependencias (ignorado)
```

---

## 📋 PLAN DE ACCIÓN

### **FASE 1: Eliminar Archivos Innecesarios** 🔴

```bash
# Eliminar backups y logs
rm pnpm-lock.yaml.backup
rm build.log

# Agregar tsconfig.tsbuildinfo a .gitignore si no está
```

### **FASE 2: Mover Documentación Temporal** 🟡

```bash
# Mover documentación a docs/
mv AUDITORIA_SEGURIDAD.md docs/architecture/
mv PLAN_SEGURIDAD_ENTERPRISE.md docs/architecture/enterprise-proposals/
mv PLAN_ORGANIZACION_DOCS.md docs/development/phases/
mv RESUMEN_AUDITORIA_SEGURIDAD.md docs/reports/ejecucion/
mv RESUMEN_ORGANIZACION_DOCS.md docs/reports/ejecucion/
```

### **FASE 3: Reorganizar Assets y Apps** 🟡

```bash
# Mover assets a public/
mv assets public/assets

# Mover hubspot-app a apps/ o integrations/
mkdir -p apps
mv hubspot-app apps/hubspot-app
# O alternativamente:
# mkdir -p integrations
# mv hubspot-app integrations/hubspot-app
```

### **FASE 4: Reorganizar Configuración** 🟡

```bash
# Crear carpeta config/
mkdir -p config

# Mover components.json
mv components.json config/components.json

# Actualizar referencias si las hay
```

### **FASE 5: Eliminar .eslintignore** 🟡

```bash
# Eliminar .eslintignore (ya migrado a eslint.config.mjs)
rm .eslintignore
```

---

## ⚠️ VERIFICACIONES NECESARIAS

### **Antes de Mover:**

1. **assets/** → Verificar si se usa en código:
   ```bash
   grep -r "assets/" src/ public/
   ```

2. **hubspot-app/** → Verificar si se referencia:
   ```bash
   grep -r "hubspot-app" . --exclude-dir=node_modules
   ```

3. **components.json** → Verificar si se usa:
   ```bash
   grep -r "components.json" . --exclude-dir=node_modules
   ```

---

## 📊 SCORE ACTUAL vs IDEAL

### **Actual:**
- Archivos en raíz: **25+** (incluyendo docs temporales)
- Estructura: 🟡 MEJORABLE

### **Ideal (Enterprise):**
- Archivos en raíz: **~15** (solo esenciales)
- Estructura: ✅ PROFESIONAL

---

## ✅ CHECKLIST FINAL

### **Archivos Esenciales en Raíz:**
- [x] `package.json` ✅
- [x] `pnpm-lock.yaml` ✅
- [x] `next.config.ts` ✅
- [x] `tsconfig.json` ✅
- [x] `eslint.config.mjs` ✅
- [x] `middleware.ts` ✅
- [x] `README.md` ✅
- [x] `.gitignore` ✅
- [x] `.env.example` ✅

### **Archivos a Eliminar:**
- [ ] `pnpm-lock.yaml.backup` ❌
- [ ] `build.log` ❌
- [ ] `tsconfig.tsbuildinfo` (agregar a .gitignore) ❌
- [ ] `.eslintignore` (deprecated) ❌

### **Archivos a Mover:**
- [ ] Documentación temporal → `docs/` 📁
- [ ] `components.json` → `config/` 📁
- [ ] `assets/` → `public/assets/` 📁
- [ ] `hubspot-app/` → `apps/` o `integrations/` 📁

---

## 🎯 RESULTADO ESPERADO

**Después de reorganización:**
- ✅ Raíz limpia y profesional
- ✅ Solo archivos esenciales
- ✅ Estructura escalable
- ✅ Sigue estándares enterprise 2025-2026
