# Sanity blog setup

The blog now supports a production-friendly Sanity workflow for non-technical editors.

## What changed

- `/studio` hosts the embedded Sanity Studio.
- Blog pages read from Sanity first.
- If Sanity is not configured, the site falls back to the current local MDX posts.

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

## Recommended next step

After the Sanity project is connected and posts are migrated, remove the MDX fallback if you want Sanity to become the only source of truth.
