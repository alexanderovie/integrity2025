"use client";
import { useEffect, useState } from 'react'
import { FooterData } from './data';
import Image from 'next/image';
import Link from 'next/link';

const Newsletter = () => {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");
    const [formData, setFormData] = useState({ email: "" });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        if (status !== "idle") {
            setStatus("idle");
            setMessage("");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email) {
            setStatus("error");
            setMessage("Please enter your email.");
            return;
        }

        try {
            setStatus("loading");
            setMessage("");

            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to subscribe right now.");
            }

            setStatus("success");
            setMessage("You’re all set! Please check your inbox for confirmation.");
            setFormData({ email: "" });
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error ? error.message : "Something went wrong. Please try again."
            );
        }
    };

    useEffect(() => {
        if (status === "success") {
            const timer = setTimeout(() => {
                setStatus("idle");
                setMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <>
        <div className="container">
            <div className='pb-8 md:pb-14 border-b border-secondary/15 dark:border-white/15'>
                <div className='flex flex-col xl:flex-row gap-6 xl:gap-14 items-center'>

                    <p className='w-full xl:max-w-xs dark:text-white'>Join our list for cleaning tips, updates, and exclusive offers.</p>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-6'>
                        <div className='flex flex-col lg:flex-row gap-5 lg:gap-10'>
                            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-2' role="form" aria-label="Newsletter subscription form">
                                <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
                                <input
                                    required
                                    className="input-field bg-white dark:bg-white/10"
                                    id="newsletter-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autocomplete="email"
                                    aria-required="true"
                                    aria-invalid={status === "error"}
                                    aria-describedby={status === "error" ? "newsletter-error" : undefined}
                                />
                                <button
                                    type='submit'
                                    disabled={status === "loading"}
                                    className='bg-primary hover:bg-deep-blue transition-colors duration-300 py-3.5 px-6 rounded-md font-semibold cursor-pointer text-white disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    {status === "loading" ? "Subscribing..." : "Subscribe"}
                                </button>
                            </form>
                            {status === "error" && message && (
                                <p id="newsletter-error" className="text-xs max-w-[260px] text-red-500" role="alert">
                                    {message}
                                </p>
                            )}
                            <p className='text-xs max-w-[217px] dark:text-white/70'>
                                By subscribing, you agree to receive promotional updates. You can unsubscribe anytime with one click.
                            </p>
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
        {status === "success" && (
            <div
                className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
                aria-live="assertive"
                role="status"
            >
                <div className="w-full max-w-sm rounded-md border border-primary/30 bg-white text-secondary px-4 py-3 shadow-lg shadow-primary/25 dark:bg-secondary dark:text-white">
                    <p className="font-semibold text-primary dark:text-white">Subscription confirmed</p>
                    <p className="text-sm mt-1 text-secondary/80 dark:text-white/80">{message}</p>
                </div>
            </div>
        )}
        </>
    )
}

export default Newsletter
