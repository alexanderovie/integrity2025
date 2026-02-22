
import AboutusBanner from "@/components/Aboutus/AboutusBanner";
import OurCareer from "@/components/Aboutus/OurCareer";
import WhoWeAre from "@/components/Aboutus/WhoWeAre";
import { SITE_URL_OBJECT } from "@/lib/urls/site";
import { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  title: "About Us | Orlando Cleaning Experts | Integrity Clean",
  description:
    "Learn about Integrity Clean Solutions, Orlando's trusted cleaning experts. Discover our mission, values, customer success stories, and commitment to excellence. We've been serving Orlando homes and businesses with reliable, eco-friendly cleaning services since our founding.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "About Us | Integrity Clean Solutions",
    description:
      "Learn about Integrity Clean Solutions, Orlando's trusted cleaning experts. Discover our mission, values, and commitment to excellence in residential and commercial cleaning.",
    type: "website",
    url: "/about-us",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "/images/aboutus/about-ellipse-img.svg",
        alt: "About Integrity Clean Solutions - Orlando Cleaning Company",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Integrity Clean Solutions",
    description:
      "Learn about Integrity Clean Solutions, Orlando's trusted cleaning experts. Discover our mission, values, and commitment to excellence.",
    images: ["/images/aboutus/about-ellipse-img.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
    return (
        <main>
            <AboutusBanner/>
            <WhoWeAre/>
            <OurCareer/>
        </main>
    );
};
