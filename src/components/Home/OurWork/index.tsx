'use client'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'
import { WorkData } from './data'
import Marquee from 'react-fast-marquee'

const Ourwork = () => {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const zoomRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (zoomRef.current && !zoomRef.current.contains(event.target as Node)) {
                closeZoom()
            }
        }

        if (zoomedImage) {
            setTimeout(() => setIsVisible(true), 10)
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [zoomedImage])

    const closeZoom = () => {
        setIsVisible(false)
        setTimeout(() => setZoomedImage(null), 300)
    }

    return (
        <section>
            <div className='py-20 sm:py-28 flex flex-col gap-9 sm:gap-16 dark:bg-secondary'>
                <div className='container'>
                    <div className="flex flex-col gap-3 items-center justify-center">
                        <div className="bg-primary w-fit rounded-full py-1 px-4">
                            <p className="font-semibold text-white">Our work in action</p>
                        </div>
                        <h2 className='font-semibold text-center'>See the difference we make</h2>
                    </div>
                </div>

                <Marquee autoFill={true}>
                    {WorkData.map((item, index) => {
                        const isEven = index % 2 === 0
                        const verticalOffset = isEven ? 'mt-0' : 'mt-10'

                        return (
                            <div key={index} className={`group w-full ${verticalOffset} relative overflow-hidden pl-10`}>
                                <div
                                    onClick={() => setZoomedImage(item)}
                                    className="cursor-pointer overflow-hidden rounded-md"
                                >
                                    <Image
                                        src={item}
                                        alt='image'
                                        height={308}
                                        width={336}
                                        className='w-full object-cover rounded-lg transform transition-transform duration-500 group-hover:scale-110'
                                    />
                                </div>
                                <div className='absolute top-6 right-6 hidden group-hover:block'>
                                    <Image src={"/images/icon/verticle-arrow.svg"} alt='arrow-icon' width={32} height={32} />
                                </div>
                            </div>
                        )
                    })}
                </Marquee>

                {/* Zoom Modal */}
                {zoomedImage && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-300 ${
                            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <div
                            ref={zoomRef}
                            className={`transform transition-all duration-300 ${
                                isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                            } max-w-3xl w-full p-4`}
                        >
                            <Image
                                src={zoomedImage}
                                alt='Zoomed Image'
                                width={1000}
                                height={600}
                                className='w-full h-auto rounded-lg object-contain'
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Ourwork
