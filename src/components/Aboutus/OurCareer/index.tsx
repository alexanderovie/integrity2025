import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const OurCareer = () => {
    return (
        <section>
            <div className='py-20 md:py-28 bg-offwhite-warm dark:bg-dark-gray'>
                <div className="container">
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div className='w-full h-full'>
                            <Image src="/images/aboutus/our-career/our-career-bg.png" alt='image' width={680} height={512} className='w-full h-full object-cover' />
                        </div>
                        <div className='flex flex-col justify-center gap-6  px-10 lg:px-14 py-12 lg:py-20'>
                            <div className='flex flex-col gap-3'>
                                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                    <p className="font-semibold text-white">Integrity Cleaning</p>
                                </div>
                                <h2 className='font-semibold'>Interested in joining us?</h2>
                            </div>
                            <p className='dark:text-white/80'>We’re always on the hunt for people who share our mission of giving our customers a great day. If you’re looking to build your career, achieve your goals, and realize your full potential - come and join us.</p>
                            <Link href={"/contact-us"} className='w-fit text-white bg-secondary py-3.5 px-8 rounded-md hover:text-primary'>
                                Explore our careers
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OurCareer
