# Configuración de HubSpot Integration

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# HubSpot Access Token (obtenido después de instalar la app)
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token

# HubSpot Client Secret (para verificar webhooks - OBLIGATORIO en producción)
# Se encuentra en: Development → Projects → tu app → Auth tab
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret

# Habilitar/deshabilitar verificación de webhooks (default: true)
# Solo deshabilitar en desarrollo local
ENABLE_HUBSPOT_WEBHOOK_VERIFICATION=true

# Protege endpoints operacionales internos, como /api/hubspot/pipelines
INTERNAL_API_SECRET=your_internal_api_secret
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

## Versión de API

Confirmado el 2026-05-11 contra documentación oficial y el portal conectado.

- La integración de runtime usa endpoints date-versioned de HubSpot `2026-03`.
- HubSpot documenta que las APIs date-versioned reemplazan rutas numéricas anteriores para nuevas integraciones.
- El wrapper central está en `src/lib/hubspot/client.ts`.
- Rutas principales usadas:
  - Objects: `/crm/objects/2026-03/{objectType}`
  - Batch upsert: `/crm/objects/2026-03/{objectType}/batch/upsert`
  - Search: `/crm/objects/2026-03/{objectType}/search`
  - Properties: `/crm/properties/2026-03/{objectType}`
  - Pipelines: `/crm/pipelines/2026-03/{objectType}`
  - Associations labels: `/crm/associations/2026-03/{fromObjectType}/{toObjectType}/labels`

### 1. Crear Contactos desde Formularios
- **Endpoint**: `POST /api/hubspot/contacts`
- Endpoint de compatibilidad para formularios antiguos.
- Persiste primero en Neon como `lead_submissions`.
- Registra `integration_events`.
- Crea o actualiza contactos en HubSpot con batch upsert por `email`.

La ruta principal para contacto completo sigue siendo `POST /api/contact`, que también persiste en Neon antes de HubSpot/Resend.

Los formularios operativos `POST /api/help` y `POST /api/join-our-team` siguen el mismo patrón:

- Persisten primero en `lead_submissions`.
- Registran eventos separados para contacto y deal en `integration_events`.
- Sincronizan HubSpot como mirror operativo.
- Si HubSpot falla, el registro de Neon queda como `partial_failure` para revisión/reintento.

### 2. Sincronización con Stripe
- Cuando un pago se completa:
  - Crea/actualiza el contacto en HubSpot
  - Crea un deal con el stage de pago completado
  - Asocia el deal con el contacto

## Decisión de Mapeo de Propiedades

Confirmado el 2026-05-10 contra el portal actual de HubSpot y la documentación oficial de Properties API.

La fuente de verdad operativa es Neon. HubSpot es un mirror para operar contactos y deals. Por eso, la integración no debe depender de crear custom properties en HubSpot para que un pago sea válido.

Patrón decidido:

- Usar propiedades existentes de contacto: `email`, `firstname`, `lastname`, `phone`, `zip`, `address`, `hs_lead_status`, `lifecyclestage`, `message`.
- Usar propiedades existentes de deal: `dealname`, `amount`, `dealstage`, `pipeline`, `closedate`, `description`, `dealtype`.
- Guardar detalles sin campo estándar claro, como bedrooms, bathrooms, property size, frecuencia y servicios solicitados, dentro de `deal.description` y `contact.message`.
- No enviar propiedades custom como `property_size`, `bedrooms`, `bathrooms`, `services_requested`, `lead_score`, `estimated_deal_value`, `property_type`, `service_frequency` o `preferred_service_type`.
- No crear propiedades automáticamente desde la app. El endpoint anterior `/api/hubspot/init-properties` está deshabilitado.

Verificación local recomendada:

```bash
pnpm type-check
pnpm exec eslint src/lib/hubspot/contacts.ts src/lib/hubspot/deals.ts src/lib/hubspot/enrichment.ts src/app/api/webhooks/stripe/route.ts src/app/api/hubspot/init-properties/route.ts src/app/api/hubspot/webhooks/route.ts --max-warnings=0
```

Para smoke real de pago local, el listener de Stripe debe usar la misma cuenta que `STRIPE_SECRET_KEY`:

```bash
STRIPE_API_KEY="$STRIPE_SECRET_KEY" stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Webhooks de HubSpot
- **Endpoint**: `POST /api/hubspot/webhooks`
- Recibe eventos de HubSpot cuando:
  - Se crean/actualizan contactos
  - Se crean/actualizan deals
  - Cambian propiedades
- Verifica `X-HubSpot-Signature-v3` con `HUBSPOT_CLIENT_SECRET`.
- Persiste cada evento en `hubspot_webhook_events` antes de procesarlo.
- Registra cada evento inbound en `integration_events`.
- Usa `eventId` de HubSpot como clave de idempotencia cuando está presente.

### 4. Endpoints Operacionales
- **Endpoint**: `GET /api/hubspot/pipelines`
- Requiere `Authorization: Bearer $INTERNAL_API_SECRET` o `x-internal-secret`.
- Si `INTERNAL_API_SECRET` no existe, puede usar `REVALIDATE_SECRET` como fallback.

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

### HubSpot rechaza propiedades inexistentes
- No agregues propiedades custom como arreglo rápido.
- Consulta primero las propiedades existentes con `GET /crm/properties/2026-03/{objectType}`.
- Si el dato no tiene propiedad existente clara, mantenlo en Neon y/o en `description`/`message`.

## Gaps Pendientes

- Conectar `POST /api/ops/integration-retries` a Vercel Cron cuando se confirme la cadencia operativa.
- Configurar `INTERNAL_API_SECRET` en Vercel/local para usar endpoints operacionales protegidos.

## Retry/Backfill

Los fallos de proveedores quedan en `integration_events`. Para revisión:

```bash
psql "$DATABASE_URL" -f scripts/ops/integration-events-retry-report.sql
```

Para clasificar fallos como retryable o dead letter sin llamar a proveedores:

```bash
psql "$DATABASE_URL" \
  -v retry_after='5 minutes' \
  -v max_attempts='5' \
  -f scripts/ops/schedule-integration-event-retries.sql
```

Para ejecutar el retry automatico soportado actualmente:

```bash
curl -sS -X POST "$APP_URL/api/ops/integration-retries" \
  -H "Authorization: Bearer $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"maxAttempts":5}'
```

Al dia de esta guia, el runner automatico solo procesa HubSpot `payment_completed_sync`.
No reintenta emails de Resend ni eventos Meta CAPI para evitar duplicados sin una regla explicita.

## Relacion con Resend

Los envios de email se registran como `integration_events.provider = 'resend'`.
El estado de entrega posterior llega por `/api/webhooks/resend` y se guarda en:

- `resend_webhook_events`: ledger idempotente por `svix-id`.
- `resend_email_deliveries`: ultimo estado conocido por `email_id`.

Los eventos de rebote, queja, fallo o supresion no disparan reenvios automaticos.
Primero deben revisarse para evitar duplicar correos o insistir sobre direcciones suprimidas.
