# 🚀 Guía Rápida de Testing - Integraciones HubSpot

**Servidor:** http://localhost:3000
**Fecha:** Diciembre 2025

---

## ✅ Preparación Rápida

### 1. Verificar Servidor

Abre tu navegador y ve a:
```
http://localhost:3000
```

✅ Si carga la página, el servidor está funcionando.

---

## 🧪 Testing Rápido - 5 Minutos

### ✅ Test 1: Newsletter (2 minutos)

1. Abre http://localhost:3000
2. Scroll hasta el footer
3. Encuentra el formulario de newsletter
4. Ingresa: `test-newsletter@test.com`
5. Click en "Subscribe"

**✅ Verificar:**
- Mensaje de éxito aparece
- Abre la consola del navegador (F12 → Console)
- Busca mensajes de error (no debería haber)

**En terminal del servidor:**
- Busca: `✅ Newsletter contact creado en HubSpot`

---

### ✅ Test 2: Contact Form (2 minutos)

1. Ve a http://localhost:3000/contact-us
2. Llena el formulario:
   - Name: `Test User`
   - Phone: `1234567890`
   - Email: `test-contact@test.com`
   - Message: `Test message`
3. Click en "Send Message"

**✅ Verificar:**
- Mensaje de éxito
- Consola del navegador (F12) - busca llamadas a `/api/hubspot/contacts`
- Terminal del servidor - busca: `✅ Contacto creado/actualizado en HubSpot`

---

### ✅ Test 3: Contact Modal (1 minuto)

1. En cualquier página, click en el botón que abre el Contact Modal (header)
2. Llena:
   - Name: `Test Modal`
   - Email: `test-modal@test.com`
   - Phone: `5555555555`
   - Message: `Test`
3. Click en "Send Request"

**✅ Verificar:**
- Modal se cierra después del éxito
- Terminal del servidor - busca: `✅ Contacto creado/actualizado en HubSpot`

---

## 🔍 Verificación en HubSpot

1. Ve a tu HubSpot Dashboard
2. Contacts → All contacts
3. Busca los emails de prueba:
   - `test-newsletter@test.com`
   - `test-contact@test.com`
   - `test-modal@test.com`

**✅ Deben aparecer los 3 contactos**

---

## 🐛 Si Algo No Funciona

### Problema: "HUBSPOT_ACCESS_TOKEN no está configurado"

**Solución:**
1. Verifica que `.env.local` existe
2. Verifica que tiene `HUBSPOT_ACCESS_TOKEN=pat-...`
3. Reinicia el servidor (`Ctrl+C` y luego `pnpm dev`)

### Problema: Errores en consola del navegador

**Revisa:**
- F12 → Console → Busca errores en rojo
- Copia el error completo
- Verifica que el servidor está corriendo

### Problema: No aparecen contactos en HubSpot

**Revisa:**
- Terminal del servidor - ¿hay errores?
- Verifica que el token de HubSpot es válido
- Revisa logs del servidor para mensajes de error

---

## 📋 Checklist Rápido

- [ ] Servidor corriendo en localhost:3000
- [ ] Newsletter form funciona
- [ ] Contact form funciona
- [ ] Contact modal funciona
- [ ] Contactos aparecen en HubSpot
- [ ] No hay errores en consola
- [ ] No hay errores en terminal

---

## 🎯 Resultado Esperado

Si todos los tests pasan:
- ✅ **Todo funciona correctamente**
- ✅ **Listo para producción**

Si algo falla:
- ⚠️ Revisa los errores
- ⚠️ Verifica variables de entorno
- ⚠️ Revisa logs del servidor

---

## 📞 Comandos Útiles

### Ver logs del servidor en tiempo real:
```bash
# En la terminal donde corre el servidor
# Deberías ver mensajes como:
✅ Newsletter contact creado en HubSpot: test@test.com
✅ Contacto creado/actualizado en HubSpot: 12345
```

### Probar API directamente (desde otra terminal):
```bash
# Newsletter
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com"}'

# Contacts
curl -X POST http://localhost:3000/api/hubspot/contacts \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "firstname": "Test", "lastname": "User"}'
```

---

**Última Actualización:** Diciembre 2025
