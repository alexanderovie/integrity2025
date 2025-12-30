import Image, { type ImageProps } from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

// Infer the components type from MDXRemote's expected props
type MDXComponents = ComponentProps<typeof MDXRemote>["components"];

/**
 * Global MDX components
 * These components are used by @next/mdx for all MDX files
 * Customize them to match your design system
 * Following @next/mdx official documentation pattern
 */
export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    // Customize built-in components
    img: (props) => {
      const { alt, ...rest } = props;
      return (
        <Image
          sizes="100vw"
          className="image-responsive"
          {...(rest as ImageProps)}
          alt={alt || ""}
        />
      );
    },
    // Allow overrides and pass through other components
    ...components,
  };
}
