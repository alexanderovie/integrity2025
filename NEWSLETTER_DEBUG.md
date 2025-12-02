# 🔍 Diagnóstico del Formulario de Newsletter

**Problema Reportado:** El formulario de newsletter del footer muestra:
```
"Newsletter service is unavailable. Please try again later."
```

**Fecha:** Diciembre 2025

---

## ✅ Cambios Realizados

### 1. Actualización de la API de Newsletter

- ✅ Cambiado de `Request` a `NextRequest` para consistencia
- ✅ Mejorado el manejo de errores con logging detallado
- ✅ Agregado logging de variables de entorno faltantes

**Archivo modificado:** `src/app/api/newsletter/route.ts`

---

## 🔧 Problema Identificado

El error **"Newsletter service is unavailable. Please try again later."** se muestra cuando faltan las siguientes variables de entorno:

1. `RESEND_API_KEY` - API key de Resend para envío de emails
2. `FROM_EMAIL` - Email desde el cual se enviarán los correos
3. `TO_EMAIL` - Email para notificaciones de nuevos suscriptores

---

## 📋 Verificación de Variables de Entorno

### Paso 1: Verificar que existe `.env.local`

```bash
# En la raíz del proyecto
ls -la .env.local
```

### Paso 2: Verificar que las variables estén configuradas

Tu archivo `.env.local` debe contener:

```env
# Resend API Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@tudominio.com
TO_EMAIL=tu-email@tudominio.com
```

**Nota:** Asegúrate de que el dominio del `FROM_EMAIL` esté verificado en Resend.

---

## 🔍 Cómo Verificar el Problema

### Opción 1: Revisar los logs del servidor

Cuando intentas suscribirte, deberías ver en la consola del servidor:

```
[newsletter] missing environment variables: {
  hasResendApiKey: false,
  hasFromEmail: false,
  hasNotifyEmail: false
}
```

### Opción 2: Verificar variables en runtime

Crea un archivo temporal `src/app/api/debug-env/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    hasFromEmail: !!process.env.FROM_EMAIL,
    hasNotifyEmail: !!process.env.TO_EMAIL,
    // NO mostrar los valores reales por seguridad
  });
}
```

Luego visita: `http://localhost:3000/api/debug-env`

---

## 🚀 Solución Rápida

### 1. Verificar/Crear `.env.local`

```bash
# Si no existe, créalo
touch .env.local
```

### 2. Agregar las variables

```env
RESEND_API_KEY=tu_resend_api_key_aqui
FROM_EMAIL=noreply@tudominio.com
TO_EMAIL=notificaciones@tudominio.com
```

### 3. Reiniciar el servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
pnpm dev
```

**⚠️ IMPORTANTE:** Las variables de entorno solo se cargan al iniciar el servidor. Debes reiniciarlo después de modificarlas.

---

## 📝 Otras Posibles Causas

Si las variables están configuradas correctamente pero sigue fallando:

### 1. Variables en lugar incorrecto

- ✅ `.env.local` (recomendado para desarrollo)
- ✅ `.env` (funciona, pero `.env.local` tiene prioridad)
- ❌ `.env.production` (no se carga en desarrollo)

### 2. Formato incorrecto

❌ **INCORRECTO:**
```env
RESEND_API_KEY = re_xxxxx  # Espacios alrededor del =
RESEND_API_KEY="re_xxxxx"  # Comillas innecesarias
```

✅ **CORRECTO:**
```env
RESEND_API_KEY=re_xxxxx
```

### 3. Variables con espacios

Si el valor contiene espacios, usa comillas:

```env
FROM_EMAIL="no reply@tudominio.com"
```

Pero mejor, evita espacios en emails.

---

## 🔐 Obtener Credenciales de Resend

Si no tienes las credenciales:

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** y crea una nueva
4. Verifica tu dominio en **Domains**
5. Copia la API key y el email verificado

---

## 🧪 Prueba Rápida

Una vez configuradas las variables:

1. Reinicia el servidor: `pnpm dev`
2. Intenta suscribirte desde el footer
3. Verifica los logs del servidor para confirmar que funcionó

**Log esperado:**
```
✅ Newsletter contact creado en HubSpot: email@ejemplo.com
```

---

## 📞 Si el Problema Persiste

1. Revisa los logs del servidor (consola donde corre `pnpm dev`)
2. Verifica que el dominio de `FROM_EMAIL` esté verificado en Resend
3. Confirma que la API key de Resend sea válida y no esté revocada
4. Verifica que no haya errores de conexión a Resend

---

**Última Actualización:** Diciembre 2025
