# Meta Pixel Setup - Integrity Clean Solutions

## Configuración Estándar Elite para Producción

### 📋 Información del Pixel

- **Pixel ID**: `1571291253874553`
- **Dataset ID**: `681675078142520`
- **Test Event Code**: `TEST86054`

---

## 🔧 Variables de Entorno Requeridas

Crea un archivo `.env.local` (NO se sube a GitHub) con:

```bash
# Meta Pixel ID (público, puede estar en NEXT_PUBLIC_)
NEXT_PUBLIC_META_PIXEL_ID=1571291253874553

# Meta Pixel Access Token (privado, solo servidor)
# Obtener de: Events Manager → Settings → Conversions API → Generate Token
META_PIXEL_ACCESS_TOKEN=tu_token_aqui

# Test Event Code (opcional, para pruebas)
NEXT_PUBLIC_META_TEST_EVENT_CODE=TEST86054
```

---

## 📦 Implementación

### 1. Pixel en Cliente (Automático)

El Pixel se carga automáticamente en `src/app/layout.tsx` a través del componente `<MetaPixel />`.

### 2. Conversions API en Servidor

Endpoint disponible en: `/api/meta/pixel`

**Ejemplo de uso:**

```typescript
// Desde el servidor (Server Component o API Route)
import { sendMetaEvent, MetaPixelEvent, hashUserData } from '@/lib/meta/pixel';

await sendMetaEvent(
  MetaPixelEvent.Lead,
  {
    client_ip_address: '127.0.0.1',
    client_user_agent: 'Mozilla/5.0...',
    em: await hashUserData('user@example.com'), // email hasheado
  },
  {
    value: 100,
    currency: 'USD',
  }
);
```

**Desde el cliente (Client Component):**

```typescript
'use client';
import { useMetaPixel } from '@/hooks/useMetaPixel';

function MyComponent() {
  const { trackEvent } = useMetaPixel();

  const handleLead = () => {
    trackEvent('Lead', {
      value: 100,
      currency: 'USD',
    });
  };

  return <button onClick={handleLead}>Submit</button>;
}
```

---

## 🧪 Probar Eventos

### Desde el Cliente (Browser)

1. Ve a Events Manager → Test Events
2. Ingresa tu URL: `https://integritycleansolutions.com`
3. Interactúa con tu sitio web
4. Los eventos aparecerán en tiempo real

### Desde el Servidor (CAPI)

```bash
curl -X POST http://localhost:3000/api/meta/pixel \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Lead",
    "user_data": {
      "email": "test@example.com"
    },
    "custom_data": {
      "value": 100,
      "currency": "USD"
    },
    "test_mode": true
  }'
```

---

## 📊 Eventos Estándar Disponibles

- `PageView` - Automático en cada página
- `ViewContent` - Ver contenido
- `Search` - Búsqueda
- `AddToCart` - Agregar al carrito
- `InitiateCheckout` - Iniciar checkout
- `AddPaymentInfo` - Agregar info de pago
- `Purchase` - Compra completada
- `Lead` - Lead generado ⭐ (más importante para tu negocio)
- `CompleteRegistration` - Registro completado
- `Contact` - Contacto
- `Schedule` - Agendar cita
- `FindLocation` - Buscar ubicación

---

## 🔒 Seguridad

- ✅ `.env.local` está en `.gitignore` (no se sube a GitHub)
- ✅ `META_PIXEL_ACCESS_TOKEN` solo en servidor (no expuesto al cliente)
- ✅ Datos PII (email, teléfono) se hashean automáticamente (SHA-256)
- ✅ Validación de eventos en el servidor

---

## 📝 Checklist de Producción

- [ ] Pixel ID configurado en `.env.local`
- [ ] Pixel Access Token obtenido y configurado
- [ ] Test Event Code configurado (opcional)
- [ ] Pixel cargando correctamente (verificar en DevTools)
- [ ] Eventos llegando a Events Manager
- [ ] Conversions API funcionando (verificar en Test Events)
- [ ] Dominio agregado a lista de autorizados en Events Manager

---

## 🚀 Próximos Pasos

1. Obtener Pixel Access Token de Events Manager
2. Agregar token a `.env.local`
3. Probar eventos en modo test
4. Verificar en Events Manager que los eventos llegan
5. Desactivar test mode para producción

---

## 📚 Documentación Oficial

- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Events Manager](https://business.facebook.com/events_manager2)
