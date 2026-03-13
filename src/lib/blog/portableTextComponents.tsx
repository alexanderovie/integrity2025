import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { urlForSanityImage } from "@/sanity/lib/image";
import type { SanityPortableTextBlock } from "@/sanity/types";

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="mb-4 text-2xl font-bold md:text-3xl dark:text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 text-2xl font-semibold dark:text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-6 text-xl font-semibold dark:text-white">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-4 text-lg font-semibold dark:text-white">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 p-4 text-center sm:px-7">
        <div className="text-xl font-medium text-secondary dark:text-white/80 md:text-2xl">
          {children}
        </div>
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="mb-4 text-base text-secondary/80 dark:text-white/80 md:text-lg">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc list-outside space-y-3 ps-5 text-base text-secondary/80 dark:text-white/80 md:text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal list-outside space-y-3 ps-5 text-base text-secondary/80 dark:text-white/80 md:text-lg">
        {children}
      </ol>
    ),
  },
  listItem: ({ children }) => <li className="ps-2">{children}</li>,
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : undefined;
      const isExternal = href?.startsWith("http");

      return (
        <a
          href={href}
          className="font-medium text-primary underline decoration-2 hover:text-deep-blue focus:outline-hidden focus:underline"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono dark:bg-gray-800">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlForSanityImage(value)?.width(1400).fit("max").url();
      const alt = typeof value?.alt === "string" ? value.alt : "";

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="my-6">
          <Image
            src={imageUrl}
            alt={alt}
            width={1400}
            height={900}
            className="w-full rounded-xl object-cover"
          />
          {alt ? (
            <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-neutral-500">
              {alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export const renderPortableText = (
  value: SanityPortableTextBlock[] | undefined,
): ReactNode => {
  if (!value?.length) {
    return null;
  }

  return <PortableText value={value} components={components} />;
};
