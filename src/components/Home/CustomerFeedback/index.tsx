"use client"
import Image from 'next/image'
import { useState } from 'react';

const CustomerFeedback = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section>
            <div className='bg-secondary py-20 sm:py-28'>
                <div className="container">
                    <div className='flex flex-col gap-16'>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                            <div className="flex flex-col gap-4 max-w-xl">
                                <div className="bg-gray w-fit flex-1 rounded-full py-1 px-4">
                                    <p className="font-semibold text-white">What our clients say</p>
                                </div>
                                <h2 className="font-semibold text-white">Feedback from satisfied customers.</h2>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 xl:grid-cols-2 gap-10'>
                            <div className='relative w-full h-[442px] xl:h-full'>
                                {isPlaying ? (
                                    <iframe
                                        className='w-full h-full rounded-md'
                                        src="https://www.youtube.com/embed/KJolscMPbsY?si=Rq1tGB7Vth8KaJrr"
                                        title="YouTube video player"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <>
                                        <Image
                                            src="https://img.youtube.com/vi/KJolscMPbsY/maxresdefault.jpg"
                                            alt='Testimonial video thumbnail'
                                            fill
                                            className='object-cover rounded-md'
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20" onClick={() => setIsPlaying(true)}>
                                            <Image
                                                src="/images/home/testimonial/video-playicon.svg"
                                                alt="Play icon"
                                                width={64}
                                                height={64}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className='grid grid-rows-2 gap-8'>
                                <div className='flex flex-col sm:flex-row items-center gap-6 h-full relative bg-gray-800/50 rounded-md p-4'>
                                    <div className='relative w-full sm:w-[328px] h-[205px] shrink-0 bg-gray-700 rounded flex items-center justify-center'>
                                        <p className='text-white'>Video 2</p>
                                    </div>
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-white'>Waiting for video...</p>
                                    </div>
                                </div>
                                <div className='flex flex-col sm:flex-row items-center gap-6 h-full relative bg-gray-800/50 rounded-md p-4'>
                                    <div className='relative w-full sm:w-[328px] h-[205px] shrink-0 bg-gray-700 rounded flex items-center justify-center'>
                                        <p className='text-white'>Video 3</p>
                                    </div>
                                    <div className='flex flex-col gap-4'>
                                        <p className='text-white'>Waiting for video...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerFeedback
