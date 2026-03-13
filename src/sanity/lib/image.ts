import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "@/sanity/lib/client";

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export const urlForSanityImage = (source: unknown) => {
  if (!builder) {
    return null;
  }

  return builder.image(source as SanityImageSource);
};
