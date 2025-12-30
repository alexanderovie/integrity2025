# Comandos curl para Meta Marketing API

## Token configurado en: `$META_MARKETING_API_TOKEN`

---

## 1. VER PERMISOS DEL TOKEN (EL MÁS IMPORTANTE)

```bash
curl -G "https://graph.facebook.com/v21.0/me/permissions" -d "access_token=${META_MARKETING_API_TOKEN}"
```

---

## 2. INFORMACIÓN DEL USUARIO

```bash
curl -G "https://graph.facebook.com/v21.0/me" -d "access_token=${META_MARKETING_API_TOKEN}"
```

---

## 3. DEBUG DEL TOKEN (expiración, tipo, scopes)

```bash
curl -G "https://graph.facebook.com/v21.0/debug_token" -d "input_token=${META_MARKETING_API_TOKEN}" -d "access_token=${META_MARKETING_API_TOKEN}"
```

---

## 4. CUENTAS DE ANUNCIOS ACCESIBLES

```bash
curl -G "https://graph.facebook.com/v21.0/me/adaccounts" -d "access_token=${META_MARKETING_API_TOKEN}" -d "fields=id,name,account_status,currency,timezone_name"
```

---

## 5. BUSINESSES ACCESIBLES

```bash
curl -G "https://graph.facebook.com/v21.0/me/businesses" -d "access_token=${META_MARKETING_API_TOKEN}" -d "fields=id,name"
```

---

## 6. PÁGINAS ACCESIBLES

```bash
curl -G "https://graph.facebook.com/v21.0/me/accounts" -d "access_token=${META_MARKETING_API_TOKEN}" -d "fields=id,name,category"
```

---

## 7. VERIFICAR SI TIENES ACCESO A INSIGHTS (requiere ads_read)

```bash
# Reemplaza <AD_ACCOUNT_ID> con tu ID real (formato: act_123456789)
curl -G "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/insights" -d "access_token=${META_MARKETING_API_TOKEN}" -d "fields=impressions,spend,clicks" -d "date_preset=last_7d"
```

---

## 8. LISTAR CAMPAÑAS (requiere ads_read)

```bash
curl -G "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/campaigns" -d "access_token=${META_MARKETING_API_TOKEN}" -d "fields=id,name,status,objective"
```

---

## 9. LISTAR CUSTOM AUDIENCES (requiere ads_read)

```bash
curl -G "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/customaudiences" -d "access_token=${META_MARKETING_API_TOKEN}" -d "fields=id,name,approximate_count,operation_status"
```

---

## 💡 TIPS

- **El comando #1 es el más importante** para ver qué permisos tienes
- Reemplaza `<AD_ACCOUNT_ID>` con el ID real de tu cuenta (formato: `act_123456789`)
- Para ver mejor el JSON, agrega `| jq '.'` al final (si tienes jq instalado)
- Si no tienes jq, puedes usar `| python3 -m json.tool` para formatear

---

## 📋 PERMISOS COMUNES QUE DEBES BUSCAR:

- `ads_read` - Leer información de anuncios
- `ads_management` - Crear/modificar anuncios
- `pages_read_engagement` - Leer páginas
- `pages_manage_ads` - Gestionar anuncios de páginas
- `leads_retrieval` - Obtener leads (requiere App Review)
- `business_management` - Gestionar Business Manager
