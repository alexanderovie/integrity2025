import { getPricingServices } from "@/lib/services/pricing";
import PricingClient from "./PricingClient";

const PRICING_ICONS: Record<string, string> = {
  "regular-cleaning": "/images/home/Pricing/pricing-icon-1.svg",
  "deep-cleaning": "/images/home/Pricing/pricing-icon-2.svg",
  "move-in-out-cleaning": "/images/home/Pricing/pricing-icon-3.svg",
  "post-construction-cleaning": "/images/home/Pricing/pricing-icon-4.svg",
};

const FALLBACK_ICON = "/images/home/Pricing/pricing-icon-1.svg";

const FALLBACK_DESCRIPTION = "Professional cleaning tailored to your home and schedule.";


const Pricing = async () => {
  const services = await getPricingServices();

  const items = services.map((service) => ({
    id: service.id,
    slug: service.slug,
    title: service.nombre,
    description: service.descripcion || FALLBACK_DESCRIPTION,
    price: (service.precio_base / 100).toFixed(0),
    icon: PRICING_ICONS[service.slug] || FALLBACK_ICON,
  }));

  return <PricingClient items={items} />;
};

export default Pricing;
