-- Función que construye un catálogo consolidado de pricing usando el tenant actual
CREATE OR REPLACE FUNCTION pricing_catalog()
RETURNS jsonb AS $$
DECLARE
  tenant_uuid uuid := current_setting('app.current_tenant', true)::uuid;
  plans_json jsonb;
  last_updated timestamptz;
BEGIN
  IF tenant_uuid IS NULL THEN
    RAISE EXCEPTION 'app.current_tenant is not set';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'service_slug', p.service_slug,
      'plan_key', p.plan_key,
      'name', p.name,
      'description', p.description,
      'category', p.category,
      'display_order', p.display_order,
      'active', p.active,
      'features', p.features,
      'limits', p.limits,
      'metadata', p.metadata,
      'prices', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pr.id,
            'stripe_price_id', pr.stripe_price_id,
            'lookup_key', pr.lookup_key,
            'price_type', pr.price_type,
            'interval', pr.interval,
            'interval_count', pr.interval_count,
            'unit_amount', pr.unit_amount,
            'currency', pr.currency,
            'active', pr.active
          )
          ORDER BY pr.created_at ASC
        ) FROM plan_prices pr
        WHERE pr.plan_id = p.id AND pr.active = TRUE
      ), '[]'::jsonb),
      'extras', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ei.id,
            'key', ei.item_key,
            'name', ei.name,
            'description', ei.description,
            'unit_amount', COALESCE(ei.amount_override, 0),
            'currency', ei.currency,
            'active', ei.active
          )
          ORDER BY ei.display_order ASC, ei.created_at ASC
        ) FROM plan_extra_items ei
        WHERE ei.plan_id = p.id AND ei.active = TRUE
      ), '[]'::jsonb)
    )
    ORDER BY p.display_order ASC, p.created_at ASC
  )
  INTO plans_json
  FROM plans p
  WHERE p.tenant_id = tenant_uuid AND p.active = TRUE;

  SELECT MAX(p.updated_at)
  INTO last_updated
  FROM plans p
  WHERE p.tenant_id = tenant_uuid;

  RETURN jsonb_build_object(
    'tenant_id', tenant_uuid,
    'currency_default', 'usd',
    'updated_at', COALESCE(to_char(last_updated AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')),
    'plans', COALESCE(plans_json, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
