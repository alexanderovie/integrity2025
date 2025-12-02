# Script de Testing para APIs de HubSpot (PowerShell para Windows)
# Ejecutar desde la raíz del proyecto: .\scripts\test-apis.ps1

$baseUrl = "http://localhost:3000"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "🧪 Testing APIs de HubSpot Integration" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Newsletter API
Write-Host "📧 Test 1: Newsletter API" -ForegroundColor Yellow
Write-Host "-------------------------"
$newsletterEmail = "test-newsletter-${timestamp}@test.com"
$body = @{
    email = $newsletterEmail
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "${baseUrl}/api/newsletter" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Email usado: $newsletterEmail" -ForegroundColor Gray
    Write-Host "Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Gray
    if ($response.success) {
        Write-Host "✅ Newsletter API: PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Newsletter API: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Newsletter API: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: HubSpot Contacts API
Write-Host "👤 Test 2: HubSpot Contacts API" -ForegroundColor Yellow
Write-Host "-------------------------------"
$contactEmail = "test-contact-${timestamp}@test.com"
$body = @{
    email = $contactEmail
    firstname = "API"
    lastname = "Test"
    phone = "1234567890"
    zip = "32839"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "${baseUrl}/api/hubspot/contacts" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Email usado: $contactEmail" -ForegroundColor Gray
    Write-Host "Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Gray
    if ($response.success) {
        Write-Host "✅ Contacts API: PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Contacts API: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Contacts API: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Checkout API
Write-Host "💳 Test 3: Checkout API (crea contacto)" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$checkoutEmail = "test-checkout-${timestamp}@test.com"
$body = @{
    serviceId = "1"
    customerEmail = $checkoutEmail
    customerName = "API Test Checkout"
    customPrice = 12000
    quoteData = @{
        phone = "1234567890"
        zipCode = "32839"
        address = "123 Test St"
        city = "Orlando"
        state = "FL"
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "${baseUrl}/api/checkout" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Email usado: $checkoutEmail" -ForegroundColor Gray
    Write-Host "Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Gray
    if ($response.sessionId) {
        Write-Host "✅ Checkout API: PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Checkout API: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Checkout API: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Validación de Email Inválido
Write-Host "🚫 Test 4: Validación de Email Inválido" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$body = @{
    email = "email-invalido"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "${baseUrl}/api/newsletter" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ Validación: FAILED (debería rechazar)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✅ Validación: PASSED (rechazó email inválido)" -ForegroundColor Green
    } else {
        Write-Host "❌ Validación: ERROR inesperado - Status: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Testing completado" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Verificar logs del servidor para mensajes de HubSpot"
Write-Host "2. Revisar HubSpot Dashboard para ver contactos creados"
Write-Host "3. Probar formularios manualmente en el navegador"
