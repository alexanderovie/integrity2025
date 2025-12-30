"use client";
import Image from 'next/image';
import { useState } from 'react';
import { sendContactToHubSpot, parseName } from "@/lib/hubspot/utils";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        email: "",
        message: ""
    });

    const [errors, setErrors] = useState({
        name: "",
        number: "",
        email: "",
        message: "",
        submit: ""
    });

    const [submitted, setSubmitted] = useState(false);

    const reset = () => {
        setFormData({
            name: "",
            number: "",
            email: "",
            message: ""
        });
        setErrors({
            name: "",
            number: "",
            email: "",
            message: ""
        });
    };

    const validate = (): boolean => {
        interface FormErrors {
            name?: string;
            number?: string;
            email?: string;
            message?: string;
        }

        const newErrors: FormErrors = {};
        const phoneRegex = /^[0-9]{10,15}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) newErrors.name = "Name is required.";
        if (!formData.number.trim()) newErrors.number = "Phone number is required.";
        else if (!phoneRegex.test(formData.number.trim())) newErrors.number = "Enter a valid phone number.";

        if (!formData.email.trim()) newErrors.email = "Email is required.";
        else if (!emailRegex.test(formData.email.trim())) newErrors.email = "Enter a valid email.";

        if (!formData.message.trim()) newErrors.message = "Message is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        // Track Contact event
        try {
            await fetch("/api/meta/pixel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_name: "Contact",
                    user_data: {
                        email: formData.email,
                        first_name: formData.name?.split(' ')[0],
                        last_name: formData.name?.split(' ').slice(1).join(' '),
                        phone: formData.number,
                    },
                }),
            });
        } catch (error) {
            console.error("Error tracking Contact event:", error);
        }

        // Enviar contacto a HubSpot (no bloquea el flujo si falla)
        if (formData.email) {
            const { firstname, lastname } = parseName(formData.name);
            sendContactToHubSpot({
                email: formData.email,
                firstname,
                lastname,
                phone: formData.number,
            }).catch((error) => {
                console.error("Error enviando a HubSpot:", error);
            });
        }

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to send message");
            }

            const data = await response.json();
            setSubmitted(data.success);
            reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Submission error:", errorMessage);
            setErrors({ submit: errorMessage });
        }
    };

    return (
        <div>
            <div className='p-1 sm:p-4 pb-28 flex flex-col md:flex-row bg-white dark:bg-dark-gray shadow-2xl rounded-md'>
                {/* Contact Info */}
                <div className='relative z-10 py-9 px-8 xl:py-16 xl:px-14 flex flex-col gap-6 md:gap-16 bg-deep-blue md:max-w-lg rounded-md text-white'>
                    <div className='flex flex-col gap-3.5'>
                        <h4 className='font-semibold text-white'>Contact Information</h4>
                        <p className="text-white/80">Speak with an Integrity Clean Solutions coordinator about Orlando residential or commercial cleaning plans.</p>
                    </div>
                    <div className='relative z-10 flex flex-col md:pb-10 gap-3 sm:gap-5 md:gap-8 xl:gap-10'>
                        <div className='flex items-center gap-3 sm:gap-6'>
                            <Image src={"/images/contactus/contact-call-icon.svg"} alt='contact-icon' width={40} height={40} />
                            <div>
                                <p className="text-white">(800) 930-0532</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3 sm:gap-6'>
                            <Image src={"/images/contactus/contact-map-icon.svg"} alt='map-icon' width={40} height={40} />
                            <div>
                                <p className="text-white">4700 Millenia Blvd, Orlando, FL 32839</p>
                            </div>
                        </div>
                    </div>
                    <Image src={"/images/contactus/contact-ellipse.png"} alt='ellipse-img' width={216} height={216} className='absolute right-0 bottom-0' />
                </div>

                {/* Contact Form */}
                <div className='w-full p-7 px-3 md:py-7 xl:py-11 md:px-8 xl:px-14'>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-8" role="form" aria-label="Contact form">
                        <div>
                            <label htmlFor="contact-name" className="sr-only">Full name</label>
                            <input
                                id="contact-name"
                                type="text"
                                name="name"
                                placeholder="Full name *"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                autocomplete="name"
                                aria-required="true"
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "contact-name-error" : undefined}
                            />
                            {errors.name && <p id="contact-name-error" className="text-red-600 text-sm mt-1" role="alert">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="contact-phone" className="sr-only">Phone number</label>
                            <input
                                id="contact-phone"
                                type="tel"
                                name="number"
                                placeholder="Phone number *"
                                value={formData.number}
                                onChange={handleChange}
                                className="input-field"
                                autocomplete="tel"
                                aria-required="true"
                                aria-invalid={!!errors.number}
                                aria-describedby={errors.number ? "contact-phone-error" : undefined}
                            />
                            {errors.number && <p id="contact-phone-error" className="text-red-600 text-sm mt-1" role="alert">{errors.number}</p>}
                        </div>
                        <div>
                            <label htmlFor="contact-email" className="sr-only">Email address</label>
                            <input
                                id="contact-email"
                                type="email"
                                name="email"
                                placeholder="Email address *"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                autocomplete="email"
                                aria-required="true"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "contact-email-error" : undefined}
                            />
                            {errors.email && <p id="contact-email-error" className="text-red-600 text-sm mt-1" role="alert">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="sr-only">Message</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                placeholder='Write here your message'
                                value={formData.message}
                                onChange={handleChange}
                                className="input-field"
                                rows={6}
                                cols={50}
                                aria-required="true"
                                aria-invalid={!!errors.message}
                                aria-describedby={errors.message ? "contact-message-error" : undefined}
                            />
                            {errors.message && <p id="contact-message-error" className="text-red-600 text-sm mt-1" role="alert">{errors.message}</p>}
                        </div>
                        {errors.submit && (
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        )}
                        <button
                            type="submit"
                            className="group w-fit flex items-center py-3 px-6 bg-secondary hover:bg-deep-blue transition-colors duration-300 rounded-sm cursor-pointer"
                        >
                            <span className="text-base text-white font-bold">Send Message</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
