# 🔗 Setup Inicial de Vercel CLI

**Para proyectos nuevos o no vinculados**

---

## 📋 Pasos Iniciales

### 1. **Vincular Proyecto a Vercel (Primera Vez)**

Si el proyecto NO está vinculado a Vercel:

```bash
# Opción A: Vincular a proyecto existente en Vercel
pnpm run vercel:link

# Opción B: Crear nuevo proyecto en Vercel
vercel
```

**Durante el link, Vercel preguntará:**
- ¿Cuál es el nombre del proyecto? → `integrity2025` (o el que prefieras)
- ¿Quieres sobrescribir settings? → `N` (la primera vez)
- ¿Cuál es el directorio? → `.` (raíz del proyecto)

### 2. **Pull de Configuración (Después del Link)**

Una vez vinculado:

```bash
pnpm run vercel:pull
```

Esto crea `.vercel/` con:
- `project.json` - ID del proyecto
- `.env.local` - Variables de entorno (si existen en Vercel)

### 3. **Verificar Build Local**

```bash
pnpm run vercel:verify
```

Esto:
1. Hace pull de configuración
2. Hace build con variables de producción
3. Verifica que todo funciona

---

## 🚀 Flujo Completo (Primera Vez)

```bash
# 1. Vincular proyecto (solo primera vez)
vercel link

# 2. Pull de configuración
pnpm run vercel:pull

# 3. Verificar build
pnpm run vercel:verify

# 4. Si todo OK, puedes deployar
pnpm run vercel:deploy:prebuilt
```

---

## ⚠️ Si el Proyecto Ya Existe en Vercel

Si el proyecto ya está en Vercel Dashboard:

```bash
# 1. Link al proyecto existente
vercel link

# Cuando pregunte, selecciona:
# - El proyecto existente de la lista
# - O ingresa el nombre exacto

# 2. Pull de configuración
pnpm run vercel:pull

# 3. Verificar
pnpm run vercel:verify
```

---

## 🔍 Verificar Estado Actual

```bash
# Ver si está vinculado
ls -la .vercel/

# Ver proyecto actual
cat .vercel/project.json 2>/dev/null || echo "No vinculado"

# Ver configuración de Vercel
vercel project ls
```

---

## 📝 Notas Importantes

1. **`.vercel/` está en `.gitignore`**
   - No se versiona
   - Cada desarrollador debe hacer `vercel link` localmente

2. **Variables de Entorno**
   - Se obtienen con `vercel pull`
   - Se guardan en `.env.local` (no versionado)
   - O se configuran en Vercel Dashboard

3. **Primera Vez vs Siguientes Veces**
   - **Primera vez:** `vercel link` → `vercel pull`
   - **Siguientes veces:** Solo `vercel pull` (ya está vinculado)

---

## ✅ Checklist de Setup

- [ ] Vercel CLI instalado (`vercel --version`)
- [ ] Autenticado en Vercel (`vercel whoami`)
- [ ] Proyecto vinculado (`vercel link` o proyecto existe)
- [ ] Configuración descargada (`vercel pull`)
- [ ] Build local funciona (`vercel build --prod`)
- [ ] Scripts en package.json funcionan

---

## 🆘 Troubleshooting

### "Project not found"
```bash
# Ver proyectos disponibles
vercel project ls

# Link manualmente
vercel link
```

### "No environment variables"
```bash
# Ver variables en Vercel
vercel env ls

# Pull de variables
vercel pull
```

### "Build fails locally"
```bash
# Verificar que tienes las mismas variables
vercel env ls

# Comparar con .env.local
cat .env.local
```
