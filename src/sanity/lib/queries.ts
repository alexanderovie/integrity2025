import { defineQuery } from "next-sanity";

export const sanityPostSummariesQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(featured desc, publishedAt desc) {
      title,
      description,
      publishedAt,
      category,
      tags,
      featured,
      seoTitle,
      seoDescription,
      "slug": slug.current,
      mainImage,
      "bodyPreview": body[]{
        _type,
        children[]{
          _type,
          _key,
          text,
          marks
        }
      }
    }[$start...$end]
`);

export const sanityPostCountQuery = defineQuery(`
  count(*[_type == "post" && defined(slug.current)])
`);

export const sanityPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)]
    | order(featured desc, publishedAt desc) {
      title,
      description,
      publishedAt,
      category,
      tags,
      featured,
      seoTitle,
      seoDescription,
      "slug": slug.current,
      mainImage,
      body
    }
`);

export const sanityPostBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    title,
    description,
    publishedAt,
    category,
    tags,
    featured,
    seoTitle,
    seoDescription,
    "slug": slug.current,
    mainImage,
    body
  }
`);
