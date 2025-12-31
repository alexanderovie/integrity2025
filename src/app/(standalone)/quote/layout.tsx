import StandaloneHeader from "@/components/Layout/Header/StandaloneHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Free Cleaning Quote | Integrity Clean Solutions",
  description:
    "Customize your residential or commercial cleaning plan, choose extras, and schedule preferred dates with Integrity Clean Solutions in Orlando.",
  alternates: {
    canonical: "/quote",
  },
  robots: {
    // Prevent indexing of /quote page with parameters
    // The friendly URLs /quote/[service] are indexed instead
    index: false,
    follow: true,
  },
};

type QuoteLayoutProps = {
  children: React.ReactNode;
};

export default function QuoteLayout({ children }: QuoteLayoutProps) {
  return (
    <>
      <StandaloneHeader />
      {/* H1 visible para SEO - renderizado server-side, disponible inmediatamente para crawlers */}
      <div className="bg-offwhite-warm dark:bg-dark-gray pt-8 lg:pt-12 pb-4">
        <div className="container px-0 sm:px-6">
          <div className="w-full max-w-6xl mx-auto px-4 py-3">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white">
                Get Your Custom Cleaning Quote | Book Service Online Today
              </h1>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
