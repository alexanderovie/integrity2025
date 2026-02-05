import ConsentBanner from "@/components/CookieConsent/ConsentBanner";
import { AnalyticsLoader } from "@/components/analytics/AnalyticsLoader";
import { SpeculationRules } from "@/components/SpeculationRules";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Configure Inter font with robust fallback for build resilience
// If Google Fonts is unavailable, uses system fonts seamlessly
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  adjustFontFallback: true, // Enable fallback metrics for better rendering
  variable: "--font-inter",
  preload: true,
  // Don't fail build if font download fails (handled by fallback)
});

export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Cleaning Services in Orlando | Integrity Clean Solutions",
  description:
    "Reliable eco-friendly cleaning in Orlando. Deep, move-in and residential services with guaranteed satisfaction. Get your free quote!",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://integritycleansolutions.com/",
  },
  openGraph: {
    title: "Cleaning Services in Orlando | Integrity Clean Solutions",
    description:
      "Trusted eco-friendly house & office cleaning in Orlando. Book your free quote today!",
    type: "website",
    url: "https://integritycleansolutions.com/",
    images: [
      {
        url: "https://integritycleansolutions.com/assets/cover.jpg",
      },
    ],
    siteName: "Integrity Clean Solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleaning Services in Orlando | Integrity Clean Solutions",
    description:
      "Reliable eco-friendly cleaning in Orlando. Book your free quote today!",
    images: ["https://integritycleansolutions.com/assets/cover.jpg"],
  },
  other: {
    "apple-mobile-web-app-title": "Integrity",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AnalyticsLoader />
        <ConsentBanner />
        <SpeculationRules />
        <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
          {children}
        </ThemeProvider>
        <Script
          id="integrity-business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CleaningService",
              "@id": "https://integritycleansolutions.com/#business",
              "name": "Integrity Clean Solutions",
              "url": "https://integritycleansolutions.com",
              "logo": "https://integritycleansolutions.com/images/logo/integrity-navbar.png",
              "image": "https://integritycleansolutions.com/images/home/banner/hero-bg.png",
              "telephone": "+1-800-930-0532",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "2180 Central Florida Parkway",
                "addressLocality": "Orlando",
                "addressRegion": "FL",
                "postalCode": "32837",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.485,
                "longitude": -81.44
              },
              "areaServed": [
                "Orlando FL",
                "Baldwin Park FL",
                "College Park FL",
                "Dr. Phillips FL",
                "Hunter Creek FL",
                "Lake Buena Vista FL",
                "Kissimmee FL",
                "Celebration FL",
                "Windermere FL",
                "Winter Park FL",
                "Lake Nona FL",
                "Metro West FL"
              ],
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "08:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "08:00",
                  "closes": "14:00"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/people/Integrity-Clean-Solution/61576074382774/",
                "https://www.instagram.com/integritycleansolution/",
                "https://www.tiktok.com/@integritycleansolution",
                "https://www.youtube.com/@IntegrityCleanSolutions/"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "13"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
