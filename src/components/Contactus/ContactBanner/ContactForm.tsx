"use client";
import Image from 'next/image';
import { useState } from 'react';
import { sendContactToHubSpot, parseName } from "@/lib/hubspot/utils";
import { normalizePhone } from "@/lib/validation/phone";
import type { FormErrors } from "@/lib/forms/types";
import { validateName, validatePhone, validateEmail, validateRequired } from "@/lib/forms/validators";
import { createEmptyErrors, clearFieldError } from "@/lib/forms/utils";

interface ContactFormData {
    name: string;
    number: string;
    email: string;
    message: string;
}

type ContactFormProps = {
    showInfo?: boolean;
};

const ContactForm = ({ showInfo = true }: ContactFormProps) => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        number: "",
        email: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);

    // Scalable error pattern: Record<string, string> - same as Stripe, Linear, Vercel
    const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());

    const hasFieldErrors = Object.entries(errors).some(
        ([key, value]) => key !== "submit" && Boolean(value)
    );

    const getFieldClass = (field: string) =>
        `input-field ${errors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`;

    const reset = () => {
        setFormData({
            name: "",
            number: "",
            email: "",
            message: ""
        });
        setErrors(createEmptyErrors());
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        let firstErrorField = "";

        // Use reusable validators - enterprise-grade validation
        const nameError = validateName(formData.name, true);
        if (nameError) {
            newErrors.name = nameError;
            if (!firstErrorField) firstErrorField = "name";
        }

        const phoneError = validatePhone(formData.number, true);
        if (phoneError) {
            newErrors.number = phoneError;
            if (!firstErrorField) firstErrorField = "number";
        }

        const emailError = validateEmail(formData.email);
        if (emailError) {
            newErrors.email = emailError;
            if (!firstErrorField) firstErrorField = "email";
        }

        const messageError = validateRequired(formData.message, "Message");
        if (messageError) {
            newErrors.message = messageError;
            if (!firstErrorField) firstErrorField = "message";
        }

        setErrors(newErrors);
        if (firstErrorField && Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const element = document.querySelector(
                    `[name="${firstErrorField}"]`,
                ) as HTMLElement | null;
                element?.scrollIntoView({ behavior: "smooth", block: "center" });
                element?.focus();
            }, 100);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        // Clear error when user starts typing - scalable pattern
        if (errors[name]) {
            setErrors(prev => clearFieldError(prev, name));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        if (!validate()) return;

        const phoneResult = normalizePhone(formData.number, { required: true });
        const normalizedPhone = phoneResult.e164 || formData.number;

        // Track Contact event
        try {
            setLoading(true);
            await fetch("/api/meta/pixel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_name: "Contact",
                    user_data: {
                        email: formData.email,
                        first_name: formData.name?.split(' ')[0],
                        last_name: formData.name?.split(' ').slice(1).join(' '),
                        phone: normalizedPhone,
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
                phone: normalizedPhone,
            }).catch((error) => {
                console.error("Error enviando a HubSpot:", error);
            });
        }

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: normalizedPhone,
                    message: formData.message,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to send message");
            }

            await response.json();
            reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Submission error:", errorMessage);
            // Scalable error handling - add submit error without breaking type safety
            setErrors(prev => ({ ...prev, submit: errorMessage }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-16 sm:pb-20">
            <div className={`p-1 sm:p-4 pb-28 flex flex-col ${showInfo ? "md:flex-row" : "md:flex-col"} bg-white dark:bg-dark-gray shadow-2xl rounded-md`}>
                {showInfo && (
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
                                    <p className="text-white">2180 Central Florida Parkway, Orlando, FL 32837</p>
                                </div>
                            </div>
                        </div>
                        <Image src={"/images/contactus/contact-ellipse.png"} alt='ellipse-img' width={216} height={216} className='absolute right-0 bottom-0' />
                    </div>
                )}

                <div className='w-full p-7 px-3 md:py-7 xl:py-11 md:px-8 xl:px-14'>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-8" role="form" aria-label="Contact form">
                        {hasFieldErrors && (
                            <p className="text-red-600 text-sm" role="alert">
                                Please fix the highlighted fields before submitting.
                            </p>
                        )}
                        <div>
                            <label htmlFor="contact-name" className="sr-only">Full name</label>
                            <input
                                id="contact-name"
                                type="text"
                                name="name"
                                placeholder="Full name *"
                                value={formData.name}
                                onChange={handleChange}
                                className={getFieldClass("name")}
                                autoComplete="name"
                                required
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
                                className={getFieldClass("number")}
                                autoComplete="tel"
                                required
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
                                className={getFieldClass("email")}
                                autoComplete="email"
                                required
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
                                className={getFieldClass("message")}
                                rows={6}
                                cols={50}
                                required
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
                            disabled={loading}
                            className="group w-fit flex items-center py-3 px-6 bg-secondary hover:bg-deep-blue transition-colors duration-300 rounded-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="text-base text-white font-bold">{loading ? "Sending..." : "Send Message"}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
