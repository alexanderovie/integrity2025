export const BASE_URL = 'https://integritycleansolutions.com';
export const API_BASE = `${BASE_URL}/api`;

export const EXPECTED_TITLES = {
  home: /Integrity Clean Solutions/,
  about: /About Us/,
  services: /Cleaning Services/,
  contact: /Contact/,
  blog: /Blog/,
  quote: /Free Cleaning Quote/,
};

export const REQUIRED_CONTENT = {
  home: ['cleaning'],
  about: ['cleaning'],
  services: ['Cleaning Service'],
  contact: ['4700 Millenia'],
  quote: ['Booking Summary', 'Service'],
  blog: ['Cleaning'],
};

export const SERVICES = [
  'regular-cleaning',
  'deep-cleaning',
  'move-in-out-cleaning',
  'carpet-cleaning',
  'airbnb-cleaning',
  'commercial-cleaning',
  'post-construction-cleaning',
] as const;

export const SERVICE_AREAS = [
  'orlando',
  'kissimmee',
  'winter-park',
  'lake-nona',
  'celebration',
] as const;

export const CRITICAL_APIS = [
  '/api/catalog',
  '/api/addons',
  '/api/prices',
] as const;
