#!/bin/bash

# Script para verificar la conexión con HubSpot usando curl
# Uso: ./scripts/test-hubspot-connection.sh [TOKEN]
# Si no se proporciona TOKEN, intenta leerlo de .env.local

set -e

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Obtener el token
if [ -z "$1" ]; then
    # Intentar leer de .env.local
    if [ -f ".env.local" ]; then
        TOKEN=$(grep "HUBSPOT_ACCESS_TOKEN" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ -z "$TOKEN" ]; then
            print_error "No se encontró HUBSPOT_ACCESS_TOKEN en .env.local"
            echo "Uso: $0 [TOKEN]"
            exit 1
        fi
    else
        print_error "No se encontró .env.local y no se proporcionó token"
        echo "Uso: $0 [TOKEN]"
        exit 1
    fi
else
    TOKEN="$1"
fi

print_info "Verificando conexión con HubSpot..."
echo ""

HUBSPOT_API_BASE="https://api.hubapi.com"

# Test 1: Verificar autenticación básica (listar contactos con límite mínimo)
print_info "Test 1: Verificando autenticación básica..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$HUBSPOT_API_BASE/crm/v3/objects/contacts?limit=1&properties=email")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Autenticación exitosa (HTTP $HTTP_CODE)"
    echo "   ✅ Token válido y conectado a HubSpot"
else
    print_error "Error de autenticación (HTTP $HTTP_CODE)"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi

echo ""

# Test 2: Obtener propiedades de contactos
print_info "Test 2: Verificando acceso a propiedades de contactos..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$HUBSPOT_API_BASE/crm/v3/properties/contacts?limit=5")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Acceso a propiedades exitoso (HTTP $HTTP_CODE)"
    PROP_COUNT=$(echo "$BODY" | grep -o '"name"' | wc -l)
    echo "   Encontradas $PROP_COUNT propiedades"
else
    print_error "Error obteniendo propiedades (HTTP $HTTP_CODE)"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo ""

# Test 3: Listar algunos contactos (limitado a 10)
print_info "Test 3: Listando contactos recientes (últimos 5)..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$HUBSPOT_API_BASE/crm/v3/objects/contacts?limit=5&properties=email,firstname,lastname,phone")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Listado de contactos exitoso (HTTP $HTTP_CODE)"
    CONTACT_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
    echo "   Total de contactos encontrados: $CONTACT_COUNT"
    if [ "$CONTACT_COUNT" -gt 0 ]; then
        echo ""
        echo "   Primeros contactos:"
        echo "$BODY" | jq -r '.results[]? | "   - \(.properties.email // "sin email") (\(.properties.firstname // "") \(.properties.lastname // ""))"' 2>/dev/null || echo "   (Usa jq para ver formato JSON)"
    fi
else
    print_error "Error listando contactos (HTTP $HTTP_CODE)"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo ""

# Test 4: Verificar rate limits
print_info "Test 4: Verificando rate limits..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -I "$HUBSPOT_API_BASE/crm/v3/objects/contacts?limit=1")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
HEADERS=$(echo "$RESPONSE" | sed '$d')

DAILY_REMAINING=$(echo "$HEADERS" | grep -i "X-HubSpot-RateLimit-Daily-Remaining" | cut -d ':' -f2 | xargs || echo "N/A")
BURST_REMAINING=$(echo "$HEADERS" | grep -i "X-HubSpot-RateLimit-Remaining" | cut -d ':' -f2 | xargs || echo "N/A")

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Rate limits obtenidos"
    echo "   Requests diarias restantes: $DAILY_REMAINING"
    echo "   Requests burst restantes: $BURST_REMAINING"
else
    print_error "Error obteniendo rate limits (HTTP $HTTP_CODE)"
fi

echo ""
print_success "Verificación completada!"
echo ""
print_info "Para probar crear un contacto, ejecuta:"
echo "   curl -X POST '$HUBSPOT_API_BASE/crm/v3/objects/contacts' \\"
echo "     -H 'Authorization: Bearer $TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"properties\":{\"email\":\"test@example.com\",\"firstname\":\"Test\",\"lastname\":\"User\"}}'"
