import ArticleDetail from "@/components/Articles/ArticleDetail";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { renderPortableText } from "@/lib/blog/portableTextComponents";
import { SITE_URL_OBJECT } from "@/lib/urls/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate static params for all blog posts at build time
 */
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Integrity Clean Solutions",
    };
  }

  const publishedTime = new Date(post.frontmatter.publishedAt).toISOString();

  return {
    metadataBase: SITE_URL_OBJECT,
    title: post.frontmatter.seoTitle || post.frontmatter.title,
    description: post.frontmatter.seoDescription || post.frontmatter.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.frontmatter.seoTitle || post.frontmatter.title,
      description: post.frontmatter.seoDescription || post.frontmatter.description,
      type: "article",
      publishedTime,
      authors: ["Integrity Clean Solutions"],
      tags: post.frontmatter.tags,
      images: post.frontmatter.image
        ? [
          {
            url: post.frontmatter.image,
            alt: post.frontmatter.title,
          },
        ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.seoTitle || post.frontmatter.title,
      description: post.frontmatter.seoDescription || post.frontmatter.description,
      images: post.frontmatter.image ? [post.frontmatter.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const resolvedPost: NonNullable<typeof post> = post;
  const content = renderPortableText(resolvedPost.portableText);

  return (
    <>
      <ArticleDetail post={resolvedPost} content={content} />
    </>
  );
}
