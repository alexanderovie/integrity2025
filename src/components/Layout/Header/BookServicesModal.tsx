import FormComponent from '@/components/Home/Hero/FormComponent';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const BookServicesModal = ({ isOpen, closeModal }: any) => {
    if (!isOpen) return null;
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        number: "",
        email: "",
        services: [] as string[],
    });
    useEffect(() => {
        if (submitted) {
            const closeTimer = setTimeout(() => {
                closeModal();
            }, 1000);

            return () => clearTimeout(closeTimer);
        }
    }, [submitted]);

    const reset = () => {
        setFormData({
            name: "",
            number: "",
            email: "",
            services: [],
        });
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                name: formData.name,
                number: formData.number,
                email: formData.email,
                services: formData.services.join(", "),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setSubmitted(data.success);
                closeModal();
                reset();
            })
            .catch((error) => {
                console.log(error.message);
            });
    };
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative bg-white dark:bg-secondary rounded py-10 px-10 max-w-lg w-full shadow-lg">
                <button onClick={closeModal} aria-label="Close mobile menu" className="cursor-pointer absolute right-0 top-0 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
                        <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <h4 className="font-semibold dark:text-white mb-8">Plan Your Cleaning</h4>
                <FormComponent
                    formData={formData}
                    submitted={submitted}
                    onChange={handleChange}
                    onServiceChange={handleServiceChange}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}

export default BookServicesModal