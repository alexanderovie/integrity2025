'use client';

import { ServiceItem } from "@/lib/stripe";
import { useState } from "react";

interface StripeCheckoutButtonProps {
  service: ServiceItem;
  className?: string;
}

const StripeCheckoutButton = ({
  service,
  className = "",
}: StripeCheckoutButtonProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState<string>("");

  const handleCheckout = async (): Promise<void> => {
    if (!customerEmail || !customerName) {
      setError("Por favor completa todos los campos");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          customerEmail,
          customerName,
        }),
      });

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error("No se pudo crear la sesión de pago");
      }

      const sessionResponse = await fetch(`/api/checkout-session/${sessionId}`);
      const { url } = await sessionResponse.json();

      window.location.href = url;
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Unknown error";
      console.error("Error:", errorMessage);
      setError(`Error al procesar el pago: ${errorMessage}. Por favor intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="customerName" className="block text-sm font-medium text-secondary">
          Nombre Completo
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="input-field"
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customerEmail" className="block text-sm font-medium text-secondary">
          Email
        </label>
        <input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          className="input-field"
          placeholder="tu@email.com"
          required
        />
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md font-semibold transition-colors bg-primary hover:bg-deep-blue text-white ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Procesando..." : `Pagar $${(service.price / 100).toFixed(2)}`}
      </button>
    </div>
  );
};

export default StripeCheckoutButton;
