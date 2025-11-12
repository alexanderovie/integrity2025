import FormComponent from "@/components/Home/Hero/FormComponent";
import { useEffect, useState } from "react";

interface BookServicesModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const createInitialFormState = () => ({
    name: "",
    number: "",
    email: "",
    services: [] as string[],
});

const BookServicesModal = ({ isOpen, closeModal }: BookServicesModalProps) => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState(createInitialFormState);

    useEffect(() => {
        if (!isOpen) {
            setSubmitted(false);
            setFormData(createInitialFormState());
        }
    }, [isOpen]);

    useEffect(() => {
        if (!submitted) return;

        const closeTimer = setTimeout(() => {
            closeModal();
            setSubmitted(false);
        }, 1000);

        return () => clearTimeout(closeTimer);
    }, [submitted, closeModal]);

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prevData) => {
            if (checked) {
                return { ...prevData, services: [...prevData.services, name] };
            }
            return { ...prevData, services: prevData.services.filter((service) => service !== name) };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                setSubmitted(Boolean(data.success));
                setFormData(createInitialFormState());
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = () => {
        closeModal();
    };

    const handleModalContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                className="relative bg-white dark:bg-secondary rounded py-10 px-10 max-w-lg w-full shadow-lg"
                onClick={handleModalContentClick}
                role="dialog"
                aria-modal="true"
            >
                <button onClick={closeModal} aria-label="Close booking modal" className="cursor-pointer absolute right-0 top-0 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
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
    );
};

export default BookServicesModal;