import ServicesDetail from "@/components/Services/ServicesDetail";
import { query } from "@/lib/db/neon";
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

type ServiceData = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  hero_icon: string | null;
  duration: string | null;
  rating: string | null;
  features: string[];
  cleaning_process: string[];
  seo_title: string | null;
  seo_description: string | null;
  page_content: unknown | null;
  page_content_updated_at: string | null;
  published_at: string | null;
};

export async function generateMetadata(
  { params }: ServicePageProps
): Promise<Metadata> {
  const { slug } = await params;
  
  const services = await query<{
    id: string;
    slug: string;
    nombre: string;
    descripcion: string;
    precio_base: number;
    seo_title: string | null;
    seo_description: string | null;
  }>(`SELECT id, slug, nombre, descripcion, precio_base, seo_title, seo_description FROM public.services WHERE activo = true`);
  
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found | Integrity Clean Solutions",
    };
  }

  const metadataBase = new URL("https://integritycleansolutions.com");
  const serviceUrl = `${metadataBase.href.replace(/\/$/, '')}/services/${slug}`;
  const serviceImage = `/images/services/${slug}.jpg`;

  const description = service.descripcion?.length > 320
    ? service.descripcion.substring(0, 317) + "..."
    : service.descripcion?.length < 100
    ? service.descripcion + " Professional cleaning services in Orlando, FL. Trusted, reliable, and thorough cleaning solutions for your home or business."
    : service.descripcion || `${service.nombre} professional cleaning service in Orlando.`;

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
    metadataBase,
    title: service.seo_title || titleMap[slug] || `${service.nombre} | Orlando | Integrity Clean Solutions`,
    description: service.seo_description || description,
    alternates: {
      canonical: `${metadataBase.href.replace(/\/$/, '')}/services/${slug}`,
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
  
  // Fetch service data on the server
  const services = await query<ServiceData>(
    `SELECT slug, nombre, descripcion, precio_base, hero_icon, duration, rating, features, cleaning_process,
            seo_title, seo_description, page_content, page_content_updated_at, published_at
     FROM public.services WHERE slug = $1 AND activo = true`,
    [slug]
  );
  
  const service = services[0];

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
            "@id": `https://integritycleansolutions.com/services/${slug}#service`,
            "name": `${service.nombre} in Orlando FL`,
            "serviceType": service.nombre,
            "provider": {
              "@type": "CleaningService",
              "name": "Integrity Clean Solutions",
              "url": "https://integritycleansolutions.com"
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
