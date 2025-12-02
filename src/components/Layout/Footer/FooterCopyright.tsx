import React from 'react'
import { FooterData } from './data'
import Link from 'next/link'

const FooterCopyright = () => {
    return (
        <div className='container'>
            <div className='py-4 md:py-6 flex flex-col md:flex-row gap-2 md:gap-5 justify-between items-center'>
                <p className='text-center md:text-left text-secondary/70 dark:text-white/70'>
                    © 2025 Integrity Clean Solutions — Design &amp; Developed by{" "}
                    <Link className='hover:text-secondary dark:hover:text-white' href="https://www.fascinantedigital.com/">
                        Fascinante Digital
                    </Link>.
                </p>
                <div className='flex md:flex-nowrap flex-wrap row-gap-2 gap-x-5 justify-center'>
                    {FooterData.copyrightLink.map((item, index) => {
                        return (
                            <Link href={item.href} key={index}>
                                <p className='whitespace-nowrap text-secondary/70 dark:text-white/70 hover:text-secondary dark:hover:text-white'>{item.name}</p>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default FooterCopyright
