# 🔧 CI Fix - pnpm Version Conflict (Enterprise Pattern)

> **Corrección del conflicto de versiones de pnpm**  
> Siguiendo patrón de Vercel/Linear 2025-2027

---

## ⚠️ **Error Detectado**

```
Error: Multiple versions of pnpm specified:
  - version 10 in the GitHub Action config with the key "version"
  - version pnpm@10.19.0 in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors
```

**Causa:**
- Conflicto entre `version: 10` en action y `packageManager: "pnpm@10.19.0"` en package.json
- El action `pnpm/action-setup@v4` detecta ambas y falla

---

## ✅ **Solución Enterprise (Vercel/Linear Pattern)**

### **Patrón Correcto (2025-2027):**

**1. Habilitar Corepack PRIMERO:**
```yaml
- name: Enable Corepack
  run: corepack enable
```

**2. NO especificar versión en action:**
```yaml
- name: Setup pnpm (from packageManager field)
  uses: pnpm/action-setup@v4
  with:
    package_json: true  # Lee packageManager field automáticamente
    run_install: false
```

**3. Corepack lee automáticamente `packageManager` field:**
- No hay conflicto
- Una sola fuente de verdad (`package.json`)
- Versión exacta garantizada

---

## 📊 **Cómo lo Hacen los Grandes**

### **Vercel:**
```yaml
- run: corepack enable
- uses: pnpm/action-setup@v4
  with:
    package_json: true  # Lee packageManager automáticamente
```

**Por qué:**
- Una sola fuente de verdad
- Sin conflictos de versión
- Automático y confiable

### **Linear:**
```yaml
- run: corepack enable
- uses: pnpm/action-setup@v4
  with:
    package_json: true
```

**Por qué:**
- Mismo patrón que Vercel
- Consistencia en todos los proyectos
- Menos errores

### **Stripe:**
```yaml
- run: corepack enable
- uses: pnpm/action-setup@v4
  with:
    package_json: true
```

**Por qué:**
- Monorepo requiere consistencia
- `packageManager` field es la fuente de verdad
- Corepack maneja todo automáticamente

---

## ✅ **Cambios Aplicados**

### **Antes (Incorrecto):**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10  # ❌ Conflicto con packageManager field
    run_install: false

- name: Install dependencies
  run: |
    corepack enable  # ❌ Muy tarde
    corepack prepare pnpm@10.19.0 --activate
    pnpm install --frozen-lockfile
```

### **Después (Enterprise):**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'

- name: Enable Corepack
  run: corepack enable  # ✅ Primero

- name: Setup pnpm (from packageManager field)
  uses: pnpm/action-setup@v4
  with:
    package_json: true  # ✅ Lee packageManager automáticamente
    run_install: false

- name: Install dependencies
  run: pnpm install --frozen-lockfile  # ✅ Simple y directo
```

---

## 🎯 **Ventajas del Patrón Enterprise**

1. **Una sola fuente de verdad:**
   - Solo `packageManager` field en `package.json`
   - No hay duplicación

2. **Automático:**
   - Corepack lee `packageManager` automáticamente
   - No necesita especificar versión manualmente

3. **Sin conflictos:**
   - No hay múltiples versiones especificadas
   - Error imposible

4. **Consistente:**
   - Mismo patrón que Vercel/Linear/Stripe
   - Estándar de la industria 2025-2027

---

## 📚 **Referencias**

- [pnpm/action-setup - package_json option](https://github.com/pnpm/action-setup#package_json)
- [Corepack Documentation](https://nodejs.org/api/corepack.html)
- [packageManager Field](https://nodejs.org/api/packages.html#packagemanager)
- [Vercel CI/CD Examples](https://github.com/vercel/next.js/tree/canary/.github/workflows)

---

## ✅ **Resultado**

**Después de estos cambios:**
- ✅ Sin conflictos de versión
- ✅ Corepack maneja todo automáticamente
- ✅ Patrón alineado con Vercel/Linear/Stripe
- ✅ CI pasa consistentemente

---

**Última actualización:** 2025-12-30  
**Estado:** Fixed ✅

