import type {
  SanityPostBySlugQueryResult,
  SanityPostCountQueryResult,
  SanityPostSummariesQueryResult,
  SanityPostsQueryResult,
} from "../../sanity.types";

export type SanityPortableTextSpan = {
  _key?: string;
  _type: string;
  text?: string;
  marks?: string[] | null;
};

export type SanityPortableTextLinkMark = {
  _key: string;
  _type: string;
  href?: string;
};

export type SanityPortableTextBlock = {
  _key?: string;
  _type: string;
  children?: SanityPortableTextSpan[];
  style?: string;
  listItem?: string;
  level?: number;
  markDefs?: SanityPortableTextLinkMark[];
  alt?: string;
  asset?: {
    _ref?: string;
    _id?: string;
    _type?: string;
  };
};

export type SanityBlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  tags: string[];
  featured?: boolean | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  mainImage?: {
    alt?: string;
    asset?: {
      _ref?: string;
      _id?: string;
      _type?: string;
    };
  } | null;
  body: SanityPortableTextBlock[];
};

export type SanityBlogPostSummary = Omit<SanityBlogPost, "body"> & {
  bodyPreview?: SanityPortableTextBlock[];
};

export type SanityGeneratedBlogPost = Exclude<SanityPostBySlugQueryResult, null>;
export type SanityGeneratedBlogPosts = SanityPostsQueryResult;
export type SanityGeneratedBlogPostResult = SanityPostBySlugQueryResult;
export type SanityGeneratedBlogPostSummaries = SanityPostSummariesQueryResult;
export type SanityGeneratedBlogPostCount = SanityPostCountQueryResult;
