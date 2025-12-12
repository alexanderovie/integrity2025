import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import type { ReactNode } from "react";
import { Share2, Heart, MessageCircle } from "lucide-react";

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
const mdxComponents = {
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
    <p className="text-base leading-normal text-secondary dark:text-white/80 mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc list-outside space-y-3 ps-5 text-base leading-normal text-secondary dark:text-white/80 mb-4">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal list-outside space-y-3 ps-5 text-base leading-normal text-secondary dark:text-white/80 mb-4">
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
      <div className="max-w-5xl px-4 pt-6 lg:pt-10 pb-12 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-4xl">
          {/* Avatar Media */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex w-full sm:items-center gap-x-5 sm:gap-x-3">
              <div className="shrink-0">
                <Image
                  src="/images/avatar/avatar_1.jpg"
                  alt="Integrity Clean Solutions"
                  width={48}
                  height={48}
                  className="size-12 rounded-full"
                />
              </div>

              <div className="grow">
                <div className="flex justify-between items-center gap-x-2">
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-neutral-200 block sm:mb-1">
                      Integrity Clean Solutions
                    </span>
                    <ul className="text-xs text-gray-500 dark:text-neutral-500">
                      <li className="inline-block relative pe-6 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-2 before:-translate-y-1/2 before:size-1 before:bg-gray-300 before:rounded-full dark:text-neutral-400 dark:before:bg-neutral-600">
                        {shortDate}
                      </li>
                      <li className="inline-block relative pe-6 last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-2 before:-translate-y-1/2 before:size-1 before:bg-gray-300 before:rounded-full dark:text-neutral-400 dark:before:bg-neutral-600">
                        {post.readingTime} min read
                      </li>
                    </ul>
                  </div>

                  {/* Button Group */}
                  <div>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.frontmatter.title)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2.5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    >
                      <svg
                        className="size-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                      </svg>
                      Tweet
                    </a>
                  </div>
                  {/* End Button Group */}
                </div>
              </div>
            </div>
          </div>
          {/* End Avatar Media */}

          {/* Content */}
          <div className="space-y-5 md:space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold md:text-3xl dark:text-white">
                {post.frontmatter.title}
              </h2>
              <p className="text-base leading-normal text-secondary dark:text-white/80">
                {post.frontmatter.description}
              </p>
            </div>

            {/* MDX Content */}
            <MDXRemote source={post.content} components={mdxComponents} />

            {/* Tags */}
            {post.frontmatter.tags.length > 0 && (
              <div>
                {post.frontmatter.tags.map((tag) => (
                  <a
                    key={tag}
                    href="#"
                    className="m-1 inline-flex items-center gap-1.5 py-2 px-3 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            )}
          </div>
          {/* End Content */}
        </div>
      </div>
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
