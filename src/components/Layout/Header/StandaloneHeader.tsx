"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { validateEmail } from "@/lib/forms";
import { normalizePhone } from "@/lib/validation/phone";
import TopHeader from "./TopHeader";
import Logo from "./Logo";
import BookServicesModal from "./BookServicesModal";

type HelpFormState = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

type HelpFormErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const initialHelpForm: HelpFormState = {
  name: "",
  email: "",
  phone: "",
  notes: "",
};

const StandaloneHeader = (): React.ReactElement => {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpForm, setHelpForm] = useState<HelpFormState>(initialHelpForm);
  const [helpErrors, setHelpErrors] = useState<HelpFormErrors>({});
  const [helpSubmitError, setHelpSubmitError] = useState<string | null>(null);
  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const hasHelpFieldErrors = Object.values(helpErrors).some(Boolean);
  const getHelpFieldClass = (field: keyof HelpFormErrors) =>
    `input-field ${helpErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`;
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "Plan Your Cleaning",
    submitLabel: "Get started today",
    showServiceOptions: true,
    showScheduleFields: false,
    initialServiceSlug: "",
  });

  const toggleHelpModal = (): void => {
    setHelpModalOpen((prev) => !prev);
    if (!helpModalOpen) {
      setHelpForm(initialHelpForm);
      setHelpErrors({});
      setHelpSubmitError(null);
      setHelpSubmitted(false);
    }
  };

  const handleHelpChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target;
    setHelpForm((prev) => ({ ...prev, [name]: value }));
    if (helpSubmitted) {
      setHelpSubmitted(false);
    }
    if (helpSubmitError) {
      setHelpSubmitError(null);
    }
    if (name === "name" || name === "email" || name === "phone") {
      if (helpErrors[name as keyof HelpFormErrors]) {
        setHelpErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleHelpSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (helpLoading) return;
    const newHelpErrors: HelpFormErrors = {};
    let firstErrorField = "";

    if (!helpForm.name.trim()) {
      newHelpErrors.name = "Name is required.";
      if (!firstErrorField) firstErrorField = "name";
    }
    const emailError = validateEmail(helpForm.email);
    if (emailError) {
      newHelpErrors.email = emailError;
      if (!firstErrorField) firstErrorField = "email";
    }
    const phoneResult = normalizePhone(helpForm.phone, { required: true });
    if (!phoneResult.isValid) {
      newHelpErrors.phone = phoneResult.error || "Please provide a valid phone number.";
      if (!firstErrorField) firstErrorField = "phone";
    }

    if (Object.keys(newHelpErrors).length > 0) {
      setHelpErrors(newHelpErrors);
      if (firstErrorField) {
        setTimeout(() => {
          const element = document.querySelector(
            `[name="${firstErrorField}"]`,
          ) as HTMLElement | null;
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
          element?.focus();
        }, 100);
      }
      return;
    }

    try {
      setHelpLoading(true);
      setHelpSubmitError(null);
      setHelpSubmitted(false);
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...helpForm,
          phone: phoneResult.e164 || helpForm.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit help request");
      }

      setHelpForm(initialHelpForm);
      setHelpErrors({});
      setHelpSubmitted(true);
    } catch (error) {
      console.error("Help request submission error:", error);
      setHelpSubmitError(
        error instanceof Error ? error.message : "Failed to submit help request. Please try again."
      );
    } finally {
      setHelpLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleOpenModal = (event: Event) => {
      const customEvent = event as CustomEvent<{
        mode?: string;
        serviceSlug?: string;
      }>;
      const isSiteVisit = customEvent.detail?.mode === "site-visit";
      setModalConfig({
        title: isSiteVisit ? "Plan Your Site Visit" : "Plan Your Cleaning",
        submitLabel: isSiteVisit ? "Request a Site Visit" : "Get started today",
        showServiceOptions: !isSiteVisit,
        showScheduleFields: isSiteVisit,
        initialServiceSlug: customEvent.detail?.serviceSlug || "",
      });
      setPhoneModalOpen(true);
    };
    window.addEventListener("open-book-services-modal", handleOpenModal);
    return () => window.removeEventListener("open-book-services-modal", handleOpenModal);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleContactModalOpen = () => {
    closeSidebar();
    setHelpModalOpen(true);
  };

  const handleQuoteBookNow = () => {
    closeSidebar();
    const submitButton = document.getElementById("quote-book-submit");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
      return;
    }
    const form = document.getElementById("quote-book-form");
    if (form instanceof HTMLElement) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className="hidden lg:block">
        <TopHeader />
      </div>
      <header className="sticky top-0 z-40 bg-white dark:bg-secondary shadow-xl">
        <div className="py-5 lg:py-4">
          <div className="container flex items-center justify-between">
          <Logo />
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Link
              href={"tel:+18009300532"}
              className="group flex items-center gap-2 px-3 xl:px-4 py-2 hover:bg-primary dark:hover:bg-white/25 rounded-md transition duration-300"
            >
              <span className="text-[15px] xl:text-base font-semibold text-secondary group-hover:text-white dark:text-white">
                (800) 930-0532
              </span>
            </Link>
            <div
              onClick={() => setPhoneModalOpen(true)}
              className="group flex items-center py-2.5 xl:py-3 px-3 xl:px-4 bg-secondary hover:bg-deep-blue dark:bg-white/25 rounded-sm cursor-pointer transition-colors duration-300"
            >
              <span className="text-sm text-white group-hover:text-white font-bold">Book a service</span>
            </div>
            <button
              type="button"
              onClick={toggleHelpModal}
              className="flex items-center gap-2 bg-primary hover:bg-deep-blue text-white font-semibold py-2.5 xl:py-3 px-3 xl:px-4 rounded-sm transition-colors duration-300"
            >
              Need help? Let us call you
            </button>
          </div>
          <div className="flex lg:hidden gap-5">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center">
              <span className="sr-only">Toggle menu</span>
              <svg className="w-7 h-7 text-secondary dark:text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </header>

      {helpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={toggleHelpModal}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-md bg-white dark:bg-secondary shadow-2xl p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-secondary dark:text-white">
                  Need Help With Your Quote?
                </h3>
                <p className="text-secondary/70 dark:text-white/70 mt-1 text-sm">
                  Leave your details and a coordinator will contact you soon.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleHelpModal}
                aria-label="Close help form"
                className="text-secondary/50 hover:text-secondary dark:text-white/60 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <form className="mt-6 flex flex-col gap-5" onSubmit={handleHelpSubmit}>
              {hasHelpFieldErrors && (
                <p className="text-red-500 text-sm" role="alert">
                  Please fix the highlighted fields before submitting.
                </p>
              )}
              <div>
                <label htmlFor="help-name" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Full name *
                </label>
                <input
                  id="help-name"
                  name="name"
                  type="text"
                  value={helpForm.name}
                  onChange={handleHelpChange}
                  className={getHelpFieldClass("name")}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                  aria-invalid={!!helpErrors.name}
                  aria-describedby={helpErrors.name ? "help-name-error" : undefined}
                />
                {helpErrors.name && (
                  <p id="help-name-error" className="text-red-500 text-sm mt-1" role="alert">
                    {helpErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="help-email" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Email address *
                </label>
                <input
                  id="help-email"
                  name="email"
                  type="email"
                  value={helpForm.email}
                  onChange={handleHelpChange}
                  className={getHelpFieldClass("email")}
                  placeholder="Where should we send confirmation?"
                  autoComplete="email"
                  required
                  aria-invalid={!!helpErrors.email}
                  aria-describedby={helpErrors.email ? "help-email-error" : undefined}
                />
                {helpErrors.email && (
                  <p id="help-email-error" className="text-red-500 text-sm mt-1" role="alert">
                    {helpErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="help-phone" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Phone number *
                </label>
                <input
                  id="help-phone"
                  name="phone"
                  type="tel"
                  value={helpForm.phone}
                  onChange={handleHelpChange}
                  className={getHelpFieldClass("phone")}
                  placeholder="Which number should we call?"
                  autoComplete="tel"
                  required
                  aria-invalid={!!helpErrors.phone}
                  aria-describedby={helpErrors.phone ? "help-phone-error" : undefined}
                />
                {helpErrors.phone && (
                  <p id="help-phone-error" className="text-red-500 text-sm mt-1" role="alert">
                    {helpErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="help-notes" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Additional details
                </label>
                <textarea
                  id="help-notes"
                  name="notes"
                  value={helpForm.notes}
                  onChange={handleHelpChange}
                  className="input-field"
                  rows={4}
                  placeholder="Tell us briefly how we can help"
                />
              </div>
              <button
                type="submit"
                disabled={helpLoading}
                className="bg-primary hover:bg-deep-blue text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {helpLoading ? "Sending..." : "Request a callback"}
              </button>
              {helpSubmitted && (
                <p className="text-primary text-sm" role="status" aria-live="polite">
                  Request received. We sent a confirmation email and our team will contact you soon.
                </p>
              )}
              {helpSubmitError && (
                <p className="text-red-500 text-sm" role="alert">
                  {helpSubmitError}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[110] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            role="presentation"
          />
          <div
            className={`fixed top-0 right-0 h-full w-full max-w-xs transform transition-transform duration-400 z-[120] lg:hidden ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="absolute inset-0 bg-white/98 backdrop-blur-md dark:bg-secondary/95" />
            <div className="relative h-full overflow-y-auto shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between p-4">
                <Logo />
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close mobile menu"
                  className="cursor-pointer"
                >
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
              </div>
              <div className="p-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleQuoteBookNow}
                  className="group bg-secondary hover:bg-deep-blue flex items-center justify-center py-2.5 px-3 rounded-sm transition-colors duration-300 text-white font-bold"
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={handleContactModalOpen}
                  className="group bg-primary hover:bg-deep-blue flex items-center justify-center py-2.5 px-3 rounded-sm transition-colors duration-300 text-white font-bold"
                >
                  Need help? Let us call you
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {phoneModalOpen && (
        <BookServicesModal
          isOpen={phoneModalOpen}
          closeModal={() => setPhoneModalOpen(false)}
          title={modalConfig.title}
          submitLabel={modalConfig.submitLabel}
          showServiceOptions={modalConfig.showServiceOptions}
          showScheduleFields={modalConfig.showScheduleFields}
          initialServiceSlug={modalConfig.initialServiceSlug}
        />
      )}
    </>
  );
};

export default StandaloneHeader;
