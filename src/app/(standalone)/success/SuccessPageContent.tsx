'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentStatus = "loading" | "verified" | "failed" | "error";

const SuccessPageContentInner = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<PaymentStatus>("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/api/checkout-session/${sessionId}`);

        if (!response.ok) {
          setStatus("failed");
          return;
        }

        const data = await response.json();

        if (data.status === "paid") {
          setStatus("verified");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-offwhite-warm dark:bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-secondary/70 dark:text-white/70">Verificando su pago...</p>
        </div>
      </div>
    );
  }

  if (status === "error" || status === "failed") {
    return (
      <div className="min-h-screen bg-offwhite-warm dark:bg-dark-gray flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-secondary shadow-xl rounded-lg p-8 md:p-12 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">No se pudo verificar el pago</h1>
            <p className="text-lg text-secondary/80 dark:text-white/70 mb-8">
              No pudimos verificar el estado de su pago. Por favor contactenos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="inline-block bg-primary hover:bg-deep-blue text-white font-semibold py-3 px-6 rounded-md transition-colors"
              >
                Volver a intentar
              </Link>
              <Link
                href="/"
                className="inline-block bg-secondary hover:bg-deep-blue text-white font-semibold py-3 px-6 rounded-md transition-colors"
              >
                Ir al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite-warm dark:bg-dark-gray flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-secondary shadow-xl rounded-lg p-8 md:p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Payment Confirmed Successfully | Thank You For Booking</h1>
          <p className="text-lg text-secondary/80 dark:text-white/70 mb-8">
            Gracias por confiar en Integrity Clean Solutions
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-sm text-secondary/70 dark:text-white/60 mb-2">ID de Transacción</p>
            <p className="text-sm font-mono text-secondary dark:text-white break-all">
              {sessionId || "N/A"}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-3">¿Qué sigue?</h2>
            <ul className="space-y-2 text-secondary/80 dark:text-white/70">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Hemos recibido su pago exitosamente.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Nuestro equipo se pondra en contacto con usted en las proximas 24 horas.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Recibira un email de confirmacion con todos los detalles del servicio.</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-secondary hover:bg-deep-blue text-white font-semibold py-3 px-6 rounded-md transition-colors"
            >
              Volver al Inicio
            </Link>
            <Link
              href="/quote"
              className="inline-block bg-primary hover:bg-deep-blue text-white font-semibold py-3 px-6 rounded-md transition-colors"
            >
              Solicitar Otro Servicio
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-secondary/70 dark:text-white/60 mb-2">Tiene alguna pregunta?</p>
            <p className="text-sm text-secondary/80 dark:text-white/70">
              Contactenos en{" "}
              <a href="mailto:info@integritycleansolutions.com" className="text-primary hover:underline">
                info@integritycleansolutions.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessPageContent = (): React.ReactElement => {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading payment details...</div>}>
      <SuccessPageContentInner />
    </Suspense>
  );
};

export default SuccessPageContent;
