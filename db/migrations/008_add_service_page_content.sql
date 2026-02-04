ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS page_content JSONB,
  ADD COLUMN IF NOT EXISTS page_content_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

UPDATE public.services
SET seo_title = 'Commercial Cleaning Services in Orlando & Kissimmee | Integrity Clean Solutions',
    seo_description = 'Professional commercial cleaning across Orlando, Kissimmee, and Central Florida. OSHA-aware supervision, safe routines, and consistent results for offices, retail, hospitality, and professional facilities.',
    page_content = jsonb_build_object(
      'schema_version', 1,
      'intro', jsonb_build_array(
        'At Integrity Clean Solutions, we provide professional commercial cleaning services tailored to businesses across Orlando, Kissimmee, and Central Florida.',
        'Our operations are supervised by OSHA 30–certified management, ensuring safe practices, proper chemical handling, and consistent quality. We focus on general commercial and janitorial cleaning, delivering reliable results without overpromising regulated or specialized services.'
      ),
      'sections', jsonb_build_array(
        jsonb_build_object(
          'title', 'Office & Corporate Cleaning',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'HEPA vacuuming to reduce dust and allergens', 'description', 'Improves indoor air quality for teams and visitors.'),
            jsonb_build_object('title', 'Dusting and surface cleaning', 'description', 'Workstations, counters, and common areas.'),
            jsonb_build_object('title', 'Desk and workstation cleaning (no data handling)', 'description', 'Careful cleaning without touching sensitive materials.'),
            jsonb_build_object('title', 'Trash and recycling removal', 'description', 'Consistent daily or scheduled removal.'),
            jsonb_build_object('title', 'Restrooms and breakroom cleaning', 'description', 'Sanitized, stocked, and ready for staff use.')
          ),
          'notes', jsonb_build_array('Benefit: A healthier, professional environment that supports productivity and reduces sick days.')
        ),
        jsonb_build_object(
          'title', 'Retail Stores & Shopping Centers',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Floor cleaning (mopping, vacuuming)', 'description', 'Daily and high-traffic upkeep.'),
            jsonb_build_object('title', 'Shelves and display surface cleaning', 'description', 'Customer-facing areas kept spotless.'),
            jsonb_build_object('title', 'High-touch point cleaning', 'description', 'Counters, handles, and checkout zones.'),
            jsonb_build_object('title', 'Public restroom maintenance', 'description', 'Clean, stocked, and guest-ready.')
          ),
          'notes', jsonb_build_array('Adapted for high-traffic tourist areas in Orlando.')
        ),
        jsonb_build_object(
          'title', 'Restaurants & Bars (Non–Food Contact Areas Only)',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Dining areas and seating', 'description', 'Tables, chairs, and customer zones.'),
            jsonb_build_object('title', 'Bars and counters', 'description', 'Non food-contact surfaces only.'),
            jsonb_build_object('title', 'Floors and restrooms', 'description', 'Routine cleaning and reset.')
          ),
          'disclaimer', 'We do not perform deep kitchen cleaning or food-contact sanitation.'
        ),
        jsonb_build_object(
          'title', 'Hotels, Motels & Hospitality (Common Areas)',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Lobbies and reception areas', 'description', 'First impression spaces.'),
            jsonb_build_object('title', 'Hallways and elevators', 'description', 'Guest circulation routes.'),
            jsonb_build_object('title', 'Public restrooms', 'description', 'High-usage cleaning and restock.'),
            jsonb_build_object('title', 'Fitness rooms and exterior pool areas', 'description', 'Guest-facing amenities.')
          ),
          'notes', jsonb_build_array('Adapted for Florida conditions: sand, humidity, and high guest turnover.')
        ),
        jsonb_build_object(
          'title', 'Medical & Professional Offices (Non-Clinical Areas)',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Waiting rooms', 'description', 'Seating and common touchpoints.'),
            jsonb_build_object('title', 'Administrative offices', 'description', 'Non-clinical work areas.'),
            jsonb_build_object('title', 'Hallways and restrooms', 'description', 'Public and staff zones.')
          ),
          'disclaimer', 'No clinical, treatment, or patient-care areas.'
        ),
        jsonb_build_object(
          'title', 'Warehouses & Light Industrial Facilities',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Floor and aisle cleaning', 'description', 'Wide coverage and debris control.'),
            jsonb_build_object('title', 'Shelving and storage areas', 'description', 'Dust and residue management.'),
            jsonb_build_object('title', 'Restrooms and common spaces', 'description', 'Staff-facing areas.'),
            jsonb_build_object('title', 'General dust and debris control', 'description', 'Routine facility upkeep.')
          )
        ),
        jsonb_build_object(
          'title', 'Maintenance & Specialty Services',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Day Porter Services', 'description', 'Daytime maintenance support.'),
            jsonb_build_object('title', 'Move-In / Move-Out Cleaning', 'description', 'Turnover-ready spaces.'),
            jsonb_build_object('title', 'Post-Event Cleaning', 'description', 'Fast reset after events.'),
            jsonb_build_object('title', 'Low-pressure exterior washing', 'description', 'Exterior upkeep where accessible.'),
            jsonb_build_object('title', 'Interior glass & window cleaning', 'description', 'Accessible areas only.')
          )
        ),
        jsonb_build_object(
          'title', 'Optional Add-On Services (Within Scope)',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Deep floor cleaning', 'description', 'Tile, vinyl, and epoxy surfaces.'),
            jsonb_build_object('title', 'Carpet & upholstery cleaning', 'description', 'Basic extraction.'),
            jsonb_build_object('title', 'General disinfection of high-touch areas', 'description', 'EPA-approved products.'),
            jsonb_build_object('title', 'Preventive moisture & mildew surface cleaning', 'description', 'Routine prevention.'),
            jsonb_build_object('title', 'Sanitization', 'description', 'General surface sanitization.')
          ),
          'disclaimer', 'No claims of hospital-grade, regulatory validation, or certified remediation.'
        ),
        jsonb_build_object(
          'title', 'Services We Do NOT Provide',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Commercial kitchen deep sanitation', 'description', 'No food-grade validation.'),
            jsonb_build_object('title', 'Biohazard or hazardous waste cleaning', 'description', 'Not within scope.'),
            jsonb_build_object('title', 'HVAC or duct cleaning', 'description', 'Specialized service excluded.'),
            jsonb_build_object('title', 'Regulated cannabis, pharmaceutical, or food-processing sanitation', 'description', 'Not provided.'),
            jsonb_build_object('title', 'Asbestos, lead, or heavy post-construction cleaning', 'description', 'Not provided.')
          )
        ),
        jsonb_build_object(
          'title', 'Why Choose Integrity Clean Solutions',
          'items', jsonb_build_array(
            jsonb_build_object('title', 'OSHA 30–certified supervision', 'description', 'Safety-first oversight.'),
            jsonb_build_object('title', 'Safety-focused cleaning protocols', 'description', 'Consistent quality standards.'),
            jsonb_build_object('title', 'Florida climate–adapted practices', 'description', 'Humidity and sand readiness.'),
            jsonb_build_object('title', 'Eco-conscious, EPA-approved products', 'description', 'Professional-safe cleaning solutions.'),
            jsonb_build_object('title', 'Flexible scheduling', 'description', 'Minimize business disruption.'),
            jsonb_build_object('title', 'Satisfaction-based adjustments', 'description', 'We follow up and refine.' )
          )
        )
      ),
      'cta', jsonb_build_object(
        'heading', 'Looking for a reliable commercial cleaning partner in Orlando or Kissimmee?',
        'text', 'Request your free on-site or virtual quote today.',
        'button_text', 'Request a free quote',
        'button_link', '/quote/commercial-cleaning'
      )
    ),
    page_content_updated_at = now(),
    published_at = now()
WHERE slug = 'commercial-cleaning';
