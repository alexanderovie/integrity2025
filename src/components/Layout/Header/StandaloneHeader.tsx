"use client";

import { useState } from "react";
import Link from "next/link";
import TopHeader from "./TopHeader";
import Logo from "./Logo";
import BookServicesModal from "./BookServicesModal";

type HelpFormState = {
  name: string;
  phone: string;
  notes: string;
};

type HelpFormErrors = {
  name?: string;
  phone?: string;
};

const initialHelpForm: HelpFormState = {
  name: "",
  phone: "",
  notes: "",
};

const StandaloneHeader = (): React.ReactElement => {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpForm, setHelpForm] = useState<HelpFormState>(initialHelpForm);
  const [helpErrors, setHelpErrors] = useState<HelpFormErrors>({});
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleHelpModal = (): void => {
    setHelpModalOpen((prev) => !prev);
    if (!helpModalOpen) {
      setHelpForm(initialHelpForm);
      setHelpErrors({});
    }
  };

  const handleHelpChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target;
    setHelpForm((prev) => ({ ...prev, [name]: value }));
    if (name === "name" || name === "phone") {
      if (helpErrors[name as keyof HelpFormErrors]) {
        setHelpErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleHelpSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const newHelpErrors: HelpFormErrors = {};

    if (!helpForm.name.trim()) {
      newHelpErrors.name = "Please enter your name";
    }
    const phoneDigits = helpForm.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newHelpErrors.phone = "Please provide a phone number";
    } else if (phoneDigits.length < 7) {
      newHelpErrors.phone = "Phone number is too short";
    }

    if (Object.keys(newHelpErrors).length > 0) {
      setHelpErrors(newHelpErrors);
      return;
    }

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(helpForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit help request");
      }

      // Success - close modal and reset form
      toggleHelpModal();
    } catch (error) {
      console.error("Help request submission error:", error);
      // Show error to user (could add error state if needed)
      alert(error instanceof Error ? error.message : "Failed to submit help request. Please try again.");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleNavClick = () => closeSidebar();

  const handleBookModalOpen = () => {
    closeSidebar();
    setPhoneModalOpen(true);
  };

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
                  Leave your details and a specialist will reach out within minutes.
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
                  className="input-field"
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
                {helpErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{helpErrors.name}</p>
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
                  className="input-field"
                  placeholder="Which number should we call?"
                  autoComplete="tel"
                  required
                />
                {helpErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{helpErrors.phone}</p>
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
                className="bg-primary hover:bg-deep-blue text-white font-semibold py-3 px-4 rounded-md transition-colors"
              >
                Request a callback
              </button>
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
        <BookServicesModal isOpen={phoneModalOpen} closeModal={() => setPhoneModalOpen(false)} />
      )}
    </>
  );
};

export default StandaloneHeader;
