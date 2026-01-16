# Comandos curl para probar HubSpot API

Este documento contiene ejemplos de comandos `curl` para probar la conexión y funcionalidades de HubSpot directamente desde la terminal.

## Configuración Inicial

Primero, obtén tu token de `.env.local` o defínelo manualmente:

```bash
# Opción 1: Desde .env.local
export HUBSPOT_TOKEN=$(grep "HUBSPOT_ACCESS_TOKEN" .env.local | cut -d '=' -f2 | tr -d '"' | xargs)

# Opción 2: Manualmente
export HUBSPOT_TOKEN='pat-na1-tu-token-aqui'

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
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=5&properties=email,firstname,lastname" | jq '.'
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
  "https://api.hubapi.com/crm/v3/objects/contacts/search" | jq '.'
```

### 3. Crear un Nuevo Contacto

```bash
curl -X POST \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "email": "test@example.com",
      "firstname": "Test",
      "lastname": "User",
      "phone": "1234567890",
      "zip": "32837"
    }
  }' \
  "https://api.hubapi.com/crm/v3/objects/contacts" | jq '.'
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
  "https://api.hubapi.com/crm/v3/objects/contacts/CONTACT_ID_AQUI" | jq '.'
```

### 5. Listar Deals

```bash
curl -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.hubapi.com/crm/v3/objects/deals?limit=10&properties=dealname,amount,dealstage" | jq '.'
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
      "dealstage": "qualifiedtobuy"
    }
  }' \
  "https://api.hubapi.com/crm/v3/objects/deals" | jq '.'
```

### 7. Obtener Propiedades Disponibles de Contactos

```bash
curl -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.hubapi.com/crm/v3/properties/contacts?limit=20" | jq '.results[] | {name, label, type}'
```

### 8. Verificar Rate Limits

```bash
curl -I -X GET \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=1" | grep -i 'rate-limit'
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

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [CRM API Reference](https://developers.hubspot.com/docs/api/crm/understanding-the-crm)
- [Rate Limits](https://developers.hubspot.com/docs/api/working-with-apis)
