#!/bin/bash

# Ejemplos de comandos curl para probar HubSpot API directamente
# Uso: source este archivo o copia los comandos

# Obtener el token del .env.local si existe
if [ -f ".env.local" ]; then
    export HUBSPOT_TOKEN=$(grep "HUBSPOT_ACCESS_TOKEN" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
else
    echo "⚠️  No se encontró .env.local. Define HUBSPOT_TOKEN manualmente:"
    echo "   export HUBSPOT_TOKEN='tu-token-aqui'"
fi

HUBSPOT_API="https://api.hubapi.com"
HUBSPOT_API_VERSION="2026-03"
HUBSPOT_OBJECTS_API="$HUBSPOT_API/crm/objects/$HUBSPOT_API_VERSION"
HUBSPOT_PROPERTIES_API="$HUBSPOT_API/crm/properties/$HUBSPOT_API_VERSION"

echo "📋 Comandos curl para probar HubSpot API"
echo "=========================================="
echo ""
echo "API CRM configurada: $HUBSPOT_API_VERSION"
echo "Token configurado: ${HUBSPOT_TOKEN:0:20}..."
echo ""

# Función helper para ejecutar curl con formato
hubspot_curl() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -z "$method" ]; then
        method="GET"
    fi

    curl -X "$method" \
        -H "Authorization: Bearer $HUBSPOT_TOKEN" \
        -H "Content-Type: application/json" \
        ${data:+-d "$data"} \
        "$HUBSPOT_API$endpoint" | jq '.' 2>/dev/null || curl -X "$method" \
        -H "Authorization: Bearer $HUBSPOT_TOKEN" \
        -H "Content-Type: application/json" \
        ${data:+-d "$data"} \
        "$HUBSPOT_API$endpoint"
}

echo "1️⃣  Listar contactos (últimos 10):"
echo "-----------------------------------"
echo "curl -X GET \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  '$HUBSPOT_OBJECTS_API/contacts?limit=10&properties=email,firstname,lastname,phone' | jq '.'"
echo ""

echo "2️⃣  Buscar contacto por email:"
echo "--------------------------------"
echo "curl -X POST \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"filterGroups\":[{\"filters\":[{\"propertyName\":\"email\",\"operator\":\"EQ\",\"value\":\"test@example.com\"}]}],\"limit\":1}' \\"
echo "  '$HUBSPOT_OBJECTS_API/contacts/search' | jq '.'"
echo ""

echo "3️⃣  Crear o actualizar un contacto por email:"
echo "----------------------------------------------"
echo "curl -X POST \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"inputs\":[{\"id\":\"test@example.com\",\"idProperty\":\"email\",\"objectWriteTraceId\":\"contact:test@example.com\",\"properties\":{\"email\":\"test@example.com\",\"firstname\":\"Test\",\"lastname\":\"User\",\"phone\":\"+18009300532\"}}]}' \\"
echo "  '$HUBSPOT_OBJECTS_API/contacts/batch/upsert' | jq '.'"
echo ""

echo "4️⃣  Actualizar un contacto (necesitas el ID del contacto):"
echo "------------------------------------------------------------"
echo "curl -X PATCH \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"properties\":{\"firstname\":\"Updated\",\"lastname\":\"Name\"}}' \\"
echo "  '$HUBSPOT_OBJECTS_API/contacts/CONTACT_ID' | jq '.'"
echo ""

echo "5️⃣  Listar deals:"
echo "------------------"
echo "curl -X GET \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  '$HUBSPOT_OBJECTS_API/deals?limit=10&properties=dealname,amount,dealstage' | jq '.'"
echo ""

echo "6️⃣  Crear un deal:"
echo "-------------------"
echo "curl -X POST \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"properties\":{\"dealname\":\"Test Deal\",\"amount\":\"1000\",\"pipeline\":\"default\",\"dealstage\":\"qualifiedtobuy\"}}' \\"
echo "  '$HUBSPOT_OBJECTS_API/deals' | jq '.'"
echo ""

echo "7️⃣  Obtener propiedades disponibles de contactos:"
echo "----------------------------------------------------"
echo "curl -X GET \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  '$HUBSPOT_PROPERTIES_API/contacts?limit=20' | jq '.results[] | {name, label, type}'"
echo ""

echo "8️⃣  Verificar rate limits (usar -I para headers):"
echo "---------------------------------------------------"
echo "curl -I -X GET \\"
echo "  -H 'Authorization: Bearer \$HUBSPOT_TOKEN' \\"
echo "  '$HUBSPOT_OBJECTS_API/contacts?limit=1' | grep -i 'rate-limit'"
echo ""

echo "💡 Para ejecutar estos comandos, primero carga el token:"
echo "   source ./scripts/hubspot-curl-examples.sh"
echo "   # O define manualmente:"
echo "   export HUBSPOT_TOKEN='tu-token-aqui'"
echo ""

# Ejemplo práctico si el token está disponible
if [ -n "$HUBSPOT_TOKEN" ]; then
    echo ""
    echo "🚀 Ejecutando prueba rápida de conexión..."
    echo ""
    TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $HUBSPOT_TOKEN" \
        -H "Content-Type: application/json" \
        "$HUBSPOT_OBJECTS_API/contacts?limit=1")

    HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "✅ Conexión exitosa (HTTP $HTTP_CODE)"
    else
        echo "❌ Error de conexión (HTTP $HTTP_CODE)"
        echo "$TEST_RESPONSE" | sed '$d' | jq '.' 2>/dev/null || echo "$TEST_RESPONSE" | sed '$d'
    fi
fi
