"use client";

import { services } from "@/app/api/services";
import { useEffect, useState } from "react";

interface FormComponentProps {
  formData: {
    name: string;
    number: string;
    email: string;
    services: string[];
    zip?: string;
  };
  submitted: boolean;
  showThanks?: boolean;
  isLoading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onServiceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function FormComponent({
  formData,
  submitted,
  showThanks,
  isLoading = false,
  onChange,
  onServiceChange,
  onSubmit,
}: FormComponentProps) {
  const [errors, setErrors] = useState<{
    name?: string;
    number?: string;
    email?: string;
    zip?: string;
  }>({});
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/; // basic digit-only validation
    const zipRegex = /^\d{4,10}$/;

    if (isDesktop) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required.";
      } else if (!nameRegex.test(formData.name)) {
        newErrors.name = "Name should only contain letters.";
      }
    }

    if (formData.number?.trim()) {
      if (!phoneRegex.test(formData.number)) {
        newErrors.number = "Enter a valid phone number (10-15 digits).";
      }
    }
    if (formData.zip?.trim()) {
      if (!zipRegex.test(formData.zip)) {
        newErrors.zip = "Enter a valid ZIP code.";
      }
    }
    if (!(formData.number?.trim() || formData.zip?.trim())) {
      newErrors.number = "Phone or ZIP code is required.";
      newErrors.zip = "Phone or ZIP code is required.";
    }

    if (isDesktop) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          <input
            type="text"
            name="name"
            placeholder="Full name *"
            onChange={onChange}
            value={formData.name}
            className="input-field"
            autoComplete="name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <input
            type="tel"
            name="number"
            placeholder="Phone number *"
            onChange={onChange}
            value={formData.number}
            className="input-field"
            autoComplete="tel"
          />
          {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email address *"
            onChange={onChange}
            value={formData.email}
            className="input-field"
            autoComplete="email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:hidden">
        <input
          type="text"
          name="zip"
          placeholder="ZIP code *"
          className="input-field"
          inputMode="numeric"
          pattern="\d*"
          onChange={onChange}
          value={formData.zip || ""}
          autoComplete="postal-code"
        />
        {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
      </div>

      <div className="hidden lg:flex flex-col gap-4">
        <p className="font-semibold text-dusty-gray dark:text-white/90">Service options</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-5 gap-y-2.5">
          {services.map(service => (
            <div key={service?.id} className="flex items-center">
              <input
                type="checkbox"
                name={service?.service_title}
                onChange={onServiceChange}
                checked={formData.services.includes(service?.service_title)}
                className="w-5 h-5"
                id={service?.service_title}
              />
              <label htmlFor={service?.service_title} className="text-dusty-gray dark:text-white/70 ml-2 cursor-pointer">
                {service?.service_title}
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
