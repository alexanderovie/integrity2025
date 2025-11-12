"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FormComponent from "./FormComponent";

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

        fetch("https://formsubmit.co/ajax/niravjoshi87@gmail.com", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                name: formData.name,
                number: formData.number,
                email: formData.email,
                zip: formData.zip,
                services: formData.services.join(", "),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setSubmitted(data.success);
                reset();
            })
            .catch((error) => {
                console.log(error.message);
            });
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
            <div className="relative pt-24 lg:pt-32">
                <div className="bg-[url('/images/home/banner/banner-img.jpg')] bg-cover bg-no-repeat bg-center h-full flex justify-center items-center">
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

                            <div className="relative bg-white dark:bg-dark-gray rounded-md max-w-530px lg:max-w-md xl:max-w-530px w-full p-10 flex flex-col gap-8">
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
