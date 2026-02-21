"use client";
import Image from 'next/image'
import { useRef } from 'react'
import { cleaninghighlight } from './data'
import Link from 'next/link'
import { motion, useInView } from "framer-motion";

function CleaningHighlight() {
    const ref = useRef(null);
    const inView = useInView(ref);
    const bottomAnimation = {
        initial: { y: "20%", opacity: 0 },
        animate: inView ? { y: 0, opacity: 1 } : { y: "10%", opacity: 0 },
        transition: { duration: 1, delay: 0.8 },
    };
    return (
        <section>
            <div ref={ref} className='py-20 sm:py-28 bg-white dark:bg-dark-gray'>
                <div className="container">
                    <div className='flex flex-col md:flex-row items-center justify-between gap-10'>
                        <motion.div {...bottomAnimation} className="flex flex-col gap-10 max-w-2xl lg:pr-16">
                            <div className='flex flex-col gap-8'>
                                <div className='flex flex-col gap-4'>
                                        <div className='flex flex-col gap-3'>
                                        <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                        <p className="font-semibold text-white">Commercial Cleaning</p>
                                        </div>
                                    <h2 className='font-semibold text-3xl md:text-4xl'>Commercial Cleaning that elevates your Workplace</h2>
                                    </div>
                                <div className="flex flex-col gap-3">
                                    <p className='text-base dark:text-white/70'>Integrity Clean Solutions delivers reliable <strong>commercial</strong> cleaning services for offices, retail spaces, hospitality, and professional facilities in Greater Orlando Area.</p>
                                    <p className='text-base dark:text-white/70'>Our operations are supervised with OSHA-aware <strong>practices</strong>, ensuring safe routines, consistent results, and minimal disruption to your business.</p>
                                </div>
                                </div>
                                <div className='grid grid-cols-1 xsm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-6 xxl:gap-x-10 gap-y-2 lg:gap-y-6'>
                                    {cleaninghighlight.map((item, index) => {
                                        return (
                                            <div key={index} className='flex items-start gap-4'>
                                                <Image src={item.image} alt='image' width={48} height={48} />
                                                <div className="flex flex-col gap-1">
                                                    <p className='font-semibold dark:text-white/70'>{item.title}</p>
                                                    {item.description && (
                                                        <p className="text-sm text-secondary/70 dark:text-white/60">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <Link
                                href={"/services/commercial-cleaning"}
                                className="w-fit group flex items-center py-3 px-6 bg-secondary hover:bg-deep-blue transition-colors duration-300 rounded-sm"
                            >
                                <span className="text-base text-white group-hover:text-white font-bold">View Commercial Cleaning</span>
                            </Link>
                        </motion.div>
                        <motion.div {...bottomAnimation} className='relative'>
                            <Image
                              src={"/images/home/cleaninghighlight/Commercial-Cleaning.PNG.png"}
                              alt="image"
                              width={680}
                              height={655}
                              sizes="(max-width: 768px) 90vw, 380px"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CleaningHighlight
