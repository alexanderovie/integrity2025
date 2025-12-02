#!/bin/bash

# Script de Testing para APIs de HubSpot
# Ejecutar desde la raíz del proyecto: bash scripts/test-apis.sh

BASE_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)

echo "🧪 Testing APIs de HubSpot Integration"
echo "======================================"
echo ""

# Test 1: Newsletter API
echo "📧 Test 1: Newsletter API"
echo "-------------------------"
NEWSLETTER_EMAIL="test-newsletter-${TIMESTAMP}@test.com"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/newsletter" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${NEWSLETTER_EMAIL}\"}")

echo "Email usado: ${NEWSLETTER_EMAIL}"
echo "Respuesta: ${RESPONSE}"
if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Newsletter API: PASSED"
else
  echo "❌ Newsletter API: FAILED"
fi
echo ""

# Test 2: HubSpot Contacts API
echo "👤 Test 2: HubSpot Contacts API"
echo "-------------------------------"
CONTACT_EMAIL="test-contact-${TIMESTAMP}@test.com"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/hubspot/contacts" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${CONTACT_EMAIL}\",
    \"firstname\": \"API\",
    \"lastname\": \"Test\",
    \"phone\": \"1234567890\",
    \"zip\": \"32839\"
  }")

echo "Email usado: ${CONTACT_EMAIL}"
echo "Respuesta: ${RESPONSE}"
if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Contacts API: PASSED"
else
  echo "❌ Contacts API: FAILED"
fi
echo ""

# Test 3: Checkout API (crea contacto)
echo "💳 Test 3: Checkout API (crea contacto)"
echo "----------------------------------------"
CHECKOUT_EMAIL="test-checkout-${TIMESTAMP}@test.com"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"serviceId\": \"1\",
    \"customerEmail\": \"${CHECKOUT_EMAIL}\",
    \"customerName\": \"API Test Checkout\",
    \"customPrice\": 12000,
    \"quoteData\": {
      \"phone\": \"1234567890\",
      \"zipCode\": \"32839\",
      \"address\": \"123 Test St\",
      \"city\": \"Orlando\",
      \"state\": \"FL\"
    }
  }")

echo "Email usado: ${CHECKOUT_EMAIL}"
echo "Respuesta: ${RESPONSE}"
if echo "$RESPONSE" | grep -q "sessionId"; then
  echo "✅ Checkout API: PASSED"
else
  echo "❌ Checkout API: FAILED"
fi
echo ""

# Test 4: Validación de Email Inválido
echo "🚫 Test 4: Validación de Email Inválido"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/newsletter" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"email-invalido\"}")

echo "Respuesta: ${RESPONSE}"
if echo "$RESPONSE" | grep -q "error\|Validation"; then
  echo "✅ Validación: PASSED (rechazó email inválido)"
else
  echo "❌ Validación: FAILED (debería rechazar)"
fi
echo ""

echo "======================================"
echo "✅ Testing completado"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar logs del servidor para mensajes de HubSpot"
echo "2. Revisar HubSpot Dashboard para ver contactos creados"
echo "3. Probar formularios manualmente en el navegador"
