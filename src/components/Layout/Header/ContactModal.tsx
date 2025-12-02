"use client";

import { useEffect, useState } from "react";
import { sendContactToHubSpot, parseName } from "@/lib/hubspot/utils";

interface ContactModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ContactModal = ({ isOpen, closeModal }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        closeModal();
        setSubmitted(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [submitted, closeModal]);

  if (!isOpen) return null;

  const reset = () => {
    setFormData({ name: "", email: "", phone: "", message: "" });
    setErrors({});
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email.trim()))
      newErrors.email = "Enter a valid email.";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required.";
    if (!formData.message.trim()) newErrors.message = "Message is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Enviar contacto a HubSpot (no bloquea el flujo si falla)
    if (formData.email) {
      const { firstname, lastname } = parseName(formData.name);
      sendContactToHubSpot({
        email: formData.email,
        firstname,
        lastname,
        phone: formData.phone,
      }).catch((error) => {
        console.error("Error enviando a HubSpot:", error);
      });
    }

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/niravjoshi87@gmail.com",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center px-4"
      onClick={closeModal}
    >
      <div
        className="relative bg-white dark:bg-secondary rounded-md shadow-xl max-w-lg w-full p-8 sm:p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          aria-label="Close contact modal"
          className="absolute right-4 top-4 text-secondary dark:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
          >
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

        <div className="flex flex-col gap-2">
          <span className="bg-primary text-white w-fit rounded-full px-4 py-1 text-sm font-semibold">
            Quick Inquiry
          </span>
          <h3 className="text-2xl font-semibold text-secondary dark:text-white">
            Talk With Our Team
          </h3>
          <p className="text-secondary/70 dark:text-white/70 text-sm">
            Share a few details and we&apos;ll design a cleaning plan tailored to your space, schedule, and budget.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name *"
              className="input-field"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className="input-field"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone *"
              className="input-field"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your cleaning needs *"
              className="input-field"
              rows={4}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-deep-blue transition-colors duration-300 text-white font-semibold py-3 px-6 rounded-md"
          >
            Send Request
          </button>
          {submitted && (
            <p className="text-sm text-primary font-medium">
              Thank you! We will be in touch shortly.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
