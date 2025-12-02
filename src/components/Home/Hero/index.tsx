"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FormComponent from "./FormComponent";
import { useRouter } from "next/navigation";
import { sendContactToHubSpot, parseName } from "@/lib/hubspot/utils";

function HeroSection() {
    const [submitted, setSubmitted] = useState(false);
    const [showThanks, setShowThanks] = useState(false);
    const ref = useRef(null);
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        email: "",
        services: [] as string[],
        zip: "",
    });

    const router = useRouter();

    useEffect(() => {
        if (submitted) {
            setShowThanks(true);
            const timer = setTimeout(() => {
                setShowThanks(false);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [submitted]);

    const reset = () => {
        setFormData({
            name: "",
            number: "",
            email: "",
            services: [],
            zip: "",
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Enviar contacto a HubSpot (no bloquea el flujo si falla)
        if (formData.email) {
            const { firstname, lastname } = parseName(formData.name);
            sendContactToHubSpot({
                email: formData.email,
                firstname,
                lastname,
                phone: formData.number,
                zip: formData.zip,
            }).catch((error) => {
                console.error("Error enviando a HubSpot:", error);
            });
        }

        const params = new URLSearchParams();
        if (formData.name) params.set("name", formData.name);
        if (formData.email) params.set("email", formData.email);
        if (formData.number) params.set("phone", formData.number);
        if (formData.zip) params.set("zipCode", formData.zip);
        if (formData.services.length > 0) {
            params.set("services", formData.services.join(","));
        }

        reset();
        setSubmitted(true);
        router.push(`/quote?${params.toString()}`);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prevData) => {
            if (checked) {
                return { ...prevData, services: [...prevData.services, name] };
            } else {
                return { ...prevData, services: prevData.services.filter((service) => service !== name) };
            }
        });
    };

    const headingText = " Orlando Residential & Commercial Cleaning Experts ";
    const paragraphText = " Integrity Clean Solutions delivers eco-friendly cleaning across Orlando, keeping homes and workplaces fresh, healthy, and ready for every day. ";


    return (
        <section>
            <div className="relative pt-24 lg:pt-32 overflow-hidden">
                <div className="relative h-full flex justify-center items-center bg-[linear-gradient(to_bottom,_#1f2a2e_60%,_#F8F8F5_40%)] dark:bg-[linear-gradient(to_bottom,_#1f2a2e_60%,_#FFFFFF66_40%)] lg:bg-[url('/images/home/banner/banner-img.jpg')] bg-cover bg-no-repeat bg-center">
                    <div className="container">
                        <div ref={ref} className="flex flex-col lg:flex-row gap-10 xl:gap-20 2xl:gap-32 py-20 items-center lg:items-end justify-between">
                            <div className="flex flex-col gap-6  w-full">
                                <div className="flex flex-col gap-3">
                                    <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                                        <p className="font-semibold text-white">Integrity Cleaning</p>
                                    </div>
                                <h1 className="text-white text-3xl md:text-4xl">{headingText.trim()}</h1>
                                </div>
                                <p className="text-white text-lg sm:text-xl">{paragraphText.trim()}</p>
                            </div>

                            <div className="relative bg-white dark:bg-dark-gray rounded-md max-w-530px lg:max-w-md xl:max-w-530px w-full p-10 flex flex-col gap-8 shadow-soft-primary lg:shadow-none">
                                <h4 className="font-semibold dark:text-white">Get a free quote</h4>
                                <FormComponent
                                    formData={formData}
                                    submitted={submitted}
                                    showThanks={showThanks}
                                    onChange={handleChange}
                                    onServiceChange={handleServiceChange}
                                    onSubmit={handleSubmit}
                                />

                                {submitted && showThanks &&
                                    <div className="flex gap-1.5 items-center absolute -bottom-9 left-0">
                                        <p className="text-primary">Thank you for reaching out!</p>
                                        <Image src="/images/home/banner/smile-emoji.svg" alt="image" width={20} height={20} />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
