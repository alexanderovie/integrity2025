
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

  return {
    title: `${service.service_title} | Integrity Clean Solutions`,
    description: service.description,
    alternates: {
      canonical: `/services/${slug}`,
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
