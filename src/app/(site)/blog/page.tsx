import { getAllPosts } from "@/lib/blog";
import { DynamicBackground } from "@/lib/styles/dynamic-background";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Cleaning Tips Blog Orlando | Integrity Clean Solutions",
  description: "Discover expert cleaning tips, guides, and insights from Integrity Clean Solutions in Orlando, FL. Learn about deep cleaning vs regular cleaning, move-out cleaning guides, eco-friendly cleaning products, Airbnb cleaning strategies, and professional cleaning best practices. Stay informed with industry insights, maintenance tips, and proven techniques to keep your home or office spotless. Whether you're a homeowner, property manager, or business owner, our blog provides valuable resources to help you maintain a clean, healthy, and welcoming environment. From residential cleaning tips to commercial cleaning strategies, we cover everything you need to know about professional cleaning services in Orlando and Central Florida.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Cleaning Tips & Insights Blog | Integrity Clean Solutions",
    description: "Expert cleaning tips, guides, and insights for homeowners and businesses in Orlando. Learn professional cleaning techniques, maintenance strategies, and industry best practices.",
    type: "website",
    url: "https://integritycleansolutions.com/blog",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "https://integritycleansolutions.com/images/services/regular-cleaning.jpg",
        alt: "Regular Cleaning Service in Orlando",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleaning Tips & Insights Blog | Integrity Clean Solutions",
    description: "Expert cleaning tips, guides, and insights for homeowners and businesses in Orlando. Learn professional cleaning techniques and best practices.",
    images: ["https://integritycleansolutions.com/images/services/regular-cleaning.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      <div className="container pt-14 lg:pt-28 pb-10 lg:pb-14">
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
                  <DynamicBackground
                    key={post.slug}
                    imageUrl={post.frontmatter.image}
                    className="group relative flex flex-col w-full min-h-60 rounded-xl hover:shadow-lg focus:outline-hidden focus:shadow-lg transition"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex flex-col w-full h-full"
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
                  </DynamicBackground>
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
