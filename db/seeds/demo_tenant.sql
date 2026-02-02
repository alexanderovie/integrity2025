-- Semilla que crea un tenant demo y un plan base
INSERT INTO tenants (id, name, subdomain, stripe_connected_account_id, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Tenant',
  'demo',
  'acct_demo123456',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Plan de limpieza regular
INSERT INTO plans (id, tenant_id, stripe_product_id, service_slug, plan_key, name, description, category, display_order, features, limits, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'prod_demo_regular',
  'regular-cleaning',
  'regular_cleaning',
  'Limpieza Regular Demo',
  'Carga base para pruebas',
  'residential',
  1,
  '{"spray-cleaning": true, "deep-dust": false}'::JSONB,
  '{"visits_per_month": 4, "max_workers": 3}'::JSONB,
  '{}'::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- Price base
INSERT INTO plan_prices (id, plan_id, stripe_price_id, lookup_key, price_type, unit_amount, currency, interval, interval_count, billing_scheme, metadata, active)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000010',
  'price_demo_regular_monthly',
  'regular_cleaning_month',
  'base',
  15000,
  'usd',
  'month',
  1,
  'per_unit',
  '{}'::JSONB,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Extra opcional
INSERT INTO plan_extra_items (id, tenant_id, plan_id, plan_price_id, item_key, name, description, stripe_price_id, rules, amount_override, display_order, currency)
VALUES (
  '00000000-0000-0000-0000-000000000200',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000100',
  'interior_windows',
  'Ventanas interiores',
  'Limpieza adicional de cristales interiores',
  'price_demo_extra_windows',
  '{"eligible_when":{"price_type":"base"}}'::JSONB,
  2500
  1,
  'usd'
)
ON CONFLICT (id) DO NOTHING;
