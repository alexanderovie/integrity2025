# AGENTS.md (Repository Root)
Scope: this file applies to `/work/fascinante/repos/integrity2025` only.
Do not apply these rules to `apps/hubspot-app` (it has its own `AGENTS.md`).

## 1) Project overview
- Next.js 16 (App Router) + React 19 + TypeScript strict.
- Package manager: pnpm (`packageManager` is pinned).
- Runtime baseline: Node 24 (`.nvmrc`).
- Styling: Tailwind CSS v4.
- Integrations: Stripe, Resend, HubSpot, Meta Pixel.
- Deployment: Vercel (Preview + Production).

## 2) Rule precedence and external rule files
- Priority order:
  1. Explicit user request in current task.
  2. This `AGENTS.md`.
  3. Existing conventions in touched files.
- Checked additional rule files:
  - `.cursor/rules/`: not found
  - `.cursorrules`: not found
  - `.github/copilot-instructions.md`: not found

## 3) Build/lint/test commands

### Install and local run
```bash
pnpm install
pnpm dev
```

### Quality gates
```bash
pnpm run lint
pnpm run type-check
pnpm run build
pnpm run verify
```

`verify` is the default pre-merge local gate (lint + type-check + build).

### Diagnostics and bundle analysis
```bash
pnpm run doctor
pnpm run analyze
```

### Playwright smoke tests
`BASE_URL` is required by `playwright.config.ts`.

📚 **Documentación completa de smoke tests:** Ver `docs/development/smoke-tests.md` para entender:
- Qué tests existen y por qué tienen sentido
- Prioridades P0/P1/P2
- Tests faltantes recomendados
- Cómo agregar tests para nuevas funcionalidades

Run all smoke tests:
```bash
BASE_URL="https://your-preview-url.vercel.app" pnpm exec playwright test --project=chromium --reporter=list
```

Run a single spec file:
```bash
BASE_URL="https://your-preview-url.vercel.app" pnpm exec playwright test tests/smoke/api.spec.ts --project=chromium --reporter=list
```

Run one test by name:
```bash
BASE_URL="https://your-preview-url.vercel.app" pnpm exec playwright test tests/smoke/api.spec.ts --grep "rejects invalid stripe webhook signature" --project=chromium
```

Run mobile-only smoke:
```bash
BASE_URL="https://your-preview-url.vercel.app" pnpm exec playwright test --project=mobile-chrome
```

For protected previews, also set:
```bash
VERCEL_AUTOMATION_BYPASS_SECRET="..."
```

## 4) CI/CD expectations
- PR checks must pass: `CI / Lint, Type Check, Build` + Vercel preview checks.
- CI build requires `DATABASE_URL` in GitHub Actions secrets.
- Smoke workflow is manual (`workflow_dispatch`) with `base_url` input.
- Production smoke requires explicit opt-in (`allow_production=true`).

## 5) Git workflow preferences
- Keep one active PR at a time; finish/validate before opening next PR.
- Keep PRs focused and small (single concern per PR).
- Prefer versioned GitHub PR flow for code changes.
- Avoid direct production code deploys outside PR flow.
- If you do operational-only changes (env/deploy toggles), document exactly what changed and why.
- `AGENTS.md` is a tracked repository policy file: keep it in Git (do not add to `.gitignore`).

## 6) Code style guidelines

### Types and TypeScript
- Preserve strict typing (`tsconfig` has `strict: true`).
- Avoid `any`; use `unknown` + narrowing or specific types.
- Add explicit types for exported functions/components.
- Use Zod or equivalent validation for external/untrusted input.

### Imports and modules
- Use `@/` alias for internal imports.
- Group imports: external first, internal aliases second.
- Use `import "server-only"` for sensitive server modules.

### Naming and file conventions
- Components: PascalCase.
- Functions/variables: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants.
- Route handlers stay in `route.ts` under `src/app/api/**`.
- Follow existing naming/style in touched folders.

### Formatting
- Match existing file formatting; avoid repo-wide style churn.
- Keep diffs minimal and intentional.
- Do not mass-reformat unrelated files.

### Server-first approach
- Default to Server Components.
- Add `"use client"` only for real client needs (hooks, DOM APIs, browser-only libs, event-heavy UI).
- When removing `"use client"`, verify behavior is unchanged with lint/type-check/build and relevant smoke tests.

## 7) Error handling and API behavior
- Validate request bodies, query params, and webhook signatures.
- Never leak raw internal errors to clients.
- Log full error context server-side; return generic client-safe messages.
- Keep HTTP status codes and JSON response shapes consistent.
- Preserve existing security/rate-limit headers where present.

## 8) Caching and performance
- Use explicit cache strategy for expensive server reads (`unstable_cache`).
- Use central cache tags/constants from `src/lib/cache-tags.ts`.
- Revalidate on mutation/webhooks (`revalidateTag`, and `revalidatePath` where needed).
- Avoid unnecessary forced dynamic rendering when a route can be cacheable.
- Keep Web Vitals reporting in isolated client boundary (`src/components/analytics/WebVitals.tsx`).

## 9) Security and secret management
- Never commit tokens, API keys, or credentials.
- Runtime source of truth for secrets: Vercel env vars by environment.
- GitHub Actions secrets are for CI only.
- Keep `.env.example` as placeholders/documentation only.
- Relevant envs in this repo include:
  - `NEXT_PUBLIC_APP_URL`
  - `DATABASE_URL`
  - `CSP_MODE` (`report-only` | `enforce`)
  - `CSP_REPORT_URI` (optional)
  - `NEXT_PUBLIC_WEB_VITALS_DEBUG` (debug only)
  - `VERCEL_AUTOMATION_BYPASS_SECRET` (protected preview smoke tests)

## 10) Definition of done
- `pnpm run lint`, `pnpm run type-check`, and `pnpm run build` pass locally.
- Relevant smoke tests pass against preview when behavior changed.
- PR description includes what changed, why, and how it was validated.
- No unrelated churn, no secret exposure, no breaking changes outside scope.

## 11) Modern operational patterns for this repo
- Use Preview-first rollout for risky config/security changes (CSP, webhook strictness, caching behavior).
- Promote to Production only after preview checks + smoke validation pass.
- Keep runtime config in Vercel envs; keep code/config defaults in Git (`.env.example`, docs, workflows).
- Never hardcode secrets or environment-specific private URLs in source code.
- For operational actions done outside PR flow (e.g., Vercel env update), record a short ops note in PR/issue/docs.
