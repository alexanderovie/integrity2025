# Comandos curl para probar HubSpot API

Este documento contiene ejemplos de comandos `curl` para probar la conexión y funcionalidades de HubSpot directamente desde la terminal.

## Versión Soportada

Confirmado el 2026-05-11 contra documentación oficial de HubSpot.

Este proyecto usa endpoints date-versioned de HubSpot `2026-03`. No uses rutas numéricas antiguas en comandos nuevos, scripts operativos ni documentación del repo.

```bash
export HUBSPOT_API_VERSION="2026-03"
export HUBSPOT_OBJECTS_API="https://api.hubapi.com/crm/objects/$HUBSPOT_API_VERSION"
export HUBSPOT_PROPERTIES_API="https://api.hubapi.com/crm/properties/$HUBSPOT_API_VERSION"
```

## Configuración Inicial

Primero, obtén tu token de `.env.local` o defínelo manualmente:

```bash
# Opción 1: Desde .env.local
export HUBSPOT_TOKEN=$(grep "HUBSPOT_ACCESS_TOKEN" .env.local | cut -d '=' -f2 | tr -d '"' | xargs)

# Opción 2: Manualmente
export HUBSPOT_TOKEN='your_hubspot_token_here'

# Verificar que está configurado
echo $HUBSPOT_TOKEN
```

## Scripts de Prueba

### Verificación Completa de Conexión

Ejecuta el script de verificación que prueba múltiples endpoints:

```bash
./scripts/test-hubspot-connection.sh
```

O con token explícito:

```bash
./scripts/test-hubspot-connection.sh 'tu-token-aqui'
```

### Ejemplos Interactivos

Para ver todos los ejemplos disponibles:

```bash
./scripts/hubspot-curl-examples.sh
```

## Comandos curl Directos

### 1. Verificar Autenticación (Listar Contactos)

```bash
curl -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  "$HUBSPOT_OBJECTS_API/contacts?limit=5&properties=email,firstname,lastname" | jq '.'
```

### 2. Buscar Contacto por Email

```bash
curl -X POST \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filterGroups": [{
      "filters": [{
        "propertyName": "email",
        "operator": "EQ",
        "value": "test@example.com"
      }]
    }],
    "limit": 1
  }' \
  "$HUBSPOT_OBJECTS_API/contacts/search" | jq '.'
```

### 3. Crear o Actualizar un Contacto por Email

El runtime usa batch upsert por `email`, igual que `src/lib/hubspot/contacts.ts`.

```bash
curl -X POST \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [{
      "id": "test@example.com",
      "idProperty": "email",
      "objectWriteTraceId": "contact:test@example.com",
      "properties": {
        "email": "test@example.com",
        "firstname": "Test",
        "lastname": "User",
        "phone": "+18009300532",
        "zip": "32837"
      }
    }]
  }' \
  "$HUBSPOT_OBJECTS_API/contacts/batch/upsert" | jq '.'
```

### 4. Actualizar un Contacto Existente

Primero obtén el ID del contacto, luego:

```bash
curl -X PATCH \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "firstname": "Updated",
      "lastname": "Name",
      "phone": "9876543210"
    }
  }' \
  "$HUBSPOT_OBJECTS_API/contacts/CONTACT_ID_AQUI" | jq '.'
```

### 5. Listar Deals

```bash
curl -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  "$HUBSPOT_OBJECTS_API/deals?limit=10&properties=dealname,amount,dealstage" | jq '.'
```

### 6. Crear un Deal

```bash
curl -X POST \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "dealname": "Test Deal - Cleaning Service",
      "amount": "150.00",
      "pipeline": "default",
      "dealstage": "qualifiedtobuy"
    }
  }' \
  "$HUBSPOT_OBJECTS_API/deals" | jq '.'
```

### 7. Obtener Propiedades Disponibles de Contactos

```bash
curl -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  "$HUBSPOT_PROPERTIES_API/contacts?limit=20" | jq '.results[] | {name, label, type}'
```

### 8. Verificar Rate Limits

```bash
curl -I -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  "$HUBSPOT_OBJECTS_API/contacts?limit=1" | grep -i 'rate-limit'
```

## Resultados de la Última Verificación

Según la última ejecución del script de verificación:

✅ **Autenticación**: Exitosa
✅ **Propiedades de Contactos**: 366 propiedades disponibles
✅ **Contactos**: Conectado y funcionando
✅ **Rate Limits**:
   - Requests diarias restantes: ~249,995
   - Requests burst restantes: ~96

## Troubleshooting

### Error 401: Unauthorized
- Verifica que el token esté correcto
- Asegúrate de que el token no haya expirado

### Error 403: Missing Scopes
- Verifica que la app tenga los scopes necesarios
- Revisa `hubspot-app/src/app/app-hsmeta.json` para ver los scopes configurados

### Error 429: Rate Limit
- Espera unos segundos antes de reintentar
- Verifica cuántos requests quedan disponibles

### Error 500: Internal Server Error
- Intenta de nuevo (puede ser temporal)
- Verifica que los datos enviados sean válidos

## Referencias

- [HubSpot 2026-03 API Reference](https://developers.hubspot.com/docs/api-reference/latest/overview)
- [HubSpot Objects API](https://developers.hubspot.com/docs/api-reference/latest/crm/using-object-apis)
- [HubSpot Contacts Upsert](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/batch/upsert-contacts)
- [HubSpot Deals API](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/guide)
