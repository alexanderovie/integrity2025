import Image from "next/image";
import Link from "next/link";

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
};

type ServiceDetailProps = {
  service: ServiceData;
};

const ServicesDetail = ({ service }: ServiceDetailProps) => {
  const displayPrice = (service.precio_base / 100).toFixed(2);

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
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Description */}
                <p className="text-base md:text-lg text-secondary/80 dark:text-white/80">
                  {service.descripcion || `Professional ${service.nombre} service in Orlando. Contact us for a free quote today.`}
                </p>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h6 className="font-semibold text-xl">Features</h6>
                    <ul className="flex flex-col gap-3">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Image src="/images/icon/verified-icon.svg" alt="verified-icon" width={24} height={24} />
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
                  <div className="flex flex-col gap-4">
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
              </div>

              {/* Sidebar - Pricing Card */}
              <div className="flex flex-col gap-4 sm:gap-8 w-full lg:w-[360px] xl:w-[380px] lg:shrink-0">
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

                {/* Testimonial */}
                <div className="border border-natural-gray dark:border-natural-gray/40 flex flex-col gap-3 sm:gap-5 rounded-md p-5 xl:py-8 xl:px-6">
                  <Image src="/images/icon/home-icon.svg" alt="home-icon" width={45} height={45} />
                  <p className="text-secondary/80 dark:text-white/80">
                    I found my ideal home in no time! The listings were detailed, the photos were accurate,
                    and the whole process felt seamless. Customer service was top-notch, answering all my
                    questions. I will definitely use this platform again in the future!
                  </p>
                  <div className="flex items-center gap-5">
                    <Image
                      src="/images/services/customer-img.jpg"
                      alt="customer"
                      height={80}
                      width={80}
                      className="rounded-full"
                    />
                    <div>
                      <h6 className="font-semibold">Emily & John Smith</h6>
                      <p className="text-secondary/80 dark:text-white/80">Clients</p>
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
