"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import { videos } from './data';

const CustomerFeedback = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  
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
                            <div className="flex flex-col gap-8 max-w-sm">
                                <p className="text-white">Gain insight into how our cleaning services have transformed homes and exceeded expectations.</p>
                            </div>
                        </div>
                        <div className='grid grid-cols-1 xl:grid-cols-2 gap-10 '>
                            <div className='relative w-full h-[442px] xl:h-full'>
                                {isPlaying ? (
                                    <iframe
                                        className='w-full h-full rounded-md'
                                        src="https://www.youtube.com/embed/ak0dX_uszNQ?si=Rq1tGB7Vth8KaJrr"
                                        title="YouTube video player"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <>
                                        <Image
                                            src={"/images/home/testimonial/testimonial-img-1.png"}
                                            alt='Image'
                                            width={680}
                                            height={445}
                                            className='w-full h-full object-cover rounded-md'
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20" onClick={() => setIsPlaying(true)}>
                                            <Image
                                                src="/images/home/testimonial/video-playicon.svg"
                                                alt="Play icon"
                                                width={64}
                                                height={64}
                                            />
                                            <div className="absolute bottom-0 left-0 w-full py-7 px-9">
                                                <h5 className='dark:text-secondary'>“Gleamer transformed my home! Highly recommend their attention to detail.”</h5>
                                                <p className='text-secondary/80 font-bold mt-1.5 xl:mt-4'>- Jane Smith</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className='grid grid-rows-2 gap-8'>
                                {videos.map((item) => (
                                    <div key={item.id} className='flex flex-col sm:flex-row items-center gap-6 h-full relative'>
                                        <div className='relative w-full sm:w-[328px] h-[205px] shrink-0'>
                                            {playingIndex === item.id ? (
                                                <iframe
                                                    className="w-full h-full"
                                                    src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1`}
                                                    title="YouTube video player"
                                                    allow="autoplay; encrypted-media"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <>
                                                    <Image
                                                        src={item.thumbnail}
                                                        alt='Image'
                                                        fill
                                                        className='object-cover rounded'
                                                    />
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
                                                        onClick={() => setPlayingIndex(item?.id)}
                                                    >
                                                        <Image
                                                            src="/images/home/testimonial/video-playicon.svg"
                                                            alt="Play icon"
                                                            width={48}
                                                            height={48}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className='flex flex-col gap-4'>
                                            <p className='text-white'>{item.quote}</p>
                                            <p className='text-white'>{item.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CustomerFeedback