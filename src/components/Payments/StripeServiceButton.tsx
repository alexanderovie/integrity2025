'use client';

import { useState } from "react";

interface StripeServiceButtonProps {
  service: {
    id: string;
    slug: string;
    service_title: string;
    price: string;
    description: string;
  };
  className?: string;
}

const StripeServiceButton = ({
  service,
  className = "",
}: StripeServiceButtonProps): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showForm, setShowForm] = useState(false);
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
          serviceId: service.slug,
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

  if (!showForm) {
    return (
      <div
        onClick={() => setShowForm(true)}
        className={`py-4 px-3 bg-primary hover:bg-deep-blue rounded-md text-center cursor-pointer transition-colors ${className}`}
      >
        <span className="font-bold text-white">Book a service</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 bg-secondary text-white p-5 rounded-md ${className}`}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <h4 className="text-white font-semibold text-lg">
          Reservar {service.service_title}
        </h4>
        <p className="text-white/80 text-sm">
          ${service.price}.00 – {service.description.substring(0, 100)}...
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor={`customerName-${service.id}`} className="block text-sm font-medium text-white/80">
          Nombre Completo
        </label>
        <input
          id={`customerName-${service.id}`}
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="w-full px-3 py-2 border border-white/30 rounded-sm bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-white/70"
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`customerEmail-${service.id}`} className="block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id={`customerEmail-${service.id}`}
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          className="w-full px-3 py-2 border border-white/30 rounded-sm bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder:text-white/70"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors bg-primary hover:bg-deep-blue text-white ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Procesando..." : `Pagar $${service.price}.00`}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-3 bg-white text-secondary font-semibold rounded-md transition-colors hover:bg-natural-gray"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default StripeServiceButton;
