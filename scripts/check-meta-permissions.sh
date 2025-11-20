#!/bin/bash
# Script para verificar permisos y acceso del token de Meta Marketing API

# Token de Meta (puedes cambiarlo aquí o pasarlo como variable de entorno)
META_TOKEN="${META_MARKETING_API_TOKEN:-EAApG5Ii70DIBP4F7v2fDvIrotyJPWsNnA9EftCNlxM9xlpHLZBZAkHPDdKEXqbHgTQp0gKqoR4FzhWqHOVOW6b6Y6JHCt3ggDd4DpWwE72PUeQZBNJG5biqUXz8A1ECxktqBN2iUdEYGOlutSMSfGoh0rU3lFPsgwI_TESTTTTTTTTTT}"
API_VERSION="${META_API_VERSION:-v21.0}"
BASE_URL="https://graph.facebook.com/${API_VERSION}"

echo "🔍 Verificando token de Meta Marketing API..."
echo "=========================================="
echo ""

# 1. Verificar token básico y obtener info del usuario
echo "📋 1. Información del token:"
echo "----------------------------"
curl -s "${BASE_URL}/me?access_token=${META_TOKEN}" | jq '.' || echo "❌ Error al obtener información del usuario"
echo ""

# 2. Verificar permisos del token
echo "🔑 2. Permisos del token:"
echo "------------------------"
curl -s "${BASE_URL}/me/permissions?access_token=${META_TOKEN}" | jq '.data[] | select(.status == "granted")' || echo "❌ Error al obtener permisos"
echo ""

# 3. Verificar debug del token (expiración, tipo, etc.)
echo "🐛 3. Debug del token:"
echo "---------------------"
curl -s "${BASE_URL}/debug_token?input_token=${META_TOKEN}&access_token=${META_TOKEN}" | jq '.' || echo "❌ Error al hacer debug del token"
echo ""

# 4. Intentar obtener ad accounts
echo "💼 4. Cuentas de anuncios accesibles:"
echo "------------------------------------"
curl -s "${BASE_URL}/me/adaccounts?access_token=${META_TOKEN}&fields=id,name,account_status,currency,timezone_name" | jq '.' || echo "⚠️  No se pudo acceder a ad accounts (puede ser normal si no tienes permisos)"
echo ""

# 5. Intentar obtener businesses (para system users)
echo "🏢 5. Businesses accesibles:"
echo "----------------------------"
curl -s "${BASE_URL}/me/businesses?access_token=${META_TOKEN}&fields=id,name" | jq '.' || echo "⚠️  No se pudo acceder a businesses (puede ser normal si no eres system user)"
echo ""

# 6. Verificar acceso a páginas
echo "📄 6. Páginas accesibles:"
echo "------------------------"
curl -s "${BASE_URL}/me/accounts?access_token=${META_TOKEN}&fields=id,name,category" | jq '.' || echo "⚠️  No se pudo acceder a páginas"
echo ""

echo "✅ Verificación completada!"
echo ""
echo "💡 Para usar este script con otro token:"
echo "   export META_MARKETING_API_TOKEN='tu_token_aqui'"
echo "   bash scripts/check-meta-permissions.sh"

