# 📋 PLAN DE REORGANIZACIÓN DE RAÍZ - Enterprise 2025-2026

**Objetivo:** Limpiar raíz siguiendo estándares enterprise
**Estrategia:** Eliminar, mover y reorganizar sin romper funcionalidad

---

## 🗑️ FASE 1: ELIMINAR (Archivos Innecesarios)

### **Archivos a Eliminar:**

1. **`pnpm-lock.yaml.backup`** ❌
   - Razón: Backup innecesario
   - Acción: `rm pnpm-lock.yaml.backup`

2. **`build.log`** ❌
   - Razón: Log de build, no debe versionarse
   - Acción: `rm build.log`
   - Nota: Ya está en `.gitignore` pero el archivo existe

3. **`.eslintignore`** ❌
   - Razón: Deprecated, ya migrado a `eslint.config.mjs`
   - Acción: `rm .eslintignore`

4. **`tsconfig.tsbuildinfo`** ❌
   - Razón: Cache de TypeScript, debe estar en `.gitignore`
   - Acción: Ya está en `.gitignore`, solo verificar que no se commit

---

## 📁 FASE 2: MOVER (Documentación Temporal)

### **Archivos a Mover a `docs/`:**

1. **`AUDITORIA_SEGURIDAD.md`** → `docs/architecture/auditoria-seguridad.md`
2. **`PLAN_SEGURIDAD_ENTERPRISE.md`** → `docs/architecture/enterprise-proposals/plan-seguridad.md`
3. **`PLAN_ORGANIZACION_DOCS.md`** → `docs/development/phases/organizacion-docs.md` (ya movido)
4. **`RESUMEN_AUDITORIA_SEGURIDAD.md`** → `docs/reports/ejecucion/resumen-auditoria-seguridad.md`
5. **`RESUMEN_ORGANIZACION_DOCS.md`** → `docs/reports/ejecucion/resumen-organizacion-docs.md`
6. **`AUDITORIA_RAIZ_COMPLETA.md`** → `docs/architecture/auditoria-raiz.md`

---

## 📁 FASE 3: REORGANIZAR (Assets y Apps)

### **3.1. assets/ → public/assets/**

**Análisis:**
- `assets/` contiene `integrity-logos/`
- Debe estar en `public/` para ser accesible vía URL
- Verificar referencias en código antes de mover

**Acción:**
```bash
# Verificar referencias
grep -r "assets/" src/ public/

# Si no hay referencias directas, mover:
mv assets public/assets
```

### **3.2. hubspot-app/ → apps/hubspot-app/**

**Análisis:**
- `hubspot-app/` es una app separada de HubSpot
- No debe estar en raíz del proyecto principal
- Estándar enterprise: apps separadas en `apps/` o `integrations/`

**Acción:**
```bash
# Crear estructura de apps
mkdir -p apps

# Mover hubspot-app
mv hubspot-app apps/hubspot-app
```

**Alternativa:** Si es solo documentación/config, mover a `docs/integrations/hubspot/`

### **3.3. components.json → config/components.json**

**Análisis:**
- `components.json` es configuración de shadcn/ui
- Estándar enterprise: configuraciones en `config/`
- Verificar si se referencia en código

**Acción:**
```bash
# Crear carpeta config
mkdir -p config

# Mover components.json
mv components.json config/components.json

# Actualizar referencias si las hay (probablemente ninguna)
```

---

## ✅ FASE 4: VERIFICAR (.gitignore)

### **Agregar a .gitignore si falta:**

```gitignore
# TypeScript cache
tsconfig.tsbuildinfo

# Build logs
build.log
*.log

# Backups
*.backup
*.bak
```

**Verificación:** Ya está incluido ✅

---

## 📊 ESTRUCTURA FINAL (Enterprise)

### **Raíz Limpia (Solo Esenciales):**

```
integrity2025/
├── .env.example              # ✅ Template variables
├── .gitignore                # ✅ Git ignore
├── .github/                  # ✅ GitHub config
├── .npmrc                    # ✅ pnpm config
├── .vercelignore             # ✅ Vercel config
├── eslint.config.mjs         # ✅ ESLint config
├── middleware.ts             # ✅ Next.js middleware
├── next-env.d.ts             # ✅ Next.js types
├── next.config.ts            # ✅ Next.js config
├── package.json              # ✅ Dependencies
├── pnpm-lock.yaml            # ✅ Lockfile
├── pnpm-workspace.yaml       # ✅ Workspace
├── postcss.config.mjs        # ✅ PostCSS config
├── README.md                 # ✅ Documentation
├── tsconfig.json             # ✅ TypeScript config
│
├── apps/                     # ✅ Apps separadas
│   └── hubspot-app/
├── config/                   # ✅ Configuraciones
│   └── components.json
├── content/                  # ✅ Blog content
├── docs/                     # ✅ Documentation
├── public/                   # ✅ Public assets
│   └── assets/               # ✅ Movido desde raíz
├── scripts/                  # ✅ Utility scripts
└── src/                      # ✅ Source code
```

**Total archivos en raíz:** ~15 (solo esenciales) ✅

---

## ⚠️ VERIFICACIONES ANTES DE MOVER

### **1. assets/ → public/assets/**
```bash
# Verificar referencias
grep -r "assets/" src/ public/ --exclude-dir=node_modules
```

**Si hay referencias:** Actualizar paths después de mover

### **2. hubspot-app/ → apps/hubspot-app/**
```bash
# Verificar referencias
grep -r "hubspot-app" . --exclude-dir=node_modules
```

**Si hay referencias:** Actualizar paths después de mover

### **3. components.json → config/components.json**
```bash
# Verificar referencias
grep -r "components.json" . --exclude-dir=node_modules
```

**shadcn/ui puede buscar en raíz, verificar si funciona desde config/**

---

## 🎯 ORDEN DE EJECUCIÓN

### **Paso 1: Eliminar (Sin Riesgo)**
```bash
rm pnpm-lock.yaml.backup
rm build.log
rm .eslintignore
```

### **Paso 2: Mover Documentación (Sin Riesgo)**
```bash
mv AUDITORIA_SEGURIDAD.md docs/architecture/auditoria-seguridad.md
mv PLAN_SEGURIDAD_ENTERPRISE.md docs/architecture/enterprise-proposals/plan-seguridad.md
mv RESUMEN_AUDITORIA_SEGURIDAD.md docs/reports/ejecucion/resumen-auditoria-seguridad.md
mv RESUMEN_ORGANIZACION_DOCS.md docs/reports/ejecucion/resumen-organizacion-docs.md
mv AUDITORIA_RAIZ_COMPLETA.md docs/architecture/auditoria-raiz.md
```

### **Paso 3: Reorganizar (Verificar Primero)**
```bash
# Verificar referencias antes de mover
# Luego mover assets/, hubspot-app/, components.json
```

---

## 📊 SCORE: Antes vs Después

### **Antes:**
- Archivos en raíz: **25+**
- Documentación en raíz: **6 archivos**
- Estructura: 🟡 MEJORABLE

### **Después:**
- Archivos en raíz: **~15** (solo esenciales)
- Documentación: ✅ Organizada en `docs/`
- Estructura: ✅ ENTERPRISE

---

## ✅ CHECKLIST DE EJECUCIÓN

- [ ] Eliminar archivos innecesarios
- [ ] Mover documentación a `docs/`
- [ ] Verificar referencias de `assets/`
- [ ] Mover `assets/` a `public/assets/`
- [ ] Verificar referencias de `hubspot-app/`
- [ ] Mover `hubspot-app/` a `apps/hubspot-app/`
- [ ] Verificar referencias de `components.json`
- [ ] Mover `components.json` a `config/components.json`
- [ ] Verificar que build funciona
- [ ] Verificar que dev server funciona

---

## 🎯 RESULTADO ESPERADO

**Raíz limpia y profesional:**
- ✅ Solo archivos esenciales de Next.js 16
- ✅ Estructura escalable
- ✅ Sigue estándares enterprise 2025-2026
- ✅ Fácil de navegar y mantener
