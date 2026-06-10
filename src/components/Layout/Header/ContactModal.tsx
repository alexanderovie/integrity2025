"use client";

import { useEffect, useState } from "react";
import type { FormErrors } from "@/lib/forms";
import { validateName, validateEmail, validatePhone, validateRequired } from "@/lib/forms";
import { createEmptyErrors, clearFieldError } from "@/lib/forms";
import { getStoredGoogleAdsAttribution, trackQuoteFormSubmittedConversion } from "@/lib/analytics/google-ads";
import { normalizePhone } from "@/lib/validation/phone";

interface ContactModalFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const ContactModal = ({ isOpen, closeModal }: ContactModalProps) => {
  const [formData, setFormData] = useState<ContactModalFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  // Scalable error pattern: Record<string, string> - same as Stripe, Linear, Vercel
  const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasFieldErrors = Object.entries(errors).some(
    ([key, value]) => key !== "submit" && Boolean(value)
  );
  const getFieldClass = (field: string) =>
    `input-field ${errors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`;

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

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
      if (!firstErrorField) firstErrorField = "email";
    }

    const phoneError = validatePhone(formData.phone, true);
    if (phoneError) {
      newErrors.phone = phoneError;
      if (!firstErrorField) firstErrorField = "phone";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing - scalable pattern
    if (errors[name]) {
      setErrors(prev => clearFieldError(prev, name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (loading) return;

    const phoneResult = normalizePhone(formData.phone, { required: true });
    const normalizedPhone = phoneResult.e164 || formData.phone;

    try {
      setLoading(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: normalizedPhone,
          googleAdsAttribution: getStoredGoogleAdsAttribution(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        reset();
        trackQuoteFormSubmittedConversion();
      }
    } catch (error) {
      console.error("Contact submission error:", error);
      // Scalable error handling - add submit error without breaking type safety
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : "Failed to send message" }));
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" role="form" aria-label="Quick inquiry form">
          {hasFieldErrors && (
            <p className="text-red-500 text-sm" role="alert">
              Please fix the highlighted fields before submitting.
            </p>
          )}
          <div>
            <label htmlFor="modal-name" className="sr-only">Full name</label>
            <input
              id="modal-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name *"
              className={getFieldClass("name")}
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "modal-name-error" : undefined}
            />
            {errors.name && (
              <p id="modal-name-error" className="text-red-500 text-sm mt-1" role="alert">{errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="modal-email" className="sr-only">Email address</label>
            <input
              id="modal-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className={getFieldClass("email")}
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "modal-email-error" : undefined}
            />
            {errors.email && (
              <p id="modal-email-error" className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="modal-phone" className="sr-only">Phone number</label>
            <input
              id="modal-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone *"
              className={getFieldClass("phone")}
              type="tel"
              autoComplete="tel"
              required
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "modal-phone-error" : undefined}
            />
            {errors.phone && (
              <p id="modal-phone-error" className="text-red-500 text-sm mt-1" role="alert">{errors.phone}</p>
            )}
          </div>
          <div>
            <label htmlFor="modal-message" className="sr-only">Message</label>
            <textarea
              id="modal-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your cleaning needs *"
              className={getFieldClass("message")}
              rows={4}
              required
              aria-required="true"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "modal-message-error" : undefined}
            />
            {errors.message && (
              <p id="modal-message-error" className="text-red-500 text-sm mt-1" role="alert">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-deep-blue transition-colors duration-300 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
          {errors.submit && (
            <p className="text-red-500 text-sm mt-1" role="alert">{errors.submit}</p>
          )}
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
