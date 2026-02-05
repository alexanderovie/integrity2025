"use client";

import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { ArrowRight } from "lucide-react";

type ServiceCard = {
    id: string;
    slug: string;
    nombre: string;
    hero_icon: string | null;
};

const FALLBACK_IMAGES: Record<string, string> = {
    "airbnb-cleaning": "/images/services/airbnb-cleaning.jpg",
    "regular-cleaning": "/images/services/regular-cleaning.jpg",
    "deep-cleaning": "/images/services/deep-cleaning.jpg",
    "move-in-out-cleaning": "/images/services/move-out-cleaning.jpg",
    "post-construction-cleaning": "/images/services/post-construction-cleaning.jpg",
    "carpet-cleaning": "/images/services/carpet-cleaning.jpg",
    "commercial-cleaning": "/images/services/commercial-office-cleaning-1.jpg",
};

type ServiceMarqueeProps = {
    services: ServiceCard[];
};

const ServiceMarquee = ({ services }: ServiceMarqueeProps) => {
    if (!services.length) {
        return null;
    }

    const repeatCount = 3;
    const repeatedServices = Array.from({ length: repeatCount }, () => services).flat();

    return (
        <Marquee autoFill={true} speed={40} className="py-12">
            <div className="flex gap-10">
                {repeatedServices.map((value, index) => {
                    const serviceIndex = index % services.length;

                    return (
                        <div key={`${value.id}-${index}`} className="relative w-full sm:w-[440px] h-96">
                            <Link href={`/services/${value.slug}`}>
                                <Image
                                    src={value.hero_icon || FALLBACK_IMAGES[value.slug] || "/images/services/regular-cleaning.jpg"}
                                    alt="Image"
                                    width={440}
                                    height={390}
                                    sizes="(max-width: 640px) 90vw, 440px"
                                    className="w-full h-full object-cover hover:scale-95 transition-transform duration-300 rounded-lg"
                                />
                            </Link>
                            <div className="absolute -bottom-8 left-4 right-4 sm:left-auto sm:right-0 flex items-center">
                                <div className="bg-white dark:bg-secondary pl-4 pr-3 py-3 flex items-center justify-between rounded-sm gap-2 w-full sm:w-auto sm:pl-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-secondary/80">{String(serviceIndex + 1).padStart(2, "0")}.</span>
                                        <Link href={`/services/${value.slug}`}>
                                            <h3 className="font-semibold text-lg lg:text-[22px]">{value.nombre}</h3>
                                        </Link>
                                    </div>
                                    <Link
                                        href={`/services/${value.slug}`}
                                        className="bg-primary hover:bg-deep-blue transition-colors duration-300 p-3 sm:p-5 rounded-md sm:rounded-r-sm text-white flex-shrink-0"
                                        aria-label={`View ${value.nombre} service`}
                                    >
                                        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Marquee>
    );
};

export default ServiceMarquee;
