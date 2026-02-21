import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const WhoWeAre = () => {
    return (
        <section id="whoweare">
            <div className='py-20 md:py-28 dark:bg-dark-gray'>
                <div className="container">
                    <div className='flex flex-col gap-12 lg:gap-16'>
                        <div className='grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-md border border-natural-gray/30 dark:border-natural-gray/20'>
                            <div className='w-full h-full min-h-[320px]'>
                                <Image
                                    src="/images/aboutus/professionalresidential-cleaning-kitchen-service.png"
                                    alt='Professional residential kitchen cleaning service in Orlando'
                                    width={680}
                                    height={512}
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='flex flex-col justify-center gap-6 bg-offwhite-warm dark:bg-secondary px-8 lg:px-12 py-10 lg:py-16'>
                                <div className='flex flex-col gap-3'>
                                    <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                        <p className="font-semibold text-white">Who We Are</p>
                                    </div>
                                    <h2 className='font-semibold text-3xl md:text-4xl'>
                                        More time to live, work, and enjoy what matters most
                                    </h2>
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <p className='dark:text-white/70'>
                                        At Integrity Clean Solutions, we help homeowners, professionals, and businesses reclaim their time by taking care of their spaces with precision and care. Our cleaning services are designed to fit real life whether you need regular home cleaning, reliable commercial maintenance, or support for rental properties.
                                    </p>
                                    <p className='dark:text-white/70'>
                                        We do not rush jobs or cut corners. We follow defined procedures, detailed checklists, and quality control standards to ensure your space is cleaned thoroughly, consistently, and responsibly so you can focus on what truly matters.
                                    </p>
                                </div>
                                <Link href={'/services'} className='w-fit text-secondary dark:text-white border-b-2 border-light-olive hover:text-light-olive'>
                                    View services
                                </Link>
                            </div>
                        </div>

                        <div className='relative overflow-hidden rounded-md bg-secondary dark:bg-black px-8 py-10 md:px-12 md:py-14'>
                            <div className='absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl' />
                            <div className='absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-light-olive/20 blur-3xl' />

                            <div className='relative z-10 flex flex-col gap-8'>
                                <div className='flex flex-col gap-4 max-w-4xl'>
                                    <div className='bg-white/15 w-fit rounded-full px-4 py-1 text-white text-sm font-semibold'>
                                        Why Choose Integrity Clean Solutions
                                    </div>
                                    <h2 className='font-semibold text-white text-3xl md:text-4xl'>
                                        Why Choose Integrity Clean Solutions for Professional Cleaning in Orlando, FL
                                    </h2>
                                    <p className='text-white/85'>
                                        Integrity Clean Solutions LLC is a locally owned and operated cleaning company based in Orlando, Florida, built on reliability, structure, and accountability. We do not believe in rushed cleanings or inconsistent results. Every service we provide follows defined procedures, detailed checklists, and quality control standards designed to deliver the same level of care on every visit.
                                    </p>
                                    <p className='text-white/80'>
                                        Our team is carefully selected, professionally trained, verified, and fully insured. We use proven cleaning methods that protect your property while ensuring thorough, efficient, and consistent results. From residential homes to commercial spaces, we approach every cleaning with professionalism, discretion, and respect.
                                    </p>
                                    <p className='text-white/80'>
                                        What truly sets Integrity Clean Solutions apart is our commitment to long-term trust. We focus on clear communication, dependable scheduling, and consistent performance so our clients can confidently rely on us as their ongoing cleaning partner in Orlando and surrounding areas.
                                    </p>
                                    <p className='text-white/80'>
                                        When you choose Integrity Clean Solutions, you are choosing a cleaning company that values honesty, responsibility, and results without shortcuts.
                                    </p>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5'>
                                    <div className='flex items-start gap-3 rounded-md border border-white/20 bg-white/10 p-4'>
                                        <Image src="/images/icon/verified-icon.svg" alt="verified icon" width={28} height={28} />
                                        <p className='text-white font-medium'>Locally owned and operated cleaning company in Orlando, FL</p>
                                    </div>
                                    <div className='flex items-start gap-3 rounded-md border border-white/20 bg-white/10 p-4'>
                                        <Image src="/images/icon/verified-icon.svg" alt="verified icon" width={28} height={28} />
                                        <p className='text-white font-medium'>Professional residential and commercial cleaning services</p>
                                    </div>
                                    <div className='flex items-start gap-3 rounded-md border border-white/20 bg-white/10 p-4'>
                                        <Image src="/images/icon/verified-icon.svg" alt="verified icon" width={28} height={28} />
                                        <p className='text-white font-medium'>Trained, verified, and fully insured cleaning professionals</p>
                                    </div>
                                    <div className='flex items-start gap-3 rounded-md border border-white/20 bg-white/10 p-4'>
                                        <Image src="/images/icon/verified-icon.svg" alt="verified icon" width={28} height={28} />
                                        <p className='text-white font-medium'>Structured processes, detailed checklists, and quality control</p>
                                    </div>
                                    <div className='flex items-start gap-3 rounded-md border border-white/20 bg-white/10 p-4 md:col-span-2'>
                                        <Image src="/images/icon/verified-icon.svg" alt="verified icon" width={28} height={28} />
                                        <p className='text-white font-medium'>Consistent, reliable, and trustworthy cleaning results</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WhoWeAre
