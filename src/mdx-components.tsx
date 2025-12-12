import Image, { type ImageProps } from "next/image";

/**
 * Global MDX components
 * These components are used by @next/mdx for all MDX files
 * Customize them to match your design system
 * Following @next/mdx official documentation pattern
 */
export function useMDXComponents(components: Record<string, React.ComponentType>): Record<string, React.ComponentType> {
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
