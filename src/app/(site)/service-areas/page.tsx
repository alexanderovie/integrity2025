import Link from "next/link";
import type { Metadata } from "next";

import { FooterData } from "@/components/Layout/Footer/data";

export const metadata: Metadata = {
  title: "Service Areas | Integrity Clean Solutions",
  description:
    "Explore the Orlando-area cities served by Integrity Clean Solutions. We provide professional residential and commercial cleaning across Central Florida.",
  alternates: {
    canonical: "https://integritycleansolutions.com/service-areas",
  },
};

export default function ServiceAreasPage() {
  return (
    <section className="dark:bg-dark-gray">
      <div className="container">
        <div className="pt-24 lg:pt-32 pb-20 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary/60 dark:text-white/60">
              Service Areas
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Cleaning services across Orlando and surrounding neighborhoods
            </h1>
            <p className="text-secondary/70 dark:text-white/70 max-w-2xl">
              Integrity Clean Solutions proudly serves residential and commercial clients across Central Florida.
              Select your city to see localized service details.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FooterData.serviceAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-md border border-secondary/10 dark:border-white/15 px-5 py-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-secondary dark:text-white group-hover:text-primary">
                    {area.name}
                  </span>
                  <span className="text-secondary/50 dark:text-white/50">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
