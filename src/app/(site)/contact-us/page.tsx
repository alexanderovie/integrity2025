

import ContactBanner from "@/components/Contactus/ContactBanner";
import FaqSection from "@/components/Contactus/FaqSection";
import GoogleMapSection from "@/components/Contactus/GoogleMapSection";
import { SITE_URL_OBJECT } from "@/lib/urls/site";
import { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  title: "Contact Us | Free Quote | Integrity Clean Solutions",
  description:
    "Contact Integrity Clean Solutions in Orlando, FL. Call (800) 930-0532 or visit us at 4700 Millenia Blvd. Get a free quote for residential or commercial cleaning services. Our team is ready to help you maintain a clean, healthy environment.",
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "Contact Us | Integrity Clean Solutions",
    description:
      "Contact Integrity Clean Solutions in Orlando, FL. Call (800) 930-0532 or visit us at 4700 Millenia Blvd. Get a free quote for cleaning services today.",
    type: "website",
    url: "/contact-us",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "/images/contactus/contact-ellipse.png",
        alt: "Contact Integrity Clean Solutions - Orlando Cleaning Services",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Integrity Clean Solutions",
    description:
      "Contact Integrity Clean Solutions in Orlando, FL. Call (800) 930-0532 or get a free quote online. We're here to help!",
    images: ["/images/contactus/contact-ellipse.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
    return (
        <main>
            <ContactBanner/>
            <FaqSection/>
            <GoogleMapSection/>
        </main>
    );
};
