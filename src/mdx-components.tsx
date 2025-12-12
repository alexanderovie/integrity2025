import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";

/**
 * Global MDX components
 * These components are used by @next/mdx for all MDX files
 * Customize them to match your design system
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Customize built-in components
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        {...(props as ImageProps)}
        alt={props.alt || ""}
      />
    ),
    // Allow overrides and pass through other components
    ...components,
  };
}
