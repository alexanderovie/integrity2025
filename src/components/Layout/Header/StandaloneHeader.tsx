"use client";

import { useState } from "react";
import TopHeader from "./TopHeader";
import Logo from "./Logo";

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

    // Placeholder for future integration (e.g., API or CRM)
    console.info("Help request submitted", helpForm);
    toggleHelpModal();
  };

  return (
    <>
      <TopHeader />
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-secondary/90 backdrop-blur border-b border-natural-gray/60">
        <div className="container flex items-center justify-between py-4">
          <Logo />
          <button
            type="button"
            onClick={toggleHelpModal}
            className="flex items-center gap-2 bg-primary hover:bg-deep-blue text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
          >
            Need help? Let us call you
          </button>
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
    </>
  );
};

export default StandaloneHeader;

