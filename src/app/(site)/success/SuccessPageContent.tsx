'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SuccessPageContentInner = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // Patrón enterprise: estado derivado en lugar de setState en effect
  // React 19 best practice: derivar estado directamente, no usar effects innecesarios
  const hasSessionId = Boolean(sessionId);

  if (!hasSessionId) {
    return (
      <div className="min-h-screen bg-offwhite-warm dark:bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-secondary/70 dark:text-white/70">Verificando su pago...</p>
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
                <span>Nuestro equipo se pondrá en contacto con usted en las próximas 24 horas.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Recibirá un email de confirmación con todos los detalles del servicio.</span>
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
            <p className="text-sm text-secondary/70 dark:text-white/60 mb-2">¿Tiene alguna pregunta?</p>
            <p className="text-sm text-secondary/80 dark:text-white/70">
              Contáctenos en{" "}
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
