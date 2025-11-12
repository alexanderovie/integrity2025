"use client";
import { services } from '@/app/api/services';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import BookServicesModal from '../Layout/Header/BookServicesModal';

const ServicesDetail = () => {
    const [modalOpen, setModalOpen] = useState(false)
    const { slug } = useParams();
    const item = services.find((item) => item.slug === slug);
    return (
        <section className='dark:bg-dark-gray'>
            <div className="container">
                <div className='pt-24 lg:pt-32'>
                    <div className='py-12 xl:py-28 flex flex-col gap-6 sm:gap-10'>
                        <div className='flex flex-col md:flex-row items-start md:items-end justify-between gap-5'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-3'>
                                    <Image src={"/images/icon/home-icon.svg"} alt='home-icon' width={28} height={28} />
                                    <p className='font-semibold text-secondary/50 dark:text-white/50'><Link href={"/"} className='text-light-olive'>Home / </Link>{item?.service_title}</p>
                                </div>
                                <h2 className='font-semibold'>{item?.service_title}</h2>
                            </div>
                            <div className='flex items-center'>
                                <div className='flex gap-2 pr-6 py-2 border-r border-gray/20'>
                                    <Image src={"/images/icon/duration-icon.svg"} alt='duration-icon' width={25} height={25} />
                                    <p className='text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium'>{item?.duration}</p>
                                </div>
                                <div className='flex gap-2 px-6 py-2'>
                                    <Image src={"/images/icon/rating-star.svg"} alt='duration-icon' width={25} height={25} />
                                    <p className='text-base md:text-lg text-secondary/80 dark:text-white/80 font-medium'>{item?.rating} Ratings</p>
                                </div>
                            </div>
                        </div>
                        <div className='relative flex flex-col lg:flex-row justify-between gap-6 xl:gap-10'>
                            <div className='flex flex-col gap-5 sm:gap-8'>

                                {item?.thumbnail_img &&
                                    <div className='w-full h-[450px]'>
                                        <Image src={item?.thumbnail_img} alt='Image' width={500} height={400} className='w-full h-full object-cover rounded-md' />
                                    </div>
                                }

                                <p className='text-base md:text-lg text-secondary/80 dark:text-white/80'>{item?.description}</p>
                                <div className='flex flex-col gap-4'>
                                    <h6 className='font-semibold'>Features</h6>
                                    <ul className='flex flex-col gap-3'>
                                        {item?.about_services.map((value, index) => {
                                            return (
                                                <li key={index} className='flex items-center gap-2'>
                                                    <Image src={"/images/icon/verified-icon.svg"} alt='verified-icon' width={24} height={24} />
                                                    <p className='text-base md:text-lg text-secondary/80 dark:text-white/80'>{value}</p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <h6 className='font-semibold'>Cleaning Process</h6>
                                    <ul className='flex flex-col gap-2 md:gap-3'>
                                        {item?.cleaning_process.map((value, index) => {
                                            return (
                                                <li key={index} className='flex items-center gap-3'>
                                                    <span className='font-semibold text-white bg-primary py-1 px-3 rounded-full'>{index + 1}</span>
                                                    <p className='text-base md:text-lg text-secondary/80 dark:text-white/80'>{value}</p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </div>
                            <div className='flex flex-col gap-4 sm:gap-8'>
                                <div className='relative bg-secondary shadow-xl p-5 xl:py-8 xl:px-6 max-w-3xl w-full h-fit rounded-md'>
                                    <div className='relative z-10 flex flex-col gap-6 rounded-md'>
                                        <div className='flex flex-col flex-wrap gap-2'>
                                            <span className='text-white/80'><s>$250.00</s></span>
                                            <h4 className='text-white font-semibold'>${item?.price}.00</h4>
                                        </div>
                                        <ul className='relative  flex flex-col gap-2'>
                                            {item?.features.map((value, index) => {
                                                return (
                                                    <li key={index} className='flex items-center gap-2'>
                                                        <Image src={"/images/icon/star-icon.svg"} alt='feature-icon' width={20} height={20} />
                                                        <p className='text-white'>{value}</p>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        <div
                                            onClick={() => setModalOpen(true)}
                                            className='group py-4 px-3 bg-primary hover:bg-deep-blue transition-colors duration-300 rounded-md text-center cursor-pointer'
                                        >
                                            <span className='font-bold text-white group-hover:text-white'>Book a service</span>
                                        </div>
                                    </div>
                                    <Image src={"/images/aboutus/about-ellipse-img.svg"} alt='image' width={150} height={150} className='absolute right-0 bottom-0 rounded-md' />
                                </div>
                                <div className='border border-natural-gray dark:border-natural-gray/40 flex flex-col gap-3 sm:gap-5 rounded-md p-5 xl:py-8 xl:px-6'>
                                    <Image src={"/images/icon/home-icon.svg"} alt='home-icon' width={45} height={45}/>
                                    <p className='text-secondary/80 dark:text-white/80'>I found my ideal home in no time! The listings were detailed, the photos were accurate, and the whole process felt seamless. Customer service was top-notch, answering all my questions. I will definitely use this platform again in the future!</p>
                                    <div className='flex items-center gap-5'>
                                        <Image src={"/images/services/customer-img.jpg"} alt='customer-img' height={80} width={80} />
                                        <div>
                                            <h6 className='font-semibold'>Emily & John Smith</h6>
                                            <p className='text-secondary/80 dark:text-white/80'>Buyer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {modalOpen && (
                                <BookServicesModal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicesDetail
