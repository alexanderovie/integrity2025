
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
                            <h2 className='text-white font-semibold'>Have questions? Ready to help!</h2>
                            <p className='text-white/80 text-lg'>We’ll create high-quality linkable content and build at least 40 high-authority links to each asset, paving the way for you to grow your ranking, improve brand.</p>
                        </div>
                    </div>
                    <ContactForm/>
                </div>
            </div>
        </section>
    )
}

export default ContactBanner