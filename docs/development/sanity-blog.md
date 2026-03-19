# Sanity blog setup

The blog now supports a production-friendly Sanity workflow for non-technical editors.

## What changed

- `/studio` hosts the embedded Sanity Studio.
- Blog pages read from Sanity as the only source of truth.
- `/api/sanity/posts` exposes a validated read contract for smoke tests and operational checks.

## Required env vars

Add these to Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

## Owner workflow

1. Open `/studio`
2. Create a new `Blog Post`
3. Fill in title, slug, excerpt, image alt text, category, tags, and content
4. Publish the post

## Operational notes

- `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are required in every environment.
- The Sanity client uses tag-based cache revalidation for the blog via the webhook endpoint.
- Blog payloads are runtime-validated before rendering or exposing them through the contract API.

## Production standard

- Keep Sanity as the only source of truth for blog content.
- Generate types with `pnpm sanity:typegen` whenever the schema or GROQ queries change.
- Revalidate by tag from Sanity webhooks instead of relying on short polling windows.
- Keep `/api/sanity/posts` as a contract endpoint for smoke tests and operational debugging.
- Require publish-ready editorial validation in Studio: title, excerpt, slug, tags, alt text, and content body.

## Scalability checklist

1. Use Vercel Preview as the release gate for content model changes and webhook changes.
2. Keep blog reads cached with a single shared tag (`blog-posts`) and invalidate only on publish/update/delete.
3. Use `useCdn: false` for the revalidated app queries and let Sanity CDN handle image delivery separately.
4. Add smoke coverage against `/blog`, `/blog/[slug]`, `/api/sanity/posts`, and `/api/webhook/sanity` before promoting to production.
5. Run `pnpm sanity:typegen`, `pnpm run type-check`, and `pnpm run build` in CI so schema/query drift is caught before deploy.
6. Avoid enabling drafts or preview delivery publicly unless you also add authenticated draft mode and isolated preview routes.
