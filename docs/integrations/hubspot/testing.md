# 🧪 Guía de Pruebas - Integración HubSpot

## 📍 Dónde Probar la Integración

### 1. **Newsletter (Footer)** ⭐ MÁS FÁCIL
- **Ubicación**: Al final de cualquier página (footer)
- **Qué hacer**:
  - Scroll hasta el final de la página
  - Busca el campo "Enter your email"
  - Ingresa un email de prueba (ej: `test-hubspot@example.com`)
  - Haz clic en "Subscribe"
- **Qué debería pasar**:
  - Verás mensaje de confirmación
  - El contacto se crea en HubSpot automáticamente

### 2. **Formulario Hero (Homepage)**
- **Ubicación**: Página principal (`/`)
- **Qué hacer**:
  - En la sección hero (arriba)
  - Completa: Nombre, Email, Teléfono, ZIP
  - Selecciona servicios
  - Haz clic en "Get started today"
- **Qué debería pasar**:
  - Te redirige a `/quote`
  - El contacto se crea en HubSpot

### 3. **Formulario de Contacto**
- **Ubicación**: Página `/contact-us`
- **Qué hacer**:
  - Completa: Nombre, Teléfono, Email, Mensaje
  - Haz clic en "Send Message"
- **Qué debería pasar**:
  - Verás mensaje de confirmación
  - El contacto se crea en HubSpot

### 4. **Proceso de Pago (Stripe)**
- **Ubicación**: Después de completar una cotización
- **Qué hacer**:
  - Completa una cotización en `/quote`
  - Procede al pago con Stripe
  - Completa el pago (usa tarjeta de prueba)
- **Qué debería pasar**:
  - Se crea/actualiza contacto en HubSpot
  - Se crea un **Deal** marcado como "Won"
  - El deal se asocia con el contacto

## ✅ Cómo Verificar en HubSpot

### Ver Contactos Creados:
1. Ve a HubSpot → **Contacts** → **Contacts**
2. Busca el email que usaste en la prueba
3. Deberías ver el contacto con:
   - Nombre
   - Email
   - Teléfono (si lo proporcionaste)
   - ZIP code (si lo proporcionaste)
   - Fecha de creación

### Ver Deals Creados (solo después de pago):
1. Ve a HubSpot → **Sales** → **Deals**
2. Busca el deal con el nombre del cliente
3. Deberías ver:
   - Deal name: "Cleaning Service - [Nombre] - $[Monto]"
   - Deal stage: "Closed Won"
   - Asociado al contacto

### Ver Logs de API:
1. Ve a HubSpot → **Development** → **Monitoring** → **API call usage**
2. Deberías ver las llamadas a la API
3. Verifica que no haya errores

## 🐛 Troubleshooting

### El contacto no aparece en HubSpot:
1. **Verifica variables de entorno**:
   ```bash
   # En producción, verifica que estén configuradas:
    HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
    HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
    ```

2. **Revisa logs del servidor**:
   - Busca mensajes que digan "✅ Contacto creado" o "❌ Error"
   - Los errores no bloquean el flujo del usuario

3. **Verifica scopes de la app**:
   - Development → Projects → tu app → Auth tab
   - Debe tener: `crm.objects.contacts.write`

### El deal no se crea después del pago:
1. Verifica que el webhook de Stripe esté funcionando
2. Revisa logs del servidor para errores de HubSpot
3. Verifica que el contacto exista primero

## 📝 Datos de Prueba Recomendados

### Para Newsletter:
- Email: `test-newsletter-1@example.com`
- Email: `test-newsletter-2@example.com`

### Para Formulario Hero:
- Nombre: `Test User`
- Email: `test-hero@example.com`
- Teléfono: `8009300532`
- ZIP: `32837`

### Para Contact Form:
- Nombre: `Test Contact`
- Email: `test-contact@example.com`
- Teléfono: `8009300532`
- Mensaje: `Testing HubSpot integration`

### Para Pago (Stripe):
- Usa tarjeta de prueba: `4242 4242 4242 4242`
- Cualquier fecha futura
- Cualquier CVC

## 🎯 Orden Recomendado de Pruebas

1. ✅ **Newsletter** (más simple, solo email)
2. ✅ **Hero Form** (formulario completo)
3. ✅ **Contact Form** (otro formulario)
4. ✅ **Pago Stripe** (flujo completo con deal)

## 📊 Qué Monitorear

- **Tiempo de respuesta**: Los contactos deberían crearse en < 2 segundos
- **Tasa de éxito**: Debería ser 100% (errores se loguean pero no bloquean)
- **Rate limits**: Verifica que no estés cerca del límite (100/10s)

## 🔗 URLs de Prueba

- Homepage: `https://integritycleansolutions.com/`
- Contact: `https://integritycleansolutions.com/contact-us`
- Quote: `https://integritycleansolutions.com/quote`
