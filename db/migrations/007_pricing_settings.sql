-- Store pricing guardrails (custom quote min/max) in app_settings
INSERT INTO public.app_settings (clave, valor)
VALUES (
  'pricing',
  jsonb_build_object(
    'custom_price_min', 25,
    'custom_price_max', 5000
  )
)
ON CONFLICT (clave) DO UPDATE
SET valor = EXCLUDED.valor;
