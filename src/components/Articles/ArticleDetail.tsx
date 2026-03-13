'use client';
import { useMetaPixel } from "@/hooks/useMetaPixel";
import type { BlogPost } from "@/lib/blog";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";

type ArticleDetailProps = {
  post: BlogPost;
  content?: ReactNode;
};

const ArticleDetail = ({ post, content }: ArticleDetailProps) => {
  const { trackEvent } = useMetaPixel();

  // Track ViewContent event when article page is viewed
  useEffect(() => {
    if (post) {
      trackEvent('ViewContent', {
        content_name: post.frontmatter.title,
        content_category: 'Article',
        content_ids: [post.slug],
        value: 0,
        currency: 'USD',
      });
    }
  }, [post, trackEvent]);


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

  return (
    <section className="dark:bg-dark-gray">
      <div className="container">
        <div className="pt-24 lg:pt-32">
          <div className="py-12 xl:py-28 flex flex-col gap-6 sm:gap-10">
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
                <h1 className="font-semibold text-3xl md:text-4xl">{post.frontmatter.title} | Integrity Clean Solutions Blog</h1>
              </div>
              <div className="flex items-center">
                <div className="flex gap-2 pr-6 py-2 border-r border-gray/20">
                  <Image src={"/images/icon/duration-icon.svg"} alt="duration-icon" width={25} height={25} />
                  <p className="text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium">
                    {post.readingTime} min read
                  </p>
                </div>
                <div className="flex gap-2 px-6 py-2">
                  <Image src={"/images/icon/rating-star.svg"} alt="date-icon" width={25} height={25} />
                  <p className="text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium">
                    {shortDate}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col lg:flex-row justify-between gap-6 xl:gap-10">
              <div className="flex flex-col gap-5 sm:gap-8 w-full lg:flex-1 lg:max-w-[56rem]">
                {post.frontmatter.image && (
                  <div className="w-full h-[450px]">
                    <Image
                      src={post.frontmatter.image}
                      alt={post.frontmatter.title}
                      width={500}
                      height={400}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}

                <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                  {post.frontmatter.description}
                </p>
                <div className="flex flex-col gap-4">
                  <h6 className="font-semibold">Tags</h6>
                  <ul className="flex flex-col gap-3">
                    {post.frontmatter.tags.map((tag, index) => {
                      return (
                        <li key={index} className="flex items-center gap-2">
                          <Image src={"/images/icon/verified-icon.svg"} alt="verified-icon" width={24} height={24} />
                          <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                            {tag}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {content && (
                  <div className="flex flex-col gap-4">
                    <h6 className="font-semibold">Content</h6>
                    <div className="flex flex-col gap-2 md:gap-3">
                      {content}
                    </div>
                  </div>
                )}
              </div>
              <Sidebar post={post} publishedDate={publishedDate} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleDetail;
