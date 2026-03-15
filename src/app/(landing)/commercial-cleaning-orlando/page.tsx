import CommercialLandingSections from "@/components/Landing/CommercialLandingSections";
import { SITE_URL_OBJECT, absoluteUrl } from "@/lib/urls/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  title: "Commercial Cleaning Services Orlando FL | Integrity Clean Solutions",
  description:
    "Commercial cleaning services in Orlando, FL for offices, medical spaces, restaurants, daycare facilities, and recurring janitorial plans. Request a free quote.",
  alternates: {
    canonical: "/commercial-cleaning-orlando",
  },
  openGraph: {
    title: "Commercial Cleaning Services Orlando FL | Integrity Clean Solutions",
    description:
      "Office cleaning, janitorial service, commercial disinfection, and sanitization support for Orlando-area businesses.",
    type: "website",
    url: "/commercial-cleaning-orlando",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "/images/services/professional-commercial-cleaning.webp",
        alt: "Commercial cleaning service in Orlando by Integrity Clean Solutions",
        width: 1200,
        height: 800,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Cleaning Services Orlando FL | Integrity Clean Solutions",
    description:
      "Commercial cleaning, office cleaning, sanitization, and janitorial support for Orlando-area businesses.",
    images: ["/images/services/professional-commercial-cleaning.webp"],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you offer office cleaning service for small businesses in Orlando?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Integrity Clean Solutions supports small offices in Orlando with recurring cleaning, sanitization, and flexible schedules based on business hours.",
      },
    },
    {
      "@type": "Question",
      name: "Can you provide nightly office cleaning service in the Orlando area?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We can arrange nightly office cleaning service and recurring janitorial routines that reduce disruption to your staff and operations.",
      },
    },
    {
      "@type": "Question",
      name: "Do you clean medical offices, restaurants, and daycare facilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We provide cleaning and sanitization support for medical offices, restaurants, daycare centers, and other high-traffic commercial facilities in Orlando.",
      },
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": absoluteUrl("/commercial-cleaning-orlando#service"),
  name: "Commercial Cleaning Services Orlando FL",
  serviceType: "Commercial Cleaning",
  provider: {
    "@type": "CleaningService",
    name: "Integrity Clean Solutions",
    url: absoluteUrl("/"),
    telephone: "+1-800-930-0532",
  },
  areaServed: [
    { "@type": "City", name: "Orlando" },
    { "@type": "City", name: "Winter Park" },
    { "@type": "City", name: "Kissimmee" },
    { "@type": "City", name: "Lake Nona" },
  ],
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    url: absoluteUrl("/quote"),
  },
};

export default function CommercialCleaningOrlandoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CommercialLandingSections />
    </>
  );
}
