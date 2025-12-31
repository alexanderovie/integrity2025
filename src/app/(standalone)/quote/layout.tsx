import StandaloneHeader from "@/components/Layout/Header/StandaloneHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Free Cleaning Quote | Integrity Clean Solutions",
  description:
    "Customize your residential or commercial cleaning plan, choose extras, and schedule preferred dates with Integrity Clean Solutions in Orlando.",
  alternates: {
    canonical: "/quote",
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
      <div className="min-h-screen bg-offwhite-warm dark:bg-dark-gray pt-16 lg:pt-20">
        <div className="container px-0 sm:px-6">
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-8 text-center pt-6">
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
