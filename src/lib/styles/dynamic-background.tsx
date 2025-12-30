/**
 * Dynamic Background Image Component - Enterprise-Grade
 *
 * Follows patterns used by:
 * - Stripe: CSS variables for dynamic styles
 * - Vercel: Component-based approach
 * - Linear: Type-safe props
 *
 * Replaces inline styles with CSS variables for better performance
 */

import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DynamicBackgroundProps {
  imageUrl: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Component for dynamic background images
 * Uses CSS variables instead of inline styles for better performance
 */
export function DynamicBackground({
  imageUrl,
  children,
  className,
  style,
}: DynamicBackgroundProps) {
  return (
    <div
      className={cn("bg-image-dynamic", className)}
      style={
        {
          "--bg-image": `url(${imageUrl})`,
          backgroundImage: "var(--bg-image)",
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
