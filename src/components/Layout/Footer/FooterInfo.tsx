import React from 'react'
import { FooterData } from './data'
import Link from 'next/link'

const FooterInfo = () => {
    return (
        <div className="container">
            <div className='relative flex sm:flex-row flex-col justify-between gap-10 pt-9 md:pt-16 pb-20 md:pb-28 border-b border-secondary/15 dark:border-white/15'>
                <div className='flex flex-col gap-6'>
                    <h4 className='font-semibold max-w-[610px]'>A cleaner, brighter home is one call away — start your fresh journey today.</h4>
                    <Link
                        href={"/contact-us"}
                        className="w-fit bg-primary hover:bg-deep-blue transition-colors duration-300 py-3.5 px-7 rounded-md font-semibold text-white"
                    >
                        Contact us
                    </Link>
                </div>
                <div className='flex gap-6 xl:gap-10 flex-wrap pl-0 md:pl-8'>
                    <div className='flex flex-col gap-3 pl-4 md:pl-0'>
                        <h3 className='text-secondary font-semibold dark:text-white text-lg lg:text-[22px]'>Quick Links</h3>
                        <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                            <ul className='flex flex-col gap-2 text-sm text-secondary/70 dark:text-white/70'>
                                {FooterData.quickLinks1.map((item, index) => {
                                    return (
                                        <li key={index} className='whitespace-nowrap'>
                                            <Link href={item.href} className='hover:text-secondary dark:hover:text-white'>
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                            <ul className='flex flex-col gap-2 text-sm text-secondary/70 dark:text-white/70'>
                                {FooterData.quickLinks2.map((item, index) => {
                                    return (
                                        <li key={index} className='whitespace-nowrap'>
                                            <Link href={item.href} className='hover:text-secondary dark:hover:text-white'>
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3 min-w-[220px]'>
                        <h6 className='text-secondary font-semibold dark:text-white'>Service Areas</h6>
                        <ul className='grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-secondary/70 dark:text-white/70'>
                            {FooterData.serviceAreas.map((area, index) => {
                                return (
                                    <li key={index}>
                                        <Link
                                            href={area.href}
                                            className='hover:text-secondary dark:hover:text-white'
                                        >
                                            {area.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FooterInfo
