import Link from "next/link";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import { query } from "@/lib/db/neon";

const FEATURED_SLUGS = [
    "regular-cleaning",
    "deep-cleaning",
    "move-in-out-cleaning",
    "post-construction-cleaning",
    "carpet-cleaning",
    "commercial-cleaning",
];

const FALLBACK_IMAGES: Record<string, string> = {
    "regular-cleaning": "/images/services/regular-cleaning.jpg",
    "deep-cleaning": "/images/services/deep-cleaning.jpg",
    "move-in-out-cleaning": "/images/services/move-out-cleaning.jpg",
    "post-construction-cleaning": "/images/services/post-construction-cleaning.jpg",
    "carpet-cleaning": "/images/services/carpet-cleaning.jpg",
    "commercial-cleaning": "/images/services/commercial-office-cleaning-1.jpg",
};

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

                    <Carousel className="w-full">
                        <CarouselContent className="flex gap-10">
                            {services.map((value, index) => (
                                <CarouselItem key={index} className="basis-full sm:basis-auto">
                                    <div className="relative w-full sm:w-[440px] h-96">
                                        <Link href={`/services/${value.slug}`}>
                                            <Image
                                                src={value.hero_icon || FALLBACK_IMAGES[value.slug] || "/images/services/regular-cleaning.jpg"}
                                                alt="Image"
                                                width={440}
                                                height={390}
                                                className="w-full h-full object-cover hover:scale-95 transition-transform duration-300 rounded-lg"
                                            />
                                        </Link>
                                        <div className="absolute -bottom-8 left-4 right-4 sm:left-auto sm:right-0 flex items-center">
                                            <div className="bg-white dark:bg-secondary pl-4 pr-3 py-3 flex items-center justify-between rounded-sm gap-2 w-full sm:w-auto sm:pl-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-secondary/80">{String(index + 1).padStart(2, "0")}.</span>
                                                    <Link href={`/services/${value.slug}`}>
                                                        <h6 className="font-semibold">{value.nombre}</h6>
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
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 m-3 border border-primary bg-primary text-white hover:bg-deep-blue transition-colors cursor-pointer shadow-soft-primary" />
                        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 m-3 border border-primary bg-primary text-white hover:bg-deep-blue transition-colors cursor-pointer shadow-soft-primary" />
                    </Carousel>
                </div>
            </div>
        </section>
    )
}
export default ServiceOfferings;
