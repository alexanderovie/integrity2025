import { groq } from "next-sanity";

export const sanityPostsQuery = groq`
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
`;

export const sanityPostBySlugQuery = groq`
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
`;
