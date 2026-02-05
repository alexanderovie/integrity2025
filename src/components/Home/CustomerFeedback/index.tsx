"use client"
import Image from 'next/image'
import { useState } from 'react';

const CustomerFeedback = () => {
    const [isPlaying, setIsPlaying] = useState<number | null>(null);

    const videos = [
        {
            id: 0,
            videoId: "KJolscMPbsY",
            thumbnail: "https://img.youtube.com/vi/KJolscMPbsY/hqdefault.jpg",
            quote: '"Integrity Cleaning transformed my home! Reliable, fast, and beyond expectations."',
            name: "- Jane Smith",
        },
        {
            id: 1,
            videoId: "xvHZKcI4QCY",
            thumbnail: "https://img.youtube.com/vi/xvHZKcI4QCY/hqdefault.jpg",
            quote: "Amazing service! Highly recommend.",
            name: "- Michael Brown",
        },
        {
            id: 2,
            videoId: "Tp_5XL1Wrho",
            thumbnail: "https://img.youtube.com/vi/Tp_5XL1Wrho/hqdefault.jpg",
            quote: "Professional team and great results.",
            name: "- Sarah Wilson",
        },
    ];

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
                                {isPlaying === 0 ? (
                                    <iframe
                                        className='w-full h-full rounded-md'
                                        src="https://www.youtube.com/embed/KJolscMPbsY?si=Rq1tGB7Vth8KaJrr&autoplay=1"
                                        title="YouTube video player"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <>
                                        <Image
                                            src={videos[0].thumbnail}
                                            alt='Testimonial video thumbnail'
                                            fill
                                            className='object-cover rounded-md'
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20" onClick={() => setIsPlaying(0)}>
                                            <Image
                                                src="/images/home/testimonial/video-playicon.svg"
                                                alt="Play icon"
                                                width={64}
                                                height={64}
                                            />
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full py-7 px-9">
                                            <h5 className='text-white'>{videos[0].quote}</h5>
                                            <p className='text-white/80 font-bold mt-1.5 xl:mt-4'>{videos[0].name}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className='grid grid-rows-2 gap-8'>
                                {videos.slice(1).map((video) => (
                                    <div key={video.id} className='flex flex-col sm:flex-row items-center gap-6 h-full relative bg-gray-800/50 rounded-md p-4'>
                                        <div className='relative w-full sm:w-[328px] h-[205px] shrink-0 rounded overflow-hidden'>
                                            {isPlaying === video.id ? (
                                                <iframe
                                                    className='w-full h-full'
                                                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                                                    title="YouTube video player"
                                                    allow="autoplay; encrypted-media"
                                                    allowFullScreen
                                                ></iframe>
                                            ) : (
                                                <>
                                                    <Image
                                                        src={video.thumbnail}
                                                        alt={`${video.name} testimonial`}
                                                        fill
                                                        className='object-cover'
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30" onClick={() => setIsPlaying(video.id)}>
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
                                        <div className='flex flex-col gap-2'>
                                            <p className='text-white'>{video.quote}</p>
                                            <p className='text-white/70'>{video.name}</p>
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
