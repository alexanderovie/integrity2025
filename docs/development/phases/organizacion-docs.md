# 📚 PLAN DE ORGANIZACIÓN DE DOCUMENTACIÓN

**Objetivo:** Organizar 26 archivos .md siguiendo estándares enterprise 2025-2026
**Estrategia:** Estructura clara sin romper referencias existentes

---

## 🎯 ESTRUCTURA PROPUESTA (Estándar Enterprise)

```
integrity2025/
├── README.md                    # ✅ Mantener en raíz (estándar)
├── docs/
│   ├── README.md               # Índice de documentación
│   ├── development/
│   │   ├── phases/             # Documentación de fases de modernización
│   │   │   ├── fase1-seguridad.md
│   │   │   ├── fase1-nextjs-update.md
│   │   │   ├── fase2-patch-updates.md
│   │   │   └── fase3-major-review.md
│   │   ├── build/              # Configuración de build
│   │   │   ├── vercel-setup.md
│   │   │   ├── vercel-patterns.md
│   │   │   └── build-config.md
│   │   └── dependencies/       # Análisis de dependencias
│   │       ├── analisis-2025.md
│   │       └── plan-actualizacion.md
│   ├── integrations/           # Integraciones externas
│   │   ├── hubspot/
│   │   │   ├── setup.md
│   │   │   ├── curl-tests.md
│   │   │   └── script-integration.md
│   │   ├── meta-pixel/
│   │   │   ├── setup.md
│   │   │   └── comandos-curl.md
│   │   └── vercel/
│   │       └── build-configurado.md
│   ├── architecture/            # Arquitectura y auditorías
│   │   ├── auditoria-proyecto.md
│   │   └── enterprise-proposals/
│   │       └── ci-cd-proposal.md
│   └── reports/                # Reportes y entregables
│       ├── entregables/
│       │   ├── fase1-completo.md
│       │   └── fase1-resumen.md
│       └── ejecucion/
│           ├── fase1-ejecucion.md
│           └── correccion-fase1.md
```

---

## 📋 CATEGORIZACIÓN DE ARCHIVOS

### **Mantener en Raíz:**
- ✅ `README.md` - Estándar de la industria

### **Mover a `docs/development/phases/`:**
- `FASE1_SEGURIDAD_RESUMEN.md` → `fase1-seguridad.md`
- `PLAN_FASE1_NEXTJS_UPDATE.md` → `fase1-nextjs-update.md`
- `PLAN_FASE2_PATCH_UPDATES.md` → `fase2-patch-updates.md`
- `PLAN_FASE3_MAJOR_REVIEW.md` → `fase3-major-review.md`
- `ENTREGABLE_FASE1.md` → `../reports/entregables/fase1-resumen.md`
- `ENTREGABLE_COMPLETO_FASES.md` → `../reports/entregables/fase1-completo.md`

### **Mover a `docs/development/build/`:**
- `VERCEL_SETUP_INICIAL.md` → `vercel-setup.md`
- `VERCEL_BUILD_PATTERNS.md` → `vercel-patterns.md`
- `VERCEL_BUILD_CONFIGURADO.md` → `vercel-build-configurado.md`
- `ANALISIS_BUILD_CONFIG.md` → `build-config.md`

### **Mover a `docs/development/dependencies/`:**
- `ANALISIS_DEPENDENCIAS_2025.md` → `analisis-2025.md`
- `PLAN_ACTUALIZACION_ESTABLE_2025.md` → `plan-actualizacion.md`

### **Mover a `docs/integrations/hubspot/`:**
- `HUBSPOT_SETUP.md` → `setup.md`
- `HUBSPOT_CURL_TESTS.md` → `curl-tests.md`
- `HUBSPOT_SCRIPT_INTEGRATION.md` → `script-integration.md`
- `TESTING_HUBSPOT.md` → `testing.md`

### **Mover a `docs/integrations/meta-pixel/`:**
- `META_PIXEL_SETUP.md` → `setup.md`
- `COMANDOS_CURL_META.md` → `comandos-curl.md`

### **Mover a `docs/architecture/`:**
- `AUDITORIA_PROYECTO.md` → `auditoria-proyecto.md`
- `PROPUESTA_ENTERPRISE_CI_CD.md` → `enterprise-proposals/ci-cd-proposal.md`
- `RESPUESTA_HONESTA_BUILD.md` → `enterprise-proposals/build-analysis.md`

### **Mover a `docs/reports/`:**
- `REPORTE_EJECUCION_FASE1.md` → `ejecucion/fase1-ejecucion.md`
- `CORRECCION_FASE1.md` → `ejecucion/correccion-fase1.md`
- `PR_DESCRIPTION.md` → `ejecucion/pr-description.md`
- `PR_RESUMEN_FASE1.md` → `ejecucion/pr-resumen-fase1.md`

---

## ✅ VERIFICACIÓN DE REFERENCIAS

### **Archivos que NO se referencian en código:**
- ✅ Todos los .md son documentación pura
- ✅ No hay imports de .md en código TypeScript/TSX
- ✅ Solo `content/blog/posts/*.mdx` se usan (esos NO se mueven)

### **Archivos que SÍ se usan:**
- ✅ `content/blog/posts/*.mdx` - NO TOCAR (parte del blog)
- ✅ `README.md` - Mantener en raíz

---

## 🚀 PLAN DE EJECUCIÓN

### **Paso 1: Crear estructura de carpetas**
```bash
mkdir -p docs/development/{phases,build,dependencies}
mkdir -p docs/integrations/{hubspot,meta-pixel,vercel}
mkdir -p docs/architecture/enterprise-proposals
mkdir -p docs/reports/{entregables,ejecucion}
```

### **Paso 2: Mover archivos (usando git mv para preservar historia)**
```bash
# Development/Phases
git mv FASE1_SEGURIDAD_RESUMEN.md docs/development/phases/fase1-seguridad.md
git mv PLAN_FASE1_NEXTJS_UPDATE.md docs/development/phases/fase1-nextjs-update.md
git mv PLAN_FASE2_PATCH_UPDATES.md docs/development/phases/fase2-patch-updates.md
git mv PLAN_FASE3_MAJOR_REVIEW.md docs/development/phases/fase3-major-review.md

# Development/Build
git mv VERCEL_SETUP_INICIAL.md docs/development/build/vercel-setup.md
git mv VERCEL_BUILD_PATTERNS.md docs/development/build/vercel-patterns.md
git mv VERCEL_BUILD_CONFIGURADO.md docs/development/build/vercel-build-configurado.md
git mv ANALISIS_BUILD_CONFIG.md docs/development/build/build-config.md

# Development/Dependencies
git mv ANALISIS_DEPENDENCIAS_2025.md docs/development/dependencies/analisis-2025.md
git mv PLAN_ACTUALIZACION_ESTABLE_2025.md docs/development/dependencies/plan-actualizacion.md

# Integrations
git mv HUBSPOT_SETUP.md docs/integrations/hubspot/setup.md
git mv HUBSPOT_CURL_TESTS.md docs/integrations/hubspot/curl-tests.md
git mv HUBSPOT_SCRIPT_INTEGRATION.md docs/integrations/hubspot/script-integration.md
git mv TESTING_HUBSPOT.md docs/integrations/hubspot/testing.md
git mv META_PIXEL_SETUP.md docs/integrations/meta-pixel/setup.md
git mv COMANDOS_CURL_META.md docs/integrations/meta-pixel/comandos-curl.md

# Architecture
git mv AUDITORIA_PROYECTO.md docs/architecture/auditoria-proyecto.md
git mv PROPUESTA_ENTERPRISE_CI_CD.md docs/architecture/enterprise-proposals/ci-cd-proposal.md
git mv RESPUESTA_HONESTA_BUILD.md docs/architecture/enterprise-proposals/build-analysis.md

# Reports
git mv ENTREGABLE_FASE1.md docs/reports/entregables/fase1-resumen.md
git mv ENTREGABLE_COMPLETO_FASES.md docs/reports/entregables/fase1-completo.md
git mv REPORTE_EJECUCION_FASE1.md docs/reports/ejecucion/fase1-ejecucion.md
git mv CORRECCION_FASE1.md docs/reports/ejecucion/correccion-fase1.md
git mv PR_DESCRIPTION.md docs/reports/ejecucion/pr-description.md
git mv PR_RESUMEN_FASE1.md docs/reports/ejecucion/pr-resumen-fase1.md
```

### **Paso 3: Crear docs/README.md con índice**
```markdown
# 📚 Documentación del Proyecto

## 🗂️ Estructura

- [Development](./development/) - Documentación de desarrollo
- [Integrations](./integrations/) - Integraciones externas
- [Architecture](./architecture/) - Arquitectura y auditorías
- [Reports](./reports/) - Reportes y entregables
```

### **Paso 4: Verificar que no se rompió nada**
```bash
pnpm run build
pnpm run type-check
```

---

## ⚠️ GARANTÍAS

- ✅ Usar `git mv` preserva historia de Git
- ✅ No se rompen referencias (ninguna en código)
- ✅ Estructura clara y escalable
- ✅ Sigue estándares enterprise 2025-2026
- ✅ README.md se mantiene en raíz (estándar)

---

## 📊 RESULTADO ESPERADO

**Antes:** 26 archivos .md en raíz
**Después:** 1 archivo .md en raíz (README.md) + estructura organizada en `docs/`

**Beneficios:**
- ✅ Raíz limpia y profesional
- ✅ Fácil de navegar
- ✅ Escalable para futuro
- ✅ Sigue estándares de la industria
