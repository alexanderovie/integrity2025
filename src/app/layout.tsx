import { HubSpotScript } from "@/components/HubSpot/HubSpotScript";
import { MetaPixel } from "@/components/Meta/MetaPixel";
import { GoogleTagManager } from "@next/third-parties/google";
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
    canonical: "/",
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
        <GoogleTagManager gtmId="GTM-5TF5L8PQ" />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5TF5L8PQ"
            height="0"
            width="0"
            className="tracking-hidden"
          />
        </noscript>
        <MetaPixel />
        <HubSpotScript />
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
              "@type": "LocalBusiness",
              name: "Integrity Clean Solutions",
              image: "https://integritycleansolutions.com/assets/cover.jpg",
              "@id": "https://integritycleansolutions.com",
              url: "https://integritycleansolutions.com",
              telephone: "+18009300532",
              address: {
                "@type": "PostalAddress",
                streetAddress: "2180 Central Florida Parkway",
                addressLocality: "Orlando",
                addressRegion: "FL",
                postalCode: "32837",
                addressCountry: "US",
              },
              openingHours: "Mo-Fr 08:00-18:00, Sa 08:00-14:00",
              priceRange: "$$",
              geo: {
                "@type": "GeoCoordinates",
                latitude: 28.485,
                longitude: -81.44,
              },
              sameAs: [
                "https://www.facebook.com/integritycleansolutions",
                "https://www.instagram.com/integritycleansolutions",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
