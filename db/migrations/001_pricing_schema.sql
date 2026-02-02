-- FASE 3: Modelo relacional para pricing multi-tenant con Stripe Connect
-- Requiere extensión pgcrypto para gen_random_uuid(), la dejamos segura.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de tenants (cada tenant puede mapear a una cuenta conectada de Stripe)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  stripe_connected_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenants_subdomain_idx ON tenants (subdomain);

-- Tabla de planes sincronizados desde Stripe (Products)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_product_id TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  display_order INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '{}'::JSONB,
  limits JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, stripe_product_id),
  UNIQUE (tenant_id, plan_key)
);

CREATE INDEX IF NOT EXISTS plans_tenant_idx ON plans (tenant_id);
CREATE INDEX IF NOT EXISTS plans_service_slug_idx ON plans (service_slug);
CREATE INDEX IF NOT EXISTS plans_features_gin ON plans USING GIN (features);
CREATE INDEX IF NOT EXISTS plans_limits_gin ON plans USING GIN (limits);

-- Tabla de precios sincronizados (Prices)
CREATE TABLE IF NOT EXISTS plan_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  lookup_key TEXT,
  price_type TEXT NOT NULL CHECK (price_type IN ('base', 'extra', 'custom_quote')),
  unit_amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT,
  billing_scheme TEXT,
  recurring JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plan_prices_plan_idx ON plan_prices (plan_id);
CREATE INDEX IF NOT EXISTS plan_prices_lookup_key_idx ON plan_prices (lookup_key);
CREATE INDEX IF NOT EXISTS plan_prices_active_idx ON plan_prices (active);

-- Extras (plan_extra_items) con reglas y price_id propio
CREATE TABLE IF NOT EXISTS plan_extra_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  plan_price_id UUID REFERENCES plan_prices(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  stripe_price_id TEXT,
  rules JSONB NOT NULL DEFAULT '{}'::JSONB,
  amount_override INT,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plan_extra_items_tenant_idx ON plan_extra_items (tenant_id);
CREATE INDEX IF NOT EXISTS plan_extra_items_stripe_price_idx ON plan_extra_items (stripe_price_id);
CREATE INDEX IF NOT EXISTS plan_extra_items_rules_gin ON plan_extra_items USING GIN (rules);
CREATE INDEX IF NOT EXISTS plan_extra_items_plan_idx ON plan_extra_items (plan_id);

-- Sesiones de checkout
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_price_id UUID REFERENCES plan_prices(id),
  stripe_session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount_total INT,
  currency TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  quote JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS checkout_sessions_tenant_idx ON checkout_sessions (tenant_id);
CREATE INDEX IF NOT EXISTS checkout_sessions_plan_price_idx ON checkout_sessions (plan_price_id);

-- Eventos de webhook con control de reintentos
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  attempt_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  tenant_id UUID REFERENCES tenants(id),
  error TEXT
);

CREATE INDEX IF NOT EXISTS webhook_events_type_idx ON stripe_webhook_events (type);
CREATE INDEX IF NOT EXISTS webhook_events_tenant_idx ON stripe_webhook_events (tenant_id);
CREATE INDEX IF NOT EXISTS webhook_events_next_retry_idx ON stripe_webhook_events (next_retry_at);

-- Snapshots para auditoría
CREATE TABLE IF NOT EXISTS price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_price_id UUID NOT NULL REFERENCES plan_prices(id) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checkout_session_id UUID REFERENCES checkout_sessions(id)
);

CREATE INDEX IF NOT EXISTS price_snapshots_plan_price_idx ON price_snapshots (plan_price_id);
CREATE INDEX IF NOT EXISTS price_snapshots_tenant_idx ON price_snapshots (tenant_id);

-- Estrategia multi-tenant: Stripe Connect (cada tenant puede tener una cuenta conectada)
-- Se espera que el backend seteé SET LOCAL stripe.account = tenant.stripe_connected_account_id antes de consumir Stripe.

-- Habilitar RLS y políticas de aislamiento por tenant
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_extra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo: dependemos del setting app.current_tenant
CREATE POLICY tenants_self_access ON tenants
  USING (id = current_setting('app.current_tenant', true)::UUID)
  WITH CHECK (id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY plans_by_tenant ON plans
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY plan_prices_by_tenant ON plan_prices
  USING (plan_id IN (SELECT id FROM plans WHERE tenant_id = current_setting('app.current_tenant', true)::UUID))
  WITH CHECK (plan_id IN (SELECT id FROM plans WHERE tenant_id = current_setting('app.current_tenant', true)::UUID));

CREATE POLICY plan_extra_items_by_tenant ON plan_extra_items
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY checkout_sessions_by_tenant ON checkout_sessions
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::UUID);

CREATE POLICY price_snapshots_by_tenant ON price_snapshots
  USING (tenant_id = current_setting('app.current_tenant', true)::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::UUID);
