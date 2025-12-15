# Integración del Script de HubSpot

## Implementación Estándar 2025

Este proyecto integra el script de HubSpot siguiendo las **mejores prácticas de Next.js 16** con App Router.

## Ubicación

El script de HubSpot está integrado en:
- **Componente**: `src/components/HubSpot/HubSpotScript.tsx`
- **Layout**: `src/app/layout.tsx` (nivel raíz, carga en todas las páginas)

## Características de la Implementación

### ✅ Estándares Seguidos

1. **Uso del componente `Script` de Next.js**
   - Optimiza la carga de scripts de terceros
   - Evita bloquear el render inicial

2. **Estrategia `afterInteractive`**
   - El script se carga después de que la página sea interactiva
   - No bloquea el First Contentful Paint (FCP)
   - Mejora el Core Web Vitals

3. **Client-Side Rendering**
   - El componente está marcado con `'use client'`
   - Se renderiza solo en el cliente, evitando problemas con SSR

4. **Portal ID Configurado**
   - Portal ID: `50745627`
   - Región: NA1 (Norte América)

## Código Implementado

```tsx
'use client';

import Script from 'next/script';

export function HubSpotScript() {
  const HUBSPOT_PORTAL_ID = '50745627';

  return (
    <Script
      id="hs-script-loader"
      strategy="afterInteractive"
      src={`//js-na1.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`}
    />
  );
}
```

## Funcionalidades Habilitadas

El script de HubSpot habilita:

- ✅ **Chat Widget** - Widget de chat en vivo
- ✅ **Form Tracking** - Seguimiento de formularios embebidos
- ✅ **Visitor Tracking** - Tracking de visitantes
- ✅ **Lead Capture** - Captura de leads automática
- ✅ **Conversation Intelligence** - Análisis de conversaciones
- ✅ **Marketing Analytics** - Métricas de marketing

## Comparación: Antes vs Ahora

### ❌ Forma Tradicional (NO recomendada en Next.js)
```html
<!-- Inline script en HTML - bloquea render -->
<script type="text/javascript" id="hs-script-loader"
        async defer
        src="//js-na1.hs-scripts.com/50745627.js">
</script>
```

### ✅ Forma Moderna (Implementada)
```tsx
// Usando componente Script de Next.js
<Script
  id="hs-script-loader"
  strategy="afterInteractive"
  src="//js-na1.hs-scripts.com/50745627.js"
/>
```

## Ventajas de la Implementación Actual

1. **Mejor Performance**
   - No bloquea el render inicial
   - Carga optimizada por Next.js

2. **SEO Friendly**
   - No afecta el tiempo de carga inicial
   - Mejora métricas de Lighthouse

3. **Mantenible**
   - Componente reutilizable
   - Fácil de actualizar o deshabilitar

4. **Type-Safe**
   - TypeScript completo
   - Detección de errores en tiempo de compilación

## Verificar que Funciona

1. **En el navegador:**
   - Abre las DevTools (F12)
   - Ve a la pestaña "Network"
   - Filtra por "hs-scripts"
   - Deberías ver la carga del script: `50745627.js`

2. **En la consola:**
   - Abre la consola del navegador
   - Escribe: `window._hsq`
   - Deberías ver un array (es el queue de HubSpot)

3. **Widget de Chat:**
   - Si tienes chat configurado, debería aparecer en la esquina inferior derecha

## Referencias

- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [HubSpot Tracking Code](https://developers.hubspot.com/docs/api/events/tracking-code-events)
- [Next.js Third-Party Scripts Best Practices](https://nextjs.org/learn/seo/third-party-scripts)
