# Neon Timeout Audit Guide

## Why this exists

The app now uses controlled fallbacks when service catalog queries time out during build or prerender. This protects production pages, but it should not hide an unresolved database latency problem.

## Current fallback surfaces

- `src/lib/services/pricing.ts`
- `src/lib/services/featured-services.ts`
- `src/lib/services/catalog.ts`

Each fallback logs a structured `fallback_activated` event.

## What to measure next

1. Query duration for:
   - pricing services query
   - featured services query
   - services catalog query
2. Whether timeouts happen only during build or also during runtime.
3. Whether the issue is connection startup, TLS negotiation, or query latency.

## Recommended investigation steps

1. Compare Vercel build region vs Neon region.
2. Check whether pooled connections are being exhausted during prerender concurrency.
3. Test the same queries with a lower worker count or dynamic rendering for problem pages.
4. Consider moving non-critical service catalog sections to runtime rendering or precomputed JSON if build-time DB access stays unstable.
5. Add query timing metrics before and after `query()` in `src/lib/db/neon.ts` if the timeout persists.

## Done criteria

- Builds complete without using fallback for core service pages under normal conditions.
- Fallback remains only as a resilience layer, not the default path.
