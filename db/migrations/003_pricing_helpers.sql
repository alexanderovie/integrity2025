-- Agrega helpers y columnas necesarias para el pricing endpoint
CREATE OR REPLACE FUNCTION set_app_current_tenant(tenant_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

ALTER TABLE IF EXISTS plan_extra_items
  ADD COLUMN IF NOT EXISTS item_key TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS plan_prices
  ADD COLUMN IF NOT EXISTS interval_count INT NOT NULL DEFAULT 1;
