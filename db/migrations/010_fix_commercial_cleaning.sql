-- Fix commercial-cleaning rating and duration
UPDATE public.services
SET rating = '4.8', duration = '4-6 hours'
WHERE slug = 'commercial-cleaning';
