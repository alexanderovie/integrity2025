import FormComponent from "@/components/Home/Hero/FormComponent";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuoteUrl, resolveServiceSlugSync } from "@/lib/urls/quote-client";

interface BookServicesModalProps {
    isOpen: boolean;
    closeModal: () => void;
    title?: string;
    submitLabel?: string;
    showServiceOptions?: boolean;
    showScheduleFields?: boolean;
    initialServiceSlug?: string;
}

const createInitialFormState = () => ({
    name: "",
    number: "",
    email: "",
    services: [] as string[],
    zip: "",
    preferredDate: "",
    serviceDate: "",
    timeSlot: "",
});

const BookServicesModal = ({
    isOpen,
    closeModal,
    title = "Plan Your Cleaning",
    submitLabel = "Get started today",
    showServiceOptions = true,
    showScheduleFields = false,
    initialServiceSlug = "",
}: BookServicesModalProps) => {
    const router = useRouter();
    const [formData, setFormData] = useState(createInitialFormState);
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (initialServiceSlug) {
            setFormData((prev) => ({
                ...prev,
                services: [initialServiceSlug],
            }));
        }
    }, [initialServiceSlug]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData(createInitialFormState());
        }
    }, [isOpen]);

    const handleClose = () => {
        setFormData(createInitialFormState());
        setStep(1);
        closeModal();
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prevData) => {
            if (checked) {
                return { ...prevData, services: [name] };
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

    const handleScheduleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const serviceSlugRaw = formData.services.length > 0 ? formData.services[0] : "regular-cleaning";
        const serviceSlug = resolveServiceSlugSync(serviceSlugRaw) || "regular-cleaning";

        const quoteUrl = getQuoteUrl(serviceSlug, {
          name: formData.name || undefined,
          email: formData.email || undefined,
          phone: formData.number || undefined,
          zipCode: formData.zip || undefined,
          preferredDate: formData.preferredDate || undefined,
          serviceDate: formData.serviceDate || undefined,
          timeSlot: formData.timeSlot || undefined,
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

    const goToStep2 = () => {
        if (formData.name && formData.number && formData.email) {
            setStep(2);
        }
    };

    const goToStep1 = () => {
        setStep(1);
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center px-4"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                className="relative bg-white dark:bg-secondary rounded py-10 px-6 max-w-lg w-full shadow-lg"
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

                {step === 1 && (
                    <>
                        <h4 className="font-semibold dark:text-white mb-6">{title}</h4>
                        <form onSubmit={(e) => { e.preventDefault(); goToStep2(); }}>
                            <FormComponent
                                formData={formData}
                                onChange={handleChange}
                                onServiceChange={handleServiceChange}
                                onSubmit={() => {}}
                                showServiceOptions={showServiceOptions}
                                submitLabel="Continue"
                            />
                            <button
                                type="submit"
                                className="w-full mt-4 py-3 px-6 bg-primary hover:bg-deep-blue transition-colors duration-300 rounded-sm cursor-pointer"
                            >
                                <span className="text-base text-white font-bold">Continue</span>
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={goToStep1} className="text-primary hover:underline text-sm">
                                ← Back
                            </button>
                            <h4 className="font-semibold dark:text-white">Schedule Your Visit</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {showScheduleFields && (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label htmlFor="modal-preferred-date" className="block text-sm font-medium mb-2 dark:text-white/80">
                                            Preferred Date
                                        </label>
                                        <input
                                            id="modal-preferred-date"
                                            type="date"
                                            name="preferredDate"
                                            value={formData.preferredDate}
                                            onChange={handleScheduleChange}
                                            className="input-field h-12"
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="modal-service-date" className="block text-sm font-medium mb-2 dark:text-white/80">
                                            Service Date
                                        </label>
                                        <input
                                            id="modal-service-date"
                                            type="date"
                                            name="serviceDate"
                                            value={formData.serviceDate}
                                            onChange={handleScheduleChange}
                                            className="input-field h-12"
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="modal-time-slot" className="block text-sm font-medium mb-2 dark:text-white/80">
                                            Time Slot
                                        </label>
                                        <select
                                            id="modal-time-slot"
                                            name="timeSlot"
                                            value={formData.timeSlot}
                                            onChange={handleScheduleChange}
                                            className="input-field h-12"
                                        >
                                            <option value="">Select time</option>
                                            <option value="morning">Morning (8AM-12PM)</option>
                                            <option value="afternoon">Afternoon (12PM-5PM)</option>
                                            <option value="evening">Evening (5PM-8PM)</option>
                                            <option value="flexible">Flexible</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full mt-6 py-3 px-6 bg-primary hover:bg-deep-blue transition-colors duration-300 rounded-sm cursor-pointer"
                            >
                                <span className="text-base text-white font-bold">{submitLabel}</span>
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookServicesModal;
