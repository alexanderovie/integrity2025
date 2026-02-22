'use client';

import { useReportWebVitals } from 'next/web-vitals';

type WebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const shouldLogWebVitals =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_WEB_VITALS_DEBUG === 'true';

const handleWebVitals: WebVitalsCallback = (metric) => {
  if (!shouldLogWebVitals) {
    return;
  }

  const roundedValue = Math.round(metric.value * 100) / 100;

  console.info('[WebVitals]', {
    id: metric.id,
    name: metric.name,
    value: roundedValue,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
};

export function WebVitals(): null {
  useReportWebVitals(handleWebVitals);
  return null;
}
