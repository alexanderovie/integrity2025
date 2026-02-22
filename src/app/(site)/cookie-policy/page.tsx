import CookiePolicy from "@/components/CookiePolicy";
import { SITE_URL_OBJECT } from "@/lib/urls/site";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: SITE_URL_OBJECT,
  title: "Cookie Policy | Privacy & Data Usage | Integrity Clean",
  description:
    "Learn about how Integrity Clean Solutions uses cookies on our website. Understand essential, analytics, and functional cookies. We use Google Analytics and Meta Pixel for traffic analysis. Users can control cookie preferences through browser settings. Last updated June 2025.",
  alternates: {
    canonical: "/cookie-policy",
  },
  openGraph: {
    title: "Cookie Policy | Integrity Clean Solutions",
    description:
      "Learn about how Integrity Clean Solutions uses cookies on our website. Understand essential, analytics, and functional cookies. Control your cookie preferences.",
    type: "website",
    url: "/cookie-policy",
    siteName: "Integrity Clean Solutions",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Cookie Policy | Integrity Clean Solutions",
    description:
      "Learn about how Integrity Clean Solutions uses cookies on our website. Understand cookie types and control your preferences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return (
    <main>
      <CookiePolicy />
    </main>
  );
}
