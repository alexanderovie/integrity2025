import Image from "next/image";
import Link from "next/link";
import { parseServicePageContent } from "@/lib/schemas/servicePageContent";
import RequestSiteVisitButton from "@/components/Services/RequestSiteVisitButton";

type ServiceData = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  hero_icon: string | null;
  duration: string | null;
  rating: string | null;
  features: string[];
  cleaning_process: string[];
  seo_title: string | null;
  seo_description: string | null;
  page_content: unknown | null;
  page_content_updated_at: string | null;
  published_at: string | null;
};

type ServiceDetailProps = {
  service: ServiceData;
};

const ServicesDetail = ({ service }: ServiceDetailProps) => {
  const displayPrice = (service.precio_base / 100).toFixed(2);
  const pageContent = parseServicePageContent(service.page_content);
  const needsPriorVisit = ["commercial-cleaning", "airbnb-cleaning", "post-construction-cleaning"].includes(service.slug);
  const notice = pageContent?.notice;
  const testimonial = pageContent?.testimonial;

  return (
    <section className="dark:bg-dark-gray">
      <div className="container">
        <div className="pt-24 lg:pt-32">
          <div className="py-12 xl:py-28 flex flex-col gap-6 sm:gap-10">
            
            {/* Breadcrumb and Title */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Image src="/images/icon/home-icon.svg" alt="home-icon" width={28} height={28} />
                  <p className="font-semibold text-secondary/50 dark:text-white/50">
                    <Link href="/" className="text-light-olive">Home /</Link>
                    <Link href="/services" className="text-light-olive">Services /</Link>
                    {service.nombre}
                  </p>
                </div>
                <h1 className="font-semibold text-3xl md:text-4xl">
                  {service.nombre} | Professional Cleaning Service in Orlando
                </h1>
              </div>
              
              {/* Duration and Rating */}
              <div className="flex items-center">
                {service.duration && (
                  <div className="flex gap-2 pr-6 py-2 border-r border-gray/20">
                    <Image src="/images/icon/duration-icon.svg" alt="duration-icon" width={25} height={25} />
                    <p className="text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium">
                      {service.duration}
                    </p>
                  </div>
                )}
                {service.rating && (
                  <div className="flex gap-2 px-6 py-2">
                    <Image src="/images/icon/rating-star.svg" alt="rating-icon" width={25} height={25} />
                    <p className="text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium">
                      {service.rating} Ratings
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex flex-col lg:flex-row justify-between gap-6 xl:gap-10">
              
              {/* Main Content */}
              <div className="flex flex-col gap-5 sm:gap-8 w-full lg:flex-1 lg:max-w-[56rem]">
                
                {/* Hero Image */}
                <div className="w-full h-[450px]">
                  <Image
                    src={service.hero_icon || `/images/services/${service.slug}.jpg`}
                    alt={service.nombre}
                    width={500}
                    height={400}
                    sizes="(max-width: 1024px) 100vw, 900px"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Description */}
                <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                  {service.descripcion || `Professional ${service.nombre} service in Orlando. Contact us for a free quote today.`}
                </p>

                {pageContent?.intro && pageContent.intro.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {pageContent.intro.map((paragraph, index) => (
                      <p key={index} className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-col gap-4 mt-6 sm:mt-8">
                    <h6 className="font-semibold text-xl">Features</h6>
                    <ul className="flex flex-col gap-3">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Image src="/images/icon/verified-icon.svg" alt="verified-icon" width={32} height={32} />
                          <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                            {feature}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cleaning Process */}
                {service.cleaning_process && service.cleaning_process.length > 0 && (
                  <div className="flex flex-col gap-4 mt-6 sm:mt-8">
                    <h6 className="font-semibold text-xl">Cleaning Process</h6>
                    <ul className="flex flex-col gap-2 md:gap-3">
                      {service.cleaning_process.map((step, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <span className="font-semibold text-white bg-primary py-1 px-3 rounded-full">
                            {index + 1}
                          </span>
                          <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                            {step}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pageContent?.sections && pageContent.sections.length > 0 && (
                  <div className="flex flex-col gap-6 mt-6 sm:mt-8">
                    {pageContent.sections.map((section, index) => (
                      <div
                        key={index}
                        className={`flex flex-col gap-3 ${index === 0 ? "" : "mt-6 sm:mt-8"}`}
                      >
                        <h3 className="font-semibold text-xl">{section.title}</h3>
                        {section.subtitle && (
                          <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                            {section.subtitle}
                          </p>
                        )}
                        {section.items && section.items.length > 0 && (
                          <ul className="flex flex-col gap-3">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-3">
                                <Image src="/images/icon/verified-icon.svg" alt="verified-icon" width={32} height={32} />
                                <div>
                                  <p className="font-semibold text-secondary/90 dark:text-white/90">{item.title}</p>
                                  <p className="text-base text-secondary/80 dark:text-white/70">{item.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.notes && section.notes.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {section.notes.map((note, noteIndex) => (
                              <p key={noteIndex} className="text-sm text-secondary/70 dark:text-white/60">
                                {note}
                              </p>
                            ))}
                          </div>
                        )}
                        {section.disclaimer && (
                          <p className="text-sm text-secondary/70 dark:text-white/60">{section.disclaimer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {pageContent?.exclusions && pageContent.exclusions.length > 0 && (
                  <div className="flex flex-col gap-4 mt-6 sm:mt-8">
                    <h3 className="font-semibold text-xl">Services We Do Not Provide</h3>
                    <ul className="flex flex-col gap-2">
                      {pageContent.exclusions.map((item, index) => (
                        <li key={index} className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                </div>

                {/* Sidebar - Pricing Card */}
                <div className="flex flex-col gap-4 sm:gap-8 w-full lg:w-[360px] xl:w-[380px] lg:shrink-0">
                {notice || needsPriorVisit ? (
                  <div className="relative bg-secondary shadow-xl p-5 xl:py-8 xl:px-6 w-full h-fit rounded-md">
                    <div className="relative z-10 flex flex-col gap-6 rounded-md">
                      <div className="rounded-md border border-white/30 bg-white/10 px-4 py-3 text-center">
                        <p className="text-white text-sm font-semibold tracking-[0.2em]">
                          {notice?.title || "A PRIOR VISIT IS REQUIRED"}
                        </p>
                      </div>
                      <p className="text-white/80 text-sm">
                        {notice?.text ||
                          "Projects vary by square footage, access, and scheduling needs. We&apos;ll visit your facility first to provide an accurate quote."}
                      </p>
                      <RequestSiteVisitButton
                        className="mt-2 bg-primary hover:bg-deep-blue text-white font-semibold py-4 px-8 rounded-md transition-colors duration-300 text-center"
                        label={notice?.button_text || "Request a Site Visit"}
                        serviceSlug={service.slug}
                      />
                    </div>
                    <Image
                      src="/images/aboutus/about-ellipse-img.svg"
                      alt="decorative"
                      width={150}
                      height={150}
                      className="absolute right-0 bottom-0 rounded-md"
                    />
                  </div>
                ) : (
                  <div className="relative bg-secondary shadow-xl p-5 xl:py-8 xl:px-6 w-full h-fit rounded-md">
                    <div className="relative z-10 flex flex-col gap-6 rounded-md">
                      <div className="flex flex-col flex-wrap gap-2">
                        <span className="text-white/80">
                          <s>${(parseFloat(displayPrice) * 1.5).toFixed(2)}</s>
                        </span>
                        <h4 className="text-white font-semibold text-3xl">${displayPrice}</h4>
                      </div>
                      
                      <ul className="relative flex flex-col gap-2">
                        {service.features && service.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Image src="/images/icon/star-icon.svg" alt="feature-icon" width={20} height={20} />
                            <p className="text-white text-sm">{feature}</p>
                          </li>
                        ))}
                      </ul>
                      
                      <Link
                        href={`/quote/${service.slug}`}
                        className="mt-2 bg-primary hover:bg-deep-blue text-white font-semibold py-4 px-8 rounded-md transition-colors duration-300 text-center"
                      >
                        Book a Service
                      </Link>
                    </div>
                    <Image
                      src="/images/aboutus/about-ellipse-img.svg"
                      alt="decorative"
                      width={150}
                      height={150}
                      className="absolute right-0 bottom-0 rounded-md"
                    />
                  </div>
                )}

                {/* Testimonial */}
                <div className="border border-natural-gray dark:border-natural-gray/40 flex flex-col gap-3 sm:gap-5 rounded-md p-5 xl:py-8 xl:px-6">
                  <Image src="/images/icon/home-icon.svg" alt="home-icon" width={45} height={45} />
                  <p className="text-secondary/80 dark:text-white/80">
                    {testimonial?.text ||
                      "Integrity Clean Solutions made our post-construction cleanup effortless. The crew was on time, professional, and left every surface spotless. We&apos;ll absolutely use them again."}
                  </p>
                  <div className="flex items-center gap-5">
                    <Image
                      src={testimonial?.image || "/images/services/customer-img.jpg"}
                      alt="customer"
                      height={80}
                      width={80}
                      className="rounded-full"
                    />
                    <div>
                      <h6 className="font-semibold">{testimonial?.name || "Emily & John Smith"}</h6>
                      <p className="text-secondary/80 dark:text-white/80">{testimonial?.role || "Clients"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center pt-8">
              <Link href="/services" className="text-primary hover:underline text-lg">
                ← Back to All Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesDetail;
