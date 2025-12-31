import FormComponent from "@/components/Home/Hero/FormComponent";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getQuoteUrl, resolveServiceSlug } from "@/lib/urls/quote";

interface BookServicesModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const createInitialFormState = () => ({
    name: "",
    number: "",
    email: "",
    services: [] as string[],
    zip: "",
});

const BookServicesModal = ({ isOpen, closeModal }: BookServicesModalProps) => {
    const router = useRouter();
    const [formData, setFormData] = useState(createInitialFormState);

    // Patrón enterprise React 19: resetear en handler de cierre (event-driven)
    // Evitar setState en effects - manejar directamente en el handler
    const handleClose = () => {
        setFormData(createInitialFormState());
        closeModal();
    };

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

        // Use friendly URL structure: /quote/[service]
        const serviceSlug = formData.services.length > 0
          ? resolveServiceSlug(formData.services[0]) || "regular-cleaning"
          : "regular-cleaning";

        const quoteUrl = getQuoteUrl(serviceSlug, {
          name: formData.name || undefined,
          email: formData.email || undefined,
          phone: formData.number || undefined,
          zipCode: formData.zip || undefined,
        });

        handleClose();
        router.push(quoteUrl);
    };

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = () => {
        handleClose();
    };

    const handleModalContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center px-4"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                className="relative bg-white dark:bg-secondary rounded py-10 px-10 max-w-lg w-full shadow-lg"
                onClick={handleModalContentClick}
                role="dialog"
                aria-modal="true"
            >
                <button onClick={handleClose} aria-label="Close booking modal" className="cursor-pointer absolute right-0 top-0 p-4">
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
                    onChange={handleChange}
                    onServiceChange={handleServiceChange}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
};

export default BookServicesModal;
