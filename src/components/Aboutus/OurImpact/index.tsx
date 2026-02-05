"use client";
import { OurImpactData } from './data'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer';

const OurImpact = () => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.5,
    });
    return (
        <section>
            <div className="bg-[url('/images/aboutus/our-impact/our-impact-bg.png')] bg-cover bg-no-repeat bg-center h-full flex justify-center items-center">
                <div className="container">
                    <div className='flex flex-col gap-6 md:gap-14 py-20 md:py-28'>
                        <div className='flex flex-col gap-3.5'>
                            <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                <p className="font-semibold text-white">Our Impact</p>
                            </div>
                            <h2 className='font-semibold text-white'>Our impact</h2>
                            <p className='text-white'>Trusted by homeowners and businesses across Orlando for consistent results and dependable service.</p>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-10'>
                            {OurImpactData.map((item, index) => {
                                return (
                                    <div key={index} className='flex flex-col gap-4 bg-white dark:bg-secondary py-4 md:py-8 px-5 md:px-6 rounded-md'>
                                        <h2 ref={ref} className="font-black text-light-olive">
                                            {inView ? <CountUp start={0} end={item.count} duration={3} /> : "0"}
                                            {item.postfix && item.postfix}
                                        </h2>
                                        <p className='dark:text-white/80'>{item.title}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OurImpact
