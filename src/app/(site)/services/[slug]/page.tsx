import ServicesDetail from "@/components/Services/ServicesDetail";
import { getServiceBySlug } from "@/lib/services/details";
import { absoluteUrl, SITE_URL_OBJECT } from "@/lib/urls/site";
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: ServicePageProps
): Promise<Metadata> {
  const { slug } = await params;

  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Integrity Clean Solutions",
    };
  }

  const serviceUrl = `/services/${slug}`;
  const serviceImage = `/images/services/${slug}.jpg`;
  const serviceDescription = service.descripcion ?? "";

  const description = serviceDescription.length > 320
    ? serviceDescription.substring(0, 317) + "..."
    : serviceDescription.length > 0 && serviceDescription.length < 100
    ? serviceDescription + " Professional cleaning services in Orlando, FL. Trusted, reliable, and thorough cleaning solutions for your home or business."
    : serviceDescription || `${service.nombre} professional cleaning service in Orlando.`;

  const titleMap: Record<string, string> = {
    'deep-cleaning': "Deep Cleaning | Orlando | Integrity Clean Solutions",
    'regular-cleaning': "Regular Cleaning Orlando | Integrity Clean Solutions",
    'move-in-out-cleaning': "Move-In/Move-Out Cleaning Orlando | Integrity Clean",
    'post-construction-cleaning': "Post-Construction Cleaning Orlando | Integrity Clean",
    'commercial-cleaning': "Commercial Cleaning Services | Integrity Clean Solutions",
    'carpet-cleaning': "Carpet Cleaning Orlando | Integrity Clean",
    'airbnb-cleaning': "Airbnb Cleaning Orlando | Integrity Clean Solutions",
  };

  return {
    metadataBase: SITE_URL_OBJECT,
    title: service.seo_title || titleMap[slug] || `${service.nombre} | Orlando | Integrity Clean Solutions`,
    description: service.seo_description || description,
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title: `${service.nombre} | Integrity Clean Solutions`,
      description,
      type: "website",
      url: serviceUrl,
      siteName: "Integrity Clean Solutions",
      images: [
        {
          url: serviceImage,
          alt: `${service.nombre} - Integrity Clean Solutions`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.nombre} | Integrity Clean Solutions`,
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

  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <ServicesDetail service={service} />
      <Script
        id={`service-schema-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": absoluteUrl(`/services/${slug}#service`),
            "name": `${service.nombre} in Orlando FL`,
            "serviceType": service.nombre,
            "provider": {
              "@type": "CleaningService",
              "name": "Integrity Clean Solutions",
              "url": absoluteUrl("/")
            },
            "areaServed": {
              "@type": "Place",
              "name": "Orlando, Florida"
            },
            "description": service.descripcion || service.nombre
          }),
        }}
      />
    </>
  );
}
