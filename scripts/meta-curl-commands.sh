#!/bin/bash
# Comandos curl para verificar token de Meta Marketing API
# Usa la variable de entorno: $META_MARKETING_API_TOKEN

API_VERSION="v21.0"
BASE_URL="https://graph.facebook.com/${API_VERSION}"

echo "🔍 Comandos curl para Meta Marketing API"
echo "=========================================="
echo ""
echo "Asegúrate de tener la variable META_MARKETING_API_TOKEN exportada"
echo ""

# 1. Verificar token básico - Información del usuario
echo "📋 1. Información del usuario:"
echo "curl -G \"${BASE_URL}/me\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" | jq '.'"
echo ""

# 2. Verificar permisos del token
echo "🔑 2. Permisos del token:"
echo "curl -G \"${BASE_URL}/me/permissions\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" | jq '.'"
echo ""

# 3. Debug del token (expiración, tipo, scopes)
echo "🐛 3. Debug del token (expiración, tipo, scopes):"
echo "curl -G \"${BASE_URL}/debug_token\" -d \"input_token=\${META_MARKETING_API_TOKEN}\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" | jq '.'"
echo ""

# 4. Obtener ad accounts
echo "💼 4. Cuentas de anuncios accesibles:"
echo "curl -G \"${BASE_URL}/me/adaccounts\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name,account_status,currency,timezone_name,spend_cap\" | jq '.'"
echo ""

# 5. Obtener businesses (para system users)
echo "🏢 5. Businesses accesibles:"
echo "curl -G \"${BASE_URL}/me/businesses\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name\" | jq '.'"
echo ""

# 6. Obtener páginas
echo "📄 6. Páginas accesibles:"
echo "curl -G \"${BASE_URL}/me/accounts\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name,category\" | jq '.'"
echo ""

# 7. Verificar si tiene permisos de ads_read
echo "📊 7. Verificar acceso a insights (requiere ads_read):"
echo "curl -G \"${BASE_URL}/act_<AD_ACCOUNT_ID>/insights\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=impressions,spend,clicks\" -d \"date_preset=last_7d\" | jq '.'"
echo ""

# 8. Listar campañas (requiere ads_read)
echo "📢 8. Listar campañas (requiere ads_read):"
echo "curl -G \"${BASE_URL}/act_<AD_ACCOUNT_ID>/campaigns\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name,status,objective\" | jq '.'"
echo ""

# 9. Listar custom audiences (requiere ads_read)
echo "👥 9. Listar custom audiences (requiere ads_read):"
echo "curl -G \"${BASE_URL}/act_<AD_ACCOUNT_ID>/customaudiences\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name,approximate_count,operation_status\" | jq '.'"
echo ""

# 10. Verificar términos de servicio de custom audiences
echo "📝 10. Verificar términos de servicio de custom audiences:"
echo "curl -G \"${BASE_URL}/act_<AD_ACCOUNT_ID>\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=tos_accepted\" | jq '.'"
echo ""

echo "=========================================="
echo "💡 TIPS:"
echo "  - Reemplaza <AD_ACCOUNT_ID> con el ID real de tu cuenta"
echo "  - Los IDs de ad accounts tienen formato: act_123456789"
echo "  - Si no tienes jq instalado, quita '| jq' del comando"
echo "  - Para instalar jq: sudo apt install jq (Ubuntu/Debian)"
echo ""
