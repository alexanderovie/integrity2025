import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "@/sanity/lib/client";

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export const urlForSanityImage = (source: unknown) => {
  if (!builder) {
    return null;
  }

  // Validar que el source tenga un asset válido
  // El source debe tener asset._ref o asset._id para poder generar la URL
  if (!source || typeof source !== 'object') {
    return null;
  }

  const imageSource = source as Record<string, unknown>;
  
  // Verificar si tiene asset con _ref o _id
  const asset = imageSource.asset as Record<string, unknown> | undefined;
  if (!asset || (!asset._ref && !asset._id)) {
    return null;
  }

  return builder.image(source as SanityImageSource);
};
