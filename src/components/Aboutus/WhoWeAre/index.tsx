import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const WhoWeAre = () => {
    return (
        <section id="whoweare">
            <div className='py-20 md:py-28 dark:bg-dark-gray'>
                <div className="container">
                    <div className='grid grid-cols-1 md:grid-cols-2'>
                        <div className='w-full h-full'>
                            <Image src="/images/aboutus/who-we-are-img.png" alt='image' width={680} height={512} className='w-full h-full object-cover rounded-l-md' />
                        </div>
                        <div className='flex flex-col justify-center rounded-r-md gap-6 bg-offwhite-warm dark:bg-secondary px-10 lg:px-14 py-12 lg:py-20'>
                            <div className='flex flex-col gap-3'>
                                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                    <p className="font-semibold text-white">Who We Are</p>
                                </div>
                                <h2 className='font-semibold'>More Time for What Matters</h2>
                            </div>
                            <p className='dark:text-white/70'>From routine maintenance to deep cleans and move-outs, we tailor each plan to your property size, schedule, and priorities—so you get quality without the hassle.</p>
                            <Link href={"/services"} className='w-fit text-secondary dark:text-white border-b-2 border-light-olive hover:text-light-olive'>
                                View services
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WhoWeAre
