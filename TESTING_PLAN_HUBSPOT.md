# 🧪 Plan de Testing Completo - Integraciones HubSpot

**Fecha:** Diciembre 2025
**Servidor:** http://localhost:3000
**Estado:** ✅ Listo para Testing

---

## 📋 Checklist de Testing

### ✅ Pre-requisitos

- [ ] Servidor corriendo en `localhost:3000`
- [ ] Variable `HUBSPOT_ACCESS_TOKEN` configurada en `.env.local`
- [ ] HubSpot Dashboard abierto para verificar contactos creados
- [ ] Navegador con consola abierta (F12)

---

## 🧪 Testing Manual de Formularios

### 1. ✅ Newsletter Form (Footer)

**Ubicación:** Footer en cualquier página

**Pasos:**
1. Ir a http://localhost:3000
2. Scroll hasta el footer
3. Encontrar el formulario de newsletter
4. Ingresar email de prueba: `test-newsletter-${Date.now()}@test.com`
5. Click en "Subscribe"
6. Verificar mensaje de éxito

**Verificaciones:**
- [ ] Formulario se envía correctamente
- [ ] Aparece mensaje de éxito
- [ ] Revisar consola del navegador - no debe haber errores
- [ ] Revisar logs del servidor - debe decir "✅ Newsletter contact creado en HubSpot"
- [ ] Verificar en HubSpot Dashboard que el contacto se creó

**Datos Esperados en HubSpot:**
- Email: `test-newsletter-xxx@test.com`
- Firstname: (vacío)
- Lastname: (vacío)

---

### 2. ✅ Contact Form (Contact Us Page)

**Ubicación:** http://localhost:3000/contact-us

**Pasos:**
1. Ir a `/contact-us`
2. Llenar el formulario:
   - Name: "Test Contact User"
   - Phone: "1234567890"
   - Email: `test-contact-${Date.now()}@test.com`
   - Message: "Test message from contact form"
3. Click en "Send Message"
4. Verificar mensaje de éxito

**Verificaciones:**
- [ ] Formulario se envía correctamente
- [ ] Aparece mensaje de éxito
- [ ] Revisar consola - debe aparecer llamado a `/api/hubspot/contacts`
- [ ] Revisar logs del servidor - debe decir "✅ Contacto creado/actualizado en HubSpot"
- [ ] Verificar en HubSpot Dashboard que el contacto se creó

**Datos Esperados en HubSpot:**
- Email: `test-contact-xxx@test.com`
- Firstname: "Test Contact"
- Lastname: "User"
- Phone: "1234567890"

---

### 3. ✅ Hero Form (Homepage)

**Ubicación:** http://localhost:3000/ (Homepage)

**Pasos:**
1. Ir a la homepage
2. Llenar el formulario hero:
   - Name: "Test Hero User"
   - Phone: "9876543210"
   - Email: `test-hero-${Date.now()}@test.com`
   - ZIP: "32839"
   - Seleccionar al menos un servicio
3. Click en "Get Quote" o botón de submit
4. Debe redirigir a `/quote`

**Verificaciones:**
- [ ] Formulario se envía correctamente
- [ ] Redirige a `/quote` con parámetros
- [ ] Revisar consola - debe aparecer llamado a `/api/hubspot/contacts`
- [ ] Revisar logs del servidor - debe decir contacto creado
- [ ] Verificar en HubSpot Dashboard

**Datos Esperados en HubSpot:**
- Email: `test-hero-xxx@test.com`
- Firstname: "Test Hero"
- Lastname: "User"
- Phone: "9876543210"
- Zip: "32839"

---

### 4. ✅ Contact Modal (Header)

**Ubicación:** Header (botón "Contact us" o similar)

**Pasos:**
1. Click en el botón que abre el Contact Modal (en el header)
2. Llenar el formulario:
   - Name: "Test Modal User"
   - Email: `test-modal-${Date.now()}@test.com`
   - Phone: "5555555555"
   - Message: "Test message from modal"
3. Click en "Send Request"
4. Verificar mensaje de éxito y cierre del modal

**Verificaciones:**
- [ ] Modal se abre correctamente
- [ ] Formulario se envía correctamente
- [ ] Modal se cierra después del éxito
- [ ] Revisar consola - debe aparecer llamado a `/api/hubspot/contacts`
- [ ] Revisar logs del servidor - debe decir contacto creado
- [ ] Verificar en HubSpot Dashboard

**Datos Esperados en HubSpot:**
- Email: `test-modal-xxx@test.com`
- Firstname: "Test Modal"
- Lastname: "User"
- Phone: "5555555555"

---

### 5. ✅ Book Services Modal (Header)

**Ubicación:** Header (botón "Book a service" o similar)

**Pasos:**
1. Click en el botón que abre el Book Services Modal (en el header)
2. Llenar el formulario:
   - Name: "Test Book User"
   - Email: `test-book-${Date.now()}@test.com`
   - Phone: "4444444444"
   - ZIP: "32839"
   - Seleccionar al menos un servicio
3. Click en submit
4. Debe redirigir a `/quote`

**Verificaciones:**
- [ ] Modal se abre correctamente
- [ ] Formulario se envía correctamente
- [ ] Redirige a `/quote` con parámetros
- [ ] Revisar consola - debe aparecer llamado a `/api/hubspot/contacts`
- [ ] Revisar logs del servidor - debe decir contacto creado
- [ ] Verificar en HubSpot Dashboard

**Datos Esperados en HubSpot:**
- Email: `test-book-xxx@test.com`
- Firstname: "Test Book"
- Lastname: "User"
- Phone: "4444444444"
- Zip: "32839"

---

### 6. ✅ Quote Form (Checkout)

**Ubicación:** http://localhost:3000/quote

**Pasos:**
1. Ir a `/quote` (puedes llegar desde Hero Form o Book Services Modal)
2. Llenar todos los campos del formulario de quote
3. Completar hasta llegar al botón "Book Now"
4. Click en "Book Now"
5. Debe crear checkout session de Stripe

**Verificaciones:**
- [ ] Formulario se valida correctamente
- [ ] Al hacer click en "Book Now", se crea checkout session
- [ ] Revisar logs del servidor - debe decir "✅ Contacto guardado en HubSpot al crear checkout"
- [ ] **IMPORTANTE:** El contacto debe guardarse ANTES de ir a Stripe
- [ ] Verificar en HubSpot Dashboard que el contacto se creó
- [ ] El checkout de Stripe se abre correctamente

**Datos Esperados en HubSpot:**
- Email: (del formulario)
- Firstname: (del formulario)
- Lastname: (del formulario)
- Phone: (del formulario)
- Zip: (del formulario)
- Address: (del formulario)
- City: (del formulario)
- State: (del formulario)

---

## 🔍 Testing de APIs Directamente

### Test 1: API Newsletter

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "api-test-newsletter@test.com"}'
```

**Verificaciones:**
- [ ] Respuesta 200 OK
- [ ] `{"success": true}` en respuesta
- [ ] Logs dicen "✅ Newsletter contact creado en HubSpot"
- [ ] Contacto aparece en HubSpot

---

### Test 2: API HubSpot Contacts

```bash
curl -X POST http://localhost:3000/api/hubspot/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test-contact@test.com",
    "firstname": "API",
    "lastname": "Test",
    "phone": "1234567890",
    "zip": "32839"
  }'
```

**Verificaciones:**
- [ ] Respuesta 200 OK
- [ ] `{"success": true, "contactId": "..."}` en respuesta
- [ ] Logs dicen "✅ Contacto creado/actualizado en HubSpot"
- [ ] Contacto aparece en HubSpot con todos los datos

---

### Test 3: API Checkout (crea contacto)

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "1",
    "customerEmail": "api-test-checkout@test.com",
    "customerName": "API Test Checkout",
    "customPrice": 12000,
    "quoteData": {
      "phone": "1234567890",
      "zipCode": "32839",
      "address": "123 Test St",
      "city": "Orlando",
      "state": "FL"
    }
  }'
```

**Verificaciones:**
- [ ] Respuesta 200 OK
- [ ] `{"sessionId": "cs_..."}` en respuesta
- [ ] Logs dicen "✅ Contacto guardado en HubSpot al crear checkout"
- [ ] Contacto aparece en HubSpot con todos los datos del quote

---

## 📊 Verificación en HubSpot Dashboard

### Checklist de Verificación:

1. [ ] Ir a HubSpot Dashboard → Contacts
2. [ ] Buscar los emails de prueba
3. [ ] Verificar que todos los contactos están presentes:
   - Newsletter contact
   - Contact Form contact
   - Hero Form contact
   - Contact Modal contact
   - Book Services Modal contact
   - Quote Form contact
4. [ ] Verificar que los datos están completos en cada contacto
5. [ ] Verificar que no hay contactos duplicados (deben actualizarse si el email ya existe)

---

## 🐛 Testing de Errores

### Test 1: Email Inválido

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "email-invalido"}'
```

**Esperado:**
- [ ] Respuesta 400 Bad Request
- [ ] Mensaje de error de validación
- [ ] NO se crea contacto en HubSpot

---

### Test 2: Payload Muy Grande

```bash
curl -X POST http://localhost:3000/api/hubspot/contacts \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "message": "'$(python3 -c "print('x' * 110000)")'"}'
```

**Esperado:**
- [ ] Respuesta 413 Payload Too Large
- [ ] NO se crea contacto en HubSpot

---

## 📝 Logs a Revisar

### En la Consola del Servidor (Terminal):

Buscar estos mensajes:

✅ **Mensajes de Éxito:**
- `✅ Newsletter contact creado en HubSpot: [email]`
- `✅ Contacto creado/actualizado en HubSpot: [id]`
- `✅ Contacto guardado en HubSpot al crear checkout: [email]`

⚠️ **Mensajes de Advertencia (aceptables):**
- `⚠️ Error enviando a HubSpot: [error]` - Si aparece pero el formulario sigue funcionando, está bien

❌ **Mensajes de Error (NO aceptables):**
- `Error: HUBSPOT_ACCESS_TOKEN no está configurado`
- `Error: Failed to create contact`

---

## 🎯 Resultados Esperados

### ✅ Todos los Tests Deben Pasar:

1. **6 formularios** guardan en HubSpot correctamente
2. **3 APIs** funcionan correctamente
3. **Validaciones** funcionan (rechazan datos inválidos)
4. **Error handling** funciona (no bloquea el flujo)
5. **Todos los contactos** aparecen en HubSpot Dashboard

---

## 📋 Reporte de Testing

Después de completar todos los tests, documentar:

- [ ] Formularios que funcionaron: ___/6
- [ ] APIs que funcionaron: ___/3
- [ ] Errores encontrados: ___
- [ ] Contactos creados en HubSpot: ___/6
- [ ] Problemas encontrados: ___

---

## 🚀 Próximos Pasos Después del Testing

1. Si todo funciona: ✅ **Listo para producción**
2. Si hay errores: Documentar y corregir
3. Verificar que las variables de entorno estén en Vercel
4. Hacer deployment y probar en producción

---

**Última Actualización:** Diciembre 2025
