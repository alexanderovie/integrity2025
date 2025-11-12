import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import React from 'react'
import { QuoteData } from './data'
import Image from 'next/image'

const Quotes = () => {
    return (
        <section>
            <div className='dark:bg-secondary'>
                <div className="container">
                    <div className='flex flex-col gap-14 py-28'>
                        <div className='flex flex-col gap-3 text-center items-center'>
                            <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                <p className="font-semibold text-white">Quotes</p>
                            </div>
                            <h2 className='font-semibold'>Here's what our customer say</h2>
                            <p>The hidden perks of maintaining a pristine home environment</p>
                        </div>
                        <Carousel className="relative w-full">
                            <CarouselContent className="flex gap-0 xl:gap-10">
                                {QuoteData.map((item, index) => {
                                    return (
                                        <CarouselItem key={index} className="basis-auto">
                                            <div className='border border-foggy-clay dark:border-natural-gray/20 rounded-md max-w-xs'>
                                                <div className='w-full h-[220px]'>
                                                    <Image src={item.image} alt='image' width={320} height={300} className='w-full h-full object-cover rounded-t-md'/>
                                                </div>
                                                <div className='py-3 px-3 flex flex-col gap-1 items-center text-center'>
                                                    <p className='text-lg font-semibold dark:text-white'>{item.heading}</p>
                                                    <p className='text-gray-steel'>{item.desp}</p>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    )
                                })}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-0 mx-2.5 top-1/2 -translate-y-1/2 p-1.5 border border-primary bg-primary cursor-pointer shadow-soft-primary" />
                            <CarouselNext className="absolute right-0 mx-2.5 top-1/2 -translate-y-1/2 p-1.5 border border-primary bg-primary cursor-pointer shadow-soft-primary" />
                        </Carousel>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Quotes
