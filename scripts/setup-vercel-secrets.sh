#!/bin/bash
# Script para configurar secrets de Vercel en GitHub
# Uso: ./scripts/setup-vercel-secrets.sh

set -e

echo "🔐 Configurando Vercel Secrets para GitHub Actions"
echo ""

# Verificar que gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) no está instalado"
    echo "   Instala desde: https://cli.github.com/"
    exit 1
fi

# Verificar que estamos autenticados
if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado con GitHub CLI"
    echo "   Ejecuta: gh auth login"
    exit 1
fi

# Leer IDs del proyecto
PROJECT_JSON=".vercel/project.json"
if [ ! -f "$PROJECT_JSON" ]; then
    echo "❌ No se encuentra .vercel/project.json"
    echo "   Ejecuta: vercel link"
    exit 1
fi

PROJECT_ID=$(jq -r '.projectId' "$PROJECT_JSON")
ORG_ID=$(jq -r '.orgId' "$PROJECT_JSON")

echo "📋 IDs encontrados:"
echo "   VERCEL_PROJECT_ID: $PROJECT_ID"
echo "   VERCEL_ORG_ID: $ORG_ID"
echo ""

# Verificar si existe token en secrets
SECRETS_DIR="$HOME/secrets"
VERCEL_TOKEN_FILE="$SECRETS_DIR/vercel_token.txt"

if [ -f "$VERCEL_TOKEN_FILE" ]; then
    echo "✅ Token encontrado en: $VERCEL_TOKEN_FILE"
    VERCEL_TOKEN=$(cat "$VERCEL_TOKEN_FILE")
else
    echo "⚠️  No se encontró token en: $VERCEL_TOKEN_FILE"
    echo ""
    echo "📝 Crea el token en: https://vercel.com/account/tokens"
    echo "   Luego ejecuta:"
    echo "   echo 'tu_token_aqui' > ~/secrets/vercel_token.txt"
    echo "   chmod 600 ~/secrets/vercel_token.txt"
    echo ""
    read -p "¿Tienes el token ahora? Ingresa tu VERCEL_TOKEN (o presiona Enter para saltar): " VERCEL_TOKEN
fi

# Configurar secrets en GitHub
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo ""
echo "🔧 Configurando secrets en: $REPO"
echo ""

# Project ID
echo "Setting VERCEL_PROJECT_ID..."
echo "$PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo "$REPO"

# Org ID
echo "Setting VERCEL_ORG_ID..."
echo "$ORG_ID" | gh secret set VERCEL_ORG_ID --repo "$REPO"

# Token (si está disponible)
if [ -n "$VERCEL_TOKEN" ]; then
    echo "Setting VERCEL_TOKEN..."
    echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo "$REPO"
    echo ""
    echo "✅ Todos los secrets configurados correctamente"
else
    echo ""
    echo "⚠️  VERCEL_TOKEN no fue configurado"
    echo "   Configúralo manualmente con:"
    echo "   echo 'tu_token' | gh secret set VERCEL_TOKEN --repo $REPO"
fi

echo ""
echo "✅ Configuración completa!"
echo ""
echo "📋 Secrets configurados:"
gh secret list --repo "$REPO" | grep VERCEL || echo "   (ejecuta 'gh secret list' para ver todos)"
echo ""
echo "🚀 El workflow de CI/CD ahora puede desplegar a Vercel automáticamente"

