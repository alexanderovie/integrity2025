import React from 'react'
import { FooterData } from './data'
import Link from 'next/link'
import Image from 'next/image'

const FooterInfo = () => {
    return (
        <div className="container">
            <div className='relative flex sm:flex-row flex-col justify-between gap-10 pt-9 md:pt-16 pb-20 md:pb-28 border-b border-secondary/15 dark:border-white/15'>
                <div className='flex flex-col gap-6'>
                    <h4 className='font-semibold max-w-[610px]'>A cleaner home is just a call away - start your journey today.</h4>
                    <Link
                        href={"/contact-us"}
                        className="w-fit bg-primary hover:bg-deep-blue transition-colors duration-300 py-3.5 px-7 rounded-md font-semibold text-white"
                    >
                        Contact us
                    </Link>
                </div>
                <div className='flex gap-10 md:gap-20 xl:gap-48 xl:pr-40'>
                    <ul className='flex flex-col gap-4'>
                        {FooterData.usefulLinks.map((item, index) => {
                            return (
                                <Link href={item.href} key={index}>
                                    <li className='text-secondary/70 dark:text-white/70 whitespace-nowrap hover:text-secondary dark:hover:text-white'>{item.name}</li>
                                </Link>
                            )
                        })}
                    </ul>
                    <ul className='flex flex-col gap-4'>
                        {FooterData.privacyLink.map((item, index) => {
                            return (
                                <Link href={item.href} key={index}>
                                    <li className='text-secondary/70 dark:text-white/70 whitespace-nowrap hover:text-secondary dark:hover:text-white'>{item.name}</li>
                                </Link>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default FooterInfo
