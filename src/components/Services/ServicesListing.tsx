import { query } from '@/lib/db/neon'
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from '@/lib/cache-tags';
import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache';
import { SERVICE_IMAGE_BY_SLUG } from "@/lib/services/serviceImages";

const QUERY_TIMEOUT_MS = 4000;

const OVERRIDE_IMAGES: Record<string, string> = {
  'deep-cleaning': '/images/services/deep-cleaning.png',
  'move-in-out-cleaning': '/images/services/move-out-cleaning.png',
  'regular-cleaning': '/images/services/regular-cleaning.png',
  'airbnb-cleaning': '/images/services/airbnb-cleaning.png',
};

type ServicioConFrecuencias = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  hero_icon: string | null;
  frecuencias: Array<{ frecuencia: string; etiqueta: string; multiplicador: number }>;
};

const FALLBACK_SERVICIOS: ServicioConFrecuencias[] = [
  {
    id: "fallback-regular-cleaning",
    slug: "regular-cleaning",
    nombre: "Regular Cleaning",
    descripcion: "Recurring home cleaning tailored to weekly, bi-weekly, or monthly schedules.",
    precio_base: 12000,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-deep-cleaning",
    slug: "deep-cleaning",
    nombre: "Deep Cleaning",
    descripcion: "Detailed top-to-bottom cleaning for kitchens, bathrooms, and high-touch surfaces.",
    precio_base: 25000,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-move-in-out-cleaning",
    slug: "move-in-out-cleaning",
    nombre: "Move In/Out Cleaning",
    descripcion: "Inspection-ready cleaning support for moving days and property turnovers.",
    precio_base: 30000,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-airbnb-cleaning",
    slug: "airbnb-cleaning",
    nombre: "Airbnb Cleaning",
    descripcion: "Short-term rental cleaning and turnover support for guest-ready properties.",
    precio_base: 0,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-commercial-cleaning",
    slug: "commercial-cleaning",
    nombre: "Commercial Cleaning",
    descripcion: "Custom janitorial support for offices, clinics, and business facilities.",
    precio_base: 0,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-post-construction-cleaning",
    slug: "post-construction-cleaning",
    nombre: "Post-Construction Cleaning",
    descripcion: "Detailed cleanup after remodeling, renovation, and construction work.",
    precio_base: 0,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-carpet-cleaning",
    slug: "carpet-cleaning",
    nombre: "Carpet Cleaning",
    descripcion: "Professional carpet care for odor, stain, and deep fiber removal needs.",
    precio_base: 18000,
    hero_icon: null,
    frecuencias: [],
  },
];

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

async function obtenerServicios(): Promise<ServicioConFrecuencias[]> {
  try {
  const servicios = await withTimeout(query<{
    id: string;
    slug: string;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    hero_icon: string | null;
  }>(`SELECT id, slug, nombre, descripcion, precio_base, hero_icon FROM public.services WHERE activo = true ORDER BY nombre ASC`), QUERY_TIMEOUT_MS);

  const serviceIds = servicios.map(s => s.id);

  const frecuencias = await withTimeout(query<{
    service_id: string;
    frecuencia: string;
    etiqueta: string;
    multiplicador: string | number;
  }>(`SELECT service_id, frecuencia, etiqueta, multiplicador FROM public.service_frequencies WHERE activo = true AND service_id = ANY($1)`, [serviceIds]), QUERY_TIMEOUT_MS);

  const frecPorServicio = new Map<string, Array<{ frecuencia: string; etiqueta: string; multiplicador: number }>>();
  for (const f of frecuencias) {
    const arr = frecPorServicio.get(f.service_id) ?? [];
    arr.push({ frecuencia: f.frecuencia, etiqueta: f.etiqueta, multiplicador: Number(f.multiplicador) });
    frecPorServicio.set(f.service_id, arr);
  }

  return servicios.map(s => ({
    ...s,
    frecuencias: frecPorServicio.get(s.id) ?? [],
  }));
  } catch (error) {
    console.error("Failed to load services catalog, using fallback data", error);
    return FALLBACK_SERVICIOS;
  }
}

const obtenerServiciosCacheados = unstable_cache(
  obtenerServicios,
  [CACHE_TAGS.servicesCatalog],
  {
    revalidate: CACHE_REVALIDATE_SECONDS.servicesCatalog,
    tags: [CACHE_TAGS.servicesCatalog],
  },
);

const ServicesListing = async () => {
  const servicios = await obtenerServiciosCacheados();

  return (
    <section>
      <div className="relative pt-24 lg:pt-32 bg-secondary">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner/hero-bg.png"
            alt="Professional Cleaning Services in Orlando"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container relative z-10">
          <div className='relative flex flex-col gap-10 lg:gap-16 xl:gap-20 pt-14 lg:pt-28 pb-14 lg:pb-28 z-10'>
            <div className='flex flex-col items-center gap-5 lg:gap-10 text-center'>
              <div className='flex flex-col gap-3 lg:max-w-2xl w-full items-center'>
                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                  <p className="font-semibold text-white">Integrity Cleaning</p>
                </div>
                <h1 className='text-white font-semibold text-3xl md:text-4xl'>Professional Cleaning Services in Orlando | Sparkling Clean</h1>
              </div>
              <div className="max-w-2xl">
                <p className='text-white text-lg'>Discover our range of cleaning services. From deep cleaning to routine maintenance, our trusted team ensures your space is spotless.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='dark:bg-dark-gray'>
        <div id="services-list" className='container'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 py-28'>
            {servicios.map((servicio) => {
              const displayPrice = (servicio.precio_base / 100).toFixed(2);
              const imagen =
                OVERRIDE_IMAGES[servicio.slug] ||
                servicio.hero_icon ||
                SERVICE_IMAGE_BY_SLUG[servicio.slug] ||
                "/images/services/regular-cleaning.png";

              return (
                <div key={servicio.id} className='group border border-foggy-clay dark:border-natural-gray/20 rounded-md'>
                  <div className='w-full h-[300px] overflow-hidden rounded-t-md'>
                    <Link href={`/services/${servicio.slug}`}>
                      <Image
                        src={imagen}
                        alt={servicio.nombre}
                        width={320}
                        height={300}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className='group-hover:scale-110 transition-all ease-in duration-300 w-full h-full object-cover rounded-t-md cursor-pointer'
                      />
                    </Link>
                  </div>
                  <div className='p-3 flex justify-between items-center'>
                    <Link href={`/services/${servicio.slug}`}><h6 className='font-semibold dark:text-white cursor-pointer'>{servicio.nombre}</h6></Link>
                    <div className='flex flex-col items-end gap-1'>
                      {servicio.slug === "commercial-cleaning" || servicio.slug === "airbnb-cleaning" || servicio.slug === "post-construction-cleaning" ? (
                        <p className='text-[10px] uppercase tracking-[0.2em] font-semibold text-primary'>A PRIOR VISIT<br />IS REQUIRED</p>
                      ) : (
                        <>
                          <Link href={`/services/${servicio.slug}`}><p className='text-xl font-semibold text-light-olive cursor-pointer'>${displayPrice}</p></Link>
                          <p className='text-[10px] uppercase tracking-[0.2em] text-dusty-gray whitespace-nowrap'>Starting at</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesListing
