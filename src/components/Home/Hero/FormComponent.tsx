"use client";

import { useEffect, useState } from "react";
import type { FormErrors } from "@/lib/forms";
import { validateName, validateEmail, validatePhone, validateZipCode } from "@/lib/forms";
import { createEmptyErrors, clearFieldError } from "@/lib/forms";

const DEFAULT_SERVICE_OPTIONS = [
  { slug: "airbnb-cleaning", nombre: "Airbnb Cleaning" },
  { slug: "regular-cleaning", nombre: "Regular Cleaning" },
  { slug: "deep-cleaning", nombre: "Deep Cleaning" },
  { slug: "move-in-out-cleaning", nombre: "Move-In / Move-Out" },
  { slug: "post-construction-cleaning", nombre: "Post-Construction" },
  { slug: "carpet-cleaning", nombre: "Carpet Cleaning" },
  { slug: "commercial-cleaning", nombre: "Commercial Cleaning" },
];

interface FormComponentProps {
  formData: {
    name: string;
    number: string;
    email: string;
    services: string[];
    zip?: string;
  };
  isLoading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onServiceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function FormComponent({
  formData,
  isLoading = false,
  onChange,
  onServiceChange,
  onSubmit,
}: FormComponentProps) {
  // Scalable error pattern: Record<string, string> - same as Stripe, Linear, Vercel
  const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());
  const [isDesktop, setIsDesktop] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<Array<{ slug: string; nombre: string }>>(DEFAULT_SERVICE_OPTIONS);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.servicios) && data.servicios.length > 0) {
          setServiceOptions(
            data.servicios.map((service: { slug: string; nombre: string }) => ({
              slug: service.slug,
              nombre: service.nombre,
            })),
          );
        }
      })
      .catch(() => setServiceOptions(DEFAULT_SERVICE_OPTIONS));
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Desktop: validate name and email
    if (isDesktop) {
      const nameError = validateName(formData.name, true);
      if (nameError) newErrors.name = nameError;

      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    // Mobile: validate ZIP code
    if (!isDesktop && formData.zip) {
      const zipError = validateZipCode(formData.zip, false);
      if (zipError) newErrors.zip = zipError;
    }

    // Phone validation (if provided)
    if (formData.number?.trim()) {
      const phoneError = validatePhone(formData.number, false);
      if (phoneError) newErrors.number = phoneError;
    }

    // At least phone or ZIP required
    if (!(formData.number?.trim() || formData.zip?.trim())) {
      newErrors.number = "Phone or ZIP code is required.";
      newErrors.zip = "Phone or ZIP code is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);

    // Clear error when user starts typing - scalable pattern
    const fieldName = e.target.name;
    if (errors[fieldName]) {
      setErrors(prev => clearFieldError(prev, fieldName));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="hidden lg:flex flex-col gap-5">
        <div>
          <label htmlFor="hero-name" className="sr-only">Full name</label>
          <input
            id="hero-name"
            type="text"
            name="name"
            placeholder="Full name *"
            onChange={handleFieldChange}
            value={formData.name}
            className="input-field"
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "hero-name-error" : undefined}
          />
          {errors.name && (
            <p id="hero-name-error" className="text-red-500 text-sm mt-1" role="alert">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="hero-phone" className="sr-only">Phone number</label>
          <input
            id="hero-phone"
            type="tel"
            name="number"
            placeholder="Phone number *"
            onChange={handleFieldChange}
            value={formData.number}
            className="input-field"
            autoComplete="tel"
            aria-required="true"
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? "hero-number-error" : undefined}
          />
          {errors.number && (
            <p id="hero-number-error" className="text-red-500 text-sm mt-1" role="alert">{errors.number}</p>
          )}
        </div>

        <div>
          <label htmlFor="hero-email" className="sr-only">Email address</label>
          <input
            id="hero-email"
            type="email"
            name="email"
            placeholder="Email address *"
            onChange={handleFieldChange}
            value={formData.email}
            className="input-field"
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "hero-email-error" : undefined}
          />
          {errors.email && (
            <p id="hero-email-error" className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:hidden">
        <label htmlFor="hero-zip" className="sr-only">ZIP code</label>
        <input
          id="hero-zip"
          type="text"
          name="zip"
          placeholder="ZIP code *"
          className="input-field"
          inputMode="numeric"
          pattern="\d*"
          onChange={handleFieldChange}
          value={formData.zip || ""}
          autoComplete="postal-code"
          aria-required="true"
          aria-invalid={!!errors.zip}
          aria-describedby={errors.zip ? "hero-zip-error" : undefined}
        />
        {errors.zip && (
          <p id="hero-zip-error" className="text-red-500 text-sm mt-1" role="alert">{errors.zip}</p>
        )}
      </div>

      <div className="hidden lg:flex flex-col gap-4">
        <p className="font-semibold text-dusty-gray dark:text-white/90">Service options</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-5 gap-y-2.5">
          {serviceOptions.map((service) => (
            <div key={service.slug} className="flex items-center">
              <input
                type="checkbox"
                name={service.slug}
                onChange={onServiceChange}
                checked={formData.services.includes(service.slug)}
                className="w-5 h-5"
                id={service.slug}
              />
              <label htmlFor={service.slug} className="text-dusty-gray dark:text-white/70 ml-2 cursor-pointer">
                {service.nombre}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group w-fit flex items-center py-3 px-6 bg-primary hover:bg-deep-blue disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-300 rounded-sm cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-base text-white font-bold">Processing...</span>
            </>
          ) : (
            <span className="text-base text-white font-bold">Get started today</span>
          )}
        </button>
      </div>
    </form>
  );
}
