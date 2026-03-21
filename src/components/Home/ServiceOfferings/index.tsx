import Link from "next/link";
import { query } from "@/lib/db/neon";
import ServiceMarquee from "./ServiceMarquee";

const QUERY_TIMEOUT_MS = 4000;

const FEATURED_SLUGS = [
    "airbnb-cleaning",
    "regular-cleaning",
    "deep-cleaning",
    "move-in-out-cleaning",
    "post-construction-cleaning",
    "carpet-cleaning",
    "commercial-cleaning",
];

type ServiceCard = {
    id: string;
    slug: string;
    nombre: string;
    hero_icon: string | null;
};

const FALLBACK_SERVICES: ServiceCard[] = [
    { id: "fallback-airbnb-cleaning", slug: "airbnb-cleaning", nombre: "Airbnb Cleaning", hero_icon: null },
    { id: "fallback-regular-cleaning", slug: "regular-cleaning", nombre: "Regular Cleaning", hero_icon: null },
    { id: "fallback-deep-cleaning", slug: "deep-cleaning", nombre: "Deep Cleaning", hero_icon: null },
    { id: "fallback-move-in-out-cleaning", slug: "move-in-out-cleaning", nombre: "Move In/Out Cleaning", hero_icon: null },
    { id: "fallback-post-construction-cleaning", slug: "post-construction-cleaning", nombre: "Post-Construction Cleaning", hero_icon: null },
    { id: "fallback-carpet-cleaning", slug: "carpet-cleaning", nombre: "Carpet Cleaning", hero_icon: null },
    { id: "fallback-commercial-cleaning", slug: "commercial-cleaning", nombre: "Commercial Cleaning", hero_icon: null },
];

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs);
        }),
    ]);
};

type ServiceOfferingsProps = {
    featuredSlugs?: string[];
    badgeLabel?: string;
    title?: string;
    description?: string;
    ctaHref?: string;
    ctaLabel?: string;
};

const getFeaturedServices = async (featuredSlugs: string[]): Promise<ServiceCard[]> => {
    try {
        return await withTimeout(
            query<ServiceCard>(
                `SELECT id, slug, nombre, hero_icon
                 FROM public.services
                 WHERE activo = true AND slug = ANY($1)
                 ORDER BY array_position($1::text[], slug)`,
                [featuredSlugs],
            ),
            QUERY_TIMEOUT_MS,
        );
    } catch (error) {
        console.error("Failed to load featured services, using fallback data", error);
        const fallbackBySlug = new Map(FALLBACK_SERVICES.map((service) => [service.slug, service]));
        return featuredSlugs
            .map((slug) => fallbackBySlug.get(slug))
            .filter((service): service is ServiceCard => Boolean(service));
    }
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
