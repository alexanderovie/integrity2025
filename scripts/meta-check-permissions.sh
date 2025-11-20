#!/bin/bash
# Comandos curl para verificar permisos del token de Meta Marketing API
# El token debe estar en: $META_MARKETING_API_TOKEN

API_VERSION="v21.0"
BASE_URL="https://graph.facebook.com/${API_VERSION}"

echo "=========================================="
echo "COMANDOS CURL PARA VERIFICAR PERMISOS"
echo "=========================================="
echo ""
echo "1. INFORMACIÓN DEL USUARIO:"
echo "curl -G \"${BASE_URL}/me\" -d \"access_token=\${META_MARKETING_API_TOKEN}\""
echo ""

echo "2. PERMISOS DEL TOKEN (LO MÁS IMPORTANTE):"
echo "curl -G \"${BASE_URL}/me/permissions\" -d \"access_token=\${META_MARKETING_API_TOKEN}\""
echo ""

echo "3. DEBUG DEL TOKEN (expiración, tipo, scopes):"
echo "curl -G \"${BASE_URL}/debug_token\" -d \"input_token=\${META_MARKETING_API_TOKEN}\" -d \"access_token=\${META_MARKETING_API_TOKEN}\""
echo ""

echo "4. CUENTAS DE ANUNCIOS ACCESIBLES:"
echo "curl -G \"${BASE_URL}/me/adaccounts\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name,account_status\""
echo ""

echo "5. BUSINESSES ACCESIBLES:"
echo "curl -G \"${BASE_URL}/me/businesses\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name\""
echo ""

echo "6. PÁGINAS ACCESIBLES:"
echo "curl -G \"${BASE_URL}/me/accounts\" -d \"access_token=\${META_MARKETING_API_TOKEN}\" -d \"fields=id,name,category\""
echo ""
