import { getAllPosts } from "@/lib/blog";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Integrity Clean Solutions",
  description: "Tips, guides, and insights about professional cleaning services in Orlando",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  // Debug: Log posts count
  console.log("Blog posts count:", posts.length);
  if (posts.length > 0) {
    console.log("First post:", posts[0]);
  }

  return (
    <main className="pt-24 lg:pt-32">
      {/* Card Blog */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        {/* Title */}
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h1 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">
            Cleaning Tips & Insights Blog | Integrity Clean Solutions
          </h1>
          <p className="mt-1 text-gray-600 dark:text-neutral-400">
            Stay in the know with insights from industry experts.
          </p>
        </div>
        {/* End Title */}

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-neutral-400">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        ) : (
          /* Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => {
              // Featured post gets special treatment (first post or if marked as featured)
              const isFeatured = post.frontmatter.featured || index === 0;

              // If it's the featured post and has an image, use the hero card style
              if (isFeatured && post.frontmatter.image && index === 0) {
                return (
                  /* Card */
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group relative flex flex-col w-full min-h-60 bg-center bg-cover rounded-xl hover:shadow-lg focus:outline-hidden focus:shadow-lg transition"
                    style={{
                      backgroundImage: `url(${post.frontmatter.image})`,
                    }}
                  >
                    <div className="flex-auto p-4 md:p-6">
                      <h3 className="text-xl text-white/90 group-hover:text-white">
                        <span className="font-bold">{post.frontmatter.title}</span>
                      </h3>
                    </div>
                    <div className="pt-0 p-4 md:p-6">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-white/70 group-focus:text-white/70">
                        Visit the site
                        <ChevronRight className="shrink-0 size-4" />
                      </div>
                    </div>
                  </Link>
                  /* End Card */
                );
              }

              // Regular card style
              return (
                /* Card */
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col focus:outline-hidden"
                >
                  <div className="relative pt-[50%] sm:pt-[70%] rounded-xl overflow-hidden">
                    {post.frontmatter.image ? (
                      <Image
                        src={post.frontmatter.image}
                        alt={post.frontmatter.title}
                        fill
                        className="size-full absolute top-0 start-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-xl"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="size-full absolute top-0 start-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                        <span>No Image</span>
                      </div>
                    )}
                    {post.frontmatter.featured && (
                      <span className="absolute top-0 end-0 rounded-se-xl rounded-es-xl text-xs font-medium bg-gray-800 text-white py-1.5 px-3 dark:bg-neutral-900">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-7">
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white">
                      {post.frontmatter.title}
                    </h3>
                    <p className="mt-3 text-gray-800 dark:text-neutral-200">
                      {post.frontmatter.description}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 group-hover:underline group-focus:underline font-medium dark:text-blue-500">
                      Read more
                      <ChevronRight className="shrink-0 size-4" />
                    </p>
                  </div>
                </Link>
                /* End Card */
              );
            })}
          </div>
          /* End Grid */
        )}
      </div>
      {/* End Card Blog */}
    </main>
  );
}
