"use client";
import { parseName, sendContactToHubSpot } from "@/lib/hubspot/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FormComponent from "./FormComponent";
import { getQuoteUrl, resolveServiceSlugSync } from "@/lib/urls/quote-client";

function HeroSection() {
  const [submitted, setSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    email: "",
    services: [] as string[],
    zip: "",
  });

  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Patrón enterprise React 19: manejar estado visual directamente en handlers
  // "You Might Not Need an Effect" - estado derivado y cleanup en handlers
  useEffect(() => {
    // Cleanup: limpiar timeout si el componente se desmonta o submitted cambia
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [submitted]);

  // Función helper para manejar el estado de "gracias"
  const showThanksMessage = () => {
    setShowThanks(true);
    // Limpiar timeout previo si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Ocultar después de 10 segundos
    timeoutRef.current = setTimeout(() => {
      setShowThanks(false);
      timeoutRef.current = null;
    }, 10000);
  };

  const reset = () => {
    setFormData({
      name: "",
      number: "",
      email: "",
      services: [],
      zip: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Intentar guardar en HubSpot con timeout de 2 segundos (patrón PRG mejorado)
    if (formData.email) {
      const { firstname, lastname } = parseName(formData.name);
      const savePromise = sendContactToHubSpot({
        email: formData.email,
        firstname,
        lastname,
        phone: formData.number,
        zip: formData.zip,
      });

      // Timeout de 2 segundos para no bloquear al usuario
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );

      try {
        await Promise.race([savePromise, timeoutPromise]);
        console.log("✅ Contacto guardado en HubSpot antes de redirigir");
      } catch (error) {
        // No bloquear si falla o se excede el timeout
        // El guardado puede continuar en background si no se completó
        console.warn("⚠️ Guardado en HubSpot no completado antes de redirigir:", error);
        // Continuar con el flujo aunque haya fallado
      }
    }

    // Preparar parámetros para redirección
    const params = new URLSearchParams();
    if (formData.name) params.set("name", formData.name);
    if (formData.email) params.set("email", formData.email);
    if (formData.number) params.set("phone", formData.number);
    if (formData.zip) params.set("zipCode", formData.zip);
    if (formData.services.length > 0) {
      params.set("services", formData.services.join(","));
    }

    reset();
    setIsLoading(false);
    setSubmitted(true);
    // Mostrar mensaje de gracias inmediatamente (patrón event-driven)
    showThanksMessage();
    // Use friendly URL structure: /quote/[service]
    const serviceSlugRaw = formData.services.length > 0 ? formData.services[0] : "regular-cleaning";
    const serviceSlug = resolveServiceSlugSync(serviceSlugRaw) || "regular-cleaning";
    const quoteUrl = getQuoteUrl(serviceSlug, {
      name: formData.name || undefined,
      email: formData.email || undefined,
      phone: formData.number || undefined,
      zipCode: formData.zip || undefined,
    });
    router.push(quoteUrl);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevData) => {
      if (checked) {
        return { ...prevData, services: [...prevData.services, name] };
      } else {
        return { ...prevData, services: prevData.services.filter((service) => service !== name) };
      }
    });
  };

  const paragraphText = " Integrity Clean Solutions delivers eco-friendly cleaning across Orlando, keeping homes and workplaces fresh, healthy, and ready for every day. ";


  return (
    <section>
      <div className="relative pt-24 lg:pt-32 overflow-hidden">
        <div className="relative h-full flex justify-center items-center bg-secondary bg-[linear-gradient(0deg,rgba(15,23,26,0.55)_0%,rgba(15,23,26,0.55)_100%),url('/images/services/professional-commercial-cleaning.webp')] lg:bg-[linear-gradient(0deg,rgba(15,23,26,0.7)_0%,rgba(15,23,26,0.35)_45%,rgba(15,23,26,0)_100%),url('/images/services/professional-commercial-cleaning.webp')] bg-cover bg-no-repeat bg-center">
          <div className="container">
            <div ref={ref} className="flex flex-col lg:flex-row gap-10 xl:gap-20 2xl:gap-32 py-20 items-center lg:items-end justify-between">
              <div className="flex flex-col gap-6  w-full">
                <div className="flex flex-col gap-3">
                  <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                    <p className="font-semibold text-white">Integrity Cleaning</p>
                  </div>
                  <h1 className="text-white text-3xl md:text-4xl">Professional Cleaning Services Orlando | Integrity Clean</h1>
                </div>
                <p className="text-white text-lg sm:text-xl">{paragraphText.trim()}</p>
              </div>

              <div className="relative bg-white dark:bg-dark-gray rounded-md max-w-530px lg:max-w-md xl:max-w-530px w-full p-10 flex flex-col gap-8 shadow-soft-primary lg:shadow-none">
                <h2 className="text-xl md:text-2xl font-semibold dark:text-white">Get a free quote</h2>
                <FormComponent
                  formData={formData}
                  isLoading={isLoading}
                  onChange={handleChange}
                  onServiceChange={handleServiceChange}
                  onSubmit={handleSubmit}
                />

                {submitted && showThanks &&
                  <div className="flex gap-1.5 items-center absolute -bottom-9 left-0">
                    <p className="text-primary">Thank you for reaching out!</p>
                    <Image src="/images/home/banner/smile-emoji.svg" alt="image" width={20} height={20} />
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <Image
          src="/images/aboutus/about-ellipse-img.svg"
          alt="Decorative shape"
          width={316}
          height={316}
          className="absolute right-0 bottom-0 w-60 h-60 translate-x-1/4 translate-y-1/4 lg:hidden"
          priority
        />
      </div>
    </section>
  );
}

export default HeroSection;
