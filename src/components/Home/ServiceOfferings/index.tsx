import Link from "next/link";
import { query } from "@/lib/db/neon";
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

type ServiceCard = {
    id: string;
    slug: string;
    nombre: string;
    hero_icon: string | null;
};

const getFeaturedServices = async (): Promise<ServiceCard[]> => {
    return query<ServiceCard>(
        `SELECT id, slug, nombre, hero_icon
         FROM public.services
         WHERE activo = true AND slug = ANY($1)
         ORDER BY array_position($1::text[], slug)`,
        [FEATURED_SLUGS],
    );
};

async function ServiceOfferings() {
    const services = await getFeaturedServices();

    return (
        <section>
        <div className="py-24 card-surface">
                <div className="flex flex-col gap-16">
                    <div className="container">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            <div className="flex flex-col gap-4 max-w-xl">
                                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4">
                                    <p className="font-semibold text-white">Your home, our priority</p>
                                </div>
                                <h2 className="font-semibold text-white text-3xl md:text-4xl">Residential &amp; Commercial Cleaning Services in Orlando</h2>
                            </div>
                            <div className="flex flex-col gap-8 max-w-sm">
                                <p className="text-white">Explore tailored cleaning options for Orlando homes, offices, and retail spaces. From recurring upkeep to specialty deep cleans, Integrity Clean Solutions keeps every environment spotless.</p>
                                <Link href="/services" className="w-fit text-white border-b-2 border-primary hover:text-light-olive">View all services</Link>
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
