
import ContactForm from './ContactForm'
import Image from 'next/image'

const ContactBanner = () => {
  return (
    <section>
      <div className="relative pt-24 lg:pt-32">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner/hero-bg.png"
            alt="Contact Integrity Clean Solutions - Orlando Cleaning Experts"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container relative z-10">
            <div className='py-16 lg:py-28 flex items-center justify-center'>
              <div className='flex flex-col gap-3 items-center text-center max-w-[600px]'>
                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                  <p className="font-semibold text-white">Contact us</p>
                </div>
                <h1 className='text-white font-semibold text-3xl md:text-4xl'>
                  Contact Our Orlando Cleaning Experts | Get Free Quote Today
                </h1>
                <p className='text-white/80 text-lg'>Connect with our Orlando cleaning specialists for tailored residential or commercial maintenance, flexible scheduling, and reliable follow-up support.</p>
              </div>
            </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default ContactBanner
