import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AboutusBanner = () => {
    return (
        <section>
            <div className="relative pt-24 lg:pt-32 bg-secondary">
                <div className="container">
                    <div className='relative flex flex-col gap-10 lg:gap-16 xl:gap-20 pt-14 lg:pt-28 pb-14 z-10'>
                        <div className='flex lg:flex-row flex-col items-center gap-5 lg:gap-10'>
                            <div className='flex flex-col gap-3 lg:max-w-2xl w-full'>
                                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                    <p className="font-semibold text-white">Integrity Cleaning</p>
                                </div>
                                <h1 className='text-white font-semibold text-3xl md:text-4xl'>Making automation accessible to everyone</h1>
                            </div>
                            <div>
                                <p className='text-white text-lg lg:pl-9 xl:pl-20'>We’ll create high-quality linkable content and build at least 40 high-authority links to each asset, paving the way for you to grow your ranking, improve brand.</p>
                            </div>
                        </div>
                        <Link href="#whoweare" className='py-9 px-3 border border-dusty-gray w-fit rounded-4xl cursor-pointer'>
                            <Image src={"/images/aboutus/down-arrow.svg"} alt='down-arrow' width={24} height={24} className=''/>
                        </Link>
                    </div>
                </div>
                <Image src={"/images/aboutus/about-ellipse-img.svg"} alt='ellipse-img' width={316} height={316} className='absolute right-0 bottom-0'/>
            </div>
        </section>
    )
}

export default AboutusBanner
