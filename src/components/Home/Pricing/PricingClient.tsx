"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import RequestSiteVisitButton from "@/components/Services/RequestSiteVisitButton";
import { getQuoteOnlyCtaLabel, isQuoteOnlyService } from "@/lib/services/quoteOnly";

type PricingItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  icon: string;
};

type PricingClientProps = {
  items: PricingItem[];
};

const PricingClient = ({ items }: PricingClientProps) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const bottomAnimation = (index: number) => ({
    initial: { y: "5%", opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: "10%", opacity: 0 },
    transition: { duration: 0.4, delay: 0.4 + index * 0.3 },
  });

  return (
    <section id="pricing">
      <div ref={ref} className="bg-offwhite-warm dark:bg-dark-gray">
        <div className="container">
          <div className="py-20 sm:py-28 flex flex-col gap-9 sm:gap-16">
            <div className="flex flex-col gap-3 items-center justify-center">
              <div className="bg-primary w-fit rounded-full py-1 px-4">
                <p className="font-semibold text-white">Transparent pricing</p>
              </div>
              <h2 className="font-semibold max-w-2xl text-center">Budget-friendly options for a cleaner home</h2>
            </div>
            <div className="flex flex-col gap-6">
              {items.map((item, index) => (
                <motion.div
                  {...bottomAnimation(index)}
                  key={item.id}
                  className="group dark:bg-dusty-gray/40 border border-natural-gray dark:border-natural-gray/20 shadow-xl py-6 px-4 rounded-md hover:bg-primary dark:hover:bg-dusty-gray hover:border-secondary transition-all duration-500 ease-in-out"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 text-center md:text-left">
                    <div className="flex items-center gap-2.5 lg:gap-6 w-fit">
                      <Image src={item.icon} alt="icon" width={48} height={48} />
                      <h3 className="font-semibold text-lg lg:text-[22px] group-hover:text-white">{item.title}</h3>
                    </div>
                    <div className="lg:max-w-sm">
                      <p className="text-secondary/80 dark:text-white/80 group-hover:text-white/80">{item.description}</p>
                    </div>
                    {item.slug === "commercial-cleaning" || item.slug === "airbnb-cleaning" || item.slug === "post-construction-cleaning" ? (
                      <>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary group-hover:text-white">
                          {isQuoteOnlyService(item.slug) ? <>CUSTOM<br />QUOTE</> : <>A PRIOR VISIT<br />IS REQUIRED</>}
                        </p>
                        <RequestSiteVisitButton
                          className="whitespace-nowrap font-bold bg-natural-gray dark:bg-secondary group-hover:bg-secondary group-hover:text-white py-3 px-4 rounded-md transition-all duration-500 ease-in-out"
                          label={isQuoteOnlyService(item.slug) ? getQuoteOnlyCtaLabel(item.slug) : "Request a Site Visit"}
                          serviceSlug={item.slug}
                        />
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium group-hover:text-white">${item.price}</h4>
                        <Link
                          href={{
                            pathname: "/quote",
                            query: { service: item.slug },
                          }}
                          className="whitespace-nowrap font-bold bg-natural-gray dark:bg-secondary group-hover:bg-secondary group-hover:text-white py-3 px-4 rounded-md transition-all duration-500 ease-in-out"
                        >
                          Book a service
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingClient;
