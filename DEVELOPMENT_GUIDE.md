# 📘 Guía de Desarrollo - Integrity Clean Solutions

**Última Actualización:** Diciembre 2025
**Next.js:** 15.5.6
**React:** 19.0.0

Esta guía proporciona las mejores prácticas y estándares para desarrollar y mantener el proyecto.

---

## 🎯 Estándares de Código

### TypeScript

- ✅ **Modo estricto activado**
- ✅ **No usar `any`** - Usar tipos específicos o `unknown`
- ✅ **Type inference** - Dejar que TypeScript infiera cuando sea posible
- ✅ **Tipos explícitos** para APIs públicas

### Naming Conventions

- **Variables y funciones:** `camelCase`
- **Componentes React:** `PascalCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Archivos de componentes:** `PascalCase.tsx`
- **Archivos de utilidades:** `kebab-case.ts`

---

## 🔒 Seguridad

### Validación de Input

**Siempre usar Zod para validación:**

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// En API routes
const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: result.error.issues },
    { status: 400 }
  );
}
```

### Manejo de Errores

**Usar el sistema de manejo de errores escalable:**

```typescript
import {
  handleValidationError,
  handleExternalServiceError,
  createErrorResponse,
  logError
} from '@/lib/utils/error-handler';

try {
  // código
} catch (error) {
  const structuredError = handleValidationError(error, { endpoint });
  logError(structuredError);
  const response = createErrorResponse(structuredError);
  return NextResponse.json(response.body, { status: response.statusCode });
}
```

### Variables de Entorno

- ✅ **Nunca** commitear `.env.local`
- ✅ **Siempre** validar variables requeridas
- ✅ **Usar** `env.ts` para acceso type-safe

---

## 🏗️ Arquitectura

### Estructura de APIs

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Validar tamaño del payload
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText)) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    // 2. Parsear JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // 3. Validar con Zod
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', message: formatValidationError(result.error) },
        { status: 400 }
      );
    }

    // 4. Lógica de negocio
    // ...

    // 5. Respuesta exitosa
    return NextResponse.json({ success: true });
  } catch (error) {
    // 6. Manejo de errores
    const structuredError = handleExternalServiceError('ServiceName', error);
    logError(structuredError);
    const response = createErrorResponse(structuredError);
    return NextResponse.json(response.body, { status: response.statusCode });
  }
}
```

### Componentes React

**Server Components por defecto:**

```typescript
// ✅ Correcto - Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Solo usar 'use client' cuando sea necesario
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState('clicked')}>Click</button>;
}
```

---

## 📦 Dependencias

### Agregar Nuevas Dependencias

1. **Verificar si ya existe** una alternativa en el proyecto
2. **Revisar** seguridad y mantenimiento del paquete
3. **Usar versiones específicas** (no `latest`)
4. **Documentar** por qué se agrega

```bash
# Instalar dependencia de producción
pnpm add package-name

# Instalar dependencia de desarrollo
pnpm add -D package-name
```

### Gestión de Versiones

- ✅ **Pin versions** para dependencias críticas
- ✅ **Usar ranges** para dependencias menores
- ✅ **Actualizar regularmente** para seguridad

---

## 🧪 Testing

### Testing Local

```bash
# Desarrollo
pnpm dev

# Build de producción local
pnpm build
pnpm start

# Linting
pnpm lint
```

### Checklist Antes de Commit

- [ ] Código compila sin errores
- [ ] No hay errores de linting
- [ ] Variables de entorno configuradas
- [ ] Tests locales pasan
- [ ] Documentación actualizada

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] Variables de entorno configuradas en producción
- [ ] Headers de seguridad verificados
- [ ] Rate limiting configurado
- [ ] Monitoreo de errores activado
- [ ] Backups configurados

### Post-Deployment

- [ ] Verificar headers de seguridad
- [ ] Verificar rate limiting
- [ ] Verificar manejo de errores
- [ ] Monitorear logs por 24 horas

---

## 📚 Recursos

### Documentación Interna

- `SECURITY_IMPROVEMENTS.md` - Mejoras de seguridad
- `README.md` - Setup y configuración
- `HUBSPOT_SETUP.md` - Configuración de HubSpot
- `META_PIXEL_SETUP.md` - Configuración de Meta Pixel

### Referencias Externas

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)

---

**Última Actualización:** Diciembre 2025
