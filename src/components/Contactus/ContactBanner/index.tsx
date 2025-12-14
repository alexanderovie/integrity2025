
import ContactForm from './ContactForm'

const ContactBanner = () => {
  return (
    <section>
      <div className='relative pt-24 lg:pt-32 bg-[linear-gradient(to_bottom,_#1f2a2e_70%,_#FFFF_30%)] dark:bg-[linear-gradient(to_bottom,_#1f2a2e_70%,_#303c40_30%)]'>
        <div className="container">
          <div className='py-16 lg:py-28 flex items-center justify-center'>
            <div className='flex flex-col gap-3 items-center text-center max-w-4xl'>
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
