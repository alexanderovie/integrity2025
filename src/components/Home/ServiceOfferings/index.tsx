import Link from "next/link";
import { getFeaturedServices } from "@/lib/services/featured-services";
import ServiceMarquee from "./ServiceMarquee";

const FEATURED_SLUGS = [
    "airbnb-cleaning",
    "regular-cleaning",
    "deep-cleaning",
    "move-in-out-cleaning",
    "post-construction-cleaning",
    "carpet-cleaning",
    "commercial-cleaning",
];


type ServiceOfferingsProps = {
    featuredSlugs?: string[];
    badgeLabel?: string;
    title?: string;
    description?: string;
    ctaHref?: string;
    ctaLabel?: string;
};

async function ServiceOfferings({
    featuredSlugs = FEATURED_SLUGS,
    badgeLabel = "Your home, our priority",
    title = "Residential & Commercial Cleaning Services in Orlando",
    description = "Explore tailored cleaning options for Orlando homes, offices, and retail spaces. From recurring upkeep to specialty deep cleans, Integrity Clean Solutions keeps every environment spotless.",
    ctaHref = "/services",
    ctaLabel = "View all services",
}: ServiceOfferingsProps) {
    const services = await getFeaturedServices(featuredSlugs);

    return (
        <section>
        <div className="py-24 card-surface">
                <div className="flex flex-col gap-16">
                    <div className="container">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            <div className="flex flex-col gap-4 max-w-xl">
                                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4">
                                    <p className="font-semibold text-white">{badgeLabel}</p>
                                </div>
                                <h2 className="font-semibold text-white text-3xl md:text-4xl">{title}</h2>
                            </div>
                            <div className="flex flex-col gap-8 max-w-sm">
                                <p className="text-white">{description}</p>
                                <Link href={ctaHref} className="w-fit text-white border-b-2 border-primary hover:text-light-olive">{ctaLabel}</Link>
                            </div>
                        </div>
                    </div>

                    <ServiceMarquee services={services} />
                </div>
            </div>
        </section>
    )
}
export default ServiceOfferings;
