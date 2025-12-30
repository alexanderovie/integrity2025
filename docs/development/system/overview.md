# 🏗️ Sistema de Desarrollo - Overview

> **Sistema Elite Pro para desarrollo escalable**
> Basado en prácticas de Stripe, Linear, Vercel

---

## 📋 Componentes del Sistema

### 1. **RULES.md** - Reglas del Proyecto

Ubicación: `/RULES.md`

Define:
- ✅ Tecnologías autorizadas
- ❌ Tecnologías prohibidas
- 🔐 Versiones mínimas (Node.js, pnpm)
- 📦 Política de dependencias
- 🧪 Validación obligatoria

**Uso:** Referencia antes de agregar dependencias o cambiar arquitectura.

---

### 2. **BYLINES.md** - Filosofía de Código

Ubicación: `/BYLINES.md`

Define:
- 🧠 Principios técnicos
- 🏗️ Arquitectura y patrones
- 💎 Valores técnicos
- 🚫 Anti-patrones
- 🎨 Estilo de código

**Uso:** Guía para decisiones técnicas y estilo de código.

---

### 3. **CI/CD Pipeline** - GitHub Actions

Ubicación: `/.github/workflows/ci.yml`

Ejecuta en cada push/PR:
1. ✅ Verifica versión de Node.js y pnpm
2. ✅ Verifica lockfile sincronizado
3. ✅ Ejecuta lint
4. ✅ Ejecuta type-check
5. ✅ Ejecuta build
6. ✅ Verifica dependencias prohibidas

**Resultado:** Si falla → no se puede hacer merge.

---

### 4. **Script Doctor** - Validación Local

Ubicación: `/scripts/doctor.ts`

Comando: `pnpm doctor`

Verifica:
- ✅ Versión de Node.js (>= 20)
- ✅ Versión de pnpm (>= 9)
- ✅ Lockfile sincronizado
- ✅ Dependencias prohibidas
- ✅ TypeScript strict mode
- ✅ Build exitoso

**Uso:** Ejecutar antes de push o cuando algo no funciona.

---

### 5. **Engines y .nvmrc** - Control de Versiones

Archivos:
- `package.json` → `engines` field
- `.nvmrc` → Node.js version

Garantiza:
- ✅ Misma versión de Node.js en todos los entornos
- ✅ pnpm version correcta
- ✅ Prevención de versiones incompatibles

---

## 🔄 Flujo de Trabajo

### Desarrollo Local

```bash
# 1. Setup inicial
nvm use          # Usa Node.js del .nvmrc
pnpm install     # Instala dependencias

# 2. Desarrollo
pnpm dev         # Servidor de desarrollo

# 3. Antes de commit
pnpm verify      # Lint + type-check + build

# 4. Antes de push
pnpm doctor      # Validación completa
```

### CI/CD Automático

1. **Push a branch** → GitHub Actions ejecuta CI
2. **CI verifica:**
   - Versiones correctas
   - Lockfile sincronizado
   - Lint pasa
   - Type-check pasa
   - Build pasa
   - No dependencias prohibidas
3. **Si todo pasa** → ✅ Merge permitido
4. **Si algo falla** → ❌ Merge bloqueado

---

## 🛡️ Protecciones Implementadas

### 1. **Protección de Versiones**

- `.nvmrc` → Fuerza Node.js 20
- `package.json` engines → Valida Node.js y pnpm
- Script doctor → Verifica antes de push

### 2. **Protección de Dependencias**

- CI verifica dependencias prohibidas
- Script doctor verifica localmente
- RULES.md documenta qué está permitido

### 3. **Protección de Código**

- TypeScript strict mode obligatorio
- ESLint con reglas estrictas
- Build debe pasar siempre

### 4. **Protección de Lockfile**

- CI verifica que lockfile esté sincronizado
- Script doctor verifica localmente
- `--frozen-lockfile` en CI previene cambios

---

## 📚 Documentación Relacionada

- **RULES.md** - Reglas del proyecto
- **BYLINES.md** - Filosofía de código
- **README.md** - Setup y comandos básicos
- **docs/development/** - Documentación técnica

---

## 🚀 Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Security Audit:**
   ```yaml
   # En CI
   - run: pnpm audit --audit-level=moderate
   ```

2. **Dependency Updates:**
   ```yaml
   # Dependabot o Renovate
   # Para actualizaciones automáticas de dependencias
   ```

3. **Performance Monitoring:**
   ```yaml
   # Lighthouse CI
   # Para métricas de performance
   ```

4. **Testing:**
   ```yaml
   # Tests unitarios y E2E
   # Cuando el proyecto crezca
   ```

---

## ✅ Checklist de Implementación

- [x] RULES.md creado
- [x] BYLINES.md creado
- [x] CI/CD pipeline configurado
- [x] Script doctor implementado
- [x] Engines en package.json
- [x] .nvmrc creado
- [x] Documentación del sistema

---

**Última actualización:** 2025-12-29
**Versión del sistema:** 1.0.0
