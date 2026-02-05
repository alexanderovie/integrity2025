import { query } from '@/lib/db/neon'
import Image from 'next/image'
import Link from 'next/link'

const IMAGENES_POR_SLUG: Record<string, string> = {
  'regular-cleaning': '/images/services/regular-cleaning.jpg',
  'deep-cleaning': '/images/services/deep-cleaning.jpg',
  'carpet-cleaning': '/images/services/carpet-cleaning.jpg',
  'move-in-out-cleaning': '/images/services/move-out-cleaning.jpg',
  'post-construction-cleaning': '/images/services/post-construction-cleaning.jpg',
  'commercial-cleaning': '/images/services/commercial-office-cleaning-1.jpg',
};

async function obtenerServicios() {
  const servicios = await query<{
    id: string;
    slug: string;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    hero_icon: string | null;
  }>(`SELECT id, slug, nombre, descripcion, precio_base, hero_icon FROM public.services WHERE activo = true ORDER BY nombre ASC`);

  const serviceIds = servicios.map(s => s.id);

  const frecuencias = await query<{
    service_id: string;
    frecuencia: string;
    etiqueta: string;
    multiplicador: string | number;
  }>(`SELECT service_id, frecuencia, etiqueta, multiplicador FROM public.service_frequencies WHERE activo = true AND service_id = ANY($1)`, [serviceIds]);

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
}

const ServicesListing = async () => {
  const servicios = await obtenerServicios();

  return (
    <section>
      <div className="relative pt-24 lg:pt-32 bg-secondary">
        <div className="container">
          <div className='relative flex flex-col gap-10 lg:gap-16 xl:gap-20 pt-14 lg:pt-28 pb-24 lg:pb-32 z-10'>
            <div className='flex flex-col items-center gap-5 lg:gap-10 text-center'>
              <div className='flex flex-col gap-3 lg:max-w-2xl w-full items-center'>
                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                  <p className="font-semibold text-white">Integrity Cleaning</p>
                </div>
                <h1 className='text-white font-semibold text-3xl md:text-4xl'>Professional Cleaning Services in Orlando | Sparkling Clean</h1>
              </div>
              <div className="max-w-2xl">
                <p className='text-white text-lg'>Discover our full range of residential and commercial cleaning services. From deep cleaning to routine maintenance, our trusted team ensures your space is spotless and sanitized.</p>
              </div>
            </div>
          </div>
        </div>
        <Image src={"/images/aboutus/about-ellipse-img.svg"} alt='ellipse-img' width={316} height={316} className='absolute right-0 bottom-0' />
      </div>
      <div className='dark:bg-dark-gray'>
        <div id="services-list" className='container'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 py-28'>
            {servicios.map((servicio) => {
              const displayPrice = (servicio.precio_base / 100).toFixed(2);
              const imagen = servicio.hero_icon || IMAGENES_POR_SLUG[servicio.slug] || '/images/services/regular-cleaning.jpg';

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
                      <Link href={`/services/${servicio.slug}`}><p className='text-xl font-semibold text-light-olive cursor-pointer'>${displayPrice}</p></Link>
                      <p className='text-[10px] uppercase tracking-[0.2em] text-dusty-gray whitespace-nowrap'>Starting at</p>
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
