import type { ComponentPropsWithoutRef, ElementType } from "react";

/**
 * MDXComponents type definition
 * Shared type for MDX component definitions across the application
 * Based on Next.js and MDX official patterns
 *
 * This type allows mapping HTML elements to React components,
 * enabling custom styling and behavior for MDX content.
 */
export type MDXComponents = {
  [K in keyof JSX.IntrinsicElements]?: ElementType<ComponentPropsWithoutRef<K>>;
} & {
  [key: string]: ElementType<any> | undefined;
};
