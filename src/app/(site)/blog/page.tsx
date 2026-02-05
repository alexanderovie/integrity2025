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

  return (
    <main>
      <div className="relative pt-24 lg:pt-32">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner/hero-bg.png"
            alt="Integrity Clean Solutions Blog - Cleaning Tips & Insights"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container relative z-10">
          <div className="relative flex flex-col gap-10 lg:gap-16 xl:gap-20 pt-14 lg:pt-28 pb-24 lg:pb-32 z-10">
            <div className="flex flex-col items-center gap-5 lg:gap-10 text-center">
              <div className="flex flex-col gap-3 lg:max-w-2xl w-full items-center">
                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                  <p className="font-semibold text-white">Integrity Cleaning</p>
                </div>
                <h1 className="text-white text-2xl font-bold md:text-4xl md:leading-tight">
                  Cleaning Tips & Insights Blog | Integrity Clean Solutions
                </h1>
              </div>
              <div className="max-w-2xl">
                <p className="text-white text-lg">
                  Stay in the know with expert cleaning tips and insights from industry professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Blog */}
      <div className="bg-offwhite-warm dark:bg-dark-gray py-16 lg:py-20">
        <div className="container">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-neutral-400">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
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
                    className="group relative flex flex-col w-full min-h-72 md:min-h-80 xl:min-h-96 rounded-xl hover:shadow-lg focus:outline-hidden focus:shadow-lg transition md:col-span-2 xl:col-span-2"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex flex-col w-full h-full"
                    >
                    <div className="flex-auto p-4 md:p-6">
                      <h3 className="text-xl text-white/90 group-hover:text-white line-clamp-2">
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
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white line-clamp-2">
                      {post.frontmatter.title}
                    </h3>
                    <p className="mt-3 text-gray-800 dark:text-neutral-200 line-clamp-3">
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
      </div>
      {/* End Card Blog */}
    </main>
  );
}
