'use client';

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

interface QuoteFormData {
  preferredDate: string;
  serviceType: string;
  frequency: string;
  bedrooms: string;
  bathrooms: string;
  propertySize: string;
  extras: Record<string, number>;
  serviceDate: string;
  timeSlot: string;
  tipPercentage: string;
  customTip: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  comments: string;
}

const SLUG_TO_SERVICE_TYPE: Record<string, string> = {
  "regular-cleaning": "Standard Clean",
  "deep-cleaning": "Deep Cleaning",
  "movein-moveout": "Move-in Clean",
  "move-in-out": "Move-in Clean",
  "move-out-clean": "Move-out Clean",
  "post-construction": "Post-Construction",
  "removal-storage": "Post-Construction",
  "post-renovation-cleaning": "Post-Construction",
  "eco-friendly-cleaning": "One-Time Clean",
};

const QuotePageContent = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<QuoteFormData>({
    preferredDate: "",
    serviceType: "Standard Clean",
    frequency: "bi-weekly",
    bedrooms: "1",
    bathrooms: "1",
    propertySize: "750",
    extras: {},
    serviceDate: "",
    timeSlot: "",
    tipPercentage: "15",
    customTip: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    zipCode: "",
    comments: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const serviceSlug = searchParams.get("service");
    const legacyService = searchParams.get("services");
    const resolvedServiceType =
      (serviceSlug && SLUG_TO_SERVICE_TYPE[serviceSlug]) ||
      (legacyService && SLUG_TO_SERVICE_TYPE[legacyService]) ||
      legacyService?.split(",")[0] ||
      "";

    const heroData = {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      phone: searchParams.get("phone") || "",
      serviceType: resolvedServiceType,
      zipCode: searchParams.get("zipCode") || "",
    };

    if (
      heroData.name ||
      heroData.email ||
      heroData.phone ||
      heroData.serviceType ||
      heroData.zipCode
    ) {
      setFormData((prev) => ({
        ...prev,
        ...heroData,
      }));
    }
  }, [searchParams]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let firstErrorField = "";

    const requiredFields: Array<keyof QuoteFormData> = [
      "zipCode",
      "serviceType",
      "bedrooms",
      "bathrooms",
      "propertySize",
      "name",
      "email",
      "phone",
      "address",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];
      if (typeof value === "string" && !value.trim()) {
        newErrors[field] = "This field is required";
        if (!firstErrorField) {
          firstErrorField = field;
        }
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      if (!firstErrorField) {
        firstErrorField = "email";
      }
    }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
      if (!firstErrorField) {
        firstErrorField = "phone";
      }
    }

    const zipRegex = /^\d{5}$/;
    if (formData.zipCode && !zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = "Enter a valid 5-digit ZIP code";
      if (!firstErrorField) {
        firstErrorField = "zipCode";
      }
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

  const getServiceId = (serviceName: string): string => {
    const serviceMap: Record<string, string> = {
      "Standard Clean": "regular-cleaning",
      "Deep Cleaning": "deep-cleaning",
      "Move-in Clean": "move-in-out",
      "Move-out Clean": "move-in-out",
      "Post-Construction": "post-construction",
      "One-Time Clean": "regular-cleaning",
    };
    return serviceMap[serviceName] || "regular-cleaning";
  };

  const calculatedPrice = useMemo((): number => {
    let basePrice = 0;
    const propertySize = parseInt(formData.propertySize, 10) || 0;
    const bedrooms = parseInt(formData.bedrooms, 10) || 0;
    const bathrooms = parseInt(formData.bathrooms, 10) || 0;

    const servicePrices: Record<string, number> = {
      "Standard Clean": 0.12,
      "Deep Cleaning": 0.2,
      "Move-in Clean": 0.18,
      "Move-out Clean": 0.18,
      "Post-Construction": 0.25,
      "One-Time Clean": 0.15,
    };

    const rate = servicePrices[formData.serviceType] || 0.12;
    basePrice = propertySize * rate;

    const roomAdjustment = bedrooms * 8 + bathrooms * 12;
    basePrice += roomAdjustment;

    if (formData.serviceType === "Standard Clean" && formData.frequency) {
      const frequencyMultiplier: Record<string, number> = {
        weekly: 0.9,
        "bi-weekly": 1,
        monthly: 1.1,
      };
      const multiplier = frequencyMultiplier[formData.frequency] || 1;
      basePrice *= multiplier;
    }

    const extrasPrices: Record<string, number> = {
      interior_windows: 25,
      blinds_cleaning: 30,
      dishes: 15,
      inside_oven: 35,
      inside_fridge: 30,
      pet_hair_removal: 20,
      heavy_duty: 50,
      garage_cleaning: 40,
    };

    const extrasTotal = Object.entries(formData.extras).reduce((total, [key, quantity]) => {
      if (quantity > 0) {
        return total + (extrasPrices[key] || 0) * quantity;
      }
      return total;
    }, 0);

    let tipPercentage = 0;
    if (formData.tipPercentage === "other" && formData.customTip) {
      tipPercentage = parseInt(formData.customTip, 10) || 0;
    } else if (formData.tipPercentage && formData.tipPercentage !== "other") {
      tipPercentage = parseInt(formData.tipPercentage, 10) || 0;
    }
    const tipAmount = (basePrice + extrasTotal) * (tipPercentage / 100);

    const taxRate = 0.07;
    const subtotal = basePrice + extrasTotal + tipAmount;
    const tax = subtotal * taxRate;
    const totalPrice = Math.round(subtotal + tax);

    return Math.max(totalPrice, 75);
  }, [formData]);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Track InitiateCheckout event
    try {
      await fetch("/api/meta/pixel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: "InitiateCheckout",
          user_data: {
            email: formData.email,
            first_name: formData.name?.split(' ')[0],
            last_name: formData.name?.split(' ').slice(1).join(' '),
            phone: formData.phone,
          },
          custom_data: {
            value: calculatedPrice,
            currency: "USD",
            content_name: formData.serviceType,
            content_category: "Cleaning Service",
          },
        }),
      });
    } catch (error) {
      console.error("Error tracking InitiateCheckout:", error);
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: getServiceId(formData.serviceType),
          customerEmail: formData.email,
          customerName: formData.name,
          customPrice: calculatedPrice,
          quoteData: {
            serviceType: formData.serviceType,
            frequency: formData.frequency,
            propertySize: formData.propertySize,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            serviceDate: formData.serviceDate,
            timeSlot: formData.timeSlot,
            tipPercentage: formData.tipPercentage,
            address: formData.address,
            zipCode: formData.zipCode,
            extras: formData.extras,
            comments: formData.comments,
            calculatedPrice,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const { sessionId } = await response.json();
      const sessionResponse = await fetch(`/api/checkout-session/${sessionId}`);

      if (!sessionResponse.ok) {
        throw new Error("Error getting checkout session URL");
      }

      const { url } = await sessionResponse.json();
      window.location.href = url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error:", errorMessage);
      setErrors({ submit: `Error processing payment: ${errorMessage}. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite-warm dark:bg-dark-gray">
      <div className="pt-6 pb-0 -mt-32">
        <div className="container px-0 sm:px-6">
          <div className="w-full max-w-6xl mx-auto bg-white dark:bg-secondary shadow-none sm:shadow-xl rounded-none sm:rounded-md p-0 sm:p-6 lg:p-10">
            <div className="mb-8 text-center">
              <p className="mt-3 text-secondary/70 dark:text-white/70 max-w-2xl mx-auto">
                Select the service type, property details, and optional extras to receive a tailored estimate from Integrity Clean Solutions.
              </p>
            </div>
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-secondary/70 dark:text-white/70 hover:text-secondary dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-2xl lg:text-3xl font-bold">Book Now</h2>
              <div className="w-16" />
            </div>

            <form id="quote-book-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Availability</h3>
                    <div>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="ZIP Code *"
                        maxLength={5}
                        autocomplete="postal-code"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Service Type *</h3>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="input-field h-12"
                    >
                      <option value="">Select service</option>
                      <option value="Standard Clean">Standard Clean</option>
                      <option value="Deep Cleaning">Deep Cleaning</option>
                      <option value="Move-in Clean">Move-in Clean</option>
                      <option value="Move-out Clean">Move-out Clean</option>
                      <option value="Post-Construction">Post-Construction</option>
                      <option value="One-Time Clean">One-Time Clean</option>
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Frequency</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { value: "weekly", label: "Every Week" },
                        { value: "bi-weekly", label: "Every 2 Weeks" },
                        { value: "monthly", label: "Every Month" },
                        { value: "one-time", label: "One Time" },
                      ].map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, frequency: freq.value }))
                          }
                          className={`py-2 px-4 rounded-sm border transition-colors ${formData.frequency === freq.value
                            ? "bg-primary text-white border-primary"
                            : "bg-white dark:bg-gray-700 text-secondary dark:text-white border-gray-300 dark:border-gray-600 hover:border-primary"
                            }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Bedrooms *</label>
                        <select
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          className="input-field h-12"
                        >
                          <option value="">Select</option>
                          <option value="1">1 Bedroom</option>
                          <option value="2">2 Bedrooms</option>
                          <option value="3">3 Bedrooms</option>
                          <option value="4">4 Bedrooms</option>
                          <option value="5+">5+ Bedrooms</option>
                        </select>
                        {errors.bedrooms && (
                          <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bathrooms *</label>
                        <select
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          className="input-field h-12"
                        >
                          <option value="">Select</option>
                          <option value="1">1 Bathroom</option>
                          <option value="1.5">1.5 Bathrooms</option>
                          <option value="2">2 Bathrooms</option>
                          <option value="2.5">2.5 Bathrooms</option>
                          <option value="3">3 Bathrooms</option>
                          <option value="3.5">3.5 Bathrooms</option>
                          <option value="4">4 Bathrooms</option>
                          <option value="4.5">4.5 Bathrooms</option>
                          <option value="5">5 Bathrooms</option>
                          <option value="5.5">5.5 Bathrooms</option>
                          <option value="6+">6+ Bathrooms</option>
                        </select>
                        {errors.bathrooms && (
                          <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Sq Ft *</label>
                        <select
                          name="propertySize"
                          value={formData.propertySize}
                          onChange={handleChange}
                          className="input-field h-12"
                        >
                          <option value="">Select</option>
                          <option value="750">1 - 999 Sq Ft</option>
                          <option value="1250">1000 - 1499 Sq Ft</option>
                          <option value="1750">1500 - 1999 Sq Ft</option>
                          <option value="2250">2000 - 2499 Sq Ft</option>
                          <option value="2750">2500 - 2999 Sq Ft</option>
                          <option value="3250">3000 - 3499 Sq Ft</option>
                          <option value="3750">3500 - 3999 Sq Ft</option>
                          <option value="4250">4000 - 4499 Sq Ft</option>
                          <option value="4750">4500 - 4999 Sq Ft</option>
                          <option value="5250">5000+ Sq Ft</option>
                        </select>
                        {errors.propertySize && (
                          <p className="text-red-500 text-sm mt-1">{errors.propertySize}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Extras</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: "interior_windows", label: "Interior Windows", price: 25, icon: "🪟" },
                        { key: "blinds_cleaning", label: "Blinds Cleaning", price: 30, icon: "🏠" },
                        { key: "dishes", label: "Dishes", price: 15, icon: "🍽️" },
                        { key: "inside_oven", label: "Inside Oven", price: 35, icon: "🔥" },
                        { key: "inside_fridge", label: "Inside Fridge", price: 30, icon: "❄️" },
                        { key: "pet_hair_removal", label: "Pet Hair Removal", price: 20, icon: "🐕" },
                        { key: "heavy_duty", label: "Heavy Duty Clean", price: 50, icon: "💪" },
                        { key: "garage_cleaning", label: "Garage Cleaning", price: 40, icon: "🚗" },
                      ].map((extra) => {
                        const quantity = formData.extras[extra.key] || 0;
                        const totalPrice = extra.price * quantity;
                        return (
                          <div
                            key={extra.key}
                            className={`p-4 border rounded-lg transition-colors ${quantity > 0
                              ? "border-primary bg-primary/10"
                              : "border-gray-300 dark:border-gray-600 hover:border-primary"
                              }`}
                          >
                            <div className="text-center mb-3">
                              <div className="text-2xl mb-2">{extra.icon}</div>
                              <div className="text-sm font-medium mb-1">{extra.label}</div>
                              <div className="text-primary font-semibold text-xs">
                                ${extra.price} each
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    extras: {
                                      ...prev.extras,
                                      [extra.key]: Math.max(0, (prev.extras[extra.key] || 0) - 1),
                                    },
                                  }))
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={quantity === 0}
                                aria-label="Decrease quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <div className="min-w-[3rem] text-center">
                                <span className="text-lg font-semibold">{quantity}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    extras: {
                                      ...prev.extras,
                                      [extra.key]: (prev.extras[extra.key] || 0) + 1,
                                    },
                                  }))
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            {quantity > 0 && (
                              <div className="mt-2 text-center">
                                <div className="text-xs text-secondary/70 dark:text-white/60">
                                  Total:{" "}
                                  <span className="font-semibold text-primary">${totalPrice}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Service Date and Time</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred Date</label>
                        <input
                          type="date"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleChange}
                          className="input-field h-12"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Service Date</label>
                        <input
                          type="date"
                          name="serviceDate"
                          value={formData.serviceDate}
                          onChange={handleChange}
                          className="input-field h-12"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Time Slot</label>
                        <select
                          name="timeSlot"
                          value={formData.timeSlot}
                          onChange={handleChange}
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
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Tips (Optional)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                      {["0", "10", "15", "20", "other"].map((tip) => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, tipPercentage: tip }))
                          }
                          className={`py-2 px-4 rounded-sm border transition-colors ${formData.tipPercentage === tip
                            ? "bg-primary text-white border-primary"
                            : "bg-white dark:bg-gray-700 text-secondary dark:text-white border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                            }`}
                        >
                          {tip === "other" ? "Other" : `${tip}%`}
                        </button>
                      ))}
                    </div>
                    {formData.tipPercentage === "other" && (
                      <input
                        type="number"
                        name="customTip"
                        placeholder="Enter custom tip percentage"
                        className="input-field"
                        min="0"
                        max="100"
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, customTip: event.target.value }))
                        }
                      />
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Full name *"
                          autocomplete="name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Email address *"
                          autocomplete="email"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Phone number *"
                          autocomplete="tel"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Full address *"
                          autocomplete="street-address"
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Comments</h3>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      className="input-field resize-none"
                      rows={4}
                      placeholder="Special items or instructions..."
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-offwhite-warm dark:bg-secondary p-6 rounded-lg sticky top-24 lg:top-28 border border-primary/20 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

                    <div className="space-y-3 mb-6">
                      {formData.serviceType && (
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="font-medium">{formData.serviceType}</span>
                        </div>
                      )}
                      {formData.frequency && (
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="font-medium">{formData.frequency}</span>
                        </div>
                      )}
                      {formData.bedrooms && formData.bathrooms && (
                        <div className="flex justify-between">
                          <span>Property:</span>
                          <span className="font-medium">
                            {formData.bedrooms} bed, {formData.bathrooms} bath
                          </span>
                        </div>
                      )}
                      {formData.propertySize && (
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">{formData.propertySize} sq ft</span>
                        </div>
                      )}
                      {Object.values(formData.extras).some((qty) => qty > 0) && (
                        <div className="flex justify-between">
                          <span>Extras:</span>
                          <span className="font-medium">
                            {Object.values(formData.extras).reduce(
                              (sum, qty) => sum + qty,
                              0,
                            )}{" "}
                            items
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${calculatedPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-secondary/70 dark:text-white/60 mb-6">
                        *Price includes taxes and selected tip
                      </p>
                      <button
                        id="quote-book-submit"
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-sm font-bold text-lg transition-all bg-primary hover:bg-deep-blue text-white ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
                          }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5 text-white"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Book Now"
                        )}
                      </button>
                      {errors.submit && (
                        <p className="text-red-500 text-sm mt-3 text-center">{errors.submit}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-xl">
              <div className="text-center">
                <p className="text-sm text-secondary/70 dark:text-white/60 mb-1">Total</p>
                <p className="text-2xl font-bold text-primary mb-2">
                  ${calculatedPrice.toFixed(2)}
                </p>
                <p className="text-xs text-secondary/60 dark:text-white/50">
                  *Price includes taxes and selected tip
                </p>
              </div>
            </div>
            <div className="lg:hidden h-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuotePage = (): React.ReactElement => {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading quote...</div>}>
      <QuotePageContent />
    </Suspense>
  );
};

export default QuotePage;
