## Integrity Clean Solutions – Web App

Sitio web oficial de **Integrity Clean Solutions**, empresa de limpieza residencial y comercial en Orlando.

### Tech stack
- **Next.js 16.1.1** (App Router, Turbopack)
- **React 19**
- **TypeScript** (Strict Mode)
- **Tailwind CSS v4**
- **Stripe** (pagos)
- **Resend** (emails)

### Requisitos
- **Node.js 24.x** (requerido)
- **pnpm 10.19.0** (configurado via packageManager)
- Corepack habilitado (para gestión automática de pnpm):

```bash
npm install -g pnpm
```

### Instalación
```bash
pnpm install
```

### Desarrollo local
```bash
pnpm dev
```

La app correrá por defecto en `http://localhost:3000`.

### Build de producción
```bash
pnpm build
pnpm start
```

### Variables de entorno

Todas las claves y secretos se cargan desde `.env.local` (no se versiona).

Ejemplo mínimo (sin valores reales):
```env
RESEND_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
HUBSPOT_ACCESS_TOKEN=...
```

> Nota: No incluir nunca claves reales en commits. Usar siempre `.env.local` o el gestor de secretos de tu plataforma (Vercel, etc.).

### Vercel / GitHub checks

Si el check de Vercel falla con un mensaje tipo "No GitHub account was found matching the commit author email address":

- Asegura que el email del autor del commit este agregado y verificado en tu cuenta de GitHub, o
- Usa el email `@users.noreply.github.com` (GitHub noreply) como autor de commit.
