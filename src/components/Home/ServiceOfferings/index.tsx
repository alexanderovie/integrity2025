import Link from "next/link";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { services } from "@/app/api/services";
import { ArrowRight } from "lucide-react";

function ServiceOfferings() {
    return (
        <section>
            <div className="py-24 bg-[linear-gradient(to_bottom,_#1f2a2e_70%,_#F8F8F5_30%)] dark:bg-[linear-gradient(to_bottom,_#1f2a2e_70%,_#FFFFFF66_30%)]">
                <div className="flex flex-col gap-16">
                    <div className="container">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            <div className="flex flex-col gap-4 max-w-xl">
                                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4">
                                    <p className="font-semibold text-white">Your home, our priority</p>
                                </div>
                                <h2 className="font-semibold text-white">Our Professional Cleaning Services</h2>
                            </div>
                            <div className="flex flex-col gap-8 max-w-sm">
                                <p className=" text-white">Explore our efficient <span className="font-bold">cleaning services</span> designed to maintain a neat and tidy home environment.</p>
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
                                                src={value.thumbnail_img}
                                                alt="Image"
                                                width={440}
                                                height={390}
                                                className="w-full h-full object-cover hover:scale-95 transition-transform duration-300 rounded-lg"
                                            />
                                        </Link>
                                        <div className="absolute -bottom-8 left-4 right-4 sm:left-auto sm:right-0 flex items-center">
                                            <div className="bg-white dark:bg-secondary pl-4 pr-3 py-3 flex items-center justify-between rounded-sm gap-2 w-full sm:w-auto sm:pl-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-secondary/80">0{value.id}.</span>
                                                    <Link href={`/services/${value.slug}`}>
                                                        <h6 className="font-semibold">{value.service_title}</h6>
                                                    </Link>
                                                </div>
                                                <Link
                                                    href={`/services/${value.slug}`}
                                                    className="bg-primary hover:bg-deep-blue transition-colors duration-300 p-3 sm:p-5 rounded-md sm:rounded-r-sm text-white flex-shrink-0"
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
