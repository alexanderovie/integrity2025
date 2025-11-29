# Configuración de HubSpot Integration

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# HubSpot Access Token (obtenido después de instalar la app)
HUBSPOT_ACCESS_TOKEN=pat-na1-f74683c7-f9c0-4197-8695-01a9979db61a

# HubSpot Client Secret (para verificar webhooks - OBLIGATORIO en producción)
# Se encuentra en: Development → Projects → tu app → Auth tab
HUBSPOT_CLIENT_SECRET=bb563475-63d4-4f0d-9f82-1a4ecbeda7a8

# Habilitar/deshabilitar verificación de webhooks (default: true)
# Solo deshabilitar en desarrollo local
ENABLE_HUBSPOT_WEBHOOK_VERIFICATION=true
```

## Cómo Obtener el Access Token

1. Ve a HubSpot → **Development** → **Projects**
2. Haz clic en `integrity-hubspot-integration`
3. En **Project Components**, haz clic en **Integrity Clean Solutions Integration**
4. Ve a la pestaña **Distribution**
5. Si la app está instalada, verás el **Access Token**
6. Haz clic en **Show** para verlo completo
7. Cópialo y agrégalo a `.env.local` como `HUBSPOT_ACCESS_TOKEN`

## Cómo Obtener el Client Secret

1. En la misma página del proyecto, ve a la pestaña **Auth**
2. En **Client credentials**, copia el **Client secret**
3. Agrégalo a `.env.local` como `HUBSPOT_CLIENT_SECRET`

## Funcionalidades Implementadas

### 1. Crear Contactos desde Formularios
- **Endpoint**: `POST /api/hubspot/contacts`
- Se llama automáticamente desde los formularios del sitio
- Crea o actualiza contactos en HubSpot

### 2. Sincronización con Stripe
- Cuando un pago se completa:
  - Crea/actualiza el contacto en HubSpot
  - Crea un deal marcado como "Won"
  - Asocia el deal con el contacto

### 3. Webhooks de HubSpot
- **Endpoint**: `POST /api/hubspot/webhooks`
- Recibe eventos de HubSpot cuando:
  - Se crean/actualizan contactos
  - Se crean/actualizan deals
  - Cambian propiedades

## Configurar Webhooks en HubSpot

1. Ve a **Development** → **Projects** → `integrity-hubspot-integration`
2. Haz clic en **Integrity Clean Solutions Integration**
3. Ve a la pestaña de **Webhooks** (si está disponible)
4. O configura manualmente en HubSpot:
   - Settings → Integrations → Private Apps → tu app → Webhooks
5. Agrega la URL: `https://integritycleansolutions.com/api/hubspot/webhooks`
6. Selecciona los eventos que quieres recibir:
   - `contact.creation`
   - `contact.propertyChange`
   - `deal.creation`
   - `deal.propertyChange`

## Límites de API (Plan Free)

- **100 requests cada 10 segundos** por app
- **250,000 requests por día** por cuenta
- Los webhooks recibidos **NO cuentan** hacia el límite

## Monitoreo

Puedes ver el uso de API en:
- **Development** → **Monitoring** → **API call usage**

## Troubleshooting

### Error: "HUBSPOT_ACCESS_TOKEN no está configurado"
- Verifica que la variable esté en `.env.local`
- Reinicia el servidor de desarrollo después de agregar variables

### Error: "Rate limit alcanzado"
- Espera unos segundos antes de reintentar
- Implementa retry logic con backoff exponencial
- Considera usar batch APIs si necesitas crear múltiples contactos

### Los contactos no se crean
- Verifica que el Access Token sea válido
- Verifica que los scopes incluyan `crm.objects.contacts.write`
- Revisa los logs del servidor para ver errores específicos
