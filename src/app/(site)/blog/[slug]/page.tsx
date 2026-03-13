import ArticleDetail from "@/components/Articles/ArticleDetail";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { renderPortableText } from "@/lib/blog/portableTextComponents";
import { SITE_URL_OBJECT } from "@/lib/urls/site";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

// Infer the components type from MDXRemote's expected props
type MDXComponents = ComponentProps<typeof MDXRemote>["components"];

// Custom MDX components for styling - consistent with site design
const mdxComponents: MDXComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-2xl font-bold md:text-3xl dark:text-white mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-2xl font-semibold dark:text-white mb-3 mt-8">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="text-xl font-semibold dark:text-white mb-3 mt-6">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="text-lg font-semibold dark:text-white mb-2 mt-4">
      {children}
    </h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-base md:text-lg text-secondary/80 dark:text-white/80 mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc list-outside space-y-3 ps-5 text-base md:text-lg text-secondary/80 dark:text-white/80 mb-4">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal list-outside space-y-3 ps-5 text-base md:text-lg text-secondary/80 dark:text-white/80 mb-4">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="ps-2">{children}</li>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      className="text-primary hover:text-deep-blue underline decoration-2 focus:outline-hidden focus:underline font-medium"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="text-center p-4 sm:px-7 my-6">
      <div className="text-xl font-medium text-secondary md:text-2xl md:leading-normal xl:text-2xl xl:leading-normal dark:text-white/80 [&_p]:mb-0">
        {children}
      </div>
    </blockquote>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
      {children}
    </pre>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- MDX content uses external images that may not be optimized */}
      <img
        src={src}
        alt={alt || ""}
        className="w-full object-cover rounded-xl"
      />
      {alt && (
        <figcaption className="mt-3 text-sm text-center text-gray-500 dark:text-neutral-500">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
};

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

  // Render MDX content on the server
  const content =
    resolvedPost.source === "sanity"
      ? renderPortableText(resolvedPost.portableText)
      : <MDXRemote source={resolvedPost.content || ""} components={mdxComponents} />;

  return (
    <>
      <ArticleDetail post={resolvedPost} content={content} />
    </>
  );
}
