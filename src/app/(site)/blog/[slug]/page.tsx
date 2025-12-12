import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import type { ReactNode } from "react";
import { Share2, Heart, MessageCircle } from "lucide-react";

// Infer the components type from MDXRemote's expected props
type MDXComponents = ComponentProps<typeof MDXRemote>["components"];

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate static params for all blog posts at build time
 */
export async function generateStaticParams() {
  const posts = getAllPosts();
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
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const publishedTime = new Date(post.frontmatter.publishedAt).toISOString();

  return {
    title: `${post.frontmatter.title} | Integrity Clean Solutions`,
    description: post.frontmatter.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
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
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: post.frontmatter.image ? [post.frontmatter.image] : [],
    },
  };
}

/**
 * Custom MDX components for styling - consistent with site design
 * Following next-mdx-remote official documentation pattern
 */
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
      <p className="text-xl font-medium text-secondary md:text-2xl md:leading-normal xl:text-2xl xl:leading-normal dark:text-white/80">
        {children}
      </p>
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
      <img
        src={src}
        alt={alt}
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(
    post.frontmatter.publishedAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const shortDate = new Date(
    post.frontmatter.publishedAt
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Share URL for social media
  const shareUrl = `https://integritycleansolutions.com/blog/${slug}`;

  return (
    <main className="pt-24 lg:pt-32">
      {/* Blog Article */}
      <section className="dark:bg-dark-gray">
        <div className="container">
          <div className="py-12 xl:py-28 flex flex-col gap-6 sm:gap-10">
            {/* Header Section - Similar to Services */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Image src={"/images/icon/home-icon.svg"} alt="home-icon" width={28} height={28} />
                  <p className="font-semibold text-secondary/50 dark:text-white/50">
                    <Link href={"/"} className="text-light-olive">
                      Home /
                    </Link>
                    <Link href={"/blog"} className="text-light-olive">
                      Blog /
                    </Link>
                    {post.frontmatter.title}
                  </p>
                </div>
                <h1 className="font-semibold text-3xl md:text-4xl">{post.frontmatter.title}</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2 pr-6 py-2 border-r border-gray/20">
                  <Image src={"/images/icon/duration-icon.svg"} alt="duration-icon" width={25} height={25} />
                  <p className="text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium">
                    {post.readingTime} min read
                  </p>
                </div>
                <div className="flex gap-2 px-6 py-2">
                  <span className="text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium">
                    {shortDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section - Similar to Services Layout */}
            <div className="relative flex flex-col lg:flex-row justify-between gap-6 xl:gap-10">
              <div className="flex flex-col gap-5 sm:gap-8 w-full lg:max-w-4xl">
                {/* Description */}
                <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                  {post.frontmatter.description}
                </p>

                {/* MDX Content */}
                <MDXRemote source={post.content} components={mdxComponents} />

                {/* Tags */}
                {post.frontmatter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.frontmatter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Blog Article */}

      {/* Sticky Share Group */}
      <div className="sticky bottom-6 inset-x-0 text-center">
        <div className="inline-block bg-white shadow-md rounded-full py-3 px-4 dark:bg-neutral-800">
          <div className="flex items-center gap-x-1.5">
            {/* Like Button */}
            <button
              type="button"
              className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
            >
              <Heart className="shrink-0 size-4" />
              <span>0</span>
            </button>

            <div className="block h-3 border-e border-gray-300 mx-3 dark:border-neutral-600"></div>

            {/* Comment Button */}
            <button
              type="button"
              className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
            >
              <MessageCircle className="shrink-0 size-4" />
              <span>0</span>
            </button>

            <div className="block h-3 border-e border-gray-300 mx-3 dark:border-neutral-600"></div>

            {/* Share Button */}
            <button
              type="button"
              className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-hidden focus:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
            >
              <Share2 className="shrink-0 size-4" />
              Share
            </button>
          </div>
        </div>
      </div>
      {/* End Sticky Share Group */}
    </main>
  );
}
