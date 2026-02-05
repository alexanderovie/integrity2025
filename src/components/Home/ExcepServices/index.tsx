"use client";
import { useRef } from 'react';
import { ExcepServicesData } from './data';
import { motion, useInView } from 'framer-motion';

const ExcepServices = () => {
    const ref = useRef(null);
    const inView = useInView(ref);

    const bottomAnimation = (index: number) => ({
        initial: { y: "5%", opacity: 0 },
        animate: inView ? { y: 0, opacity: 1 } : { y: "10%", opacity: 0 },
        transition: { duration: 0.4, delay: 0.4 + index * 0.3 },
    });
    return (
        <section>
            <div ref={ref} className='dark:bg-dark-gray'>
                <div className="container">
                    <div className='flex flex-col gap-10 sm:gap-16 border-t border-natural-gray dark:border-natural-gray/20 py-20 sm:py-28'>
                        <div className="flex flex-col gap-3 items-center justify-center text-center">
                            <div className="bg-primary w-fit  rounded-full py-1 px-4">
                                <p className="font-semibold text-white">Why choose us?</p>
                            </div>
                            <h2 className='font-semibold text-3xl md:text-4xl max-w-[574px]'>Integrity Clean Solutions for Orlando Businesses & Homes</h2>
                        </div>
                        <div className='grid grid-cols-1 xsm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-10'>
                            {ExcepServicesData.map((item, index) => {
                                return (
                                    <motion.div
                                        key={index}
                                        className='flex flex-col gap-4 lg:gap-8'
                                        {...bottomAnimation(index)}
                                    >
                                        <div className='py-2 px-2.5  bg-primary rounded-full w-fit'>
                                            <span className='font-bold text-white'>0{item.id}</span>
                                        </div>
                                        <p className='font-normal text-dusty-gray dark:text-white/70'>{item.title}</p>
                                    </motion.div>
                                );
                            })}

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ExcepServices
