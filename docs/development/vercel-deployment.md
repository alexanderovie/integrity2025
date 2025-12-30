# 🚀 Deployment Automático a Vercel

Este proyecto usa GitHub Actions para deploy automático a Vercel cuando los tests pasan.

## 📋 Configuración Inicial

### Paso 1: Obtener VERCEL_TOKEN

1. Ve a: https://vercel.com/account/tokens
2. Crea un nuevo token (o usa uno existente)
3. Guarda el token en `~/secrets/vercel_token.txt`:
   ```bash
   echo "tu_token_aqui" > ~/secrets/vercel_token.txt
   chmod 600 ~/secrets/vercel_token.txt
   ```

### Paso 2: Configurar Secrets en GitHub

**Opción A: Usando el script automatizado (recomendado)**

```bash
./scripts/setup-vercel-secrets.sh
```

El script:
- ✅ Lee los IDs del proyecto desde `.vercel/project.json`
- ✅ Busca el token en `~/secrets/vercel_token.txt`
- ✅ Configura automáticamente todos los secrets en GitHub

**Opción B: Manualmente**

1. Ve a: https://github.com/alexanderovie/integrity2025/settings/secrets/actions
2. Agrega estos secrets:

   - **VERCEL_TOKEN**: Token de Vercel
   - **VERCEL_ORG_ID**: `team_rxLsn7qcMub2A8BjHFd5V3zZ`
   - **VERCEL_PROJECT_ID**: `prj_lBjucq6KExnUQhG2vaKwKjDfLILw`

   O usa el script para obtener los IDs:
   ```bash
   cat .vercel/project.json | jq -r '"VERCEL_PROJECT_ID=\(.projectId)\nVERCEL_ORG_ID=\(.orgId)"'
   ```

## 🔄 Flujo de Deploy

1. **Push a `main`** → Activa el workflow
2. **Job `test`** → Ejecuta lint, type-check, build
3. **Si `test` pasa** → Job `deploy` se ejecuta
4. **Deploy** → Construye y despliega a producción en Vercel

**Importante**: El deploy **solo** ocurre si:
- ✅ El job `test` pasa exitosamente
- ✅ Es un push a `main` (no en PRs)

## 🛠️ Workflow Detalles

```yaml
test:
  - Lint
  - Type check
  - Build

deploy:  # Solo si test pasa
  - Install dependencies
  - Pull Vercel env vars
  - Build with Vercel
  - Deploy to production
```

## 🔍 Verificar Secrets

```bash
gh secret list --repo alexanderovie/integrity2025 | grep VERCEL
```

## 📝 Troubleshooting

### El deploy no se ejecuta

1. Verifica que los tests pasan en GitHub Actions
2. Verifica que estás haciendo push a `main` (no otra rama)
3. Revisa los logs del workflow en: https://github.com/alexanderovie/integrity2025/actions

### Error de autenticación

1. Verifica que `VERCEL_TOKEN` está configurado correctamente
2. Verifica que el token tiene permisos de deploy
3. Regenera el token si es necesario

### IDs incorrectos

1. Ejecuta: `vercel link` para reconectar el proyecto
2. Los IDs se actualizan en `.vercel/project.json`
3. Re-ejecuta: `./scripts/setup-vercel-secrets.sh`

## 🎯 Patrón Enterprise

Este setup sigue las mejores prácticas de:
- ✅ **Vercel** - Deploy oficial con CLI
- ✅ **GitHub Actions** - CI/CD moderno
- ✅ **Corepack** - Gestión oficial de pnpm
- ✅ **Node.js 24** - Stack moderno
- ✅ **Deploy solo si tests pasan** - Seguridad

