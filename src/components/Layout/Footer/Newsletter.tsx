"use client";
import { useState } from 'react'
import { FooterData } from './data';
import Image from 'next/image';
import Link from 'next/link';

const Newsletter = () => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ email: "" });
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        fetch("https://formsubmit.co/ajax/niravjoshi87@gmail.com", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                email: formData.email,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setSubmitted(data.success);
                setFormData({ email: "" });
                setTimeout(() => {
                    setSubmitted(false);
                }, 10000);
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    return (
        <div className="container">
            <div className='pb-8 md:pb-14 border-b border-secondary/15 dark:border-white/15'>
                <div className='flex flex-col xl:flex-row gap-6 xl:gap-14 items-center'>

                    <p className='w-full xl:max-w-xs dark:text-white'>Join our list for cleaning tips, updates, and exclusive offers.</p>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-6'>
                        <div className='flex flex-col lg:flex-row gap-5 lg:gap-10'>
                            <form onSubmit={handleSubmit} className='flex gap-2'>
                                <input
                                    required
                                    className="input-field bg-white dark:bg-white/10"
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                />
                                <button type='submit' className='bg-primary hover:bg-deep-blue transition-colors duration-300 py-3.5 px-6 rounded-md font-semibold cursor-pointer text-white'>
                                    Subscribe
                                </button>
                            </form>
                            <p className='text-xs max-w-[217px] dark:text-white/70'>By subscribing, you agree to receive promotional updates. You can unsubscribe anytime with one click.</p>
                        </div>

                        <div className='flex gap-9'>
                            {FooterData.socialIcon.map((item, index) => {
                                return (
                                    <Link href={item.link} key={index} className='opacity-70 hover:opacity-100'>
                                        <Image src={item.icon} alt='social-icon' width={20} height={20} />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Newsletter
