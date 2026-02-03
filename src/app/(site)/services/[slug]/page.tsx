import { query } from "@/lib/db/neon";
import ServicesDetail from "@/components/Services/ServicesDetail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

type ServiceData = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  duration: string | null;
  rating: string | null;
  features: string[];
  cleaning_process: string[];
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
  }>(`SELECT id, slug, nombre, descripcion, precio_base FROM public.services WHERE activo = true`);
  
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found | Integrity Clean Solutions",
    };
  }

  const metadataBase = new URL("https://integritycleansolutions.com");
  const serviceUrl = `${metadataBase}/services/${slug}`;
  const serviceImage = `/images/services/${slug}.jpg`;

  const description = service.descripcion?.length > 300
    ? service.descripcion.substring(0, 297) + "..."
    : service.descripcion?.length < 120
    ? service.descripcion + " Professional cleaning services in Orlando, FL."
    : service.descripcion || `${service.nombre} professional cleaning service in Orlando.`;

  const titleMap: Record<string, string> = {
    'deep-cleaning': "Deep Cleaning | Orlando | Integrity Clean Solutions",
    'regular-cleaning': "Regular Cleaning Orlando | Integrity Clean Solutions",
    'move-in-out-cleaning': "Move-In/Move-Out Cleaning Orlando | Integrity Clean",
    'post-construction-cleaning': "Post-Construction Cleaning Orlando | Integrity Clean",
    'commercial-cleaning': "Commercial Cleaning Orlando | Integrity Clean",
    'carpet-cleaning': "Carpet Cleaning Orlando | Integrity Clean",
    'airbnb-cleaning': "Airbnb Cleaning Orlando | Integrity Clean Solutions",
  };

  return {
    metadataBase,
    title: titleMap[slug] || `${service.nombre} | Orlando | Integrity Clean Solutions`,
    description,
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
  
  // Fetch service data on the server
  const services = await query<ServiceData>(
    `SELECT slug, nombre, descripcion, precio_base, duration, rating, features, cleaning_process 
     FROM public.services WHERE slug = $1 AND activo = true`,
    [slug]
  );
  
  const service = services[0];

  if (!service) {
    notFound();
  }

  return <ServicesDetail service={service} />;
}
