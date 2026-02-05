import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    qualities: [50, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    mdxRs: true,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    providerImportSource: "@mdx-js/react",
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
