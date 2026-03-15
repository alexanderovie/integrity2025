# Commercial Landing Strategy

This document explains the strategy behind `src/app/(landing)/commercial-cleaning-orlando/page.tsx` so any future LLM or engineer can understand the intent quickly.

## Goal

Create a focused, conversion-oriented landing page for high-intent commercial cleaning searches without changing the homepage first.

Primary target: `commercial cleaning service Orlando FL`

Secondary cluster terms intentionally supported in copy and sections:

- `office cleaning service small business Orlando FL`
- `nightly office cleaning service Orlando area`
- `medical office cleaning service Orlando FL`
- `weekly janitorial service Orlando FL area`
- `affordable commercial cleaning Orlando FL`
- `commercial disinfection service Orlando area`
- `medical office sanitization service Orlando`
- `restaurant sanitization service Orlando area`
- `daycare sanitization cleaning service Orlando FL`

## Why a Separate Landing Instead of Reworking `/`

This follows a safe rollout pattern used by strong product and marketing teams:

1. Launch a focused landing page for one commercial intent cluster.
2. Validate UX, conversion flow, and SEO behavior independently.
3. Reuse winning sections later on the homepage if results are good.

This avoids unnecessary churn on `/` and keeps homepage risk low.

## Current Baseline

The first implementation attempt introduced a more custom commercial layout.

That version was intentionally rolled back as the visual result drifted too far from the homepage. The current baseline for `/commercial-cleaning-orlando` now reuses the homepage composition directly so the business can review a familiar UI first.

This is deliberate.

- keep the visual language identical to `/`
- validate the route, metadata, and SEO targeting first
- adapt sections incrementally after stakeholder review

## Route

- Public URL: `/commercial-cleaning-orlando`
- Page file: `src/app/(landing)/commercial-cleaning-orlando/page.tsx`
- Main UI baseline for `/`: `src/components/Home/HomePageSections.tsx`
- Main UI baseline for landing clone: `src/components/Landing/CommercialLandingSections.tsx`

The landing uses its own route-group layout so it can ship a dedicated conversion header without changing the global site header.

## Reuse Strategy

The landing currently reuses the homepage composition entirely via:

- `src/components/Home/HomePageSections.tsx`

That shared component includes:

- `HeroSection`
- `Promobar`
- `ServiceOfferings`
- `CleaningHighlight`
- `ExcepServices`
- `CustomerFeedbackModern`
- `Pricing`
- `Ourwork`
- `FaqSection`
- `UserImpact`

This gives two benefits:

- homepage and landing stay visually aligned
- future changes can be made section-by-section without redesigning from zero

Future customization should be additive and gradual.

## Planned UX Evolution

The target evolution for this landing is still:

1. Hero with local commercial positioning
2. Immediate trust strip
3. Intent framing / differentiators
4. Industry-specific relevance cards
5. Existing services section
6. 3-step process
7. Existing social proof and pricing
8. Existing FAQ and final CTA

But these changes should now be applied incrementally on top of the cloned homepage baseline.

## CTA Strategy

Primary CTA across the landing: `/quote`

Secondary CTA: `/services/commercial-cleaning`

Reason:

- `/quote` is the highest-conversion destination.
- `/services/commercial-cleaning` supports visitors who need more detail before requesting pricing.

## SEO Pattern

The landing includes page-level:

- metadata
- Open Graph data
- Twitter card data
- `Service` JSON-LD
- `FAQPage` JSON-LD

This is deliberate and should remain page-specific for future service landing pages.

## What This Landing Is Not

This page is **not** the final destination for all commercial keyword clusters.

Future dedicated pages may still be appropriate for:

- sanitization / disinfection intent
- facade / exterior cleaning intent
- medical-specific commercial intent

Recommended future rollout:

1. `/commercial-cleaning-orlando`
2. `/commercial-sanitization-orlando`
3. `/commercial-facade-cleaning-orlando`

## Sanity / Content Notes

This landing is code-driven, not Sanity-driven.

Reason:

- it is a strategic conversion page
- it benefits from stable structure and controlled rollout
- it should not depend on editorial changes for launch readiness

If the business later wants CMS control for these landing pages, create a dedicated landing-page schema instead of reusing blog content models.

## Production Checklist

Before calling this landing complete:

1. verify all CTA buttons resolve to `/quote`
2. verify mobile spacing and sticky header overlap
3. run `pnpm run build`
4. run smoke checks against preview
5. confirm metadata and JSON-LD are present in rendered HTML
6. verify analytics events are firing for CTA clicks if event tracking is added

## Future LLM Guidance

If you are extending this pattern:

- prefer creating new landing pages under `src/app/(site)/...`
- reuse existing sections first before creating new design systems
- keep CTA hierarchy simple
- keep local-intent keywords natural, never stuffed
- add page-specific metadata and JSON-LD every time
- do not overwrite `/` until the focused landing has been validated
