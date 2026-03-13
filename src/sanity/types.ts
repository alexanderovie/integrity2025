export type SanityPortableTextBlock = {
  _type: string;
  children?: Array<{
    _type: string;
    text?: string;
  }>;
  style?: string;
  markDefs?: Array<{
    _key: string;
    _type: string;
    href?: string;
  }>;
};

export type SanityBlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  mainImage?: {
    alt?: string;
    asset?: {
      _ref?: string;
      _type?: string;
    };
  };
  body?: SanityPortableTextBlock[];
};
