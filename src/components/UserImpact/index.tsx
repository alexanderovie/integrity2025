"use client";
import Link from 'next/link'
import { useRef } from 'react';
import { motion,useInView } from "framer-motion";

const UserImpact = () => {
    const ref = useRef(null);
    const inView = useInView(ref);
    const bottomAnimation = {
        initial: { y: "20%", opacity: 0 },
        animate: inView ? { y: 0, opacity: 1 } : { y: "10%", opacity: 0 },
        transition: { duration: 1, delay: 0.8 },
    };
    return (
        <section>
            <div ref={ref} className='relative'>
                <div className="bg-gradient-to-b from-[rgba(33,46,52,0.1)] to-[rgba(33,46,52,0.56)] dark:bg-white/60 xxl:bg-[url('/images/home/userimpact/userimpact-bg.png')] bg-cover bg-no-repeat bg-center h-full flex justify-center items-center">
                    <div className="container">
                        <div className='grid grid-cols-1 xxl:grid-cols-2'>
                            <div></div>
                            <motion.div {...bottomAnimation} className='flex flex-col gap-5 py-20 xxl:py-52 xxl:items-start items-center text-center xxl:text-left'>
                                <h2 className='text-6xl md:text-7xl font-bold dark:text-secondary'>408K+</h2>
                                <div className='flex flex-col gap-4'>
                                    <h4 className='font-semibold text-white dark:text-secondary'>
                                        People who have started <span className='text-primary'>cleaning</span>
                                    </h4>
                                    <p>Cleaning services in England cater to a wide range of needs from residential.</p>
                                </div>
                                <Link
                                    href={"/"}
                                    className="py-3.5 px-6 w-fit bg-primary hover:bg-deep-blue transition-colors duration-300 rounded-md"
                                >
                                    <span className="font-semibold text-white">Get a free quote</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UserImpact
