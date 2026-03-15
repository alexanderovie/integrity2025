import HomePageSections from "@/components/Home/HomePageSections";
import { SITE_URL_OBJECT } from "@/lib/urls/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  title: "Integrity Clean Solutions | Orlando Cleaning Experts",
  description:
    "Orlando's trusted cleaning experts. Eco-friendly residential & commercial cleaning services. Deep clean, move-in/out, Airbnb & regular maintenance. Free quotes!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Integrity Clean Solutions | Orlando Cleaning Experts",
    description:
      "Professional cleaning services in Orlando, FL. Residential and commercial cleaning with eco-friendly products. Deep cleaning, move-in/move-out, and regular maintenance.",
    type: "website",
    url: "/",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "/assets/cover.jpg",
        alt: "Integrity Clean Solutions - Professional Cleaning Services in Orlando",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrity Clean Solutions | Orlando Cleaning Experts",
    description:
      "Professional cleaning services in Orlando, FL. Residential and commercial cleaning with eco-friendly products. Get your free quote today!",
    images: ["/assets/cover.jpg"],
  },
};

export default function Home() {
  return <HomePageSections />;
}
