import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuoteUrl, resolveServiceSlugSync } from "@/lib/urls/quote-client";

interface BookServicesModalProps {
    isOpen: boolean;
    closeModal: () => void;
    title?: string;
    showScheduleFields?: boolean;
    initialServiceSlug?: string;
}

const SERVICES = [
  { slug: "airbnb-cleaning", nombre: "Airbnb Cleaning" },
  { slug: "regular-cleaning", nombre: "Regular Cleaning" },
  { slug: "deep-cleaning", nombre: "Deep Cleaning" },
  { slug: "move-in-out-cleaning", nombre: "Move-In / Move-Out" },
  { slug: "post-construction-cleaning", nombre: "Post-Construction" },
  { slug: "carpet-cleaning", nombre: "Carpet Cleaning" },
  { slug: "commercial-cleaning", nombre: "Commercial Cleaning" },
];

const createInitialFormState = () => ({
    name: "",
    number: "",
    email: "",
    services: [] as string[],
    preferredDate: "",
    serviceDate: "",
    timeSlot: "",
});

const BookServicesModal = ({
    isOpen,
    closeModal,
    title = "Plan Your Cleaning",
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            services: [name],
        }));
    };

    const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center px-4"
            onClick={handleClose}
            role="presentation"
        >
            <div
                className="relative bg-white dark:bg-secondary rounded py-8 px-6 max-w-lg w-full shadow-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button onClick={handleClose} aria-label="Close" className="cursor-pointer absolute right-0 top-0 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {step === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                        <h4 className="font-semibold dark:text-white mb-4 pr-8">{title}</h4>
                        
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="modal-name" className="block text-sm font-medium mb-1 dark:text-white/80">Full name</label>
                                <input id="modal-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name *" className="input-field" required />
                            </div>
                            
                            <div>
                                <label htmlFor="modal-number" className="block text-sm font-medium mb-1 dark:text-white/80">Phone number</label>
                                <input id="modal-number" type="tel" name="number" value={formData.number} onChange={handleChange} placeholder="Phone number *" className="input-field" required />
                            </div>
                            
                            <div>
                                <label htmlFor="modal-email" className="block text-sm font-medium mb-1 dark:text-white/80">Email address</label>
                                <input id="modal-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address *" className="input-field" required />
                            </div>

                            {showScheduleFields && (
                                <div>
                                    <label htmlFor="modal-preferred-date" className="block text-sm font-medium mb-1 dark:text-white/80">Preferred Date</label>
                                    <input id="modal-preferred-date" type="date" name="preferredDate" value={formData.preferredDate} onChange={handleScheduleChange} className="input-field" min={new Date().toISOString().split("T")[0]} />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full mt-6 py-3 bg-primary hover:bg-deep-blue transition-colors rounded-sm cursor-pointer">
                            <span className="text-white font-bold">Continue</span>
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <button type="button" onClick={() => setStep(1)} className="text-primary hover:underline text-sm mb-4">
                            ← Back
                        </button>
                        
                        <h4 className="font-semibold dark:text-white mb-4">Schedule Your Visit</h4>
                        
                        <div className="flex flex-col gap-4">
                            <p className="font-semibold text-dusty-gray dark:text-white/90">Select a Service</p>
                            {SERVICES.map((service) => (
                                <div key={service.slug} className="flex items-center">
                                    <input type="radio" name="service" value={service.slug} id={`svc-${service.slug}`} checked={formData.services.includes(service.slug)} onChange={handleServiceChange} className="w-5 h-5" />
                                    <label htmlFor={`svc-${service.slug}`} className="ml-2 cursor-pointer dark:text-white/70">{service.nombre}</label>
                                </div>
                            ))}

                            {showScheduleFields && (
                                <>
                                    <div className="mt-2">
                                        <label htmlFor="modal-service-date" className="block text-sm font-medium mb-1 dark:text-white/80">Service Date</label>
                                        <input id="modal-service-date" type="date" name="serviceDate" value={formData.serviceDate} onChange={handleScheduleChange} className="input-field" min={new Date().toISOString().split("T")[0]} />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="modal-time-slot" className="block text-sm font-medium mb-1 dark:text-white/80">Time Slot</label>
                                        <select id="modal-time-slot" name="timeSlot" value={formData.timeSlot} onChange={handleScheduleChange} className="input-field">
                                            <option value="">Select time</option>
                                            <option value="morning">Morning (8AM-12PM)</option>
                                            <option value="afternoon">Afternoon (12PM-5PM)</option>
                                            <option value="evening">Evening (5PM-8PM)</option>
                                            <option value="flexible">Flexible</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <button type="submit" className="w-full mt-6 py-3 bg-primary hover:bg-deep-blue transition-colors rounded-sm cursor-pointer">
                            <span className="text-white font-bold">Get started today</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default BookServicesModal;
