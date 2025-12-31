
import { services } from "@/app/api/services";
import ServicesDetail from "@/components/Services/ServicesDetail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: ServicePageProps
): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found | Integrity Clean Solutions",
    };
  }

  const metadataBase = new URL("https://integritycleansolutions.com");
  const serviceUrl = `${metadataBase}/services/${slug}`;
  const serviceImage = service.thumbnail_img.startsWith("http")
    ? service.thumbnail_img
    : `${metadataBase}${service.thumbnail_img}`;

  // Ensure description is between 120-300 characters for optimal SEO
  const description = service.description.length > 300
    ? service.description.substring(0, 297) + "..."
    : service.description.length < 120
    ? service.description + " Professional cleaning services in Orlando, FL."
    : service.description;

  return {
    metadataBase,
    title: service.slug === "deep-cleaning"
      ? "Deep Cleaning | Orlando | Integrity Clean Solutions"
      : service.slug === "regular-cleaning"
      ? "Regular Cleaning Orlando | Integrity Clean Solutions"
      : service.slug === "movein-moveout"
      ? "Move-in/Move-out Cleaning Orlando | Integrity Clean"
      : service.slug === "removal-storage"
      ? "Post-Construction Cleaning Orlando | Integrity Clean"
      : service.slug === "eco-friendly-cleaning"
      ? "Eco-Friendly Cleaning Service Orlando | Integrity Clean"
      : service.slug === "post-renovation-cleaning"
      ? "Post-Renovation Cleaning Orlando | Integrity Clean"
      : `${service.service_title} | Orlando | Integrity Clean Solutions`,
    description,
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title: `${service.service_title} | Integrity Clean Solutions`,
      description,
      type: "website",
      url: serviceUrl,
      siteName: "Integrity Clean Solutions",
      images: [
        {
          url: serviceImage,
          alt: `${service.service_title} - Integrity Clean Solutions`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.service_title} | Integrity Clean Solutions`,
      description,
      images: [serviceImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function Details({ params }: ServicePageProps) {
  const { slug } = await params;
  const serviceExists = services.some((item) => item.slug === slug);

  if (!serviceExists) {
    notFound();
  }

  return (
    <>
      <ServicesDetail />
    </>
  );
}
