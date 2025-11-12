"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TopHeader from "./TopHeader";
import Logo from "./Logo";
import BookServicesModal from "./BookServicesModal";
import ContactModal from "./ContactModal";


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
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

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

  const handleHelpSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
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

    console.info("Help request submitted", helpForm);
    toggleHelpModal();
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <TopHeader />
      <header className="sticky top-[40px] sm:top-[44px] lg:top-[52px] z-30 bg-white/90 dark:bg-secondary/90 backdrop-blur border-b border-natural-gray/60">
        <div className="container flex items-center justify-between py-5 lg:py-4">
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
        {sidebarOpen && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
            role="presentation"
          />
        )}
        <div
          className={`lg:hidden fixed top-[40px] sm:top-[44px] h-full w-full bg-white dark:bg-secondary shadow-lg transform transition-transform duration-500 max-w-xs ${sidebarOpen ? "translate-x-0 right-0" : "translate-x-full -right-full"} z-50`}
        >
          <div className="flex items-center justify-between p-4">
            <Logo />
            <button onClick={() => setSidebarOpen(false)} aria-label="Close mobile menu" className="cursor-pointer">
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
          <div className="p-6">
            <ul className="flex flex-col">
              <li className="py-1.5">
                <Link href="/" onClick={handleNavClick} className="font-semibold dark:text-white">
                  Home
                </Link>
              </li>
              <li className="py-1.5">
                <Link href="/services" onClick={handleNavClick} className="font-semibold dark:text-white">
                  Services
                </Link>
              </li>
              <li className="py-1.5">
                <Link href="/contact-us" onClick={handleNavClick} className="font-semibold dark:text-white">
                  Contact
                </Link>
              </li>
            </ul>
            <Link
              href="/quote"
              onClick={handleNavClick}
              className="group bg-primary hover:bg-deep-blue mt-4 flex items-center justify-center py-2.5 px-3 rounded-sm transition-colors duration-300"
            >
              <span className="text-sm text-white font-bold group-hover:text-white">Get a Quote</span>
            </Link>
            <button
              onClick={handleBookModalOpen}
              className="group bg-secondary hover:bg-deep-blue mt-3 flex items-center justify-center py-2.5 px-3 rounded-sm transition-colors duration-300 text-white font-bold"
            >
              Book a Service
            </button>
            <button
              type="button"
              onClick={handleContactModalOpen}
              className="group bg-primary hover:bg-deep-blue mt-3 flex items-center justify-center py-2.5 px-3 rounded-sm transition-colors duration-300 text-white font-bold"
            >
              Need help? Let us call you
            </button>
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
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-secondary/70 dark:text-white/70 mt-1 text-sm">
                  Déjanos tus datos y un especialista te llamará en minutos.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleHelpModal}
                aria-label="Cerrar formulario de ayuda"
                className="text-secondary/50 hover:text-secondary dark:text-white/60 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <form className="mt-6 flex flex-col gap-5" onSubmit={handleHelpSubmit}>
              <div>
                <label htmlFor="help-name" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Nombre completo *
                </label>
                <input
                  id="help-name"
                  name="name"
                  type="text"
                  value={helpForm.name}
                  onChange={handleHelpChange}
                  className="input-field"
                  placeholder="Ingresa tu nombre"
                  required
                />
                {helpErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{helpErrors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="help-phone" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Teléfono *
                </label>
                <input
                  id="help-phone"
                  name="phone"
                  type="tel"
                  value={helpForm.phone}
                  onChange={handleHelpChange}
                  className="input-field"
                  placeholder="¿A qué número te llamamos?"
                  required
                />
                {helpErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{helpErrors.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="help-notes" className="block text-sm font-medium mb-1 text-secondary dark:text-white">
                  Detalles adicionales
                </label>
                <textarea
                  id="help-notes"
                  name="notes"
                  value={helpForm.notes}
                  onChange={handleHelpChange}
                  className="input-field"
                  rows={4}
                  placeholder="Cuéntanos brevemente qué necesitas"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-deep-blue text-white font-semibold py-3 px-4 rounded-md transition-colors"
              >
                Solicitar llamada
              </button>
            </form>
          </div>
        </div>
      )}

      {phoneModalOpen && (
        <BookServicesModal isOpen={phoneModalOpen} closeModal={() => setPhoneModalOpen(false)} />
      )}
    </>
  );
};

export default StandaloneHeader;

