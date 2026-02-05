import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import { services } from "@/app/api/services";
import { FooterData } from "@/components/Layout/Footer/data";

type ServiceAreaPageProps = {
  params: Promise<{ city: string }>;
};

function getSlugFromArea(area: { name: string; href: string }): string {
  return area.href.split('/').pop() || area.name.toLowerCase().replace(/\s+/g, '-');
}

export async function generateStaticParams() {
  return FooterData.serviceAreas.map((area) => ({
    city: getSlugFromArea(area),
  }));
}

export async function generateMetadata({ params }: ServiceAreaPageProps): Promise<Metadata> {
  const { city } = await params;
  const area = FooterData.serviceAreas.find((item) => getSlugFromArea(item) === city);

  if (!area) {
    return {
      title: "Service Area Not Found | Integrity Clean Solutions",
    };
  }

  const slug = getSlugFromArea(area);
  const metadataBase = new URL("https://integritycleansolutions.com");
  
  return {
    title: `${area.name} Cleaning Services | Integrity`,
    description: `Integrity Clean Solutions delivers reliable residential and commercial cleaning services in ${area.name}, FL. Request a free quote today.`,
    alternates: {
      canonical: `${metadataBase.href.replace(/\/$/, '')}/service-areas/${slug}`,
    },
  };
}

export default async function ServiceAreaPage({ params }: ServiceAreaPageProps) {
  const { city } = await params;
  const area = FooterData.serviceAreas.find((item) => getSlugFromArea(item) === city);

  if (!area) {
    notFound();
  }

  const slug = getSlugFromArea(area);

  return (
    <>
      <section className="dark:bg-dark-gray">
        <div className="container">
          <div className="pt-24 lg:pt-32 pb-20">
            <div className="flex flex-col gap-10 pt-14 lg:pt-28">
              <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-secondary/60 dark:text-white/60">
                  {area.name}
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold">
                  Trusted cleaning services in {area.name}
                </h1>
                <p className="text-secondary/70 dark:text-white/70 max-w-2xl">
                  Integrity Clean Solutions serves homes and businesses across {area.name} with flexible scheduling,
                  eco-friendly products, and consistent quality. Reach out for a custom cleaning plan tailored to your space.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/quote"
                    className="bg-primary hover:bg-deep-blue transition-colors duration-300 py-3 px-6 rounded-md font-semibold text-white"
                  >
                    Get a quote
                  </Link>
                  <Link
                    href="/services"
                    className="border border-secondary/20 dark:border-white/20 py-3 px-6 rounded-md font-semibold text-secondary dark:text-white hover:border-primary"
                  >
                    View services
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-md border border-secondary/10 dark:border-white/15 p-6">
                  <h2 className="font-semibold text-xl mb-3">Services available</h2>
                  <ul className="flex flex-col gap-2 text-secondary/70 dark:text-white/70">
                    {services.map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="hover:text-primary"
                        >
                          {service.service_title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-secondary/10 dark:border-white/15 p-6">
                  <h2 className="font-semibold text-xl mb-3">Why choose us</h2>
                  <ul className="flex flex-col gap-2 text-secondary/70 dark:text-white/70">
                    <li>Locally trusted cleaning professionals.</li>
                    <li>Flexible scheduling for residential and commercial clients.</li>
                    <li>Eco-friendly products and detailed checklists.</li>
                    <li>Clear communication and dependable service.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Script
        id={`service-area-schema-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `https://integritycleansolutions.com/service-areas/${slug}#business`,
            "name": `House Cleaning Services in ${area.name}, Orlando FL`,
            "description": `Professional residential and commercial cleaning services in ${area.name}, Orlando FL. Eco-friendly products, reliable cleaners, and flexible scheduling.`,
            "url": `https://integritycleansolutions.com/service-areas/${slug}`,
            "telephone": "+1-800-930-0532",
            "provider": {
              "@type": "CleaningService",
              "name": "Integrity Clean Solutions",
              "url": "https://integritycleansolutions.com"
            },
            "areaServed": {
              "@type": "AdministrativeArea",
              "name": `${area.name}, Orlando FL`
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": area.name,
              "addressRegion": "FL",
              "addressCountry": "US"
            }
          }),
        }}
      />
    </>
  );
}
