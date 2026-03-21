# Sanity Publish and Revalidation Flow

## Production flow

1. An editor creates or updates a `post` in Sanity Studio.
2. Sanity stores the draft until the editor clicks `Publish`.
3. On publish, the document becomes publicly queryable in the `production` dataset.
4. Sanity sends a signed webhook to `https://integritycleansolutions.com/api/webhook/sanity`.
5. The webhook includes `x-vercel-protection-bypass` so Vercel Deployment Protection allows the request.
6. The Next.js route verifies the webhook signature with `SANITY_WEBHOOK_SECRET`.
7. The app revalidates:
   - `revalidateTag("blog-posts", "max")`
   - `revalidatePath("/blog")`
   - `revalidatePath("/blog/[slug]")` when a slug is present
8. Production serves the refreshed blog listing and article page.

## Required runtime inputs

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_WEBHOOK_SECRET`
- `REVALIDATE_SECRET`
- `VERCEL_AUTOMATION_BYPASS_SECRET`

## Operational checks

- Check the webhook endpoint health:
  - `https://integritycleansolutions.com/api/webhook/sanity`
- Check the contract API:
  - `https://integritycleansolutions.com/api/sanity/posts`
- Check the listing:
  - `https://integritycleansolutions.com/blog`

## Troubleshooting

- `Studio looks right but production is stale`
  - confirm the document is published, not draft-only
  - confirm the Sanity webhook attempt returned `2xx`
  - confirm Vercel bypass header is still configured in the webhook
- `Blog listing returns 500`
  - inspect Vercel logs for `ZodError` on Sanity payloads
  - check the latest post for malformed Portable Text blocks
- `Content updates but images do not`
  - verify the post has `mainImage.asset`
  - hard refresh once after a successful webhook if CDN image caching is suspected
