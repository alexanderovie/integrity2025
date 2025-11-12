import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
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
                streetAddress: "4700 Millenia Blvd",
                addressLocality: "Orlando",
                addressRegion: "FL",
                postalCode: "32839",
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
