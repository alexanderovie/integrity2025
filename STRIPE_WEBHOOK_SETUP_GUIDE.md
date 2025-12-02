# 🔧 Guía: Configurar Stripe Webhook Secret

**Fecha:** Diciembre 2025
**Modo:** Test Mode (desarrollo)

---

## ✅ Keys Recibidas

### Secret Key (Test Mode)
```
sk_test_51RKilKPOvJjRKFm4JfCjL03njjJBB2FoOYbSby6YELV6pnE3cEk2SYuTKj7SSDgBMiJq5Z1dJDfWaKyCrQ6PZoA000fADiEnE7
```
**Status:** ✅ Formato correcto (sk_test_...)

### Publishable Key (Test Mode)
```
pk_test_51RKilKPOvJjRKFm4ItzIWGknmk4VPuzUGoRt8La5ISYv046kvPTyUk72t5gFU2NPC7H1bE1BFj5Xlryx6LZvlVI7005qrcCGpg
```
**Status:** ✅ Formato correcto (pk_test_...)

---

## ⚠️ IMPORTANTE: Webhook Secret NO viene con las Keys

El **Webhook Secret** (`whsec_...`) es diferente y se obtiene cuando:
1. Creas un endpoint de webhook en Stripe Dashboard
2. O cuando ya tienes un webhook configurado

**NO** está incluido en las keys que acabas de proporcionar.

---

## 📋 Paso a Paso: Obtener Webhook Secret

### Paso 1: Verificar tu Dominio en Vercel

Primero necesitas saber tu dominio de producción:

```bash
# Opciones comunes:
https://integrity2025.vercel.app
# O tu dominio personalizado si lo tienes configurado
```

### Paso 2: Ir a Stripe Dashboard

1. Abre: https://dashboard.stripe.com/test/webhooks
2. Si ya tienes un webhook, ve al **Paso 3**
3. Si NO tienes un webhook, ve al **Paso 2.1**

---

### Paso 2.1: Crear Nuevo Webhook (Si no existe)

1. Click en **"Add endpoint"** (o **"+ Add endpoint"**)
2. **Endpoint URL:**
   ```
   https://TU-DOMINIO-VERCEL.com/api/webhooks/stripe
   ```
   ⚠️ **Reemplaza `TU-DOMINIO-VERCEL.com` con tu dominio real**

   Ejemplos:
   - `https://integrity2025.vercel.app/api/webhooks/stripe`
   - `https://integritycleansolutions.com/api/webhooks/stripe`

3. **Description (opcional):**
   ```
   Integrity Clean Solutions - Production Webhook
   ```

4. **Select events to listen to:**
   Marca estas casillas (obligatorias):
   - ✅ `checkout.session.completed` ⭐ **CRÍTICO**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `checkout.session.expired`

5. Click en **"Add endpoint"**

6. **¡IMPORTANTE!** Stripe te mostrará el **Signing secret** inmediatamente:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **COPIA ESTE SECRET AHORA** - solo se muestra una vez

---

### Paso 3: Obtener Signing Secret (Si ya tienes webhook)

1. En la lista de webhooks, haz click en el webhook existente
2. Scroll hacia abajo hasta **"Signing secret"**
3. Click en **"Reveal"** o **"Click to reveal"**
4. Copia el secret (formato: `whsec_xxxxx...`)

---

### Paso 4: Agregar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/tu-usuario/integrity2025
2. Ve a **Settings** → **Environment Variables**
3. Click en **"Create new"**
4. Configuración:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxx...` (el secret que copiaste)
   - **Environments:** ✅ All Environments
   - **Sensitive:** ✅ Marca esta casilla (oculta el valor)
5. Click en **"Save"**

---

### Paso 5: Hacer Nuevo Deployment

Después de agregar la variable:

1. Ve a la pestaña **Deployments**
2. Click en **"..."** del último deployment
3. Click en **"Redeploy"**
4. O haz un push a tu repositorio para trigger automático

---

## 🧪 Probar el Webhook

### Opción 1: Stripe CLI (Local Testing)

Si quieres probar localmente:

```bash
# Instalar Stripe CLI
# Windows: https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Escuchar webhooks localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# En otra terminal, trigger evento de prueba
stripe trigger checkout.session.completed
```

### Opción 2: Dashboard de Stripe

1. Ve a tu webhook en Stripe Dashboard
2. Haz click en **"Send test webhook"**
3. Selecciona el evento: `checkout.session.completed`
4. Click en **"Send test webhook"**
5. Verifica los logs en Vercel o en tu aplicación

---

## 📝 Verificación Final

### Checklist:

- [ ] Webhook creado en Stripe Dashboard
- [ ] URL del webhook apunta a: `https://tu-dominio.com/api/webhooks/stripe`
- [ ] Eventos seleccionados (al menos `checkout.session.completed`)
- [ ] Signing secret copiado (`whsec_...`)
- [ ] Variable agregada en Vercel: `STRIPE_WEBHOOK_SECRET`
- [ ] Variable marcada como **Sensitive**
- [ ] Nuevo deployment realizado en Vercel
- [ ] Webhook probado con evento de test

---

## 🔍 Verificar que Funciona

### En Vercel Logs:

1. Ve a tu proyecto en Vercel
2. **Deployments** → Último deployment → **Functions** → `/api/webhooks/stripe`
3. Busca logs que digan:
   ```
   ✅ Payment successful: cs_test_...
   ✅ Contacto sincronizado en HubSpot: ...
   ✅ Deal creado en HubSpot: ...
   ✅ Email de confirmación enviado
   ```

### En Stripe Dashboard:

1. Ve a **Webhooks** → Tu webhook
2. Tab **"Recent deliveries"**
3. Deberías ver eventos con estado **"Succeeded"** (código 200)

---

## ⚠️ Notas Importantes

### Modo Test vs Production

- **Test Mode:** Webhook secret empieza con `whsec_test_...` o `whsec_...`
- **Production Mode:** Necesitarás crear otro webhook cuando cambies a producción

### Seguridad

- ✅ **NUNCA** commits el webhook secret en código
- ✅ **SIEMPRE** márcalo como Sensitive en Vercel
- ✅ Rota el secret si sospechas que fue comprometido

### Múltiples Entornos

Si tienes desarrollo y producción:
- Webhook de desarrollo: Apunta a `localhost` o dominio de staging
- Webhook de producción: Apunta a tu dominio principal

---

## 🆘 Troubleshooting

### Error: "Invalid signature"

**Causa:** El webhook secret no coincide
**Solución:**
1. Verifica que copiaste el secret completo
2. Asegúrate que el secret es del webhook correcto
3. Verifica que hiciste nuevo deployment después de agregar la variable

### Error: "No signature provided"

**Causa:** Stripe no está enviando el header de firma
**Solución:** Verifica que estás usando el endpoint correcto en Stripe Dashboard

### Webhook no recibe eventos

**Causa:** URL incorrecta o eventos no seleccionados
**Solución:**
1. Verifica la URL en Stripe Dashboard
2. Asegúrate que `checkout.session.completed` está seleccionado
3. Verifica que tu dominio está accesible públicamente

---

## 📞 Soporte

Si necesitas ayuda adicional:
- Stripe Docs: https://stripe.com/docs/webhooks
- Vercel Docs: https://vercel.com/docs/concepts/functions/serverless-functions

---

**Última Actualización:** Diciembre 2025
