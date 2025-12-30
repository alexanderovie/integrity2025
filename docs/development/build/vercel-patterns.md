# 🚀 Patrones Modernos 2025-2026: Vercel Build desde CLI

**Fuente:** Context7 - Vercel Documentation
**Fecha:** Diciembre 2025
**Next.js:** 16.0.10

---

## 📋 Comandos Esenciales

### 1. **Pull de Configuración (Primero)**
Antes de hacer build, siempre hacer pull para obtener configuración actualizada:

```bash
vercel pull
```

Esto descarga:
- Variables de entorno
- Configuración del proyecto
- Settings de Vercel

### 2. **Build Local Básico**
Genera build en `.vercel/output` siguiendo Build Output API:

```bash
vercel build
```

### 3. **Build con Variables de Producción**
Para probar build exactamente como en producción:

```bash
vercel build --prod
```

### 4. **Build Automático (CI/CD)**
Sin prompts interactivos:

```bash
vercel build --yes
```

### 5. **Deploy de Build Pre-construido**
Después de verificar el build local:

```bash
vercel deploy --prebuilt
```

---

## 🎯 Flujo Recomendado (2025-2026)

### **Flujo Completo para Verificación Local:**

```bash
# 1. Obtener configuración actualizada
vercel pull

# 2. Build local con variables de producción
vercel build --prod

# 3. Verificar output en .vercel/output
ls -la .vercel/output

# 4. Si todo está bien, deploy
vercel deploy --prebuilt --prod
```

### **Flujo para CI/CD:**

```bash
# Build automático sin prompts
vercel pull --yes
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
```

---

## 📁 Estructura de Output

Después de `vercel build`, se genera:

```
.vercel/
└── output/
    ├── static/          # Archivos estáticos
    ├── functions/       # Serverless functions
    ├── config.json      # Configuración del build
    └── [otros archivos según Build Output API]
```

---

## ⚙️ Configuración del Proyecto

### **vercel.json (Opcional pero Recomendado)**

Para proyectos Next.js 16, Vercel detecta automáticamente la configuración, pero puedes crear `vercel.json` para control fino:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

### **Variables de Entorno**

Vercel CLI lee variables de:
1. `.env.local` (local, no versionado)
2. `.env` (local, puede versionarse)
3. Vercel Dashboard (via `vercel pull`)

**Mejor Práctica 2025-2026:**
- Usar `.env.local` para desarrollo
- `vercel pull` para obtener variables de producción
- Nunca commitear `.env.local`

---

## 🔍 Verificación Pre-Deploy

### **Checklist Antes de Deploy:**

```bash
# 1. Build local exitoso
vercel build --prod

# 2. Verificar que no hay errores
echo $?  # Debe ser 0

# 3. Verificar tamaño del output
du -sh .vercel/output

# 4. Verificar estructura
tree .vercel/output -L 2

# 5. Build de Next.js también debe pasar
pnpm build
```

---

## 🛠️ Scripts Recomendados para package.json

Agregar scripts útiles:

```json
{
  "scripts": {
    "build": "next build",
    "build:vercel": "vercel build --prod",
    "build:vercel:local": "vercel build",
    "deploy:prebuilt": "vercel deploy --prebuilt --prod",
    "vercel:pull": "vercel pull",
    "vercel:build-and-deploy": "vercel pull && vercel build --prod && vercel deploy --prebuilt --prod"
  }
}
```

---

## 🚨 Troubleshooting

### **Problema: Build falla localmente pero funciona en Vercel**

**Solución:**
```bash
# Asegúrate de tener las mismas variables de entorno
vercel pull
vercel build --prod
```

### **Problema: Variables de entorno no se cargan**

**Solución:**
```bash
# Verificar que .env.local existe
ls -la .env.local

# Hacer pull de variables de Vercel
vercel pull

# Verificar variables cargadas
vercel env ls
```

### **Problema: Build Output API no coincide**

**Solución:**
- Verificar versión de Vercel CLI: `vercel --version`
- Actualizar: `npm i -g vercel@latest`
- Verificar Next.js 16 compatibility

---

## 📊 Comparación: Build Local vs Vercel Cloud

| Aspecto | `pnpm build` | `vercel build` |
|---------|--------------|---------------|
| **Output** | `.next/` | `.vercel/output/` |
| **Formato** | Next.js estándar | Build Output API |
| **Variables** | `.env.local` | Vercel env vars |
| **Uso** | Desarrollo/Testing | Pre-deploy verification |
| **Deploy** | Manual | `vercel deploy --prebuilt` |

**Recomendación 2025-2026:**
- Usar `pnpm build` para desarrollo rápido
- Usar `vercel build --prod` antes de deploy importante
- Verificar ambos antes de merge a main

---

## ✅ Best Practices 2025-2026

1. **Siempre hacer `vercel pull` antes de build**
   - Sincroniza configuración
   - Obtiene variables actualizadas

2. **Usar `--prod` para builds de producción**
   - Variables correctas
   - Comportamiento idéntico a producción

3. **Verificar build local antes de push**
   ```bash
   vercel build --prod && echo "✅ Build OK"
   ```

4. **No commitear `.vercel/output/`**
   - Agregar a `.gitignore`
   - Es generado, no versionado

5. **Usar `--prebuilt` para deploys controlados**
   - Revisas el build antes
   - Control total sobre qué se deploya

---

## 🔗 Referencias

- [Vercel CLI Build Docs](https://vercel.com/docs/cli/build)
- [Build Output API](https://vercel.com/docs/build-output-api)
- [Next.js 16 Deployment](https://nextjs.org/docs/deployment)
